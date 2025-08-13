import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";

export default function Contact() {
  return (
    <>
      <SEO 
        title="Contact CateZile" 
        description="Ia legătura cu echipa CateZile pentru întrebări, sugestii sau suport tehnic"
        path="/contact" 
      />
      <Container>
        <div className="max-w-4xl mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Ia legătura cu noi</h1>
            <p className="text-lg text-muted-foreground">
              Suntem aici să te ajutăm și să ascultăm feedback-ul tău
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold">Suport general</h3>
              <p className="text-sm text-muted-foreground">
                Pentru întrebări generale și asistență
              </p>
              <a href="mailto:hello@catezile.ro" className="text-primary hover:underline">
                hello@catezile.ro
              </a>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="font-semibold">Suport tehnic</h3>
              <p className="text-sm text-muted-foreground">
                Pentru probleme tehnice și bug-uri
              </p>
              <a href="mailto:support@catezile.ro" className="text-primary hover:underline">
                support@catezile.ro
              </a>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="font-semibold">Business & Partnerships</h3>
              <p className="text-sm text-muted-foreground">
                Pentru colaborări și oportunități business
              </p>
              <a href="mailto:business@catezile.ro" className="text-primary hover:underline">
                business@catezile.ro
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Trimite-ne un mesaj</h2>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nume</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      placeholder="Numele tău"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      placeholder="email@exemplu.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subiect</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="Despre ce vrei să discuți?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mesaj</label>
                  <textarea 
                    rows={5}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="Spune-ne mai multe..."
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
                >
                  Trimite mesajul
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">FAQ rapid</h2>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Cât de rapid primiți răspuns?</h4>
                  <p className="text-sm text-muted-foreground">
                    De obicei răspundem în maxim 24 de ore în zilele lucrătoare.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Puteți adăuga evenimente noi?</h4>
                  <p className="text-sm text-muted-foreground">
                    Da! Trimite-ne detaliile evenimentului și îl vom adăuga în platformă.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Oferiti suport pentru API?</h4>
                  <p className="text-sm text-muted-foreground">
                    Absolut! Contactează-ne la business@catezile.ro pentru detalii despre API.
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Urmărește-ne</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Rămâi la curent cu ultimele noutăți pe rețelele sociale
                </p>
                <div className="flex gap-4">
                  <a href="#" className="text-primary hover:underline">Facebook</a>
                  <a href="#" className="text-primary hover:underline">Twitter</a>
                  <a href="#" className="text-primary hover:underline">Instagram</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
