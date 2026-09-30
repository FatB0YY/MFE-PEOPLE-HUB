import './standalone.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';

import ProfileApp from './ProfileApp';

/**
 * Standalone entry. Under the host the router, Preflight and the mock backend
 * all arrive from outside; running alone, this module provides them itself.
 * The exposed component knows about none of it — it only calls `fetch`.
 */
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { startMockApi } = await import('@people-hub/mock-api');
    await startMockApi();
  }

  const container = document.getElementById('root');

  if (!container) {
    throw new Error('Root container #root is missing from index.html');
  }

  createRoot(container).render(
    <StrictMode>
      <BrowserRouter>
        <div className="min-h-screen bg-background p-10 text-foreground">
          <div className="mx-auto max-w-2xl">
            {/* Mounted behind a splat route, exactly like the host mounts it. */}
            <Routes>
              <Route path="/*" element={<ProfileApp />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </StrictMode>,
  );
}

void start();
