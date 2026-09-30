import type { ComponentProps } from 'react';

import { cn } from '../lib/utils';

/**
 * Marks which micro-frontend owns a block of the page.
 * Part of the interface on purpose: it makes the module boundaries visible.
 */
export function ModuleBadge({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md bg-success-soft px-2 py-1 font-mono text-[10px] font-semibold tracking-widest text-success uppercase',
        className,
      )}
      {...props}
    />
  );
}
