import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface AuthState {
  token: string | null;
  clienteId: string | null;
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
      clienteId: null,
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const response = await axios.post('https://dte.auth.dev.easyfact.com.sv/api/auth/login', {
            email,
            password,
          });

          console.log('Login response:', response.data);
          const { access_token, payload } = response.data;
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

          set({
            token: access_token,
            clienteId: payload?.userId || null,
            user: { email },
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Error de autenticación:', error);
          throw error;
        }
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization'];
        set({
          token: null,
          clienteId: null,
          user: null,
          isAuthenticated: false,
        });
        
        console.log('Sesión cerrada correctamente');
      },

      refreshSession: async () => {
        try {
          const state = useAuthStore.getState();
          if (!state.clienteId) {
            throw new Error('No hay clienteId disponible');
          }

          const response = await axios.post('https://dte.auth.dev.easyfact.com.sv/api/auth/refreshtoken', {
            clienteId: state.clienteId,
          });
          console.log('Refresh token response:', response.data);
          const { access_token } = response.data;
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

          set({
            token: access_token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Error al refrescar token:', error);
          useAuthStore.getState().logout();
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage', 
      partialize: (state) => ({
        token: state.token,
        clienteId: state.clienteId,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await useAuthStore.getState().refreshSession();
        originalRequest.headers['Authorization'] = `Bearer ${useAuthStore.getState().token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);