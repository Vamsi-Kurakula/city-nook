export type RootStackParamList = {
  Home: undefined;
  CrawlLibrary: { minStops?: number; maxDistanceMiles?: number } | undefined;
  UserProfile: undefined;
  CrawlDetail: { crawlId: string } | { crawl: any };
  CrawlSession: { crawl?: any; resumeData?: any; resumeProgress?: any };
  CrawlStats: undefined;
  CrawlHistory: undefined;
  CrawlHistoryDetail: { crawlId: string };
  CrawlLibraryFilters: { minStops: number; maxDistanceMiles: number } | undefined;
  CrawlCompletion: { crawlName?: string; completionData?: any };

  CrawlRecs: { crawl?: any; stop?: any; stopNumber?: number };
  CrawlStartStop: { crawl?: any; stop?: any; stopNumber?: number };
  SocialTest: undefined; // For testing social features
}; 