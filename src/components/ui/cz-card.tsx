import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hover?: boolean;
  }
>(({ className, hover = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-cz-border bg-cz-card text-cz-foreground shadow-cz-card",
      hover && "transition-all duration-cz-normal ease-cz-smooth hover:shadow-cz-hover hover:scale-[1.01] hover:-translate-y-1",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-heading font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-cz-muted", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

const CardMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    src?: string;
    alt?: string;
    aspectRatio?: "square" | "video" | "wide";
  }
>(({ className, src, alt, aspectRatio = "video", ...props }, ref) => {
  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video", 
    wide: "aspect-[16/9]"
  }[aspectRatio];

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden rounded-t-2xl", aspectClass, className)}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || ""}
          className="h-full w-full object-cover transition-transform duration-cz-normal group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-cz-surface to-cz-card flex items-center justify-center">
          <div className="text-cz-muted/50 text-sm">Fără imagine</div>
        </div>
      )}
    </div>
  );
});
CardMedia.displayName = "CardMedia";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardMedia };