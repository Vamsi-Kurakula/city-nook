export interface StopComponent {
  [key: string]: string;
}

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

export interface Crawl {
  id: string;
  name: string;
  description: string;
  assetFolder: string;
  duration: string;
  difficulty: string;
  distance: string;
  'public-crawl': boolean;
  start_time?: string; // Format: "YYYY-MM-DD HH:MM" or "HH:MM" for today
  stops?: CrawlStop[];
}

export interface CrawlSessionScreenParams {
  crawl: Crawl;
} 