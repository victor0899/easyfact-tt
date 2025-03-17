// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: { email: string } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const response = await axios.post('https://dte.auth.dev.easyfact.com.sv/api/auth/login', {
            email,
            password,
          });

          const { token, refreshToken } = response.data;

          // Configurar el token en los headers por defecto para todas las solicitudes
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            token,
            refreshToken,
            user: { email },
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Error de autenticación:', error);
          throw error;
        }
      },

      logout: () => {
        // Eliminar el token del header por defecto
        delete axios.defaults.headers.common['Authorization'];

        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },

      refreshSession: async () => {
        try {
          const state = useAuthStore.getState();
          if (!state.refreshToken) {
            throw new Error('No hay refresh token disponible');
          }

          const response = await axios.post('https://dte.auth.dev.easyfact.com.sv/api/auth/refresh-token', {
            refreshToken: state.refreshToken,
          });

          const { token, refreshToken } = response.data;

          // Actualizar el token en los headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            token,
            refreshToken,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Error al refrescar token:', error);
          // Si falla el refresh, hacemos logout
          useAuthStore.getState().logout();
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage', // nombre para localStorage
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Configurar interceptor para refrescar el token cuando expire
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (Unauthorized) y no hemos intentado refrescar el token antes
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar refrescar el token
        await useAuthStore.getState().refreshSession();
        
        // Volver a intentar la solicitud original con el nuevo token
        originalRequest.headers['Authorization'] = `Bearer ${useAuthStore.getState().token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, redirigir al login
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);