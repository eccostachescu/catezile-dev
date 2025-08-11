import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { getInitialData } from "@/ssg/serialize";

export default function Movies() {
  const _initial = getInitialData<{ kind: string }>();
  return (
    <>
      <SEO title="Filme" path="/filme" />
      <Container>
        <h1 className="text-2xl font-semibold">Filme</h1>
      </Container>
    </>
  );
}
