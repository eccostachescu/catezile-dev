# Brand — T2 Festival Gradient

Acest document definește regulile vizuale pentru CateZile.ro (tema T2 — Festival Gradient).

1) Culori (HSL tokens)
- brand: hsl(30 95% 55%)
- brand-foreground: hsl(20 30% 12%)
- accent: hsl(260 90% 60%)
- bg: hsl(0 0% 100%) / dark: hsl(220 15% 8%)
- fg: hsl(220 15% 12%) / dark: hsl(0 0% 100%)
- muted: hsl(220 12% 96%) / dark: hsl(220 14% 14%)
- card: hsl(0 0% 100%) / dark: hsl(220 14% 12%)
- ring: hsl(260 90% 60%)

Gradient T2
bg-hero: linear-gradient(140deg,#D946EF 0%,#2563EB 55%,#F59E0B 100%)

2) Tipografie
- Inter (UI), DM Sans (accente)
- Features: 'tnum' 1, 'ss01' 1 (pentru cifre tabulare)
- Scale: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl

3) Spațiere & grilă
- container: center, padding 16px, breakpoints până la 1440px
- spacing: 2/4/6/8/12/16/20/24/32/40/56/72

4) Radii & umbre
- --radius-sm: 6px, --radius: 12px, --radius-lg: 16px, --radius-xl: 20px
- Umbre: sm/md/lg definite în globals.css

5) Componente cheie
- Buttons (primary/secondary/outline/ghost/link/destructive); loading; icon slots
- Inputs/Textareas/Select/Switch/Checkbox/RadioGroup
- Tooltip/Toast/Dialog/Dropdown
- Skeleton/EmptyState
- Cards & Timer (Zile:Ore:Minute:Secunde) — accesibil, aria-live=polite

6) Navigație
- Header sticky, Search proeminent (Dialog pe mobil), Theme toggle; Account
- Footer 4 coloane + link Setări cookie
- Breadcrumbs pe pagini

7) Accesibilitate
- Focus vizibil (ring pe --ring)
- Contrast minim AA
- Reduced motion: fără flip pe Timer

8) Do/Don’t
- Do: folosește token-urile și utilitarele (bg-card, bg-hero)
- Don’t: culori hex directe în componente

9) Capturi
- Păstrează capturi în public/brand/ (Buttons, Inputs, Cards, Hero, Timer)
