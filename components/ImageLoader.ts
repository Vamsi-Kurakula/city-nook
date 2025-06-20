const imageMap: { [key: string]: any } = {
  'historic-downtown-crawl': require('../assets/crawls/historic-downtown-crawl/hero.jpg'),
  'foodie-adventure': require('../assets/crawls/foodie-adventure/hero.jpg'),
  'art-culture-walk': require('../assets/crawls/art-culture-walk/hero.jpg'),
  'taste-quest': require('../assets/crawls/taste-quest/hero.jpg'),
};

export const getHeroImageSource = (assetFolder: string) => {
  return imageMap[assetFolder] || require('../assets/default-hero.jpg');
}; 