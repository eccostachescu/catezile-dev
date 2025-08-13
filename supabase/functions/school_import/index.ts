import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SchoolPeriod {
  name: string;
  kind: 'module' | 'vacation' | 'other';
  starts_on: string;
  ends_on: string;
  official_ref?: string;
}

function validatePeriod(period: SchoolPeriod): string[] {
  const errors = [];
  
  if (!period.name) errors.push('Name is required');
  if (!['module', 'vacation', 'other'].includes(period.kind)) {
    errors.push('Kind must be module, vacation, or other');
  }
  if (!period.starts_on) errors.push('Start date is required');
  if (!period.ends_on) errors.push('End date is required');
  
  const startDate = new Date(period.starts_on);
  const endDate = new Date(period.ends_on);
  
  if (isNaN(startDate.getTime())) errors.push('Invalid start date');
  if (isNaN(endDate.getTime())) errors.push('Invalid end date');
  if (startDate >= endDate) errors.push('Start date must be before end date');
  
  return errors;
}

function parseCSV(csvText: string): SchoolPeriod[] {
  const lines = csvText.trim().split('\n');
  const header = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const period: any = {};
    
    header.forEach((col, index) => {
      period[col] = values[index] || '';
    });
    
    return {
      name: period.name || period.nume,
      kind: period.kind || period.tip || 'other',
      starts_on: period.starts_on || period.incepe_la,
      ends_on: period.ends_on || period.se_termina_la,
      official_ref: period.official_ref || period.referinta_oficiala
    };
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const { schoolYear, source, csvData, jsonData, url } = body;

    if (!schoolYear) {
      throw new Error('School year is required (e.g., "2025-2026")');
    }

    let periods: SchoolPeriod[] = [];

    if (source === 'csv') {
      if (csvData) {
        periods = parseCSV(csvData);
      } else if (url) {
        const response = await fetch(url);
        const csvText = await response.text();
        periods = parseCSV(csvText);
      } else {
        throw new Error('CSV data or URL is required for CSV source');
      }
    } else if (source === 'json') {
      if (jsonData) {
        periods = Array.isArray(jsonData) ? jsonData : [jsonData];
      } else if (url) {
        const response = await fetch(url);
        periods = await response.json();
      } else {
        throw new Error('JSON data or URL is required for JSON source');
      }
    } else {
      throw new Error('Source must be "csv" or "json"');
    }

    // Validate all periods
    const validationErrors = [];
    for (let i = 0; i < periods.length; i++) {
      const errors = validatePeriod(periods[i]);
      if (errors.length > 0) {
        validationErrors.push(`Period ${i + 1}: ${errors.join(', ')}`);
      }
    }

    if (validationErrors.length > 0) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validationErrors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Delete existing periods for this school year
    const { error: deleteError } = await supabase
      .from('school_calendar')
      .delete()
      .eq('school_year', schoolYear);

    if (deleteError) throw deleteError;

    // Insert new periods
    const periodsToInsert = periods.map(period => ({
      ...period,
      school_year: schoolYear
    }));

    const { error: insertError } = await supabase
      .from('school_calendar')
      .insert(periodsToInsert);

    if (insertError) throw insertError;

    console.log(`Imported ${periods.length} school calendar periods for ${schoolYear}`);

    return new Response(JSON.stringify({
      success: true,
      schoolYear,
      imported: periods.length,
      periods: periodsToInsert
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Error importing school calendar:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});