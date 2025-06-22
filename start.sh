#!/bin/bash

# Exit on error
set -e

# Generate the image map
node scripts/generateImageMap.js

# Generate the crawl asset map
node scripts/generateCrawlAssetMap.js

# Start Expo
npx expo start -c