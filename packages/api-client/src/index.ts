import { ApiError, type User, type UserApi, type UserPatch } from '@people-hub/contracts';

const BASE_URL = '/api';
const TIMEOUT_MS = 10_000;

/**
 * The client holds no state, which is why it is not a shared singleton: every
 * bundle may carry its own copy and they all behave identically. The single
 * source of truth is the server on the other side of `fetch`.
 */
async function request<TResult>(path: string, init?: RequestInit): Promise<TResult> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', ...init?.headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ApiError('Сервис недоступен');
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response));
  }

  return (await response.json()) as TResult;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      return body.message;
    }
  } catch {
    // The body was not JSON: fall through to the generic message.
  }

  return `Запрос завершился ошибкой ${response.status}`;
}

export const userApi: UserApi = {
  getUser: () => request<User>('/user'),
  saveUser: (patch: UserPatch) =>
    request<User>('/user', { method: 'PATCH', body: JSON.stringify(patch) }),
};

interface FailureState {
  simulated: boolean;
}

/**
 * Exists only because the backend here is a mock: the host header flips a
 * server-side switch instead of a flag in a module both modules can reach.
 */
export const mockControlApi = {
  isFailureSimulated: async () => (await request<FailureState>('/debug/failure')).simulated,
  setFailureSimulated: async (simulated: boolean) =>
    (
      await request<FailureState>('/debug/failure', {
        method: 'POST',
        body: JSON.stringify({ simulated }),
      })
    ).simulated,
};
