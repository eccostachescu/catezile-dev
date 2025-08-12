import AdSlot from "@/components/AdSlot";

export default function SportAdRail({ position }: { position?: 'mid'|'end' }) {
  return (
    <div className="my-6">
      <AdSlot consented={false} className="h-[250px]" />
    </div>
  );
}
