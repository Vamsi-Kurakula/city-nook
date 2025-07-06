import { useState, useEffect } from 'react';
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
  const [inProgressCrawls, setInProgressCrawls] = useState<CrawlProgress[]>([]);
  const [allLibraryCrawls, setAllLibraryCrawls] = useState<Crawl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useHomeData useEffect triggered:', { userId, isLoading });
    if (!isLoading) {
      loadHomeData();
    }
  }, [userId, isLoading]);

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
        .single();

      console.log('Current progress:', progress, 'Error:', error);

      if (progress) {
        // Load all crawl data to determine which are public crawls
        const [publicCrawls, libraryCrawls] = await Promise.all([
          loadPublicCrawls(),
          (async () => {
            try {
              const asset = Asset.fromModule(require('../../../../assets/crawl-library/crawls.yml'));
              await asset.downloadAsync();
              const yamlString = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
              const data = yaml.load(yamlString) as any;
              return data.crawls || [];
            } catch (error) {
              console.error('Error loading library crawls:', error);
              return [];
            }
          })()
        ]);

        // Find the crawl details
        const allCrawls = [...publicCrawls, ...libraryCrawls];
        const crawlDetails = allCrawls.find((crawl: any) => crawl.id === progress.crawl_id);

        if (crawlDetails) {
          const crawlProgress: CrawlProgress = {
            crawlId: progress.crawl_id,
            currentStep: progress.current_stop,
            completedSteps: progress.completed_stops || [],
            startTime: progress.started_at,
            isPublicCrawl: progress.is_public,
          };

          setCurrentCrawl(crawlProgress);
          setInProgressCrawls([crawlProgress]);
        }
      }
    } catch (error) {
      console.error('Error loading current crawl:', error);
    }
  };

  return {
    featuredCrawls,
    fullFeaturedCrawls,
    upcomingCrawls,
    userSignups,
    currentCrawl,
    inProgressCrawls,
    allLibraryCrawls,
    loading,
    loadHomeData,
  };
} 