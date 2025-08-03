import { getFeaturedCrawlDefinitions, CrawlDefinition } from './database';

export interface FeaturedCrawl {
  id: string;
  title: string;
  description: string;
  hero_image: string;
}

export async function loadFeaturedCrawls(): Promise<FeaturedCrawl[]> {
  try {
    // Get featured crawls from database
    const featuredCrawls = await getFeaturedCrawlDefinitions();
    
    // Transform database data to FeaturedCrawl format
    const transformedCrawls = featuredCrawls.map(crawl => ({
      id: crawl.crawl_definition_id,
      title: crawl.name,
      description: crawl.description,
      hero_image: crawl.hero_image_url || 'assets/icon.png'
    }));

    return transformedCrawls;
  } catch (error) {
    console.error('Error loading featured crawls from database:', error);
    return [];
  }
} 