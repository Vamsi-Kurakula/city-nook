export type RootStackParamList = {
  Home: undefined;
  CrawlLibrary: undefined;
  UserProfile: undefined;
  CrawlDetail: { crawlId: string } | { crawl: any };
  PublicCrawlDetail: { crawlId: string } | { crawl: any };
  CrawlSession: { crawl: any; resumeData?: any; resumeProgress?: any };
  PublicCrawlSession: { crawl: any; resumeData?: any; resumeProgress?: any };
  PublicCrawls: undefined;
  CrawlStats: undefined;
  CrawlHistory: undefined;
  CrawlHistoryDetail: { crawlId: string };
}; 