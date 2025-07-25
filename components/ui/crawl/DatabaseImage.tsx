import React, { useState, useEffect } from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import { getHeroImageSourceAsync } from '../../../utils/database/imageLoader';

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
          if (heroImageUrl.startsWith('http')) {
            setImageSource({ uri: heroImageUrl });
          } else {
            setImageSource(fallbackSource || require('../../../assets/icon.png'));
          }
        } else if (assetFolder) {
          // Fallback to asset folder method
          const imageUrl = await getHeroImageSourceAsync(assetFolder);
          
          if (imageUrl && imageUrl.startsWith('http')) {
            // It's a database URL
            setImageSource({ uri: imageUrl });
          } else {
            // It's a local asset path, use fallback
            setImageSource(fallbackSource || require('../../../assets/icon.png'));
          }
        } else {
          // No image source provided, use fallback
          setImageSource(fallbackSource || require('../../../assets/icon.png'));
        }
      } catch (error) {
        console.error('Error loading image:', error);
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
        console.error('Image loading error:', error);
        setImageSource(fallbackSource || require('../../../assets/icon.png'));
        onError?.(error);
      }}
    />
  );
};

export default DatabaseImage; 