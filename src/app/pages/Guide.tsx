import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, HelpCircle, Settings, Share2 } from "lucide-react";

export default function Guide() {
  const sections = [
    {
      icon: BookOpen,
      title: "Primii pași",
      items: [
        "Cum să îți creezi primul numărător",
        "Navigarea prin categorii",
        "Căutarea evenimentelor"
      ]
    },
    {
      icon: Settings,
      title: "Funcționalități avansate",
      items: [
        "Personalizarea numărătoarelor",
        "Setarea notificărilor",
        "Exportul în calendar"
      ]
    },
    {
      icon: Share2,
      title: "Partajare și integrare",
      items: [
        "Partajarea pe rețele sociale",
        "Widget-uri pentru site",
        "API și dezvoltatori"
      ]
    }
  ];

  return (
    <>
      <SEO 
        title="Ghid utilizare CateZile" 
        description="Ghid complet pentru utilizarea platformei CateZile - de la primii pași la funcționalități avansate"
        path="/ghid-utilizare" 
      />
      <Container>
        <div className="max-w-4xl mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Ghid de utilizare</h1>
            <p className="text-lg text-muted-foreground">
              Tot ce trebuie să știi pentru a folosi CateZile la maximum
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <Card key={index} className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <section.icon className="h-8 w-8 text-primary" />
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <HelpCircle className="h-6 w-6" />
              Întrebări frecvente
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Cum îmi creez primul numărător?</AccordionTrigger>
                <AccordionContent>
                  Pentru a crea primul tău numărător, navighează la pagina "Creează" din meniul principal. 
                  Completează numele evenimentului, data și ora, apoi alege un design. Numărătorul tău va fi 
                  gata în câteva secunde!
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Pot să primesc notificări pentru evenimente?</AccordionTrigger>
                <AccordionContent>
                  Da! Poți activa notificări prin email pentru orice eveniment. Mergi la pagina evenimentului 
                  și apasă pe butonul "Amintește-mi". Vei putea alege când să primești notificarea 
                  (cu o zi înainte, o oră înainte, etc.).
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Cum pot integra un numărător în site-ul meu?</AccordionTrigger>
                <AccordionContent>
                  Fiecare numărător are un cod de încorporare (embed) pe care îl poți copia și lipi 
                  în HTML-ul site-ului tău. Găsești această opțiune în pagina numărătorului, 
                  sub butonul "Partajează".
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>Este CateZile gratuit?</AccordionTrigger>
                <AccordionContent>
                  Da! CateZile oferă un plan gratuit generos care include acces la toate evenimentele 
                  și crearea a până la 5 numărători. Pentru funcționalități avansate, avem și planuri premium.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Pot să adaug evenimente personale?</AccordionTrigger>
                <AccordionContent>
                  Absolut! Pe lângă evenimentele publice din platformă, poți crea evenimente personale 
                  pentru zile de naștere, anniversări, deadline-uri de proiect sau orice alt eveniment important pentru tine.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="bg-muted/30 rounded-lg p-6 text-center space-y-4">
            <h3 className="text-xl font-semibold">Ai nevoie de ajutor suplimentar?</h3>
            <p className="text-muted-foreground">
              Nu ai găsit răspunsul la întrebarea ta? Echipa noastră de suport este aici să te ajute!
            </p>
            <a href="/contact" className="inline-block text-primary hover:underline font-medium">
              Contactează suportul →
            </a>
          </div>
        </div>
      </Container>
    </>
  );
}