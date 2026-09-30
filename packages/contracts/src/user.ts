/**
 * The person whose data the application shows and edits.
 * A single user is enough for this demo, so there is no lookup by id.
 */
/**
 * Every field here is rendered by the summary card: the model carries nothing
 * the other micro-frontend cannot show.
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
}

/** Fields the profile form owns. `id` is deliberately not one of them. */
export const EDITABLE_USER_FIELDS = ['firstName', 'lastName', 'position'] as const;

export type EditableUserField = (typeof EDITABLE_USER_FIELDS)[number];

/** Fields that must be non-empty for the profile to be considered valid. */
export const REQUIRED_USER_FIELDS = [
  'firstName',
  'lastName',
] as const satisfies readonly EditableUserField[];

export type RequiredUserField = (typeof REQUIRED_USER_FIELDS)[number];

/**
 * A partial change to the profile: a present key sets a new value
 * (an empty string clears the field), an absent key leaves the field alone.
 */
export type UserPatch = Partial<Pick<User, EditableUserField>>;

/**
 * Share of non-empty profile fields, in percent.
 * Lives in the contract so that every module computes it the same way.
 */
export function profileCompleteness(user: User): number {
  const filled = EDITABLE_USER_FIELDS.filter((field) => user[field].trim() !== '').length;
  return Math.round((filled / EDITABLE_USER_FIELDS.length) * 100);
}

export function userFullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return [user.firstName.trim(), user.lastName.trim()].filter(Boolean).join(' ');
}

export function userInitials(user: Pick<User, 'firstName' | 'lastName'>): string {
  const initials = [user.firstName.trim(), user.lastName.trim()]
    .filter(Boolean)
    .map((part) => part[0] ?? '')
    .join('');

  return initials ? initials.toUpperCase() : '?';
}
