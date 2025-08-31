import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useCrawlContext } from '../../../context/CrawlContext';
import { useAuthContext } from '../../../context/AuthContext';
import { Crawl, CrawlProgress } from '../../../../types/crawl';
import { getCrawlProgress } from '../../../../utils/database/progressOperations';

interface CrawlSessionState {
  isLoading: boolean;
  error: string | null;
  currentStop: number;
  completedStops: number[];
  totalStops: number;
  progressPercent: number;
}

interface CrawlSessionActions {
  exitSession: () => void;
  refreshProgress: () => Promise<void>;
}

export const useCrawlSession = (
  crawl: Crawl | undefined,
  onExit: () => void
): { session: CrawlSessionState; actions: CrawlSessionActions } => {
  const { getToken } = useAuth();
  const { user } = useAuthContext();
  const {
    currentCrawl,
    setCurrentCrawl,
    isCrawlActive,
    setIsCrawlActive,
    currentProgress,
    setCurrentProgress,
  } = useCrawlContext();

  const [sessionState, setSessionState] = useState<CrawlSessionState>({
    isLoading: true,
    error: null,
    currentStop: 1,
    completedStops: [],
    totalStops: crawl?.stops?.length || 0,
    progressPercent: 0,
  });

  // Initialize crawl session
  useEffect(() => {
    const initializeSession = async () => {
      if (!crawl) {
        setSessionState(prev => ({ ...prev, error: 'No crawl data provided', isLoading: false }));
        return;
      }

      try {
        // Set crawl in context if not already set
        if (!isCrawlActive || !currentCrawl || currentCrawl.id !== crawl.id) {
          setCurrentCrawl(crawl);
          setIsCrawlActive(true);
        }

        // Load progress from database
        const progress = await loadProgressFromDatabase(crawl);
        setCurrentProgress(progress);

        // Update session state
        const completedStops = progress.completed_stops?.map(stop => stop.stop_number) || [];
        const currentStop = progress.current_stop || 1;
        const totalStops = crawl.stops?.length || 0;
        const progressPercent = totalStops > 0 ? Math.round((completedStops.length / totalStops) * 100) : 0;

        setSessionState({
          isLoading: false,
          error: null,
          currentStop,
          completedStops,
          totalStops,
          progressPercent,
        });
      } catch (error) {
        setSessionState(prev => ({
          ...prev,
          error: `Failed to initialize session: ${error instanceof Error ? error.message : 'Unknown error'}`,
          isLoading: false,
        }));
      }
    };

    initializeSession();
  }, [crawl?.id]);

  // Load progress from database
  const loadProgressFromDatabase = async (crawl: Crawl): Promise<CrawlProgress> => {
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        throw new Error('No authentication token available');
      }

      const isPublic = crawl['public-crawl'] || false;
      const progressFound = await getCrawlProgress(user.id, crawl.id, isPublic, token);

      if (progressFound?.data && !progressFound.error) {
        // Convert database format to local format
        return {
          crawl_id: progressFound.data.crawl_id,
          is_public: progressFound.data.is_public,
          current_stop: progressFound.data.current_stop,
          completed_stops: progressFound.data.completed_stops.map((stopNum: number) => ({
            stop_number: stopNum,
            completed: true,
            user_answer: '',
            completed_at: new Date(),
          })),
          started_at: new Date(progressFound.data.started_at),
          last_updated: new Date(progressFound.data.updated_at),
          completed: !!progressFound.data.completed_at,
        };
      }
    } catch (error) {
      console.warn('Failed to load progress from database:', error);
    }

    // Return default progress if database load fails
    return {
      crawl_id: crawl.id,
      is_public: crawl['public-crawl'] || false,
      current_stop: 1,
      completed_stops: [],
      started_at: new Date(),
      last_updated: new Date(),
      completed: false,
    };
  };

  // Refresh progress from database
  const refreshProgress = async () => {
    if (!crawl) return;
    
    try {
      setSessionState(prev => ({ ...prev, isLoading: true }));
      const progress = await loadProgressFromDatabase(crawl);
      setCurrentProgress(progress);

      const completedStops = progress.completed_stops?.map(stop => stop.stop_number) || [];
      const currentStop = progress.current_stop || 1;
      const totalStops = crawl.stops?.length || 0;
      const progressPercent = totalStops > 0 ? Math.round((completedStops.length / totalStops) * 100) : 0;

      setSessionState(prev => ({
        ...prev,
        isLoading: false,
        currentStop,
        completedStops,
        totalStops,
        progressPercent,
      }));
    } catch (error) {
      setSessionState(prev => ({
        ...prev,
        error: `Failed to refresh progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isLoading: false,
      }));
    }
  };

  const exitSession = () => {
    onExit();
  };

  return {
    session: sessionState,
    actions: {
      exitSession,
      refreshProgress,
    },
  };
};
