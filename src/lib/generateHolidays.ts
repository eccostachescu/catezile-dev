import { supabase } from "@/integrations/supabase/client";

export async function generateHolidayInstances() {
  try {
    const response = await supabase.functions.invoke('holidays_generate', {
      body: { 
        fromYear: 2024, 
        toYear: 2026 
      }
    });
    
    if (response.error) {
      console.error('Error generating holidays:', response.error);
      return false;
    }
    
    console.log('Successfully generated holiday instances:', response.data);
    return true;
  } catch (error) {
    console.error('Error calling holidays_generate:', error);
    return false;
  }
}