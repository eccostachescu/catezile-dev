export default function LegalCookies() {
  return (
    <main className="container mx-auto px-4 py-10 prose dark:prose-invert">
      <h1>Politica de cookie-uri</h1>
      <p>Acesta este un șablon. Explică categoriile de cookie-uri și cum pot fi gestionate.</p>
      <button className="mt-4 underline" onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}>Deschide setări cookie-uri</button>
    </main>
  );
}
