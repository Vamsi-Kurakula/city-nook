import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Crawl {
  id: string;
  name: string;
  description: string;
  assetFolder: string;
  duration: string;
  difficulty: string;
  distance: string;
}

interface CrawlContextType {
  currentCrawl: Crawl | null;
  setCurrentCrawl: (crawl: Crawl | null) => void;
  isCrawlActive: boolean;
  setIsCrawlActive: (active: boolean) => void;
  startCrawlWithNavigation: (crawl: Crawl, onComplete: () => void) => void;
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

  const startCrawlWithNavigation = (crawl: Crawl, onComplete: () => void) => {
    setCurrentCrawl(crawl);
    setIsCrawlActive(true);
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      onComplete();
    }, 50);
  };

  return (
    <CrawlContext.Provider value={{
      currentCrawl,
      setCurrentCrawl,
      isCrawlActive,
      setIsCrawlActive,
      startCrawlWithNavigation,
    }}>
      {children}
    </CrawlContext.Provider>
  );
}; 