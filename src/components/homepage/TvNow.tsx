import React from 'react';
import { Clock, Tv, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/cz-card';
import { Badge } from '@/components/ui/cz-badge';
import { Button } from '@/components/ui/cz-button';
import { cn } from '@/lib/utils';

interface TVMatch {
  id: string;
  title: string;
  channel: string;
  time: string;
  status: 'live' | 'upcoming';
  sport?: string;
}

interface TVProgram {
  id: string;
  title: string;
  channel: string;
  time: string;
  channelLogo?: string;
}

interface TvNowProps {
  liveMatches?: TVMatch[];
  upcomingPrograms?: TVProgram[];
  onTvClick?: () => void;
  className?: string;
}

export function TvNow({ liveMatches = [], upcomingPrograms = [], onTvClick, className }: TvNowProps) {
  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn("flex justify-center", className)}>
      {/* Live Now - Centered */}
      <Card className="p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <h3 className="font-heading font-semibold text-cz-foreground">
              Acum la TV Sport
            </h3>
          </div>
          <Tv className="h-5 w-5 text-cz-muted" />
        </div>

        {liveMatches.length > 0 ? (
          <div className="space-y-3">
            {liveMatches.slice(0, 3).map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 rounded-lg bg-cz-surface border border-cz-border">
                <div className="flex-1">
                  <div className="font-medium text-cz-foreground text-sm">
                    {match.title}
                  </div>
                  <div className="text-xs text-cz-muted flex items-center gap-2 mt-1">
                    <span>{match.channel}</span>
                    {match.sport && (
                      <>
                        <span>•</span>
                        <span>{match.sport}</span>
                      </>
                    )}
                  </div>
                </div>
                <Badge variant="live" className="text-xs">
                  LIVE
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-cz-muted">
            <Tv className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nu sunt meciuri live acum</p>
          </div>
        )}
      </Card>
    </div>
  );
}