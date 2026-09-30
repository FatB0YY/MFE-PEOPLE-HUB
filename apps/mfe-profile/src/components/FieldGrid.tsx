import type { EditableUserField } from '@people-hub/contracts';
import { Input, Label, Skeleton } from '@people-hub/ui';

import type { ProfileEditor } from '../hooks/useProfileEditor';

export interface FieldDescriptor {
  field: EditableUserField;
  label: string;
  placeholder?: string;
}

interface FieldGridProps {
  fields: FieldDescriptor[];
  editor: ProfileEditor;
}

export function FieldGrid({ fields, editor }: FieldGridProps) {
  const draft = editor.draft;

  if (editor.status === 'loading' || !draft) {
    return (
      <div className="space-y-5">
        {fields.map((descriptor) => (
          <div key={descriptor.field} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {fields.map(({ field, label, placeholder }) => {
        const id = `profile-${field}`;
        const error = editor.errors[field];

        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={id}>{label}</Label>

            <Input
              id={id}
              value={draft[field]}
              placeholder={placeholder}
              aria-invalid={error ? true : undefined}
              onChange={(event) => editor.setField(field, event.target.value)}
            />

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );
      })}
    </div>
  );
}
