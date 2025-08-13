import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HolidayAnswerBox } from "@/components/holidays/HolidayAnswerBox";
import { HolidaysAdRail } from "@/components/holidays/HolidaysAdRail";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/seo/SEO";

export default function HolidayDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHolidayDetail = async () => {
      if (!slug) return;
      
      try {
        const response = await supabase.functions.invoke('holiday_detail', {
          body: { slug }
        });
        
        if (response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Error loading holiday:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHolidayDetail();
  }, [slug]);

  const handleICSDownload = () => {
    if (!data?.holiday) return;
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://catezile.ro';
    const icsUrl = `${siteUrl}/functions/v1/ics_event/${data.holiday.id}?kind=holiday`;
    window.open(icsUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share && data?.holiday) {
      try {
        await navigator.share({
          title: `${data.holiday.name} — CateZile.ro`,
          text: `Află câte zile au rămas până la ${data.holiday.name}`,
          url: window.location.href
        });
      } catch (err) {
        // Fallback to copy URL
        navigator.clipboard?.writeText(window.location.href);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="text-center">Se încarcă...</div>
        </div>
      </div>
    );
  }

  if (!data?.holiday) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sărbătoarea nu a fost găsită</h1>
            <p className="text-muted-foreground">
              Sărbătoarea căutată nu există sau nu este disponibilă.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { holiday, nextInstance, daysUntil, bridgeRecommendations } = data;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${holiday.name} — ${data.currentYear}: Câte zile până la ${holiday.name}?`}
        description={`Data exactă pentru ${holiday.name} în ${data.currentYear}, dacă pică în weekend și recomandări pentru minivacanțe.`}
      />

      <div className="container py-8 space-y-8">
        <header className="text-center space-y-4">
          <nav className="text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary">Acasă</a>
            <span className="mx-2">→</span>
            <a href="/sarbatori" className="hover:text-primary">Sărbători</a>
            <span className="mx-2">→</span>
            <span>{holiday.name}</span>
          </nav>
          
          <h1 className="text-4xl font-bold">
            {holiday.name}
          </h1>
          
          {holiday.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {holiday.description}
            </p>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-8">
            <HolidayAnswerBox
              holiday={holiday}
              nextInstance={nextInstance}
              daysUntil={daysUntil}
              bridgeRecommendations={bridgeRecommendations}
            />

            <div className="flex items-center gap-4">
              <Button onClick={handleICSDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Descarcă ICS
              </Button>
              
              <Button onClick={handleShare} variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Distribuie
              </Button>
            </div>

            <HolidaysAdRail placement="content" />
          </div>

          <aside className="space-y-6">
            <div className="sticky top-4">
              <HolidaysAdRail placement="sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}