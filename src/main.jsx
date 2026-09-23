import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import keycloak from '@/lib/keycloak';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

function renderApp() {
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider delayDuration={200}>
              <App />
              <Toaster theme="dark" position="bottom-right" />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

// The app never renders unauthenticated — Keycloak redirects to its own hosted
// login page first. There is no local /login or /register route.
keycloak
  .init({ onLoad: 'login-required', pkceMethod: 'S256' })
  .then((authenticated) => {
    if (!authenticated) {
      keycloak.login();
      return;
    }
    // proactively refresh a few seconds before expiry instead of waiting for a 401
    setInterval(() => keycloak.updateToken(30).catch(() => keycloak.login()), 20_000);
    renderApp();
  })
  .catch((err) => {
    console.error('Keycloak init failed', err);
    root.render(
      <div style={{ padding: 32, fontFamily: 'sans-serif', color: '#fafafa', background: '#09090b' }}>
        Could not reach the login server. Is Keycloak running at {import.meta.env.VITE_KEYCLOAK_URL}?
      </div>,
    );
  });
