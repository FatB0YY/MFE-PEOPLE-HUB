import { appBus, type NavigationState } from '@people-hub/contracts';
import { useEffect } from 'react';

/**
 * Module-level constants on purpose: a fresh object on every render would
 * re-publish the event on every keystroke.
 */
export const MAIN_SECTION_NAVIGATION: NavigationState = {
  title: 'Настройки профиля',
  breadcrumbs: [{ label: 'Профиль' }],
};

export const CONTACTS_SECTION_NAVIGATION: NavigationState = {
  title: 'Настройки профиля',
  breadcrumbs: [{ label: 'Профиль' }, { label: 'Контакты' }],
};

export const UNKNOWN_SECTION_NAVIGATION: NavigationState = {
  title: 'Раздел не найден',
  breadcrumbs: [{ label: 'Профиль' }, { label: 'Неизвестный раздел' }],
};

/** Tells the host what to render in the heading, without revealing the routes behind it. */
export function useNavigationState(state: NavigationState): void {
  useEffect(() => {
    appBus.emit('navigation:changed', state);
  }, [state]);
}
