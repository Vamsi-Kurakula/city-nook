import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Crawl, CrawlProgress, UserStepProgress } from '../types/crawl';

interface CrawlContextType {
  currentCrawl: Crawl | null;
  setCurrentCrawl: (crawl: Crawl | null) => void;
  isCrawlActive: boolean;
  setIsCrawlActive: (active: boolean) => void;
  startCrawlWithNavigation: (crawl: Crawl, onComplete: () => void) => void;
  
  // Progress tracking
  currentProgress: CrawlProgress | null;
  setCurrentProgress: (progress: CrawlProgress | null) => void;
  completeStep: (stepNumber: number, userAnswer?: string) => void;
  nextStep: () => void;
  getCurrentStep: () => number;
  
  // Crawl history
  crawlHistory: CrawlProgress[];
  addToHistory: (progress: CrawlProgress) => void;
  loadHistory: () => void;
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

  const startCrawlWithNavigation = (crawl: Crawl, onComplete: () => void) => {
    setCurrentCrawl(crawl);
    setIsCrawlActive(true);
    
    // Initialize progress
    const newProgress: CrawlProgress = {
      crawl_id: crawl.id,
      current_step: 1,
      completed_steps: [],
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

  const completeStep = (stepNumber: number, userAnswer?: string) => {
    if (!currentProgress) return;
    
    const updatedProgress = { ...currentProgress };
    const existingStepIndex = updatedProgress.completed_steps.findIndex(
      step => step.step_number === stepNumber
    );
    
    const completedStep: UserStepProgress = {
      step_number: stepNumber,
      completed: true,
      user_answer: userAnswer,
      completed_at: new Date(),
    };
    
    if (existingStepIndex >= 0) {
      updatedProgress.completed_steps[existingStepIndex] = completedStep;
    } else {
      updatedProgress.completed_steps.push(completedStep);
    }
    
    updatedProgress.last_updated = new Date();
    setCurrentProgress(updatedProgress);
  };

  const nextStep = () => {
    if (!currentProgress || !currentCrawl) return;
    
    const updatedProgress = { ...currentProgress };
    updatedProgress.current_step += 1;
    updatedProgress.last_updated = new Date();
    
    // Check if crawl is completed
    if (updatedProgress.current_step > (currentCrawl.steps?.length || 0)) {
      updatedProgress.completed = true;
      addToHistory(updatedProgress);
    }
    
    setCurrentProgress(updatedProgress);
  };

  const getCurrentStep = (): number => {
    return currentProgress?.current_step || 1;
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

  return (
    <CrawlContext.Provider value={{
      currentCrawl,
      setCurrentCrawl,
      isCrawlActive,
      setIsCrawlActive,
      startCrawlWithNavigation,
      currentProgress,
      setCurrentProgress,
      completeStep,
      nextStep,
      getCurrentStep,
      crawlHistory,
      addToHistory,
      loadHistory,
    }}>
      {children}
    </CrawlContext.Provider>
  );
}; 