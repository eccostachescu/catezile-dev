import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function Pricing() {
  return (
    <>
      <SEO 
        title="Prețuri CateZile" 
        description="Descoperă planurile noastre de preturi pentru acces la toate funcționalitățile"
        path="/preturi" 
      />
      <Container>
        <div className="max-w-4xl mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Prețuri simple și transparente</h1>
            <p className="text-lg text-muted-foreground">
              Alege planul potrivit pentru nevoile tale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Gratuit</h2>
                <div className="text-3xl font-bold">0 RON</div>
                <p className="text-sm text-muted-foreground">Perfect pentru utilizare personală</p>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Acces la toate evenimentele</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Crearea a 5 numărători</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Notificări email</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Widget-uri de bază</span>
                </li>
              </ul>

              <Button variant="outline" className="w-full">
                Începe gratuit
              </Button>
            </Card>

            <Card className="p-6 space-y-6 border-primary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  Recomandat
                </span>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Pro</h2>
                <div className="text-3xl font-bold">19 RON<span className="text-lg text-muted-foreground">/lună</span></div>
                <p className="text-sm text-muted-foreground">Pentru utilizatori activi</p>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Tot de la planul Gratuit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Numărători nelimitate</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Widget-uri avansate</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Notificări SMS</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Suport prioritar</span>
                </li>
              </ul>

              <Button className="w-full">
                Încearcă Pro
              </Button>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Business</h2>
                <div className="text-3xl font-bold">99 RON<span className="text-lg text-muted-foreground">/lună</span></div>
                <p className="text-sm text-muted-foreground">Pentru echipe și companii</p>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Tot de la planul Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">API access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">White-label widgets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Analytics avansate</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Manager dedicat</span>
                </li>
              </ul>

              <Button variant="outline" className="w-full">
                Contactează-ne
              </Button>
            </Card>
          </div>

          <div className="text-center space-y-4 pt-8">
            <h2 className="text-2xl font-semibold">Întrebări frecvente</h2>
            <div className="text-left max-w-2xl mx-auto space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Pot să-mi schimb planul oricând?</h3>
                <p className="text-sm text-muted-foreground">
                  Da, poți să-ți schimbi planul oricând din contul tău. Modificările se aplică imediat.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Există reduceri pentru plata anuală?</h3>
                <p className="text-sm text-muted-foreground">
                  Da, oferim 20% reducere pentru toate planurile plătite anual.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}