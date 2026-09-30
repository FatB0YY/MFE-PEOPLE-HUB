import { ApiError, appBus, type User } from '@people-hub/contracts';
import { userApi } from '@people-hub/api-client';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SnapshotStatus = 'loading' | 'ready' | 'error';

export interface UserSnapshot {
  status: SnapshotStatus;
  user: User | null;
  error: string | null;
  reload: () => void;
}

function describeError(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Непредвиденная ошибка';
}

/**
 * Loads the user on mount and then follows `user:updated`.
 *
 * Loading on mount is what keeps a late subscriber from showing an empty card,
 * and it is also what creates the race this hook guards against: an event can
 * arrive while the initial request is still in flight, and the response — a
 * snapshot taken before the save — would otherwise overwrite fresher data.
 * Every applied value carries a generation number; a response from an outdated
 * generation is dropped.
 */
export function useUserSnapshot(): UserSnapshot {
  const [status, setStatus] = useState<SnapshotStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const generation = useRef(0);

  useEffect(() => {
    const requestGeneration = ++generation.current;
    let subscribed = true;

    userApi.getUser().then(
      (loaded) => {
        if (!subscribed || requestGeneration !== generation.current) return;
        setUser(loaded);
        setStatus('ready');
      },
      (failure: unknown) => {
        if (!subscribed || requestGeneration !== generation.current) return;
        setError(describeError(failure));
        setStatus('error');
      },
    );

    // Named on purpose: `off` needs the very same function reference.
    const handleUserUpdated = (updated: User) => {
      // Invalidates any response still in flight.
      generation.current += 1;
      setUser(updated);
      setError(null);
      setStatus('ready');
    };

    appBus.on('user:updated', handleUserUpdated);

    return () => {
      subscribed = false;
      appBus.off('user:updated', handleUserUpdated);
    };
  }, [reloadToken]);

  // Resetting the status here rather than inside the effect: this runs from a
  // click, where changing state is exactly what is supposed to happen.
  const reload = useCallback(() => {
    setStatus('loading');
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  return { status, user, error, reload };
}
