import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Card } from "@/components/ui/card";
import { Clock, Calendar, Bell, Share2 } from "lucide-react";

export default function HowItWorks() {
  return (
    <>
      <SEO 
        title="Cum funcționează CateZile" 
        description="Descoperă cum să folosești CateZile pentru a nu rata niciun eveniment important"
        path="/cum-functioneaza" 
      />
      <Container>
        <div className="max-w-4xl mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Cum funcționează CateZile</h1>
            <p className="text-lg text-muted-foreground">
              Totul despre folosirea platformei pentru a nu rata evenimente importante
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <h2 className="text-xl font-semibold">1. Explorează evenimente</h2>
              </div>
              <p className="text-muted-foreground">
                Navighează prin categoriile noastre - filme, sport, sărbători și multe altele. 
                Găsește evenimente care te interesează.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-primary" />
                <h2 className="text-xl font-semibold">2. Creează numărătoare</h2>
              </div>
              <p className="text-muted-foreground">
                Adaugă propriile tale evenimente și creează numărătoare inverse personalizate.
                Partajează-le cu prietenii.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Bell className="h-8 w-8 text-primary" />
                <h2 className="text-xl font-semibold">3. Primește notificări</h2>
              </div>
              <p className="text-muted-foreground">
                Activează notificările pentru a fi anunțat când se apropie evenimentele tale favorite.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Share2 className="h-8 w-8 text-primary" />
                <h2 className="text-xl font-semibold">4. Partajează</h2>
              </div>
              <p className="text-muted-foreground">
                Trimite link-uri către evenimente sau încorporează numărătoarele în site-ul tău.
              </p>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Caracteristici principale</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <h3 className="font-semibold mb-2">Evenimente locale</h3>
                <p className="text-sm text-muted-foreground">
                  Sărbători românești, evenimente sportive și premiere de filme
                </p>
              </div>
              <div className="text-center p-4">
                <h3 className="font-semibold mb-2">Notificări în timp real</h3>
                <p className="text-sm text-muted-foreground">
                  Preia notificări prin email pentru evenimentele tale
                </p>
              </div>
              <div className="text-center p-4">
                <h3 className="font-semibold mb-2">Widget-uri personalizabile</h3>
                <p className="text-sm text-muted-foreground">
                  Încorporează numărătoarele în blogul sau site-ul tău
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}