import * as React from "react";
import { Link } from "react-router-dom";
import { Star, ExternalLink, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReminderButton from "@/components/ReminderButton";
import { CountdownInline } from "./CountdownInline";

export interface MediaCardProps {
  id: string;
  href: string;
  title: string;
  year?: number | string;
  genres?: string[];
  rating?: number;
  imageUrl?: string;
  status: 'scheduled' | 'live' | 'ended' | 'canceled';
  nextEpisode?: {
    season: number;
    episode: number;
    title?: string;
    startsAt?: string;
  };
  network?: string;
  canRemind: boolean;
  variant?: 'standard' | 'wide';
  className?: string;
  tmdbId?: string | number;
}

export function MediaCard({
  id,
  href,
  title,
  year,
  genres = [],
  rating,
  imageUrl,
  status,
  nextEpisode,
  network,
  canRemind,
  variant = 'standard',
  className,
  tmdbId,
  ...props
}: MediaCardProps) {
  const titleId = React.useId();
  const isLive = status === 'live';
  const isPast = status === 'ended' || status === 'canceled';
  const hasNewEpisode = nextEpisode && status === 'scheduled';
  const aspectClass = variant === 'wide' ? 'aspect-video' : 'aspect-[2/3]';
  
  const tmdbUrl = tmdbId ? `https://www.themoviedb.org/tv/${tmdbId}` : undefined;

  return (
    <article
      className={cn(
        "group rounded-2xl border border-[#E8EBF3] bg-white shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}
      aria-labelledby={titleId}
      {...props}
    >
      <Link to={href} className="block">
        <div className={cn("relative overflow-hidden rounded-t-2xl", aspectClass)}>
          {/* Image */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${title} poster`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#F9FAFD] to-[#E8EBF3] flex items-center justify-center">
              <div className="text-[#6B7280] text-sm font-medium">Fără imagine</div>
            </div>
          )}
          
          {/* Bottom gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[rgba(10,16,32,0.7)] via-[rgba(10,16,32,0.3)] to-transparent" />
          
          {/* Top badges */}
          <div className="absolute inset-x-0 top-2 px-2 flex justify-between items-start">
            {/* Left: New episode badge */}
            {hasNewEpisode && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-[#111827] shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                Episod nou
              </div>
            )}
            
            {/* Right: Rating badge */}
            {rating && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#111827]/80 backdrop-blur-sm text-xs font-medium text-white shadow-sm">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {rating.toFixed(1)}
              </div>
            )}
          </div>

          {/* Live badge */}
          {isLive && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-semibold animate-pulse">
              LIVE
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-2">
        <Link to={href}>
          <h3 
            id={titleId} 
            className="text-base font-semibold text-[#0A1020] line-clamp-2 leading-6 group-hover:text-[#5B8CFF] transition-colors"
          >
            {title}
          </h3>
        </Link>
        
        {/* Meta row */}
        <p className="text-sm text-[#6B7280] font-medium">
          {year}
          {genres.length > 0 && ` • ${genres.slice(0, 2).join(' / ')}`}
          {network && ` • ${network}`}
        </p>

        {/* Next episode block */}
        {hasNewEpisode && nextEpisode && (
          <div className="rounded-xl border border-[#E8EBF3] bg-[#F9FAFD] p-3 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 text-[#111827] font-medium">
                <span className="h-2 w-2 rounded-full bg-[#6B7280]" />
                Următorul episod
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-[#0A1020] text-white font-medium">
                S{nextEpisode.season}E{nextEpisode.episode}
              </span>
            </div>
            
            {nextEpisode.title && (
              <p className="text-sm text-[#374151] line-clamp-1">
                {nextEpisode.title}
              </p>
            )}
            
            {nextEpisode.startsAt && (
              <CountdownInline startsAt={nextEpisode.startsAt} />
            )}
          </div>
        )}

        {/* Past status */}
        {isPast && (
          <div className="text-xs text-[#6B7280] font-medium">
            <span className="px-2 py-1 rounded-full bg-[#F3F4F6] text-[#6B7280]">
              {status === 'ended' ? 'Terminat' : 'Anulat'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {canRemind && !isLive && !isPast && nextEpisode?.startsAt && (
            <ReminderButton
              when={new Date(nextEpisode.startsAt)}
              kind="event"
              entityId={id}
            />
          )}
          
          {tmdbUrl && (
            <Link
              to={tmdbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:text-[#0A1020] hover:bg-[#F9FAFD] rounded-lg border border-[#E8EBF3] hover:border-[#D1D5DB] transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              Vezi pe TMDB
            </Link>
          )}
          
          <button
            className="inline-flex items-center justify-center w-8 h-8 text-[#6B7280] hover:text-[#0A1020] hover:bg-[#F9FAFD] rounded-lg border border-[#E8EBF3] hover:border-[#D1D5DB] transition-all"
            onClick={(e) => {
              e.stopPropagation();
              // Share functionality
              if (navigator.share) {
                navigator.share({ title, url: window.location.origin + href });
              }
            }}
            aria-label={`Distribuie ${title}`}
          >
            <Share2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
}