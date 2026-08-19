import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { SolarProvider } from './context/SolarContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SolarProvider>
        <App />
      </SolarProvider>
    </AuthProvider>
  </StrictMode>
);
