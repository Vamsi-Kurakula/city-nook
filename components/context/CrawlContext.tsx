import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Crawl, CrawlProgress, UserStopProgress } from '../../types/crawl';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CrawlContextType {
  currentCrawl: Crawl | null;
  setCurrentCrawl: (crawl: Crawl | null) => void;
  isCrawlActive: boolean;
  setIsCrawlActive: (active: boolean) => void;
  startCrawlWithNavigation: (crawl: Crawl, onComplete: () => void) => void;
  
  // Progress tracking
  currentProgress: CrawlProgress | null;
  setCurrentProgress: (progress: CrawlProgress | null) => void;
  completeStop: (stopNumber: number, userAnswer?: string) => void;
  nextStop: () => void;
  getCurrentStop: () => number;
  
  // Crawl history
  crawlHistory: CrawlProgress[];
  addToHistory: (progress: CrawlProgress) => void;
  loadHistory: () => void;
  
  // Single crawl enforcement
  hasCrawlInProgress: () => boolean;
  getCurrentCrawlName: () => string | null;
  endCurrentCrawlAndStartNew: (newCrawl: Crawl, onComplete: () => void) => void;
  
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

  const completeStop = (stopNumber: number, userAnswer?: string) => {
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
  };

  const nextStop = () => {
    if (!currentProgress || !currentCrawl) return;
    
    const updatedProgress = { ...currentProgress };
    updatedProgress.current_stop += 1;
    updatedProgress.last_updated = new Date();
    
    // Check if crawl is completed
    if (updatedProgress.current_stop > (currentCrawl.stops?.length || 0)) {
      updatedProgress.completed = true;
      updatedProgress.current_stop = currentCrawl.stops?.length || 0; // Keep at last stop
      addToHistory(updatedProgress);
    }
    
    setCurrentProgress(updatedProgress);
  };

  const getCurrentStop = (): number => {
    return currentProgress?.current_stop || 1;
  };

  const addToHistory = (progress: CrawlProgress) => {
    setCrawlHistory(prev => {
      const existingIndex = prev.findIndex(p => p.crawl_id === progress.crawl_id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = progress;
        return updated;
      }
      return [...prev, progress];
    });
  };

  const loadHistory = () => {
    // TODO: Load from AsyncStorage or other persistence
    // For now, we'll just use in-memory storage
  };

  // Single crawl enforcement functions
  const hasCrawlInProgress = (): boolean => {
    return isCrawlActive && currentCrawl !== null;
  };

  const getCurrentCrawlName = (): string | null => {
    return currentCrawl?.name || null;
  };

  const endCurrentCrawlAndStartNew = (newCrawl: Crawl, onComplete: () => void) => {
    // Mark current crawl as "did not finish" and add to history
    if (currentProgress && currentCrawl) {
      const unfinishedProgress = {
        ...currentProgress,
        completed: false,
        last_updated: new Date(),
      };
      addToHistory(unfinishedProgress);
    }

    // Start the new crawl
    setCurrentCrawl(newCrawl);
    setIsCrawlActive(true);
    
    // Initialize progress for new crawl
    const newProgress: CrawlProgress = {
      crawl_id: newCrawl.id,
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
      crawlHistory,
      addToHistory,
      loadHistory,
      hasCrawlInProgress,
      getCurrentCrawlName,
      endCurrentCrawlAndStartNew,
      clearCrawlSession,
      saveAndClearCrawlSession,
    }}>
      {children}
    </CrawlContext.Provider>
  );
}; 