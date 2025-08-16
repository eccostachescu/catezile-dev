// Trigger the import directly
import { supabase } from "@/integrations/supabase/client";

const runImport = async () => {
  console.log('🚀 Starting import of international leagues...');
  
  try {
    const { data, error } = await supabase.functions.invoke('import_multi_leagues', {
      body: {
        league_codes: [
          'GB-PL',     // Premier League
          'ES-LL',     // La Liga  
          'IT-SA',     // Serie A
          'DE-BL',     // Bundesliga
          'FR-L1',     // Ligue 1
          'EU-CL',     // Champions League
          'EU-EL'      // Europa League
        ],
        season: 2024
      }
    });
    
    if (error) {
      console.error('❌ Import failed:', error);
      return { success: false, error };
    }
    
    console.log('✅ Import completed:', data);
    return { success: true, data };
    
  } catch (err) {
    console.error('❌ Import error:', err);
    return { success: false, error: err };
  }
};

// Auto-run the import
runImport().then(result => {
  if (result.success) {
    console.log('International leagues imported successfully!');
    // Reload the page to see new matches
    window.location.reload();
  } else {
    console.error('Import failed:', result.error);
  }
});