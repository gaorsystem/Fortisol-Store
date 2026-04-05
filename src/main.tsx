import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Deshabilitar Service Worker para evitar problemas de caché persistente con versiones rotas
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistred');
    }
  });
  
  // También limpiar cachés de SW
  if (window.caches) {
    caches.keys().then(names => {
      for (const name of names) caches.delete(name);
    });
  }
}

/* 
// Comentado para evitar que el caché sirva versiones con errores de React
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
