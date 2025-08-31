import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useAuthContext } from '../../../context/AuthContext';
import { Crawl } from '../../../../types/crawl';
import { getCrawlProgress } from '../../../../utils/database/progressOperations';

export const useCrossPlatformProgress = (crawl: Crawl | undefined) => {
  const [currentStop, setCurrentStop] = useState(1);
  const [completedStops, setCompletedStops] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getToken } = useAuth();
  const { user } = useAuthContext();

  useEffect(() => {
    const loadProgress = async () => {
      if (!crawl || !user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log(`${Platform.OS}: Loading progress for crawl ${crawl.id}`);
        const token = await getToken({ template: 'supabase' });
        if (!token) {
          throw new Error('No authentication token available');
        }

        const isPublic = crawl['public-crawl'] || false;
        const progress = await getCrawlProgress(user.id, crawl.id, isPublic, token);

        if (progress?.data && !progress.error) {
          setCurrentStop(progress.data.current_stop || 1);
          setCompletedStops(progress.data.completed_stops || []);
          console.log(`${Platform.OS}: Progress loaded successfully`);
        }
      } catch (error) {
        console.error(`${Platform.OS}: Error loading progress:`, error);
        const errorMessage = Platform.select({
          ios: `iOS progress loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          android: `Android progress loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [crawl?.id, user?.id]);

  return { currentStop, completedStops, isLoading, error };
};
