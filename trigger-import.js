import { supabase } from './src/integrations/supabase/client.js';

console.log('🚀 Triggering comprehensive data import...');

async function runDataImport() {
  try {
    const { data, error } = await supabase.functions.invoke('populate_real_data', {
      body: {}
    });
    
    if (error) {
      console.error('❌ Import failed:', error);
      return;
    }
    
    console.log('✅ Import completed successfully:', data);
    
    // Check final counts
    const [movieCount, matchCount, holidayCount] = await Promise.all([
      supabase.from('movie').select('id', { count: 'exact' }),
      supabase.from('match').select('id', { count: 'exact' }),
      supabase.from('holiday_instance').select('id', { count: 'exact' })
    ]);
    
    console.log('📊 Final counts:');
    console.log(`- Movies: ${movieCount.count}`);
    console.log(`- Matches: ${matchCount.count}`);
    console.log(`- Holiday instances: ${holidayCount.count}`);
    
  } catch (err) {
    console.error('❌ Import error:', err);
  }
}

runDataImport();