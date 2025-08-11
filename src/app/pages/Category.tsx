import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useLocation } from "react-router-dom";

export default function Category() {
  const { pathname } = useLocation();
  return (
    <>
      <SEO title="Categorie" path={pathname} />
      <Container>
        <h1 className="text-2xl font-semibold">Categorie</h1>
      </Container>
    </>
  );
}
