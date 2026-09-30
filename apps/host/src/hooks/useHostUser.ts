import { appBus, type User } from '@people-hub/contracts';
import { userApi } from '@people-hub/api-client';
import { useEffect, useRef, useState } from 'react';

type Status = 'loading' | 'ready' | 'error';

interface HostUserState {
  user: User | null;
  status: Status;
}

/**
 * The header avatar makes the host a third consumer of the contract, alongside
 * the two remotes: it loads the user itself and listens for updates.
 *
 * The generation counter guards against a stale response: the request is sent
 * on mount, and an event may arrive while it is still in flight. Without the
 * counter, the slow response would overwrite fresher data.
 */
export function useHostUser(): HostUserState {
  const [state, setState] = useState<HostUserState>({ user: null, status: 'loading' });
  const generation = useRef(0);

  useEffect(() => {
    const requestGeneration = ++generation.current;
    let subscribed = true;

    userApi.getUser().then(
      (loaded) => {
        if (!subscribed || requestGeneration !== generation.current) return;
        setState({ user: loaded, status: 'ready' });
      },
      () => {
        if (!subscribed || requestGeneration !== generation.current) return;
        setState({ user: null, status: 'error' });
      },
    );

    // Named on purpose: `off` needs the very same function reference.
    const handleUserUpdated = (updated: User) => {
      // Invalidates any response still in flight.
      generation.current += 1;
      setState({ user: updated, status: 'ready' });
    };

    appBus.on('user:updated', handleUserUpdated);

    return () => {
      subscribed = false;
      appBus.off('user:updated', handleUserUpdated);
    };
  }, []);

  return state;
}
