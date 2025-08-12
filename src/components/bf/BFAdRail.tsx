import AdSlot from "@/components/AdSlot";

export default function BFAdRail() {
  return (
    <section className="py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdSlot className="h-[250px]" />
        <AdSlot className="h-[250px]" />
      </div>
    </section>
  );
}
