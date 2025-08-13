import { useEffect, useState } from "react";
import { Calendar, GraduationCap, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HolidayList } from "@/components/holidays/HolidayList";
import { BridgesCalculator } from "@/components/holidays/BridgesCalculator";
import { HolidaysAdRail } from "@/components/holidays/HolidaysAdRail";
import { supabase } from "@/integrations/supabase/client";

export default function HolidaysHome() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const { data } = await supabase
          .from('holiday_instance')
          .select(`
            *,
            holiday:holiday_id (*)
          `)
          .in('year', [currentYear, currentYear + 1])
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date');
        
        setHolidays(data || []);
      } catch (error) {
        console.error('Error loading holidays:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHolidays();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Sărbători legale în România
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Calendarul complet al sărbătorilor legale, religioase și naționale pentru {currentYear} și {currentYear + 1}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="text-center py-12">Se încarcă sărbătorile...</div>
            ) : (
              <HolidayList instances={holidays} showYear />
            )}

            <BridgesCalculator holidays={holidays} />
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Acces rapid
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <a 
                  href="/calendar-scolar"
                  className="flex items-center gap-2 p-3 rounded-md hover:bg-muted transition-colors"
                >
                  <GraduationCap className="h-4 w-4" />
                  Calendar școlar
                </a>
                <a 
                  href="/examene"
                  className="flex items-center gap-2 p-3 rounded-md hover:bg-muted transition-colors"
                >
                  <Calculator className="h-4 w-4" />
                  Examene naționale
                </a>
              </CardContent>
            </Card>

            <HolidaysAdRail placement="sidebar" />
          </aside>
        </div>
      </div>
    </div>
  );
}