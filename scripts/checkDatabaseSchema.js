const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../env.template' });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('Please make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in your env.template file');
  console.log('You need to copy env.template to .env and fill in your actual Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseSchema() {
  try {
    console.log('Checking database schema...');
    
    // Try to get table info by attempting a simple query
    const { data, error } = await supabase
      .from('crawl_progress')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying crawl_progress table:', error);
      
      // If the table doesn't exist, let's check what tables do exist
      console.log('\nTrying to list all tables...');
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tablesError) {
        console.error('Error listing tables:', tablesError);
      } else {
        console.log('Available tables:', tables?.map(t => t.table_name) || []);
      }
    } else {
      console.log('crawl_progress table exists and is accessible');
      console.log('Sample data structure:', data?.[0] ? Object.keys(data[0]) : 'No data');
    }

    // Try to get column information
    console.log('\nTrying to get column information...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'crawl_progress');

    if (columnsError) {
      console.error('Error getting column info:', columnsError);
    } else {
      console.log('crawl_progress table columns:');
      columns?.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabaseSchema(); 