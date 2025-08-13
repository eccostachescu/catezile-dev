import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExamPhase {
  slug: string;
  name: string;
  starts_on: string;
  ends_on: string;
}

interface ExamData {
  year: number;
  level: 'BAC' | 'EN' | 'ADMITERE' | 'TEZE';
  name?: string;
  phases: ExamPhase[];
  official_ref?: string;
}

function validateExamData(data: ExamData): string[] {
  const errors = [];
  
  if (!data.year || data.year < 2020 || data.year > 2030) {
    errors.push('Year must be between 2020 and 2030');
  }
  
  if (!['BAC', 'EN', 'ADMITERE', 'TEZE'].includes(data.level)) {
    errors.push('Level must be BAC, EN, ADMITERE, or TEZE');
  }
  
  if (!data.phases || !Array.isArray(data.phases) || data.phases.length === 0) {
    errors.push('At least one phase is required');
  }
  
  data.phases?.forEach((phase, index) => {
    if (!phase.slug) errors.push(`Phase ${index + 1}: slug is required`);
    if (!phase.name) errors.push(`Phase ${index + 1}: name is required`);
    if (!phase.starts_on) errors.push(`Phase ${index + 1}: starts_on is required`);
    if (!phase.ends_on) errors.push(`Phase ${index + 1}: ends_on is required`);
    
    const startDate = new Date(phase.starts_on);
    const endDate = new Date(phase.ends_on);
    
    if (isNaN(startDate.getTime())) {
      errors.push(`Phase ${index + 1}: invalid start date`);
    }
    if (isNaN(endDate.getTime())) {
      errors.push(`Phase ${index + 1}: invalid end date`);
    }
    if (startDate >= endDate) {
      errors.push(`Phase ${index + 1}: start date must be before end date`);
    }
  });
  
  return errors;
}

function generateExamSlug(level: string, year: number): string {
  const levelMap = {
    'BAC': 'bac',
    'EN': 'en-viii',
    'ADMITERE': 'admitere',
    'TEZE': 'teze'
  };
  
  return `${levelMap[level as keyof typeof levelMap] || level.toLowerCase()}-${year}`;
}

function generateExamName(level: string, year: number): string {
  const nameMap = {
    'BAC': 'Bacalaureat',
    'EN': 'Evaluarea Națională clasa a VIII-a',
    'ADMITERE': 'Admitere liceu',
    'TEZE': 'Teze semestriale'
  };
  
  return `${nameMap[level as keyof typeof nameMap] || level} ${year}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const examData: ExamData = await req.json();

    // Validate exam data
    const validationErrors = validateExamData(examData);
    if (validationErrors.length > 0) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validationErrors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const examSlug = generateExamSlug(examData.level, examData.year);
    const examName = examData.name || generateExamName(examData.level, examData.year);

    // Upsert exam record
    const { data: exam, error: examError } = await supabase
      .from('exam')
      .upsert({
        slug: examSlug,
        name: examName,
        level: examData.level,
        year: examData.year,
        official_ref: examData.official_ref
      }, {
        onConflict: 'slug',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (examError) throw examError;

    // Delete existing phases for this exam
    const { error: deleteError } = await supabase
      .from('exam_phase')
      .delete()
      .eq('exam_id', exam.id);

    if (deleteError) throw deleteError;

    // Insert new phases
    const phasesToInsert = examData.phases.map(phase => ({
      exam_id: exam.id,
      slug: phase.slug,
      name: phase.name,
      starts_on: phase.starts_on,
      ends_on: phase.ends_on
    }));

    const { error: phasesError } = await supabase
      .from('exam_phase')
      .insert(phasesToInsert);

    if (phasesError) throw phasesError;

    console.log(`Imported exam ${examName} with ${examData.phases.length} phases`);

    return new Response(JSON.stringify({
      success: true,
      exam: {
        id: exam.id,
        slug: examSlug,
        name: examName,
        level: examData.level,
        year: examData.year
      },
      phases: phasesToInsert.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Error importing exam data:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});