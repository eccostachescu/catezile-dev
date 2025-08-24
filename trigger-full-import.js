#!/usr/bin/env node

const SUPABASE_URL = 'https://ibihfzhrsllndxhfwgvb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaWhmemhyc2xsbmR4aGZ3Z3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzAyNTAsImV4cCI6MjA3MDUwNjI1MH0.Zqikiwqpgb4lksNXcAdLA3fQzZwfV4WwFYzxpAwxCoU';

async function runFullImport() {
  console.log('🚀 Starting comprehensive data import...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/populate_real_data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Import completed successfully:', result);
    } else {
      const error = await response.text();
      console.error('❌ Import failed:', response.status, error);
    }
    
  } catch (error) {
    console.error('💥 Error during import:', error);
  }
}

// Run the import
runFullImport();