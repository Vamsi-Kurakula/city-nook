export interface StepComponent {
  [key: string]: string;
}

export interface CrawlStep {
  step_number: number;
  step_type: 'riddle' | 'location' | 'photo' | 'button' | 'time';
  reward_location: string;
  step_components: StepComponent;
}

export interface CrawlSteps {
  steps: CrawlStep[];
}

export interface UserStepProgress {
  step_number: number;
  completed: boolean;
  user_answer?: string;
  completed_at?: Date;
}

export interface CrawlProgress {
  crawl_id: string;
  current_step: number;
  completed_steps: UserStepProgress[];
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
  steps?: CrawlStep[];
} 