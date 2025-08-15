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
    define: {
      // Inject cache version for client-side cache busting
      'import.meta.env.VITE_CACHE_VERSION': JSON.stringify(process.env.VITE_CACHE_VERSION || '1'),
      'import.meta.env.VITE_SITE_URL': JSON.stringify(process.env.VITE_SITE_URL || 'http://localhost:5173'),
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
          try { 
            await generateSitemaps(); 
          } catch {
            // Ignore sitemap generation errors during build
          }
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

