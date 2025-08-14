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
  className?: string;
}

export function TvNow({ liveMatches = [], upcomingPrograms = [], className }: TvNowProps) {
  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn("grid md:grid-cols-2 gap-6", className)}>
      {/* Live Now */}
      <Card className="p-6">
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

      {/* Upcoming */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cz-muted" />
            <h3 className="font-heading font-semibold text-cz-foreground">
              În următoarele 3 ore
            </h3>
          </div>
          <Link to="/tv">
            <Button
              variant="ghost"
              size="sm"
              icon={<ExternalLink className="h-3 w-3" />}
              iconPosition="trailing"
            >
              Vezi tot
            </Button>
          </Link>
        </div>

        {upcomingPrograms.length > 0 ? (
          <div className="space-y-3">
            {upcomingPrograms.slice(0, 6).map((program) => (
              <div key={program.id} className="flex items-center gap-3">
                {/* Channel Logo */}
                <div className="flex-shrink-0 w-8 h-8 rounded bg-cz-surface border border-cz-border flex items-center justify-center">
                  {program.channelLogo ? (
                    <img 
                      src={program.channelLogo} 
                      alt={program.channel}
                      className="w-6 h-6 object-contain filter grayscale"
                    />
                  ) : (
                    <Tv className="h-4 w-4 text-cz-muted" />
                  )}
                </div>

                {/* Program Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-cz-foreground text-sm truncate">
                    {program.title}
                  </div>
                  <div className="text-xs text-cz-muted">
                    {program.channel}
                  </div>
                </div>

                {/* Time */}
                <div className="flex-shrink-0 text-xs text-cz-muted font-mono">
                  {formatTime(program.time)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-cz-muted">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nu sunt programe programate</p>
          </div>
        )}
      </Card>
    </div>
  );
}