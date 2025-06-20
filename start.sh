#!/bin/bash

# Exit on error
set -e

# Generate the image map
node scripts/generateImageMap.js

# Start Expo
npx expo start -c