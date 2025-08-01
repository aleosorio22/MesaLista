import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

const productService = {
  // Crear nuevo producto (solo admin)
  createProduct: async (productData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/productos`,
        productData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener todos los productos (todos los roles)
  getAllProducts: async (includeInactive = false) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/productos?includeInactive=${includeInactive}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener producto por ID (todos los roles)
  getProductById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/productos/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Actualizar producto (solo admin)
  updateProduct: async (id, productData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/productos/${id}`,
        productData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Eliminar producto (solo admin)
  deleteProduct: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/productos/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default productService;
