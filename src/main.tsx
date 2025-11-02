import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { HashRouter } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';

const convexUrl = (import.meta as any).env?.VITE_CONVEX_URL as string | undefined;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;
// Preconnect to Convex to reduce initial handshake latency
if (typeof document !== 'undefined' && convexUrl) {
  const u = new URL(convexUrl);
  const pre1 = document.createElement('link'); pre1.rel = 'preconnect'; pre1.href = `${u.protocol}//${u.host}`;
  const pre2 = document.createElement('link'); pre2.rel = 'dns-prefetch'; pre2.href = `${u.protocol}//${u.host}`;
  document.head.appendChild(pre1); document.head.appendChild(pre2);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {convexClient ? (
      <ConvexProvider client={convexClient}>
        <ConvexAuthProvider client={convexClient}>
          <HashRouter>
            <App />
          </HashRouter>
        </ConvexAuthProvider>
      </ConvexProvider>
    ) : (
      <HashRouter>
        <App />
      </HashRouter>
    )}
  </StrictMode>
);
