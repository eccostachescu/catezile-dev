import { Calendar, FileText, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRoDate } from "@/lib/date";
import ReminderButton from "@/components/ReminderButton";

interface ExamPhase {
  id: string;
  slug: string;
  name: string;
  starts_on: string;
  ends_on: string;
}

interface ExamCardProps {
  exam: {
    id: string;
    slug: string;
    name: string;
    level: string;
    year: number;
    official_ref?: string;
  };
  phases: ExamPhase[];
}

export function ExamCard({ exam, phases }: ExamCardProps) {
  const getLevelColor = (level: string) => {
    const colors = {
      BAC: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      EN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      ADMITERE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      TEZE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLevelLabel = (level: string) => {
    const labels = {
      BAC: 'Bacalaureat',
      EN: 'Evaluarea Națională',
      ADMITERE: 'Admitere',
      TEZE: 'Teze'
    };
    return labels[level as keyof typeof labels] || level;
  };

  // Sort phases by start date
  const sortedPhases = phases.sort((a, b) => 
    new Date(a.starts_on).getTime() - new Date(b.starts_on).getTime()
  );

  // Find next upcoming phase
  const today = new Date();
  const nextPhase = sortedPhases.find(phase => 
    new Date(phase.starts_on) > today
  );

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-6">
            <a 
              href={`/examene/${exam.slug}`}
              className="hover:text-primary transition-colors"
            >
              {exam.name}
            </a>
          </CardTitle>
          <Badge variant="secondary" className={getLevelColor(exam.level)}>
            {getLevelLabel(exam.level)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {nextPhase && (
          <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Următoarea fază</span>
            </div>
            <p className="text-sm">{nextPhase.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatRoDate(new Date(nextPhase.starts_on), false)} - {formatRoDate(new Date(nextPhase.ends_on), false)}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Faze ({phases.length})</h4>
          <div className="space-y-1">
            {sortedPhases.slice(0, 3).map((phase) => {
              const startDate = new Date(phase.starts_on);
              const isPast = startDate < today;
              
              return (
                <div 
                  key={phase.id}
                  className={`text-xs p-2 rounded border ${
                    isPast ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{phase.name}</span>
                    {!isPast && nextPhase?.id === phase.id && (
                      <Badge variant="outline" className="text-xs">Următoarea</Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    {formatRoDate(startDate, false)} - {formatRoDate(new Date(phase.ends_on), false)}
                  </div>
                </div>
              );
            })}
            
            {phases.length > 3 && (
              <div className="text-xs text-muted-foreground text-center pt-1">
                +{phases.length - 3} faze suplimentare
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {nextPhase && (
            <ReminderButton
              when={new Date(nextPhase.starts_on)}
              kind="event"
              entityId={exam.id}
            />
          )}
          
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={`/examene/${exam.slug}`}>
              <FileText className="h-3 w-3 mr-1" />
              Vezi detalii
            </a>
          </Button>
          
          {exam.official_ref && (
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a 
                href={exam.official_ref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Oficial
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}