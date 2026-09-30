import './standalone.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import SummaryCard from './SummaryCard';

/**
 * Standalone entry. This module needs no router at all, so running it alone
 * means providing Preflight, the mock backend and a place to mount.
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
      <div className="min-h-screen bg-background p-10 text-foreground">
        <div className="mx-auto max-w-sm">
          <SummaryCard />
        </div>
      </div>
    </StrictMode>,
  );
}

void start();
