# MMITPS Brand Guidelines

## Brand Identity

**Company:** MMITPS INC (Multi-Market Institutional Trading Platform System)
**Tagline:** "Trading the institutional way..."

---

## Color System

### Primary Brand Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Brand Primary** | `#10b981` | rgb(16, 185, 129) | Primary actions, CTAs, links, brand elements |
| **Brand Hover** | `#059669` | rgb(5, 150, 105) | Hover states, active states |
| **Brand Light** | `#34d399` | rgb(52, 211, 153) | Light accents, highlights |
| **Brand Dim** | `rgba(16, 185, 129, 0.1)` | - | Subtle backgrounds, borders |

### Accent Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Accent Primary** | `#f43f5e` | rgb(244, 63, 94) | Negative indicators, errors, red candles |
| **Accent Light** | `#fb7185` | rgb(251, 113, 133) | Light error states |

### Status Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Positive** | `#22c55e` | rgb(34, 197, 94) | Success, profit, positive changes |
| **Negative** | `#ef4444` | rgb(239, 68, 68) | Error, loss, negative changes |
| **Warning** | `#10b981` | rgb(16, 185, 129) | Warnings (uses brand color) |
| **Info** | `#10b981` | rgb(16, 185, 129) | Information (uses brand color) |

### Surface Colors

| Name | Light | Dark | Usage |
|------|-------|------|-------|
| **Background** | `#f8fafc` | `#0d0d0d` | Page background |
| **Surface** | `#ffffff` | `#141414` | Cards, containers |
| **Surface 2** | `#f1f5f9` | `#1a1a1a` | Secondary surfaces |
| **Surface 3** | `#e2e8f0` | `#222222` | Tertiary surfaces |

### Border Colors

| Name | Light | Dark | Usage |
|------|-------|------|-------|
| **Border** | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` | Default borders |
| **Border Hover** | `rgba(0,0,0,0.12)` | `rgba(255,255,255,0.14)` | Hover borders |
| **Border Brand** | `rgba(16,185,129,0.3)` | `rgba(16,185,129,0.3)` | Brand accent borders |

---

## Typography

### Font Families

| Type | Font | Fallbacks | Usage |
|------|------|-----------|-------|
| **Sans (Primary)** | Inter Variable | Inter, system-ui, sans-serif | Body text, UI elements |
| **Mono** | JetBrains Mono | Consolas, monospace | Code, data, numbers |
| **Display** | Inter Variable | Inter, system-ui, sans-serif | Headlines, display text |

### Font Sizes

| Token | Size | Line Height | Letter Spacing | Usage |
|-------|------|-------------|----------------|-------|
| `2xs` | 0.625rem | 0.875rem | - | Fine print, labels |
| `display-sm` | 2.5rem | 1.15 | -0.02em | Small display |
| `display-md` | 3.5rem | 1.1 | -0.025em | Medium display |
| `display-lg` | 5rem | 1.05 | -0.03em | Large display |

---

## Spacing System

Based on an 8-point grid:

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 0.25rem (4px) | Minimal spacing |
| `sm` | 0.5rem (8px) | Small spacing |
| `md` | 1rem (16px) | Default spacing |
| `lg` | 2rem (32px) | Large spacing |
| `xl` | 4rem (64px) | Extra large spacing |
| `18` | 4.5rem (72px) | Custom |
| `22` | 5.5rem (88px) | Custom |
| `30` | 7.5rem (120px) | Custom |

---

## Border Radius

**Design Principle:** Sharp Geometry

| Token | Value | Usage |
|-------|-------|-------|
| `none` | 0px | No radius |
| `sm` | 2px | Sharpest, default |
| `DEFAULT` | 2px | Default radius |
| `md` | 4px | Medium radius |
| `lg` | 6px | Maximum for cards |
| `full` | 9999px | Circles, pills |

**Rules:**
- Cards and containers: max `rounded-lg` (6px)
- Buttons: `rounded-sm` or `rounded-md`
- Inputs: `rounded-sm`
- Badges: `rounded-sm`
- No `rounded-xl`, `rounded-2xl`, `rounded-3xl` allowed

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `brand-sm` | `0 0 12px rgba(16,185,129,0.15)` | Subtle brand glow |
| `brand-md` | `0 0 24px rgba(16,185,129,0.25)` | Medium brand glow |
| `brand-lg` | `0 0 48px rgba(16,185,129,0.35)` | Large brand glow |
| `card` | `0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)` | Card shadow |
| `card-hover` | `0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.2)` | Card hover |

---

## Component Patterns

### Card

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 2px;
  padding: 1.5rem;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.card:hover {
  border-color: var(--color-border-hover);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}
```

### Badge

```css
.badge-positive {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 600;
}

.badge-negative {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 600;
}
```

---

## Tailwind Class Reference

### Colors

| Use | Class |
|-----|-------|
| Brand primary | `text-brand-500`, `bg-brand-500`, `border-brand-500` |
| Brand hover | `hover:text-brand-600`, `hover:bg-brand-600` |
| Positive | `text-positive`, `bg-positive` |
| Negative | `text-negative`, `bg-negative` |
| Surface | `bg-surface`, `bg-surface-2`, `bg-surface-3` |
| Border | `border-border`, `border-border-hover` |

### Border Radius

| Use | Class |
|-----|-------|
| Default | `rounded` or `rounded-sm` |
| Medium | `rounded-md` |
| Maximum | `rounded-lg` |
| Circle | `rounded-full` |

---

## Do's and Don'ts

### Do's

- Use `brand-500` (`#10b981`) for primary actions and CTAs
- Use `rounded-sm` or `rounded-md` for most elements
- Use `rounded-lg` (6px) as maximum for cards
- Use Inter Variable for all text
- Use JetBrains Mono for code and data
- Maintain 8-point spacing grid

### Don'ts

- Don't use `#F59E0B` (amber) as primary color
- Don't use `#3B82F6` (blue) as primary accent
- Don't use `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- Don't use `rounded-[16px]` or larger custom values
- Don't mix multiple font families without hierarchy
- Don't use Cabinet Grotesk (not loaded)

---

## Logo Usage

**Primary Logo:** SVG component with emerald (`#10b981`) and rose (`#f43f5e`) colors
**Tagline:** "trading the institutional way..."

**Variations:**
- Horizontal (default)
- Stacked
- Icon-only

**Minimum Size:** 120px width, 40px height

---

*Last Updated: July 2026*
*MMITPS INC. All Rights Reserved.*
