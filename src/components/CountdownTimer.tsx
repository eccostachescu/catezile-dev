import * as React from "react";
import { cn } from "@/lib/utils";

export interface CountdownTimerProps extends React.HTMLAttributes<HTMLDivElement> {
  target: Date | string | number;
  ariaLabel?: string;
  onComplete?: () => void;
}

function getRemaining(targetMs: number) {
  const now = Date.now();
  const diff = Math.max(0, targetMs - now);
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);
  return { diff, days, hours, minutes, seconds };
}

export default function CountdownTimer({ target, className, ariaLabel, onComplete, ...props }: CountdownTimerProps) {
  const targetMs = React.useMemo(() => new Date(target).getTime(), [target]);
  const [state, setState] = React.useState(() => getRemaining(targetMs));
  const completedRef = React.useRef(false);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      const next = getRemaining(targetMs);
      setState(next);
      if (!completedRef.current && next.diff <= 0) {
        completedRef.current = true;
        onComplete?.();
        window.clearInterval(id);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [targetMs, onComplete]);

  const { days, hours, minutes, seconds, diff } = state;

  const label = ariaLabel ?? `Au mai rămas ${days} zile, ${hours} ore, ${minutes} minute și ${seconds} secunde`;

  const segment = (value: number, title: string) => (
    <div className="rounded-md border bg-muted/50 p-3 text-center">
      <div className="text-3xl sm:text-4xl font-semibold tabular-nums leading-none" aria-hidden>
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{title}</div>
    </div>
  );

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={label}
      className={cn("w-full", className)}
      {...props}
    >
      {diff <= 0 ? (
        <div className="rounded-md border bg-muted/40 p-4 text-center">
          <span className="font-medium">Timpul a expirat</span>
          <span className="sr-only"> – countdown complet</span>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {segment(days, "Zile")}
          {segment(hours, "Ore")}
          {segment(minutes, "Minute")}
          {segment(seconds, "Secunde")}
        </div>
      )}
    </div>
  );
}
