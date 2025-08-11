import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function About() {
  return (
    <>
      <SEO title="Despre" path="/despre" />
      <Container>
        <h1 className="text-2xl font-semibold">Despre</h1>
      </Container>
    </>
  );
}
