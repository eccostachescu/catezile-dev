import { useEffect, useState } from "react";
import { ensureDefaultConsent, setConsent, getConsent } from "@/lib/consent";

export default function CookieBannerStub({ onConsentChange }: { onConsentChange?: (consented: boolean) => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    ensureDefaultConsent();
    const open = () => setVisible(true);
    window.addEventListener('open-cookie-settings', open as EventListener);
    return () => window.removeEventListener('open-cookie-settings', open as EventListener);
  }, []);

  useEffect(() => {
    // Auto-hide if user already set a choice
    const c = getConsent();
    const decided = Object.values(c).some(v => v === 'granted');
    if (decided) setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(95%,700px)] rounded-lg border bg-popover p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Folosim cookie‑uri pentru analitice și personalizare. Poți schimba oricând din Setări.
        </p>
        <div className="flex gap-2">
          <button className="h-9 px-3 rounded-md border" onClick={() => { setConsent({ ...getConsent(), ad_user_data:'denied', ad_personalization:'denied', ad_storage:'denied', analytics_storage:'denied' }); onConsentChange?.(false); setVisible(false); }}>Respinge</button>
          <button className="h-9 px-3 rounded-md border" onClick={() => { setConsent({ ad_user_data:'granted', ad_personalization:'granted', ad_storage:'granted', analytics_storage:'granted' }); onConsentChange?.(true); setVisible(false); }}>Acceptă</button>
          <button className="h-9 px-3 rounded-md border" onClick={() => setVisible(true)}>Setări</button>
        </div>
      </div>
    </div>
  );
}
