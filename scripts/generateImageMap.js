const fs = require('fs');
const path = require('path');

const publicCrawlsDir = path.join(__dirname, '../assets/public-crawls');
const crawlLibraryDir = path.join(__dirname, '../assets/crawl-library');
const outputFile = path.join(__dirname, '../components/auto-generated/ImageLoader.ts');
const defaultImage = "require('../../assets/crawl-library/historic-downtown-crawl/hero.jpg')";

// Function to get crawl folders from a directory
function getCrawlFolders(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  
  return fs.readdirSync(dirPath).filter(f => {
    const fullPath = path.join(dirPath, f);
    return fs.statSync(fullPath).isDirectory();
  });
}

// Get folders from both directories
const publicFolders = getCrawlFolders(publicCrawlsDir);
const libraryFolders = getCrawlFolders(crawlLibraryDir);

let imageMapEntries = '';

// Process public crawls
publicFolders.forEach(folder => {
  const heroPath = path.join(publicCrawlsDir, folder, 'hero.jpg');
  if (fs.existsSync(heroPath)) {
    imageMapEntries += `  'public-crawls/${folder}': require('../../assets/public-crawls/${folder}/hero.jpg'),\n`;
  }
});

// Process library crawls
libraryFolders.forEach(folder => {
  const heroPath = path.join(crawlLibraryDir, folder, 'hero.jpg');
  if (fs.existsSync(heroPath)) {
    imageMapEntries += `  'crawl-library/${folder}': require('../../assets/crawl-library/${folder}/hero.jpg'),\n`;
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
console.log(`Found ${publicFolders.length} public crawl folders, ${libraryFolders.length} library crawl folders`); 