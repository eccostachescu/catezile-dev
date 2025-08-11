import Container from "@/components/Container";
import AdSlot from "@/components/AdSlot";

export default function HomeAdRail() {
  return (
    <>
      <section className="py-6">
        <Container>
          <AdSlot />
        </Container>
      </section>
      <section className="py-6">
        <Container>
          <AdSlot />
        </Container>
      </section>
    </>
  );
}
