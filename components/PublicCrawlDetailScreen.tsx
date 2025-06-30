import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../utils/supabase';
import { useAuthContext } from './AuthContext';
import { getHeroImageSource } from './auto-generated/ImageLoader';
import { loadCrawlSteps } from './auto-generated/crawlAssetLoader';
import { Crawl, CrawlSteps } from '../types/crawl';

const PublicCrawlDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { crawl } = (route.params as { crawl: Crawl });
  const { user, isSignedIn } = useAuthContext();

  const [signups, setSignups] = useState<any[]>([]);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [crawlStepsData, setCrawlStepsData] = useState<CrawlSteps | null>(null);

  useEffect(() => {
    const fetchSignups = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('public_crawl_signups')
        .select('user_id, user_profiles (avatar_url, full_name)')
        .eq('crawl_id', crawl.id);
      if (data) {
        setSignups(data);
        setIsSignedUp(!!data.find((s: any) => s.user_id === user?.id));
      }
      setLoading(false);
    };
    fetchSignups();
  }, [crawl.id, user?.id]);

  useEffect(() => {
    const loadSteps = async () => {
      try {
        const stepsData = await loadCrawlSteps(crawl.assetFolder);
        setCrawlStepsData(stepsData);
      } catch (error) {
        console.error('Error loading crawl steps:', error);
      }
    };
    loadSteps();
  }, [crawl.assetFolder]);

  const handleSignUp = async () => {
    if (!user?.id) return;
    await supabase.from('public_crawl_signups').upsert({ user_id: user.id, crawl_id: crawl.id });
    setIsSignedUp(true);
    setSignups([...signups, { user_id: user.id, user_profiles: { avatar_url: user.imageUrl, full_name: user.fullName } }]);
  };

  const handleCancelSignUp = async () => {
    if (!user?.id) return;
    await supabase.from('public_crawl_signups').delete().eq('user_id', user.id).eq('crawl_id', crawl.id);
    setIsSignedUp(false);
    setSignups(signups.filter(s => s.user_id !== user.id));
  };

  const handleSignInPrompt = () => {
    // Navigate to the Profile tab which will show the sign-in screen
    navigation.navigate('Tabs', { screen: 'Profile' });
  };

  // Calculate if crawl is completed
  const isCrawlCompleted = () => {
    if (!crawl.start_time || !crawlStepsData?.steps) return false;
    
    const startTime = new Date(crawl.start_time);
    const totalDurationMinutes = crawlStepsData.steps.reduce((total, step) => {
      return total + (step.reveal_after_minutes || 0);
    }, 0);
    const endTime = new Date(startTime.getTime() + totalDurationMinutes * 60 * 1000);
    const currentTime = new Date();
    
    return currentTime > endTime;
  };

  const crawlIsCompleted = isCrawlCompleted();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={getHeroImageSource(crawl.assetFolder)} style={styles.heroImage} resizeMode="cover" />
        <Text style={styles.title}>{crawl.name}</Text>
        <Text style={styles.description}>{crawl.description}</Text>
        <Text style={styles.meta}>Date: {crawl.start_time || 'TBA'}</Text>
        <Text style={styles.meta}>Duration: {crawl.duration}</Text>
        <Text style={styles.meta}>Distance: {crawl.distance}</Text>
        <Text style={styles.meta}>Difficulty: {crawl.difficulty}</Text>
        {crawlIsCompleted && (
          <Text style={styles.completedText}>This crawl has been completed</Text>
        )}
        <Text style={styles.signupCount}>{signups.length} signed up</Text>
        <FlatList
          data={signups}
          keyExtractor={item => item.user_id}
          horizontal
          style={styles.avatarList}
          renderItem={({ item }) => (
            <View style={styles.avatarWrapper}>
              {item.user_profiles?.avatar_url ? (
                <Image source={{ uri: item.user_profiles.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
            </View>
          )}
        />
        {!crawlIsCompleted && (
          <>
            {!isSignedIn ? (
              <TouchableOpacity style={styles.signInPromptButton} onPress={handleSignInPrompt}>
                <Text style={styles.signInPromptButtonText}>Sign In to Join This Crawl</Text>
              </TouchableOpacity>
            ) : isSignedUp ? (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSignUp}>
                <Text style={styles.cancelButtonText}>Cancel Sign Up</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
                <Text style={styles.signupButtonText}>Sign Up</Text>
              </TouchableOpacity>
            )}
            {isSignedUp && (
              <TouchableOpacity style={styles.joinButton} onPress={() => navigation.navigate('CrawlSession', { crawl })}>
                <Text style={styles.joinButtonText}>Join Crawl</Text>
              </TouchableOpacity>
            )}
          </>
        )}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back to Public Crawls</Text>
        </TouchableOpacity>
      </ScrollView>
      {loading && <ActivityIndicator style={styles.loading} size="large" />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 24, paddingBottom: 48 },
  heroImage: { width: '100%', height: 180, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 8 },
  meta: { fontSize: 14, color: '#666', marginBottom: 2 },
  completedText: { fontSize: 16, color: '#28a745', fontWeight: 'bold', marginBottom: 8 },
  signupCount: { fontSize: 16, fontWeight: 'bold', marginVertical: 12 },
  avatarList: { marginBottom: 16 },
  avatarWrapper: { marginRight: 8 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eee' },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ccc' },
  signupButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  signupButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#eee', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  cancelButtonText: { color: '#333', fontSize: 16 },
  joinButton: { backgroundColor: '#28a745', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  joinButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backButton: { marginTop: 24, alignItems: 'flex-start' },
  backButtonText: { color: '#888', fontSize: 14, textAlign: 'left' },
  loading: { position: 'absolute', top: '50%', left: 0, right: 0 },
  signInPromptButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  signInPromptButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default PublicCrawlDetailScreen; 