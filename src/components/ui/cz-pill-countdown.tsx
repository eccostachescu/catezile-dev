import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./cz-badge";

interface PillCountdownProps {
  date: string;
  status?: "live" | "upcoming" | "past";
  className?: string;
}

function PillCountdown({ date, status = "upcoming", className }: PillCountdownProps) {
  const [timeLeft, setTimeLeft] = React.useState<string>("");

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const targetDate = new Date(date);
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        if (status === "live") {
          return "LIVE acum";
        }
        return "Trecut";
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        if (days === 1) {
          return `mâine`;
        } else if (days <= 7) {
          return `în ${days} zile`;
        } else {
          return `în ${days} zile`;
        }
      } else if (hours > 0) {
        return `în ${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `în ${minutes}m`;
      } else {
        return "Acum";
      }
    };

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [date, status]);

  const getVariant = () => {
    if (status === "live") return "live";
    if (timeLeft === "Trecut") return "neutral";
    if (timeLeft.includes("zile")) return "event";
    return "sport";
  };

  const getDisplayText = () => {
    if (status === "live") return "LIVE";
    return timeLeft;
  };

  return (
    <Badge
      variant={getVariant()}
      className={cn("text-xs font-medium", className)}
    >
      {getDisplayText()}
    </Badge>
  );
}

export { PillCountdown };