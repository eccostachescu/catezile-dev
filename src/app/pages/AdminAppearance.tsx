import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function AdminAppearance() {
  return (
    <>
      <SEO title="Admin Apariție" path="/admin/appearance" noIndex />
      <Container>
        <h1 className="text-2xl font-semibold">Apariție (stub)</h1>
      </Container>
    </>
  );
}
