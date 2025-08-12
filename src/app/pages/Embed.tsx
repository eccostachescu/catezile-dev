import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SEO } from "@/seo/SEO";
import { supabase } from "@/lib/supabaseClient";

function getRemaining(targetMs: number) {
  const now = Date.now();
  const diff = Math.max(0, targetMs - now);
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);
  return { diff, days, hours, minutes, seconds };
}

export default function Embed() {
  const { id } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const units = (params.get("units") || "dhms").toLowerCase(); // dhms|dhm|d
  const label = (params.get("label") || "ro").toLowerCase(); // ro|en|none
  const size = (params.get("size") || "md").toLowerCase(); // sm|md|lg
  const rounded = (params.get("rounded") || "md").toLowerCase(); // 0|md|xl

  const labels = useMemo(() => {
    if (label === "none") return { d: "", h: "", m: "", s: "" };
    if (label === "en") return { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" };
    return { d: "Zile", h: "Ore", m: "Minute", s: "Secunde" };
  }, [label]);

  const [item, setItem] = useState<any>(null);
  const [remaining, setRemaining] = useState(() => getRemaining(Date.now()));
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Load countdown (RLS will only expose PUBLIC+APPROVED for anon)
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!id) return;
      const { data } = await supabase
        .from("countdown")
        .select("id,title,target_at,privacy,status")
        .eq("id", id)
        .maybeSingle();
      if (!cancelled) setItem(data);
    }
    run();
    return () => { cancelled = true; };
  }, [id]);

  // Ticking timer
  useEffect(() => {
    if (!item?.target_at) return;
    const targetMs = new Date(item.target_at).getTime();
    setRemaining(getRemaining(targetMs));
    const idd = window.setInterval(() => {
      setRemaining(getRemaining(targetMs));
    }, 1000);
    return () => window.clearInterval(idd);
  }, [item?.target_at]);

  // Auto-resize messaging to parent
  useEffect(() => {
    const postSize = () => {
      const h = wrapRef.current?.offsetHeight || document.body.scrollHeight || 0;
      try {
        window.parent?.postMessage({ type: "catezile-embed-size", height: h }, "*");
      } catch {}
    };
    postSize();
    const ro = new ResizeObserver(() => postSize());
    if (wrapRef.current) ro.observe(wrapRef.current);
    const idd = window.setInterval(postSize, 2000);
    return () => { ro.disconnect(); window.clearInterval(idd); };
  }, []);

  const sizeCls = size === "lg" ? "text-3xl" : size === "sm" ? "text-xl" : "text-2xl";
  const boxPad = size === "lg" ? "p-3" : size === "sm" ? "p-1.5" : "p-2.5";
  const radius = rounded === "0" ? "rounded-none" : rounded === "xl" ? "rounded-xl" : "rounded-md";

  const show = (key: "d"|"h"|"m"|"s") => units.includes(key);

  const seg = (value: number, title: string) => (
    <div className={`${radius} border bg-muted/50 ${boxPad} text-center`}>
      <div className={`${sizeCls} font-semibold tabular-nums leading-none`} aria-hidden>
        {String(value).padStart(2, "0")}
      </div>
      {label !== "none" && <div className="mt-1 text-[10px] text-muted-foreground">{title}</div>}
    </div>
  );

  const content = (
    <div ref={wrapRef} className="w-full">
      {!item || item.status !== "APPROVED" || item.privacy !== "PUBLIC" ? (
        <div className={`${radius} border bg-muted/40 p-3 text-center text-xs text-muted-foreground`}>Temporar indisponibil</div>
      ) : remaining.diff <= 0 ? (
        <div className={`${radius} border bg-muted/40 p-3 text-center`}>
          <span className="font-medium">Timpul a expirat</span>
          <span className="sr-only"> – countdown complet</span>
        </div>
      ) : (
        <div role="timer" aria-live="polite" aria-atomic="true" aria-label={`Au mai rămas ${remaining.days} zile, ${remaining.hours} ore, ${remaining.minutes} minute și ${remaining.seconds} secunde`}>
          <div className="grid grid-cols-4 gap-2">
            {show("d") ? seg(remaining.days, labels.d) : null}
            {show("h") ? seg(remaining.hours, labels.h) : null}
            {show("m") ? seg(remaining.minutes, labels.m) : null}
            {show("s") ? seg(remaining.seconds, labels.s) : null}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <SEO title={item?.title || "Embed"} path={location.pathname} noIndex />
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors *;" />
      </Helmet>
      <div className="w-full p-2">{content}</div>
    </>
  );
}
