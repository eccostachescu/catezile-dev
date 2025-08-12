import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useLocation, useParams } from "react-router-dom";
import { getInitialData } from "@/ssg/serialize";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CountdownHero from "@/components/countdown/CountdownHero";
import PrivacyBadge from "@/components/countdown/PrivacyBadge";
import ThemePreview from "@/components/countdown/ThemePreview";
import CopyEmbed from "@/components/countdown/CopyEmbed";
import { Button } from "@/components/Button";
import { Share2, CalendarPlus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { buildIcs } from "@/lib/ics";
import { useAuth } from "@/lib/auth";

export default function Countdown() {
  const { pathname } = useLocation();
  const { id } = useParams();
  const initial = getInitialData<{ kind: string; item?: any }>();
  const [item, setItem] = useState<any>(initial?.item || null);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (id) {
        // RLS enforces visibility
        const { data } = await supabase.from('countdown').select('id, slug, title, target_at, privacy, status, owner_id, theme, image_url, city, seo_title, seo_description, seo_h1').eq('id', id).maybeSingle();
        if (!cancelled) setItem(data);
      }
    }
    if (!initial?.item) run();
    return () => { cancelled = true; };
  }, [id]);

  const isOwner = !!(user && item && user.id === item.owner_id);
  const isPublicApproved = item && item.status === 'APPROVED' && item.privacy === 'PUBLIC';
  const showNoindex = !isPublicApproved;

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) await navigator.share({ title: item?.title, url });
      else { await navigator.clipboard.writeText(url); toast({ title: 'Link copiat' }); }
    } catch {}
  };

  const addToCalendar = () => {
    if (!item) return;
    const ics = buildIcs({ title: item.title, start: new Date(item.target_at) });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${item.title.replace(/\s+/g,'-')}.ics`;
    a.click();
  };

  if (!item) {
    return (
      <>
        <SEO kind="generic" slug={id} title="Countdown" path={pathname} noindex />
        <Container className="py-12"><p>Nu a fost găsit.</p></Container>
      </>
    );
  }

  return (
    <>
      <SEO kind="generic" slug={item.slug || item.id} title={item.seo_title || item.title} description={item.seo_description} path={pathname} noindex={showNoindex} />
      <Container className="py-8 space-y-6">
        {isOwner && item.status !== 'APPROVED' && (
          <div role="status" className="rounded-md border bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200 p-3 text-sm">
            {item.status === 'PENDING' ? 'În așteptare de aprobare (vizibil doar pentru tine).' : 'Respins (vizibil doar pentru tine).'}
          </div>
        )}

        <div className="flex items-center justify-between">
          <PrivacyBadge privacy={item.privacy} />
          {isOwner && (
            <a href="/admin/moderation" className="underline underline-offset-4 text-sm">Editează</a>
          )}
        </div>

        <CountdownHero title={item.seo_h1 || item.title} target={new Date(item.target_at)} city={item.city} />
        <ThemePreview theme={item.theme} />

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={share}><Share2 /> Share</Button>
          <Button variant="outline" onClick={addToCalendar}><CalendarPlus /> Calendar</Button>
        </div>

        <CopyEmbed id={item.id} />
      </Container>
    </>
  );
}
