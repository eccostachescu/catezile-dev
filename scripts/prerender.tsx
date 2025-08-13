import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { SEOProvider } from '../src/seo/SEOProvider';
import { AuthProvider } from '../src/lib/auth';
import Layout from '../src/app/layout/Layout';
import Home from '../src/app/pages/Home';
import Event from '../src/app/pages/Event';
import Match from '../src/app/pages/Match';
import Movies from '../src/app/pages/Movies';
import Movie from '../src/app/pages/Movie';
import Category from '../src/app/pages/Category';
import BlackFriday from '../src/app/pages/BlackFriday';
import Countdown from '../src/app/pages/Countdown';
import Embed from '../src/app/pages/Embed';
import Tag from '../src/app/pages/Tag';
import Team from '../src/app/pages/Team';
import TVChannel from '../src/app/pages/TVChannel';
import { loadEvent, loadMatch, loadMovie, loadMovies, loadCategory, loadCategoryHub, loadHome, loadCountdown } from '../src/ssg/loader';

function resolveElement(pathname: string) {
  if (pathname === '/') return <Home />;
  if (pathname === '/black-friday') return <BlackFriday />;
  if (pathname === '/filme') return <Movies />;
  if (/^\/evenimente\//.test(pathname)) return <Event />;
  if (/^\/sport\//.test(pathname)) return <Match />;
  if (/^\/filme\//.test(pathname)) return <Movie />;
  if (/^\/categorii\//.test(pathname)) return <Category />;
  if (/^\/c\//.test(pathname)) return <Countdown />;
  if (/^\/embed\//.test(pathname)) return <Embed />;
  if (/^\/tag\//.test(pathname)) return <Tag />;
  if (/^\/echipa\//.test(pathname)) return <Team />;
  if (/^\/tv\//.test(pathname)) return <TVChannel />;
  return <Home />;
}

function buildInitialData(pathname: string) {
  if (pathname === '/') return { kind: 'home' } as any;
  if (pathname === '/black-friday') return { kind: 'black-friday' } as any;
  if (pathname === '/filme') return { kind: 'movies' } as any;
  const m1 = pathname.match(/^\/evenimente\/(.+)$/);
  if (m1) return { kind: 'event', slug: m1[1] } as any;
  const m2 = pathname.match(/^\/sport\/(.+)$/);
  if (m2) return { kind: 'match', id: m2[1] } as any;
  const m3 = pathname.match(/^\/filme\/(.+)$/);
  if (m3) return { kind: 'movie', id: m3[1] } as any;
  const m4y = pathname.match(/^\/categorii\/([^/]+)\/(\d{4})$/);
  if (m4y) return { kind: 'category', slug: m4y[1], year: Number(m4y[2]) } as any;
  const m4 = pathname.match(/^\/categorii\/([^/]+)$/);
  if (m4) return { kind: 'category', slug: m4[1] } as any;
  const m5 = pathname.match(/^\/c\/(.+)$/);
  if (m5) return { kind: 'countdown', id: m5[1] } as any;
  const m6 = pathname.match(/^\/embed\/(.+)$/);
  if (m6) return { kind: 'embed', id: m6[1] } as any;
  return { kind: 'generic' } as any;
}

export async function prerender({ url }: { url: string }) {
  const { pathname } = new URL(url, 'http://localhost');
  const app = (
    <SEOProvider>
      <AuthProvider>
        <StaticRouter location={pathname}>
          <Layout>
            {resolveElement(pathname)}
          </Layout>
        </StaticRouter>
      </AuthProvider>
    </SEOProvider>
  );
  let data = buildInitialData(pathname);
  if (data.kind === 'home') {
    data = { ...data, home: await loadHome() };
  }
  if (data.kind === 'movies') {
    data = { ...data, movies: await loadMovies({}) };
  }
  if (data.kind === 'event' && data.slug) data = { ...data, item: await loadEvent(data.slug) };
  if (data.kind === 'match' && data.id) data = { ...data, item: await loadMatch(data.id) };
  if (data.kind === 'movie' && data.id) data = { ...data, item: await loadMovie(data.id) };
  if (data.kind === 'category' && (data as any).slug) data = { ...data, item: await loadCategoryHub((data as any).slug, { year: (data as any).year }) };
  if (data.kind === 'countdown' && (data as any).id) data = { ...data, item: await loadCountdown((data as any).id) };
  const html = renderToString(app);
  return { html, data };
}
