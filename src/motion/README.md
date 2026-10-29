# Motion Foundation (`src/motion/`)

Centralized motion tokens, reusable Framer Motion variants, and reduced-motion utilities for the **AI Document Analyser — AICTE Scrutiny & Regulatory Compliance Portal**.

---

## Core Engineering Rules

1. **Composite-Only Properties:** Framer Motion variants in this directory animate **`transform` (`x`, `y`, `scale`, `rotate`) and `opacity` only**. Never animate `boxShadow`, `width`, `height`, `padding`, `margin`, `top`, or `left` in frame-by-frame keyframes.
2. **Color Changes Use CSS:** Background, border, and text color shifts (such as a field card changing from red `NON-COMPLIANT` to green `VALIDATED`) use explicit Tailwind CSS transitions (`transition-colors duration-200 ease-out`), never `transition-all`.
3. **Under 300ms Ceiling:** All UI durations (`DURATION.fast = 140ms`, `DURATION.base = 180ms`, `DURATION.slow = 240ms`) stay strictly under `300ms`.
4. **Never Start from `scale(0)`:** Entrances (`scaleIn`, `validationBadge`) begin at `scale: 0.92–0.98` paired with `opacity: 0`.
5. **Reduced Motion Ships by Default:** Always consume variants through `useReducedMotionSafe()` so users with `prefers-reduced-motion: reduce` receive calm opacity crossfades with zero spatial movement.

---

## Files Overview

- [`tokens.ts`](./tokens.ts) — `DURATION`, `DURATION_MS`, `EASING`, `EASING_CSS`, `SPRING`, and `TRANSITION` presets.
- [`variants.ts`](./variants.ts) — Reusable Framer Motion `Variants` (`fadeUpVariants`, `staggerContainerVariants`, `scaleInVariants`, `slideInVariants`, `redToGreenValidationVariants`, `validationBadgeVariants`, `validationHighlightRingVariants`, and `REDUCED_MOTION_VARIANTS`).
- [`useReducedMotionSafe.ts`](./useReducedMotionSafe.ts) — React hook returning reduced-motion-aware variants and transitions.

---

## When to Use Each Variant

| Variant | Target Components | Purpose |
| :--- | :--- | :--- |
| **`fadeUp`** | Progressive Stage 1 OCR field extraction cards (`PipelineScreen`), officer decision confirmation banner (`ReviewDashboardScreen`). | Bridges newly mounted content with a `6px` vertical settle (`180ms`, `--ease-out`). |
| **`staggerContainer`** | Initial group reveal of extracted dossier field cards (`45ms` stagger). | Prevents 10 cards from popping in as a single rigid block while keeping total group entrance fast. |
| **`scaleIn`** | `(i)` Rule Citation popovers (`FieldValidationCard`), `PdfSnippetModal` dialog, and overall `STATUS:` badges (`PASSED` / `FAILED` / `FLAGGED`). | Origin-aware scale entrance (`0.96 → 1`, `180ms`, `--ease-out`). Set `style={{ transformOrigin: 'top right' }}` on `(i)` popovers. |
| **`slideIn`** | Live streaming entries in the **Agent Activity Log** and **API Log** panels (`PipelineScreen`). | Settles new telemetry entries from the top (`y: -6 → 0, scale: 0.98 → 1`, `180ms`); pair with `layout="position"` on log items. |
| **`redToGreenValidation`** + **`validationBadge`** + **`validationHighlightRing`** | `FieldValidationCard` during inline **Re-verify** and **Auto-Fix All Wrong Fields** (Scenario D). | Combines a tactile physical spring (`stiffness: 380, damping: 28`) on the card/checkmark with a GPU-composited opacity ring pulse (`validationHighlightRing`) and CSS `transition-colors duration-200`. |

---

## Usage Example

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotionSafe } from '../motion/useReducedMotionSafe';

export function RulePopover({ isOpen }: { isOpen: boolean }) {
  const { scaleIn } = useReducedMotionSafe();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ transformOrigin: 'top right' }}
        >
          {/* Popover content */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Where NOT to Use These Variants

Per `MOTION_AUDIT.md` Part 2:
- **Top Navbar screen tabs & Scenario switcher:** Must remain `0ms` instant.
- **History table search & filter rows:** Keyboard-driven filtering must update in `0ms`.
- **Extracted monospace values & handbook clauses:** Never animate text characters while the officer is reading.
- **Formal Scrutiny Report (`ReportScreen`):** Keep static for `window.print()` PDF export integrity.
