import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LogoutButton from '../../components/auth/LogoutButton';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    navigate('/products');
  }, [navigate]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            {user?.email}
          </span>
          <LogoutButton />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/products"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Productos</h2>
          <p className="text-gray-600">Gestionar el catálogo de productos</p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;