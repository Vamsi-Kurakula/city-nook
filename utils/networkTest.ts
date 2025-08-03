/**
 * Simple network test utility to verify URL accessibility
 */

export const testImageUrl = async (url: string): Promise<boolean> => {
  try {
    console.log('🔍 Testing image URL accessibility:', url);
    
    const response = await fetch(url, {
      method: 'HEAD', // Just check if the resource exists
      headers: {
        'User-Agent': 'CityCrawler/1.0'
      }
    });
    
    console.log('✅ URL test response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    return response.ok;
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
  const testUrl = 'https://mrqyrxsmrffpaqgzudch.supabase.co/storage/v1/object/public/crawl-images/andersonville-brewery-crawl/hero.jpg';
  
  console.log('🔍 Testing Supabase Storage connection...');
  const isAccessible = await testImageUrl(testUrl);
  
  if (isAccessible) {
    console.log('✅ Supabase Storage is accessible');
  } else {
    console.log('❌ Supabase Storage is not accessible');
  }
}; 