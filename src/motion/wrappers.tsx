import React from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { DURATION, EASING, SPRING, TRANSITION } from './tokens';
import { useReducedMotionSafe } from './useReducedMotionSafe';

/**
 * Phase 6 — additive motion wrappers.
 *
 * These wrap existing components from the outside so screen logic stays untouched.
 * Rules (see src/motion/README.md + MOTION_AUDIT.md):
 * - Framer Motion animates `opacity` + `transform` only. The single exception is
 *   <Collapse>, which animates `height` because an accordion has no transform equivalent.
 * - Every wrapper reads `useReducedMotionSafe()`; reduced motion = opacity only, no movement.
 */

/* ---------------------------------------------------------------------------------- */
/* 1. Staggered reveal (dossier fields)                                                */
/* ---------------------------------------------------------------------------------- */

/**
 * 30ms per item (remove-animations cap) so 10 fields finish in ~450ms total,
 * instead of the 45ms token default (~630ms).
 */
const FIELD_STAGGER_SECONDS = 0.03;

export const StaggerList: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  const { staggerContainer, prefersReducedMotion } = useReducedMotionSafe();
  const variants: Variants = prefersReducedMotion
    ? staggerContainer
    : {
        ...staggerContainer,
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: FIELD_STAGGER_SECONDS, delayChildren: 0 },
        },
      };

  return (
    <motion.div className={className} variants={variants} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fadeUp } = useReducedMotionSafe();
  return <motion.div variants={fadeUp}>{children}</motion.div>;
};

/**
 * Self-starting fade-up for items that mount one by one (e.g. Stage 1 OCR streaming
 * fields into the pipeline). No parent orchestration needed.
 */
export const FadeUpOnMount: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fadeUp } = useReducedMotionSafe();
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
};

/* ---------------------------------------------------------------------------------- */
/* 3 + 4. Keyed state swap (overall status badge, stage chips, decision diamonds)      */
/* ---------------------------------------------------------------------------------- */

/**
 * Animates ONLY when `swapKey` changes (e.g. FAILED → PASSED). The first render is
 * static (`initial={false}`), so badges don't pop on every screen visit.
 * `popLayout` lifts the outgoing element out of flow so neighbours never jump.
 */
export const StatusSwap: React.FC<{
  swapKey: string;
  className?: string;
  children: React.ReactNode;
}> = ({ swapKey, className, children }) => {
  const { scaleIn, prefersReducedMotion } = useReducedMotionSafe();
  const variants: Variants = prefersReducedMotion
    ? scaleIn
    : {
        hidden: { opacity: 0, scale: 0.96 },
        visible: { opacity: 1, scale: 1, transition: SPRING.snappy },
        exit: { opacity: 0, scale: 0.96, transition: TRANSITION.fastOut },
      };

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={swapKey}
        className={className}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
};

/* ---------------------------------------------------------------------------------- */
/* 7. Collapse (API Log panel)                                                         */
/* ---------------------------------------------------------------------------------- */

export const Collapse: React.FC<{ open: boolean; children: React.ReactNode }> = ({
  open,
  children,
}) => {
  const { prefersReducedMotion } = useReducedMotionSafe();
  const transition = prefersReducedMotion
    ? { height: { duration: 0 }, opacity: TRANSITION.reducedMotion }
    : {
        height: { duration: DURATION.slow, ease: EASING.easeDrawer },
        opacity: { duration: DURATION.base, ease: EASING.easeOut },
      };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="collapse"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={transition}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ---------------------------------------------------------------------------------- */
/* 9. Scenario fade (A–E switching)                                                    */
/* ---------------------------------------------------------------------------------- */

/**
 * Opacity-only, 140ms, no exit phase — the new scenario fades in over the old one's
 * instant removal, so switching never waits on an outgoing animation.
 */
export const ScenarioFade: React.FC<{
  scenarioKey: string;
  className?: string;
  children: React.ReactNode;
}> = ({ scenarioKey, className, children }) => {
  const { getTransition } = useReducedMotionSafe();
  return (
    <motion.div
      key={scenarioKey}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={getTransition(TRANSITION.fastOut)}
    >
      {children}
    </motion.div>
  );
};
