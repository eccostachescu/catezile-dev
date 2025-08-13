import { HolidayCard } from "./HolidayCard";

interface HolidayInstance {
  id: string;
  date: string;
  date_end?: string;
  is_weekend: boolean;
  year: number;
  holiday: {
    id: string;
    name: string;
    slug: string;
    kind: string;
    description?: string;
  };
}

interface HolidayListProps {
  instances: HolidayInstance[];
  showYear?: boolean;
}

export function HolidayList({ instances, showYear = false }: HolidayListProps) {
  // Group holidays by month
  const groupedByMonth = instances.reduce((acc, instance) => {
    const date = new Date(instance.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: date.getMonth(),
        year: date.getFullYear(),
        instances: []
      };
    }
    
    acc[monthKey].instances.push(instance);
    return acc;
  }, {} as Record<string, { month: number; year: number; instances: HolidayInstance[] }>);

  const monthNames = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];

  const sortedMonths = Object.entries(groupedByMonth).sort(([a], [b]) => a.localeCompare(b));

  if (instances.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nu sunt sărbători găsite pentru perioada selectată.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedMonths.map(([monthKey, group]) => (
        <section key={monthKey}>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            {monthNames[group.month]} {showYear && group.year}
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {group.instances
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((instance) => (
                <HolidayCard
                  key={instance.id}
                  holiday={instance.holiday}
                  instance={instance}
                  showYear={showYear}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}