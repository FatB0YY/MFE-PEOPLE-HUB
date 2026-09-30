import {
  ApiError,
  EDITABLE_USER_FIELDS,
  REQUIRED_USER_FIELDS,
  appBus,
  type EditableUserField,
  type User,
  type UserPatch,
} from '@people-hub/contracts';
import { userApi } from '@people-hub/api-client';
import { useCallback, useEffect, useRef, useState } from 'react';

export type EditorStatus = 'loading' | 'ready' | 'error';

export type FieldErrors = Partial<Record<EditableUserField, string>>;

export interface ProfileEditor {
  status: EditorStatus;
  loadError: string | null;
  draft: User | null;
  isDirty: boolean;
  errors: FieldErrors;
  saving: boolean;
  saveError: string | null;
  lastSavedAt: number | null;
  setField: (field: EditableUserField, value: string) => void;
  reset: () => void;
  save: () => void;
  reload: () => void;
}

function describeError(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Непредвиденная ошибка';
}

function validate(draft: User): FieldErrors {
  const errors: FieldErrors = {};

  for (const field of REQUIRED_USER_FIELDS) {
    if (draft[field].trim() === '') {
      errors[field] = 'Поле обязательно';
    }
  }

  return errors;
}

/** Only the fields the user actually changed travel to the API. */
function buildPatch(saved: User, draft: User): UserPatch {
  const patch: UserPatch = {};

  for (const field of EDITABLE_USER_FIELDS) {
    if (draft[field] !== saved[field]) {
      patch[field] = draft[field];
    }
  }

  return patch;
}

function hasChanges(saved: User | null, draft: User | null): boolean {
  if (!saved || !draft) return false;
  return EDITABLE_USER_FIELDS.some((field) => draft[field] !== saved[field]);
}

/**
 * Owns the whole form, above the tab routes, so unsaved edits survive switching
 * between "Основное" and "Контакты".
 *
 * This module is the only writer, so it does not subscribe to `user:updated`:
 * reacting to its own event would fight with the draft the user is typing into.
 */
export function useProfileEditor(): ProfileEditor {
  const [status, setStatus] = useState<EditorStatus>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState<User | null>(null);
  const [draft, setDraft] = useState<User | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const mounted = useRef(true);
  const generation = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const requestGeneration = ++generation.current;
    let subscribed = true;

    userApi.getUser().then(
      (loaded) => {
        if (!subscribed || requestGeneration !== generation.current) return;
        setSaved(loaded);
        setDraft(loaded);
        setStatus('ready');
      },
      (error: unknown) => {
        if (!subscribed || requestGeneration !== generation.current) return;
        setLoadError(describeError(error));
        setStatus('error');
      },
    );

    return () => {
      subscribed = false;
    };
  }, [reloadToken]);

  const setField = useCallback((field: EditableUserField, value: string) => {
    setDraft((previous) => (previous ? { ...previous, [field]: value } : previous));
    setErrors((previous) => {
      if (!(field in previous)) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
    setSaveError(null);
  }, []);

  const reset = useCallback(() => {
    setDraft(saved);
    setErrors({});
    setSaveError(null);
  }, [saved]);

  // Resetting the status here rather than inside the effect: this runs from a
  // click, where changing state is exactly what is supposed to happen.
  const reload = useCallback(() => {
    setStatus('loading');
    setLoadError(null);
    setReloadToken((token) => token + 1);
  }, []);

  const save = useCallback(() => {
    if (!draft || !saved || saving) return;

    const validationErrors = validate(draft);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const patch = buildPatch(saved, draft);
    if (Object.keys(patch).length === 0) return;

    setSaving(true);
    setSaveError(null);

    userApi.saveUser(patch).then(
      (updated) => {
        // Published only after the API confirmed: the event means "saved",
        // not "typed". Any request still in flight becomes stale.
        generation.current += 1;
        appBus.emit('user:updated', updated);

        if (!mounted.current) return;
        setSaved(updated);
        setDraft(updated);
        setLastSavedAt(Date.now());
        setSaving(false);
      },
      (error: unknown) => {
        if (!mounted.current) return;
        setSaveError(describeError(error));
        setSaving(false);
      },
    );
  }, [draft, saved, saving]);

  return {
    status,
    loadError,
    draft,
    isDirty: hasChanges(saved, draft),
    errors,
    saving,
    saveError,
    lastSavedAt,
    setField,
    reset,
    save,
    reload,
  };
}
