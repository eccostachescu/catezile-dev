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
    <div className="fixed bottom-4 left-4 right-4 z-[9999] max-w-2xl mx-auto rounded-lg border bg-background shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4">
        <div className="flex-1">
          <p className="text-sm text-foreground font-medium mb-1">
            Cookie-uri și confidențialitate
          </p>
          <p className="text-sm text-muted-foreground">
            Folosim cookie‑uri pentru analitice și personalizare. Poți schimba oricând din Setări.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button 
            className="h-9 px-3 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors" 
            onClick={() => { 
              setConsent({ 
                ...getConsent(), 
                ad_user_data:'denied', 
                ad_personalization:'denied', 
                ad_storage:'denied', 
                analytics_storage:'denied' 
              }); 
              onConsentChange?.(false); 
              setVisible(false); 
            }}
          >
            Respinge
          </button>
          <button 
            className="h-9 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors" 
            onClick={() => { 
              setConsent({ 
                ad_user_data:'granted', 
                ad_personalization:'granted', 
                ad_storage:'granted', 
                analytics_storage:'granted' 
              }); 
              onConsentChange?.(true); 
              setVisible(false); 
            }}
          >
            Acceptă
          </button>
          <button 
            className="h-9 px-3 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors" 
            onClick={() => setVisible(true)}
          >
            Setări
          </button>
        </div>
      </div>
    </div>
  );
}
