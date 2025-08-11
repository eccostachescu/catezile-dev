import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { SEOProvider } from '../src/seo/SEOProvider';
import Layout from '../src/app/layout/Layout';
import Home from '../src/app/pages/Home';
import Event from '../src/app/pages/Event';
import Match from '../src/app/pages/Match';
import Movies from '../src/app/pages/Movies';
import Movie from '../src/app/pages/Movie';
import Category from '../src/app/pages/Category';
import BlackFriday from '../src/app/pages/BlackFriday';

function resolveElement(pathname: string) {
  if (pathname === '/') return <Home />;
  if (pathname === '/black-friday') return <BlackFriday />;
  if (pathname === '/filme') return <Movies />;
  if (/^\/evenimente\//.test(pathname)) return <Event />;
  if (/^\/sport\//.test(pathname)) return <Match />;
  if (/^\/filme\//.test(pathname)) return <Movie />;
  if (/^\/categorii\//.test(pathname)) return <Category />;
  return <Home />;
}

function buildInitialData(pathname: string) {
  if (pathname === '/') return { kind: 'home' };
  if (pathname === '/black-friday') return { kind: 'black-friday' };
  if (pathname === '/filme') return { kind: 'movies' };
  const m1 = pathname.match(/^\/evenimente\/(.+)$/);
  if (m1) return { kind: 'event', slug: m1[1] };
  const m2 = pathname.match(/^\/sport\/(.+)$/);
  if (m2) return { kind: 'match', id: m2[1] };
  const m3 = pathname.match(/^\/filme\/(.+)$/);
  if (m3) return { kind: 'movie', id: m3[1] };
  const m4 = pathname.match(/^\/categorii\/(.+)$/);
  if (m4) return { kind: 'category', slug: m4[1] };
  return { kind: 'generic' };
}

export async function prerender({ url }: { url: string }) {
  const { pathname } = new URL(url, 'http://localhost');
  const app = (
    <SEOProvider>
      <StaticRouter location={pathname}>
        <Layout>
          {resolveElement(pathname)}
        </Layout>
      </StaticRouter>
    </SEOProvider>
  );
  const html = renderToString(app);
  const data = buildInitialData(pathname);
  return { html, data };
}
