import type { User, UserPatch } from '@people-hub/contracts';
import { HttpResponse, delay, http } from 'msw';
import { setupWorker } from 'msw/browser';

const MIN_LATENCY_MS = 600;
const MAX_LATENCY_MS = 800;

/** Position left empty on purpose: the completeness indicator starts below 100% and has somewhere to go. */
const INITIAL_USER: User = {
  id: 'u-1',
  firstName: 'Анна',
  lastName: 'Крылова',
  position: '',
};

let storedUser: User = INITIAL_USER;
let failureSimulated = false;

function latency(): number {
  return MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS);
}

export const handlers = [
  http.get('/api/user', async () => {
    // Read when the request arrives, answer later: that is what makes a
    // response older than a write that landed while it was in flight.
    const snapshot = { ...storedUser };
    const shouldFail = failureSimulated;

    await delay(latency());

    if (shouldFail) {
      return HttpResponse.json({ message: 'Не удалось загрузить профиль' }, { status: 500 });
    }

    return HttpResponse.json(snapshot);
  }),

  http.patch('/api/user', async ({ request }) => {
    const patch = (await request.json()) as UserPatch;
    const shouldFail = failureSimulated;

    await delay(latency());

    if (shouldFail) {
      return HttpResponse.json({ message: 'Не удалось сохранить изменения' }, { status: 500 });
    }

    storedUser = { ...storedUser, ...patch };
    return HttpResponse.json(storedUser);
  }),

  http.get('/api/debug/failure', () => HttpResponse.json({ simulated: failureSimulated })),

  http.post('/api/debug/failure', async ({ request }) => {
    const body = (await request.json()) as { simulated: boolean };
    failureSimulated = body.simulated;
    return HttpResponse.json({ simulated: failureSimulated });
  }),
];

/**
 * Registers the service worker that answers /api requests.
 *
 * Called by whoever owns the page: the host in the federated setup, and each
 * remote's standalone entry when it runs on its own origin. The modules
 * themselves know nothing about this file — they only ever call `fetch`.
 */
export async function startMockApi(): Promise<void> {
  const worker = setupWorker(...handlers);

  await worker.start({
    quiet: true,
    // Everything that is not /api belongs to the dev server: assets, chunks,
    // remote entries.
    onUnhandledFrame: 'bypass',
  });
}
