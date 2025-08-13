import AdSlot from "@/components/AdSlot";

interface HolidaysAdRailProps {
  placement: 'sidebar' | 'content' | 'bottom';
  className?: string;
}

export function HolidaysAdRail({ placement, className }: HolidaysAdRailProps) {
  const getAdKey = () => {
    switch (placement) {
      case 'sidebar':
        return 'holidays-sidebar';
      case 'content':
        return 'holidays-content';
      case 'bottom':
        return 'holidays-bottom';
      default:
        return 'holidays-generic';
    }
  };

  return (
    <div className={className}>
      <AdSlot adKey={getAdKey()} />
    </div>
  );
}