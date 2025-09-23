import { supabase } from '../config/supabase';
import { CrawlDefinition } from '../types/crawl';

/**
 * Fetches all featured crawls from the database
 * @returns Promise<CrawlDefinition[]> - Array of featured crawl definitions
 */
export async function getFeaturedCrawls(): Promise<CrawlDefinition[]> {
  try {
    const { data, error } = await supabase
      .from('crawl_definitions')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured crawls:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch featured crawls:', error);
    throw error;
  }
}

/**
 * Fetches a specific crawl definition by ID
 * @param crawlId - The crawl definition ID
 * @returns Promise<CrawlDefinition | null> - The crawl definition or null if not found
 */
export async function getCrawlById(crawlId: string): Promise<CrawlDefinition | null> {
  try {
    const { data, error } = await supabase
      .from('crawl_definitions')
      .select('*')
      .eq('crawl_definition_id', crawlId)
      .single();

    if (error) {
      console.error('Error fetching crawl:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch crawl:', error);
    return null;
  }
}

/**
 * Gets the number of stops for a specific crawl
 * @param crawlId - The crawl definition ID
 * @returns Promise<number> - The number of stops
 */
export async function getCrawlStopCount(crawlId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('crawl_stops')
      .select('*', { count: 'exact', head: true })
      .eq('crawl_definition_id', crawlId);

    if (error) {
      console.error('Error fetching crawl stop count:', error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Failed to fetch crawl stop count:', error);
    return 0;
  }
}
