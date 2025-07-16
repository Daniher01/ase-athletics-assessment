import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
import { ToastProvider } from './context/ToastContext';
import { FavoriteFiltersProvider } from './context/FavoriteFiltersContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <FavoriteFiltersProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </FavoriteFiltersProvider>
    </ToastProvider>
  </React.StrictMode>,
)