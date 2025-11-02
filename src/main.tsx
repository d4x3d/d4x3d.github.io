import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { HashRouter } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

const convexUrl = (import.meta as any).env?.VITE_CONVEX_URL as string | undefined;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {convexClient ? (
      <ConvexProvider client={convexClient}>
        <HashRouter>
          <App />
        </HashRouter>
      </ConvexProvider>
    ) : (
      <HashRouter>
        <App />
      </HashRouter>
    )}
  </StrictMode>
);
