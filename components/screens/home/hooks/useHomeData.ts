import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthContext } from '../../../context/AuthContext';
import { getFeaturedCrawlDefinitions } from '../../../../utils/database/crawlDefinitionOperations';
import { CrawlDefinition } from '../../../../types/crawl';
import { supabase } from '../../../../utils/database/client';

interface PublicCrawl {
  id: string;
  name: string;
  title?: string;
  description: string;
  start_time: string;
  hero_image: string;
  stops: any[];
  assetFolder: string;
}

interface CrawlProgress {
  crawlId: string;
  currentStep: number;
  completedSteps: number[];
  startTime: string;
  isPublicCrawl: boolean;
}

export function useHomeData() {
  const { user, isLoading: authLoading } = useAuthContext();
  const [featuredCrawls, setFeaturedCrawls] = useState<CrawlDefinition[]>([]);
  const [upcomingCrawls, setUpcomingCrawls] = useState<PublicCrawl[]>([]);
  const [userSignups, setUserSignups] = useState<string[]>([]);
  const [currentCrawl, setCurrentCrawl] = useState<CrawlProgress | null>(null);
  const [currentCrawlDetails, setCurrentCrawlDetails] = useState<any>(null);
  const [inProgressCrawls, setInProgressCrawls] = useState<CrawlProgress[]>([]);
  const [allLibraryCrawls, setAllLibraryCrawls] = useState<CrawlDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useHomeData useEffect triggered:', { userId: user?.id, authLoading });
    if (!authLoading) {
      loadHomeData();
    }
  }, [user?.id, authLoading]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Home screen focused, refreshing data');
      if (!authLoading && user?.id) {
        loadHomeData();
      }
    }, [user?.id, authLoading])
  );

  const loadHomeData = async () => {
    try {
      console.log('loadHomeData called');
      setLoading(true);
      setError(null);
      
      // Load featured crawls from database with stops
      const featuredDefinitions = await getFeaturedCrawlDefinitions();
      
      // Load stops for each featured crawl
      const { getCrawlStops } = await import('../../../../utils/database/crawlDefinitionOperations');
      const featuredWithStops = await Promise.all(
        featuredDefinitions.map(async (crawlDef) => {
          try {
            const stops = await getCrawlStops(crawlDef.crawl_definition_id);
            return {
              ...crawlDef,
              stops: stops
            };
          } catch (error) {
            console.warn(`Could not load stops for ${crawlDef.name}:`, error);
            return {
              ...crawlDef,
              stops: []
            };
          }
        })
      );
      
      setFeaturedCrawls(featuredWithStops);

      // Load user signups (keeping for future use)
      if (user?.id) {
        console.log('Loading data for user:', user.id);
        const signups = await loadUserSignups();
        setUserSignups(signups);
        setUpcomingCrawls([]); // No public crawls for now
      }

      // Load current crawl progress
      await loadCurrentCrawl();
    } catch (error) {
      console.error('Error loading home data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadUserSignups = async (): Promise<string[]> => {
    if (!user?.id) return [];
    
    try {
      const { data, error } = await supabase
        .from('public_crawl_signups')
        .select('crawl_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data?.map(row => row.crawl_id) || [];
    } catch (error) {
      console.error('Error loading user signups:', error);
      return [];
    }
  };

  const loadCrawlDetailsById = async (crawlId: string, isPublic: boolean): Promise<any> => {
    try {
      // Load complete crawl with stops from database
      const { getCrawlWithStopsById } = await import('../../../../utils/database/crawlDefinitionOperations');
      const crawlData = await getCrawlWithStopsById(crawlId);
      
      if (crawlData) {
        return {
          ...crawlData.definition,
          stops: crawlData.stops
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error loading crawl details by ID:', error);
      return null;
    }
  };

  const loadCurrentCrawl = async () => {
    if (!user?.id) return;

    try {
      console.log('Loading current crawl for user:', user.id);
      
      // Get the user's current crawl progress (only 1 record per user now)
      const { data: progress, error } = await supabase
        .from('crawl_progress')
        .select('*')
        .eq('user_id', user.id)
        .is('completed_at', null)
        .maybeSingle(); // Use maybeSingle to avoid errors when no record exists

      console.log('Current progress from DB:', progress, 'Error:', error);

      if (progress && !error) {
        console.log('Found active progress in DB:', {
          crawlId: progress.crawl_id,
          currentStop: progress.current_stop,
          isPublic: progress.is_public,
          startedAt: progress.started_at,
          completedStops: progress.completed_stops
        });
        
        // Load the full crawl details
        const crawlDetails = await loadCrawlDetailsById(progress.crawl_id, progress.is_public);
        
        if (crawlDetails) {
          // Create crawl progress object with full details
          const crawlProgress: CrawlProgress = {
            crawlId: progress.crawl_id,
            currentStep: progress.current_stop,
            completedSteps: progress.completed_stops || [],
            startTime: progress.started_at,
            isPublicCrawl: progress.is_public,
          };

          console.log('Setting currentCrawl to:', crawlProgress);
          setCurrentCrawl(crawlProgress);
          setCurrentCrawlDetails(crawlDetails); // Store full details
          setInProgressCrawls([crawlProgress]);
        } else {
          console.log('Crawl details not found for crawl ID:', progress.crawl_id);
          setCurrentCrawl(null);
          setCurrentCrawlDetails(null);
          setInProgressCrawls([]);
        }
      } else {
        console.log('No active progress found in DB for user:', user.id);
        setCurrentCrawl(null);
        setCurrentCrawlDetails(null);
        setInProgressCrawls([]);
      }
    } catch (error) {
      console.error('Error loading current crawl:', error);
      setCurrentCrawl(null);
      setCurrentCrawlDetails(null);
      setInProgressCrawls([]);
    }
  };

  const refreshData = () => {
    loadHomeData();
  };

  return {
    featuredCrawls,
    upcomingCrawls,
    userSignups,
    currentCrawl,
    currentCrawlDetails,
    inProgressCrawls,
    allLibraryCrawls,
    loading,
    error,
    refreshData,
    loadHomeData,
  };
} 