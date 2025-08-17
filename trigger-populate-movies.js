// Script to populate monthly movie data
async function populateMovies() {
  const SUPABASE_URL = 'https://ibihfzhrsllndxhfwgvb.supabase.co';
  
  try {
    console.log('Starting movie population for 2025...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/populate_monthly_movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ year: 2025 })
    });
    
    const result = await response.json();
    console.log('Movie population result:', result);
    
    if (result.ok) {
      console.log(`✅ Successfully populated ${result.totalUpserted} movies for 2025`);
      console.log('Monthly breakdown:', result.monthlyResults);
    } else {
      console.error('❌ Movie population failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during movie population:', error);
  }
}

// Run immediately
populateMovies();