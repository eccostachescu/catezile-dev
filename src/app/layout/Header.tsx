import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import ThemeSwitchStub from "@/components/ThemeSwitchStub";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/lib/auth";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/cz-button";
import CookieBannerStub from "@/components/CookieBannerStub";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, isAdmin, loading, signInWithEmail, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithEmail(email);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-cz-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={routes.home()} className="font-heading font-semibold text-lg text-cz-foreground">
          CateZile<span className="text-cz-accent">.</span>ro
        </Link>

        {/* Desktop Search */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cz-muted" />
            <input
              type="text"
              placeholder="Caută evenimente, filme, sport..."
              className={cn(
                "w-full h-10 pl-10 pr-4 rounded-full",
                "bg-cz-surface border border-cz-border",
                "text-cz-foreground placeholder:text-cz-muted text-sm",
                "focus:outline-none focus:ring-2 focus:ring-cz-accent focus:ring-offset-2 focus:ring-offset-cz-bg",
                "transition-all duration-cz-fast"
              )}
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link 
            to="/tv" 
            className="text-sm font-medium text-cz-muted hover:text-cz-foreground transition-colors duration-cz-fast"
          >
            TV
          </Link>
          <Link 
            to={routes.movies()} 
            className="text-sm font-medium text-cz-muted hover:text-cz-foreground transition-colors duration-cz-fast"
          >
            Filme
          </Link>
          <Link 
            to={routes.sport()} 
            className="text-sm font-medium text-cz-muted hover:text-cz-foreground transition-colors duration-cz-fast"
          >
            Sport
          </Link>
          <Link 
            to="/sarbatori" 
            className="text-sm font-medium text-cz-muted hover:text-cz-foreground transition-colors duration-cz-fast"
          >
            Sărbători
          </Link>
          <Link 
            to="/evenimente" 
            className="text-sm font-medium text-cz-muted hover:text-cz-foreground transition-colors duration-cz-fast"
          >
            Evenimente
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Search */}
          <div className="lg:hidden">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" icon={<Search className="h-4 w-4" />} />
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Caută</DialogTitle>
                </DialogHeader>
                <SearchBar />
              </DialogContent>
            </Dialog>
          </div>

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
              <Link to={routes.account()} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-cz-surface transition-colors duration-cz-fast">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">{user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm text-cz-foreground">Contul meu</span>
              </Link>
              {isAdmin && (
                <Link to={routes.admin()} className="text-sm text-cz-muted hover:text-cz-foreground transition-colors duration-cz-fast">
                  Admin
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Delogare
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" icon={<Menu className="h-4 w-4" />} />
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-cz-bg border-cz-border">
                <div className="flex flex-col gap-6 pt-6">
                  <nav className="flex flex-col gap-4">
                    <Link 
                      to="/tv" 
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-cz-foreground hover:bg-cz-surface rounded-lg transition-colors duration-cz-fast"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      TV
                    </Link>
                    <Link 
                      to={routes.movies()} 
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-cz-foreground hover:bg-cz-surface rounded-lg transition-colors duration-cz-fast"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Filme
                    </Link>
                    <Link 
                      to={routes.sport()} 
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-cz-foreground hover:bg-cz-surface rounded-lg transition-colors duration-cz-fast"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sport
                    </Link>
                    <Link 
                      to="/sarbatori" 
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-cz-foreground hover:bg-cz-surface rounded-lg transition-colors duration-cz-fast"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sărbători
                    </Link>
                    <Link 
                      to="/evenimente" 
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-cz-foreground hover:bg-cz-surface rounded-lg transition-colors duration-cz-fast"
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

      <CookieBannerStub />
    </header>
  );
}

