export type RootStackParamList = {
  Home: undefined;
  CrawlLibrary: { minSteps?: number; maxDistanceMiles?: number } | undefined;
  UserProfile: undefined;
  CrawlDetail: { crawlId: string } | { crawl: any };
  PublicCrawlDetail: { crawlId: string } | { crawl: any };
  CrawlSession: { crawl: any; resumeData?: any; resumeProgress?: any };
  PublicCrawlSession: { crawl: any; resumeData?: any; resumeProgress?: any };
  PublicCrawls: undefined;
  CrawlStats: undefined;
  CrawlHistory: undefined;
  CrawlHistoryDetail: { crawlId: string };
  CrawlLibraryFilters: { minSteps: number; maxDistanceMiles: number } | undefined;
}; 