import AdSlot from "@/components/AdSlot";

export default function TVAdRail({ position = 'top' }: { position?: 'top' | 'side' }) {
  if (position === 'top') return <AdSlot id="tv_top" className="my-4" />;
  return <AdSlot id="tv_side" className="my-4" />;
}
