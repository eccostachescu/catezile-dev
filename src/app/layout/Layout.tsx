import { ReactNode, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CookieSettings from "@/components/CookieSettings";

export default function Layout({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = "ro";
    }
  }, []);

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <Header />
      <main role="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CookieSettings />
    </div>
  );
}
