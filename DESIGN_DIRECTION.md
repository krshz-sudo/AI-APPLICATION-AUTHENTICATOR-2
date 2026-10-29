# Design & Motion Direction (`DESIGN_DIRECTION.md`)

**Project:** AI Document Analyser — AICTE Scrutiny & Regulatory Compliance Portal (SIH26261)  
**Branch:** `feat/ui-motion-auth`  
**Skills Applied:** `awesome-design-md`, `design-taste-frontend`, `emil-design-eng`, `animation-vocabulary`

---

## 1. Tone References (`awesome-design-md`) & Recommendation

We evaluated three reference systems from `awesome-design-md` against the needs of an AICTE Scrutiny & EVC Officer reviewing statutory institutional dossiers:

| Candidate | Core Characteristics | Fit for AICTE Regulatory Scrutiny |
| :--- | :--- | :--- |
| **1. Stripe** (`design-md/stripe/DESIGN.md`)<br>**★ RECOMMENDED** | Deep navy ink (`#0d253d`), cool-slate canvas (`#f6f9fc`), white cards with 1px hairlines (`#e3e8ee`), dark-polarity telemetry shells, and strict `tabular-nums` discipline for IDs, dates, and financial/audit figures. | **Best Fit.** Directly mirrors our existing `navy` (`#0B1F3A`) + `#F8FAFC` slate theme. Projects calm institutional authority, audit precision, and high readability (with marketing mesh gradients omitted). |
| **2. Vercel** (`design-md/vercel/DESIGN.md`) | Stark black-and-white structure (`#171717` on `#fafafa`), monospace badge discipline, and semantic color reserved exclusively for status (`pass`, `error`, `warning`). | **Strong Secondary Influence.** Its rule of reserving color strictly for semantic status (`PASSED`, `FAILED`, `FLAGGED`, `REQUIRES HUMAN REVIEW`) keeps the review workspace quiet, though pure black-and-white is colder than our existing navy/teal identity. |
| **3. Linear** (`design-md/linear.app/DESIGN.md`) | Obsidian dark-mode surfaces (`#010102`, `#0f1011`), hairline borders (`#23252a`), and compact HUD density. | **Partial Fit (Telemetry Panels Only).** Excellent reference for the dark right-hand telemetry column (`Agent Activity`, `API Log`, `PostgreSQL Log`), but unsuitable for the main light-mode dossier and PDF specimen canvas. |

### Recommended Direction: **Stripe Institutional Precision (with Vercel Semantic Restraint)**
- **No flashy "AI" aesthetics:** Zero neon glows, rainbow gradients, floating particles, pulsing orbs, or typewriter text effects.
- **Color goes on data and statutory status, not chrome:** Neutral slate surfaces and 1px borders carry the layout; saturated color appears only where an officer must make a decision (`status.red`, `status.green`, `status.amber`, `status.indigo`).

---

## 2. Motion Principles

1. **Restraint First:** High-frequency actions (Navbar tab switching, scenario switching, search filtering) happen in `0ms`. Motion is reserved for state transitions, spatial anchors, and user confirmation.
2. **State Legibility over Decoration:** When a field transitions from `NON-COMPLIANT` (`status.red`) to `VALIDATED` (`status.green`) via *Re-verify* or *Auto-Fix All*, the motion bridges the before/after state so the officer's eye tracks the resolution effortlessly.
3. **Never Start from `scale(0)`:** Elements entering the screen (popovers, modals, badges) start from `scale(0.95–0.98)` and `opacity: 0`. Nothing in the physical world appears from zero volume.
4. **Origin-Aware Spatial Continuity:** Rule citation popovers (`(i)`) scale from their trigger edge (`transform-origin: top right`), and collapsible drawers (`API Log`, `Specimen Preview`) expand smoothly from their header bar.
5. **Composite-Only Performance & Reduced Motion:** Animate `transform` and `opacity` (plus explicit `transition-colors` where needed). Never use `transition-all` or multi-frame `boxShadow` blurs. Respect `prefers-reduced-motion: reduce` by collapsing spatial translations into instant crossfades.

---

## 3. Timing Ranges

All interactive UI motion stays strictly under **`300ms`**:

| Interaction Tier | Target Elements | Duration Range |
| :--- | :--- | :--- |
| **Instant (`0ms`)** | Top Navbar screen switches, History search/filter rows | `0ms` |
| **Micro-Feedback (`100–140ms`)** | Button `:active` press (`scale(0.98)`), Specimen ↔ Field hover ring sync | `100ms – 140ms` |
| **Popovers & Drawers (`150–200ms`)** | `(i)` Rule Citation popover, PDF Snippet modal, API Log collapse, inline edit swap | `150ms – 200ms` |
| **State Resolution (`180–260ms`)** | Field Red → Green validation morph, Stage stepper badge updates, Agent Activity log row slide-in | `180ms – 260ms` (or damped spring) |

---

## 4. Easing Philosophy

Built-in CSS `ease-in` is forbidden (starts slow and feels sluggish). All transitions use custom high-craft curves from `emil-design-eng`:

```css
/* Entrances, popovers, modals, and user-triggered responses */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);

/* On-screen state morphs and layout shifts */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);

/* Collapsible panels (API Log drawer, Upload specimen preview) */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

- **Framer Motion Spring (for Re-verify / Auto-Fix badge & checkmark resolution):**
  `{ type: "spring", stiffness: 380, damping: 28, mass: 0.8 }` — crisp settle with minimal overshoot, avoiding playful cartoon bounce.

---

## 5. Color & Typography Fit (Existing Tailwind Theme — Zero Config Changes)

All styling works strictly within the **existing `tailwind.config.js`** without modifying theme tokens:

### Color Mapping (Existing Tokens Only)
- **Canvas & Surfaces:** `#F8FAFC` (`bg-[#F8FAFC]`) page ground, `bg-white` primary cards, `bg-slate-50` inset wells, and `border-slate-200` / `border-slate-300` 1px structural hairlines.
- **Institutional Chrome (`navy` & `teal`):**
  - `navy` (`#0B1F3A`), `navy-800` (`#102A4C`), `navy-900` (`#071527`) for the top header, primary authoritative actions, and dark-polarity telemetry panels (`Agent Activity`, `API Log`, `PostgreSQL Log`).
  - `teal` (`#14B8A6`, `600: #0D9488`, `700: #0F766E`, `50: #F0FDFA`) for primary interactive CTAs (*Run Verification*, *Re-verify*, *Auto-Fix All*) and active focus rings.
  - `saffron` (`#FF9933`, `50: #FFF7ED`) reserved sparingly for synthetic demo notices.
- **Semantic Regulatory Status (`status.*`):**
  - `status.green` (`#16A34A` + `emerald-50/950`): `PASSED` / `VALIDATED`
  - `status.red` (`#DC2626` + `red-50/950`): `FAILED` / `NON-COMPLIANT`
  - `status.amber` (`#F59E0B` + `amber-50/950`): `FLAGGED` / forensic risk indicators
  - `status.indigo` (`#6366F1` + `indigo-50/950`): `REQUIRES HUMAN REVIEW` / SHC escalation

### Typography Discipline (Existing `font-sans` & `font-mono`)
- **`font-sans` (`Inter`):** Tight, scannable hierarchy (`tracking-tight` on section headers, `text-xs font-semibold uppercase tracking-wider text-slate-600` on field labels, `leading-relaxed` on handbook clause explanations).
- **`font-mono` (`JetBrains Mono`) + `tabular-nums`:** Applied consistently to all AICTE Permanent Institute IDs (`1-5592509`), Application IDs (`1-44642983297`), dates (`15/03/2024`), FSR ratios (`1:25`), cosine similarity scores (`0.91`), and HTTP latencies (`2410ms`) so figures align vertically without horizontal jitter.
