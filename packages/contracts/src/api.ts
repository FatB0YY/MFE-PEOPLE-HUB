import type { User, UserPatch } from './user';

/**
 * The seam between the modules and whatever stores the data.
 * Swapping the in-memory stub for a network client touches one file.
 */
export interface UserApi {
  getUser(): Promise<User>;
  saveUser(patch: UserPatch): Promise<User>;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
