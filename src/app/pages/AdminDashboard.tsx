import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function AdminDashboard() {
  return (
    <>
      <SEO title="Admin" path="/admin" noIndex />
      <Container>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      </Container>
    </>
  );
}
