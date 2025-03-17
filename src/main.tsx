// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Configurar interceptores globales y otras configuraciones
import axios from 'axios';

// Configurar headers predeterminados para las solicitudes
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Asignar token si existe en el localStorage (útil para recargas de página)
const authStorage = localStorage.getItem('auth-storage');
if (authStorage) {
  try {
    const { state } = JSON.parse(authStorage);
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    }
  } catch (error) {
    console.error('Error al procesar el token almacenado:', error);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);