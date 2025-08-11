import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function Movies() {
  return (
    <>
      <SEO title="Filme" path="/filme" />
      <Container>
        <h1 className="text-2xl font-semibold">Filme</h1>
      </Container>
    </>
  );
}
