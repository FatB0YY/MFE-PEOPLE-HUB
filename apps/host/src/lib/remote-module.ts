import { loadRemote } from '@module-federation/enhanced/runtime';
import type { ComponentType } from 'react';

export interface RemoteComponentModule {
  default: ComponentType;
}

/**
 * Loads an exposed module through the federation runtime instead of a compiled
 * `import()`.
 *
 * The reason is the retry button: recovering from a failed remote requires
 * re-registering it, and the code webpack generates for `import('remote/X')`
 * keeps pointing at the container it captured the first time. The runtime API
 * always resolves against the current registration.
 *
 * The generic still ties each call to the declaration Module Federation
 * generated from the remote, so a change in the exposed component's shape is a
 * type error here rather than a surprise in the browser.
 */
export async function loadRemoteComponent<TModule extends RemoteComponentModule>(
  moduleId: string,
): Promise<TModule> {
  const module = await loadRemote<TModule>(moduleId);

  if (!module) {
    throw new Error(`Remote module ${moduleId} is unavailable`);
  }

  return module;
}
