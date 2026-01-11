# Whitestone Branding Design System

> **Official brand guidelines for all Whitestone digital projects**
> Last updated: January 2026

This document serves as the single source of truth for Whitestone brand identity across all digital applications, websites, and projects.

---

## Brand Colors

### Primary Palette

| Color Name    | Hex Code  | RGB          | Pantone | Usage                                      |
| ------------- | --------- | ------------ | ------- | ------------------------------------------ |
| **Midnight**  | `#0e1237` | 14, 18, 55   | 2766 C  | Primary dark, headings, high-contrast text |
| **Hudson**    | `#2F6E87` | 47, 110, 135 | 7699 C  | Primary blue, interactive elements, CTAs   |
| **Verdigris** | `#51b3bd` | 81, 180, 190 | 7709 C  | Primary teal, accents, highlights          |

### Supporting Colors

| Color Name   | Hex Code  | RGB           | Usage                                |
| ------------ | --------- | ------------- | ------------------------------------ |
| **Sea Salt** | `#f7f7f7` | 247, 247, 247 | Backgrounds, light surfaces          |
| **Tart**     | `#DF636E` | 223, 99, 110  | Accent red, errors, alerts, emphasis |

### Special Element: Cosmos Gradient

**Cosmos** is a dynamic gradient utilizing Midnight, Hudson, and Verdigris as modifiable anchor points.

- Use for hero sections, backgrounds, and featured design elements
- Anchor points can be adjusted for visual variety
- Maintains brand identity through consistent color palette

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      // Whitestone Brand Colors
      midnight: '#0e1237',
      hudson: '#2F6E87',
      verdigris: '#51b3bd',
      'sea-salt': '#f7f7f7',
      tart: '#DF636E',

      // Semantic Mapping
      primary: {
        DEFAULT: '#2F6E87',  // Hudson
        dark: '#0e1237',     // Midnight
        light: '#51b3bd',    // Verdigris
      },
      accent: '#DF636E',       // Tart
      background: '#f7f7f7',   // Sea Salt
    },
  },
}
```

### Color Usage Guidelines

#### Do's ✅

- Use Midnight for headings and primary text for maximum readability
- Use Hudson for interactive elements (buttons, links, form inputs)
- Use Verdigris for hover states and secondary accents
- Use Sea Salt for page backgrounds and card surfaces
- Use Tart sparingly for errors, warnings, and critical CTAs
- Ensure sufficient contrast ratios (WCAG AA minimum: 4.5:1 for text)

#### Don'ts ❌

- Don't use colors outside the brand palette without approval
- Don't mix Tart with Hudson/Verdigris for primary actions (reserve Tart for alerts)
- Don't use Midnight on dark backgrounds (insufficient contrast)
- Don't overuse gradients - Cosmos is for featured sections only

---

## Typography

### Primary Typeface: Figtree

**Figtree** is a clean yet friendly geometric variable sans-serif with high x-height for excellent legibility.

- **Source**: Google Fonts
- **Type**: Variable sans-serif
- **Characteristics**: Geometric, friendly, highly legible
- **License**: Open Font License

### Font Weights

| Weight        | Numeric Value | Usage                                      |
| ------------- | ------------- | ------------------------------------------ |
| **Regular**   | 400           | Body text, paragraphs, descriptions        |
| **SemiBold**  | 600           | Subheadings, labels, form fields, emphasis |
| **ExtraBold** | 800           | Headings, hero text, major CTAs            |

### Next.js Implementation

```typescript
import { Figtree } from 'next/font/google';

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-figtree',
  display: 'swap',
});

// Apply to document
<html className={figtree.variable}>
  <body className={figtree.className}>
```

### Typography Scale

| Element   | Size            | Weight | Line Height | Letter Spacing           | Color    |
| --------- | --------------- | ------ | ----------- | ------------------------ | -------- |
| **H1**    | 3rem (48px)     | 800    | 1.2         | -0.02em                  | Midnight |
| **H2**    | 2.25rem (36px)  | 800    | 1.3         | -0.01em                  | Midnight |
| **H3**    | 1.875rem (30px) | 600    | 1.4         | 0                        | Midnight |
| **H4**    | 1.5rem (24px)   | 600    | 1.4         | **0.1em** (100 tracking) | Midnight |
| **H5**    | 1.25rem (20px)  | 600    | 1.5         | 0                        | Midnight |
| **Body**  | 1rem (16px)     | 400    | 1.6         | 0                        | Midnight |
| **Small** | 0.875rem (14px) | 400    | 1.5         | 0                        | Midnight |

**Note**: Header Four (H4) requires **100 tracking value** (0.1em letter-spacing) per brand guidelines.

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts
fontFamily: {
  sans: ['var(--font-figtree)', 'system-ui', 'sans-serif'],
},
fontSize: {
  'h1': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '800' }],
  'h2': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '800' }],
  'h3': ['1.875rem', { lineHeight: '1.4', fontWeight: '600' }],
  'h4': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0.1em', fontWeight: '600' }],
  'h5': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
}
```

---

## Logo & Brand Mark

### Logo Concept

The Whitestone logo is inspired by **cairns and lava formations**, reflecting the brand philosophy:

> **"No Two Stones are Alike"**

Each stone represents uniqueness, craftsmanship, and the building blocks of strong brands.

### Logo Files

**Location**: `/public/` directory

| Filename               | Format           | Usage                                 |
| ---------------------- | ---------------- | ------------------------------------- |
| `logo.svg`             | Vector (SVG)     | Primary logo, scalable, web           |
| `logo.png`             | Raster (PNG)     | Fallback, social media                |
| `favicon.ico`          | Icon             | Browser favicon (16x16, 32x32, 48x48) |
| `favicon.svg`          | Vector Icon      | Modern browsers, scalable favicon     |
| `apple-touch-icon.png` | Raster (180x180) | iOS home screen icon                  |

### Logo Variations

1. **Full Color** (Primary)
   - Stone mark + wordmark
   - Use on white or Sea Salt backgrounds

2. **Alternate Full Color**
   - Alternative color treatment
   - Use for variety while maintaining brand identity

3. **Midnight** (Dark)
   - Monochrome dark version
   - Use on light backgrounds

4. **Hudson** (Blue)
   - Monochrome blue version
   - Use when primary logo conflicts with design

5. **White** (Reverse)
   - For dark backgrounds
   - Ensure sufficient contrast

### Logo Usage Guidelines

#### Do's ✅

- Maintain clear space around logo (minimum: logo height × 0.25)
- Use appropriate color variation for background
- Ensure logo is legible at all sizes (test at 24px minimum)
- Use vector formats (SVG) whenever possible

#### Don'ts ❌

- Don't stretch, skew, or distort the logo
- Don't change logo colors outside approved variations
- Don't place logo on busy backgrounds without sufficient contrast
- Don't use low-resolution raster images when vector is available
- Don't separate the stone mark from wordmark without approval

### Implementation

```typescript
// app/layout.tsx - Metadata
export const metadata: Metadata = {
  title: 'Whitestone Branding',
  description: 'Art Request System',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

// Navigation component
import Image from 'next/image';

<Image
  src="/logo.svg"
  alt="Whitestone Branding"
  width={180}
  height={40}
  priority
/>
```

---

## Component Patterns

### Buttons

#### Primary Button (Call-to-Action)

```tsx
<button className="bg-hudson hover:bg-midnight text-white font-semibold px-6 py-3 rounded-lg transition-colors">
  Submit Request
</button>
```

#### Secondary Button

```tsx
<button className="bg-verdigris hover:bg-hudson text-white font-semibold px-6 py-3 rounded-lg transition-colors">
  Save Draft
</button>
```

#### Danger/Alert Button

```tsx
<button className="bg-tart hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
  Delete
</button>
```

#### Outlined Button

```tsx
<button className="border-2 border-hudson text-hudson hover:bg-hudson hover:text-white font-semibold px-6 py-3 rounded-lg transition-all">
  Cancel
</button>
```

### Form Inputs

```tsx
<input
  className="border border-gray-300 focus:border-hudson focus:ring-2 focus:ring-verdigris/20 rounded-md px-4 py-2 transition-all"
  type="text"
/>
```

### Cards

```tsx
<div className="bg-white border border-gray-200 hover:border-hudson rounded-lg p-6 shadow-sm hover:shadow-md transition-all">
  {/* Card content */}
</div>
```

### Links

```tsx
<a className="text-hudson hover:text-midnight underline underline-offset-4 font-semibold transition-colors">
  Learn More
</a>
```

---

## Accessibility Standards

### Color Contrast Requirements

All color combinations must meet **WCAG 2.1 Level AA** standards:

- **Normal text (< 18px)**: Minimum 4.5:1 contrast ratio
- **Large text (≥ 18px or ≥ 14px bold)**: Minimum 3:1 contrast ratio
- **Interactive elements**: Minimum 3:1 contrast ratio against background

### Verified Combinations

| Foreground         | Background         | Contrast Ratio | WCAG Level | Usage               |
| ------------------ | ------------------ | -------------- | ---------- | ------------------- |
| Midnight (#0e1237) | White (#ffffff)    | 17.8:1         | AAA        | Body text, headings |
| Midnight (#0e1237) | Sea Salt (#f7f7f7) | 16.3:1         | AAA        | Text on backgrounds |
| Hudson (#2F6E87)   | White (#ffffff)    | 5.1:1          | AA         | Links, buttons      |
| White (#ffffff)    | Hudson (#2F6E87)   | 5.1:1          | AA         | Button text         |
| White (#ffffff)    | Midnight (#0e1237) | 17.8:1         | AAA        | Reverse text        |

### Focus States

All interactive elements must have visible focus indicators:

```css
focus:outline-none focus:ring-2 focus:ring-verdigris focus:ring-offset-2
```

---

## Brand Downloads

### Official Resources

Logo assets and brand guidelines are available at:
**https://www.whitestonebranding.com/brand**

Download packages include:

- Vector logo files (SVG, AI, EPS)
- Raster logo files (PNG, JPG at multiple resolutions)
- Brand color swatches (ASE, ACO)
- Typography specimens
- Full brand guidelines PDF

---

## Version History

| Version | Date         | Changes                                                 |
| ------- | ------------ | ------------------------------------------------------- |
| 1.0     | January 2026 | Initial brand system documentation for digital projects |

---

## Questions or Additions?

For brand guideline questions or requests to add new patterns, contact:
**Whitestone Creative Team**

**Remember**: Consistency across all touchpoints strengthens brand recognition and trust. When in doubt, refer to this guide or reach out to the creative team.
