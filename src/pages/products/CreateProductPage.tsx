import { Link } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';

const CreateProductPage = () => {
  return (
    <div className="w-full">
      <div className="mb-6">
        <Link to="/products" className="text-indigo-600 hover:text-indigo-800">
          &larr; Volver al listado
        </Link>
      </div>
      
      <div className="form-container">
        <h1 className="text-2xl font-bold mb-6">Crear Nuevo Producto</h1>
        <ProductForm />
      </div>
    </div>
  );
};

export default CreateProductPage;
