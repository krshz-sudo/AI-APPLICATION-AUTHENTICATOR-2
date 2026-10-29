import { useMemo } from 'react';
import { useReducedMotion, type Transition, type Variants } from 'framer-motion';
import { TRANSITION } from './tokens';
import {
  fadeUpVariants,
  REDUCED_MOTION_VARIANTS,
  redToGreenValidationVariants,
  scaleInVariants,
  slideInVariants,
  staggerContainerVariants,
  validationBadgeVariants,
  validationHighlightRingVariants,
} from './variants';

export interface ReducedMotionSafeBundle {
  /** True when the OS / browser has `prefers-reduced-motion: reduce` enabled */
  prefersReducedMotion: boolean;
  /** Preset variants automatically swapped to opacity-only when reduced motion is active */
  fadeUp: Variants;
  staggerContainer: Variants;
  scaleIn: Variants;
  slideIn: Variants;
  redToGreenValidation: Variants;
  validationBadge: Variants;
  validationHighlightRing: Variants;
  /** Returns `reducedFallback` (or stripped opacity-only variants) when reduced motion is active */
  getVariants: (standardVariants: Variants, reducedFallback?: Variants) => Variants;
  /** Returns a gentle linear fade transition when reduced motion is active */
  getTransition: (standardTransition: Transition) => Transition;
}

/**
 * Strips spatial transforms (`x`, `y`, `scale`, `rotate`) from an arbitrary `Variants`
 * map so custom component variants also honor `prefers-reduced-motion: reduce`.
 */
export function stripSpatialTransforms(variants: Variants): Variants {
  const stripped: Variants = {};
  for (const [key, value] of Object.entries(variants)) {
    if (typeof value === 'object' && value !== null) {
      const { x: _x, y: _y, scale: _scale, rotate: _rotate, ...rest } =
        value as Record<string, unknown>;
      stripped[key] = {
        ...rest,
        transition: TRANSITION.reducedMotion,
      };
    } else {
      stripped[key] = value;
    }
  }
  return stripped;
}

/**
 * Hook that returns reduced-motion-safe Framer Motion variants and transitions.
 * When `prefers-reduced-motion: reduce` is active, spatial translations (`x`, `y`, `scale`)
 * and stagger delays are neutralized in favor of calm opacity crossfades.
 */
export function useReducedMotionSafe(): ReducedMotionSafeBundle {
  const reduced = useReducedMotion() ?? false;

  return useMemo<ReducedMotionSafeBundle>(
    () => ({
      prefersReducedMotion: reduced,
      fadeUp: reduced ? REDUCED_MOTION_VARIANTS.fadeUp : fadeUpVariants,
      staggerContainer: reduced
        ? REDUCED_MOTION_VARIANTS.staggerContainer
        : staggerContainerVariants,
      scaleIn: reduced ? REDUCED_MOTION_VARIANTS.scaleIn : scaleInVariants,
      slideIn: reduced ? REDUCED_MOTION_VARIANTS.slideIn : slideInVariants,
      redToGreenValidation: reduced
        ? REDUCED_MOTION_VARIANTS.redToGreenValidation
        : redToGreenValidationVariants,
      validationBadge: reduced
        ? REDUCED_MOTION_VARIANTS.validationBadge
        : validationBadgeVariants,
      validationHighlightRing: reduced
        ? REDUCED_MOTION_VARIANTS.validationHighlightRing
        : validationHighlightRingVariants,
      getVariants: (standardVariants: Variants, reducedFallback?: Variants) => {
        if (!reduced) return standardVariants;
        return reducedFallback ?? stripSpatialTransforms(standardVariants);
      },
      getTransition: (standardTransition: Transition) =>
        reduced ? TRANSITION.reducedMotion : standardTransition,
    }),
    [reduced]
  );
}
