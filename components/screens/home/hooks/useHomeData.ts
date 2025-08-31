import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../context/AuthContext';
import { useAuth } from '@clerk/clerk-expo';
import { getCurrentCrawlProgress } from '../../../../utils/database/progressOperations';
import { useFocusEffect } from '@react-navigation/native';

interface PublicCrawl {
  id: string;
  name: string;
  title?: string;
  description: string;
  duration?: string;
  difficulty?: string;
  distance?: string;
  is_public?: boolean;
  start_time: string;
  hero_image: string;
  hero_image_url?: string;
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
  const { user } = useAuthContext();
  const { getToken } = useAuth();
  const [featuredCrawls, setFeaturedCrawls] = useState<PublicCrawl[]>([]);
  const [upcomingCrawls, setUpcomingCrawls] = useState<PublicCrawl[]>([]);
  const [currentCrawl, setCurrentCrawl] = useState<CrawlProgress | null>(null);
  const [currentCrawlDetails, setCurrentCrawlDetails] = useState<any>(null);
  const [inProgressCrawls, setInProgressCrawls] = useState<CrawlProgress[]>([]);
  const [allLibraryCrawls, setAllLibraryCrawls] = useState<PublicCrawl[]>([]);
  const [userSignups, setUserSignups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data when user changes
  useEffect(() => {
    if (user?.id) {
      loadHomeData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  // Refresh data when screen comes into focus (fixes scroll lock issue)
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        console.log('HomeData: Screen focused - refreshing data');
        loadHomeData();
      }
    }, [user?.id])
  );

  const loadHomeData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load featured crawls
      const { getFeaturedCrawlDefinitions, getCrawlStops } = await import('../../../../utils/database/crawlDefinitionOperations');
      const featuredDefinitions = await getFeaturedCrawlDefinitions();
      
      // Load complete data for featured crawls including stops
      const featured = await Promise.all(
        featuredDefinitions.map(async (def) => {
          try {
            const stops = await getCrawlStops(def.crawl_definition_id);
            return {
              id: def.crawl_definition_id,
              name: def.name,
              title: def.name,
              description: def.description,
              duration: def.duration,
              difficulty: def.difficulty,
              distance: def.distance,
              is_public: def.is_public,
              start_time: def.start_time || '',
              hero_image: def.hero_image_url || '',
              hero_image_url: def.hero_image_url || '',
              assetFolder: '', // Default since asset_folder doesn't exist in schema
              stops: stops
            };
          } catch (error) {
            console.warn(`Could not load stops for featured crawl ${def.name}:`, error);
            return {
              id: def.crawl_definition_id,
              name: def.name,
              title: def.name,
              description: def.description,
              duration: def.duration,
              difficulty: def.difficulty,
              distance: def.distance,
              is_public: def.is_public,
              start_time: def.start_time || '',
              hero_image: def.hero_image_url || '',
              hero_image_url: def.hero_image_url || '',
              assetFolder: '', // Default since asset_folder doesn't exist in schema
              stops: []
            };
          }
        })
      );
      setFeaturedCrawls(featured);

      // Load upcoming crawls (public crawls with start times)
      const { getPublicCrawlDefinitions } = await import('../../../../utils/database/crawlDefinitionOperations');
      const upcomingDefinitions = await getPublicCrawlDefinitions();
      
      // Transform to PublicCrawl format
      const upcoming = upcomingDefinitions.map(def => ({
        id: def.crawl_definition_id,
        name: def.name,
        title: def.name,
        description: def.description,
        start_time: def.start_time || '',
        hero_image: def.hero_image_url || '',
        stops: [],
        assetFolder: ''
      }));
      setUpcomingCrawls(upcoming);

      // Load user signups
      const signups = await loadUserSignups();
      setUserSignups(signups);

      // Load current crawl progress
      await loadCurrentCrawl();

      // Load all library crawls
      const { getAllCrawlDefinitions } = await import('../../../../utils/database/crawlDefinitionOperations');
      const allDefinitions = await getAllCrawlDefinitions();
      
      // Transform to PublicCrawl format
      const allCrawls = allDefinitions.map(def => ({
        id: def.crawl_definition_id,
        name: def.name,
        title: def.name,
        description: def.description,
        start_time: def.start_time || '',
        hero_image: def.hero_image_url || '',
        stops: [],
        assetFolder: ''
      }));
      setAllLibraryCrawls(allCrawls);

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
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        console.log('No JWT token available for loading user signups');
        return [];
      }

      const { getSupabaseClient } = await import('../../../../utils/database/client');
      const supabase = getSupabaseClient(token);
      
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
      // Get JWT token for authenticated database access
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        console.log('No JWT token available for loading current crawl');
        setCurrentCrawl(null);
        setCurrentCrawlDetails(null);
        setInProgressCrawls([]);
        return;
      }
      
      // Use the authenticated getCurrentCrawlProgress function
      const result = await getCurrentCrawlProgress(user.id, token);

      if (result.data && !result.error) {
        const progress = result.data;
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