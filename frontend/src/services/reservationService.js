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

const reservationService = {
  // Crear nueva reservación (todos los roles)
  createReservation: async (reservationData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reservaciones`,
        reservationData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener todas las reservaciones (todos los roles)
  getAllReservations: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.fecha) params.append('fecha', filters.fecha);
      if (filters.cliente_id) params.append('cliente_id', filters.cliente_id);
      if (filters.usuario_id) params.append('usuario_id', filters.usuario_id);

      const url = params.toString() ? 
        `${API_BASE_URL}/reservaciones?${params.toString()}` : 
        `${API_BASE_URL}/reservaciones`;

      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener reservación por ID (todos los roles)
  getReservationById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reservaciones/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener reservación completa con productos y anticipos (todos los roles)
  getCompleteReservation: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reservaciones/${id}/completa`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Actualizar reservación (admin/editor cualquiera, visualizador solo propias)
  updateReservation: async (id, reservationData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/reservaciones/${id}`,
        reservationData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Eliminar reservación (admin/editor cualquiera, visualizador solo propias)
  deleteReservation: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/reservaciones/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Agregar producto a reservación
  addProductToReservation: async (reservationId, productData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reservaciones/${reservationId}/productos`,
        productData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Actualizar producto de reservación
  updateReservationProduct: async (productId, productData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/reservaciones/productos/${productId}`,
        productData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Eliminar producto de reservación
  removeProductFromReservation: async (productId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/reservaciones/productos/${productId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Agregar anticipo a reservación
  addAdvanceToReservation: async (reservationId, advanceData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reservaciones/${reservationId}/anticipos`,
        advanceData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Eliminar anticipo de reservación
  removeAdvanceFromReservation: async (advanceId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/reservaciones/anticipos/${advanceId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default reservationService;
