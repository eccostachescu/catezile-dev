import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AltUnitsProps {
  targetDate: string;
  className?: string;
}

interface UnitDisplay {
  value: number;
  label: string;
  description: string;
}

export default function AltUnits({ targetDate, className }: AltUnitsProps) {
  const calculateUnits = (): UnitDisplay[] => {
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
      return [
        { value: 0, label: 'zile', description: 'Evenimentul a avut loc' },
        { value: 0, label: 'ore', description: 'Evenimentul a avut loc' },
        { value: 0, label: 'minute', description: 'Evenimentul a avut loc' },
        { value: 0, label: 'săptămâni', description: 'Evenimentul a avut loc' },
        { value: 0, label: 'luni', description: 'Evenimentul a avut loc' }
      ];
    }

    const totalMinutes = Math.floor(difference / (1000 * 60));
    const totalHours = Math.floor(difference / (1000 * 60 * 60));
    const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = Math.floor(totalDays / 30.44); // Average days in month

    return [
      { 
        value: totalDays, 
        label: totalDays === 1 ? 'zi' : 'zile',
        description: 'până la eveniment'
      },
      { 
        value: totalHours, 
        label: totalHours === 1 ? 'oră' : 'ore',
        description: 'până la eveniment'
      },
      { 
        value: totalMinutes, 
        label: totalMinutes === 1 ? 'minut' : 'minute',
        description: 'până la eveniment'
      },
      { 
        value: totalWeeks, 
        label: totalWeeks === 1 ? 'săptămână' : 'săptămâni',
        description: 'până la eveniment'
      },
      { 
        value: totalMonths, 
        label: totalMonths === 1 ? 'lună' : 'luni',
        description: 'până la eveniment'
      }
    ].filter(unit => unit.value > 0); // Only show non-zero units
  };

  const units = calculateUnits();

  if (units.length === 0) {
    return null;
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ro-RO').format(num);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Unități alternative
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {units.map((unit, index) => (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-primary">
                {formatNumber(unit.value)}
              </div>
              <div className="text-sm font-medium text-foreground">
                {unit.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {unit.description}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}