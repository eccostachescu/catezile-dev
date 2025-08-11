import { cn } from "@/lib/utils";

export default function Container({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("container mx-auto px-4", className)}>{children}</div>
  );
}
