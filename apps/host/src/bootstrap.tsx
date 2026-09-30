import './styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { App } from './App';

async function start() {
  // The host owns the page, so it is the one that registers the mock backend.
  // It has to answer before the first request leaves any module, hence await.
  //
  // The import is dynamic and guarded: a mock is a development tool, and this
  // branch is what keeps it out of the production bundle entirely.
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
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

void start();
