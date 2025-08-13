import { Calendar, Clock, Book } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRoDate } from "@/lib/date";

interface SchoolPeriod {
  id: string;
  name: string;
  kind: 'module' | 'vacation' | 'other';
  starts_on: string;
  ends_on: string;
  official_ref?: string;
}

interface SchoolCalendarGridProps {
  periods: SchoolPeriod[];
  schoolYear: string;
}

export function SchoolCalendarGrid({ periods, schoolYear }: SchoolCalendarGridProps) {
  const getKindLabel = (kind: string) => {
    const labels = {
      module: 'Modul',
      vacation: 'Vacanță',
      other: 'Altele'
    };
    return labels[kind as keyof typeof labels] || kind;
  };

  const getKindColor = (kind: string) => {
    const colors = {
      module: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      vacation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };
    return colors[kind as keyof typeof colors] || colors.other;
  };

  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'module':
        return <Book className="h-4 w-4" />;
      case 'vacation':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const sortedPeriods = periods.sort((a, b) => 
    new Date(a.starts_on).getTime() - new Date(b.starts_on).getTime()
  );

  // Group periods by kind
  const groupedPeriods = sortedPeriods.reduce((acc, period) => {
    if (!acc[period.kind]) {
      acc[period.kind] = [];
    }
    acc[period.kind].push(period);
    return acc;
  }, {} as Record<string, SchoolPeriod[]>);

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Calendar școlar {schoolYear}</h2>
        <p className="text-muted-foreground">
          Module, vacanțe și perioade speciale
        </p>
      </div>

      {Object.entries(groupedPeriods).map(([kind, periodList]) => (
        <section key={kind}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {getKindIcon(kind)}
            {getKindLabel(kind)} ({periodList.length})
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {periodList.map((period) => (
              <Card key={period.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base leading-5">
                      {period.name}
                    </CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={getKindColor(period.kind)}
                    >
                      {getKindLabel(period.kind)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {formatRoDate(new Date(period.starts_on), false)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-3 text-center">→</span>
                      <span>
                        {formatRoDate(new Date(period.ends_on), false)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {calculateDuration(period.starts_on, period.ends_on)} zile
                    </Badge>
                    
                    {period.official_ref && (
                      <a
                        href={period.official_ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Sursă oficială
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {periods.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nu sunt perioade disponibile</h3>
          <p className="text-muted-foreground">
            Calendarul școlar pentru {schoolYear} nu a fost încă disponibilizat.
          </p>
        </div>
      )}
    </div>
  );
}