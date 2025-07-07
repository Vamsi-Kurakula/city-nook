// AUTO-GENERATED FILE. DO NOT EDIT.
// Run 'npm run generate-crawl-assets' to regenerate this file.

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import yaml from 'js-yaml';
import { CrawlStops } from '../types/crawl';

// This object maps crawl folder names to their corresponding stops.yml assets
// Auto-generated from crawl folders in assets/public-crawls/ and assets/crawl-library/
const STOPS_ASSET_MAP: { [key: string]: any } = {
  'public-crawls/foodie-adventure': require('../../assets/public-crawls/foodie-adventure/stops.yml'),
  'public-crawls/synchronized-crawl': require('../../assets/public-crawls/synchronized-crawl/stops.yml'),
  'public-crawls/taste-quest': require('../../assets/public-crawls/taste-quest/stops.yml'),
  'crawl-library/art-culture-walk': require('../../assets/crawl-library/art-culture-walk/stops.yml'),
  'crawl-library/historic-downtown-crawl': require('../../assets/crawl-library/historic-downtown-crawl/stops.yml'),
  'crawl-library/simple-location-crawl': require('../../assets/crawl-library/simple-location-crawl/stops.yml')
};

/**
 * Loads stops data for a specific crawl folder
 * @param assetFolder - The folder name from crawls.yml
 * @returns Promise<CrawlStops | null>
 */
export const loadCrawlStops = async (assetFolder: string): Promise<CrawlStops | null> => {
  try {
    const stopsAssetModule = STOPS_ASSET_MAP[assetFolder];
    if (!stopsAssetModule) {
      console.warn('No stops asset found for crawl folder: ' + assetFolder);
      return null;
    }
    const stopsAsset = Asset.fromModule(stopsAssetModule);
    await stopsAsset.downloadAsync();
    const stopsString = await FileSystem.readAsStringAsync(stopsAsset.localUri || stopsAsset.uri);
    const stopsData = yaml.load(stopsString) as CrawlStops;
    console.log('Loaded ' + ((stopsData.stops && stopsData.stops.length) || 0) + ' stops for ' + assetFolder);
    return stopsData;
  } catch (error) {
    console.error('Error loading stops for ' + assetFolder + ':', error);
    return null;
  }
};

/**
 * Gets the list of available crawl folders
 * @returns string[] - Array of available crawl folder names
 */
export const getAvailableCrawlFolders = (): string[] => {
  return Object.keys(STOPS_ASSET_MAP);
};

/**
 * Checks if a crawl folder has stops data available
 * @param assetFolder - The folder name to check
 * @returns boolean
 */
export const hasCrawlStops = (assetFolder: string): boolean => {
  return assetFolder in STOPS_ASSET_MAP;
};
