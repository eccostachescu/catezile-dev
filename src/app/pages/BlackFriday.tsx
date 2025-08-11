import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { getInitialData } from "@/ssg/serialize";

export default function BlackFriday() {
  const _initial = getInitialData<{ kind: string }>();
  return (
    <>
      <SEO title="Black Friday" path="/black-friday" />
      <Container>
        <h1 className="text-2xl font-semibold">Black Friday</h1>
      </Container>
    </>
  );
}
