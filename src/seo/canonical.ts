const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://catezile.ro";

export const getCanonicalUrl = (path?: string) => {
  const p = path || (typeof window !== "undefined" ? window.location.pathname : "/");
  return `${SITE_URL}${p}`;
};
