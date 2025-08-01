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

const userService = {
  // Crear nuevo usuario
  createUser: async (userData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/usuarios`,
        userData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener todos los usuarios
  getAllUsers: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/usuarios`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/usuarios/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener usuario completo por ID (incluyendo contraseña)
  getFullUserById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/usuarios/${id}/full`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/usuarios/${id}`,
        userData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Crear usuario root (sin autenticación)
  createRootUser: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/usuarios/root`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default userService;
