# Crawl Assets to Database Migration Implementation Guide

## Overview
This document outlines the complete implementation plan for converting crawl assets from YAML files to database records, including image storage in Supabase Storage.

## Database Schema Changes

### New Tables to Add

```sql
-- Crawl definitions table (combines both public and library crawls)
CREATE TABLE IF NOT EXISTS crawl_definitions (
  crawl_definition_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- Use name as the unique identifier
  description TEXT NOT NULL,
  asset_folder TEXT NOT NULL, -- Path to assets (e.g., 'crawl-library/historic-downtown-crawl')
  duration TEXT NOT NULL, -- e.g., '2-3 hours'
  difficulty TEXT NOT NULL, -- e.g., 'Easy', 'Medium'
  distance TEXT NOT NULL, -- e.g., '1.5 miles'
  is_public BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE for public crawls, FALSE for library crawls
  is_featured BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE for featured crawls
  start_time TIMESTAMP WITH TIME ZONE, -- NULL for library crawls, timestamp for public crawls
  hero_image_url TEXT, -- Public Supabase Storage URL
  hero_image_path TEXT, -- Storage bucket path
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crawl stops table with JSON stop_components
CREATE TABLE IF NOT EXISTS crawl_stops (
  crawl_stop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_definition_id UUID NOT NULL REFERENCES crawl_definitions(crawl_definition_id) ON DELETE CASCADE,
  stop_number INTEGER NOT NULL, -- 1-based indexing
  stop_type TEXT NOT NULL, -- 'location', 'riddle', 'photo', 'button'
  location_name TEXT NOT NULL,
  location_link TEXT, -- Google Maps link
  stop_components JSONB NOT NULL DEFAULT '{}', -- Flexible JSON field for stop-specific data
  reveal_after_minutes INTEGER, -- Optional timing for stops
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(crawl_definition_id, stop_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crawl_definitions_name ON crawl_definitions(name);
CREATE INDEX IF NOT EXISTS idx_crawl_definitions_is_public ON crawl_definitions(is_public);
CREATE INDEX IF NOT EXISTS idx_crawl_definitions_is_featured ON crawl_definitions(is_featured);
CREATE INDEX IF NOT EXISTS idx_crawl_stops_crawl_definition_id ON crawl_stops(crawl_definition_id);
CREATE INDEX IF NOT EXISTS idx_crawl_stops_stop_number ON crawl_stops(stop_number);
CREATE INDEX IF NOT EXISTS idx_crawl_stops_stop_components ON crawl_stops USING GIN(stop_components);

-- Trigger for updated_at
CREATE TRIGGER update_crawl_definitions_updated_at
  BEFORE UPDATE ON crawl_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Stop Components JSON Structure

The `stop_components` JSONB field will contain different data based on stop type:

**Location Stop:**
```json
{
  "coordinates": "40.7064,-74.0093",
  "description": "Find the iconic Charging Bull statue, symbol of financial prosperity"
}
```

**Riddle Stop:**
```json
{
  "riddle": "I'm a building where Washington was sworn in, the first capital of a new nation. I stand where history was made, with columns that tell stories of democracy. What am I?",
  "answer": "federal hall"
}
```

**Photo Stop:**
```json
{
  "photo_target": "Trinity Church",
  "photo_instructions": "Take a photo of the historic Trinity Church with its famous cemetery"
}
```

**Button Stop:**
```json
{
  "button_text": "Start Adventure",
  "button_action": "begin_crawl"
}
```

## File Structure Changes

### 1. Create Git-Ignored Assets Source Folder

```bash
# Create the new folder structure
mkdir -p assets-source/crawl-library
mkdir -p assets-source/public-crawls

# Add .gitkeep files to preserve folder structure
touch assets-source/.gitkeep
touch assets-source/crawl-library/.gitkeep
touch assets-source/public-crawls/.gitkeep
```

### 2. Update .gitignore

Add to `.gitignore`:
```
# Crawl assets source (git-ignored after initial commit)
assets-source/*
!assets-source/.gitkeep
!assets-source/crawl-library/.gitkeep
!assets-source/public-crawls/.gitkeep
```

### 3. Move Existing Assets

Move current assets to the new structure:
```bash
# Move crawl library assets
cp -r assets/crawl-library/* assets-source/crawl-library/

# Move public crawl assets  
cp -r assets/public-crawls/* assets-source/public-crawls/
```

## Supabase Storage Setup

### 1. Create Storage Bucket

In your Supabase dashboard:
1. Go to Storage section
2. Create a new bucket called `crawl-images`
3. Set bucket to public (allow public read access)
4. Configure CORS if needed for web access

### 2. Storage Bucket Policy

Add this policy to allow public read access:
```sql
-- Allow public read access to crawl-images bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'crawl-images');
```

## Migration Script Implementation

### 1. Create Migration Script

Create `scripts/migrateCrawlAssets.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Upload image to Supabase Storage
async function uploadImage(filePath, storagePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileExt = path.extname(filePath).toLowerCase();
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg', 
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }[fileExt] || 'image/jpeg';

    const { data, error } = await supabase.storage
      .from('crawl-images')
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('crawl-images')
      .getPublicUrl(storagePath);
      
    return publicUrl;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    return null;
  }
}

// Parse crawl definition from YAML
function parseCrawlDefinition(crawlData, isPublic = false) {
  return {
    name: crawlData.name,
    description: crawlData.description,
    asset_folder: crawlData.assetFolder,
    duration: crawlData.duration,
    difficulty: crawlData.difficulty,
    distance: crawlData.distance,
    is_public: isPublic,
    is_featured: crawlData['public-crawl'] || false, // Use existing flag for featured
    start_time: crawlData.start_time ? new Date(crawlData.start_time) : null
  };
}

// Parse stops from YAML
function parseStops(stopsData) {
  return stopsData.stops.map(stop => ({
    stop_number: stop.stop_number,
    stop_type: stop.stop_type,
    location_name: stop.location_name,
    location_link: stop.location_link,
    stop_components: stop.stop_components,
    reveal_after_minutes: stop.reveal_after_minutes
  }));
}

// Main migration function
async function migrateCrawlAssets() {
  console.log('Starting crawl assets migration...');
  
  try {
    // Read crawl library
    const crawlLibraryPath = path.join(__dirname, '../assets-source/crawl-library/crawls.yml');
    const crawlLibraryData = yaml.load(fs.readFileSync(crawlLibraryPath, 'utf8'));
    
    // Read public crawls
    const publicCrawlsPath = path.join(__dirname, '../assets-source/public-crawls/crawls.yml');
    const publicCrawlsData = yaml.load(fs.readFileSync(publicCrawlsPath, 'utf8'));
    
    // Process all crawls
    const allCrawls = [
      ...crawlLibraryData.crawls.map(crawl => ({ ...crawl, isPublic: false })),
      ...publicCrawlsData.crawls.map(crawl => ({ ...crawl, isPublic: true }))
    ];
    
    for (const crawl of allCrawls) {
      console.log(`Processing crawl: ${crawl.name}`);
      
      // Upload hero image if exists
      let heroImageUrl = null;
      let heroImagePath = null;
      
      const heroImageFile = path.join(__dirname, '../assets-source', crawl.assetFolder, 'hero.jpg');
      if (fs.existsSync(heroImageFile)) {
        const storagePath = `${crawl.assetFolder}/hero.jpg`;
        heroImageUrl = await uploadImage(heroImageFile, storagePath);
        heroImagePath = storagePath;
        console.log(`Uploaded hero image: ${heroImageUrl}`);
      }
      
      // Insert or update crawl definition
      const crawlDefinition = parseCrawlDefinition(crawl, crawl.isPublic);
      if (heroImageUrl) {
        crawlDefinition.hero_image_url = heroImageUrl;
        crawlDefinition.hero_image_path = heroImagePath;
      }
      
      const { data: crawlDef, error: crawlError } = await supabase
        .from('crawl_definitions')
        .upsert(crawlDefinition, { onConflict: 'name' })
        .select()
        .single();
      
      if (crawlError) throw crawlError;
      
      // Read and parse stops
      const stopsFile = path.join(__dirname, '../assets-source', crawl.assetFolder, 'stops.yml');
      if (fs.existsSync(stopsFile)) {
        const stopsData = yaml.load(fs.readFileSync(stopsFile, 'utf8'));
        const stops = parseStops(stopsData);
        
        // Insert stops
        for (const stop of stops) {
          const { error: stopError } = await supabase
            .from('crawl_stops')
            .upsert({
              ...stop,
              crawl_definition_id: crawlDef.crawl_definition_id
            }, { onConflict: 'crawl_definition_id,stop_number' });
          
          if (stopError) throw stopError;
        }
        
        console.log(`Inserted ${stops.length} stops for ${crawl.name}`);
      }
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateCrawlAssets();
}

module.exports = { migrateCrawlAssets };
```

### 2. Add Script to package.json

```json
{
  "scripts": {
    "migrate-crawl-assets": "node scripts/migrateCrawlAssets.js"
  }
}
```

## Application Code Updates

### 1. Update Database Operations

Create `utils/database/crawlDefinitionOperations.ts`:

```typescript
import { supabase } from './client';

export interface CrawlDefinition {
  crawl_definition_id: string;
  name: string;
  description: string;
  asset_folder: string;
  duration: string;
  difficulty: string;
  distance: string;
  is_public: boolean;
  is_featured: boolean;
  start_time?: string;
  hero_image_url?: string;
  hero_image_path?: string;
  created_at: string;
  updated_at: string;
}

export interface CrawlStop {
  crawl_stop_id: string;
  crawl_definition_id: string;
  stop_number: number;
  stop_type: string;
  location_name: string;
  location_link?: string;
  stop_components: Record<string, any>;
  reveal_after_minutes?: number;
  created_at: string;
}

// Get all crawl definitions
export async function getAllCrawlDefinitions(): Promise<CrawlDefinition[]> {
  const { data, error } = await supabase
    .from('crawl_definitions')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Get crawl definitions by type
export async function getCrawlDefinitionsByType(isPublic: boolean): Promise<CrawlDefinition[]> {
  const { data, error } = await supabase
    .from('crawl_definitions')
    .select('*')
    .eq('is_public', isPublic)
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Get featured crawl definitions
export async function getFeaturedCrawlDefinitions(): Promise<CrawlDefinition[]> {
  const { data, error } = await supabase
    .from('crawl_definitions')
    .select('*')
    .eq('is_featured', true)
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Get crawl definition by name
export async function getCrawlDefinitionByName(name: string): Promise<CrawlDefinition | null> {
  const { data, error } = await supabase
    .from('crawl_definitions')
    .select('*')
    .eq('name', name)
    .single();
  
  if (error) throw error;
  return data;
}

// Get stops for a crawl definition
export async function getCrawlStops(crawlDefinitionId: string): Promise<CrawlStop[]> {
  const { data, error } = await supabase
    .from('crawl_stops')
    .select('*')
    .eq('crawl_definition_id', crawlDefinitionId)
    .order('stop_number');
  
  if (error) throw error;
  return data || [];
}

// Get complete crawl with stops
export async function getCrawlWithStops(name: string): Promise<{
  definition: CrawlDefinition;
  stops: CrawlStop[];
} | null> {
  const definition = await getCrawlDefinitionByName(name);
  if (!definition) return null;
  
  const stops = await getCrawlStops(definition.crawl_definition_id);
  
  return { definition, stops };
}
```

### 2. Update Types

Update `types/crawl.ts`:

```typescript
export interface StopComponent {
  [key: string]: string;
}

export interface CrawlStop {
  crawl_stop_id: string;
  crawl_definition_id: string;
  stop_number: number;
  stop_type: string;
  location_name: string;
  location_link?: string;
  stop_components: Record<string, any>;
  reveal_after_minutes?: number;
  created_at: string;
}

export interface CrawlDefinition {
  crawl_definition_id: string;
  name: string;
  description: string;
  asset_folder: string;
  duration: string;
  difficulty: string;
  distance: string;
  is_public: boolean;
  is_featured: boolean;
  start_time?: string;
  hero_image_url?: string;
  hero_image_path?: string;
  created_at: string;
  updated_at: string;
}

// Legacy interface for backward compatibility
export interface Crawl {
  id: string;
  name: string;
  description: string;
  assetFolder: string;
  duration: string;
  difficulty: string;
  distance: string;
  'public-crawl': boolean;
  start_time?: string;
  stops?: CrawlStop[];
}

export interface CrawlSessionScreenParams {
  crawl: CrawlDefinition;
}

export interface UserStopProgress {
  stop_number: number;
  completed: boolean;
  user_answer?: string;
  completed_at?: Date;
}

export interface CrawlProgress {
  crawl_id: string;
  is_public: boolean;
  current_stop: number;
  completed_stops: UserStopProgress[];
  started_at: Date;
  last_updated: Date;
  completed?: boolean;
}
```

### 3. Update Data Loading Functions

Update existing data loading functions to use the new database operations instead of YAML files.

## Implementation Steps

### Phase 1: Database Setup
- [x] Add new tables to `database/schema.sql`
- [x] Run database migration in Supabase
- [x] Create Supabase Storage bucket `crawl-images`
- [x] Configure storage bucket permissions

### Phase 2: File Structure Setup
- [x] Create `assets-source` folder structure
- [x] Add `.gitkeep` files
- [x] Update `.gitignore`
- [x] Move existing assets to new structure
- [x] Commit initial folder structure

### Phase 3: Migration Script
- [ ] Create `scripts/migrateCrawlAssets.js`
- [ ] Add script to `package.json`
- [ ] Test migration script with sample data
- [ ] Run full migration

### Phase 4: Application Updates

#### 4.1 Core Database Operations
- [ ] Create `utils/database/crawlDefinitionOperations.ts`

#### 4.2 Type System Updates
- [ ] Update `types/crawl.ts`

#### 4.3 Data Loading Function Updates
- [ ] Update `utils/featuredCrawlLoader.ts` - Replace YAML loading with database calls
- [ ] Update `utils/publicCrawlLoader.ts` - Replace YAML loading with database calls
- [ ] Update `utils/database/crawlMetadataOperations.ts` - Replace YAML loading with database calls

#### 4.4 Auto-Generated Files (Remove/Replace)
- [ ] Remove `components/auto-generated/crawlAssetLoader.ts` - Replace with database operations
- [ ] Remove `components/auto-generated/ImageLoader.ts` - Replace with Supabase Storage URLs
- [ ] Update `scripts/generateCrawlAssetMap.js` - Remove or repurpose for database seeding
- [ ] Update `scripts/generateImageMap.js` - Remove or repurpose for database seeding

#### 4.5 Screen Component Updates
- [ ] Update `components/screens/CrawlLibrary.tsx` - Use database operations
- [ ] Update `components/screens/PublicCrawls.tsx` - Use database operations
- [ ] Update `components/screens/PublicCrawlDetailScreen.tsx` - Use database operations
- [ ] Update `components/screens/CrawlDetailScreen.tsx` - Use database operations
- [ ] Update `components/screens/CrawlSessionScreen.tsx` - Use database operations
- [ ] Update `components/screens/CrawlHistoryDetailScreen.tsx` - Use database operations

#### 4.6 Home Screen Updates
- [ ] Update `components/screens/home/HomeScreen.tsx` - Use database operations
- [ ] Update `components/screens/home/FeaturedCrawlsSection.tsx` - Use database operations
- [ ] Update `components/screens/home/UpcomingCrawlsSection.tsx` - Use database operations
- [ ] Update `components/screens/home/hooks/useHomeData.ts` - Use database operations
- [ ] Update `components/screens/home/hooks/useCrawlActions.ts` - Use database operations

#### 4.7 UI Component Updates
- [ ] Update `components/ui/CrawlCard.tsx` - Use database image URLs
- [ ] Update `components/ui/CrawlList.tsx` - Use database image URLs
- [ ] Update `components/ui/CrawlMap.tsx` - Use database stop data

#### 4.8 Stop Component Updates
- [ ] Update `components/ui/stops/StopComponent.tsx` - Use database stop data
- [ ] Update `components/ui/stops/LocationStop.tsx` - Use database stop data
- [ ] Update `components/ui/stops/RiddleStop.tsx` - Use database stop data
- [ ] Update `components/ui/stops/PhotoStop.tsx` - Use database stop data
- [ ] Update `components/ui/stops/ButtonStop.tsx` - Use database stop data

#### 4.9 Context Updates
- [ ] Update `components/context/CrawlContext.tsx` - Use new types and database operations

#### 4.10 Database Index Updates
- [ ] Update `utils/database/index.ts` - Export new crawl definition operations

#### 4.11 Testing and Validation
- [ ] Test application functionality
- [ ] Remove old YAML loading code

### Phase 5: Cleanup
- [ ] Remove old assets folder
- [ ] Update documentation
- [ ] Test complete workflow
- [ ] Deploy changes

## Migration Strategy & Considerations

### Gradual Migration Approach
1. **Phase 1-3**: Set up database and run migration (no app changes)
2. **Phase 4**: Implement new database operations alongside existing YAML loading
3. **Phase 5**: Switch app to use database, remove YAML loading
4. **Phase 6**: Clean up old files and assets

### Potential Issues & Solutions

#### Data Consistency
- **Issue**: YAML files and database could get out of sync
- **Solution**: Use upserts based on crawl name, implement validation checks

#### Image Loading
- **Issue**: Network-dependent image loading vs local assets
- **Solution**: Implement image caching, fallback to local assets during transition

#### Performance
- **Issue**: Database queries vs static file loading
- **Solution**: Implement caching layer, optimize queries with proper indexes

#### Type Safety
- **Issue**: Breaking changes to existing interfaces
- **Solution**: Maintain backward compatibility with adapter functions

### Rollback Strategy
1. Keep YAML loading code as fallback during transition
2. Database can be rolled back using Supabase dashboard
3. Storage files can be deleted and re-uploaded
4. Application can be reverted to previous commit

## Testing Checklist

### Database & Storage
- [ ] Database tables created successfully
- [ ] Storage bucket accessible and configured
- [ ] Migration script runs without errors
- [ ] All crawl definitions migrated correctly
- [ ] All stops migrated with proper JSONB structure
- [ ] Hero images uploaded and accessible via public URLs
- [ ] Database indexes created for performance

### Application Functionality
- [ ] Application loads crawls from database
- [ ] Featured crawls section works with new data source
- [ ] Public crawls section works with new data source
- [ ] Crawl library section works with new data source
- [ ] Individual crawl details load correctly
- [ ] Stop components display correctly with JSONB data
- [ ] Image loading works with Supabase Storage URLs
- [ ] All stop types (location, riddle, photo, button) work correctly

### Performance & Reliability
- [ ] Database queries perform well with proper indexes
- [ ] Image loading is fast with CDN
- [ ] Error handling works for missing data
- [ ] Offline fallback works during transition
- [ ] Backward compatibility maintained during transition

### Cleanup Verification
- [ ] Old YAML loading code removed
- [ ] Auto-generated files removed
- [ ] Old assets folder removed
- [ ] No broken imports or references
- [ ] All tests pass

## Rollback Plan

If issues arise:
1. Keep old YAML loading code as fallback
2. Database can be rolled back using Supabase dashboard
3. Storage files can be deleted and re-uploaded
4. Application can be reverted to previous commit

## Notes

- The migration uses `name` as the unique identifier for upserts
- Hero images are stored in Supabase Storage with public URLs
- Stop components are stored as JSONB for flexibility
- Featured crawls are determined by the existing `public-crawl` flag
- All existing functionality should be preserved during transition 