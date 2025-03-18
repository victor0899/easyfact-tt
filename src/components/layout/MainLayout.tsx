import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LogoutButton from '../auth/LogoutButton';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-100">
      {/* Header con fondo de color */}
      <header className="w-full bg-indigo-600 text-white shadow">
        <div className="w-full px-4 py-4 flex justify-between items-center">
          <Link to="/products" className="text-xl font-bold">
            Easyfact
          </Link>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.email}</span>
            <LogoutButton className="bg-black hover:bg-gray-800" />
          </div>
        </div>
      </header>

      {/* Navegación principal */}
      <nav className="w-full bg-white shadow">
        <div className="w-full px-4 py-3">
          <ul className="flex space-x-6">
            {/* Eliminado el enlace al Dashboard */}
            <li>
              <Link
                to="/products"
                className="text-gray-600 hover:text-indigo-600 font-medium"
              >
                Productos
              </Link>
            </li>
            {/* Aquí puedes agregar más enlaces de navegación en el futuro */}
          </ul>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="flex-grow w-full px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t mt-auto">
        <div className="w-full px-4 py-4">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Easyfact. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;