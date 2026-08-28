import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';

const container = document.getElementById('root');

if (container === null) {
  throw new Error('Root element not found');
}

createRoot(container).render(
  <StrictMode>
    <div className="mx-auto w-full max-w-invitation bg-bg-base p-8 text-text-body">
      Scaffold ready.
    </div>
  </StrictMode>,
);
