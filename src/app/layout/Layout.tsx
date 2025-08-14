import { ReactNode, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CookieBannerStub from "@/components/CookieBannerStub";

export default function Layout({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = "ro";
    }
  }, []);

  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: 'var(--cz-bg)', color: 'var(--cz-ink)' }}>
      <Header />
      <main role="main" className="flex-1">
        {children}
      </main>
      <Footer />
      
      {/* Single Cookie Banner Instance */}
      <CookieBannerStub />
    </div>
  );
}
