import { HelmetProvider } from "react-helmet-async";
import { ReactNode, createContext, useContext } from "react";
import { buildCanonical, buildHreflangs } from "./canonical";
import { buildOgUrl } from "./og";
import { routeRobots } from "./robots";

const SEOContext = createContext({ buildCanonical, buildHreflangs, buildOgUrl, routeRobots });

export const useSEO = () => useContext(SEOContext);

export const SEOProvider = ({ children }: { children: ReactNode }) => {
  return (
    <HelmetProvider>
      <SEOContext.Provider value={{ buildCanonical, buildHreflangs, buildOgUrl, routeRobots }}>
        {children}
      </SEOContext.Provider>
    </HelmetProvider>
  );
};

