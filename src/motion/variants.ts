import type { Variants } from 'framer-motion';
import { DURATION, EASING, SPRING, TRANSITION } from './tokens';

/**
 * 1. fadeUp — Subtle vertical entrance for progressive OCR field cards
 * and officer decision confirmation banners.
 * Animates only `opacity` and `y` (transform).
 */
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 6,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION.baseOut,
  },
  exit: {
    opacity: 0,
    y: 4,
    transition: TRANSITION.fastOut,
  },
};

/**
 * 2. staggerContainer — Coordinates sequential child entrances (45ms stagger,
 * inside the 30–80ms window from `animate`).
 */
export const staggerContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeOut,
      staggerChildren: 0.045,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeOut,
    },
  },
};

/**
 * 3. scaleIn — Origin-aware popover, modal, and status badge entrance.
 * Starts from `scale: 0.96` (never `scale(0)`).
 * Pair with `style={{ transformOrigin: 'top right' }}` on trigger-anchored popovers.
 */
export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: -4,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: TRANSITION.baseOut,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -4,
    transition: TRANSITION.fastOut,
  },
};

/**
 * 4. slideIn — Streaming telemetry entrance for Agent Activity & API Log entries.
 * Animates `opacity`, `y`, and subtle `scale` so new entries settle smoothly at the top.
 */
export const slideInVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -6,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: TRANSITION.baseOut,
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: TRANSITION.fastOut,
  },
};

/**
 * 5. redToGreenValidationVariants — Composite-only validation state transition
 * for `FieldValidationCard` when an officer edits a field or clicks
 * "Re-verify" / "Auto-Fix All Wrong Fields".
 *
 * Note: Border and background colors transition via CSS (`transition-colors duration-200`),
 * while Framer Motion drives composite-only `scale` and `opacity`.
 */
export const redToGreenValidationVariants: Variants = {
  wrong: {
    opacity: 1,
    scale: 1,
  },
  correct: {
    opacity: 1,
    scale: 1,
    transition: SPRING.snappy,
  },
  reverified: {
    opacity: 1,
    scale: [0.985, 1.01, 1],
    transition: {
      duration: DURATION.slow,
      ease: EASING.easeOut,
    },
  },
};

/**
 * Companion checkmark / status icon pop-in variant for Red → Green resolution.
 * Starts at `scale: 0.92` (never `0` or `0.4`) and settles with a physical spring.
 */
export const validationBadgeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: TRANSITION.fastOut,
  },
};

/**
 * Composite-only emerald highlight overlay variant for newly re-verified fields.
 * Replaces main-thread `boxShadow` keyframe repaints with a GPU-composited
 * `opacity` + `scale` pulse on an absolutely-positioned ring layer.
 */
export const validationHighlightRingVariants: Variants = {
  idle: {
    opacity: 0,
    scale: 1,
  },
  pulse: {
    opacity: [0, 0.32, 0],
    scale: [0.995, 1.012, 1],
    transition: {
      duration: DURATION.slow,
      ease: EASING.easeOut,
    },
  },
};

/**
 * Reduced-Motion Counterparts (`prefers-reduced-motion: reduce`).
 * Strips all spatial translations (`x`, `y`, `scale`) and stagger delays,
 * preserving only a gentle `opacity` crossfade (`140ms`) for state comprehension.
 */
export const REDUCED_MOTION_VARIANTS = {
  fadeUp: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: TRANSITION.reducedMotion },
    exit: { opacity: 0, transition: TRANSITION.reducedMotion },
  } satisfies Variants,

  staggerContainer: {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0, delayChildren: 0 },
    },
    exit: { opacity: 0, transition: TRANSITION.reducedMotion },
  } satisfies Variants,

  scaleIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: TRANSITION.reducedMotion },
    exit: { opacity: 0, transition: TRANSITION.reducedMotion },
  } satisfies Variants,

  slideIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: TRANSITION.reducedMotion },
    exit: { opacity: 0, transition: TRANSITION.reducedMotion },
  } satisfies Variants,

  redToGreenValidation: {
    wrong: { opacity: 1, scale: 1 },
    correct: { opacity: 1, scale: 1, transition: TRANSITION.reducedMotion },
    reverified: { opacity: 1, scale: 1, transition: TRANSITION.reducedMotion },
  } satisfies Variants,

  validationBadge: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: TRANSITION.reducedMotion },
    exit: { opacity: 0, transition: TRANSITION.reducedMotion },
  } satisfies Variants,

  validationHighlightRing: {
    idle: { opacity: 0 },
    pulse: {
      opacity: [0, 0.25, 0],
      transition: { duration: DURATION.fast, ease: 'linear' },
    },
  } satisfies Variants,
} as const;
