import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { formatDisplayDate, formatLocalDate } from '../../utils/dateUtils';

const WeeklyReservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [groupedReservations, setGroupedReservations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Función para navegar a los detalles de reservación
  const handleReservationClick = (reservacion) => {
    navigate(`/admin/reservaciones/${reservacion.id}/ver`);
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
        <button 
          onClick={() => navigate('/admin/reservaciones')}
          className="text-primary-600 text-sm hover:text-primary-700 transition-colors"
        >
          Ver todas las reservaciones →
        </button>
      </div>
    </div>
  );
};

export default WeeklyReservations;