import { Button, cn } from '@people-hub/ui';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';

import { joinMountPath } from '../hooks/useMountPath';
import type { ProfileEditor } from '../hooks/useProfileEditor';

const SAVE_STAYS_FRESH_MS = 60_000;

/**
 * Reading the clock during render would make the component impure, so the
 * passage of time arrives as an event: a timer marks this particular save as
 * no longer fresh, and the next save starts the countdown again.
 */
function useSaveLabel(timestamp: number | null): string | null {
  const [staleTimestamp, setStaleTimestamp] = useState<number | null>(null);

  useEffect(() => {
    if (timestamp === null) return;

    const timer = setTimeout(() => setStaleTimestamp(timestamp), SAVE_STAYS_FRESH_MS);
    return () => clearTimeout(timer);
  }, [timestamp]);

  if (timestamp === null) return null;

  return staleTimestamp === timestamp ? 'Обновлено недавно' : 'Обновлено только что';
}

function SaveHint({ editor }: { editor: ProfileEditor }) {
  const relativeTime = useSaveLabel(editor.lastSavedAt);

  if (editor.saveError) {
    return <span className="text-sm text-destructive">{editor.saveError}</span>;
  }

  if (editor.isDirty) {
    return <span className="text-sm text-muted-foreground">Есть несохранённые изменения</span>;
  }

  if (relativeTime) {
    return <span className="text-sm text-muted-foreground">{relativeTime}</span>;
  }

  return null;
}

function TabLink({ to, end, children }: { to: string; end?: boolean; children: string }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-1.5 text-sm transition-colors',
          isActive
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )
      }
    >
      {children}
    </NavLink>
  );
}

/**
 * Tabs are sub-routes, not local state, so a direct link to a section works
 * and the browser's back button does what the user expects.
 */
export function TabStrip({ mountPath }: { mountPath: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
      <TabLink to={mountPath} end>
        Основное
      </TabLink>
      <TabLink to={joinMountPath(mountPath, 'contacts')}>Контакты</TabLink>
    </div>
  );
}

export function EditorFooter({ editor }: { editor: ProfileEditor }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border bg-muted/40 px-6 py-4">
      <Button
        onClick={editor.save}
        disabled={!editor.isDirty || editor.saving || editor.status !== 'ready'}
      >
        {editor.saving ? 'Сохранение…' : 'Сохранить'}
      </Button>

      {editor.isDirty && !editor.saving && (
        <Button variant="ghost" size="sm" onClick={editor.reset}>
          Отменить
        </Button>
      )}

      <SaveHint editor={editor} />
    </div>
  );
}
