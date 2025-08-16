// Simple script to trigger data population
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://ibihfzhrsllndxhfwgvb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaWhmemhyc2xsbmR4aGZ3Z3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzAyNTAsImV4cCI6MjA3MDUwNjI1MH0.Zqikiwqpgb4lksNXcAdLA3fQzZwfV4WwFYzxpAwxCoU"
);

console.log('🚀 Triggering data population...');

try {
  const { data, error } = await supabase.functions.invoke('populate_real_data');
  
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Success:', data);
  }
} catch (err) {
  console.error('❌ Failed:', err);
}