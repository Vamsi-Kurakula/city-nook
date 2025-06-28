// AUTO-GENERATED FILE. DO NOT EDIT.
const imageMap: { [key: string]: any } = {
  'art-culture-walk': require('../../assets/crawls/art-culture-walk/hero.jpg'),
  'default': require('../../assets/crawls/default/hero.jpg'),
  'foodie-adventure': require('../../assets/crawls/foodie-adventure/hero.jpg'),
  'historic-downtown-crawl': require('../../assets/crawls/historic-downtown-crawl/hero.jpg'),
  'taste-quest': require('../../assets/crawls/taste-quest/hero.jpg'),
};

export const getHeroImageSource = (assetFolder: string) => {
  return imageMap[assetFolder] || require('../../assets/crawls/default/hero.jpg');
};
