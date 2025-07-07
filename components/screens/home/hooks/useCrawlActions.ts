import { useNavigation } from '@react-navigation/native';
import { useCrawlContext } from '../../../context/CrawlContext';
import { supabase } from '../../../../utils/database';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import yaml from 'js-yaml';
import { loadCrawlStops } from '../../../auto-generated/crawlAssetLoader';
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

  const handleContinueCrawl = async (crawlProgress: CrawlProgress) => {
    try {
      console.log('Continuing crawl:', crawlProgress);
      
      // Load crawl data based on whether it's a public crawl or library crawl
      let crawlData;
      
      if (crawlProgress.isPublicCrawl) {
        // Load public crawl data
        const publicCrawlsAsset = Asset.fromModule(require('../../../../assets/public-crawls/crawls.yml'));
        await publicCrawlsAsset.downloadAsync();
        const yamlString = await FileSystem.readAsStringAsync(publicCrawlsAsset.localUri || publicCrawlsAsset.uri);
        const data = yaml.load(yamlString) as any;
        crawlData = data.crawls.find((c: any) => c.id === crawlProgress.crawlId);
      } else {
        // Load library crawl data
        const libraryCrawlsAsset = Asset.fromModule(require('../../../../assets/crawl-library/crawls.yml'));
        await libraryCrawlsAsset.downloadAsync();
        const yamlString = await FileSystem.readAsStringAsync(libraryCrawlsAsset.localUri || libraryCrawlsAsset.uri);
        const data = yaml.load(yamlString) as any;
        crawlData = data.crawls.find((c: any) => c.id === crawlProgress.crawlId);
      }

      if (!crawlData) {
        console.error('Crawl data not found for:', crawlProgress.crawlId);
        return;
      }

      // Load stops for the crawl
      const stopsData = await loadCrawlStops(crawlData.assetFolder);
      const fullCrawlData = {
        ...crawlData,
        stops: stopsData?.stops || [],
      };

      // Navigate to crawl session with resume data
      const screenName = crawlProgress.isPublicCrawl ? 'PublicCrawlSession' : 'CrawlSession';
      navigation.navigate(screenName, {
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
      // Load the crawl data from the library
      const asset = Asset.fromModule(require('../../../../assets/crawl-library/crawls.yml'));
      await asset.downloadAsync();
      const yamlString = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
      const data = yaml.load(yamlString) as any;
      
      const crawl = data.crawls.find((c: any) => c.id === crawlId);
      if (crawl) {
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
      // Load crawl data based on whether it's a public crawl or library crawl
      let crawlData;
      if (crawlProgress.isPublicCrawl) {
        // Load public crawl data
        const publicCrawlsAsset = Asset.fromModule(require('../../../../assets/public-crawls/crawls.yml'));
        await publicCrawlsAsset.downloadAsync();
        const yamlString = await FileSystem.readAsStringAsync(publicCrawlsAsset.localUri || publicCrawlsAsset.uri);
        const data = yaml.load(yamlString) as any;
        crawlData = data.crawls.find((c: any) => c.id === crawlProgress.crawlId);
      } else {
        // Load library crawl data
        const libraryCrawlsAsset = Asset.fromModule(require('../../../../assets/crawl-library/crawls.yml'));
        await libraryCrawlsAsset.downloadAsync();
        const yamlString = await FileSystem.readAsStringAsync(libraryCrawlsAsset.localUri || libraryCrawlsAsset.uri);
        const data = yaml.load(yamlString) as any;
        crawlData = data.crawls.find((c: any) => c.id === crawlProgress.crawlId);
      }
      if (!crawlData) {
        console.error('Crawl data not found for:', crawlProgress.crawlId);
        return;
      }
      // Load stops for the crawl
      const stopsData = await loadCrawlStops(crawlData.assetFolder);
      const fullCrawlData = {
        ...crawlData,
        stops: stopsData?.stops || [],
      };
      // Navigate directly to the session screen with resume progress
      const screenName = crawlProgress.isPublicCrawl ? 'PublicCrawlSession' : 'CrawlSession';
      navigation.navigate(screenName, {
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

  const handlePublicCrawlPress = (crawlId: string) => {
    navigation.navigate('PublicCrawlDetail', { crawlId });
  };

  const handleViewAllPublicCrawls = () => {
    navigation.navigate('PublicCrawls');
  };

  const handleViewAllFeaturedCrawls = () => {
    navigation.navigate('CrawlLibrary');
  };

  const handleSignUpForCrawl = async (crawlId: string, userId: string) => {
    try {
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
    handlePublicCrawlPress,
    handleViewAllPublicCrawls,
    handleViewAllFeaturedCrawls,
    handleSignUpForCrawl,
  };
} 