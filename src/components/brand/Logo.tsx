import React from 'react';
import { motion } from 'framer-motion';
import { DURATION, EASING } from '../../motion/tokens';
import { useReducedMotionSafe } from '../../motion/useReducedMotionSafe';

export interface LogoProps {
  /** 'full' renders the mark + "AICTE Scrutiny & Compliance Portal" lockup; 'mark' renders only the icon */
  variant?: 'full' | 'mark';
  /** Pixel dimension of the square mark (default: 36) */
  size?: number;
  /** Whether to run the pathLength stroke-draw load animation (default: false) */
  animated?: boolean;
  /** Render a single-ink monochrome version using CSS `currentColor` */
  monochrome?: boolean;
  /** Surface palette context when not monochrome (default: 'dark') */
  theme?: 'dark' | 'light' | 'monochrome';
  /** Additional wrapper className */
  className?: string;
}

/**
 * Official Hand-Built SVG Logo — "Monolith" (Swiss Monoline Shield-Sheet & Stencil Cut)
 * Product: AICTE Scrutiny & Compliance Portal
 *
 * Built strictly from SVG primitives (<path>, <rect>, <line>):
 * - Razor-thin outer shield-and-folder perimeter outline with horizontal scan-axis ticks
 * - Unified document-shield monolith body with a 45° architectural folded corner
 * - Precision 45° stencil-cut verification check mark slicing cleanly across the right wall
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'mark',
  size = 36,
  animated = false,
  monochrome = false,
  theme = 'dark',
  className = '',
}) => {
  const { prefersReducedMotion } = useReducedMotionSafe();
  const shouldAnimate = animated && !prefersReducedMotion;

  const isMono = monochrome || theme === 'monochrome';
  const isLight = !isMono && theme === 'light';

  const outerOutline = isMono
    ? 'currentColor'
    : isLight
    ? '#0D9488' // teal-600
    : '#14B8A6'; // teal-500

  const monolithFill = isMono
    ? 'none'
    : isLight
    ? '#0B1F3A' // navy
    : '#F8FAFC'; // slate-50

  const monolithStroke = isMono
    ? 'currentColor'
    : isLight
    ? '#0B1F3A'
    : '#F8FAFC';

  const foldAccentFill = isMono
    ? 'none'
    : isLight
    ? '#14B8A6' // teal-500
    : '#0D9488'; // teal-600

  const stencilKnockout = isMono
    ? 'none'
    : isLight
    ? '#F8FAFC'
    : '#071527'; // navy-900

  const checkCoreStroke = isMono ? 'currentColor' : '#14B8A6';

  const drawTransition = (delay = 0) =>
    shouldAnimate
      ? {
          pathLength: {
            duration: DURATION.slow * 2.1,
            ease: EASING.easeOut,
            delay,
          },
          opacity: {
            duration: DURATION.fast,
            delay,
          },
        }
      : { duration: 0 };

  const markSvg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AICTE Scrutiny & Compliance Portal Logo"
      className="shrink-0 select-none"
    >
      {/* Thin outer shield + folded-sheet perimeter outline */}
      <motion.path
        d="M 14 5.5 H 39.5 L 54.5 20.5 V 37 C 54.5 49.5 44.6 57.6 32 61.5 C 19.4 57.6 9.5 49.5 9.5 37 V 10 C 9.5 7.51 11.51 5.5 14 5.5 Z"
        stroke={outerOutline}
        strokeWidth="1.5"
        strokeLinejoin="round"
        initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={drawTransition(0)}
      />

      {/* Horizontal scan-axis registration ticks on outer shield */}
      <line
        x1="6"
        y1="33"
        x2="11"
        y2="33"
        stroke={outerOutline}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="53"
        y1="33"
        x2="58"
        y2="33"
        stroke={outerOutline}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Inner Document-Shield Monolith Body */}
      <motion.path
        d="M 17.5 10.5 H 37.5 L 49.5 22.5 V 36.5 C 49.5 46.4 41.6 53.1 32 56.5 C 22.4 53.1 14.5 46.4 14.5 36.5 V 13.5 C 14.5 11.84 15.84 10.5 17.5 10.5 Z"
        fill={monolithFill}
        stroke={monolithStroke}
        strokeWidth={isMono ? '2.25' : '1.5'}
        strokeLinejoin="round"
        initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={drawTransition(0.07)}
      />

      {/* Architectural 45° folded corner flap */}
      <motion.path
        d="M 37.5 10.5 V 20.5 C 37.5 21.6 38.4 22.5 39.5 22.5 H 49.5 L 37.5 10.5 Z"
        fill={foldAccentFill}
        stroke={isMono ? 'currentColor' : '#0B1F3A'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={drawTransition(0.13)}
      />

      {/* Statutory dossier header bars inside top-left of sheet */}
      <rect
        x="20"
        y="17"
        width="12"
        height="2.25"
        rx="1.125"
        fill={isMono ? 'currentColor' : isLight ? '#F8FAFC' : '#0B1F3A'}
        opacity={isMono ? 0.85 : 0.9}
      />
      <rect
        x="20"
        y="22"
        width="8"
        height="2"
        rx="1"
        fill={isMono ? 'currentColor' : '#FF9933'}
      />

      {/* Deep stencil-cut channel slicing across the document wall */}
      {!isMono && (
        <path
          d="M 22.5 35.5 L 29.5 42.5 L 49.5 22.5"
          stroke={stencilKnockout}
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Precision check mark core */}
      <motion.path
        d="M 22.5 35.5 L 29.5 42.5 L 47 25"
        stroke={checkCoreStroke}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={drawTransition(0.18)}
      />
    </svg>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center ${className}`}>{markSvg}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {markSvg}
      <div className="flex flex-col justify-center">
        <span
          className={`font-sans font-bold tracking-tight leading-none ${
            size >= 56 ? 'text-xl' : size >= 36 ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
          } ${
            isMono
              ? 'text-current'
              : isLight
              ? 'text-navy-900'
              : 'text-white'
          }`}
        >
          AICTE Scrutiny &amp; Compliance Portal
        </span>
        <span
          className={`font-mono text-[10px] font-medium tracking-[0.16em] uppercase mt-1 ${
            isMono
              ? 'text-current opacity-70'
              : isLight
              ? 'text-teal-700'
              : 'text-teal-400'
          }`}
        >
          STATUTORY VERIFICATION ENGINE
        </span>
      </div>
    </div>
  );
};

/**
 * Convenience Monochrome Logo wrapper using CSS `currentColor`
 */
export const LogoMonochrome: React.FC<Omit<LogoProps, 'monochrome' | 'theme'>> = (
  props
) => <Logo {...props} monochrome={true} theme="monochrome" />;

/**
 * Mark-only static version pre-configured for the top navigation bar
 */
export const LogoNavbarMark: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => (
  <Logo
    variant="mark"
    size={size}
    animated={false}
    theme="dark"
    className={className}
  />
);

export default Logo;
