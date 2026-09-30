import { registerRemotes } from '@module-federation/enhanced/runtime';
import { Button, Card, Skeleton } from '@people-hub/ui';
import { TriangleAlert } from 'lucide-react';
import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useState,
  type ComponentType,
  type ErrorInfo,
  type LazyExoticComponent,
  type ReactNode,
} from 'react';

import type { RemoteComponentModule } from '../lib/remote-module';
import remotes from '../remotes.json';

type RemoteName = keyof typeof remotes;
type RemoteLoader = () => Promise<RemoteComponentModule>;

interface ErrorCatcherProps {
  children: ReactNode;
  renderFallback: () => ReactNode;
}

class ErrorCatcher extends Component<ErrorCatcherProps, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[people-hub] a remote failed to load or render', error, info.componentStack);
  }

  override render() {
    return this.state.failed ? this.props.renderFallback() : this.props.children;
  }
}

function RemotePlaceholder({ moduleName }: { moduleName: string }) {
  return (
    <Card className="space-y-4 p-6">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <span className="sr-only">Загружается модуль {moduleName}</span>
    </Card>
  );
}

function RemoteFallback({
  moduleName,
  port,
  onRetry,
}: {
  moduleName: string;
  port: number;
  onRetry: () => void;
}) {
  return (
    <Card className="space-y-3 border-dashed p-6">
      <div className="flex items-center gap-2 text-destructive">
        <TriangleAlert className="size-4" aria-hidden="true" />
        <p className="font-medium">Модуль {moduleName} не загрузился</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Проверьте, запущен ли его dev-сервер на порту {port}. Остальная страница продолжает
        работать.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Повторить
      </Button>
    </Card>
  );
}

interface RemoteBoundaryProps {
  remoteName: RemoteName;
  loader: RemoteLoader;
}

interface RemoteState {
  attempt: number;
  Component: LazyExoticComponent<ComponentType>;
}

/**
 * Keeps a failing remote local: a module that is down turns into a card with a
 * retry button instead of taking the page with it.
 */
export function RemoteBoundary({ remoteName, loader }: RemoteBoundaryProps) {
  const [state, setState] = useState<RemoteState>(() => ({ attempt: 0, Component: lazy(loader) }));

  const retry = useCallback(() => {
    // Two caches stand in the way of a real retry: the federation runtime
    // remembers that this remote failed, and React.lazy holds on to the
    // rejected promise. Clear the first, rebuild the second.
    //
    // The alias must repeat the name exactly as the build registered it,
    // otherwise `import('summary/SummaryCard')` resolves through a different
    // path and hands React a module it cannot render.
    registerRemotes([{ name: remoteName, alias: remoteName, entry: remotes[remoteName].entry }], {
      force: true,
    });
    setState((previous) => ({ attempt: previous.attempt + 1, Component: lazy(loader) }));
  }, [loader, remoteName]);

  const moduleName = `mfe-${remoteName}`;
  const { Component } = state;

  return (
    <ErrorCatcher
      key={state.attempt}
      renderFallback={() => (
        <RemoteFallback moduleName={moduleName} port={remotes[remoteName].port} onRetry={retry} />
      )}
    >
      <Suspense fallback={<RemotePlaceholder moduleName={moduleName} />}>
        <Component />
      </Suspense>
    </ErrorCatcher>
  );
}
