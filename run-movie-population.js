// Re-run movie population with full 2025 data
console.log('🚀 Starting comprehensive 2025 movie population...');

const SUPABASE_URL = 'https://ibihfzhrsllndxhfwgvb.supabase.co';

async function runPopulation() {
  try {
    // First, run the monthly population
    console.log('📅 Running monthly population...');
    const monthlyResponse = await fetch(`${SUPABASE_URL}/functions/v1/populate_monthly_movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: 2025 })
    });
    
    const monthlyResult = await monthlyResponse.json();
    console.log('Monthly result:', monthlyResult);
    
    // Then run the general import for additional coverage
    console.log('🎬 Running general movie import...');
    const importResponse = await fetch(`${SUPABASE_URL}/functions/v1/import_tmdb_movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages: 10, year: 2025 })
    });
    
    const importResult = await importResponse.json();
    console.log('Import result:', importResult);
    
    console.log('✅ Movie population completed!');
    
  } catch (error) {
    console.error('❌ Error during movie population:', error);
  }
}

runPopulation();