const fs = require('fs');
const path = require('path');

const crawlsDir = path.join(__dirname, '../assets/crawls');
const outputFile = path.join(__dirname, '../components/ImageLoader.ts');
const defaultImage = "require('../assets/crawls/default/hero.jpg')";

const folders = fs.readdirSync(crawlsDir).filter(f => {
  const fullPath = path.join(crawlsDir, f);
  return fs.statSync(fullPath).isDirectory();
});

let imageMapEntries = '';
folders.forEach(folder => {
  const heroPath = path.join(crawlsDir, folder, 'hero.jpg');
  if (fs.existsSync(heroPath)) {
    imageMapEntries += `  '${folder}': require('../assets/crawls/${folder}/hero.jpg'),\n`;
  }
});

const fileContent = `// AUTO-GENERATED FILE. DO NOT EDIT.
const imageMap: { [key: string]: any } = {
${imageMapEntries}};

export const getHeroImageSource = (assetFolder: string) => {
  return imageMap[assetFolder] || ${defaultImage};
};
`;

fs.writeFileSync(outputFile, fileContent);
console.log('ImageLoader.ts generated successfully!'); 