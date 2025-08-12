import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ibihfzhrsllndxhfwgvb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaWhmemhyc2xsbmR4aGZ3Z3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzAyNTAsImV4cCI6MjA3MDUwNjI1MH0.Zqikiwqpgb4lksNXcAdLA3fQzZwfV4WwFYzxpAwxCoU";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false, storageKey: 'ssg' }, global: { headers: { 'X-Client-Info': 'ssg-bf' }}});

export async function loadBFHub(year?: number) {
  const now = new Date();
  const y = year || now.getUTCFullYear();

  // Settings for bf_date
  const { data: settings } = await supabase.from('settings').select('key,value').eq('key','bf_date').maybeSingle();
  const bfDate = settings?.value || null;

  const { data: merchants } = await supabase
    .from('bf_merchant')
    .select('id,slug,name,logo_url,priority,active')
    .eq('active', true)
    .order('priority', { ascending: false })
    .limit(24);

  const { data: categories } = await supabase
    .from('bf_category')
    .select('id,slug,name')
    .order('name', { ascending: true })
    .limit(24);

  const { data: offers } = await supabase
    .from('bf_offer')
    .select('id,title,subtitle,price,price_old,discount_percent,image_url,affiliate_link_id,product_url,merchant_id,status,score')
    .eq('status','LIVE')
    .order('score', { ascending: false })
    .limit(40);

  const mids = Array.from(new Set((offers||[]).map((o:any)=>o.merchant_id))).filter(Boolean);
  const { data: merchMeta } = mids.length ? await supabase.from('bf_merchant').select('id,slug,name,logo_url').in('id', mids) : { data: [] } as any;
  const mMap = new Map<string, any>((merchMeta||[]).map((m:any)=>[m.id, m] as const));
  const offersOut = (offers||[]).map((o:any)=>({
    id: o.id,
    title: o.title,
    subtitle: o.subtitle,
    price: o.price,
    price_old: o.price_old,
    discount_percent: o.discount_percent,
    image_url: o.image_url,
    href: o.affiliate_link_id ? `/out/${o.affiliate_link_id}` : (o.product_url || '#'),
    merchant: mMap.get(o.merchant_id) || null,
  }));

  return {
    year: y,
    bfDate,
    merchants: merchants || [],
    categories: categories || [],
    offers: offersOut,
  } as const;
}

export async function loadBFMerchant(slug: string) {
  const { data: merchant } = await supabase.from('bf_merchant').select('id,slug,name,logo_url,program_url').eq('slug', slug).maybeSingle();
  if (!merchant) return null;
  const { data: offers } = await supabase
    .from('bf_offer')
    .select('id,title,subtitle,price,price_old,discount_percent,image_url,affiliate_link_id,product_url,merchant_id,status,score')
    .eq('merchant_id', merchant.id)
    .neq('status','EXPIRED')
    .order('status', { ascending: true })
    .order('score', { ascending: false })
    .limit(80);
  const items = (offers||[]).map((o:any)=>({
    id: o.id,
    title: o.title,
    subtitle: o.subtitle,
    price: o.price,
    price_old: o.price_old,
    discount_percent: o.discount_percent,
    image_url: o.image_url,
    href: o.affiliate_link_id ? `/out/${o.affiliate_link_id}` : (o.product_url || '#'),
  }));
  return { merchant, offers: items } as const;
}

export async function loadBFCategory(slug: string) {
  const { data: category } = await supabase.from('bf_category').select('id,slug,name').eq('slug', slug).maybeSingle();
  if (!category) return null;
  const { data: offers } = await supabase
    .from('bf_offer')
    .select('id,title,subtitle,price,price_old,discount_percent,image_url,affiliate_link_id,product_url,merchant_id,status,score')
    .eq('category_id', category.id)
    .eq('status','LIVE')
    .order('score', { ascending: false })
    .limit(80);
  const mids = Array.from(new Set((offers||[]).map((o:any)=>o.merchant_id))).filter(Boolean);
  const { data: merchMeta } = mids.length ? await supabase.from('bf_merchant').select('id,slug,name,logo_url').in('id', mids) : { data: [] } as any;
  const mMap = new Map<string, any>((merchMeta||[]).map((m:any)=>[m.id, m] as const));
  const items = (offers||[]).map((o:any)=>({
    id: o.id,
    title: o.title,
    subtitle: o.subtitle,
    price: o.price,
    price_old: o.price_old,
    discount_percent: o.discount_percent,
    image_url: o.image_url,
    href: o.affiliate_link_id ? `/out/${o.affiliate_link_id}` : (o.product_url || '#'),
    merchant: mMap.get(o.merchant_id) || null,
  }));
  return { category, offers: items } as const;
}
