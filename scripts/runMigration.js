const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please check your .env file has SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Running database migration...');
  
  try {
    // Try to add the completed_stops column
    console.log('\nAdding completed_stops column...');
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'crawl_progress' 
                AND column_name = 'completed_stops'
            ) THEN
                ALTER TABLE crawl_progress ADD COLUMN completed_stops INTEGER[] DEFAULT '{}';
                RAISE NOTICE 'Added completed_stops column to crawl_progress table';
            ELSE
                RAISE NOTICE 'completed_stops column already exists';
            END IF;
        END $$;
      `
    });

    if (addColumnError) {
      console.log('Note: Could not run migration via RPC (this is normal)');
      console.log('You need to run the migration manually in Supabase SQL editor');
    } else {
      console.log('✅ Migration completed successfully!');
    }

    // Test if the column exists by trying to insert a record
    console.log('\nTesting schema...');
    const testData = {
      user_id: 'test-user',
      crawl_id: 'test-crawl',
      current_stop: 1,
      completed_stops: []
    };

    const { error: testError } = await supabase
      .from('crawl_progress')
      .insert(testData);

    if (testError) {
      console.log('❌ Schema test failed:', testError.message);
      console.log('\n⚠️  You need to run the migration in Supabase SQL editor:');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of database/migrations/001_add_completed_stops_column.sql');
      console.log('4. Click "Run"');
    } else {
      console.log('✅ Schema test passed!');
      
      // Clean up test data
      await supabase
        .from('crawl_progress')
        .delete()
        .eq('user_id', 'test-user')
        .eq('crawl_id', 'test-crawl');
      
      console.log('✅ Migration completed successfully!');
    }

  } catch (error) {
    console.error('Error running migration:', error);
  }
}

runMigration(); 