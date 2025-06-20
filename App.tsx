import React, { useEffect, useState } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  StatusBar, 
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as yaml from 'js-yaml';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { height: screenHeight } = Dimensions.get('window');

interface Crawl {
  id: string;
  name: string;
  description: string;
  assetFolder: string;
  duration: string;
  difficulty: string;
  distance: string;
}

interface CrawlData {
  crawls: Crawl[];
}

export default function App() {
  const [crawls, setCrawls] = useState<Crawl[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrawl, setSelectedCrawl] = useState<Crawl | null>(null);
  const [detailPaneVisible, setDetailPaneVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const slideAnim = useState(new Animated.Value(screenHeight))[0];

  const imageMap: { [key: string]: any } = {
    'historic-downtown-crawl': require('./assets/crawls/historic-downtown-crawl/hero.jpg'),
    'foodie-adventure': require('./assets/crawls/foodie-adventure/hero.jpg'),
    'art-culture-walk': require('./assets/crawls/art-culture-walk/hero.jpg'),
    'taste-quest': require('./assets/crawls/taste-quest/hero.jpg'),
  };

  useEffect(() => {
    const loadCrawls = async () => {
      try {
        console.log('Starting to load crawls...');
        // Load the asset (YAML file) from the bundled assets
        const asset = Asset.fromModule(require('./assets/crawls/crawls.yml'));
        console.log('Asset loaded:', asset);
        await asset.downloadAsync();
        console.log('Asset downloaded');
        const yamlString = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
        console.log('YAML string loaded, length:', yamlString.length);
        const data = yaml.load(yamlString) as CrawlData;
        console.log('YAML parsed:', data);
        if (data && Array.isArray(data.crawls)) {
          console.log('Setting crawls:', data.crawls.length, 'items');
          setCrawls(data.crawls);
        } else {
          console.error('Invalid YAML structure or no crawls found');
          setCrawls([]);
        }
      } catch (e) {
        console.error('Error loading crawls:', e);
        setCrawls([]);
      } finally {
        setLoading(false);
      }
    };
    loadCrawls();
  }, []);

  const getHeroImageSource = (assetFolder: string) => {
    return imageMap[assetFolder] || require('./assets/crawls/default/hero.jpg');
  };

  const showDetailPane = (crawl: Crawl) => {
    console.log('Showing detail pane for:', crawl.name);
    setSelectedCrawl(crawl);
    setDetailPaneVisible(true);
    setImageLoading(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleCrawlPress = (crawl: Crawl) => {
    console.log('Crawl pressed:', crawl.name);
    // Add visual feedback - you can remove this later
    alert(`Pressed: ${crawl.name}`);
    showDetailPane(crawl);
  };

  const hideDetailPane = () => {
    console.log('Hiding detail pane');
    Animated.spring(slideAnim, {
      toValue: screenHeight,
      useNativeDriver: true,
    }).start(() => {
      setDetailPaneVisible(false);
      setSelectedCrawl(null);
      setImageLoading(false);
    });
  };

  const startCrawl = () => {
    // TODO: Implement crawl start functionality
    console.log('Starting crawl:', selectedCrawl?.name);
    hideDetailPane();
  };

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  if (crawls.length === 0) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.header}>City Crawls</Text>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No crawls found</Text>
            <Text style={styles.errorSubtext}>Please check your crawls.yml file</Text>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>City Crawls</Text>
        <FlatList
          data={crawls}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.crawlCard}
              onPress={() => handleCrawlPress(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.crawlTitle}>{item.name}</Text>
              <Text style={styles.crawlDesc} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.crawlMeta}>
                <Text style={styles.metaText}>{item.duration}</Text>
                <Text style={styles.metaText}>{item.distance}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />

        {detailPaneVisible && selectedCrawl && (
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
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={hideDetailPane}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailContent}>
              <View style={styles.imageContainer}>
                {getHeroImageSource(selectedCrawl.assetFolder) ? (
                  <Image
                    source={getHeroImageSource(selectedCrawl.assetFolder)}
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
                <Text style={styles.detailTitle}>{selectedCrawl.name}</Text>
                <Text style={styles.detailDescription}>
                  {selectedCrawl.description}
                </Text>

                <View style={styles.detailMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Duration</Text>
                    <Text style={styles.metaValue}>{selectedCrawl.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Distance</Text>
                    <Text style={styles.metaValue}>{selectedCrawl.distance}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Difficulty</Text>
                    <Text style={styles.metaValue}>{selectedCrawl.difficulty}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={startCrawl}
                >
                  <Text style={styles.startButtonText}>Start Crawl</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  crawlCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  crawlTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  crawlDesc: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  crawlMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
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
