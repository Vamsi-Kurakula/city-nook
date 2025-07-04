import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import yaml from 'js-yaml';
import { Crawl } from '../types/crawl';
import { loadCrawlStops } from '../components/auto-generated/crawlAssetLoader';

interface CrawlData {
  crawls: Crawl[];
}

interface PublicCrawl {
  id: string;
  name: string;
  title?: string;
  description: string;
  start_time: string;
  hero_image: string;
  stops: any[];
  assetFolder: string;
  duration: string;
  distance: string;
  difficulty: string;
  'public-crawl'?: boolean;
}

export async function loadPublicCrawls(): Promise<PublicCrawl[]> {
  try {
    console.log('Loading public crawls...');
    // Load main crawls list
    const asset = Asset.fromModule(require('../assets/public-crawls/crawls.yml'));
    await asset.downloadAsync();
    const yamlString = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
    const data = yaml.load(yamlString) as CrawlData;
    
    if (data && Array.isArray(data.crawls)) {
      console.log(`Found ${data.crawls.length} crawls, loading stops...`);
      
      // Load stops for each crawl using the utility
      const crawlsWithStops = await Promise.all(
        data.crawls.map(async (crawl) => {
          try {
            console.log(`Loading stops for ${crawl.name} (${crawl.assetFolder})...`);
            const stopsData = await loadCrawlStops(crawl.assetFolder);
            return {
              ...crawl,
              stops: stopsData?.stops || [],
            };
          } catch (error) {
            console.warn(`Could not load stops for ${crawl.name}:`, error);
            return crawl;
          }
        })
      );
      console.log('All crawls loaded successfully:', crawlsWithStops.map(c => ({ name: c.name, stops: c.stops?.length || 0 })));
      
      // Filter to only show public crawls (public-crawl: true)
      const publicCrawls = crawlsWithStops.filter(crawl => crawl['public-crawl'] === true);
      console.log(`Filtered to ${publicCrawls.length} public crawls`);
      
      return publicCrawls as PublicCrawl[];
    } else {
      console.error('No crawls found in data');
      return [];
    }
  } catch (e) {
    console.error('Error loading crawls:', e);
    return [];
  }
} 