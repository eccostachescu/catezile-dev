import { SEO } from "@/seo/SEO";

export default function Embed() {
  return (
    <>
      <SEO title="Embed" path={location.pathname} noIndex />
      <div className="p-2 text-sm">Embed</div>
    </>
  );
}
