import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function LegalTerms() {
  return (
    <>
      <SEO 
        title="Termeni și condiții - CateZile" 
        description="Termenii și condițiile de utilizare a platformei CateZile"
        path="/legal/terms" 
      />
      <Container>
        <div className="max-w-4xl mx-auto py-8 prose prose-lg max-w-none">
          <h1>Termeni și condiții</h1>
          <p className="text-muted-foreground">
            <strong>Data ultimei actualizări:</strong> 13 ianuarie 2024
          </p>

          <h2>1. Definiții</h2>
          <p>
            În prezentul document, următorii termeni au semnificațiile de mai jos:
          </p>
          <ul>
            <li><strong>"Platforma"</strong> - website-ul CateZile.ro și serviciile aferente</li>
            <li><strong>"Serviciul"</strong> - serviciile oferite prin platformă</li>
            <li><strong>"Utilizator"</strong> - orice persoană care accesează platforma</li>
            <li><strong>"Cont"</strong> - contul de utilizator creat pe platformă</li>
          </ul>

          <h2>2. Acceptarea termenilor</h2>
          <p>
            Prin utilizarea platformei CateZile.ro, acceptați în totalitate și fără restricții 
            acești termeni și condiții. Dacă nu sunteți de acord cu oricare dintre aceștia, 
            vă rugăm să nu utilizați serviciul nostru.
          </p>

          <h2>3. Descrierea serviciului</h2>
          <p>
            CateZile.ro este o platformă care oferă:
          </p>
          <ul>
            <li>Informații despre evenimente (filme, sport, sărbători)</li>
            <li>Numărători inverse până la evenimente</li>
            <li>Notificări prin email</li>
            <li>Widget-uri pentru încorporare în site-uri</li>
            <li>API pentru dezvoltatori</li>
          </ul>

          <h2>4. Înregistrarea contului</h2>
          <p>
            Pentru a accesa anumite funcționalități, este necesar să vă creați un cont. 
            Vă angajați să:
          </p>
          <ul>
            <li>Furnizați informații corecte și actualizate</li>
            <li>Păstrați confidențialitatea datelor de acces</li>
            <li>Notificați imediat orice utilizare neautorizată</li>
            <li>Respectați termenii de utilizare</li>
          </ul>

          <h2>5. Utilizarea permisă</h2>
          <p>Vă este permis să:</p>
          <ul>
            <li>Utilizați platforma conform destinației</li>
            <li>Creați numărători pentru evenimente personale</li>
            <li>Încorporați widget-urile în site-ul dumneavoastră</li>
            <li>Partajați linkuri către evenimente</li>
          </ul>

          <h2>6. Utilizarea interzisă</h2>
          <p>Este strict interzis să:</p>
          <ul>
            <li>Utilizați platforma în scopuri ilegale</li>
            <li>Încărcați conținut ofensator sau ilegal</li>
            <li>Interferați cu funcționarea tehnică</li>
            <li>Copiați sau redistribuiți conținutul fără permisiune</li>
            <li>Creați conturi false sau multiple</li>
          </ul>

          <h2>7. Proprietatea intelectuală</h2>
          <p>
            Toate drepturile de proprietate intelectuală asupra platformei, 
            design-ului, codului sursă și conținutului aparțin CateZile.ro, 
            cu excepția conținutului furnizat de utilizatori.
          </p>

          <h2>8. Limitarea răspunderii</h2>
          <p>
            CateZile.ro nu își asumă răspunderea pentru:
          </p>
          <ul>
            <li>Exactitatea completă a informațiilor despre evenimente</li>
            <li>Întreruperile temporare ale serviciului</li>
            <li>Pierderi datorate utilizării platformei</li>
            <li>Conținutul furnizat de terți</li>
          </ul>

          <h2>9. Modificarea termenilor</h2>
          <p>
            Ne rezervăm dreptul de a modifica acești termeni oricând. 
            Utilizatorii vor fi anunțați prin email despre modificări importante. 
            Continuarea utilizării platformei constituie acceptarea noilor termeni.
          </p>

          <h2>10. Încetarea serviciului</h2>
          <p>
            Ne rezervăm dreptul de a suspenda sau înceta accesul la serviciu 
            în cazul încălcării acestor termeni sau pentru motive tehnice.
          </p>

          <h2>11. Legea aplicabilă</h2>
          <p>
            Acești termeni sunt reglementați de legea română. 
            Orice litigiu va fi soluționat de instanțele competente din România.
          </p>

          <h2>12. Contact</h2>
          <p>
            Pentru întrebări legate de acești termeni, ne puteți contacta la:
          </p>
          <ul>
            <li>Email: legal@catezile.ro</li>
            <li>Adresă: București, România</li>
          </ul>
        </div>
      </Container>
    </>
  );
}