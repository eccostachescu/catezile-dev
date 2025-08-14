import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-cz-fast ease-cz-smooth cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "bg-[--cz-surface] text-[--cz-ink-muted] hover:bg-[--cz-border] hover:text-[--cz-ink] border border-[--cz-border]",
        active: "border border-[--cz-primary] text-white shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  active?: boolean;
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, active, children, ...props }, ref) => {
    const chipStyle = active ? {
      background: 'var(--cz-chip-grad)',
    } : {};
    
    return (
      <button
        className={cn(chipVariants({ variant: active ? "active" : "default" }), className)}
        style={chipStyle}
        ref={ref}
        type="button"
        {...props}
      >
        {children}
      </button>
    );
  }
);
Chip.displayName = "Chip";

export { Chip, chipVariants };