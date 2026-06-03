---
name: Technical Precision
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#424754'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#6b38d4'
  on-secondary: '#ffffff'
  secondary-container: '#8455ef'
  on-secondary-container: '#fffbff'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 16px
  margin: 24px
---

## Brand & Style
The design system focuses on high-density information architecture and technical clarity. It is engineered for power users who require speed, precision, and a "low-latency" visual experience. Drawing inspiration from modern developer environments, the aesthetic is clean and utilitarian, prioritizing content over decoration.

The emotional response should be one of competence and reliability. By utilizing a high-contrast light mode, the interface ensures maximum legibility in professional settings. The style is a blend of **Minimalism** and **Corporate Modern**, characterized by hairline borders, monochromatic surfaces, and purposeful accents of color to indicate status and priority.

## Colors
This design system utilizes a grayscale foundation to provide a neutral canvas for technical data. The primary accent is a precise **Corporate Blue**, used for primary actions and active states. 

- **Primary Blue (#3b82f6):** Focus, action, and progress.
- **Secondary Purple (#8b5cf6):** Task management and secondary features.
- **Tertiary Amber (#f59e0b):** Warnings and attention-required states.
- **Neutral Charcoal (#111827):** Used for primary text to ensure high contrast against white backgrounds.

Surface layers are strictly defined to create hierarchy: `Surface white` for the highest level (cards, modals), `Surface-dim` for the main canvas, and `Surface-container` for recessed elements like sidebars or empty states.

## Typography
**Geist** is the core typeface, chosen for its clean, technical aesthetic and exceptional legibility at small sizes. The typographic scale is optimized for information density.

Headlines use semi-bold weights with tight letter-spacing to create a compact, authoritative feel. Body text is prioritized at 14px and 13px sizes to allow for complex layouts without sacrificing readability. Labels use a slightly increased letter-spacing and medium weight to distinguish them from standard body text, serving as metadata or micro-copy.

## Layout & Spacing
The design system employs a strict **Fluid Grid** based on a 4px baseline. This ensures that all components and layouts remain mathematically aligned, reflecting the precision of developer tools.

- **Desktop:** A 12-column grid with 16px gutters and 24px outer margins.
- **Tablet:** An 8-column grid with 16px gutters and 16px margins.
- **Mobile:** A 4-column grid with 12px gutters and 12px margins.

Spacing is tight to accommodate high-density data. Vertical rhythm should prioritize `sm (8px)` and `md (16px)` units for component spacing, reserving `lg (24px)` for section separation.

## Elevation & Depth
Depth is primarily achieved through **Low-Contrast Outlines** and **Tonal Layers** rather than heavy shadows. This maintains a flat, technical profile that feels integrated into the browser or OS.

1.  **Level 0 (Canvas):** `Surface-dim` (#f9fafb).
2.  **Level 1 (Cards/Sections):** `Surface white` (#ffffff) with a 1px border (#e5e7eb).
3.  **Level 2 (Popovers/Dropdowns):** `Surface white` with a subtle 1px border and a highly diffused, 4% opacity neutral shadow.
4.  **Level 3 (Modals):** `Surface white` with a 1px border and a larger, 8% opacity shadow to create focus.

Background blurs (12px to 20px) should be used sparingly on header navigation or sidebar overlays to maintain context during scroll.

## Shapes
The shape language is controlled and systematic. A **Soft (4px)** radius is the standard for almost all UI elements, including buttons, input fields, and cards. This small radius provides a hint of approachability while maintaining a structured, grid-aligned feel.

- **Standard (rounded):** 4px (0.25rem)
- **Large (rounded-lg):** 8px (0.5rem)
- **Extra Large (rounded-xl):** 12px (0.75rem)

Avoid full pill-shaped buttons unless used for specific tag-like chips to prevent the UI from feeling too casual.

## Components
Components are designed for utility and consistency across the design system.

- **Buttons:** Use a solid primary blue background for the main action. Secondary buttons use a white background with a gray-300 border. Use small padding (8px top/bottom, 12px left/right) to keep them compact.
- **Input Fields:** 1px border (#e5e7eb) with a `Surface-white` background. On focus, the border transitions to Primary Blue with a subtle 2px blue outer glow (ring).
- **Chips/Badges:** Use low-saturation background colors (e.g., light blue background with dark blue text) for status indicators. This ensures they don't distract from the primary content.
- **Lists:** Use subtle hover states (#f3f4f6) and hairline dividers (#f3f4f6) to separate data rows.
- **Checkboxes/Radios:** Small, precise icons with a Primary Blue fill when checked.
- **Cards:** Flat appearance with a 1px border. Do not use shadows unless the card is interactive or draggable.