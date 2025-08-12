import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { vitePrerenderPlugin } from "vite-prerender-plugin";
import { generateRoutes } from "./src/ssg/generateRoutes";
import { generateSitemaps } from "./scripts/generate-sitemaps";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const prerenderRoutes = await generateRoutes().catch(() => []);
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      vitePrerenderPlugin({
        prerenderScript: path.resolve(__dirname, 'scripts/prerender.tsx'),
        additionalPrerenderRoutes: prerenderRoutes,
        renderTarget: '#root',
      }),
      {
        name: 'sitemaps-generator',
        async buildStart() {
          try { await generateSitemaps(); } catch {}
        },
        configureServer() {
          generateSitemaps().catch(() => {});
        },
      },
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

