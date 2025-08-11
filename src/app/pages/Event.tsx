import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function Event() {
  return (
    <>
      <SEO title="Eveniment" path={location.pathname} />
      <Container>
        <h1 className="text-2xl font-semibold">Eveniment</h1>
      </Container>
    </>
  );
}
