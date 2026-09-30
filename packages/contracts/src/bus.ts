import { EventEmitter } from 'eventemitter3';

import type { AppEvents } from './events';

/**
 * EventEmitter3 describes a listener by its argument tuple, while the contract
 * keeps one payload per event. This mapping is the only adapter between them.
 */
type BusEvents = { [Name in keyof AppEvents]: [AppEvents[Name]] };

export type AppBus = EventEmitter<BusEvents>;

const APP_BUS_KEY: unique symbol = Symbol.for('people-hub.app-bus');

type BusRegistry = { [APP_BUS_KEY]?: AppBus };

/**
 * Module Federation is supposed to keep this package a singleton, so this
 * registry should never find an existing bus. If it does, sharing is
 * misconfigured and events would silently stop crossing module boundaries:
 * reuse the first bus and say so loudly instead of failing in silence.
 */
function resolveAppBus(): AppBus {
  const registry = globalThis as typeof globalThis & BusRegistry;
  const existing = registry[APP_BUS_KEY];

  if (existing) {
    console.warn(
      '[people-hub] A second event bus instance was created. ' +
        '@people-hub/contracts must be shared as a singleton, otherwise ' +
        'modules subscribe to different buses. Reusing the first instance.',
    );
    return existing;
  }

  const bus = new EventEmitter<BusEvents>();
  registry[APP_BUS_KEY] = bus;
  return bus;
}

export const appBus: AppBus = resolveAppBus();
