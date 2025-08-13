import { Calendar, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRoDate } from "@/lib/date";
import ReminderButton from "@/components/ReminderButton";

interface HolidayCardProps {
  holiday: {
    id: string;
    name: string;
    slug: string;
    kind: string;
    description?: string;
  };
  instance: {
    date: string;
    date_end?: string;
    is_weekend: boolean;
    year: number;
  };
  showYear?: boolean;
}

export function HolidayCard({ holiday, instance, showYear = false }: HolidayCardProps) {
  const date = new Date(instance.date);
  const isMultiDay = instance.date_end && instance.date_end !== instance.date;
  
  const handleICSDownload = () => {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://catezile.ro';
    const icsUrl = `${siteUrl}/functions/v1/ics_event/${holiday.id}?kind=holiday`;
    window.open(icsUrl, '_blank');
  };

  const getKindLabel = (kind: string) => {
    const labels = {
      legal: 'Legală',
      religious: 'Religioasă', 
      national: 'Națională',
      observance: 'Comemorare'
    };
    return labels[kind as keyof typeof labels] || kind;
  };

  const getKindColor = (kind: string) => {
    const colors = {
      legal: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      religious: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      national: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      observance: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };
    return colors[kind as keyof typeof colors] || colors.observance;
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-6">
            <a 
              href={`/sarbatori/${holiday.slug}`}
              className="hover:text-primary transition-colors"
            >
              {holiday.name}
            </a>
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary" className={getKindColor(holiday.kind)}>
              {getKindLabel(holiday.kind)}
            </Badge>
            {instance.is_weekend && (
              <Badge variant="outline">Weekend</Badge>
            )}
            {isMultiDay && (
              <Badge variant="outline">2 zile</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {formatRoDate(date, false)}
            {showYear && ` ${instance.year}`}
            {isMultiDay && ` - ${formatRoDate(new Date(instance.date_end!), false)}`}
          </span>
        </div>

        {holiday.description && (
          <p className="text-sm text-muted-foreground">
            {holiday.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          <ReminderButton
            when={date}
            kind="event"
            entityId={holiday.id}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleICSDownload}
            className="h-8"
          >
            <Download className="h-3 w-3 mr-1" />
            ICS
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}