import { getCrawlDefinitionByName, CrawlDefinition } from './crawlDefinitionOperations';

/**
 * Simple URL fix for production HTTP 400 issues
 * This approach ensures proper formatting for Supabase Storage URLs
 */
export const fixImageUrlForProduction = (imageUrl: string): string => {
  try {
    if (!imageUrl || !imageUrl.includes('supabase.co/storage/v1/object/public/')) {
      return imageUrl;
    }

    // Ensure HTTPS
    if (imageUrl.startsWith('http://')) {
      imageUrl = imageUrl.replace('http://', 'https://');
    }

    // Add cache-busting parameter to avoid caching issues in production
    const separator = imageUrl.includes('?') ? '&' : '?';
    const urlWithCacheBust = `${imageUrl}${separator}t=${Date.now()}`;

    return urlWithCacheBust;
  } catch (error) {
    console.error('❌ Error fixing URL:', error);
    return imageUrl;
  }
};

/**
 * Gets an image URL with fallback strategies
 * 1. Fix URL for production compatibility
 * 2. Fall back to original URL if fixing fails
 * 3. Fall back to local asset if both fail
 */
export const getImageUrlWithFallback = async (imageUrl: string): Promise<string> => {
  try {
    if (!imageUrl) {
      return 'assets/icon.png';
    }

    // If it's not a Supabase Storage URL, return as-is
    if (!imageUrl.includes('supabase.co/storage/v1/object/public/')) {
      return imageUrl;
    }

    // Fix URL for production compatibility
    const fixedUrl = fixImageUrlForProduction(imageUrl);
    
    if (fixedUrl !== imageUrl) {
      return fixedUrl;
    }

    // Fall back to original URL
    return imageUrl;
  } catch (error) {
    console.error('❌ Error in getImageUrlWithFallback:', error);
    return 'assets/icon.png';
  }
};

/**
 * Gets the hero image source for a crawl from the database
 * @param crawlName - The crawl name to get the hero image for
 * @returns Promise<string> - The hero image URL or fallback
 */
export const getHeroImageSourceByName = async (crawlName: string): Promise<string> => {
  try {
    const crawlDefinition = await getCrawlDefinitionByName(crawlName);
    
    if (crawlDefinition?.hero_image_url) {
      return crawlDefinition.hero_image_url;
    }
    
    // Fallback to default image
    return 'assets/icon.png';
  } catch (error) {
    console.error('❌ Error getting hero image for ' + crawlName + ' from database:', error);
    // Fallback to default image
    return 'assets/icon.png';
  }
};

/**
 * Gets the hero image source for a crawl by asset folder (legacy compatibility)
 * @param assetFolder - The asset folder name (e.g., 'crawl-library/historic-downtown-crawl')
 * @returns any - The hero image source for React Native Image component
 */
export const getHeroImageSource = (assetFolder: string): any => {
  // This function is now deprecated and should be replaced with database-driven loading
  // For now, return a placeholder image to prevent bundling errors
  console.warn('getHeroImageSource is deprecated. Components should be updated to use database-driven image loading.');
  return require('../../assets/icon.png');
};

/**
 * Gets the hero image source for a crawl by asset folder (async version for database)
 * @param assetFolder - The asset folder name (e.g., 'crawl-library/historic-downtown-crawl')
 * @returns Promise<string> - The hero image URL or fallback
 */
export const getHeroImageSourceAsync = async (assetFolder: string): Promise<string> => {
  try {
    // Extract crawl name from asset folder
    // assetFolder format: 'crawl-library/historic-downtown-crawl' or 'public-crawls/foodie-adventure'
    const parts = assetFolder.split('/');
    if (parts.length < 2) {
      console.warn('Invalid asset folder format: ' + assetFolder);
      return 'assets/crawl-library/historic-downtown-crawl/hero.jpg';
    }

    // Convert folder name to crawl name (e.g., 'historic-downtown-crawl' -> 'Historic Downtown Crawl')
    const folderName = parts[parts.length - 1];
    const crawlName = folderName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return await getHeroImageSourceByName(crawlName);
  } catch (error) {
    console.error('Error getting hero image for asset folder ' + assetFolder + ' from database:', error);
    // Fallback to default image
    return 'assets/crawl-library/historic-downtown-crawl/hero.jpg';
  }
};

/**
 * Gets the hero image source for a crawl by crawl definition ID
 * @param crawlDefinitionId - The crawl definition ID
 * @returns Promise<string> - The hero image URL or fallback
 */
export const getHeroImageSourceById = async (crawlDefinitionId: string): Promise<string> => {
  try {
    const { getCrawlDefinitionById } = await import('./crawlDefinitionOperations');
    const crawlDefinition = await getCrawlDefinitionById(crawlDefinitionId);
    
    if (crawlDefinition?.hero_image_url) {
      return crawlDefinition.hero_image_url;
    }
    
    // Fallback to default image
    return 'assets/icon.png';
  } catch (error) {
    console.error('❌ Error getting hero image for ID ' + crawlDefinitionId + ' from database:', error);
    // Fallback to default image
    return 'assets/icon.png';
  }
}; 