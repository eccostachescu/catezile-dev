import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function Contact() {
  return (
    <>
      <SEO title="Contact" path="/contact" />
      <Container>
        <h1 className="text-2xl font-semibold">Contact</h1>
      </Container>
    </>
  );
}
