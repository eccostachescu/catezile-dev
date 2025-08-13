import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LegalCookies() {
  return (
    <>
      <SEO 
        title="Politica de cookie-uri - CateZile" 
        description="Informații despre utilizarea cookie-urilor pe platforma CateZile"
        path="/legal/cookies" 
      />
      <Container>
        <div className="max-w-4xl mx-auto py-8 prose prose-lg max-w-none">
          <h1>Politica de cookie-uri</h1>
          <p className="text-muted-foreground">
            <strong>Data ultimei actualizări:</strong> 13 ianuarie 2024
          </p>

          <h2>1. Ce sunt cookie-urile?</h2>
          <p>
            Cookie-urile sunt fișiere text mici care sunt stocate pe dispozitivul dumneavoastră 
            când vizitați un website. Ele ajută website-ul să "își amintească" informații 
            despre vizita dumneavoastră, cum ar fi preferințele și acțiunile anterioare.
          </p>

          <h2>2. Cum folosim cookie-urile</h2>
          <p>
            CateZile.ro folosește cookie-uri pentru a îmbunătăți experiența utilizatorilor 
            și pentru a înțelege cum este folosită platforma noastră.
          </p>

          <h2>3. Tipurile de cookie-uri folosite</h2>
          
          <div className="not-prose grid gap-4 my-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Cookie-uri esențiale</h3>
                <Badge variant="secondary">Necesare</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Aceste cookie-uri sunt absolut necesare pentru funcționarea website-ului 
                și nu pot fi dezactivate.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Autentificare și sesiune utilizator</li>
                <li>• Preferințe de limbă și regiune</li>
                <li>• Securitate și prevenirea fraudelor</li>
                <li>• Funcționarea coșului de cumpărături</li>
              </ul>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Cookie-uri de funcționalitate</h3>
                <Badge variant="outline">Opționale</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Aceste cookie-uri permit website-ului să își amintească alegerile făcute 
                de dumneavoastră pentru a oferi funcționalități îmbunătățite.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Tema preferată (dark/light mode)</li>
                <li>• Preferințe de notificare</li>
                <li>• Setări de layout personalizate</li>
                <li>• Istoric de căutări salvate</li>
              </ul>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Cookie-uri de analiză</h3>
                <Badge variant="outline">Opționale</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Aceste cookie-uri ne ajută să înțelegem cum interactionează vizitatorii 
                cu website-ul nostru, permițându-ne să îl îmbunătățim.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Google Analytics pentru statistici de utilizare</li>
                <li>• Urmărirea paginilor vizitate</li>
                <li>• Timpul petrecut pe site</li>
                <li>• Sursele de trafic</li>
              </ul>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Cookie-uri de marketing</h3>
                <Badge variant="outline">Opționale</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Aceste cookie-uri sunt folosite pentru a vă afișa reclame relevante 
                pe alte website-uri și pentru a măsura eficacitatea campaniilor.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Retargeting și remarketing</li>
                <li>• Personalizarea reclamelor</li>
                <li>• Măsurarea conversiilor</li>
                <li>• Integrări cu rețele sociale</li>
              </ul>
            </Card>
          </div>

          <h2>4. Cookie-uri de la terți</h2>
          <p>Unele cookie-uri sunt setate de servicii terțe pe care le folosim:</p>
          <ul>
            <li><strong>Google Analytics:</strong> Pentru analize de trafic</li>
            <li><strong>YouTube:</strong> Pentru videoclipuri încorporate</li>
            <li><strong>Facebook:</strong> Pentru butoane de share social</li>
            <li><strong>Supabase:</strong> Pentru autentificare și baze de date</li>
          </ul>

          <h2>5. Durata cookie-urilor</h2>
          <div className="not-prose">
            <table className="w-full border-collapse border border-gray-300 my-4">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-gray-300 p-2 text-left">Tip</th>
                  <th className="border border-gray-300 p-2 text-left">Durata</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">Cookie-uri de sesiune</td>
                  <td className="border border-gray-300 p-2">Se șterg când închideți browser-ul</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Cookie-uri persistente</td>
                  <td className="border border-gray-300 p-2">1 zi - 2 ani (în funcție de scop)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Cookie-uri de analiză</td>
                  <td className="border border-gray-300 p-2">Maximum 24 de luni</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>6. Gestionarea cookie-urilor</h2>
          <h3>6.1 Prin setările browser-ului</h3>
          <p>Puteți controla și șterge cookie-urile prin setările browser-ului:</p>
          <ul>
            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
            <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
            <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
          </ul>

          <h3>6.2 Prin platforma noastră</h3>
          <div className="not-prose my-6">
            <Card className="p-6 text-center">
              <h4 className="text-lg font-semibold mb-2">Setări cookie-uri</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Personalizați preferințele pentru cookie-uri direct din platforma noastră
              </p>
              <button 
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
                onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
              >
                Deschide setări cookie-uri
              </button>
            </Card>
          </div>

          <h2>7. Consecințele refuzului cookie-urilor</h2>
          <p>
            Dacă alegeți să dezactivați anumite cookie-uri, este posibil ca unele 
            funcționalități ale website-ului să nu funcționeze corespunzător:
          </p>
          <ul>
            <li>Pierdeți preferințele salvate</li>
            <li>Este posibil să trebuiască să vă autentificați din nou</li>
            <li>Anumite funcționalități personalizate nu vor fi disponibile</li>
            <li>Experiența de navigare poate fi afectată</li>
          </ul>

          <h2>8. Actualizări ale politicii</h2>
          <p>
            Această politică poate fi actualizată periodic pentru a reflecta 
            modificările în utilizarea cookie-urilor sau în legislație. 
            Data ultimei actualizări este afișată în partea de sus a acestei pagini.
          </p>

          <h2>9. Contact</h2>
          <p>
            Pentru întrebări despre utilizarea cookie-urilor, ne puteți contacta la:
          </p>
          <ul>
            <li>Email: privacy@catezile.ro</li>
            <li>Prin formularul de contact de pe site</li>
          </ul>
        </div>
      </Container>
    </>
  );
}