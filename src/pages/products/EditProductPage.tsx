// src/pages/products/EditProductPage.tsx
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ProductForm from '../../components/products/ProductForm';
import productService, { Product } from '../../lib/api/productService';

const EditProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        navigate('/products');
        return;
      }

      setIsLoading(true);
      try {
        const data = await productService.getById(id);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar el producto. Por favor, intenta de nuevo.');
        toast.error('No se pudo cargar el producto');
        console.error('Error al cargar producto:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/products" className="text-indigo-600 hover:text-indigo-800">
            &larr; Volver al listado
          </Link>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="text-red-500 text-xl mb-4">{error || 'Producto no encontrado'}</div>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/products" className="text-indigo-600 hover:text-indigo-800">
          &larr; Volver al listado
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Editar Producto</h1>
        <ProductForm product={product} isEditing={true} />
      </div>
    </div>
  );
};

export default EditProductPage;