import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-cz-surface rounded-md",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-cz-card border border-cz-border overflow-hidden", className)}>
      {/* Image skeleton */}
      <div className="aspect-video bg-cz-surface animate-pulse" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-cz-surface rounded animate-pulse" />
          <div className="h-4 bg-cz-surface rounded w-3/4 animate-pulse" />
        </div>
        
        {/* Meta skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-3 bg-cz-surface rounded w-20 animate-pulse" />
          <div className="h-3 bg-cz-surface rounded w-16 animate-pulse" />
        </div>
        
        {/* Actions skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-cz-surface rounded-full w-16 animate-pulse" />
          <div className="h-7 bg-cz-surface rounded-full w-20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}