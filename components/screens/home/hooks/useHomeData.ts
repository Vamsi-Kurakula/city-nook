import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import yaml from 'js-yaml';
import { supabase } from '../../../../utils/database';
import { loadPublicCrawls } from '../../../../utils/publicCrawlLoader';
import { loadFeaturedCrawls, FeaturedCrawl } from '../../../../utils/featuredCrawlLoader';
import { loadCrawlStops } from '../../../auto-generated/crawlAssetLoader';
import { Crawl } from '../../../../types/crawl';

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

export function useHomeData(userId: string | undefined, isLoading: boolean) {
  const [featuredCrawls, setFeaturedCrawls] = useState<FeaturedCrawl[]>([]);
  const [fullFeaturedCrawls, setFullFeaturedCrawls] = useState<Crawl[]>([]);
  const [upcomingCrawls, setUpcomingCrawls] = useState<PublicCrawl[]>([]);
  const [userSignups, setUserSignups] = useState<string[]>([]);
  const [currentCrawl, setCurrentCrawl] = useState<CrawlProgress | null>(null);
  const [currentCrawlDetails, setCurrentCrawlDetails] = useState<any>(null);
  const [inProgressCrawls, setInProgressCrawls] = useState<CrawlProgress[]>([]);
  const [allLibraryCrawls, setAllLibraryCrawls] = useState<Crawl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useHomeData useEffect triggered:', { userId, isLoading });
    if (!isLoading) {
      loadHomeData();
    }
  }, [userId, isLoading]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Home screen focused, refreshing data');
      if (!isLoading && userId) {
        loadHomeData();
      }
    }, [userId, isLoading])
  );

  const loadHomeData = async () => {
    try {
      console.log('loadHomeData called');
      setLoading(true);
      
      // Load featured crawls
      const featured = await loadFeaturedCrawls();
      setFeaturedCrawls(featured);

      // Load full crawl data for featured crawls
      const fullFeaturedData = await Promise.all(
        featured.map(async (featuredCrawl) => {
          try {
            // Load the main crawls data
            const asset = Asset.fromModule(require('../../../../assets/crawl-library/crawls.yml'));
            await asset.downloadAsync();
            const yamlString = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
            const data = yaml.load(yamlString) as any;
            
            // Find the full crawl data
            const crawl = data.crawls.find((c: any) => c.id === featuredCrawl.id);
            if (crawl) {
              // Load stops for the crawl
              const stopsData = await loadCrawlStops(crawl.assetFolder);
              return {
                ...crawl,
                stops: stopsData?.stops || [],
              };
            }
            return null;
          } catch (error) {
            console.error('Error loading full crawl data for featured crawl:', error);
            return null;
          }
        })
      );
      
      const validFullFeaturedCrawls = fullFeaturedData.filter(crawl => crawl !== null) as Crawl[];
      setFullFeaturedCrawls(validFullFeaturedCrawls);

      // Load upcoming public crawls and user signups
      if (userId) {
        console.log('Loading data for user:', userId);
        const [crawls, signups] = await Promise.all([
          loadPublicCrawls(),
          loadUserSignups()
        ]);

        // Filter upcoming crawls (not completed)
        const now = new Date();
        const upcoming = crawls.filter((crawl: any) => {
          const startTime = new Date(crawl.start_time);
          const totalDuration = crawl.stops.reduce((total: number, stop: any) => total + (stop.reveal_after_minutes || 0), 0);
          const endTime = new Date(startTime.getTime() + totalDuration * 60 * 1000);
          return endTime > now;
        });

        // Sort by user signups first, then by start time
        const sortedCrawls = upcoming.sort((a: any, b: any) => {
          const aSignedUp = signups.includes(a.id);
          const bSignedUp = signups.includes(b.id);
          
          if (aSignedUp && !bSignedUp) return -1;
          if (!aSignedUp && bSignedUp) return 1;
          
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
        });

        setUpcomingCrawls(sortedCrawls);
        setUserSignups(signups);
      }

      // Load current crawl progress
      await loadCurrentCrawl();
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSignups = async (): Promise<string[]> => {
    if (!userId) return [];
    
    try {
      const { data, error } = await supabase
        .from('public_crawl_signups')
        .select('crawl_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data?.map(row => row.crawl_id) || [];
    } catch (error) {
      console.error('Error loading user signups:', error);
      return [];
    }
  };

  const loadCrawlDetailsById = async (crawlId: string, isPublic: boolean): Promise<any> => {
    try {
      if (isPublic) {
        // Load from public crawls
        const publicCrawls = await loadPublicCrawls();
        return publicCrawls.find((crawl: any) => crawl.id === crawlId);
      } else {
        // Load from library crawls
        const asset = Asset.fromModule(require('../../../../assets/crawl-library/crawls.yml'));
        await asset.downloadAsync();
        const yamlString = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
        const data = yaml.load(yamlString) as any;
        const crawl = data.crawls.find((c: any) => c.id === crawlId);
        
        if (crawl) {
          // Load stops for the crawl
          const stopsData = await loadCrawlStops(crawl.assetFolder);
          return {
            ...crawl,
            stops: stopsData?.stops || [],
          };
        }
        return null;
      }
    } catch (error) {
      console.error('Error loading crawl details by ID:', error);
      return null;
    }
  };

  const loadCurrentCrawl = async () => {
    if (!userId) return;

    try {
      console.log('Loading current crawl for user:', userId);
      
      // Get the user's current crawl progress (only 1 record per user now)
      const { data: progress, error } = await supabase
        .from('crawl_progress')
        .select('*')
        .eq('user_id', userId)
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
        console.log('No active progress found in DB for user:', userId);
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

  return {
    featuredCrawls,
    fullFeaturedCrawls,
    upcomingCrawls,
    userSignups,
    currentCrawl,
    currentCrawlDetails,
    inProgressCrawls,
    allLibraryCrawls,
    loading,
    loadHomeData,
  };
} 