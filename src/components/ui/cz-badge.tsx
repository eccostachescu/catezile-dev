import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-cz-fast",
  {
    variants: {
      variant: {
        live: "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse",
        sport: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        film: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
        holiday: "bg-green-500/20 text-green-400 border border-green-500/30",
        event: "bg-cz-accent/20 text-cz-accent border border-cz-accent/30",
        neutral: "bg-cz-muted/20 text-cz-muted border border-cz-muted/30",
        rank: "bg-cz-primary/20 text-cz-primary border border-cz-primary/30 font-semibold",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };