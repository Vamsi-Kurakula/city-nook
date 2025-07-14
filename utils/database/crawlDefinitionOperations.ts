import { supabase } from './client';

export interface CrawlDefinition {
  crawl_definition_id: string;
  name: string;
  description: string;
  asset_folder: string;
  duration: string;
  difficulty: string;
  distance: string;
  is_public: boolean;
  is_featured: boolean;
  start_time?: string;
  hero_image_url?: string;
  hero_image_path?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CrawlStop {
  crawl_stop_id: string;
  crawl_definition_id: string;
  stop_number: number;
  stop_type: string;
  location_name: string;
  location_link?: string;
  stop_components: Record<string, any>;
  reveal_after_minutes?: number;
  created_at: string;
}

// Get all crawl definitions
export async function getAllCrawlDefinitions(): Promise<CrawlDefinition[]> {
  const { data, error } = await supabase
    .from('crawl_definitions')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Get crawl definitions by type (public or library)
export async function getCrawlDefinitionsByType(isPublic: boolean): Promise<CrawlDefinition[]> {
  const { data, error } = await supabase
    .from('crawl_definitions')
    .select('*')
    .eq('is_public', isPublic)
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Get featured crawl definitions
export async function getFeaturedCrawlDefinitions(): Promise<CrawlDefinition[]> {
  const { data, error } = await supabase
    .from('crawl_definitions')
    .select('*')
    .eq('is_featured', true)
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Get public crawl definitions (for upcoming crawls)
export async function getPublicCrawlDefinitions(): Promise<CrawlDefinition[]> {
  const { data, error } = await supabase
    .from('crawl_definitions')
    .select('*')
    .eq('is_public', true)
    .order('start_time', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Get crawl definition by name
export async function getCrawlDefinitionByName(name: string): Promise<CrawlDefinition | null> {
  const { data, error } = await supabase
    .from('crawl_definitions')
    .select('*')
    .eq('name', name)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }
  return data;
}

// Get crawl definition by ID
export async function getCrawlDefinitionById(id: string): Promise<CrawlDefinition | null> {
  const { data, error } = await supabase
    .from('crawl_definitions')
    .select('*')
    .eq('crawl_definition_id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }
  return data;
}

// Get stops for a crawl definition
export async function getCrawlStops(crawlDefinitionId: string): Promise<CrawlStop[]> {
  const { data, error } = await supabase
    .from('crawl_stops')
    .select('*')
    .eq('crawl_definition_id', crawlDefinitionId)
    .order('stop_number');
  
  if (error) throw error;
  return data || [];
}

// Get complete crawl with stops by name
export async function getCrawlWithStopsByName(name: string): Promise<{
  definition: CrawlDefinition;
  stops: CrawlStop[];
} | null> {
  const definition = await getCrawlDefinitionByName(name);
  if (!definition) return null;
  
  const stops = await getCrawlStops(definition.crawl_definition_id);
  
  return { definition, stops };
}

// Get complete crawl with stops by ID
export async function getCrawlWithStopsById(id: string): Promise<{
  definition: CrawlDefinition;
  stops: CrawlStop[];
} | null> {
  const definition = await getCrawlDefinitionById(id);
  if (!definition) return null;
  
  const stops = await getCrawlStops(definition.crawl_definition_id);
  
  return { definition, stops };
}

// Search crawl definitions by name (case-insensitive)
export async function searchCrawlDefinitions(searchTerm: string): Promise<CrawlDefinition[]> {
  const { data, error } = await supabase
    .from('crawl_definitions')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Get crawl definitions created by a specific user
export async function getCrawlDefinitionsByCreator(creatorName: string): Promise<CrawlDefinition[]> {
  const { data, error } = await supabase
    .from('crawl_definitions')
    .select('*')
    .eq('created_by', creatorName)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Get recent crawl definitions (ordered by creation date)
export async function getRecentCrawlDefinitions(limit: number = 10): Promise<CrawlDefinition[]> {
  const { data, error } = await supabase
    .from('crawl_definitions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
} 