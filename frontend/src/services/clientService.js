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

const clientService = {
  // Crear nuevo cliente
  createClient: async (clientData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/clientes`,
        clientData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener todos los clientes
  getAllClients: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/clientes`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener cliente por ID
  getClientById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/clientes/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Actualizar cliente
  updateClient: async (id, clientData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/clientes/${id}`,
        clientData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Eliminar cliente
  deleteClient: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/clientes/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default clientService;
