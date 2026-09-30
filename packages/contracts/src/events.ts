import type { User } from './user';

/**
 * One step of the trail the host renders above the page.
 * Deliberately label-only: a remote must not know the host's url layout.
 */
export interface Crumb {
  label: string;
}

export interface NavigationState {
  title: string;
  breadcrumbs: Crumb[];
}

/**
 * The single source of truth for what the modules exchange.
 * Adding an event starts by adding a line here.
 */
export type AppEvents = {
  /** Published only after a successful save, carries the whole fresh user. */
  'user:updated': User;
  /** Published by a remote so the host can render a heading it does not own. */
  'navigation:changed': NavigationState;
};
