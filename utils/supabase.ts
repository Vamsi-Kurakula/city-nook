import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import yaml from 'js-yaml';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database types for TypeScript
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CrawlProgress {
  id: string;
  user_id: string;
  crawl_id: string;
  current_stop: number;
  completed_stops: number[];
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCrawlHistory {
  id: string;
  user_id: string;
  crawl_id: string;
  completed_at: string;
  total_time_minutes: number;
  score?: number;
  created_at: string;
}

/**
 * Upsert crawl progress for a user
 */
export async function saveCrawlProgress({ userId, crawlId, currentStop, completedStops, startedAt, completedAt }: {
  userId: string;
  crawlId: string;
  currentStop: number;
  completedStops: number[];
  startedAt: string;
  completedAt?: string;
}) {
  return supabase.from('crawl_progress').upsert([
    {
      user_id: userId,
      crawl_id: crawlId,
      current_stop: currentStop,
      completed_stops: completedStops,
      started_at: startedAt,
      completed_at: completedAt || null,
    }
  ], { onConflict: 'user_id,crawl_id' });
}

/**
 * Add a crawl completion record to user_crawl_history
 */
export async function addCrawlHistory({ userId, crawlId, completedAt, totalTimeMinutes, score }: {
  userId: string;
  crawlId: string;
  completedAt: string;
  totalTimeMinutes: number;
  score?: number;
}) {
  return supabase.from('user_crawl_history').insert([
    {
      user_id: userId,
      crawl_id: crawlId,
      completed_at: completedAt,
      total_time_minutes: totalTimeMinutes,
      score: score || null,
    }
  ]);
}

/**
 * Get crawl statistics for a user
 */
export async function getCrawlStats(userId: string) {
  // Get completed crawls from history
  const { data: completedCrawls, error: historyError } = await supabase
    .from('user_crawl_history')
    .select('crawl_id')
    .eq('user_id', userId);

  if (historyError) {
    console.error('Error fetching crawl history:', historyError);
    return null;
  }

  // Get in-progress crawls from progress table
  const { data: inProgressCrawls, error: progressError } = await supabase
    .from('crawl_progress')
    .select('crawl_id, completed_at')
    .eq('user_id', userId)
    .is('completed_at', null);

  if (progressError) {
    console.error('Error fetching crawl progress:', progressError);
    return null;
  }

  // Calculate stats
  const totalCompleted = completedCrawls?.length || 0;
  const uniqueCompleted = new Set(completedCrawls?.map(c => c.crawl_id) || []).size;
  const inProgress = inProgressCrawls?.length || 0;

  return {
    totalCompleted,
    uniqueCompleted,
    inProgress,
  };
}

/**
 * Get crawl history for a user with crawl details
 */
export async function getCrawlHistory(userId: string) {
  const { data: history, error } = await supabase
    .from('user_crawl_history')
    .select(`
      id,
      crawl_id,
      completed_at,
      total_time_minutes,
      score,
      created_at
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching crawl history:', error);
    return null;
  }

  return history;
}

/**
 * Load all crawl data and create a mapping from crawl ID to crawl name
 */
export async function getCrawlNameMapping() {
  try {
    // Load crawl library data
    const crawlLibraryAsset = Asset.fromModule(require('../assets/crawl-library/crawls.yml'));
    await crawlLibraryAsset.downloadAsync();
    const crawlLibraryString = await FileSystem.readAsStringAsync(crawlLibraryAsset.localUri || crawlLibraryAsset.uri);
    const crawlLibraryData = yaml.load(crawlLibraryString) as any;

    // Load public crawls data
    const publicCrawlsAsset = Asset.fromModule(require('../assets/public-crawls/crawls.yml'));
    await publicCrawlsAsset.downloadAsync();
    const publicCrawlsString = await FileSystem.readAsStringAsync(publicCrawlsAsset.localUri || publicCrawlsAsset.uri);
    const publicCrawlsData = yaml.load(publicCrawlsString) as any;

    // Create mapping from crawl ID to crawl name
    const crawlNameMapping: { [crawlId: string]: string } = {};

    // Add crawl library crawls
    if (crawlLibraryData?.crawls) {
      crawlLibraryData.crawls.forEach((crawl: any) => {
        crawlNameMapping[crawl.id] = crawl.name;
      });
    }

    // Add public crawls
    if (publicCrawlsData?.crawls) {
      publicCrawlsData.crawls.forEach((crawl: any) => {
        crawlNameMapping[crawl.id] = crawl.name;
      });
    }

    return crawlNameMapping;
  } catch (error) {
    console.error('Error loading crawl name mapping:', error);
    return {};
  }
}

/**
 * Get the asset folder for a crawl ID
 */
export async function getCrawlAssetFolder(crawlId: string): Promise<string | null> {
  try {
    // Load crawl library data
    const crawlLibraryAsset = Asset.fromModule(require('../assets/crawl-library/crawls.yml'));
    await crawlLibraryAsset.downloadAsync();
    const crawlLibraryString = await FileSystem.readAsStringAsync(crawlLibraryAsset.localUri || crawlLibraryAsset.uri);
    const crawlLibraryData = yaml.load(crawlLibraryString) as any;

    // Load public crawls data
    const publicCrawlsAsset = Asset.fromModule(require('../assets/public-crawls/crawls.yml'));
    await publicCrawlsAsset.downloadAsync();
    const publicCrawlsString = await FileSystem.readAsStringAsync(publicCrawlsAsset.localUri || publicCrawlsAsset.uri);
    const publicCrawlsData = yaml.load(publicCrawlsString) as any;

    // Check crawl library first
    if (crawlLibraryData?.crawls) {
      const libraryCrawl = crawlLibraryData.crawls.find((crawl: any) => crawl.id === crawlId);
      if (libraryCrawl) {
        return libraryCrawl.assetFolder;
      }
    }

    // Check public crawls
    if (publicCrawlsData?.crawls) {
      const publicCrawl = publicCrawlsData.crawls.find((crawl: any) => crawl.id === crawlId);
      if (publicCrawl) {
        return publicCrawl.assetFolder;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting crawl asset folder:', error);
    return null;
  }
}

 