import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCrawlContext } from './CrawlContext';
import { getHeroImageSource } from './ImageLoader';
import { StepComponent } from './StepComponents';

const CurrentCrawl: React.FC = () => {
  const { 
    currentCrawl, 
    isCrawlActive, 
    setCurrentCrawl, 
    setIsCrawlActive,
    currentProgress,
    completeStep,
    nextStep,
    getCurrentStep
  } = useCrawlContext();

  // Extract location name from Google Maps URL
  const extractLocationName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const query = urlObj.searchParams.get('q');
      if (query) {
        // Replace + with spaces and decode URI components
        return decodeURIComponent(query.replace(/\+/g, ' '));
      }
      return 'View Location';
    } catch {
      return 'View Location';
    }
  };

  const endCrawl = () => {
    Alert.alert(
      'End Crawl',
      'Are you sure you want to end this crawl? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Crawl', 
          style: 'destructive',
          onPress: () => {
            setCurrentCrawl(null);
            setIsCrawlActive(false);
          }
        }
      ]
    );
  };

  const handleStepComplete = (userAnswer: string) => {
    const currentStepNumber = getCurrentStep();
    completeStep(currentStepNumber, userAnswer);
    
    // Auto-advance to next step after a short delay
    setTimeout(() => {
      nextStep();
    }, 1500);
  };

  const getCompletedStepAnswer = (stepNumber: number): string | undefined => {
    return currentProgress?.completed_steps.find(
      step => step.step_number === stepNumber
    )?.user_answer;
  };

  const isStepCompleted = (stepNumber: number): boolean => {
    return currentProgress?.completed_steps.some(
      step => step.step_number === stepNumber
    ) || false;
  };

  const getProgressPercentage = (): number => {
    if (!currentCrawl?.steps || !currentProgress) return 0;
    const totalSteps = currentCrawl.steps.length;
    const completedSteps = currentProgress.completed_steps.length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  if (!isCrawlActive || !currentCrawl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Current Crawl</Text>
          <Text style={styles.subtitle}>No active crawl</Text>
          <Text style={styles.instruction}>
            Select a crawl from the Crawls tab to get started!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStepNumber = getCurrentStep();
  const progressPercentage = getProgressPercentage();
  const isCrawlCompleted = currentProgress?.completed || false;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Crawl</Text>
        <TouchableOpacity style={styles.endButton} onPress={endCrawl}>
          <Text style={styles.endButtonText}>End Crawl</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.crawlContent}>
          <View style={styles.imageContainer}>
            {getHeroImageSource(currentCrawl.assetFolder) ? (
              <Image
                source={getHeroImageSource(currentCrawl.assetFolder)}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
          </View>
          
          <View style={styles.crawlInfo}>
            <Text style={styles.crawlTitle}>{currentCrawl.name}</Text>
            <Text style={styles.crawlDescription}>{currentCrawl.description}</Text>
            
            <View style={styles.crawlMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>{currentCrawl.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Distance</Text>
                <Text style={styles.metaValue}>{currentCrawl.distance}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Difficulty</Text>
                <Text style={styles.metaValue}>{currentCrawl.difficulty}</Text>
              </View>
            </View>
            
            <View style={styles.progressSection}>
              <Text style={styles.progressTitle}>Progress</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progressPercentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {progressPercentage}% Complete ({currentProgress?.completed_steps.length || 0}/{currentCrawl.steps?.length || 0} steps)
              </Text>
            </View>

            {/* Last Reward Location */}
            {currentProgress?.completed_steps && currentProgress.completed_steps.length > 0 && (
              <View style={styles.lastRewardSection}>
                <Text style={styles.lastRewardTitle}>Last Reward</Text>
                <View style={styles.locationDisplay}>
                  <View style={styles.locationIcon}>
                    <Text style={styles.locationIconText}>📍</Text>
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>
                      {(() => {
                        const lastCompletedStep = currentProgress.completed_steps
                          .sort((a, b) => b.step_number - a.step_number)[0];
                        const stepIndex = lastCompletedStep.step_number - 1;
                        const step = currentCrawl.steps?.[stepIndex];
                        return step?.reward_location ? extractLocationName(step.reward_location) : 'Unknown Location';
                      })()}
                    </Text>
                    <Text style={styles.locationSubtext}>Tap to open in Maps</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.rewardButton}
                  onPress={() => {
                    if (!currentProgress?.completed_steps) return;
                    const lastCompletedStep = currentProgress.completed_steps
                      .sort((a, b) => b.step_number - a.step_number)[0];
                    const stepIndex = lastCompletedStep.step_number - 1;
                    const step = currentCrawl.steps?.[stepIndex];
                    if (step?.reward_location) {
                      Linking.openURL(step.reward_location);
                    }
                  }}
                >
                  <Text style={styles.rewardButtonText}>📍 Open in Maps</Text>
                </TouchableOpacity>
              </View>
            )}

            {isCrawlCompleted && (
              <View style={styles.completionSection}>
                <Text style={styles.completionTitle}>🎉 Crawl Completed!</Text>
                <Text style={styles.completionText}>
                  Congratulations! You've completed all steps of this crawl.
                </Text>
              </View>
            )}
          </View>

          {/* Steps Section */}
          {currentCrawl.steps && currentCrawl.steps.length > 0 && (
            <View style={styles.stepsSection}>
              <Text style={styles.stepsTitle}>Steps</Text>
              
              {/* Current Step - Always at the top */}
              {!isCrawlCompleted && (
                <View style={styles.stepWrapper}>
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepNumber}>Step {currentStepNumber}</Text>
                    <Text style={styles.stepStatus}>🔄 Current</Text>
                  </View>
                  
                  <StepComponent
                    key={`current-step-${currentStepNumber}`}
                    step={currentCrawl.steps[currentStepNumber - 1]}
                    onComplete={handleStepComplete}
                    isCompleted={false}
                  />
                </View>
              )}

              {/* Completed Steps - Below current step */}
              {currentCrawl.steps
                .map((step, index) => {
                  const stepNumber = index + 1;
                  const isCompleted = isStepCompleted(stepNumber);
                  const userAnswer = getCompletedStepAnswer(stepNumber);

                  if (isCompleted) {
                    return {
                      step,
                      stepNumber,
                      userAnswer,
                    };
                  }
                  return null;
                })
                .filter((item): item is { step: any; stepNumber: number; userAnswer: string | undefined } => item !== null)
                .reverse()
                .map(({ step, stepNumber, userAnswer }) => (
                  <View key={step.step_number} style={styles.stepWrapper}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.stepNumber}>Step {stepNumber}</Text>
                      <Text style={styles.stepStatus}>✓ Completed</Text>
                    </View>
                    
                    <StepComponent
                      step={step}
                      onComplete={() => {}}
                      isCompleted={true}
                      userAnswer={userAnswer}
                    />
                    
                    {/* Reward Location */}
                    {step.reward_location && (
                      <View style={styles.rewardSection}>
                        <Text style={styles.rewardLabel}>Reward:</Text>
                        <TouchableOpacity 
                          style={styles.rewardLink}
                          onPress={() => Linking.openURL(step.reward_location)}
                        >
                          <Text style={styles.rewardLinkText}>
                            📍 {extractLocationName(step.reward_location)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  endButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  crawlContent: {
    flex: 1,
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#f0f0f0',
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
  crawlInfo: {
    padding: 20,
  },
  crawlTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  crawlDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  crawlMeta: {
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
  progressSection: {
    marginTop: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
    width: '0%',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  completionSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  completionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  stepsSection: {
    padding: 20,
  },
  stepsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  stepWrapper: {
    marginBottom: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  stepStatus: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  lastRewardSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  lastRewardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  rewardButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rewardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rewardSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  rewardLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  rewardLink: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rewardLinkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  locationIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  locationSubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default CurrentCrawl; 