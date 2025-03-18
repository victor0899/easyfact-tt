import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/auth/LoginPage';
import ProductsListPage from './pages/products/ProductsListPage';
import CreateProductPage from './pages/products/CreateProductPage';
import EditProductPage from './pages/products/EditProductPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import { useAuthStore } from './store/authStore';

const App = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Ruta principal - redirige según autenticación */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />} 
        />

        {/* Rutas públicas */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/products" replace /> : <LoginPage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout><Outlet /></MainLayout>}>
            {/* Eliminada la ruta /dashboard */}
            <Route path="/products" element={<ProductsListPage />} />
            <Route path="/products/new" element={<CreateProductPage />} />
            <Route path="/products/:id" element={<EditProductPage />} />
          </Route>
        </Route>

        {/* Ruta para cualquier otra URL - redirige a productos o login */}
        <Route path="*" element={isAuthenticated ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;