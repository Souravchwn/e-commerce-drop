# Design System — Galeriaxolo

**Philosophy**: Supreme-style drop culture × Christie's auction elegance. Every pixel earns its place.

---

## Color Tokens (`tailwind.config.ts`)

| Token | Hex | Usage |
|-------|-----|-------|
| `gallery-black` | `#0A0A0A` | Page background |
| `gallery-surface` | `#111111` | Cards, panels |
| `gallery-surface-2` | `#181614` | Elevated / hover surfaces |
| `gallery-border` | `#232320` | All dividers and outlines |
| `gallery-border-w` | `#2D2A26` | Warmer borders (accents) |
| `gallery-gold` | `#C9A96E` | CTAs, live badges, prices, accents |
| `gallery-gold-lt` | `#E8D5A3` | Gold hover state |
| `gallery-cream` | `#F5EFE0` | Primary text |
| `gallery-ivory` | `#EDE8DC` | Secondary text (slightly dimmer) |
| `gallery-muted` | `#7A7570` | Labels, captions, placeholders |
| `gallery-muted-2` | `#3E3B38` | Very dim text, fine print |
| `gallery-red` | `#B84040` | Sold, errors |

**Key rule**: Never use raw hex values in components — always use `gallery-*` tokens.

---

## Typography

| Role | Font | CSS Class | Usage |
|------|------|-----------|-------|
| Display | Cormorant Garamond (300–600) | `font-display` | Titles, prices, hero text |
| Body/UI | Inter (300–500) | `font-sans` | Labels, body copy, nav |
| Mono | Menlo/Consolas | `font-mono` | Reference codes, bank details |

**Loaded via** `next/font/google` in `app/layout.tsx`. CSS variables: `--font-cormorant`, `--font-inter`.

### Type Scale
```
Display title:    font-display text-[30-64px] font-light
Section heading:  font-display text-[22-24px] font-light
Price:            font-display text-[18-26px] font-light tabular-nums text-gallery-gold
Body:             font-sans text-[13px] text-gallery-cream/80 leading-relaxed
Label/nav:        font-sans text-[9-10px] uppercase tracking-[0.22em] text-gallery-muted
Fine print:       font-sans text-[9px] uppercase tracking-[0.22em] text-gallery-muted-2
```

---

## Layout

| Layer | Height | Position |
|-------|--------|----------|
| Announcement bar | `h-8` (32px) | `fixed top-0 z-50` |
| Main header | `h-14` (56px) | `fixed top-8 z-50` |
| Total top offset | 88px | `pt-[88px]` on body |
| Filter bar (home) | `h-11` (44px) | `sticky top-[88px] z-40` |
| Product right panel | `calc(100vh-88px)` | `lg:sticky lg:top-[88px]` |

**Grid**: 1 col mobile → 2 col tablet → 3 col desktop (never 4 — art needs breathing room).

---

## Key UI Patterns

### Announcement Bar
- Background: `gallery-gold`; Text: `gallery-black` 9px tracked uppercase
- CSS marquee animation: `animation: marquee 50s linear infinite` with text repeated 6×

### Navigation Header
- Background: `gallery-black`; border-bottom: `gallery-border`
- Brand: `font-display text-[20px] font-light` — hover `gallery-gold`
- Nav links: `text-[9px] uppercase tracking-[0.22em] text-gallery-muted` — hover `gallery-cream`

### Product Card (ShopGrid)
- Background: `gallery-surface`, gap: `1px bg-gallery-border`
- Image: `aspect-square`, hover: `scale-[1.05] duration-700`
- Hover veil: `bg-gallery-black/0 → /25`
- Status badge: top-right, `bg-gallery-black/75 backdrop-blur-sm`
- Title: `text-[11px] text-gallery-cream/75`; Price: `font-display text-[18px]`

### Product Detail Page
- Split: `lg:grid-cols-[3fr,2fr]` — generous image, constrained details
- Price in `font-display text-[26px] text-gallery-gold`
- CTA: full-width `bg-gallery-gold text-gallery-black` button

### Countdown Clock
- Numbers: `font-display text-[40-48px] font-light text-gallery-cream`
- Colon: `text-gallery-gold`
- Label: `text-[8px] uppercase tracking-[0.2em] text-gallery-muted-2`

### CTAs (Buttons)
- **Primary (live)**: `bg-gallery-gold text-gallery-black` — hover `bg-gallery-gold-lt`
- **Disabled**: `bg-gallery-surface-2 text-gallery-muted border border-gallery-border`
- **All buttons**: `text-[10px] tracking-[0.25em] uppercase py-5 font-medium font-sans`

### Filter Bar
- Active: `bg-gallery-gold text-gallery-black font-medium`
- Inactive: `text-gallery-muted hover:text-gallery-cream`
- Count: `text-gallery-muted-2`

### Live Dot Indicator
```tsx
<span className="w-1.5 h-1.5 bg-gallery-gold"
  style={{ animation: 'pulseDot 2s ease-in-out infinite' }} />
```

---

## Stripe Elements (Dark Theme)
```typescript
theme: 'night',
variables: {
  colorPrimary:    '#C9A96E',
  colorBackground: '#111111',
  colorText:       '#F5EFE0',
  colorDanger:     '#B84040',
  borderRadius:    '0px',
},
rules: {
  '.Input': { border: '1px solid #232320', backgroundColor: '#181614' },
  '.Input:focus': { border: '1px solid #C9A96E', boxShadow: 'none' },
  '.Label': { color: '#7A7570', fontSize: '10px', letterSpacing: '0.18em' },
}
```

---

## CSS Globals (`app/globals.css`)
- `border-radius: 0 !important` — all elements are sharp-cornered (brand identity)
- `::selection` → `bg-gallery-gold text-gallery-black`
- `@keyframes marquee` → 0% → 100% translateX(-50%)
- `@keyframes pulseDot` → opacity 1 → 0.3 → 1

---

## Anti-patterns (never do)
- Light backgrounds (`bg-white`, `bg-gray-*`)
- Round corners (enforced globally by `border-radius: 0`)
- Emoji as status indicators — use colored spans/dots
- Raw hex in components — always use `gallery-*` tokens
- More than one primary CTA per screen
- Horizontal scroll on any page

---

## Files
```
apps/storefront/
  tailwind.config.ts        ← all gallery-* tokens + font vars
  app/globals.css           ← dark base, animations, no-scroll
  app/layout.tsx            ← Cormorant + Inter via next/font
  components/Header.tsx     ← gold bar + dark nav + mobile drawer
  components/ShopGrid.tsx   ← editorial 3-col grid
  components/DropCountdown.tsx ← serif countdown + gold CTA
  components/CartSummary.tsx   ← dark checkout
  components/StripeCardPayment.tsx ← night theme
  components/WirePaymentModule.tsx ← dark wire UI
```
