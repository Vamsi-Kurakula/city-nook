import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Crawl, CrawlProgress, UserStopProgress } from '../../types/crawl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteCrawlProgress, getCurrentCrawlProgress, saveCrawlProgress, addCrawlHistory, getCrawlNameMapping } from '../../utils/database';

interface CrawlContextType {
  currentCrawl: Crawl | null;
  setCurrentCrawl: (crawl: Crawl | null) => void;
  isCrawlActive: boolean;
  setIsCrawlActive: (active: boolean) => void;
  startCrawlWithNavigation: (crawl: Crawl, onComplete: () => void) => void;
  
  // Progress tracking
  currentProgress: CrawlProgress | null;
  setCurrentProgress: (progress: CrawlProgress | null) => void;
  completeStop: (stopNumber: number, userAnswer?: string, userId?: string) => Promise<void>;
  nextStop: (userId?: string) => Promise<void>;
  getCurrentStop: () => number;
  loadProgressFromDatabase: (userId: string, crawlId?: string, isPublic?: boolean) => Promise<boolean>;
  
  // Crawl history
  crawlHistory: CrawlProgress[];
  addToHistory: (progress: CrawlProgress) => void;
  loadHistory: () => void;
  
  // Single crawl enforcement
  hasCrawlInProgress: () => boolean;
  getCurrentCrawlName: () => string | null;
  checkDatabaseForActiveCrawl: (userId: string) => Promise<{ hasActive: boolean; crawlName?: string }>;
  endCurrentCrawlAndStartNew: (newCrawl: Crawl, onComplete: () => void, userId?: string) => void;
  
  clearCrawlSession: () => Promise<void>;
  saveAndClearCrawlSession: () => Promise<void>;
}

const CrawlContext = createContext<CrawlContextType | undefined>(undefined);

export const useCrawlContext = () => {
  const context = useContext(CrawlContext);
  if (context === undefined) {
    throw new Error('useCrawlContext must be used within a CrawlProvider');
  }
  return context;
};

interface CrawlProviderProps {
  children: ReactNode;
}

export const CrawlProvider: React.FC<CrawlProviderProps> = ({ children }) => {
  const [currentCrawl, setCurrentCrawl] = useState<Crawl | null>(null);
  const [isCrawlActive, setIsCrawlActive] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<CrawlProgress | null>(null);
  const [crawlHistory, setCrawlHistory] = useState<CrawlProgress[]>([]);

  useEffect(() => {
    // Load persisted session
    const loadSession = async () => {
      try {
        const crawlStr = await AsyncStorage.getItem('currentCrawl');
        const progressStr = await AsyncStorage.getItem('currentProgress');
        if (crawlStr) setCurrentCrawl(JSON.parse(crawlStr));
        if (progressStr) setCurrentProgress(JSON.parse(progressStr));
      } catch (e) { console.warn('Failed to load crawl session', e); }
    };
    loadSession();
  }, []);

  useEffect(() => {
    // Persist session
    const saveSession = async () => {
      try {
        if (currentCrawl) await AsyncStorage.setItem('currentCrawl', JSON.stringify(currentCrawl));
        else await AsyncStorage.removeItem('currentCrawl');
        if (currentProgress) await AsyncStorage.setItem('currentProgress', JSON.stringify(currentProgress));
        else await AsyncStorage.removeItem('currentProgress');
      } catch (e) { console.warn('Failed to save crawl session', e); }
    };
    saveSession();
  }, [currentCrawl, currentProgress]);

  const clearCrawlSession = async () => {
    setCurrentCrawl(null);
    setCurrentProgress(null);
    setIsCrawlActive(false);
    await AsyncStorage.removeItem('currentCrawl');
    await AsyncStorage.removeItem('currentProgress');
  };

  const startCrawlWithNavigation = (crawl: Crawl, onComplete: () => void) => {
    setCurrentCrawl(crawl);
    setIsCrawlActive(true);
    
    // Initialize progress
    const newProgress: CrawlProgress = {
      crawl_id: crawl.id,
      is_public: crawl['public-crawl'] || false,
      current_stop: 1,
      completed_stops: [],
      started_at: new Date(),
      last_updated: new Date(),
      completed: false,
    };
    setCurrentProgress(newProgress);
    
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      onComplete();
    }, 50);
  };

  const completeStop = async (stopNumber: number, userAnswer?: string, userId?: string) => {
    if (!currentProgress) return;
    
    const updatedProgress = { ...currentProgress };
    const existingStopIndex = updatedProgress.completed_stops.findIndex(
      stop => stop.stop_number === stopNumber
    );
    
    const completedStop: UserStopProgress = {
      stop_number: stopNumber,
      completed: true,
      user_answer: userAnswer,
      completed_at: new Date(),
    };
    
    if (existingStopIndex >= 0) {
      updatedProgress.completed_stops[existingStopIndex] = completedStop;
    } else {
      updatedProgress.completed_stops.push(completedStop);
    }
    
    updatedProgress.last_updated = new Date();
    setCurrentProgress(updatedProgress);
    
    // Save to database if userId is provided
    if (userId) {
      const completedStopNumbers = updatedProgress.completed_stops.map(s => s.stop_number);
      await saveCrawlProgress({
        userId,
        crawlId: updatedProgress.crawl_id,
        isPublic: updatedProgress.is_public,
        currentStop: updatedProgress.current_stop,
        completedStops: completedStopNumbers,
        startedAt: new Date(updatedProgress.started_at).toISOString(),
        completedAt: updatedProgress.completed ? new Date().toISOString() : undefined,
      });
    }
  };

  const nextStop = async (userId?: string) => {
    if (!currentProgress || !currentCrawl) return;
    
    const updatedProgress = { ...currentProgress };
    updatedProgress.current_stop += 1;
    updatedProgress.last_updated = new Date();
    
    console.log('nextStop - current_stop:', updatedProgress.current_stop, 'total stops:', currentCrawl.stops?.length, 'completed:', updatedProgress.completed);
    
    // Check if crawl is completed
    if (updatedProgress.current_stop > (currentCrawl.stops?.length || 0)) {
      console.log('Crawl completion detected! Setting completed to true');
      updatedProgress.completed = true;
      updatedProgress.current_stop = currentCrawl.stops?.length || 0; // Keep at last stop
      addToHistory(updatedProgress);
    }
    
    setCurrentProgress(updatedProgress);
    
    // Save to database if userId is provided
    if (userId) {
      const completedStopNumbers = updatedProgress.completed_stops.map(s => s.stop_number);
      await saveCrawlProgress({
        userId,
        crawlId: updatedProgress.crawl_id,
        isPublic: updatedProgress.is_public,
        currentStop: updatedProgress.current_stop,
        completedStops: completedStopNumbers,
        startedAt: new Date(updatedProgress.started_at).toISOString(),
        completedAt: updatedProgress.completed ? new Date().toISOString() : undefined,
      });
    }
  };

  const getCurrentStop = (): number => {
    return currentProgress?.current_stop || 1;
  };

  const loadProgressFromDatabase = async (userId: string, crawlId?: string, isPublic?: boolean): Promise<boolean> => {
    try {
      const dbProgress = await getCurrentCrawlProgress(userId);
      if (dbProgress) {
        // If specific parameters are provided, check if they match
        if (crawlId && dbProgress.crawl_id !== crawlId) {
          console.log('Found progress for different crawl:', dbProgress.crawl_id, 'but requested:', crawlId);
          return false;
        }
        
        if (isPublic !== undefined && dbProgress.is_public !== isPublic) {
          console.log('Found progress for different crawl type:', dbProgress.is_public, 'but requested:', isPublic);
          return false;
        }
        
        // Convert database format to local format
        const localProgress: CrawlProgress = {
          crawl_id: dbProgress.crawl_id,
          is_public: dbProgress.is_public,
          current_stop: dbProgress.current_stop,
          completed_stops: dbProgress.completed_stops.map((stopNum: number) => ({
            stop_number: stopNum,
            completed: true,
            user_answer: '',
            completed_at: new Date(),
          })),
          started_at: new Date(dbProgress.started_at),
          last_updated: new Date(dbProgress.updated_at),
          completed: !!dbProgress.completed_at,
        };
        
        setCurrentProgress(localProgress);
        setIsCrawlActive(true);
        console.log('Loaded progress from database:', localProgress);
        return true;
      } else {
        // No progress in database, but don't clear current crawl if we're starting a new one
        if (!currentCrawl) {
          setCurrentProgress(null);
          setIsCrawlActive(false);
          setCurrentCrawl(null);
        }
        console.log('No progress found in database');
        return false;
      }
    } catch (error) {
      console.error('Error loading progress from database:', error);
      // Only clear state on actual errors, not when no progress exists
      if (error && typeof error === 'object' && 'code' in error && error.code !== 'PGRST116') {
        setCurrentProgress(null);
        setIsCrawlActive(false);
        setCurrentCrawl(null);
      }
      return false;
    }
  };

  const addToHistory = (progress: CrawlProgress) => {
    setCrawlHistory(prev => {
      const existingIndex = prev.findIndex(p => p.crawl_id === progress.crawl_id && p.is_public === progress.is_public);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = progress;
        return updated;
      }
      return [...prev, progress];
    });
  };

  const loadHistory = () => {
    // Load from AsyncStorage or other persistence
    // For now, we'll just use in-memory storage
  };

  // Single crawl enforcement functions
  const hasCrawlInProgress = (): boolean => {
    // Check both local state and database for any active crawl
    return isCrawlActive && currentCrawl !== null;
  };

  const getCurrentCrawlName = (): string | null => {
    return currentCrawl?.name || null;
  };

  // Check if there's any crawl in progress in the database
  const checkDatabaseForActiveCrawl = async (userId: string): Promise<{ hasActive: boolean; crawlName?: string }> => {
    try {
      const dbProgress = await getCurrentCrawlProgress(userId);
      if (dbProgress && !dbProgress.completed_at) {
        // We found active progress, now get the crawl name
        const crawlNameMapping = await getCrawlNameMapping();
        const crawlName = crawlNameMapping[dbProgress.crawl_id] || 'Current Crawl';
        return { hasActive: true, crawlName };
      }
      return { hasActive: false };
    } catch (error) {
      console.error('Error checking database for active crawl:', error);
      return { hasActive: false };
    }
  };

  const endCurrentCrawlAndStartNew = (newCrawl: Crawl, onComplete: () => void, userId?: string) => {
    // Mark current crawl as "did not finish" and add to history
    if (currentProgress && currentCrawl) {
      const unfinishedProgress = {
        ...currentProgress,
        completed: false,
        last_updated: new Date(),
      };
      addToHistory(unfinishedProgress);
      
      // Delete the old progress record from database if we have user ID
      if (userId) {
        deleteCrawlProgress({
          userId,
        }).then(() => {
          console.log('Old crawl progress deleted from database');
        }).catch((error) => {
          console.error('Error deleting old crawl progress:', error);
        });
      }
    }

    // Start the new crawl
    setCurrentCrawl(newCrawl);
    setIsCrawlActive(true);
    
    // Initialize progress for new crawl
    const newProgress: CrawlProgress = {
      crawl_id: newCrawl.id,
      is_public: newCrawl['public-crawl'] || false,
      current_stop: 1,
      completed_stops: [],
      started_at: new Date(),
      last_updated: new Date(),
      completed: false,
    };
    setCurrentProgress(newProgress);
    
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      onComplete();
    }, 50);
  };

  const saveAndClearCrawlSession = async () => {
    // Save current progress to history before clearing
    if (currentProgress && currentCrawl) {
      const progressToSave = {
        ...currentProgress,
        last_updated: new Date(),
      };
      addToHistory(progressToSave);
    }
    
    await clearCrawlSession();
  };

  return (
    <CrawlContext.Provider value={{
      currentCrawl,
      setCurrentCrawl,
      isCrawlActive,
      setIsCrawlActive,
      startCrawlWithNavigation,
      currentProgress,
      setCurrentProgress,
      completeStop,
      nextStop,
      getCurrentStop,
      loadProgressFromDatabase,
      crawlHistory,
      addToHistory,
      loadHistory,
      hasCrawlInProgress,
      getCurrentCrawlName,
      checkDatabaseForActiveCrawl,
      endCurrentCrawlAndStartNew,
      clearCrawlSession,
      saveAndClearCrawlSession,
    }}>
      {children}
    </CrawlContext.Provider>
  );
}; 