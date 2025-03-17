// src/lib/api/productService.ts
import axios from 'axios';

// Base URL para la API de productos
const API_URL = 'https://dte.backend.dev.easyfact.com.sv/api/productos';

// Interfaces para los tipos de datos
export interface Product {
  id: string;
  nombre: string;
  precio: number;
  codigo: string;
  descripcion: string;
  estado: boolean;
  // Añade otros campos según la API
}

export interface CreateProductDTO {
  nombre: string;
  precio: number;
  codigo: string;
  descripcion: string;
  // Otros campos requeridos para crear un producto
}

export interface UpdateProductDTO {
  nombre?: string;
  precio?: number;
  codigo?: string;
  descripcion?: string;
  // Campos opcionales para actualizar
}

export interface UpdateProductStatusDTO {
  id: string;
  estado: boolean;
}

// Servicio para manejar operaciones de productos
const productService = {
  // Obtener todos los productos
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  // Obtener un producto por ID
  getById: async (id: string): Promise<Product> => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo producto
  create: async (product: CreateProductDTO): Promise<Product> => {
    try {
      const response = await axios.post(API_URL, product);
      return response.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  // Actualizar un producto existente
  update: async (id: string, product: UpdateProductDTO): Promise<Product> => {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, product);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar producto con ID ${id}:`, error);
      throw error;
    }
  },

  // Cambiar estado de un producto
  updateStatus: async (data: UpdateProductStatusDTO): Promise<Product> => {
    try {
      const response = await axios.patch(`${API_URL}/status`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar estado del producto:`, error);
      throw error;
    }
  },

  // Subir archivo relacionado a productos
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
};

export default productService;