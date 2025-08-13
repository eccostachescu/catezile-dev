import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRoDate, fromNowRo } from "@/lib/date";
import ReminderButton from "@/components/ReminderButton";

interface ExamPhase {
  id: string;
  slug: string;
  name: string;
  starts_on: string;
  ends_on: string;
}

interface ExamTimelineProps {
  exam: {
    id: string;
    name: string;
    level: string;
    year: number;
  };
  phases: ExamPhase[];
}

export function ExamTimeline({ exam, phases }: ExamTimelineProps) {
  const today = new Date();
  
  const sortedPhases = phases.sort((a, b) => 
    new Date(a.starts_on).getTime() - new Date(b.starts_on).getTime()
  );

  const getPhaseStatus = (phase: ExamPhase) => {
    const startDate = new Date(phase.starts_on);
    const endDate = new Date(phase.ends_on);
    
    if (endDate < today) return 'completed';
    if (startDate <= today && endDate >= today) return 'active';
    return 'upcoming';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'active':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Finalizată';
      case 'active':
        return 'În desfășurare';
      default:
        return 'Viitoare';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'active':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timeline {exam.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {sortedPhases.map((phase, index) => {
            const status = getPhaseStatus(phase);
            const startDate = new Date(phase.starts_on);
            const endDate = new Date(phase.ends_on);
            const isLast = index === sortedPhases.length - 1;
            
            return (
              <div key={phase.id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-6 top-8 w-0.5 h-16 bg-border" />
                )}
                
                <div className="flex gap-4">
                  {/* Status icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-border bg-background flex items-center justify-center">
                    {getStatusIcon(status)}
                  </div>
                  
                  {/* Phase content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{phase.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={getStatusColor(status)}
                          >
                            {getStatusLabel(status)}
                          </Badge>
                        </div>
                      </div>
                      
                      {status === 'upcoming' && (
                        <ReminderButton
                          when={startDate}
                          kind="event"
                          entityId={phase.id}
                        />
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatRoDate(startDate, false)} - {formatRoDate(endDate, false)}
                        </span>
                      </div>
                      
                      {status === 'upcoming' && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{fromNowRo(startDate)}</span>
                        </div>
                      )}
                      
                      {status === 'active' && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" />
                          <span>Se termină {fromNowRo(endDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {phases.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nu sunt faze disponibile</h3>
            <p className="text-muted-foreground">
              Fazele pentru {exam.name} nu au fost încă programate.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}