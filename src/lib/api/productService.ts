import axios from 'axios';
import { 
  Product, 
  CreateProductDTO, 
  UpdateProductDTO, 
  UpdateProductStatusDTO 
} from '../../types/product';

const API_URL = 'https://dte.backend.dev.easyfact.com.sv/api/productos';

const PRODUCT_IDS = [
  '67d958df15a067a8c99aea09', 
  '67d9590015a067a8c99aea0b', 
  '67d9591215a067a8c99aea0d', 
  '67d9592c15a067a8c99aea0f', 
  '67d9594015a067a8c99aea11'  
];
const transformIdField = (item: any): any => {
  if (!item || typeof item !== 'object') return item;
  const result = { ...item };
  if (result._id && !result.id) {
    result.id = result._id;
  }
  if (result.estado !== undefined && result.activo === undefined) {
    result.activo = result.estado;
  }
  
  return result;
};

const productService = {
  saveProductId: (id: string): void => {
    if (!PRODUCT_IDS.includes(id)) {
      PRODUCT_IDS.push(id);
      localStorage.setItem('productIds', JSON.stringify(PRODUCT_IDS));
    }
  },

  loadProductIds: (): string[] => {
    const savedIds = localStorage.getItem('productIds');
    if (savedIds) {
      try {
        const parsedIds = JSON.parse(savedIds);
        if (Array.isArray(parsedIds)) {
          PRODUCT_IDS.length = 0;
          PRODUCT_IDS.push(...parsedIds);
        }
      } catch (error) {
        console.error('Error al parsear IDs guardados:', error);
        localStorage.setItem('productIds', JSON.stringify(PRODUCT_IDS));
      }
    }
    return PRODUCT_IDS;
  },

  getAll: async (search?: string): Promise<Product[]> => {
    try {
      const existingIds = localStorage.getItem('productIds');
      if (!existingIds || JSON.parse(existingIds).length === 0) {
        localStorage.setItem('productIds', JSON.stringify(PRODUCT_IDS));
      }
      const productIds = productService.loadProductIds();
      
      if (productIds.length === 0) {
        console.log('No hay IDs de productos guardados');
        return [];
      }

      const productsPromises = productIds.map(id => 
        productService.getById(id).catch(err => {
          console.error(`Error al obtener producto ${id}:`, err);
          if (err.response && err.response.status === 404) {
            productService.removeProductId(id);
          }
          return null;
        })
      );
      
      const productsResults = await Promise.all(productsPromises);
      let filteredProducts = productsResults.filter(product => product !== null) as Product[];
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.nombre_producto?.toLowerCase().includes(searchLower) ||
          product.codigo_producto?.toLowerCase().includes(searchLower) ||
          product.codigo_producto2?.toLowerCase().includes(searchLower) ||
          product.codigo_producto3?.toLowerCase().includes(searchLower) ||
          product.tipo?.value?.toLowerCase().includes(searchLower)
        );
      }
      
      return filteredProducts;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  // Obtener un producto por ID
  getById: async (id: string): Promise<Product> => {
    try {
      console.log(`Intentando obtener producto con ID: ${id}`);
      const response = await axios.get(`${API_URL}/${id}`);
      console.log('Respuesta completa de la API:', response);
      
      let data = response.data;
      data = transformIdField(data);
      if (data && typeof data === 'object' && (data.id || data.nombre_producto)) {
        return data;
      }
      if (data && typeof data === 'object' && data.data) {
        return transformIdField(data.data);
      }
      
      console.warn('No se pudo determinar la estructura de la respuesta:', data);
      throw new Error('Formato de respuesta inesperado');
    } catch (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error);
      throw error;
    }
  },

  create: async (productData: CreateProductDTO): Promise<Product> => {
    try {
      console.log('Datos a enviar para creación:', productData);
      
      if (productData.tipo && productData.tipo.id && (!productData.tipo.code || !productData.tipo.slug || !productData.tipo.value)) {
        console.warn('Objeto tipo incompleto, intentando completarlo con datos conocidos');
        const tiposConocidos: Record<string, { code: string, slug: string, value: string }> = {
          "650632ce5cb9f2a6f87031d5": {
            code: "1",
            slug: "producto",
            value: "Producto"
          },
          "650632ce5cb9f2a6f87031d6": {
            code: "2",
            slug: "servicio",
            value: "Servicio"
          },
          "650632ce5cb9f2a6f87031d7": {
            code: "3",
            slug: "software",
            value: "Software"
          }
        };
        
        if (tiposConocidos[productData.tipo.id]) {
          const tipoCompleto = tiposConocidos[productData.tipo.id];
          productData.tipo = {
            ...productData.tipo,
            code: tipoCompleto.code,
            slug: tipoCompleto.slug,
            value: tipoCompleto.value
          };
        }
      }
      
      const completeProductData = {
        ...productData,
        cliente_id: productData.cliente_id || "65c6c4c6bec9f2e5181f39bf",
        cliente: productData.cliente || {
          nit: "121XXXXXXXX",
          nrc: "298XXXXXXX",
          correo: "digifactsv@gmail.com",
          nombre: "Importadora Saravia, Sociedad Anonima de Capital Variable",
          nombre_comercial: "Importadora Saravia",
          telefono: "50374444297"
        },
        unidad_medida: productData.unidad_medida || "UNIDAD"
      };
      
      console.log('Datos completos para creación:', completeProductData);
      
      const response = await axios.post(API_URL, completeProductData);
      let newProduct = response.data;
      
      if (typeof newProduct === 'string') {
        try {
          const fullProduct = await productService.getById(newProduct);
          productService.saveProductId(newProduct); 
          return fullProduct;
        } catch (getError) {
          console.error('Error al obtener producto después de creación:', getError);
          const basicProduct = { 
            id: newProduct,
            nombre_producto: completeProductData.nombre_producto,
            codigo_producto: completeProductData.codigo_producto,
            precio: completeProductData.precio,
            precio_iva: completeProductData.precio_iva,
            tipo: completeProductData.tipo,
            activo: true
          } as Product;
          productService.saveProductId(newProduct); 
          return basicProduct;
        }
      }
      if (newProduct && typeof newProduct === 'object') {
        if (newProduct.data) {
          if (typeof newProduct.data === 'string') {
            const productId = newProduct.data;
            try {
              const fullProduct = await productService.getById(productId);
              productService.saveProductId(productId); 
              return fullProduct;
            } catch (getError) {
              console.error('Error al obtener producto después de creación:', getError);
              const basicProduct = { 
                id: productId, 
                nombre_producto: completeProductData.nombre_producto,
                codigo_producto: completeProductData.codigo_producto,
                precio: completeProductData.precio,
                precio_iva: completeProductData.precio_iva,
                tipo: completeProductData.tipo,
                activo: true
              } as Product;
              productService.saveProductId(productId); 
              return basicProduct;
            }
          } else {
            newProduct = newProduct.data;
          }
        }
      }
      newProduct = transformIdField(newProduct);
      if (newProduct && newProduct.id) {
        productService.saveProductId(newProduct.id);
      }
      
      return newProduct;
    } catch (error: any) {
      console.error('Error al crear producto:', error);
      if (error.response && error.response.data) {
        console.error('Detalles del error:', error.response.data);
      }
      
      throw error;
    }
  },

  update: async (id: string, productData: UpdateProductDTO): Promise<Product> => {
    try {
      console.log('ID del producto a actualizar:', id);
      console.log('Datos a enviar para actualización:', productData);
      
      const currentProduct = await productService.getById(id);
      console.log('Producto actual antes de actualizar:', currentProduct);
      
      const updatedData = {
        ...currentProduct,
        nombre_producto: productData.nombre_producto ?? currentProduct.nombre_producto,
        codigo_producto: productData.codigo_producto ?? currentProduct.codigo_producto,
        codigo_producto2: productData.codigo_producto2 ?? currentProduct.codigo_producto2,
        codigo_producto3: productData.codigo_producto3 ?? currentProduct.codigo_producto3,
        precio: productData.precio ?? currentProduct.precio,
        precio_iva: productData.precio_iva ?? currentProduct.precio_iva,
        slug: productData.slug ?? currentProduct.slug,
        tipo: productData.tipo ?? currentProduct.tipo,
        cliente_id: currentProduct.cliente_id,
        cliente: currentProduct.cliente
      };
      
      delete updatedData.id; 
      delete updatedData._id; 
      delete (updatedData as any).created_at;
      delete (updatedData as any).updated_at;

      console.log('Datos finales a enviar para actualización:', updatedData);
      
      const response = await axios.patch(`${API_URL}/${id}`, updatedData);
      let result = response.data;
      if (result && typeof result === 'object' && result.data) {
        result = result.data;
      }
      return transformIdField(result);
    } catch (error) {
      console.error(`Error al actualizar producto con ID ${id}:`, error);
      throw error;
    }
  },

  updateStatus: async (data: UpdateProductStatusDTO): Promise<Product> => {
    try {
      const requestData = {
        ...data,
        estado: data.estado 
      };
      const response = await axios.patch(`${API_URL}/status`, requestData);
      let updatedProduct = response.data;
      if (updatedProduct && typeof updatedProduct === 'object' && updatedProduct.data) {
        updatedProduct = updatedProduct.data;
      }
      return transformIdField(updatedProduct);
    } catch (error) {
      console.error(`Error al actualizar estado del producto:`, error);
      throw error;
    }
  },

  uploadFile: async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_URL}/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al subir archivo:', error);
      throw error;
    }
  },

  removeProductId: (id: string): void => {
    const index = PRODUCT_IDS.indexOf(id);
    if (index !== -1) {
      PRODUCT_IDS.splice(index, 1);
      localStorage.setItem('productIds', JSON.stringify(PRODUCT_IDS));
    }
  },

  refreshProductsList: async (): Promise<Product[]> => {
    try {
      const productIds = productService.loadProductIds();
      
      if (productIds.length === 0) {
        console.log('No hay IDs de productos guardados');
        return [];
      }
      const productsPromises = productIds.map(id => 
        productService.getById(id).catch(err => {
          console.error(`Error al obtener producto ${id}:`, err);
          if (err.response && err.response.status === 404) {
            productService.removeProductId(id);
          }
          return null;
        })
      );
      
      const productsResults = await Promise.all(productsPromises);
      return productsResults.filter(product => product !== null) as Product[];
    } catch (error) {
      console.error('Error al refrescar productos:', error);
      return [];
    }
  },
};

export default productService;