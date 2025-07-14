import { getFeaturedCrawlDefinitions, CrawlDefinition } from './database';

export interface FeaturedCrawl {
  id: string;
  title: string;
  description: string;
  hero_image: string;
  assetFolder: string;
}

export async function loadFeaturedCrawls(): Promise<FeaturedCrawl[]> {
  try {
    console.log('Loading featured crawls from database...');
    
    // Get featured crawls from database
    const featuredCrawls = await getFeaturedCrawlDefinitions();
    
    console.log(`Found ${featuredCrawls.length} featured crawls in database`);
    
    // Transform database data to FeaturedCrawl format
    const transformedCrawls = featuredCrawls.map(crawl => ({
      id: crawl.crawl_definition_id,
      title: crawl.name,
      description: crawl.description,
      hero_image: crawl.hero_image_url || `assets/crawl-library/${crawl.asset_folder}/hero.jpg`,
      assetFolder: crawl.asset_folder
    }));

    console.log('Featured crawls loaded:', transformedCrawls.length);
    return transformedCrawls;
  } catch (error) {
    console.error('Error loading featured crawls from database:', error);
    return [];
  }
} 