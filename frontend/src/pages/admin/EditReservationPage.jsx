import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  MessageSquare, 
  CreditCard,
  User,
  UtensilsCrossed,
  Building,
  Home,
  FileText,
  ChefHat,
  AlertCircle
} from 'lucide-react';
import clientService from '../../services/clientService';
import reservationService from '../../services/reservationService';
import { useAuth } from '../../contexts/AuthContext';

export default function EditReservationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [reservation, setReservation] = useState(null);

  // Datos del formulario
  const [formData, setFormData] = useState({
    cliente_id: '',
    fecha: '',
    hora: '',
    cantidad_personas: 1,
    area: '',
    tipo_reservacion: '',
    observaciones: '',
    total_estimada: 0
  });

  const [errors, setErrors] = useState({});

  const areas = [
    { value: 'Restaurante', label: 'Restaurante', icon: UtensilsCrossed, description: 'Área principal del restaurante' },
    { value: 'Salón Principal', label: 'Salón Principal', icon: Building, description: 'Salón grande para eventos' },
    { value: 'Salón pequeño', label: 'Salón Pequeño', icon: Home, description: 'Salón íntimo para grupos pequeños' }
  ];

  const tiposReservacion = [
    { value: 'Carta abierta', label: 'Carta Abierta', icon: FileText, description: 'El cliente elige del menú disponible' },
    { value: 'Orden previa', label: 'Orden Previa', icon: ChefHat, description: 'Menú predefinido acordado previamente' }
  ];

  // Verificar permisos
  const isAdmin = auth?.user?.rol === 'admin';
  const isEditor = auth?.user?.rol === 'editor';
  const isOwner = reservation?.usuario_id === auth?.user?.id;
  const canModify = isAdmin || isEditor || isOwner;

  useEffect(() => {
    if (id) {
      loadReservation();
      loadClients();
    }
  }, [id]);

  const loadReservation = async () => {
    try {
      setInitialLoading(true);
      const response = await reservationService.getCompleteReservation(id);
      if (response.success) {
        const reservationData = response.data.reservacion;
        
        setReservation(reservationData);
        setFormData({
          cliente_id: reservationData.cliente_id,
          fecha: reservationData.fecha,
          hora: reservationData.hora,
          cantidad_personas: reservationData.cantidad_personas,
          area: reservationData.area,
          tipo_reservacion: reservationData.tipo_reservacion,
          observaciones: reservationData.observaciones || '',
          total_estimada: reservationData.total_estimada || 0
        });
      }
    } catch (error) {
      console.error('Error cargando reservación:', error);
      navigate('/admin/reservaciones');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await clientService.getAllClients();
      if (response.success) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'Selecciona un cliente';
    }
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es obligatoria';
    }
    if (!formData.hora) {
      newErrors.hora = 'La hora es obligatoria';
    }
    if (!formData.area) {
      newErrors.area = 'Selecciona un área';
    }
    if (!formData.tipo_reservacion) {
      newErrors.tipo_reservacion = 'Selecciona el tipo de reservación';
    }
    if (formData.cantidad_personas < 1) {
      newErrors.cantidad_personas = 'Debe ser al menos 1 persona';
    }

    // Validar que la fecha no sea en el pasado (solo si se cambió)
    const originalDateTime = new Date(reservation?.fecha + 'T' + reservation?.hora);
    const selectedDateTime = new Date(formData.fecha + 'T' + formData.hora);
    
    if (selectedDateTime.getTime() !== originalDateTime.getTime() && selectedDateTime < new Date()) {
      newErrors.fecha = 'La fecha y hora no pueden ser en el pasado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!canModify) {
      alert('No tienes permisos para modificar esta reservación');
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        cliente_id: formData.cliente_id,
        fecha: formData.fecha,
        hora: formData.hora,
        cantidad_personas: parseInt(formData.cantidad_personas),
        area: formData.area,
        tipo_reservacion: formData.tipo_reservacion,
        observaciones: formData.observaciones.trim() || null,
        total_estimada: parseFloat(formData.total_estimada) || 0
      };

      const response = await reservationService.updateReservation(id, updateData);
      if (response.success) {
        navigate(`/admin/reservaciones/${id}/ver`);
      }
    } catch (error) {
      console.error('Error actualizando reservación:', error);
      alert('Error al actualizar la reservación. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-text-secondary">Cargando reservación...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
          <p className="text-text-primary font-semibold mb-2">Reservación no encontrada</p>
          <button
            onClick={() => navigate('/admin/reservaciones')}
            className="text-primary-600 hover:text-primary-700"
          >
            Volver a reservaciones
          </button>
        </div>
      </div>
    );
  }

  if (!canModify) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
          <p className="text-text-primary font-semibold mb-2">Sin permisos</p>
          <p className="text-text-secondary mb-4">No tienes permisos para editar esta reservación</p>
          <button
            onClick={() => navigate(`/admin/reservaciones/${id}/ver`)}
            className="text-primary-600 hover:text-primary-700"
          >
            Ver detalles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header móvil */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/admin/reservaciones/${id}/ver`)}
              className="p-2 text-neutral-500 hover:text-text-primary rounded-lg hover:bg-neutral-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">Editar Reservación</h1>
              <p className="text-sm text-text-secondary">#{id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Información del cliente */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Cliente
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Cliente
              </label>
              <select
                value={formData.cliente_id}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_id: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl bg-white text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.cliente_id ? 'border-error-300' : 'border-neutral-200'
                }`}
              >
                <option value="">Seleccionar cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.nombre} {client.apellido} - {client.telefono}
                  </option>
                ))}
              </select>
              {errors.cliente_id && (
                <p className="text-error-600 text-sm mt-1">{errors.cliente_id}</p>
              )}
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Fecha y Hora
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.fecha ? 'border-error-300' : 'border-neutral-200'
                  }`}
                />
                {errors.fecha && (
                  <p className="text-error-600 text-sm mt-1">{errors.fecha}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Hora
                </label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.hora ? 'border-error-300' : 'border-neutral-200'
                  }`}
                />
                {errors.hora && (
                  <p className="text-error-600 text-sm mt-1">{errors.hora}</p>
                )}
              </div>
            </div>
          </div>

          {/* Detalles */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Detalles de la Reservación
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Cantidad de Personas
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.cantidad_personas}
                  onChange={(e) => setFormData(prev => ({ ...prev, cantidad_personas: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.cantidad_personas ? 'border-error-300' : 'border-neutral-200'
                  }`}
                />
                {errors.cantidad_personas && (
                  <p className="text-error-600 text-sm mt-1">{errors.cantidad_personas}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Área
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {areas.map((area) => (
                    <div
                      key={area.value}
                      onClick={() => setFormData(prev => ({ ...prev, area: area.value }))}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        formData.area === area.value
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <area.icon className={`w-5 h-5 ${
                          formData.area === area.value ? 'text-primary-600' : 'text-neutral-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            formData.area === area.value ? 'text-primary-900' : 'text-text-primary'
                          }`}>
                            {area.label}
                          </h4>
                          <p className="text-sm text-text-secondary">{area.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.area && (
                  <p className="text-error-600 text-sm mt-1">{errors.area}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Tipo de Reservación
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {tiposReservacion.map((tipo) => (
                    <div
                      key={tipo.value}
                      onClick={() => setFormData(prev => ({ ...prev, tipo_reservacion: tipo.value }))}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        formData.tipo_reservacion === tipo.value
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <tipo.icon className={`w-5 h-5 ${
                          formData.tipo_reservacion === tipo.value ? 'text-primary-600' : 'text-neutral-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            formData.tipo_reservacion === tipo.value ? 'text-primary-900' : 'text-text-primary'
                          }`}>
                            {tipo.label}
                          </h4>
                          <p className="text-sm text-text-secondary">{tipo.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.tipo_reservacion && (
                  <p className="text-error-600 text-sm mt-1">{errors.tipo_reservacion}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Total Estimado (Opcional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.total_estimada}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_estimada: e.target.value }))}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Observaciones (Opcional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Comentarios adicionales sobre la reservación..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Botones de acción */}
      <div className="bg-white border-t border-neutral-200 px-4 py-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/admin/reservaciones/${id}/ver`)}
            className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}