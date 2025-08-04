/**
 * Simple network test utility to verify URL accessibility
 */

export const testImageUrl = async (url: string): Promise<boolean> => {
  try {
    // Test with HEAD request
    const headResponse = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'CityCrawler/1.0'
      }
    });
    
    // Test with GET request
    const getResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'CityCrawler/1.0'
      }
    });
    
    return headResponse.ok && getResponse.ok;
  } catch (error) {
    console.error('❌ URL test failed:', {
      url,
      error: error instanceof Error ? error.message : error,
      errorType: typeof error
    });
    return false;
  }
};

export const testSupabaseConnection = async (): Promise<void> => {
  // Test the base Supabase URL first
  const baseUrl = 'https://mrqyrxsmrffpaqgzudch.supabase.co';
  const testUrl = 'https://mrqyrxsmrffpaqgzudch.supabase.co/storage/v1/object/public/crawl-images/andersonville-brewery-crawl/hero.jpg';
  
  console.log('🔍 Testing Supabase Storage connection...');
  
  // Test base URL
  const baseAccessible = await testImageUrl(baseUrl);
  
  // Test specific image URL
  const imageAccessible = await testImageUrl(testUrl);
  
  if (baseAccessible) {
    console.log('✅ Supabase base URL is accessible');
  } else {
    console.log('❌ Supabase base URL is not accessible');
  }
  
  if (imageAccessible) {
    console.log('✅ Supabase Storage image is accessible');
  } else {
    console.log('❌ Supabase Storage image is not accessible - this is the issue!');
    console.log('💡 This suggests the image files may not exist or have incorrect paths');
  }
}; 