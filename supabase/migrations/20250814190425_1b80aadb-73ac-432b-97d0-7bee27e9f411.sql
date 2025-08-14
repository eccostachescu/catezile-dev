-- Call the populate function to ensure sport data is complete
SELECT * FROM supabase.functions.invoke('populate_real_data');