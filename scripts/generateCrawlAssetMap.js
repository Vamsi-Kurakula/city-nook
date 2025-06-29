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

// Generate asset map entries for folders that have steps.yml
let assetMapEntries = '';

// Process public crawls
publicFolders.forEach(folder => {
  const stepsPath = path.join(publicCrawlsDir, folder, 'steps.yml');
  if (fs.existsSync(stepsPath)) {
    assetMapEntries += `  'public-crawls/${folder}': require('../../assets/public-crawls/${folder}/steps.yml'),\n`;
  }
});

// Process library crawls
libraryFolders.forEach(folder => {
  const stepsPath = path.join(crawlLibraryDir, folder, 'steps.yml');
  if (fs.existsSync(stepsPath)) {
    assetMapEntries += `  'crawl-library/${folder}': require('../../assets/crawl-library/${folder}/steps.yml'),\n`;
  }
});

const fileContent = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Run 'npm run generate-crawl-assets' to regenerate this file.

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import yaml from 'js-yaml';
import { CrawlSteps } from '../types/crawl';

// This object maps crawl folder names to their corresponding steps.yml assets
// Auto-generated from crawl folders in assets/public-crawls/ and assets/crawl-library/
const STEPS_ASSET_MAP: { [key: string]: any } = {
${assetMapEntries}};

/**
 * Loads steps data for a specific crawl folder
 * @param assetFolder - The folder name from crawls.yml
 * @returns Promise<CrawlSteps | null>
 */
export const loadCrawlSteps = async (assetFolder: string): Promise<CrawlSteps | null> => {
  try {
    const stepsAssetModule = STEPS_ASSET_MAP[assetFolder];
    if (!stepsAssetModule) {
      console.warn(\`No steps asset found for crawl folder: \${assetFolder}\`);
      return null;
    }

    const stepsAsset = Asset.fromModule(stepsAssetModule);
    await stepsAsset.downloadAsync();
    const stepsString = await FileSystem.readAsStringAsync(stepsAsset.localUri || stepsAsset.uri);
    const stepsData = yaml.load(stepsString) as CrawlSteps;
    
    console.log(\`✓ Loaded \${stepsData.steps?.length || 0} steps for \${assetFolder}\`);
    return stepsData;
  } catch (error) {
    console.error(\`Error loading steps for \${assetFolder}:\`, error);
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
`;

fs.writeFileSync(outputFile, fileContent);
console.log('crawlAssetLoader.ts generated successfully!');
console.log(`Found ${publicFolders.length} public crawl folders, ${libraryFolders.length} library crawl folders`);
console.log(`${assetMapEntries.split('\n').filter(line => line.includes(':')).length} total folders with steps.yml files`); 