import React, { useState, useEffect } from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import { getHeroImageSourceAsync } from '../../../utils/database/imageLoader';
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
        
        console.log('🔍 DatabaseImage Debug:', {
          heroImageUrl,
          assetFolder,
          hasFallback: !!fallbackSource
        });
        
        // If heroImageUrl is provided directly, use it
        if (heroImageUrl) {
          console.log('📸 Using heroImageUrl:', heroImageUrl);
          
          // Validate and format the URL for production
          const validatedUrl = validateImageUrl(heroImageUrl);
          if (validatedUrl && validatedUrl.startsWith('http')) {
            // Format Supabase URLs specifically
            const formattedUrl = isSupabaseStorageUrl(validatedUrl) 
              ? formatSupabaseStorageUrl(validatedUrl) 
              : validatedUrl;
            
            console.log('🌐 Setting validated HTTP image source:', formattedUrl);
            setImageSource({ uri: formattedUrl });
          } else {
            console.log('📁 Using local asset fallback for heroImageUrl');
            setImageSource(fallbackSource || require('../../../assets/icon.png'));
          }
        } else if (assetFolder) {
          // Fallback to asset folder method
          console.log('📁 Loading from asset folder:', assetFolder);
          const imageUrl = await getHeroImageSourceAsync(assetFolder);
          console.log('📸 Retrieved image URL from asset folder:', imageUrl);
          
          if (imageUrl && imageUrl.startsWith('http')) {
            // Validate and format the URL for production
            const validatedUrl = validateImageUrl(imageUrl);
            if (validatedUrl) {
              const formattedUrl = isSupabaseStorageUrl(validatedUrl) 
                ? formatSupabaseStorageUrl(validatedUrl) 
                : validatedUrl;
              
              console.log('🌐 Setting validated HTTP image source from asset folder:', formattedUrl);
              setImageSource({ uri: formattedUrl });
            } else {
              console.log('📁 URL validation failed, using fallback');
              setImageSource(fallbackSource || require('../../../assets/icon.png'));
            }
          } else {
            // It's a local asset path, use fallback
            console.log('📁 Using local asset fallback for asset folder');
            setImageSource(fallbackSource || require('../../../assets/icon.png'));
          }
        } else {
          // No image source provided, use fallback
          console.log('📁 No image source provided, using fallback');
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
        
        setImageSource(fallbackSource || require('../../../assets/icon.png'));
        onError?.(error);
      }}
      onLoad={() => {
        console.log('✅ Image loaded successfully:', imageSource);
      }}
      // Add these props for better production compatibility
      fadeDuration={0}
      progressiveRenderingEnabled={false}
    />
  );
};

export default DatabaseImage; 