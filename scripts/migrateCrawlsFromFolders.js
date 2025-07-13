const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = 'crawl-images';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const crawlsRoot = path.join(__dirname, '../assets-source');

// Get git user name for tracking who created the crawls
function getGitUserName() {
  try {
    // Try local config first, then global config
    let userName = execSync('git config user.name', { encoding: 'utf8' }).trim();
    if (!userName) {
      userName = execSync('git config --global user.name', { encoding: 'utf8' }).trim();
    }
    return userName || 'Unknown User';
  } catch (error) {
    console.warn('Could not get git user name, using default');
    return 'Unknown User';
  }
}

async function uploadHeroImage(folder, crawlId) {
  const heroPath = path.join(folder, 'hero.jpg');
  if (!fs.existsSync(heroPath)) return { url: null, storagePath: null };
  const storagePath = `${crawlId}/hero.jpg`;
  const fileBuffer = fs.readFileSync(heroPath);
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) {
    console.error(`  Error uploading hero image: ${error.message}`);
    return { url: null, storagePath: null };
  }
  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { url: publicUrl, storagePath };
}

async function upsertCrawlDefinition(crawl, heroImage) {
  const crawlDef = {
    name: crawl.name,
    description: crawl.description,
    asset_folder: crawl.assetFolder,
    duration: crawl.duration,
    difficulty: crawl.difficulty,
    distance: crawl.distance,
    is_public: crawl.is_public,
    is_featured: crawl.is_featured,
    start_time: crawl.start_time || null,
    hero_image_url: heroImage.url,
    hero_image_path: heroImage.storagePath,
    created_by: getGitUserName(), // Track who created the crawl using git user name
  };
  const { data, error } = await supabase
    .from('crawl_definitions')
    .upsert(crawlDef, { onConflict: 'name' })
    .select()
    .single();
  if (error) {
    console.error(`  Error upserting crawl definition: ${error.message}`);
    return null;
  }
  return data;
}

async function upsertStops(crawlDefinitionId, stops) {
  if (!Array.isArray(stops)) return;
  for (const stop of stops) {
    const stopRow = {
      crawl_definition_id: crawlDefinitionId,
      stop_number: stop.stop_number,
      stop_type: stop.stop_type,
      location_name: stop.location_name,
      location_link: stop.location_link || null,
      stop_components: stop.stop_components || {},
      reveal_after_minutes: stop.reveal_after_minutes || null,
    };
    const { error } = await supabase
      .from('crawl_stops')
      .upsert(stopRow, { onConflict: 'crawl_definition_id,stop_number' });
    if (error) {
      console.error(`    Error upserting stop #${stop.stop_number}: ${error.message}`);
    }
  }
}

async function migrate() {
  const folders = fs.readdirSync(crawlsRoot, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(crawlsRoot, dirent.name));

  for (const folder of folders) {
    const crawlYmlPath = path.join(folder, 'crawl.yml');
    if (!fs.existsSync(crawlYmlPath)) {
      console.log(`Skipping ${folder} (no crawl.yml)`);
      continue;
    }
    const crawl = yaml.load(fs.readFileSync(crawlYmlPath, 'utf8'));
    console.log(`\nProcessing: ${crawl.name}`);
    // Upload hero image if present
    const heroImage = await uploadHeroImage(folder, path.basename(folder));
    // Upsert crawl definition
    const crawlDef = await upsertCrawlDefinition(crawl, heroImage);
    if (!crawlDef) continue;
    // Upsert stops
    if (crawl.stops) {
      await upsertStops(crawlDef.crawl_definition_id, crawl.stops);
      console.log(`  Uploaded ${crawl.stops.length} stops.`);
    } else {
      console.log('  No stops found.');
    }
  }
  console.log('\nMigration complete!');
}

migrate(); 