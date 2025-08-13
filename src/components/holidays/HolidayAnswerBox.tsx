import { Calendar, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatRoDate, fromNowRo } from "@/lib/date";

interface BridgeRecommendation {
  type: string;
  days_off: number;
  total_days: number;
  description: string;
}

interface HolidayAnswerBoxProps {
  holiday: {
    name: string;
    kind: string;
  };
  nextInstance?: {
    date: string;
    is_weekend: boolean;
    year: number;
  };
  daysUntil?: number;
  bridgeRecommendations: BridgeRecommendation[];
}

export function HolidayAnswerBox({ 
  holiday, 
  nextInstance, 
  daysUntil, 
  bridgeRecommendations 
}: HolidayAnswerBoxProps) {
  if (!nextInstance) {
    return (
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          Nu există instanțe viitoare pentru această sărbătoare.
        </AlertDescription>
      </Alert>
    );
  }

  const date = new Date(nextInstance.date);
  const dayOfWeek = date.toLocaleDateString('ro-RO', { weekday: 'long' });

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Câte zile până la {holiday.name}?
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {daysUntil !== undefined && daysUntil >= 0 ? (
              <>
                {daysUntil}
                <span className="text-lg font-normal ml-2">
                  {daysUntil === 1 ? 'zi' : 'zile'}
                </span>
              </>
            ) : (
              <span className="text-lg">A trecut</span>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-lg">
              <strong>{formatRoDate(date, false)}</strong> ({dayOfWeek})
            </p>
            
            <div className="flex items-center justify-center gap-2">
              {nextInstance.is_weekend && (
                <Badge variant="secondary">Pică în weekend</Badge>
              )}
              <Badge variant="outline">
                {nextInstance.year}
              </Badge>
            </div>
            
            {daysUntil !== undefined && daysUntil > 0 && (
              <p className="text-sm text-muted-foreground">
                {fromNowRo(date)}
              </p>
            )}
          </div>
        </div>

        {bridgeRecommendations.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="flex items-center gap-2 font-medium mb-3">
              <TrendingUp className="h-4 w-4" />
              Recomandări pentru punți
            </h4>
            
            <div className="space-y-2">
              {bridgeRecommendations.map((rec, index) => (
                <div 
                  key={index}
                  className="p-3 bg-background rounded-md border"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      {rec.total_days} zile libere
                    </span>
                    {rec.days_off > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {rec.days_off} {rec.days_off === 1 ? 'zi' : 'zile'} concediu
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}