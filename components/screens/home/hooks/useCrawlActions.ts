import { useNavigation } from '@react-navigation/native';
import { useCrawlContext } from '../../../context/CrawlContext';
import { useAuth } from '@clerk/clerk-expo';
import { getSupabaseClient } from '../../../../utils/database/client';
import { getCrawlWithStopsById, getFeaturedCrawlDefinitions } from '../../../../utils/database/crawlDefinitionOperations';
import { Crawl } from '../../../../types/crawl';

interface CrawlProgress {
  crawlId: string;
  currentStep: number;
  completedSteps: number[];
  startTime: string;
  isPublicCrawl: boolean;
}

export function useCrawlActions() {
  const navigation = useNavigation<any>();
  const { endCurrentCrawlAndStartNew } = useCrawlContext();
  const { getToken } = useAuth();

  const handleContinueCrawl = async (crawlProgress: CrawlProgress) => {
    try {
      console.log('Continuing crawl:', crawlProgress);
      
      // Load crawl data from database
      const crawlData = await getCrawlWithStopsById(crawlProgress.crawlId);
      
      if (!crawlData) {
        console.error('Crawl data not found for:', crawlProgress.crawlId);
        return;
      }

      // Convert to Crawl format for compatibility
      const fullCrawlData: Crawl = {
        id: crawlData.definition.crawl_definition_id,
        name: crawlData.definition.name,
        description: crawlData.definition.description,
        duration: crawlData.definition.duration,
        difficulty: crawlData.definition.difficulty,
        distance: crawlData.definition.distance,
        'public-crawl': crawlData.definition.is_public,
        start_time: crawlData.definition.start_time,
        stops: crawlData.stops,
      };

      // Navigate to crawl session with resume data
      navigation.navigate('CrawlSession', {
        crawl: fullCrawlData,
        resumeProgress: {
          currentStop: crawlProgress.currentStep,
          completedStops: crawlProgress.completedSteps,
          startTime: crawlProgress.startTime,
        },
      });
    } catch (error) {
      console.error('Error continuing crawl:', error);
    }
  };

  const handleFeaturedCrawlPress = async (crawlId: string) => {
    try {
      // Load the crawl data from database
      const crawlData = await getCrawlWithStopsById(crawlId);
      if (crawlData) {
        // Convert to Crawl format for compatibility
        const crawl: Crawl = {
          id: crawlData.definition.crawl_definition_id,
          name: crawlData.definition.name,
          description: crawlData.definition.description,
          duration: crawlData.definition.duration,
          difficulty: crawlData.definition.difficulty,
          distance: crawlData.definition.distance,
          'public-crawl': crawlData.definition.is_public,
          start_time: crawlData.definition.start_time,
          stops: crawlData.stops,
        };
        navigation.navigate('CrawlDetail', { crawl });
      }
    } catch (error) {
      console.error('Error loading featured crawl:', error);
    }
  };

  const handleFeaturedCrawlCardPress = (crawl: Crawl) => {
    navigation.navigate('CrawlDetail', { crawl });
  };

  const handleFeaturedCrawlCardStart = (crawl: Crawl) => {
    navigation.navigate('CrawlSession', { crawl });
  };

  const handleInProgressCrawlPress = async (crawlProgress: CrawlProgress) => {
    try {
      console.log('Continuing crawl session directly:', crawlProgress);
      
      // Load crawl data from database
      const crawlData = await getCrawlWithStopsById(crawlProgress.crawlId);
      
      if (!crawlData) {
        console.error('Crawl data not found for:', crawlProgress.crawlId);
        return;
      }

      // Convert to Crawl format for compatibility
      const fullCrawlData: Crawl = {
        id: crawlData.definition.crawl_definition_id,
        name: crawlData.definition.name,
        description: crawlData.definition.description,
        duration: crawlData.definition.duration,
        difficulty: crawlData.definition.difficulty,
        distance: crawlData.definition.distance,
        'public-crawl': crawlData.definition.is_public,
        start_time: crawlData.definition.start_time,
        stops: crawlData.stops,
      };

      // Navigate directly to the session screen with resume progress
      navigation.navigate('CrawlSession', {
        crawl: fullCrawlData,
        resumeProgress: {
          currentStop: crawlProgress.currentStep,
          completedStops: crawlProgress.completedSteps,
          startTime: crawlProgress.startTime,
        },
      });
    } catch (error) {
      console.error('Error continuing crawl:', error);
    }
  };



  const handleViewAllFeaturedCrawls = () => {
    navigation.navigate('CrawlLibrary');
  };

  const handleSignUpForCrawl = async (crawlId: string, userId: string) => {
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        console.error('No JWT token available for signing up for crawl');
        return;
      }

      const supabase = getSupabaseClient(token);
      const { error } = await supabase
        .from('public_crawl_signups')
        .insert([
          {
            user_id: userId,
            crawl_id: crawlId,
          }
        ]);

      if (error) {
        console.error('Error signing up for crawl:', error);
      } else {
        console.log('Successfully signed up for crawl:', crawlId);
        // You might want to refresh the data here
      }
    } catch (error) {
      console.error('Error signing up for crawl:', error);
    }
  };

  return {
    handleContinueCrawl,
    handleFeaturedCrawlPress,
    handleFeaturedCrawlCardPress,
    handleFeaturedCrawlCardStart,
    handleInProgressCrawlPress,
    handleViewAllFeaturedCrawls,
    handleSignUpForCrawl,
  };
} 