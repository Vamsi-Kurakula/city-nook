import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCrawlContext } from './CrawlContext';
import { Crawl } from '../types/crawl';
import { getHeroImageSource } from './auto-generated/ImageLoader';
import { useAuthContext } from './AuthContext';
import { supabase } from '../utils/supabase';

const CrawlDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { crawl } = (route.params as { crawl: Crawl }) || {};
  const { startCrawlWithNavigation } = useCrawlContext();
  const { user } = useAuthContext();
  const [resumeProgress, setResumeProgress] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchProgress = async () => {
      if (user?.id && crawl?.id) {
        const { data, error } = await supabase
          .from('crawl_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('crawl_id', crawl.id)
          .single();
        if (data && !data.completed_at) {
          setResumeProgress(data);
        } else {
          setResumeProgress(null);
        }
      }
    };
    fetchProgress();
  }, [user, crawl]);

  if (!crawl) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>No crawl data found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleResumeCrawl = () => {
    if (resumeProgress) {
      navigation.navigate('CrawlSession', { crawl, resumeProgress });
    }
  };

  const handleStartCrawl = () => {
    navigation.navigate('CrawlSession', { crawl });
  };

  let resumeInfo = null;
  if (resumeProgress && crawl?.steps) {
    const completedCount = resumeProgress.completed_steps?.length || 0;
    const currentStepNum = resumeProgress.current_step;
    const currentStep = crawl.steps.find(s => s.step_number === currentStepNum);
    const locationName = currentStep?.step_components?.location_name || currentStep?.step_components?.description || currentStep?.step_components?.riddle || '';
    resumeInfo = (
      <View style={{ marginTop: 16, marginBottom: 4, alignItems: 'flex-start' }}>
        <Text style={{ color: '#888', fontSize: 15 }}>
          {`You have completed ${completedCount} step${completedCount === 1 ? '' : 's'}.`}
        </Text>
        <Text style={{ color: '#888', fontSize: 15 }}>
          {`Current step: ${currentStepNum}${locationName ? ` - ${locationName}` : ''}`}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={getHeroImageSource(crawl.assetFolder)}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <Text style={styles.title}>{crawl.name}</Text>
        <Text style={styles.description}>{crawl.description}</Text>
        <Text style={styles.meta}>Duration: {crawl.duration}</Text>
        <Text style={styles.meta}>Distance: {crawl.distance}</Text>
        <Text style={styles.meta}>Difficulty: {crawl.difficulty}</Text>
        <TouchableOpacity style={styles.startButton} onPress={handleStartCrawl}>
          <Text style={styles.startButtonText}>Start Crawl</Text>
        </TouchableOpacity>
        {resumeInfo}
        {resumeProgress && (
          <TouchableOpacity style={[styles.startButton, { backgroundColor: '#888', marginTop: 12 }]} onPress={handleResumeCrawl}>
            <Text style={[styles.startButtonText, { color: '#fff' }]}>Resume Crawl</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.backButtonBottom} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonBottomText}>Back to Crawl Library</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 24 },
  heroImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, color: '#666', marginBottom: 12 },
  meta: { fontSize: 14, color: '#888', marginBottom: 4 },
  startButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButton: { marginTop: 24, backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backButtonBottom: {
    position: 'absolute',
    left: 24,
    bottom: 24,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backButtonBottomText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'left',
  },
});

export default CrawlDetailScreen; 