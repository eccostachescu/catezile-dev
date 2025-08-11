const PROD_URL = "https://catezile.ro";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  return PROD_URL;
};

const NOISE_PARAMS = [
  /^utm_/i,
  /^gclid$/i,
  /^fbclid$/i,
  /^ref$/i,
  /^source$/i,
  /^ogTheme$/i,
];

export function buildCanonical(pathname?: string, searchParams?: URLSearchParams) {
  const origin = getBaseUrl();
  const p = pathname || (typeof window !== "undefined" ? window.location.pathname : "/");
  const sp = searchParams || (typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams());

  const cleaned = new URLSearchParams();
  for (const [k, v] of sp.entries()) {
    const isNoise = NOISE_PARAMS.some((re) => re.test(k));
    if (!isNoise) cleaned.append(k, v);
  }

  // Normalize trailing slash (no trailing slash except root)
  const pathClean = p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p;
  const qs = cleaned.toString();
  return qs ? `${origin}${pathClean}?${qs}` : `${origin}${pathClean}`;
}

export function buildHreflangs(canonical: string) {
  return [
    { href: canonical, hrefLang: "ro-RO" },
    { href: canonical, hrefLang: "x-default" },
  ];
}

