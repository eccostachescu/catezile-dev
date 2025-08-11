import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function ServerError() {
  return (
    <>
      <SEO title="Eroare server" path="/500" noIndex />
      <Container>
        <h1 className="text-2xl font-semibold">500 — A apărut o eroare</h1>
        <button className="mt-4 h-9 px-3 rounded-md border" onClick={()=>window.location.reload()}>Reîncearcă</button>
      </Container>
    </>
  );
}
