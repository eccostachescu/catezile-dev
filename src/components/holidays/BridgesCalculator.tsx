import { useState, useMemo } from "react";
import { Calculator, Calendar, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { buildIcs } from "@/lib/ics";

interface HolidayInstance {
  id: string;
  date: string;
  holiday: {
    name: string;
    slug: string;
  };
}

interface BridgeOption {
  holidayName: string;
  holidayDate: Date;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  vacationDays: number;
  score: number;
  description: string;
}

interface BridgesCalculatorProps {
  holidays: HolidayInstance[];
}

export function BridgesCalculator({ holidays }: BridgesCalculatorProps) {
  const [availableVacationDays, setAvailableVacationDays] = useState<number>(10);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [preferLongWeekends, setPreferLongWeekends] = useState<boolean>(true);

  const bridgeOptions = useMemo(() => {
    const options: BridgeOption[] = [];
    const yearFilter = parseInt(selectedYear);
    
    holidays
      .filter(h => new Date(h.date).getFullYear() === yearFilter)
      .forEach(holiday => {
        const holidayDate = new Date(holiday.date);
        const dayOfWeek = holidayDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Skip if already weekend
        if (dayOfWeek === 0 || dayOfWeek === 6) return;
        
        // Thursday holiday -> take Friday
        if (dayOfWeek === 4) {
          const endDate = new Date(holidayDate);
          endDate.setDate(endDate.getDate() + 3); // Thu + Fri + Sat + Sun
          
          options.push({
            holidayName: holiday.holiday.name,
            holidayDate,
            startDate: new Date(holidayDate),
            endDate,
            totalDays: 4,
            vacationDays: 1,
            score: 4, // 4 days for 1 vacation day
            description: `Ia vineri liberă pentru un weekend de 4 zile`
          });
        }
        
        // Tuesday holiday -> take Monday
        if (dayOfWeek === 2) {
          const startDate = new Date(holidayDate);
          startDate.setDate(startDate.getDate() - 1); // Monday
          const endDate = new Date(holidayDate);
          endDate.setDate(endDate.getDate() + 2); // Tue + Wed + Thu (until Sunday)
          
          options.push({
            holidayName: holiday.holiday.name,
            holidayDate,
            startDate,
            endDate,
            totalDays: 4,
            vacationDays: 1,
            score: 4,
            description: `Ia luni liberă pentru un weekend de 4 zile`
          });
        }
        
        // Wednesday holiday -> create 5-day bridge
        if (dayOfWeek === 3) {
          const startDate = new Date(holidayDate);
          startDate.setDate(startDate.getDate() - 1); // Tuesday
          const endDate = new Date(holidayDate);
          endDate.setDate(endDate.getDate() + 4); // Wed + Thu + Fri + Sat + Sun
          
          options.push({
            holidayName: holiday.holiday.name,
            holidayDate,
            startDate,
            endDate,
            totalDays: 5,
            vacationDays: 2,
            score: 2.5, // 5 days for 2 vacation days
            description: `Ia marți și joi liberă pentru o minivacanță de 5 zile`
          });
        }
        
        // Monday/Friday holidays - already long weekends
        if (dayOfWeek === 1 || dayOfWeek === 5) {
          const isMonday = dayOfWeek === 1;
          const startDate = isMonday 
            ? new Date(holidayDate.getTime() - 2 * 24 * 60 * 60 * 1000) // Start from Saturday
            : new Date(holidayDate);
          const endDate = isMonday 
            ? new Date(holidayDate)
            : new Date(holidayDate.getTime() + 2 * 24 * 60 * 60 * 1000); // End on Sunday
          
          options.push({
            holidayName: holiday.holiday.name,
            holidayDate,
            startDate,
            endDate,
            totalDays: 3,
            vacationDays: 0,
            score: Infinity, // Free long weekend
            description: `Weekend prelungit natural de 3 zile`
          });
        }
      });
    
    // Filter by available vacation days and sort by score
    return options
      .filter(option => option.vacationDays <= availableVacationDays)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 options
  }, [holidays, selectedYear, availableVacationDays]);

  const handleDownloadICS = (option: BridgeOption) => {
    const ics = buildIcs({
      title: `Minivacanță - ${option.holidayName}`,
      start: option.startDate,
      end: option.endDate,
      url: `${window.location.origin}/sarbatori`
    });
    
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minivacanta-${option.holidayName.toLowerCase().replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const availableYears = Array.from(new Set(
    holidays.map(h => new Date(h.date).getFullYear().toString())
  )).sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculator punți
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="vacation-days">Zile concediu disponibile</Label>
            <Input
              id="vacation-days"
              type="number"
              min="0"
              max="50"
              value={availableVacationDays}
              onChange={(e) => setAvailableVacationDays(parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="year">An</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2 pt-8">
            <Checkbox
              id="prefer-weekends"
              checked={preferLongWeekends}
              onCheckedChange={(checked) => setPreferLongWeekends(checked as boolean)}
            />
            <Label htmlFor="prefer-weekends" className="text-sm">
              Preferă weekend-uri lungi
            </Label>
          </div>
        </div>

        {bridgeOptions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nu sunt opțiuni de punți disponibile pentru criteriile selectate.
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-medium">Top recomandări ({bridgeOptions.length})</h4>
            
            <div className="space-y-3">
              {bridgeOptions.map((option, index) => (
                <div 
                  key={index}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium">{option.holidayName}</h5>
                      <p className="text-sm text-muted-foreground">
                        {option.startDate.toLocaleDateString('ro-RO')} - {option.endDate.toLocaleDateString('ro-RO')}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {option.totalDays} zile
                      </Badge>
                      {option.vacationDays > 0 && (
                        <Badge variant="outline">
                          {option.vacationDays} concediu
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm">{option.description}</p>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownloadICS(option)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Descarcă ICS
                    </Button>
                    
                    <Button size="sm" variant="ghost">
                      <Calendar className="h-3 w-3 mr-1" />
                      Vezi detalii
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}