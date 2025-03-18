// src/types/product.ts
export interface TipoProducto {
    id: string;
    code: string;
    slug: string;
    value: string;
  }
  
  export interface Cliente {
    nit: string;
    nrc: string;
    correo: string;
    nombre: string;
    nombre_comercial: string;
    telefono: string;
  }
  
  export interface Product {
    id?: string; // Puede ser opcional en creación
    _id?: string; // Para compatibilidad con la API
    nombre_producto: string;
    slug?: string;
    codigo_producto: string;
    codigo_producto2?: string;
    codigo_producto3?: string;
    precio: number;
    precio_iva: number;
    unidad_medida?: string;
    tipo: TipoProducto;
    cliente_id?: string;
    cliente?: Cliente;
    estado?: boolean;
    activo?: boolean;
  }
  
  export interface CreateProductDTO {
    nombre_producto: string;
    slug?: string;
    codigo_producto: string;
    codigo_producto2?: string;
    codigo_producto3?: string;
    precio: number;
    precio_iva: number;
    unidad_medida?: string;
    tipo: {
      id: string;
      code: string;
      slug: string;
      value: string;
    };
    cliente_id?: string;
    cliente?: Cliente;
  }
  
  export interface UpdateProductDTO {
    nombre_producto?: string;
    slug?: string;
    codigo_producto?: string;
    codigo_producto2?: string;
    codigo_producto3?: string;
    precio?: number;
    precio_iva?: number;
    unidad_medida?: string;
    tipo?: {
      id: string;
      code: string;
      slug: string;
      value: string;
    };
    cliente_id?: string;
    cliente?: Cliente;
  }
  
  export interface UpdateProductStatusDTO {
    id: string;
    estado: boolean;
  }