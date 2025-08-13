import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function About() {
  return (
    <>
      <SEO 
        title="Despre CateZile" 
        description="Află povestea CateZile - platforma românească pentru urmărirea evenimentelor importante"
        path="/despre" 
      />
      <Container>
        <div className="max-w-4xl mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Despre CateZile</h1>
            <p className="text-lg text-muted-foreground">
              Platforma românească care te ajută să nu ratezi niciun eveniment important
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p>
              CateZile s-a născut din nevoia simplă de a nu rata evenimente importante. 
              Fie că vorbim despre premiere de filme, meciuri de fotbal, sărbători naționale 
              sau deadline-uri personale, toți avem momente care contează pentru noi.
            </p>

            <h2>Misiunea noastră</h2>
            <p>
              Credem că fiecare moment important merită să fie trăit din plin. 
              De aceea am creat o platformă care nu doar că îți amintește de evenimente, 
              ci transformă așteptarea într-o experiență plăcută prin numărătorile noastre interactive.
            </p>

            <h2>Povestea noastră</h2>
            <p>
              Totul a început în 2023, când echipa noastră de dezvoltatori români și-a dat seama 
              că nu există o platformă locală care să centralizeze informații despre evenimente 
              importante din România. Am vrut să creăm ceva util pentru comunitatea românească, 
              adaptat culturii și necesităților noastre locale.
            </p>

            <h2>Echipa</h2>
            <p>
              Suntem o echipă tânără și pasionată de tehnologie, formată din dezvoltatori, 
              designeri și specialiști în marketing. Ne-am unit în jurul viziunii de a face 
              informația despre evenimente accesibilă tuturor românilor.
            </p>

            <h2>Valorile noastre</h2>
            <ul>
              <li><strong>Simplitate:</strong> Credem că tehnologia trebuie să fie ușor de folosit</li>
              <li><strong>Comunitate:</strong> Construim pentru și împreună cu utilizatorii noștri</li>
              <li><strong>Autenticitate:</strong> Rămânem fideli identității românești</li>
              <li><strong>Inovație:</strong> Căutăm mereu modalități noi de a îmbunătăți experiența</li>
            </ul>
          </div>

          <div className="text-center space-y-4 bg-muted/30 rounded-lg p-8">
            <h3 className="text-xl font-semibold">Hai să construim împreună!</h3>
            <p className="text-muted-foreground">
              CateZile se dezvoltă cu ajutorul comunității. Sugerările, feedback-ul și 
              contribuțiile voastre ne ajută să fim mai buni în fiecare zi.
            </p>
            <a href="/contact" className="inline-block text-primary hover:underline font-medium">
              Spune-ne părerea ta →
            </a>
          </div>
        </div>
      </Container>
    </>
  );
}
