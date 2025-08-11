import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Phone,
  ChevronRight,
  Loader2,
  AlertCircle,
  Eye
} from 'lucide-react';
import reservationService from '../../services/reservationService';
import Modal from '../common/Modal';
import { formatDisplayDate, formatLocalDate } from '../../utils/dateUtils';

const WeeklyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [groupedReservations, setGroupedReservations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Función para formatear fecha - USANDO UTILIDADES
  const formatDate = (dateString) => {
    return formatDisplayDate(dateString);
  };

  // Función para formatear hora
  const formatTime = (timeString) => {
    try {
      if (!timeString) return 'Hora no disponible';
      return timeString.slice(0, 5); // Solo HH:MM
    } catch (error) {
      console.error('Error al formatear hora:', error, timeString);
      return 'Hora inválida';
    }
  };

  // Función para abrir modal con detalles de reservación
  const handleReservationClick = async (reservacion) => {
    try {
      // Obtener detalles completos de la reservación
      const response = await reservationService.getCompleteReservation(reservacion.id);
      if (response.success) {
        setSelectedReservation(response.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error al cargar detalles de reservación:', error);
    }
  };

  // Cargar reservaciones
  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reservationService.getWeeklyReservations();
      
      if (response.success) {
        console.log('Reservaciones cargadas:', response.data); // Para debug
        setReservations(response.data.reservaciones);
        setGroupedReservations(response.data.reservacionesAgrupadas);
      } else {
        throw new Error(response.message || 'Error al cargar reservaciones');
      }
    } catch (err) {
      console.error('Error al cargar reservaciones de la semana:', err);
      setError(err.message || 'Error al cargar las reservaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  // Obtener el color del tipo de reservación
  const getReservationTypeColor = (tipo) => {
    return tipo === 'Carta abierta' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  // Obtener el color del área
  const getAreaColor = (area) => {
    const colors = {
      'Restaurante': 'bg-purple-100 text-purple-800',
      'Salón Principal': 'bg-orange-100 text-orange-800',
      'Salón pequeño': 'bg-teal-100 text-teal-800'
    };
    return colors[area] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600 mr-2" />
          <span className="text-text-secondary">Cargando reservaciones...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center py-8 text-error-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Reservaciones Próxima Semana
          </h2>
          <p className="text-sm text-text-secondary">
            {reservations.length} reservación{reservations.length !== 1 ? 'es' : ''} en los próximos 7 días
          </p>
        </div>
        <Calendar className="w-5 h-5 text-primary-600" />
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No hay reservaciones programadas</p>
          <p className="text-sm text-text-muted">para los próximos 7 días</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedReservations).map(([fecha, reservacionesDia]) => (
            <div key={fecha} className="border-l-4 border-primary-500 pl-4">
              <div className="flex items-center mb-3">
                <h3 className="font-medium text-text-primary">
                  {formatDate(fecha)}
                </h3>
                <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                  {reservacionesDia.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {reservacionesDia.map((reservacion) => (
                  <div 
                    key={reservacion.id} 
                    className="bg-background-muted rounded-lg p-3 hover:bg-neutral-100 transition-colors cursor-pointer border border-transparent hover:border-primary-200"
                    onClick={() => handleReservationClick(reservacion)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-medium text-text-primary">
                            {reservacion.cliente_nombre} {reservacion.cliente_apellido}
                          </h4>
                          <div className="ml-auto flex items-center text-primary-600">
                            <Eye className="w-4 h-4 mr-1" />
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm text-text-secondary">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(reservacion.hora)}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {reservacion.cantidad_personas} persona{reservacion.cantidad_personas !== 1 ? 's' : ''}
                          </div>
                        </div>

                        <div className="flex items-center mt-2 space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${getAreaColor(reservacion.area)}`}>
                            {reservacion.area}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${getReservationTypeColor(reservacion.tipo_reservacion)}`}>
                            {reservacion.tipo_reservacion}
                          </span>
                        </div>

                        {reservacion.observaciones && (
                          <p className="text-xs text-text-muted mt-1">
                            "{reservacion.observaciones}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-neutral-200">
        <button className="text-primary-600 text-sm hover:text-primary-700 transition-colors">
          Ver todas las reservaciones →
        </button>
      </div>

      {/* Modal de detalles de reservación */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Detalles de la Reservación"
        size="lg"
      >
        {selectedReservation && (
          <div className="space-y-6">
            {/* Información del cliente */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                Información del Cliente
              </h3>
              <div className="bg-background-muted rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-secondary">Nombre completo</p>
                    <p className="font-medium text-text-primary">
                      {selectedReservation.cliente?.nombre} {selectedReservation.cliente?.apellido}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Teléfono</p>
                    <p className="font-medium text-text-primary">
                      {selectedReservation.cliente?.telefono || 'No disponible'}
                    </p>
                  </div>
                  {selectedReservation.cliente?.correo && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-text-secondary">Correo</p>
                      <p className="font-medium text-text-primary">
                        {selectedReservation.cliente.correo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detalles de la reservación */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                Detalles de la Reservación
              </h3>
              <div className="bg-background-muted rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-secondary">Fecha</p>
                    <p className="font-medium text-text-primary">
                      {formatDate(selectedReservation.reservacion?.fecha)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Hora</p>
                    <p className="font-medium text-text-primary">
                      {formatTime(selectedReservation.reservacion?.hora)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Cantidad de personas</p>
                    <p className="font-medium text-text-primary">
                      {selectedReservation.reservacion?.cantidad_personas} persona{selectedReservation.reservacion?.cantidad_personas !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Área</p>
                    <span className={`inline-block text-xs px-2 py-1 rounded ${getAreaColor(selectedReservation.reservacion?.area)}`}>
                      {selectedReservation.reservacion?.area}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-text-secondary">Tipo de reservación</p>
                    <span className={`inline-block text-xs px-2 py-1 rounded ${getReservationTypeColor(selectedReservation.reservacion?.tipo_reservacion)}`}>
                      {selectedReservation.reservacion?.tipo_reservacion}
                    </span>
                  </div>
                  {selectedReservation.reservacion?.observaciones && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-text-secondary">Observaciones</p>
                      <p className="font-medium text-text-primary">
                        {selectedReservation.reservacion.observaciones}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Productos (si los hay) */}
            {selectedReservation.productos && selectedReservation.productos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3">
                  Productos Ordenados
                </h3>
                <div className="bg-background-muted rounded-lg p-4">
                  <div className="space-y-2">
                    {selectedReservation.productos.map((producto) => (
                      <div key={producto.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-text-primary">{producto.producto_nombre}</p>
                          <p className="text-sm text-text-secondary">
                            Cantidad: {producto.cantidad} × ${parseFloat(producto.precio_unitario || 0).toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold text-text-primary">
                          ${parseFloat(producto.subtotal || 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Información de pagos */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                Información de Pagos
              </h3>
              <div className="bg-background-muted rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-text-secondary">Total estimado</p>
                    <p className="font-semibold text-text-primary">
                      ${parseFloat(selectedReservation.reservacion?.total_estimada || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Total pagado</p>
                    <p className="font-semibold text-success-600">
                      ${parseFloat(selectedReservation.reservacion?.total_pagado || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Pendiente</p>
                    <p className="font-semibold text-error-600">
                      ${parseFloat(selectedReservation.reservacion?.total_pendiente || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Anticipos (si los hay) */}
            {selectedReservation.anticipos && selectedReservation.anticipos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3">
                  Anticipos Recibidos
                </h3>
                <div className="bg-background-muted rounded-lg p-4">
                  <div className="space-y-2">
                    {selectedReservation.anticipos.map((anticipo) => (
                      <div key={anticipo.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-text-primary">${parseFloat(anticipo.monto || 0).toFixed(2)}</p>
                          <p className="text-sm text-text-secondary">
                            {anticipo.metodo_pago} - {new Date(anticipo.fecha).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        {anticipo.observaciones && (
                          <p className="text-sm text-text-muted italic">
                            {anticipo.observaciones}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WeeklyReservations;
