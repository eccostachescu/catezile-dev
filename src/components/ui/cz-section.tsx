import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  spacing?: "sm" | "md" | "lg";
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, title, description, action, spacing = "md", children, ...props }, ref) => {
    const spacingClass = {
      sm: "space-y-4",
      md: "space-y-6", 
      lg: "space-y-8"
    }[spacing];

    return (
      <section
        ref={ref}
        className={cn("w-full", spacingClass, className)}
        {...props}
      >
        {(title || description || action) && (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              {title && (
                <h2 className="text-h2 font-heading font-semibold text-cz-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-cz-muted max-w-2xl">
                  {description}
                </p>
              )}
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        )}
        {children}
      </section>
    );
  }
);
Section.displayName = "Section";

export { Section };