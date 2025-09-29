# Transpayra Design System · v0.3

> **Scope:** Visual and UX rules for UI creation (no code or setup instructions).
> **Libraries:** Use **HyperUI** or **Meraki UI** based on specific user instructions. Always ask the user which library to use for each component. Use vanilla Tailwind CSS with custom brand colors defined in the config.

---

## 1) Principles

Before designing any page, always ask me how I want that page to visually appear. This document is a guide, not a strict rulebook.

* **Clarity over decoration.** Simple hierarchy, generous whitespace, readable type.
* **Consistency.** One theme across the product; never mix competing primitives on the same screen.
* **Accessibility (WCAG AA).** Always maintain contrast, visible focus, and keyboard operability.
* **Performance-aware.** Prefer lightweight visuals and motion; avoid heavy effects.

---

## 2) Brand & Color

**Primary (Brand):** `#F0DFC8`
**Secondary:** `#795833`
**Accent:** `#795833` (same hue for a cohesive identity)

**Usage guidance**

* **Primary** is the default surface highlight and CTA fill for low-attention contexts (background accents, light hero panels, informational badges). Pair with **Secondary** text/icons for sufficient contrast.
* **Secondary** is the default **text/ink** and high-attention controls (primary buttons, key headings). Use on light backgrounds for maximum legibility.
* **Accent** mirrors **Secondary** for emphasis (chips, active states, selected tabs) to keep the palette tight.

**Contrast pairing**

* Text and icons placed on **Primary** should use **Secondary** for AA contrast.
* On near-white or very light backgrounds, use **Secondary** for body text and headings.
* Avoid placing long body text in **Primary** on white; reserve **Primary** for fills, cards, and pills.

**Supporting neutrals** *(guidance—choose closest available tokens in the component library)*

* **Base surfaces:** very light neutral for app background; slightly darker neutral for cards/panels.
* **Dividers:** low-contrast neutral; avoid harsh lines.
* **States:**

    * Info: cool blue family (subtle).
    * Success: natural green family.
    * Warning: warm amber family.
    * Error: clear red family.

> Always verify text/background combinations meet WCAG AA contrast. When in doubt, darken **Secondary** slightly or lighten the background.

---

## 3) Typography

* **Tone:** Professional, friendly, and calm. Avoid shouty ALL CAPS except for small labels.
* **Headings:** Clear size steps; strong contrast with body copy; concise line lengths.
* **Body:** Comfortable reading size and line height. Limit paragraph width for readability.
* **Numbers & Data:** Use tabular figures for tables and stats; keep large numbers prominent and scannable.

---

## 4) Spacing & Layout

* **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 (px units).
* **Container:** Max content width ~1280px. Keep consistent side paddings on all breakpoints.
* **Grid:** Prefer simple 12‑column layouts on desktop; collapse to stacked sections on mobile.
* **Whitespace:** Use generous margins between major sections; avoid crowding above the fold.

---

## 5) Radii & Shadows

* **Corner radii:** `md=8`, `lg=12`, `xl=16`, `2xl=20` (px). Cards and key CTAs usually `xl`.
* **Shadows:** Subtle depth only. Small components: light, crisp shadow. Cards/overlays: a soft, slightly larger shadow. Avoid heavy drop shadows.

---

## 6) Components (how to standardize)

* **Primitives:** Build buttons, inputs, cards, badges, tabs, alerts, and modals using the library’s base primitives, mapped to the color tokens above.
* **Sections:** When using **HyperUI** or **Meraki UI** templates, if you still don't have it, ask for the component snippet I want to use (buttons, inputs etc.) normalize colors to **Primary/Secondary/Accent** and to the standard radii/shadows. Ensure consistent spacing and headings.
* **Don’ts:** Do not mix two different button styles on the same view; avoid ad‑hoc colors; avoid custom one‑off paddings that break the spacing scale.

**States & Feedback**

* Hover: gentle lift or color deepening; no abrupt animations.
* Focus: always visible; use a high-contrast ring/border distinct from hover.
* Disabled: lower contrast and remove shadows; cursor default.
* Errors: clear copy, inline help, no alarming animations.

---

## 7) Accessibility

* **Keyboard first:** All interactive elements must be reachable in a logical order; traps are prohibited.
* **Focus styles:** Visible at all times; not removed or hidden.
* **Labels:** Inputs and toggles must have human‑readable labels; associate help/error text with controls.
* **Motion:** Respect reduced‑motion preferences; default to subtle, short transitions.

---

## 8) Imagery & Iconography

* **Icons:** Simple line icons that read well at small sizes; avoid overly decorative sets.
* **Illustrations:** Minimalist, warm tones that match **Primary**; avoid neon accents.
* **Photography:** If used, prefer natural light, warm tones, and inclusive representation.

---

## 9) Content & Voice

* **Voice:** Helpful, concise, and confident. Avoid slang; prefer plain language.
* **Microcopy:** Explain benefits in headlines; keep actions specific (e.g., “Submit salary” vs “Submit”).
* **Tables & Charts:** Prioritize clarity—units, legends, and tooltips must be explicit.

---

## 10) Library Usage Rules

* **HyperUI** and **Meraki UI** are both available for components and sections.
* **Always ask the user** which library to use for each specific component or section.
* **Brand Colors:** Use the custom Tailwind brand colors defined in the config:
  * `brand-primary`: #F0DFC8 (light cream/beige)
  * `brand-secondary`: #795833 (brown)
  * `brand-accent`: #795833 (same as secondary)
* **Normalization:** After using any template, apply brand colors, standard radii/shadows/spacing, and ensure a11y and responsiveness.

---

## 11) Quality Checklist (apply before merging)

* [ ] Only the approved colors used; tokens applied consistently.
* [ ] Spacing follows the scale; no arbitrary single‑use gaps.
* [ ] Headings/Body follow the type hierarchy; no cramped lines.
* [ ] Focus states visible; keyboard path verified.
* [ ] Contrast AA verified for all text elements.
* [ ] Sections from external libraries normalized to our theme.

---

**This document intentionally contains no code or setup instructions.**

**End of v0.2 — Update this when colors, spacing, or component rules change.**
