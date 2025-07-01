export type RootTabParamList = {
  Home: undefined;
  'Public Crawls': undefined;
  'Crawl Library': undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  CrawlDetail: { crawlId: string } | { crawl: any };
  PublicCrawlDetail: { crawlId: string } | { crawl: any };
  CrawlSession: { crawl: any; resumeData?: any; resumeProgress?: any };
  PublicCrawlSession: { crawl: any; resumeData?: any; resumeProgress?: any };
  CrawlStats: undefined;
  CrawlHistory: undefined;
  CrawlHistoryDetail: { crawlId: string };
}; 