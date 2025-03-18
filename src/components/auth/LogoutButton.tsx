import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton = ({ className = '' }: LogoutButtonProps) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    try {
      logout();
      toast.success('Sesión cerrada correctamente');
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ${className}`}
    >
      Cerrar sesión
    </button>
  );
};

export default LogoutButton;