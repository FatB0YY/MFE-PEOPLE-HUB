import { useLocation, useParams } from 'react-router';

/**
 * The prefix the host mounted this module on, discovered at runtime.
 *
 * Inside a splat route, a relative link resolves against the *full* current
 * pathname, so `<Link to="contacts">` would point at /profile/contacts/contacts
 * once the user is already on the contacts tab. Deriving the prefix from the
 * splat parameter keeps the tabs stable, and the module still does not know
 * where it is mounted — it asks the router.
 */
export function useMountPath(): string {
  const { pathname } = useLocation();
  const splat = useParams()['*'] ?? '';

  if (splat.length === 0) return pathname;

  const base = pathname.slice(0, pathname.length - splat.length);
  return base.length > 1 && base.endsWith('/') ? base.slice(0, -1) : base;
}

export function joinMountPath(mountPath: string, segment: string): string {
  return mountPath === '/' ? `/${segment}` : `${mountPath}/${segment}`;
}
