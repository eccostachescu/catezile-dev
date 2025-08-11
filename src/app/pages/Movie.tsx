import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function Movie() {
  return (
    <>
      <SEO title="Film" path={location.pathname} />
      <Container>
        <h1 className="text-2xl font-semibold">Film</h1>
      </Container>
    </>
  );
}
