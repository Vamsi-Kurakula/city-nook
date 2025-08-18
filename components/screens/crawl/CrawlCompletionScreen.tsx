import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { addCrawlHistory, deleteCrawlProgress } from '../../../utils/database';
import { useCrawlContext } from '../../context/CrawlContext';
import { useAuth } from '@clerk/clerk-expo';

const CrawlCompletionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const routeParams = route.params as { crawlName?: string; completionData?: any };
  const crawlName = routeParams?.crawlName;
  const completionData = routeParams?.completionData;
  const { theme } = useTheme();
  const { clearCrawlSession } = useCrawlContext();
  const { getToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const didSubmitRef = useRef(false);

  // Handle completion logic when component mounts
  useEffect(() => {
    const handleCompletion = async () => {
      // Guard against double invocation (e.g., React strict mode/dev re-mount)
      if (didSubmitRef.current) return;
      didSubmitRef.current = true;

      if (!completionData) {
        console.log('No completion data provided, skipping completion logic');
        setIsProcessing(false);
        return;
      }

      try {
        console.log('Processing crawl completion with data:', completionData);

        const startedIso = completionData.started ?? completionData.startedAt;
        const completedIso = completionData.completed ?? completionData.completedAt;
        const totalTimeMinutes = Math.round((new Date(completedIso).getTime() - new Date(startedIso).getTime()) / 60000);
        
        const token = await getToken({ template: 'supabase' });
        if (token) {
          // Add to history first
          await addCrawlHistory({
            userId: completionData.userId,
            crawlId: completionData.crawlId,
            isPublic: completionData.isPublic,
            completedAt: completedIso,
            totalTimeMinutes,
            token,
          });
          
          // Delete the progress record since crawl is completed
          const deleteResult = await deleteCrawlProgress({
            userId: completionData.userId,
            token,
          });
          
          if (deleteResult.error) {
            console.error('Failed to delete crawl progress:', deleteResult.error);
            // Don't fail the entire completion process, just log the error
            // The progress record will remain but the crawl is still completed
          } else {
            console.log('Crawl progress record successfully deleted');
          }
        }
        
        console.log('Crawl completed and progress record deleted');
        
        // Clear local state to prevent further database queries
        await clearCrawlSession();
        
        setIsProcessing(false);
      } catch (error) {
        console.error('Error completing crawl:', error);
        setError('Failed to save completion. Please try again.');
        setIsProcessing(false);
      }
    };

    handleCompletion();
  }, [completionData, clearCrawlSession]);

  const handleBackToHome = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  if (isProcessing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.button.primary} />
          <Text style={[styles.completionText, { color: theme.text.secondary, marginTop: 16 }]}>
            Saving your completion...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.centered}>
          <Text style={[styles.completionTitle, { color: '#FF3B30' }]}>⚠️ Error</Text>
          <Text style={[styles.completionText, { color: theme.text.secondary }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.completionExitButton, { backgroundColor: theme.button.primary }]} 
            onPress={handleBackToHome}
          >
            <Text style={[styles.completionExitButtonText, { color: theme.text.inverse }]}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.centered}>
        <Text style={[styles.completionTitle, { color: theme.text.primary }]}>🎉 Crawl Completed!</Text>
        <Text style={[styles.completionText, { color: theme.text.secondary }]}>
          {crawlName ? `You finished "${crawlName}"!` : 'You finished all stops of this crawl!'}
        </Text>
        <Text style={[styles.completionSubtext, { color: theme.text.secondary }]}>
          Your progress has been saved to your history.
        </Text>
        <TouchableOpacity 
          style={[styles.completionExitButton, { backgroundColor: theme.button.primary }]} 
          onPress={handleBackToHome}
        >
          <Text style={[styles.completionExitButtonText, { color: theme.text.inverse }]}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  completionTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 16,
    textAlign: 'center',
  },
  completionText: { 
    fontSize: 18, 
    marginBottom: 8, 
    textAlign: 'center',
    lineHeight: 24,
  },
  completionSubtext: { 
    fontSize: 16, 
    marginBottom: 32, 
    textAlign: 'center',
    lineHeight: 22,
  },
  completionExitButton: { 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 12,
    minWidth: 200,
  },
  completionExitButtonText: { 
    fontSize: 18, 
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CrawlCompletionScreen; 
