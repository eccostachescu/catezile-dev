export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-sm">
        <div>
          <h3 className="font-semibold mb-2">Produs</h3>
          <ul className="space-y-1 text-muted-foreground">
            <li><a href="#" className="story-link">Cum funcționează</a></li>
            <li><a href="#" className="story-link">Prețuri</a></li>
            <li><a href="#" className="story-link">Noutăți</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Categorii populare</h3>
          <ul className="space-y-1 text-muted-foreground">
            <li><a href="/black-friday" className="story-link">Black Friday</a></li>
            <li><a href="/sport" className="story-link">Sport</a></li>
            <li><a href="/filme" className="story-link">Filme</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Resurse</h3>
          <ul className="space-y-1 text-muted-foreground">
            <li><a href="#" className="story-link">Blog</a></li>
            <li><a href="#" className="story-link">Ghid utilizare</a></li>
            <li><a href="#" className="story-link">API</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Companie</h3>
          <ul className="space-y-1 text-muted-foreground">
            <li><a href="/despre" className="story-link">Despre</a></li>
            <li><a href="/contact" className="story-link">Contact</a></li>
            <li><a href="#" className="story-link">Cariere</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Legal</h3>
          <ul className="space-y-1 text-muted-foreground">
            <li><a href="/legal/terms" className="story-link">Termeni</a></li>
            <li><a href="/legal/privacy" className="story-link">Confidențialitate</a></li>
            <li><a href="/legal/cookies" className="story-link">Cookie‑uri</a></li>
            <li><button className="underline underline-offset-4" onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}>Setări cookie</button></li>
            <li><a href="https://anpc.ro/" target="_blank" rel="noopener" className="story-link">ANPC</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground space-y-2">
        <div>© {new Date().getFullYear()} CateZile.ro</div>
        <div>Acest produs folosește API-ul TMDB, fără a fi aprobat sau certificat de TMDB.</div>
      </div>
    </footer>
  );
}

