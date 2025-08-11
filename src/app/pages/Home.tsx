import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function Home() {
  return (
    <>
      <SEO title="Câte zile până…" path="/" />
      <section className="py-10">
        <Container>
          <h1 className="text-3xl font-bold mb-2">CateZile.ro</h1>
          <p className="text-muted-foreground">În curând: countdown‑uri pentru evenimente populare.</p>
        </Container>
      </section>
    </>
  );
}
