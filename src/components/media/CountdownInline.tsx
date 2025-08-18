"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CountdownInlineProps {
  startsAt: string;
  className?: string;
}

function getTimeRemaining(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { expired: true, text: "Acum", progress: 100 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  // Check if it's today and get time
  const isToday = days === 0;
  const isTomorrow = days === 1;
  
  let text = "";
  let progress = 0;
  
  if (isToday) {
    if (hours === 0) {
      text = `în ${minutes}m`;
    } else {
      text = `astăzi la ${targetDate.toLocaleTimeString('ro-RO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    // Progress for today (24 hours)
    const totalMinutesInDay = 24 * 60;
    const elapsedToday = (now.getHours() * 60) + now.getMinutes();
    const targetMinutes = (targetDate.getHours() * 60) + targetDate.getMinutes();
    progress = Math.max(0, Math.min(100, (elapsedToday / targetMinutes) * 100));
  } else if (isTomorrow) {
    text = `mâine la ${targetDate.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  } else if (days < 7) {
    if (hours > 0) {
      text = `în ${days} ${days === 1 ? 'zi' : 'zile'} ${hours}h`;
    } else {
      text = `în ${days} ${days === 1 ? 'zi' : 'zile'}`;
    }
  } else {
    text = `în ${days} ${days === 1 ? 'zi' : 'zile'}`;
  }

  return { expired: false, text, progress, isToday };
}

export function CountdownInline({ startsAt, className }: CountdownInlineProps) {
  const [timeData, setTimeData] = React.useState(() => 
    getTimeRemaining(new Date(startsAt))
  );
  const [isVisible, setIsVisible] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  // Intersection Observer to pause updates when not visible
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!isVisible || timeData.expired) return;

    const interval = setInterval(() => {
      setTimeData(getTimeRemaining(new Date(startsAt)));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startsAt, isVisible, timeData.expired]);

  return (
    <div ref={elementRef} className={cn("space-y-1", className)}>
      <div className="text-sm font-medium text-[#0A1020]">
        {timeData.text}
      </div>
      
      {/* Progress bar for events < 24h */}
      {timeData.isToday && !timeData.expired && (
        <div className="w-full bg-[#E8EBF3] rounded-full h-1">
          <div
            className="bg-[#5B8CFF] h-1 rounded-full transition-all duration-300"
            style={{ width: `${timeData.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}