import React, { useState, useEffect } from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import { getHeroImageSourceAsync, getImageUrlWithFallback } from '../../../utils/database/imageLoader';
import { validateImageUrl, formatSupabaseStorageUrl, isSupabaseStorageUrl } from '../../../utils/imageUrlValidator';

interface DatabaseImageProps {
  assetFolder?: string;
  heroImageUrl?: string;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  fallbackSource?: ImageSourcePropType;
  onError?: (error: any) => void;
}

const DatabaseImage: React.FC<DatabaseImageProps> = ({
  assetFolder,
  heroImageUrl,
  style,
  resizeMode = 'cover',
  fallbackSource,
  onError
}) => {
  const [imageSource, setImageSource] = useState<ImageSourcePropType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        
        // If heroImageUrl is provided directly, use it
        if (heroImageUrl) {
          // Validate and format the URL for production
          const validatedUrl = validateImageUrl(heroImageUrl);
          if (validatedUrl && validatedUrl.startsWith('http')) {
            // Format Supabase URLs specifically
            const formattedUrl = isSupabaseStorageUrl(validatedUrl) 
              ? formatSupabaseStorageUrl(validatedUrl) 
              : validatedUrl;
            
            // Get URL with fallback strategy
            const finalUrl = await getImageUrlWithFallback(formattedUrl);
            
            setImageSource({ uri: finalUrl });
          } else {
            setImageSource(fallbackSource || require('../../../assets/icon.png'));
          }
        } else if (assetFolder) {
          // Fallback to asset folder method
          const imageUrl = await getHeroImageSourceAsync(assetFolder);
          
          if (imageUrl && imageUrl.startsWith('http')) {
            // Validate and format the URL for production
            const validatedUrl = validateImageUrl(imageUrl);
            if (validatedUrl) {
              const formattedUrl = isSupabaseStorageUrl(validatedUrl) 
                ? formatSupabaseStorageUrl(validatedUrl) 
                : validatedUrl;
              
              // Get URL with fallback strategy
              const finalUrl = await getImageUrlWithFallback(formattedUrl);
              
              setImageSource({ uri: finalUrl });
            } else {
              setImageSource(fallbackSource || require('../../../assets/icon.png'));
            }
          } else {
            // It's a local asset path, use fallback
            setImageSource(fallbackSource || require('../../../assets/icon.png'));
          }
        } else {
          // No image source provided, use fallback
          setImageSource(fallbackSource || require('../../../assets/icon.png'));
        }
      } catch (error) {
        console.error('❌ Error loading image:', error);
        setImageSource(fallbackSource || require('../../../assets/icon.png'));
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [assetFolder, heroImageUrl, fallbackSource, onError]);

  if (loading || !imageSource) {
    return (
      <Image
        source={fallbackSource || require('../../../assets/icon.png')}
        style={style}
        resizeMode={resizeMode}
      />
    );
  }

  return (
    <Image
      source={imageSource}
      style={style}
      resizeMode={resizeMode}
      onError={(error) => {
        console.error('❌ Image loading error:', {
          error: error?.nativeEvent || error,
          imageSource,
          heroImageUrl,
          assetFolder,
          errorType: typeof error,
          errorKeys: error ? Object.keys(error) : 'no error object'
        });
        
        // Log more specific error details
        if (error?.nativeEvent) {
          console.error('❌ Native error details:', {
            code: error.nativeEvent.code,
            message: error.nativeEvent.message,
            description: error.nativeEvent.description
          });
        }
        
        // Check if it's a 400 error (file not found)
        const errorMessage = error?.nativeEvent?.error || error?.message || '';
        if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
          console.log('🚨 HTTP 400 detected - image file may not exist in Supabase Storage');
          console.log('💡 Check if the image files are uploaded to the correct bucket and path');
        }
        
        setImageSource(fallbackSource || require('../../../assets/icon.png'));
        onError?.(error);
      }}
      onLoadStart={() => {
        // Optional: Add loading indicator if needed
      }}
      onLoadEnd={() => {
        // Optional: Remove loading indicator if needed
      }}
    />
  );
};

export default DatabaseImage; 