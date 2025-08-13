import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function LegalPrivacy() {
  return (
    <>
      <SEO 
        title="Politica de confidențialitate - CateZile" 
        description="Politica de confidențialitate și protecția datelor personale pe CateZile"
        path="/legal/privacy" 
      />
      <Container>
        <div className="max-w-4xl mx-auto py-8 prose prose-lg max-w-none">
          <h1>Politica de confidențialitate</h1>
          <p className="text-muted-foreground">
            <strong>Data ultimei actualizări:</strong> 13 ianuarie 2024
          </p>

          <h2>1. Introducere</h2>
          <p>
            CateZile.ro ("noi", "nostru") respectă confidențialitatea datelor personale 
            și se angajează să protejeze informațiile utilizatorilor conform 
            Regulamentului General privind Protecția Datelor (GDPR) și legislației românești.
          </p>

          <h2>2. Administratorul datelor</h2>
          <p>
            <strong>Administratorul datelor cu caracter personal:</strong><br />
            CateZile.ro<br />
            Email: privacy@catezile.ro<br />
            Adresă: București, România
          </p>

          <h2>3. Categoriile de date personale colectate</h2>
          <h3>3.1 Date de identificare</h3>
          <ul>
            <li>Adresa de email (obligatorie pentru înregistrare)</li>
            <li>Numele (opțional, pentru personalizare)</li>
          </ul>

          <h3>3.2 Date tehnice</h3>
          <ul>
            <li>Adresa IP</li>
            <li>Tipul de browser și versiunea</li>
            <li>Sistemul de operare</li>
            <li>Datele de navigare (pagini vizitate, timpul petrecut)</li>
          </ul>

          <h3>3.3 Date de utilizare</h3>
          <ul>
            <li>Preferințele pentru evenimente</li>
            <li>Numărătorii create</li>
            <li>Istoric de căutări</li>
          </ul>

          <h2>4. Scopurile și bazele legale ale prelucrării</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-muted">
                <th className="border border-gray-300 p-2">Scop</th>
                <th className="border border-gray-300 p-2">Baza legală</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">Furnizarea serviciului</td>
                <td className="border border-gray-300 p-2">Executarea contractului</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Trimiterea notificărilor</td>
                <td className="border border-gray-300 p-2">Consimțământul</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Îmbunătățirea serviciului</td>
                <td className="border border-gray-300 p-2">Interesul legitim</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Analiza traficului</td>
                <td className="border border-gray-300 p-2">Interesul legitim</td>
              </tr>
            </tbody>
          </table>

          <h2>5. Durata păstrării datelor</h2>
          <ul>
            <li><strong>Conturi active:</strong> Cât timp contul este activ</li>
            <li><strong>Conturi inactive:</strong> 3 ani de la ultima autentificare</li>
            <li><strong>Date de analiză:</strong> Maximum 24 de luni</li>
            <li><strong>Loguri tehnice:</strong> Maximum 12 luni</li>
          </ul>

          <h2>6. Destinatarii datelor</h2>
          <p>Datele dumneavoastră pot fi comunicate către:</p>
          <ul>
            <li><strong>Furnizori de servicii tehnice:</strong> Pentru hosting și mentenanță</li>
            <li><strong>Servicii de email:</strong> Pentru trimiterea notificărilor</li>
            <li><strong>Servicii de analiză:</strong> Pentru îmbunătățirea platformei</li>
          </ul>

          <h2>7. Transferuri internaționale</h2>
          <p>
            Unii furnizori de servicii pot fi localizați în afara UE. 
            În aceste cazuri, ne asigurăm că transferul se face conform GDPR, 
            prin măsuri precum clauzele contractuale standard.
          </p>

          <h2>8. Drepturile dumneavoastră</h2>
          <p>Conform GDPR, aveți următoarele drepturi:</p>
          <ul>
            <li><strong>Dreptul de acces:</strong> Să obțineți confirmarea prelucrării datelor</li>
            <li><strong>Dreptul de rectificare:</strong> Să corectați datele inexacte</li>
            <li><strong>Dreptul la ștergere:</strong> Să solicitați ștergerea datelor</li>
            <li><strong>Dreptul la limitarea prelucrării:</strong> În anumite condiții</li>
            <li><strong>Dreptul la portabilitatea datelor:</strong> Să primiți datele într-un format structurat</li>
            <li><strong>Dreptul de opoziție:</strong> Să vă opuneți anumitor prelucrări</li>
            <li><strong>Dreptul de a vă retrage consimțământul:</strong> Oricând, fără afectarea legalității</li>
          </ul>

          <h2>9. Securitatea datelor</h2>
          <p>Implementăm măsuri tehnice și organizatorice pentru protecția datelor:</p>
          <ul>
            <li>Criptarea în transit și în repaus</li>
            <li>Autentificare cu doi factori</li>
            <li>Monitorizarea accesului</li>
            <li>Backup-uri regulate și securizate</li>
            <li>Formare regulată a personalului</li>
          </ul>

          <h2>10. Cookie-urile</h2>
          <p>
            Utilizăm cookie-uri pentru funcționarea platformei și analiză. 
            Pentru detalii complete, consultați 
            <a href="/legal/cookies" className="text-primary underline">Politica de cookie-uri</a>.
          </p>

          <h2>11. Minori</h2>
          <p>
            Serviciul nostru nu se adresează minorilor sub 16 ani. 
            Nu colectăm în mod intenționat date de la acești utilizatori.
          </p>

          <h2>12. Modificări ale politicii</h2>
          <p>
            Această politică poate fi actualizată periodic. 
            Vă vom informa prin email despre modificările semnificative.
          </p>

          <h2>13. Contact și reclamații</h2>
          <p>
            Pentru exercitarea drepturilor sau întrebări despre prelucrarea datelor:
          </p>
          <ul>
            <li>Email: privacy@catezile.ro</li>
            <li>Formularul de contact de pe site</li>
          </ul>
          <p>
            De asemenea, aveți dreptul să depuneți o plângere la 
            Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal.
          </p>
        </div>
      </Container>
    </>
  );
}