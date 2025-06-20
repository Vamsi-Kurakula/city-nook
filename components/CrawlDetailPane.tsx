import React from 'react';
import { View, Text, TouchableOpacity, Animated, ActivityIndicator, Image, StyleSheet } from 'react-native';

interface Crawl {
  id: string;
  name: string;
  description: string;
  assetFolder: string;
  duration: string;
  difficulty: string;
  distance: string;
}

interface CrawlDetailPaneProps {
  crawl?: Crawl;
  visible: boolean;
  slideAnim: Animated.Value;
  onClose: () => void;
  onStart: () => void;
  getHeroImageSource: (assetFolder: string) => any;
  imageLoading: boolean;
  setImageLoading: (loading: boolean) => void;
}

const CrawlDetailPane: React.FC<CrawlDetailPaneProps> = ({
  crawl,
  visible,
  slideAnim,
  onClose,
  onStart,
  getHeroImageSource,
  imageLoading,
  setImageLoading,
}) => {
  if (!visible || !crawl) return null;
  return (
    <Animated.View
      style={[
        styles.detailPane,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.detailHeader}>
        <View style={styles.dragHandle} />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.detailContent}>
        <View style={styles.imageContainer}>
          {getHeroImageSource(crawl.assetFolder) ? (
            <Image
              source={getHeroImageSource(crawl.assetFolder)}
              style={styles.heroImage}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          {imageLoading && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          )}
        </View>
        <View style={styles.detailInfo}>
          <Text style={styles.detailTitle}>{crawl.name}</Text>
          <Text style={styles.detailDescription}>{crawl.description}</Text>
          <View style={styles.detailMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Duration</Text>
              <Text style={styles.metaValue}>{crawl.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Distance</Text>
              <Text style={styles.metaValue}>{crawl.distance}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Difficulty</Text>
              <Text style={styles.metaValue}>{crawl.difficulty}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.startButton} onPress={onStart}>
            <Text style={styles.startButtonText}>Start Crawl</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  detailPane: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  detailContent: {
    flex: 1,
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  placeholderText: {
    fontSize: 18,
    color: '#999',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  detailInfo: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  detailMeta: {
    marginBottom: 30,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metaLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CrawlDetailPane; 