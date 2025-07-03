const fs = require('fs');
const path = require('path');

const publicCrawlsDir = path.join(__dirname, '../assets/public-crawls');
const crawlLibraryDir = path.join(__dirname, '../assets/crawl-library');
const outputFile = path.join(__dirname, '../components/auto-generated/crawlAssetLoader.ts');

// Function to get crawl folders from a directory
function getCrawlFolders(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs.readdirSync(dirPath).filter(f => {
    const fullPath = path.join(dirPath, f);
    return fs.statSync(fullPath).isDirectory();
  });
}

// Get folders from both directories
const publicFolders = getCrawlFolders(publicCrawlsDir);
const libraryFolders = getCrawlFolders(crawlLibraryDir);

// Generate asset map entries for folders that have stops.yml
let assetMapEntriesArr = [];

// Process public crawls
publicFolders.forEach(folder => {
  const stopsPath = path.join(publicCrawlsDir, folder, 'stops.yml');
  if (fs.existsSync(stopsPath)) {
    assetMapEntriesArr.push(`  'public-crawls/${folder}': require('../../assets/public-crawls/${folder}/stops.yml')`);
  }
});

// Process library crawls
libraryFolders.forEach(folder => {
  const stopsPath = path.join(crawlLibraryDir, folder, 'stops.yml');
  if (fs.existsSync(stopsPath)) {
    assetMapEntriesArr.push(`  'crawl-library/${folder}': require('../../assets/crawl-library/${folder}/stops.yml')`);
  }
});

const assetMapEntries = assetMapEntriesArr.join(',\n');

const fileContent = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Run 'npm run generate-crawl-assets' to regenerate this file.

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import yaml from 'js-yaml';
import { CrawlStops } from '../types/crawl';

// This object maps crawl folder names to their corresponding stops.yml assets
// Auto-generated from crawl folders in assets/public-crawls/ and assets/crawl-library/
const STOPS_ASSET_MAP: { [key: string]: any } = {
${assetMapEntries}
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
`;

fs.writeFileSync(outputFile, fileContent);
console.log('crawlAssetLoader.ts generated successfully!');
console.log(`Found ${publicFolders.length} public crawl folders, ${libraryFolders.length} library crawl folders`);
console.log(`${assetMapEntriesArr.length} total folders with stops.yml files`); 