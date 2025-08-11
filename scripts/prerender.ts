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
  return { html };
}
