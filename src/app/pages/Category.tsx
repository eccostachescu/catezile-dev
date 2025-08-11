import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function Category() {
  return (
    <>
      <SEO title="Categorie" path={location.pathname} />
      <Container>
        <h1 className="text-2xl font-semibold">Categorie</h1>
      </Container>
    </>
  );
}
