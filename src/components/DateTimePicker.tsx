import * as React from "react";
import { format, setHours, setMinutes } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

export interface DateTimePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  className?: string;
}

export function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [localDate, setLocalDate] = React.useState<Date | undefined>(value);
  const [hour, setHour] = React.useState<number>(value ? value.getHours() : 12);
  const [minute, setMinute] = React.useState<number>(value ? value.getMinutes() : 0);

  React.useEffect(() => {
    setLocalDate(value);
    if (value) {
      setHour(value.getHours());
      setMinute(value.getMinutes());
    }
  }, [value]);

  const applyTime = (d?: Date) => {
    if (!d) return undefined;
    const withHour = setHours(d, hour);
    const withMinute = setMinutes(withHour, minute);
    return withMinute;
  };

  const handleSelect = (d?: Date) => {
    const next = applyTime(d);
    setLocalDate(next);
    onChange?.(next);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[260px] justify-start text-left font-normal",
            !localDate && "text-muted-foreground",
            className
          )}
          aria-label="Alege data și ora"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {localDate ? format(localDate, "PPP HH:mm") : <span>Alege data și ora</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex gap-3 p-3">
          <Calendar
            mode="single"
            selected={localDate}
            onSelect={handleSelect}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
          <div className="flex flex-col gap-2 p-1">
            <label className="text-xs text-muted-foreground">Ora (24h)</label>
            <div className="flex items-center gap-2">
              <select
                aria-label="Oră"
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={hour}
                onChange={(e) => {
                  const h = parseInt(e.target.value, 10);
                  setHour(h);
                  handleSelect(localDate ?? new Date());
                }}
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <span className="text-sm">:</span>
              <select
                aria-label="Minute"
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={minute}
                onChange={(e) => {
                  const m = parseInt(e.target.value, 10);
                  setMinute(m);
                  handleSelect(localDate ?? new Date());
                }}
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
