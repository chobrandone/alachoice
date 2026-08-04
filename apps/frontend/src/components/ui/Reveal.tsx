import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'article' | 'section';
}

/** Fade-up on scroll (24px offset, 0.5s ease-out). Respects reduced motion. */
export function Reveal({ children, delay = 0, className, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={reduce ? undefined : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Staggered container for lists of Reveal items. */
export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
