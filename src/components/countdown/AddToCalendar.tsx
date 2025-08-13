import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToCalendarProps {
  title: string;
  startDate: string;
  endDate?: string;
  description?: string;
  location?: string;
  url?: string;
  className?: string;
}

export default function AddToCalendar({
  title,
  startDate,
  endDate,
  description,
  location,
  url,
  className
}: AddToCalendarProps) {

  const formatDateForCalendar = (date: string): string => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const generateICSContent = (): string => {
    const start = formatDateForCalendar(startDate);
    const end = endDate ? formatDateForCalendar(endDate) : start;
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CateZile//CateZile Calendar//RO',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${now}-catezile@catezile.ro`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
      location ? `LOCATION:${location}` : '',
      url ? `URL:${url}` : '',
      `DTSTAMP:${now}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');

    return icsContent;
  };

  const downloadICS = () => {
    const icsContent = generateICSContent();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Track download
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calendar_add', {
        method: 'ics_download',
        content_type: 'countdown',
        item_id: title
      });
    }
  };

  const addToGoogleCalendar = () => {
    const start = formatDateForCalendar(startDate);
    const end = endDate ? formatDateForCalendar(endDate) : start;
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${start}/${end}`,
      details: description || `Urmărește countdown-ul pentru ${title}`,
      location: location || '',
      ctz: 'Europe/Bucharest'
    });

    if (url) {
      params.set('details', `${params.get('details')}\n\nVezi countdown-ul: ${url}`);
    }

    const googleUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
    window.open(googleUrl, '_blank');
    
    // Track Google Calendar add
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calendar_add', {
        method: 'google_calendar',
        content_type: 'countdown',
        item_id: title
      });
    }
  };

  const addToOutlook = () => {
    const start = new Date(startDate).toISOString();
    const end = endDate ? new Date(endDate).toISOString() : start;
    
    const params = new URLSearchParams({
      subject: title,
      startdt: start,
      enddt: end,
      body: description || `Urmărește countdown-ul pentru ${title}`,
      location: location || ''
    });

    if (url) {
      params.set('body', `${params.get('body')}\n\nVezi countdown-ul: ${url}`);
    }

    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
    window.open(outlookUrl, '_blank');
    
    // Track Outlook add
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calendar_add', {
        method: 'outlook',
        content_type: 'countdown',
        item_id: title
      });
    }
  };

  const addToAppleCalendar = () => {
    // Apple Calendar uses ICS files
    downloadICS();
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Adaugă în calendar
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Nu uita de eveniment! Adaugă-l în calendarul tău preferat.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={addToGoogleCalendar}
            className="gap-2 justify-start"
          >
            <ExternalLink className="h-4 w-4" />
            Google Calendar
          </Button>
          
          <Button
            variant="outline"
            onClick={addToOutlook}
            className="gap-2 justify-start"
          >
            <ExternalLink className="h-4 w-4" />
            Outlook
          </Button>
          
          <Button
            variant="outline"
            onClick={addToAppleCalendar}
            className="gap-2 justify-start"
          >
            <Download className="h-4 w-4" />
            Apple Calendar
          </Button>
          
          <Button
            variant="outline"
            onClick={downloadICS}
            className="gap-2 justify-start"
          >
            <Download className="h-4 w-4" />
            Descarcă ICS
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Formatul ICS funcționează cu majoritatea aplicațiilor de calendar.
        </p>
      </div>
    </Card>
  );
}