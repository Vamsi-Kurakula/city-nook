import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import yaml from 'js-yaml';
import { Crawl } from '../types/crawl';

export interface FeaturedCrawl {
  id: string;
  title: string;
  description: string;
  hero_image: string;
  assetFolder: string;
}

export interface FeaturedCrawlsData {
  featured_crawls: string[];
}

interface CrawlData {
  crawls: Crawl[];
}

export async function loadFeaturedCrawls(): Promise<FeaturedCrawl[]> {
  try {
    console.log('Loading featured crawls...');
    
    // Load the featured crawls IDs
    const featuredCrawlsAsset = require('../assets/crawl-library/featured-crawls.yml');
    const featuredAsset = Asset.fromModule(featuredCrawlsAsset);
    await featuredAsset.downloadAsync();
    const featuredYamlString = await FileSystem.readAsStringAsync(featuredAsset.localUri || featuredAsset.uri);
    const featuredData = yaml.load(featuredYamlString) as FeaturedCrawlsData;
    
    console.log('Featured crawls data:', featuredData);
    
    if (!featuredData.featured_crawls || !Array.isArray(featuredData.featured_crawls)) {
      console.error('No featured crawls found');
      return [];
    }

    // Load the main crawls data
    const mainCrawlsAsset = Asset.fromModule(require('../assets/crawl-library/crawls.yml'));
    await mainCrawlsAsset.downloadAsync();
    const mainYamlString = await FileSystem.readAsStringAsync(mainCrawlsAsset.localUri || mainCrawlsAsset.uri);
    const mainData = yaml.load(mainYamlString) as CrawlData;
    
    console.log('Main crawls data loaded, found', mainData.crawls?.length || 0, 'crawls');
    
    if (!mainData.crawls || !Array.isArray(mainData.crawls)) {
      console.error('No crawls found in main data');
      return [];
    }

    // Filter and build featured crawls
    const featuredCrawls = featuredData.featured_crawls
      .map((crawlId) => {
        const crawl = mainData.crawls.find(c => c.id === crawlId);
        if (!crawl) {
          console.warn(`Featured crawl with ID ${crawlId} not found in main data`);
          return null;
        }

        return {
          id: crawl.id,
          title: crawl.name,
          description: crawl.description,
          hero_image: `assets/crawl-library/${crawl.id}/hero.jpg`,
          assetFolder: crawl.assetFolder
        };
      })
      .filter(crawl => crawl !== null) as FeaturedCrawl[];

    console.log('Featured crawls loaded:', featuredCrawls.length);
    return featuredCrawls;
  } catch (error) {
    console.error('Error loading featured crawls:', error);
    return [];
  }
} 