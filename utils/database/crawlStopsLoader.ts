import { getCrawlStops, getCrawlDefinitionByName, CrawlDefinition } from './crawlDefinitionOperations';
import { CrawlStops } from '../../types/crawl';

/**
 * Loads stops data for a specific crawl from the database
 * @param crawlName - The crawl name to load stops for
 * @returns Promise<CrawlStops | null>
 */
export const loadCrawlStopsByName = async (crawlName: string): Promise<CrawlStops | null> => {
  try {
    // Get the crawl definition by name
    const crawlDefinition = await getCrawlDefinitionByName(crawlName);
    if (!crawlDefinition) {
      console.warn('No crawl definition found for: ' + crawlName);
      return null;
    }

    // Get the stops for this crawl
    const stops = await getCrawlStops(crawlDefinition.crawl_definition_id);
    
    // Transform database stops to legacy CrawlStops format for backward compatibility
    const transformedStops = stops.map(stop => ({
      stop_number: stop.stop_number,
      stop_type: stop.stop_type,
      location_name: stop.location_name,
      location_link: stop.location_link,
      stop_components: stop.stop_components,
      reveal_after_minutes: stop.reveal_after_minutes
    }));

    const crawlStops: CrawlStops = {
      stops: transformedStops
    };

    console.log('Loaded ' + transformedStops.length + ' stops for ' + crawlName + ' from database');
    return crawlStops;
  } catch (error) {
    console.error('Error loading stops for ' + crawlName + ' from database:', error);
    return null;
  }
};

/**
 * Loads stops data for a specific crawl by asset folder (legacy compatibility)
 * @param assetFolder - The asset folder name (e.g., 'crawl-library/historic-downtown-crawl')
 * @returns Promise<CrawlStops | null>
 */
export const loadCrawlStops = async (assetFolder: string): Promise<CrawlStops | null> => {
  try {
    // Extract crawl name from asset folder
    // assetFolder format: 'crawl-library/historic-downtown-crawl' or 'public-crawls/foodie-adventure'
    const parts = assetFolder.split('/');
    if (parts.length < 2) {
      console.warn('Invalid asset folder format: ' + assetFolder);
      return null;
    }

    // Convert folder name to crawl name (e.g., 'historic-downtown-crawl' -> 'Historic Downtown Crawl')
    const folderName = parts[parts.length - 1];
    const crawlName = folderName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return await loadCrawlStopsByName(crawlName);
  } catch (error) {
    console.error('Error loading stops for asset folder ' + assetFolder + ' from database:', error);
    return null;
  }
};

/**
 * Gets the list of available crawl names from the database
 * @returns Promise<string[]> - Array of available crawl names
 */
export const getAvailableCrawlNames = async (): Promise<string[]> => {
  try {
    const { getAllCrawlDefinitions } = await import('./crawlDefinitionOperations');
    const allCrawls = await getAllCrawlDefinitions();
    return allCrawls.map(crawl => crawl.name);
  } catch (error) {
    console.error('Error getting available crawl names from database:', error);
    return [];
  }
};

/**
 * Checks if a crawl has stops data available in the database
 * @param crawlName - The crawl name to check
 * @returns Promise<boolean>
 */
export const hasCrawlStops = async (crawlName: string): Promise<boolean> => {
  try {
    const crawlDefinition = await getCrawlDefinitionByName(crawlName);
    if (!crawlDefinition) return false;
    
    const stops = await getCrawlStops(crawlDefinition.crawl_definition_id);
    return stops.length > 0;
  } catch (error) {
    console.error('Error checking if crawl has stops:', error);
    return false;
  }
}; 