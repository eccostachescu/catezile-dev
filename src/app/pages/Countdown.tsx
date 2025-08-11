import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function Countdown() {
  return (
    <>
      <SEO title="Countdown" path={location.pathname} />
      <Container>
        <h1 className="text-2xl font-semibold">Countdown</h1>
      </Container>
    </>
  );
}
