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
    <header className="sticky top-0 z-50 h-16 bg-[--cz-surface]/80 backdrop-blur-md border-b border-[--cz-border]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={routes.home()} className="font-heading font-semibold text-lg text-[--cz-ink]">
          CateZile<span className="text-[--cz-accent]">.</span>ro
        </Link>

        {/* Desktop Navigation - Extended */}
        <nav className="hidden md:flex items-center space-x-6 flex-1 justify-center">
          <Link to="/tv" className="text-[--cz-ink-muted] hover:text-[--cz-ink] font-medium transition-colors">
            TV
          </Link>
          <Link to="/filme" className="text-[--cz-ink-muted] hover:text-[--cz-ink] font-medium transition-colors">
            Filme
          </Link>
          <Link to="/sport" className="text-[--cz-ink-muted] hover:text-[--cz-ink] font-medium transition-colors">
            Sport
          </Link>
          <Link to="/sarbatori" className="text-[--cz-ink-muted] hover:text-[--cz-ink] font-medium transition-colors">
            Sărbători
          </Link>
          <Link to="/evenimente" className="text-[--cz-ink-muted] hover:text-[--cz-ink] font-medium transition-colors">
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
    </header>
  );
}

