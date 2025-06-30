// AUTO-GENERATED FILE. DO NOT EDIT.
const imageMap: { [key: string]: any } = {
  'public-crawls/foodie-adventure': require('../../assets/public-crawls/foodie-adventure/hero.jpg'),
  'public-crawls/synchronized-crawl': require('../../assets/public-crawls/synchronized-crawl/hero.jpg'),
  'public-crawls/taste-quest': require('../../assets/public-crawls/taste-quest/hero.jpg'),
  'crawl-library/art-culture-walk': require('../../assets/crawl-library/art-culture-walk/hero.jpg'),
  'crawl-library/historic-downtown-crawl': require('../../assets/crawl-library/historic-downtown-crawl/hero.jpg'),
  'crawl-library/simple-location-crawl': require('../../assets/crawl-library/simple-location-crawl/hero.jpg'),
};

export const getHeroImageSource = (assetFolder: string) => {
  return imageMap[assetFolder] || require('../../assets/crawl-library/historic-downtown-crawl/hero.jpg');
};
