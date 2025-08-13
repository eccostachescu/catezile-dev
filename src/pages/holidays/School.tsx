import { useEffect, useState } from "react";
import { Calendar, Download } from "lucide-react";
import { SchoolCalendarGrid } from "@/components/holidays/SchoolCalendarGrid";
import { HolidaysAdRail } from "@/components/holidays/HolidaysAdRail";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/seo/SEO";

export default function SchoolCalendar() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentYear = new Date().getFullYear();
  const schoolYear = `${currentYear}-${currentYear + 1}`;

  useEffect(() => {
    const loadSchoolCalendar = async () => {
      try {
        const { data } = await supabase
          .from('school_calendar')
          .select('*')
          .eq('school_year', schoolYear)
          .order('starts_on');
        
        setPeriods(data || []);
      } catch (error) {
        console.error('Error loading school calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchoolCalendar();
  }, [schoolYear]);

  const handleDownloadICS = () => {
    // Generate ICS for all school periods
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://catezile.ro';
    // This would need a specific function for school calendar ICS
    console.log('Download school calendar ICS');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Calendar școlar ${schoolYear} — Module, vacanțe și examene`}
        description={`Calendarul complet școlar pentru anul ${schoolYear}: perioade de cursuri, vacanțe, teze și examene naționale.`}
      />

      <div className="container py-8 space-y-8">
        <header className="text-center space-y-4">
          <nav className="text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary">Acasă</a>
            <span className="mx-2">→</span>
            <a href="/sarbatori" className="hover:text-primary">Sărbători</a>
            <span className="mx-2">→</span>
            <span>Calendar școlar</span>
          </nav>
          
          <h1 className="text-4xl font-bold">
            Calendar școlar {schoolYear}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Module, vacanțe și perioade speciale pentru anul școlar curent
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="text-center py-12">Se încarcă calendarul...</div>
            ) : (
              <SchoolCalendarGrid periods={periods} schoolYear={schoolYear} />
            )}

            <div className="flex items-center gap-4">
              <button 
                onClick={handleDownloadICS}
                className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4" />
                Descarcă calendar ICS
              </button>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="sticky top-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Acces rapid
                </h3>
                <div className="space-y-2">
                  <a 
                    href="/sarbatori"
                    className="block text-sm hover:text-primary transition-colors"
                  >
                    Sărbători legale
                  </a>
                  <a 
                    href="/examene"
                    className="block text-sm hover:text-primary transition-colors"
                  >
                    Examene naționale
                  </a>
                </div>
              </div>
              
              <HolidaysAdRail placement="sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}