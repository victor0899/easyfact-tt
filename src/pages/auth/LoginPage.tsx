import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      console.log('Login exitoso');
      toast.success('Inicio de sesión exitoso');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      // Cambio aquí: mensaje de error más específico
      toast.error('Usuario o contraseña incorrecta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      {/* Grid para dividir la pantalla en modo desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-7xl">
        {/* Lado izquierdo - formulario de login */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">EF</span>
              </div>
            </div>
            
            {/* Título */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Easyfact</h1>
              <p className="mt-2 text-gray-600">Inicia sesión para continuar</p>
            </div>
            
            {/* Formulario */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  className={`w-full px-3 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="nombre@ejemplo.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <a href="#" className="text-xs text-indigo-600 hover:text-indigo-500">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  className={`w-full px-3 py-2 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciando sesión...
                    </div>
                  ) : (
                    'Iniciar sesión'
                  )}
                </button>
              </div>
            </form>
            
            {/* Pie de página */}
            <div className="mt-8 text-center text-xs text-gray-500">
              <p>© {new Date().getFullYear()} Easyfact. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
        
        {/* Lado derecho - visible solo en desktop */}
        <div className="hidden md:block bg-indigo-600 rounded-r-lg p-8">
          <div className="h-full flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-white mb-4">Gestión de productos</h2>
            <p className="text-indigo-100 mb-6">
              Bienvenido al sistema de gestión de productos de Easyfact. Inicia sesión para administrar tu catálogo de productos.
            </p>
            <div className="bg-white/20 p-4 rounded-lg text-white">
              <p className="font-medium">Con esta aplicación podrás:</p>
              <ul className="mt-2 space-y-2 list-disc list-inside">
                <li>Ver el listado completo de productos</li>
                <li>Crear nuevos productos</li>
                <li>Editar productos existentes</li>
                <li>Activar o desactivar productos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;