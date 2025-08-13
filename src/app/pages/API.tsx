import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Database, Zap, Shield } from "lucide-react";

export default function API() {
  const endpoints = [
    {
      method: "GET",
      path: "/api/events",
      description: "Obține lista tuturor evenimentelor publice"
    },
    {
      method: "GET",
      path: "/api/events/{id}",
      description: "Obține detaliile unui eveniment specific"
    },
    {
      method: "POST",
      path: "/api/countdowns",
      description: "Creează un numărător nou"
    },
    {
      method: "GET",
      path: "/api/categories",
      description: "Obține lista categoriilor disponibile"
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "Performanță ridicată",
      description: "API-ul nostru este optimizat pentru viteza și fiabilitatea"
    },
    {
      icon: Shield,
      title: "Securitate avansată",
      description: "Autentificare prin API key și limitări de rată"
    },
    {
      icon: Database,
      title: "Date în timp real",
      description: "Acces la cele mai recente informații despre evenimente"
    }
  ];

  return (
    <>
      <SEO 
        title="API CateZile" 
        description="Documentația completă pentru API-ul CateZile - integrează datele despre evenimente în aplicația ta"
        path="/api" 
      />
      <Container>
        <div className="max-w-4xl mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">API CateZile</h1>
            <p className="text-lg text-muted-foreground">
              Integrează datele despre evenimente în aplicația ta
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center space-y-4">
                <feature.icon className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Endpoint-uri principale</h2>
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={endpoint.method === 'GET' ? 'secondary' : 'default'}
                        className="font-mono"
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="font-mono text-sm">{endpoint.path}</code>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{endpoint.description}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Autentificare</h2>
            <Card className="p-6 space-y-4">
              <p className="text-muted-foreground">
                Pentru a accesa API-ul, ai nevoie de un API key. Include-l în header-ul 
                fiecărei cereri:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <code className="text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Exemple de utilizare</h2>
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">JavaScript</h3>
              <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
{`fetch('https://api.catezile.ro/events', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`}
                </pre>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Limitări</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 space-y-2">
                <h3 className="font-semibold">Plan Gratuit</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 1,000 cereri/lună</li>
                  <li>• Doar endpoint-uri publice</li>
                  <li>• Suport comunitate</li>
                </ul>
              </Card>
              <Card className="p-6 space-y-2">
                <h3 className="font-semibold">Plan Business</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 100,000 cereri/lună</li>
                  <li>• Acces complet API</li>
                  <li>• Suport prioritar</li>
                </ul>
              </Card>
            </div>
          </div>

          <div className="text-center space-y-4 bg-muted/30 rounded-lg p-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Code className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Gata să începi?</h3>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Obține API key-ul tău și începe să integrezi datele CateZile 
              în aplicația ta astăzi.
            </p>
            <div className="flex gap-4 justify-center">
              <Button>Obține API Key</Button>
              <Button variant="outline">Documentație completă</Button>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}