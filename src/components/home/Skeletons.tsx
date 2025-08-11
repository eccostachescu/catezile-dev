import { Skeleton as S } from "@/components/ui/skeleton";

export function FeaturedSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <S className="h-56" />
      <S className="h-56" />
    </div>
  );
}

export function StripSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto">
      {Array.from({ length: 4 }).map((_,i)=> <S key={i} className="h-48 w-[300px]" />)}
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_,i)=> <S key={i} className="h-56" />)}
    </div>
  );
}
