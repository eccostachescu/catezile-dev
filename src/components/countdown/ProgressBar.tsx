import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  targetDate: string;
  startDate?: string; // When we started counting down (defaults to today - 1 year)
  className?: string;
}

export default function ProgressBar({ 
  targetDate, 
  startDate, 
  className 
}: ProgressBarProps) {
  const calculateProgress = (): { progress: number; description: string } => {
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    
    // Default start date is 1 year before target
    const start = startDate 
      ? new Date(startDate).getTime()
      : new Date(target - (365 * 24 * 60 * 60 * 1000)).getTime();

    const totalDuration = target - start;
    const elapsed = now - start;
    
    if (now >= target) {
      return { 
        progress: 100, 
        description: 'Evenimentul a avut loc!' 
      };
    }
    
    if (now <= start) {
      return { 
        progress: 0, 
        description: 'Numărătoarea nu a început încă' 
      };
    }

    const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const remainingDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    
    let description: string;
    if (remainingDays > 1) {
      description = `${remainingDays} zile rămase`;
    } else if (remainingDays === 1) {
      description = 'O zi rămasă';
    } else {
      const remainingHours = Math.ceil((target - now) / (1000 * 60 * 60));
      if (remainingHours > 1) {
        description = `${remainingHours} ore rămase`;
      } else {
        description = 'Mai puțin de o oră';
      }
    }

    return { 
      progress: progressPercent, 
      description 
    };
  };

  const { progress, description } = calculateProgress();

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Progres până la eveniment
          </h3>
          <span className="text-sm font-medium text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        
        <Progress 
          value={progress} 
          className="h-3"
        />
        
        <p className="text-sm text-muted-foreground text-center">
          {description}
        </p>
      </div>
    </Card>
  );
}