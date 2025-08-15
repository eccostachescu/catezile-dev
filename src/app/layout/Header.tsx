import { Link } from "react-router-dom";
import ThemeSwitchStub from "@/components/ThemeSwitchStub";
import { useAuth } from "@/lib/auth";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/cz-button";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-16 bg-[--cz-surface]/80 backdrop-blur-md border-b border-[--cz-border]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={routes.home()} className="font-heading font-bold text-xl text-[--cz-ink] drop-shadow-sm">
          CateZile<span className="text-[--cz-accent]">.</span>ro
        </Link>

        {/* Desktop Navigation - Extended */}
        <nav className="hidden md:flex items-center space-x-6 flex-1 justify-center">
          <Link to="/tv" className="text-[--cz-ink] hover:text-[--cz-accent] font-semibold transition-colors px-3 py-2 rounded-lg hover:bg-[--cz-surface]">
            TV
          </Link>
          <Link to="/tv/emisiuni" className="text-[--cz-ink] hover:text-[--cz-accent] font-semibold transition-colors px-3 py-2 rounded-lg hover:bg-[--cz-surface]">
            Emisiuni
          </Link>
          <Link to="/filme" className="text-[--cz-ink] hover:text-[--cz-accent] font-semibold transition-colors px-3 py-2 rounded-lg hover:bg-[--cz-surface]">
            Filme
          </Link>
          <Link to="/sport" className="text-[--cz-ink] hover:text-[--cz-accent] font-semibold transition-colors px-3 py-2 rounded-lg hover:bg-[--cz-surface]">
            Sport
          </Link>
          <Link to="/sarbatori" className="text-[--cz-ink] hover:text-[--cz-accent] font-semibold transition-colors px-3 py-2 rounded-lg hover:bg-[--cz-surface]">
            Sărbători
          </Link>
          <Link to="/evenimente" className="text-[--cz-ink] hover:text-[--cz-accent] font-semibold transition-colors px-3 py-2 rounded-lg hover:bg-[--cz-surface]">
            Evenimente
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <ThemeSwitchStub />

          {/* Auth */}
          {!user ? (
            <Link to={routes.authLogin()}>
              <Button variant="subtle" size="sm">
                Autentificare
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link to={routes.account()} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[--cz-border] transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">{user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm text-[--cz-ink]">Contul meu</span>
              </Link>
              {isAdmin && (
                <Link to={routes.admin()} className="text-sm text-[--cz-ink-muted] hover:text-[--cz-ink] transition-colors">
                  Admin
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Delogare
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 border-[--cz-border]" style={{ backgroundColor: 'var(--cz-bg)' }}>
                <div className="flex flex-col gap-6 pt-6">
                  <nav className="flex flex-col gap-4">
                    <Link 
                      to="/tv" 
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[--cz-ink] hover:bg-[--cz-surface] rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      TV
                    </Link>
                    <Link 
                      to="/tv/emisiuni" 
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[--cz-ink] hover:bg-[--cz-surface] rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Emisiuni
                    </Link>
                    <Link 
                      to="/filme" 
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[--cz-ink] hover:bg-[--cz-surface] rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Filme
                    </Link>
                    <Link 
                      to="/sport" 
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[--cz-ink] hover:bg-[--cz-surface] rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sport
                    </Link>
                    <Link 
                      to="/sarbatori" 
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[--cz-ink] hover:bg-[--cz-surface] rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sărbători
                    </Link>
                    <Link 
                      to="/evenimente" 
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[--cz-ink] hover:bg-[--cz-surface] rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Evenimente
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}