import { cn } from "@/lib/utils";

export default function EmptyState({ title, description, action, className, Icon }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className={cn("rounded-lg border bg-muted/30 p-8 text-center", className)}>
      {Icon && <Icon className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden />}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
