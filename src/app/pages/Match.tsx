import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function Match() {
  return (
    <>
      <SEO title="Meci" path={location.pathname} />
      <Container>
        <h1 className="text-2xl font-semibold">Meci</h1>
      </Container>
    </>
  );
}
