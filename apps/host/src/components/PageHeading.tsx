import { appBus, type NavigationState } from '@people-hub/contracts';
import { Fragment, useEffect, useState } from 'react';

interface PageHeadingProps {
  /** Shown until a remote reports its own heading, and when a remote is down. */
  fallbackTitle: string;
  subtitle: string;
}

export function PageHeading({ fallbackTitle, subtitle }: PageHeadingProps) {
  const [navigation, setNavigation] = useState<NavigationState | null>(null);

  // The remote owns its routes, so it is the one that says what the heading is.
  useEffect(() => {
    appBus.on('navigation:changed', setNavigation);
    return () => {
      appBus.off('navigation:changed', setNavigation);
    };
  }, []);

  const breadcrumbs = navigation?.breadcrumbs ?? [];

  return (
    <div className="space-y-2">
      {breadcrumbs.length > 1 && (
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={crumb.label}>
              {index > 0 && <span aria-hidden="true">/</span>}
              <span>{crumb.label}</span>
            </Fragment>
          ))}
        </nav>
      )}
      <h1 className="text-2xl font-semibold tracking-tight">
        {navigation?.title ?? fallbackTitle}
      </h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
