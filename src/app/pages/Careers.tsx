import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Heart } from "lucide-react";

export default function Careers() {
  const positions = [
    {
      title: "Frontend Developer",
      department: "Engineering",
      location: "Remote/București",
      type: "Full-time",
      description: "Căutăm un frontend developer pasionat pentru a ne ajuta să construim experiențe web excepționale."
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Alătură-te echipei noastre pentru a crea interfețe intuitive și experiențe memorabile pentru utilizatori."
    },
    {
      title: "Marketing Specialist",
      department: "Marketing",
      location: "București",
      type: "Part-time",
      description: "Ajută-ne să creștem comunitatea CateZile prin strategii de marketing creative și eficiente."
    }
  ];

  const benefits = [
    "Salariu competitiv și bonusuri de performanță",
    "Asigurare medicală premium",
    "Zile libere nelimitate",
    "Buget pentru dezvoltare profesională",
    "Equipment de lucru modern",
    "Flexibilitate în programul de lucru",
    "Echipă tânără și dinamică",
    "Proiecte interesante și provocatoare"
  ];

  const values = [
    {
      icon: Users,
      title: "Colaborare",
      description: "Credem în puterea echipei și a colaborării pentru a atinge obiective ambițioase."
    },
    {
      icon: Heart,
      title: "Pasiune",
      description: "Suntem pasionați de ceea ce facem și încurajăm creativitatea și inovația."
    },
    {
      icon: Clock,
      title: "Work-Life Balance",
      description: "Valorizam echilibrul între viața profesională și cea personală."
    }
  ];

  return (
    <>
      <SEO 
        title="Cariere CateZile" 
        description="Alătură-te echipei CateZile! Descoperă oportunitățile de carieră într-o companie în creștere"
        path="/cariere" 
      />
      <Container>
        <div className="max-w-4xl mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Alătură-te echipei CateZile</h1>
            <p className="text-lg text-muted-foreground">
              Construim viitorul platformelor pentru evenimente în România
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center space-y-4">
                <value.icon className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-lg font-semibold">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Poziții deschise</h2>
            <div className="space-y-4">
              {positions.map((position, index) => (
                <Card key={index} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{position.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{position.department}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {position.location}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {position.type}
                        </Badge>
                      </div>
                    </div>
                    <Button>Aplică acum</Button>
                  </div>
                  <p className="text-muted-foreground">{position.description}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">De ce să lucrezi cu noi?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Procesul de aplicare</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  1
                </div>
                <h4 className="font-semibold mb-1">Aplicare</h4>
                <p className="text-xs text-muted-foreground">Trimite CV-ul și scrisoarea de intenție</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  2
                </div>
                <h4 className="font-semibold mb-1">Screening</h4>
                <p className="text-xs text-muted-foreground">Conversație telefonic de 15-30 min</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  3
                </div>
                <h4 className="font-semibold mb-1">Interviu</h4>
                <p className="text-xs text-muted-foreground">Interviu tehnic și cultural fit</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  4
                </div>
                <h4 className="font-semibold mb-1">Decizie</h4>
                <p className="text-xs text-muted-foreground">Răspuns în maxim 3 zile lucrătoare</p>
              </Card>
            </div>
          </div>

          <div className="text-center space-y-4 bg-muted/30 rounded-lg p-8">
            <h3 className="text-xl font-semibold">Nu găsești poziția potrivită?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Suntem mereu în căutarea de talente excepționale. Trimite-ne CV-ul tău 
              și te vom contacta când va apărea o oportunitate potrivită.
            </p>
            <Button variant="outline">Trimite CV spontan</Button>
          </div>
        </div>
      </Container>
    </>
  );
}