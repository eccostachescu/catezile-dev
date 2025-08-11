import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function NotFound() {
  return (
    <>
      <SEO title="Pagina nu a fost găsită" path="/404" noIndex />
      <Container>
        <h1 className="text-2xl font-semibold">404 — Pagina nu a fost găsită</h1>
      </Container>
    </>
  );
}
