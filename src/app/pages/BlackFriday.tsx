import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function BlackFriday() {
  return (
    <>
      <SEO title="Black Friday" path="/black-friday" />
      <Container>
        <h1 className="text-2xl font-semibold">Black Friday</h1>
      </Container>
    </>
  );
}
