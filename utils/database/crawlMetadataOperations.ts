import { getAllCrawlDefinitions, CrawlDefinition } from './crawlDefinitionOperations';

/**
 * Loads crawl data from database and creates a mapping of crawl IDs to names
 * @returns Promise<{ [crawlId: string]: string }> - Object mapping crawl IDs to names
 */
export const getCrawlNameMapping = async (): Promise<{ [crawlId: string]: string }> => {
  const mapping: { [crawlId: string]: string } = {};
  
  try {
    // Get all crawl definitions from database
    const allCrawls = await getAllCrawlDefinitions();
    
    // Create mapping from crawl_definition_id to name
    allCrawls.forEach(crawl => {
      mapping[crawl.crawl_definition_id] = crawl.name;
    });
    
    console.log('Loaded crawl name mapping from database:', mapping);
    return mapping;
  } catch (error) {
    console.error('Error loading crawl name mapping from database:', error);
    return {};
  }
};

/**
 * Gets the asset folder for a specific crawl ID
 * @param crawlId - The crawl ID to look up
 * @returns Promise<string | null> - The asset folder path or null if not found
 */
export const getCrawlAssetFolder = async (crawlId: string): Promise<string | null> => {
  try {
    // Get all crawl definitions from database
    const allCrawls = await getAllCrawlDefinitions();
    
    // Find the crawl by ID
    const crawl = allCrawls.find(c => c.crawl_definition_id === crawlId);
    
    if (crawl) {
      return crawl.asset_folder;
    }
    
    console.warn('Crawl asset folder not found for ID:', crawlId);
    return null;
  } catch (error) {
    console.error('Error getting crawl asset folder from database:', error);
    return null;
  }
}; 