import { appBus } from '@people-hub/contracts';
import { cn } from '@people-hub/ui';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const PULSE_MS = 1200;

/**
 * Makes the invisible part of the architecture visible: lights up for a moment
 * whenever `user:updated` travels from one micro-frontend to the other.
 */
export function EventPulse() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Named on purpose: `off` needs the very same function reference.
    const handleUserUpdated = () => {
      setActive(true);
      clearTimeout(timer);
      timer = setTimeout(() => setActive(false), PULSE_MS);
    };

    appBus.on('user:updated', handleUserUpdated);

    return () => {
      clearTimeout(timer);
      appBus.off('user:updated', handleUserUpdated);
    };
  }, []);

  return (
    <div className="hidden flex-col items-center gap-2 self-center lg:flex" aria-hidden="true">
      <span
        className={cn(
          'rounded-md border px-2 py-1 font-mono text-[10px] font-semibold tracking-widest uppercase transition-colors',
          active
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border text-muted-foreground',
        )}
      >
        event
      </span>
      <ArrowRight
        className={cn('size-5 transition-colors', active ? 'text-primary' : 'text-border')}
      />
    </div>
  );
}
