---
name: Modern Financial Interface
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#43474f'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737780'
  outline-variant: '#c3c6d1'
  surface-tint: '#3a5f94'
  primary: '#001e40'
  on-primary: '#ffffff'
  primary-container: '#003366'
  on-primary-container: '#799dd6'
  inverse-primary: '#a7c8ff'
  secondary: '#556158'
  on-secondary: '#ffffff'
  secondary-container: '#d9e6da'
  on-secondary-container: '#5b675e'
  tertiary: '#381300'
  on-tertiary: '#ffffff'
  tertiary-container: '#592300'
  on-tertiary-container: '#d8885c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a7c8ff'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#1f477b'
  secondary-fixed: '#d9e6da'
  secondary-fixed-dim: '#bdcabe'
  on-secondary-fixed: '#131e17'
  on-secondary-fixed-variant: '#3e4a41'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#723610'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  h3:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 24px
  margin: 32px
---

## Brand & Style

This design system is built on the principles of **Modern Corporate Minimalism**, prioritizing clarity and trust. The visual language bridges the gap between high-utility productivity tools and the approachable elegance of premium consumer finance.

The aesthetic is defined by "The Invisible Interface"—where layout and typography guide the user's eye toward decision-making without unnecessary decorative friction. It leverages generous whitespace and a refined tactile feel to evoke feelings of security, precision, and ease. The target audience includes both retail users seeking clarity and professional users requiring high-efficiency data management.

## Colors

The palette is anchored by a deep blue primary color to establish institutional authority. Backgrounds use a pure white base with ultra-subtle off-white layering to differentiate content zones. 

A specialized "Success Mint" serves as the primary accent, used for progress indicators, positive trends, and CTA highlights. High-contrast text ensures WCAG AA compliance, with a clear distinction between active interactive elements (Primary Blue) and static structural elements (Slate Neutrals). Use transparency sparingly, primarily for hover states and subtle overlays.

## Typography

This design system utilizes a dual-font strategy. **Manrope** is used for headings to provide a modern, slightly rounded technical character that feels premium and balanced. **Inter** is the workhorse for all body copy and UI labels, selected for its exceptional legibility at small sizes and high x-height.

The hierarchy is strictly enforced through scale. Large headlines are reserved for page titles and balance summaries, while labels use all-caps and increased tracking for categorizing data points without competing with main content.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid Grid**. For desktop applications, the content resides within a max-width container of 1280px to prevent eye strain, while the margins expand. 

The spacing rhythm is built on a 4px baseline, but defaults to 16px (md) and 24px (lg) for most component gaps. Generous padding within cards (min 24px) is required to maintain the "clean" aesthetic. Large tap targets are prioritized for mobile, with buttons maintaining a minimum height of 48px to ensure ease of use during high-stakes financial interactions.

## Elevation & Depth

This design system uses **Ambient Shadows** to create a sense of stacked physical cards. Avoid harsh black shadows; instead, use deep blue or slate-tinted shadows with high blur and low opacity (5-8%). 

- **Level 0 (Background):** Pure White or Soft Neutral (#F8FAFC).
- **Level 1 (Cards):** Pure White with a 1px border (#E2E8F0) and a soft "Long Shadow" (Y: 4, Blur: 20, Spread: 0).
- **Level 2 (Active/Hover):** Increased shadow depth to simulate lifting (Y: 10, Blur: 30, Spread: -5).
- **Level 3 (Modals/Popovers):** Highest contrast, using a 15% opacity backdrop blur to maintain context of the underlying data.

## Shapes

The shape language is defined by significant corner rounding to soften the "institutional" feel of financial data. 

- **Primary Cards:** 16px to 24px radius to create a friendly, Apple Wallet-like container.
- **Buttons & Inputs:** 12px radius, balancing the roundness of the cards while maintaining a professional structure.
- **Search Bars:** Often fully rounded (pill-shaped) to distinguish them as high-priority functional elements.
- **Dividers:** Use 1px hairlines with subtle horizontal gradients or 80% transparency to keep sections separated without visual noise.

## Components

### Buttons
Primary buttons use the Deep Blue background with White text. Secondary buttons use the Subtle Green (#E8F5E9) with a darker green text for low-priority "Success" actions. Hover states should include a slight scale-up (1.02x) rather than just a color change to feel tactile.

### Cards
Cards are the primary container for all financial data. They must include a 1px soft border and the Level 1 shadow. Group related information (e.g., account number and balance) with distinct typographic weights within the same card.

### Inputs & Search
Inputs use a "Focus Ring" style—when active, the 1px border changes to Primary Blue and a 3px soft outer glow in a semi-transparent blue is applied. Search bars should be prominent, often featuring a leading icon (Magnifying Glass) and a shortcut hint (e.g., "⌘K").

### Lists
Transaction lists should remove borders between items, using whitespace and typography to define rows. Use "Actionable Rows" where the entire row serves as a tap target, providing haptic-like feedback on hover/press.

### Status Badges
Chips/Badges use the Subtle Green background with a refined border. For errors, use a soft red tint (#FEE2E2) with high-contrast red text. The corners should be fully rounded (pill-style) to distinguish them from interactive buttons.