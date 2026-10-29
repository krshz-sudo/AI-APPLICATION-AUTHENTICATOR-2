import type { Transition } from 'framer-motion';

/**
 * Motion Durations (in seconds for Framer Motion).
 * All UI animations stay strictly under the 300ms (0.30s) ceiling.
 */
export const DURATION = {
  /** 0ms — High-frequency actions (Navbar tab switching, search/filter) */
  instant: 0,
  /** 140ms — Micro-feedback, button press, quick modal/popover exits */
  fast: 0.14,
  /** 180ms — Standard entrances: (i) rule popovers, modals, badges, log rows */
  base: 0.18,
  /** 240ms — State resolution: Red → Green validation morph, collapsible drawers */
  slow: 0.24,
} as const;

/**
 * Millisecond equivalents for CSS `transition-duration` coordination.
 */
export const DURATION_MS = {
  instant: 0,
  fast: 140,
  base: 180,
  slow: 240,
} as const;

/**
 * Custom Cubic-Bezier Easing Curves (from emil-design-eng & animate).
 * Never use built-in `ease-in` for UI interactions.
 */
export const EASING = {
  /** Strong ease-out for entrances, popovers, modals, and user-triggered responses */
  easeOut: [0.23, 1, 0.32, 1] as const,
  /** Strong ease-in-out for elements moving or morphing on screen */
  easeInOut: [0.77, 0, 0.175, 1] as const,
  /** iOS-style drawer/accordion curve for collapsible panels (API Log, Specimen) */
  easeDrawer: [0.32, 0.72, 0, 1] as const,
} as const;

/**
 * CSS cubic-bezier string equivalents for inline styles or CSS variables.
 */
export const EASING_CSS = {
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
  easeInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
  easeDrawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
} as const;

/**
 * Physical Spring Presets (from apple-design & DESIGN_DIRECTION.md).
 * Interruptible and velocity-aware; avoids cartoon overshoot.
 */
export const SPRING = {
  /** Tactile damped spring for Red → Green validation resolution & status badges */
  snappy: {
    type: 'spring',
    stiffness: 380,
    damping: 28,
    mass: 0.8,
  } satisfies Transition,

  /** Critically damped spring (no bounce) for layout shifts and stream ordering */
  criticallyDamped: {
    type: 'spring',
    stiffness: 400,
    damping: 36,
    mass: 1,
  } satisfies Transition,

  /** Calm physical settle for medium containers and stage cards */
  gentle: {
    type: 'spring',
    stiffness: 280,
    damping: 30,
    mass: 1,
  } satisfies Transition,
} as const;

/**
 * Standard pre-composed Framer Motion transitions.
 */
export const TRANSITION = {
  fastOut: {
    duration: DURATION.fast,
    ease: EASING.easeOut,
  } satisfies Transition,

  baseOut: {
    duration: DURATION.base,
    ease: EASING.easeOut,
  } satisfies Transition,

  slowOut: {
    duration: DURATION.slow,
    ease: EASING.easeOut,
  } satisfies Transition,

  inOut: {
    duration: DURATION.base,
    ease: EASING.easeInOut,
  } satisfies Transition,

  drawer: {
    duration: DURATION.slow,
    ease: EASING.easeDrawer,
  } satisfies Transition,

  reducedMotion: {
    duration: DURATION.fast,
    ease: 'linear',
  } satisfies Transition,
} as const;
