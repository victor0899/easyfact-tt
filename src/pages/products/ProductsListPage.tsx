import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../lib/api/productService';
import { Product } from '../../types/product';
import { toast } from 'react-hot-toast';
import useDebounce from '../../hooks/useDebounce'; 

const ProductsListPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isComponentMounted = useRef(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const fetchProducts = async (search?: string) => {
    if (!isComponentMounted.current) return;
    
    setIsLoading(true);
    try {
      const data = await productService.getAll(search);
      if (isComponentMounted.current) {
        setProducts(Array.isArray(data) ? data : []);
        setError(null);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error al cargar productos:', err);
      if (isComponentMounted.current) {
        setError('Error al cargar los productos. Por favor, intenta de nuevo.');
        setIsLoading(false);
      }
    }
  };
  useEffect(() => {
    isComponentMounted.current = true;
    fetchProducts();
    const intervalId = setInterval(() => {
      if (isComponentMounted.current) {
        fetchProducts(debouncedSearchTerm);
      }
    }, 300000);
    return () => {
      isComponentMounted.current = false;
      clearInterval(intervalId);
    };
  }, []); 

  useEffect(() => {
    if (isComponentMounted.current) {
      fetchProducts(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]); 

  const handleRemoveProduct = (id: string | undefined) => {
    if (!id) return;
    
    productService.removeProductId(id);
    toast.success('Producto eliminado de la lista');
    fetchProducts(debouncedSearchTerm);
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={() => fetchProducts()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Listado de Productos</h1>
        <Link
          to="/products/new"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Nuevo Producto
        </Link>
      </div>

      <div className="mb-6 w-full">
        <div className="flex w-full">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="w-full text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No hay productos disponibles.</p>
          <p className="text-gray-500 mt-2">Añade productos usando el ID o crea nuevos productos.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left">Código</th>
                <th className="py-3 px-4 text-left">Nombre</th>
                <th className="py-3 px-4 text-left">Precio</th>
                <th className="py-3 px-4 text-left">Precio (IVA)</th>
                <th className="py-3 px-4 text-left">Tipo</th>
                <th className="py-3 px-4 text-left">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 border-t">
                  <td className="py-3 px-4">{product.codigo_producto}</td>
                  <td className="py-3 px-4">{product.nombre_producto}</td>
                  <td className="py-3 px-4">${product.precio?.toFixed(2) || '0.00'}</td>
                  <td className="py-3 px-4">${product.precio_iva?.toFixed(2) || '0.00'}</td>
                  <td className="py-3 px-4">{product.tipo?.value || '-'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        product.activo !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductsListPage;