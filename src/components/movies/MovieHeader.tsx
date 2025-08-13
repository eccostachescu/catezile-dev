import { Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface MovieHeaderProps {
  title: string;
  subtitle?: string;
  platforms?: Array<{
    slug: string;
    name: string;
  }>;
  className?: string;
}

export function MovieHeader({ title, subtitle, platforms, className = "" }: MovieHeaderProps) {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      <div className="flex justify-center">
        <div className="flex items-center gap-3 p-4 rounded-full bg-gradient-to-r from-primary/10 to-primary/5">
          <Film className="h-8 w-8 text-primary" />
          <div className="h-8 w-px bg-border" />
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>
      </div>
      
      {subtitle && (
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
      
      {platforms && platforms.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {platforms.map((platform) => (
            <Link
              key={platform.slug}
              to={`/filme/${platform.slug}`}
            >
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {platform.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}