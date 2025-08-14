import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-cz-fast ease-cz-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cz-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-cz-primary text-white hover:bg-cz-primary-600 hover:shadow-cz-hover transform hover:scale-[1.02]",
        ghost: "text-cz-foreground hover:bg-cz-surface hover:text-cz-foreground",
        subtle: "bg-cz-surface text-cz-foreground hover:bg-cz-card hover:shadow-cz-card",
        accent: "bg-cz-accent text-cz-bg hover:bg-cz-accent/90 font-semibold",
        outline: "border border-cz-border bg-transparent text-cz-foreground hover:bg-cz-surface",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
  iconPosition?: "leading" | "trailing";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, icon, iconPosition = "leading", children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {icon && iconPosition === "leading" && (
          <span className={cn("flex-shrink-0", children && "mr-2")}>
            {icon}
          </span>
        )}
        {children}
        {icon && iconPosition === "trailing" && (
          <span className={cn("flex-shrink-0", children && "ml-2")}>
            {icon}
          </span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };