export interface StopComponent {
  [key: string]: string;
}

// Database CrawlStop interface (from crawlDefinitionOperations)
export interface DatabaseCrawlStop {
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

// Legacy CrawlStop interface (for backward compatibility)
export interface CrawlStop {
  stop_number: number;
  stop_type: string;
  location_name: string;
  location_link?: string;
  stop_components: any;
  reveal_after_minutes?: number;
}

export interface CrawlStops {
  stops: CrawlStop[];
}

export interface UserStopProgress {
  stop_number: number;
  completed: boolean;
  user_answer?: string;
  completed_at?: Date;
}

export interface CrawlProgress {
  crawl_id: string;
  is_public: boolean;
  current_stop: number;
  completed_stops: UserStopProgress[];
  started_at: Date;
  last_updated: Date;
  completed?: boolean;
}

// Database CrawlDefinition interface (from crawlDefinitionOperations)
export interface CrawlDefinition {
  crawl_definition_id: string;
  name: string;
  description: string;
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

// Legacy Crawl interface (for backward compatibility)
export interface Crawl {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  distance: string;
  'public-crawl': boolean;
  start_time?: string; // Format: "YYYY-MM-DD HH:MM" or "HH:MM" for today
  hero_image_url?: string;
  stops?: CrawlStop[];
}

export interface CrawlSessionScreenParams {
  crawl: CrawlDefinition;
} 