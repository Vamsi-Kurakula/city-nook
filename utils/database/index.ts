// Client
export { supabase } from './client';

// Types
export type { UserProfile, CrawlProgress, UserCrawlHistory } from './types';

// Progress Operations
export { saveCrawlProgress, getCurrentCrawlProgress, deleteCrawlProgress } from './progressOperations';

// History Operations
export { addCrawlHistory, getCrawlHistory } from './historyOperations';

// Stats Operations
export { getCrawlStats } from './statsOperations';

// Crawl Metadata Operations
export { getCrawlNameMapping, getCrawlAssetFolder } from './crawlMetadataOperations';

// Crawl Definition Operations
export {
  getAllCrawlDefinitions,
  getCrawlDefinitionsByType,
  getFeaturedCrawlDefinitions,
  getCrawlDefinitionByName,
  getCrawlDefinitionById,
  getCrawlStops,
  getCrawlWithStopsByName,
  getCrawlWithStopsById,
  searchCrawlDefinitions,
  getCrawlDefinitionsByCreator,
  getRecentCrawlDefinitions,
  type CrawlDefinition,
  type CrawlStop
} from './crawlDefinitionOperations';

// Crawl Stops Loader (replaces crawlAssetLoader)
export {
  loadCrawlStops,
  loadCrawlStopsByName,
  getAvailableCrawlNames,
  hasCrawlStops
} from './crawlStopsLoader';

// Image Loader (replaces ImageLoader)
export {
  getHeroImageSource,
  getHeroImageSourceAsync,
  getHeroImageSourceByName,
  getHeroImageSourceById
} from './imageLoader'; 