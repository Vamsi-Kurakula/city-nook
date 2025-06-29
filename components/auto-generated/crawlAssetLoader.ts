// AUTO-GENERATED FILE. DO NOT EDIT.
// Run 'npm run generate-crawl-assets' to regenerate this file.

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import yaml from 'js-yaml';
import { CrawlSteps } from '../types/crawl';

// This object maps crawl folder names to their corresponding steps.yml assets
// Auto-generated from crawl folders in assets/public-crawls/ and assets/crawl-library/
const STEPS_ASSET_MAP: { [key: string]: any } = {
  'public-crawls/foodie-adventure': require('../../assets/public-crawls/foodie-adventure/steps.yml'),
  'public-crawls/synchronized-crawl': require('../../assets/public-crawls/synchronized-crawl/steps.yml'),
  'public-crawls/taste-quest': require('../../assets/public-crawls/taste-quest/steps.yml'),
  'crawl-library/art-culture-walk': require('../../assets/crawl-library/art-culture-walk/steps.yml'),
  'crawl-library/default': require('../../assets/crawl-library/default/steps.yml'),
  'crawl-library/historic-downtown-crawl': require('../../assets/crawl-library/historic-downtown-crawl/steps.yml'),
  'crawl-library/simple-location-crawl': require('../../assets/crawl-library/simple-location-crawl/steps.yml'),
};

/**
 * Loads steps data for a specific crawl folder
 * @param assetFolder - The folder name from crawls.yml
 * @returns Promise<CrawlSteps | null>
 */
export const loadCrawlSteps = async (assetFolder: string): Promise<CrawlSteps | null> => {
  try {
    const stepsAssetModule = STEPS_ASSET_MAP[assetFolder];
    if (!stepsAssetModule) {
      console.warn(`No steps asset found for crawl folder: ${assetFolder}`);
      return null;
    }

    const stepsAsset = Asset.fromModule(stepsAssetModule);
    await stepsAsset.downloadAsync();
    const stepsString = await FileSystem.readAsStringAsync(stepsAsset.localUri || stepsAsset.uri);
    const stepsData = yaml.load(stepsString) as CrawlSteps;
    
    console.log(`✓ Loaded ${stepsData.steps?.length || 0} steps for ${assetFolder}`);
    return stepsData;
  } catch (error) {
    console.error(`Error loading steps for ${assetFolder}:`, error);
    return null;
  }
};

/**
 * Gets the list of available crawl folders
 * @returns string[] - Array of available crawl folder names
 */
export const getAvailableCrawlFolders = (): string[] => {
  return Object.keys(STEPS_ASSET_MAP);
};

/**
 * Checks if a crawl folder has steps data available
 * @param assetFolder - The folder name to check
 * @returns boolean
 */
export const hasCrawlSteps = (assetFolder: string): boolean => {
  return assetFolder in STEPS_ASSET_MAP;
};
