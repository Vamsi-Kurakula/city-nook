/**
 * Validates and formats image URLs for production builds
 * Ensures HTTPS is used and URLs are properly formatted
 */

export const validateImageUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') {
    console.log('❌ Invalid URL provided:', url);
    return null;
  }

  try {
    // Remove any whitespace
    const cleanUrl = url.trim();
    
    // If it's already a valid URL, ensure it's HTTPS
    if (cleanUrl.startsWith('http://')) {
      console.log('⚠️ Converting HTTP to HTTPS:', cleanUrl);
      return cleanUrl.replace('http://', 'https://');
    }
    
    if (cleanUrl.startsWith('https://')) {
      // Validate the URL structure
      new URL(cleanUrl);
      return cleanUrl;
    }
    
    // If it's a relative path or local asset, return as is
    if (cleanUrl.startsWith('assets/') || cleanUrl.startsWith('./') || cleanUrl.startsWith('../')) {
      return cleanUrl;
    }
    
    // If it doesn't start with http/https, assume it's a local asset
    console.log('📁 Assuming local asset path:', cleanUrl);
    return cleanUrl;
    
  } catch (error) {
    console.error('❌ URL validation failed:', error, 'for URL:', url);
    return null;
  }
};

/**
 * Checks if a URL is a valid Supabase Storage URL
 */
export const isSupabaseStorageUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('supabase.co') || urlObj.hostname.includes('supabase.storage');
  } catch {
    return false;
  }
};

/**
 * Formats a Supabase Storage URL for production use
 */
export const formatSupabaseStorageUrl = (url: string): string => {
  if (!isSupabaseStorageUrl(url)) {
    return url;
  }
  
  // Ensure HTTPS
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  return url;
}; 