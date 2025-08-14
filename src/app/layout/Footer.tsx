export default function Footer() {
  return (
    <footer className="border-t border-cz-border bg-cz-surface">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="font-heading font-semibold mb-4 text-cz-foreground">Produs</h3>
            <ul className="space-y-3 text-cz-muted">
              <li>
                <a 
                  href="/cum-functioneaza" 
                  className="hover:text-cz-foreground transition-colors duration-cz-fast"
                >
                  Cum funcționează
                </a>
              </li>
              <li>
                <a 
                  href="/preturi" 
                  className="hover:text-cz-foreground transition-colors duration-cz-fast"
                >
                  Prețuri
                </a>
              </li>
              <li>
                <a 
                  href="/noutati" 
                  className="hover:text-cz-foreground transition-colors duration-cz-fast"
                >
                  Noutăți
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold mb-4 text-cz-foreground">Categorii</h3>
            <ul className="space-y-3 text-cz-muted">
              <li>
                <a 
                  href="/sport" 
                  className="hover:text-cz-foreground transition-colors duration-cz-fast"
                >
                  Sport
                </a>
              </li>
              <li>
                <a 
                  href="/filme" 
                  className="hover:text-cz-foreground transition-colors duration-cz-fast"
                >
                  Filme
                </a>
              </li>
              <li>
                <a 
                  href="/sarbatori" 
                  className="hover:text-cz-foreground transition-colors duration-cz-fast"
                >
                  Sărbători
                </a>
              </li>
              <li>
                <a 
                  href="/evenimente" 
                  className="hover:text-cz-foreground transition-colors duration-cz-fast"
                >
                  Evenimente
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold mb-4 text-cz-foreground">Resurse</h3>
            <ul className="space-y-3 text-cz-muted">
              <li>
                <a 
                  href="/blog" 
                  className="hover:text-cz-foreground transition-colors duration-cz-fast"
                >
                  Blog
                </a>
              </li>
              <li>
                <a 
                  href="/ghid-utilizare" 
                  className="hover:text-cz-foreground transition-colors duration-cz-fast"
                >
                  Ghid utilizare
                </a>
              </li>
              <li>
                <a 
                  href="/api" 
                  className="hover:text-cz-foreground transition-colors duration-cz-fast"
                >
                  API
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold mb-4 text-cz-foreground">Legal</h3>
            <ul className="space-y-3 text-cz-muted">
              <li>
                <a 
                  href="/legal/terms" 
                  className="hover:text-cz-foreground transition-colors duration-cz-fast"
                >
                  Termeni
                </a>
              </li>
              <li>
                <a 
                  href="/legal/privacy" 
                  className="hover:text-cz-foreground transition-colors duration-cz-fast"
                >
                  Confidențialitate
                </a>
              </li>
              <li>
                <a 
                  href="/legal/cookies" 
                  className="hover:text-cz-foreground transition-colors duration-cz-fast"
                >
                  Cookie‑uri
                </a>
              </li>
              <li>
                <button 
                  className="hover:text-cz-foreground transition-colors duration-cz-fast text-left" 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
                >
                  Setări cookie
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-cz-border mt-8 pt-6 text-center text-xs text-cz-muted space-y-2">
          <div>© {new Date().getFullYear()} CateZile.ro</div>
          <div>Acest produs folosește API-ul TMDB, fără a fi aprobat sau certificat de TMDB.</div>
        </div>
      </div>
    </footer>
  );
}

