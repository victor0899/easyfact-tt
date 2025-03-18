import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import axios from 'axios';
axios.defaults.headers.common['Content-Type'] = 'application/json';
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