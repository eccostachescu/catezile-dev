import { Link } from "react-router-dom";
import ThemeSwitchStub from "@/components/ThemeSwitchStub";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/lib/auth";
import { routes } from "@/lib/routes";
import { Button } from "@/components/Button";
import CookieBannerStub from "@/components/CookieBannerStub";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const { user, isAdmin, loading, signInWithEmail, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithEmail(email);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to={routes.home()} className="font-bold text-lg tracking-tight">
          CateZile.ro
        </Link>

        <div className="hidden sm:flex flex-1 max-w-lg mx-4">
          <SearchBar />
        </div>

        <nav aria-label="Acțiuni" className="flex items-center gap-2">
          <Link to={routes.movies()} className="hidden sm:inline-block text-sm underline-offset-4 hover:underline">Filme</Link>
          {/* Mobile search opens a dialog */}
          <div className="sm:hidden">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" aria-haspopup="dialog" aria-label="Deschide căutarea">
                  Caută
                </Button>
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

          {!user ? (
            <>
              <Link to={routes.authLogin()}>
                <Button variant="outline" size="sm" aria-haspopup>
                  Autentificare
                </Button>
              </Link>
              {/* Keep inline magic-link dialog as fallback */}
              {open && (
                <form onSubmit={handleSignIn} className="absolute right-4 top-14 bg-popover border rounded-md p-3 shadow-md w-72">
                  <label htmlFor="email" className="block text-sm mb-1">Email</label>
                  <input id="email" type="email" required className="w-full h-9 rounded-md border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email@exemplu.ro" />
                  <div className="mt-2 flex gap-2 justify-end">
                    <Button type="button" size="sm" variant="ghost" onClick={()=>setOpen(false)}>Anulează</Button>
                    <Button type="submit" size="sm" disabled={loading}>Trimite link</Button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to={routes.account()} className="flex items-center gap-2 px-2">
                <Avatar>
                  <AvatarFallback>{user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">Contul meu</span>
              </Link>
              {isAdmin && (
                <Link to={routes.admin()} className="text-sm underline-offset-4 hover:underline">Admin</Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>Delogare</Button>
            </div>
          )}
        </nav>
      </div>


      <CookieBannerStub />
    </header>
  );
}

