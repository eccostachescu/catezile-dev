import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    functional: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem('cookie-preferences');
    if (saved) {
      setPreferences({ ...preferences, ...JSON.parse(saved) });
    }

    // Listen for cookie settings open event
    const handleOpenSettings = () => setIsOpen(true);
    window.addEventListener('open-cookie-settings', handleOpenSettings);
    
    return () => {
      window.removeEventListener('open-cookie-settings', handleOpenSettings);
    };
  }, []);

  const handleSave = () => {
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    setIsOpen(false);
    
    // Here you would typically update your analytics/marketing scripts
    if (preferences.analytics) {
      // Enable analytics
      console.log('Analytics enabled');
    } else {
      // Disable analytics
      console.log('Analytics disabled');
    }
    
    if (preferences.marketing) {
      // Enable marketing cookies
      console.log('Marketing cookies enabled');
    } else {
      // Disable marketing cookies
      console.log('Marketing cookies disabled');
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-preferences', JSON.stringify(allAccepted));
    setIsOpen(false);
  };

  const handleRejectAll = () => {
    const onlyEssential = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyEssential);
    localStorage.setItem('cookie-preferences', JSON.stringify(onlyEssential));
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Setări cookie-uri</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Personalizați preferințele pentru cookie-uri. Cookie-urile esențiale sunt 
            necesare pentru funcționarea site-ului și nu pot fi dezactivate.
          </p>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">Cookie-uri esențiale</h3>
                  <Badge variant="secondary" className="mt-1">Necesare</Badge>
                </div>
                <Switch 
                  checked={preferences.essential} 
                  disabled={true}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Necesare pentru funcționarea de bază a site-ului, autentificare și securitate.
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">Cookie-uri de funcționalitate</h3>
                  <Badge variant="outline" className="mt-1">Opționale</Badge>
                </div>
                <Switch 
                  checked={preferences.functional}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, functional: checked }))
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Salvează preferințele de temă, setări de layout și alte personalizări.
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">Cookie-uri de analiză</h3>
                  <Badge variant="outline" className="mt-1">Opționale</Badge>
                </div>
                <Switch 
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, analytics: checked }))
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Ne ajută să înțelegem cum folosiți site-ul pentru a-l îmbunătăți.
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">Cookie-uri de marketing</h3>
                  <Badge variant="outline" className="mt-1">Opționale</Badge>
                </div>
                <Switch 
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, marketing: checked }))
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Pentru reclame personalizate și măsurarea eficacității campaniilor.
              </p>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button onClick={handleAcceptAll} className="flex-1">
              Acceptă toate
            </Button>
            <Button onClick={handleRejectAll} variant="outline" className="flex-1">
              Doar necesare
            </Button>
            <Button onClick={handleSave} variant="secondary" className="flex-1">
              Salvează selecția
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Pentru mai multe informații, consultați{" "}
            <a href="/legal/cookies" className="text-primary underline">
              Politica de cookie-uri
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}