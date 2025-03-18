
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import productService from '../../lib/api/productService';
import { Product, TipoProducto, UpdateProductDTO } from '../../types/product';

const tiposProducto: TipoProducto[] = [
  {
    id: "650632ce5cb9f2a6f87031d6",
    code: "3",
    slug: "ambos-bienes-y-servicios-incluye-los-dos-inherentes-a-los-productos-o-servicios",
    value: "Ambos (Bienes y Servicios)"
  },
];

const productSchema = z.object({
  nombre_producto: z.string().min(1, 'El nombre es requerido'),
  codigo_producto: z.string().min(1, 'El código es requerido'),
  codigo_producto2: z.string().optional(),
  codigo_producto3: z.string().optional(),
  precio: z
    .number({ invalid_type_error: 'El precio debe ser un número' })
    .positive('El precio debe ser mayor que cero'),
  precio_iva: z
    .number({ invalid_type_error: 'El precio con IVA debe ser un número' })
    .positive('El precio con IVA debe ser mayor que cero'),
  tipoId: z.string().min(1, 'El tipo de producto es requerido'),
  slug: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  isEditing?: boolean;
}

const ProductForm = ({ product, isEditing = false }: ProductFormProps) => {
  const navigate = useNavigate();
  const [isCalculatingIVA, setIsCalculatingIVA] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nombre_producto: '',
      codigo_producto: '',
      codigo_producto2: '',
      codigo_producto3: '',
      precio: 0,
      precio_iva: 0,
      tipoId: tiposProducto.length > 0 ? tiposProducto[0].id : '',
      slug: '',
    },
  });

  const precio = watch('precio');
  
  useEffect(() => {
    if (isCalculatingIVA && precio) {
      const precioConIVA = parseFloat((precio * 1.13).toFixed(2));
      setValue('precio_iva', precioConIVA);
    }
  }, [precio, isCalculatingIVA, setValue]);

  useEffect(() => {
    if (isEditing && product) {
      reset({
        nombre_producto: product.nombre_producto,
        codigo_producto: product.codigo_producto,
        codigo_producto2: product.codigo_producto2 || '',
        codigo_producto3: product.codigo_producto3 || '',
        precio: product.precio,
        precio_iva: product.precio_iva,
        tipoId: product.tipo?.id || '',
        slug: product.slug || '',
      });
    }
  }, [isEditing, product, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const tipoSeleccionado = tiposProducto.find(tipo => tipo.id === data.tipoId);
      
      if (!tipoSeleccionado) {
        toast.error('Tipo de producto no encontrado');
        return;
      }
  
      if (isEditing && product?.id) {
        const productData: UpdateProductDTO = {};
        if (data.nombre_producto !== product.nombre_producto) {
          productData.nombre_producto = data.nombre_producto;
        }
        
        if (data.codigo_producto !== product.codigo_producto) {
          productData.codigo_producto = data.codigo_producto;
        }
        
        if (data.codigo_producto2 !== product.codigo_producto2) {
          productData.codigo_producto2 = data.codigo_producto2;
        }
        
        if (data.codigo_producto3 !== product.codigo_producto3) {
          productData.codigo_producto3 = data.codigo_producto3;
        }
        
        if (data.precio !== product.precio) {
          productData.precio = data.precio;
        }
        
        if (data.precio_iva !== product.precio_iva) {
          productData.precio_iva = data.precio_iva;
        }
        
        if (data.slug !== product.slug) {
          productData.slug = data.slug || generarSlug(data.nombre_producto);
        }
        
        if (data.tipoId !== product.tipo?.id) {
          productData.tipo = {
            id: tipoSeleccionado.id,
            code: tipoSeleccionado.code,
            slug: tipoSeleccionado.slug,
            value: tipoSeleccionado.value
          };
        }
        
        console.log('Enviando datos para actualización:', productData);
        await productService.update(product.id, productData);
        toast.success('Producto actualizado correctamente');
      } else {
        const productData = {
          nombre_producto: data.nombre_producto,
          codigo_producto: data.codigo_producto,
          codigo_producto2: data.codigo_producto2 || undefined,
          codigo_producto3: data.codigo_producto3 || undefined,
          precio: data.precio,
          precio_iva: data.precio_iva,
          slug: data.slug || generarSlug(data.nombre_producto),
          unidad_medida: "UNIDAD",
          tipo: {
            id: tipoSeleccionado.id,
            code: tipoSeleccionado.code,
            slug: tipoSeleccionado.slug,
            value: tipoSeleccionado.value
          },
          cliente_id: "65c6c4c6bec9f2e5181f39bf",
          cliente: {
            nit: "121XXXXXXXX",
            nrc: "298XXXXXXX",
            correo: "digifactsv@gmail.com",
            nombre: "Importadora Saravia, Sociedad Anonima de Capital Variable",
            nombre_comercial: "Importadora Saravia",
            telefono: "50374444297"
          }
        };
        
        console.log('Enviando datos para creación:', productData);
        
        await productService.create(productData);
        toast.success('Producto creado correctamente');
      }
      navigate('/products');
    } catch (error: any) { // Añadir ": any" aquí
      console.error('Error al guardar producto:', error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        let errorMessage = 'Ocurrió un error al guardar el producto';
        
        if (errorData.message && typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(', ');
        }
        
        toast.error(errorMessage);
      } else {
        toast.error('Ocurrió un error al guardar el producto');
      }
    }
  };

  const generarSlug = (texto: string): string => {
    return texto
      .toLowerCase()
      .replace(/\s+/g, '-')           
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')         
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="nombre_producto" className="block text-sm font-medium text-gray-700">
            Nombre del Producto
          </label>
          <input
            id="nombre_producto"
            type="text"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.nombre_producto ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            {...register('nombre_producto')}
          />
          {errors.nombre_producto && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre_producto.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="codigo_producto" className="block text-sm font-medium text-gray-700">
            Código Principal
          </label>
          <input
            id="codigo_producto"
            type="text"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.codigo_producto ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            {...register('codigo_producto')}
          />
          {errors.codigo_producto && (
            <p className="mt-1 text-sm text-red-600">{errors.codigo_producto.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="codigo_producto2" className="block text-sm font-medium text-gray-700">
            Código Secundario (Opcional)
          </label>
          <input
            id="codigo_producto2"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            {...register('codigo_producto2')}
          />
        </div>

        <div>
          <label htmlFor="codigo_producto3" className="block text-sm font-medium text-gray-700">
            Código Terciario (Opcional)
          </label>
          <input
            id="codigo_producto3"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            {...register('codigo_producto3')}
          />
        </div>

        <div>
          <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
            Precio (Sin IVA)
          </label>
          <input
            id="precio"
            type="number"
            step="0.01"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.precio ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            {...register('precio', { valueAsNumber: true })}
          />
          {errors.precio && (
            <p className="mt-1 text-sm text-red-600">{errors.precio.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="precio_iva" className="block text-sm font-medium text-gray-700">
            Precio (Con IVA)
          </label>
          <div className="flex items-center">
            <input
              id="precio_iva"
              type="number"
              step="0.01"
              disabled={isCalculatingIVA}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.precio_iva ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                isCalculatingIVA ? 'bg-gray-100' : ''
              }`}
              {...register('precio_iva', { valueAsNumber: true })}
            />
            <div className="ml-2">
              <input
                type="checkbox"
                id="calcular-iva"
                checked={isCalculatingIVA}
                onChange={() => setIsCalculatingIVA(!isCalculatingIVA)}
                className="mr-1"
              />
              <label htmlFor="calcular-iva" className="text-xs text-gray-600">
                Calcular automáticamente
              </label>
            </div>
          </div>
          {errors.precio_iva && (
            <p className="mt-1 text-sm text-red-600">{errors.precio_iva.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="tipoId" className="block text-sm font-medium text-gray-700">
            Tipo de Producto
          </label>
          <select
            id="tipoId"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.tipoId ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            {...register('tipoId')}
          >
            {tiposProducto.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.value}
              </option>
            ))}
          </select>
          {errors.tipoId && (
            <p className="mt-1 text-sm text-red-600">{errors.tipoId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug (SEO friendly URL)
          </label>
          <input
            id="slug"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Se generará automáticamente si se deja vacío"
            {...register('slug')}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;