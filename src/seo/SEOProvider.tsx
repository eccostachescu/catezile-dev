import { HelmetProvider } from "react-helmet-async";
import { ReactNode } from "react";

export const SEOProvider = ({ children }: { children: ReactNode }) => {
  return (
    <HelmetProvider>
      {children}
    </HelmetProvider>
  );
};
