import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { loadCrawlStops } from '../auto-generated/crawlAssetLoader';
import { getCrawlNameMapping, getCrawlAssetFolder } from '../../utils/supabase';
import { CrawlStop } from '../../types/crawl';

interface CrawlHistoryDetailParams {
  crawlId: string;
  completedAt: string;
  totalTimeMinutes: number;
  score?: number;
}

const CrawlHistoryDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { crawlId, completedAt, totalTimeMinutes, score } = route.params as CrawlHistoryDetailParams;
  
  const [stops, setStops] = useState<CrawlStop[]>([]);
  const [crawlName, setCrawlName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrawlData = async () => {
      setLoading(true);
      
      try {
        // Get crawl name mapping
        const crawlNameMapping = await getCrawlNameMapping();
        const name = crawlNameMapping[crawlId] || `Crawl ${crawlId}`;
        setCrawlName(name);
        
        // Get the asset folder for this crawl
        const assetFolder = await getCrawlAssetFolder(crawlId);
        if (assetFolder) {
          const stopsData = await loadCrawlStops(assetFolder);
          if (stopsData?.stops) {
            setStops(stopsData.stops);
          }
        }
      } catch (error) {
        console.error('Error loading crawl data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrawlData();
  }, [crawlId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${remainingMinutes}m`;
    }
  };

  const renderStop = ({ item, index }: { item: CrawlStop; index: number }) => (
    <View style={styles.stopItem}>
      <View style={styles.stopHeader}>
        <Text style={styles.stopNumber}>Stop {item.stop_number}</Text>
        <Text style={styles.stopType}>{item.stop_type}</Text>
      </View>
      
      <Text style={styles.stopDescription}>
        {item.stop_components.description || 
         item.stop_components.location_name || 
         item.stop_components.riddle || 
         item.stop_components.photo_instructions || 
         'Stop description'}
      </Text>
      
      {item.location_link && (
        <Text style={styles.rewardLocation}>
          📍 Reward Location Available
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading crawl details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>{crawlName}</Text>
          
          <View style={styles.completionInfo}>
            <Text style={styles.completionDate}>
              Completed on {formatDate(completedAt)}
            </Text>
            <Text style={styles.completionTime}>
              Total Time: {formatTime(totalTimeMinutes)}
            </Text>
            {score !== null && score !== undefined && (
              <Text style={styles.score}>Score: {score}</Text>
            )}
          </View>
          
          <View style={styles.stopsSection}>
            <Text style={styles.sectionTitle}>Crawl Stops</Text>
            {stops.length > 0 ? (
              <FlatList
                data={stops}
                keyExtractor={(item) => item.stop_number.toString()}
                renderItem={renderStop}
                scrollEnabled={false}
                contentContainerStyle={styles.stopsList}
              />
            ) : (
              <Text style={styles.noStopsText}>
                No stops available for this crawl.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to History</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  completionInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  completionDate: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  completionTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  score: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  stopsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  stopsList: {
    gap: 12,
  },
  stopItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stopNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stopType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'capitalize',
  },
  stopDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  rewardLocation: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  noStopsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  backButton: {
    padding: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#888',
    fontSize: 16,
  },
});

export default CrawlHistoryDetailScreen; 