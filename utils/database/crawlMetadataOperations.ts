import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import yaml from 'js-yaml';

interface CrawlData {
  crawls: Array<{
    id: string;
    name: string;
    description: string;
    assetFolder: string;
    duration: string;
    difficulty: string;
    distance: string;
    'public-crawl': boolean;
    start_time?: string;
  }>;
}

/**
 * Loads crawl data from YAML files and creates a mapping of crawl IDs to names
 * @returns Promise<{ [crawlId: string]: string }> - Object mapping crawl IDs to names
 */
export const getCrawlNameMapping = async (): Promise<{ [crawlId: string]: string }> => {
  const mapping: { [crawlId: string]: string } = {};
  
  try {
    // Load crawl library data
    const crawlLibraryAsset = Asset.fromModule(require('../../assets/crawl-library/crawls.yml'));
    await crawlLibraryAsset.downloadAsync();
    const crawlLibraryString = await FileSystem.readAsStringAsync(crawlLibraryAsset.localUri || crawlLibraryAsset.uri);
    const crawlLibraryData = yaml.load(crawlLibraryString) as CrawlData;
    
    // Add crawl library mappings
    if (crawlLibraryData.crawls) {
      crawlLibraryData.crawls.forEach(crawl => {
        mapping[crawl.id] = crawl.name;
      });
    }
    
    // Load public crawls data
    const publicCrawlsAsset = Asset.fromModule(require('../../assets/public-crawls/crawls.yml'));
    await publicCrawlsAsset.downloadAsync();
    const publicCrawlsString = await FileSystem.readAsStringAsync(publicCrawlsAsset.localUri || publicCrawlsAsset.uri);
    const publicCrawlsData = yaml.load(publicCrawlsString) as CrawlData;
    
    // Add public crawls mappings
    if (publicCrawlsData.crawls) {
      publicCrawlsData.crawls.forEach(crawl => {
        mapping[crawl.id] = crawl.name;
      });
    }
    
    console.log('Loaded crawl name mapping:', mapping);
    return mapping;
  } catch (error) {
    console.error('Error loading crawl name mapping:', error);
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
    // Load crawl library data
    const crawlLibraryAsset = Asset.fromModule(require('../../assets/crawl-library/crawls.yml'));
    await crawlLibraryAsset.downloadAsync();
    const crawlLibraryString = await FileSystem.readAsStringAsync(crawlLibraryAsset.localUri || crawlLibraryAsset.uri);
    const crawlLibraryData = yaml.load(crawlLibraryString) as CrawlData;
    
    // Check crawl library
    if (crawlLibraryData.crawls) {
      const crawl = crawlLibraryData.crawls.find(c => c.id === crawlId);
      if (crawl) {
        return crawl.assetFolder;
      }
    }
    
    // Load public crawls data
    const publicCrawlsAsset = Asset.fromModule(require('../../assets/public-crawls/crawls.yml'));
    await publicCrawlsAsset.downloadAsync();
    const publicCrawlsString = await FileSystem.readAsStringAsync(publicCrawlsAsset.localUri || publicCrawlsAsset.uri);
    const publicCrawlsData = yaml.load(publicCrawlsString) as CrawlData;
    
    // Check public crawls
    if (publicCrawlsData.crawls) {
      const crawl = publicCrawlsData.crawls.find(c => c.id === crawlId);
      if (crawl) {
        return crawl.assetFolder;
      }
    }
    
    console.warn('Crawl asset folder not found for ID:', crawlId);
    return null;
  } catch (error) {
    console.error('Error getting crawl asset folder:', error);
    return null;
  }
}; 