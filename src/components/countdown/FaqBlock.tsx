import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQ {
  question: string;
  answer: string;
  id: string;
}

interface FaqBlockProps {
  title: string;
  startDate: string;
  type?: 'event' | 'sport' | 'movie' | 'holiday';
  customFaqs?: FAQ[];
  className?: string;
}

export default function FaqBlock({
  title,
  startDate,
  type = 'event',
  customFaqs = [],
  className
}: FaqBlockProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
    
    // Track FAQ interaction
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'faq_expand', {
        faq_id: id,
        event_title: title
      });
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Bucharest'
    };
    return date.toLocaleDateString('ro-RO', options);
  };

  const calculateDays = (): number => {
    const target = new Date(startDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  const calculateWeeks = (): number => {
    return Math.ceil(calculateDays() / 7);
  };

  const calculateHours = (): number => {
    const target = new Date(startDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;
    return Math.ceil(difference / (1000 * 60 * 60));
  };

  const getWeekday = (): string => {
    const date = new Date(startDate);
    const weekdays = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];
    return weekdays[date.getDay()];
  };

  const generateDefaultFaqs = (): FAQ[] => {
    const days = calculateDays();
    const weeks = calculateWeeks();
    const hours = calculateHours();
    const formattedDate = formatDate(startDate);
    const weekday = getWeekday();

    const baseFaqs: FAQ[] = [
      {
        id: 'days-remaining',
        question: `Câte zile sunt până la ${title}?`,
        answer: days > 0 
          ? `Până la ${title} mai sunt ${days} ${days === 1 ? 'zi' : 'zile'}.`
          : `${title} a avut loc sau este în desfășurare.`
      },
      {
        id: 'when-exact',
        question: `Când are loc ${title} în România (ora oficială)?`,
        answer: `${title} are loc în ${formattedDate}, ora României (GMT+2/GMT+3).`
      },
      {
        id: 'weekday',
        question: `${title} pică în ce zi a săptămânii?`,
        answer: `${title} va avea loc ${weekday}.`
      }
    ];

    if (weeks > 0) {
      baseFaqs.push({
        id: 'weeks-remaining',
        question: `Câte săptămâni rămân până la ${title}?`,
        answer: `Până la ${title} mai sunt aproximativ ${weeks} ${weeks === 1 ? 'săptămână' : 'săptămâni'}.`
      });
    }

    if (hours > 0 && days < 7) {
      baseFaqs.push({
        id: 'hours-remaining',
        question: `Câte ore rămân până la ${title}?`,
        answer: `Până la ${title} mai sunt aproximativ ${hours} ${hours === 1 ? 'oră' : 'ore'}.`
      });
    }

    // Type-specific FAQs
    if (type === 'sport') {
      baseFaqs.push({
        id: 'where-watch',
        question: `Unde pot urmări ${title}?`,
        answer: `Poți urmări ${title} pe canalele TV menționate pe această pagină sau prin serviciile de streaming disponibile.`
      });
    } else if (type === 'movie') {
      baseFaqs.push({
        id: 'where-watch-movie',
        question: `Unde pot vedea ${title}?`,
        answer: `${title} va fi disponibil la cinema și pe platformele de streaming menționate pe această pagină.`
      });
    } else if (type === 'holiday') {
      baseFaqs.push({
        id: 'free-day',
        question: `${title} este zi liberă legală?`,
        answer: `Verifică calendarul oficial pentru a confirma dacă ${title} este zi liberă legală în România.`
      });
    }

    return baseFaqs;
  };

  const allFaqs = [...generateDefaultFaqs(), ...customFaqs];

  if (allFaqs.length === 0) {
    return null;
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Întrebări frecvente
          </h3>
        </div>
        
        <div className="space-y-3">
          {allFaqs.map((faq) => (
            <Collapsible key={faq.id}>
              <CollapsibleTrigger
                onClick={() => toggleItem(faq.id)}
                className="flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
              >
                <span className="font-medium text-foreground">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    openItems.has(faq.id) && "rotate-180"
                  )} 
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 pt-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground">
          Ai o întrebare care nu este listată aici? Contactează-ne pentru mai multe informații.
        </p>
      </div>
    </Card>
  );
}