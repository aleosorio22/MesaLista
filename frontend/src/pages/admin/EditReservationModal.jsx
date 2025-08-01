import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, MapPin, MessageSquare, CreditCard } from 'lucide-react';
import clientService from '../../services/clientService';
import reservationService from '../../services/reservationService';
import Modal from '../../components/common/Modal';

export default function EditReservationModal({ isOpen, onClose, reservation, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);

  // Datos del formulario
  const [formData, setFormData] = useState({
    cliente_id: '',
    fecha: '',
    hora: '',
    cantidad_personas: 1,
    area: '',
    tipo_reservacion: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState({});

  const areas = [
    { value: 'Restaurante', label: 'Restaurante' },
    { value: 'Salón Principal', label: 'Salón Principal' },
    { value: 'Salón pequeño', label: 'Salón Pequeño' }
  ];

  const tiposReservacion = [
    { value: 'Carta abierta', label: 'Carta Abierta' },
    { value: 'Orden previa', label: 'Orden Previa' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadClients();
      if (reservation) {
        setFormData({
          cliente_id: reservation.cliente_id,
          fecha: reservation.fecha,
          hora: reservation.hora,
          cantidad_personas: reservation.cantidad_personas,
          area: reservation.area,
          tipo_reservacion: reservation.tipo_reservacion,
          observaciones: reservation.observaciones || ''
        });
      }
    }
  }, [isOpen, reservation]);

  const loadClients = async () => {
    try {
      const response = await clientService.getAllClients();
      if (response.success) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      fecha: '',
      hora: '',
      cantidad_personas: 1,
      area: '',
      tipo_reservacion: '',
      observaciones: ''
    });
    setErrors({});
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

    // Validar que la fecha no sea en el pasado
    const selectedDate = new Date(formData.fecha + 'T' + formData.hora);
    if (selectedDate < new Date()) {
      newErrors.fecha = 'La fecha y hora no pueden ser en el pasado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const updateData = {
        cliente_id: formData.cliente_id,
        fecha: formData.fecha,
        hora: formData.hora,
        cantidad_personas: parseInt(formData.cantidad_personas),
        area: formData.area,
        tipo_reservacion: formData.tipo_reservacion,
        observaciones: formData.observaciones || null
      };

      const response = await reservationService.updateReservation(reservation.id, updateData);
      
      if (response.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al actualizar reservación:', error);
      setErrors({ general: error.message || 'Error al actualizar la reservación' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !reservation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Reservación"
      maxWidth="md:max-w-lg"
      footer={
        <>
          <button
            onClick={handleClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {errors.general && (
          <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        {/* Cliente */}
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
            <option value="">Seleccionar cliente...</option>
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

        {/* Fecha y Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Fecha
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
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

        {/* Cantidad de personas */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            <Users className="w-4 h-4 inline mr-2" />
            Cantidad de Personas
          </label>
          <div className="flex items-center justify-center space-x-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                cantidad_personas: Math.max(1, prev.cantidad_personas - 1) 
              }))}
              className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 text-text-primary font-semibold transition-colors"
            >
              -
            </button>
            <span className="text-2xl font-bold text-text-primary min-w-[3rem] text-center">
              {formData.cantidad_personas}
            </span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                cantidad_personas: prev.cantidad_personas + 1 
              }))}
              className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 text-text-primary font-semibold transition-colors"
            >
              +
            </button>
          </div>
          {errors.cantidad_personas && (
            <p className="text-error-600 text-sm mt-1 text-center">{errors.cantidad_personas}</p>
          )}
        </div>

        {/* Área */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            <MapPin className="w-4 h-4 inline mr-2" />
            Área
          </label>
          <div className="grid grid-cols-1 gap-3">
            {areas.map(area => (
              <button
                key={area.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, area: area.value }))}
                className={`p-3 border-2 rounded-xl text-left transition-all ${
                  formData.area === area.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="font-medium text-text-primary">{area.label}</div>
              </button>
            ))}
          </div>
          {errors.area && (
            <p className="text-error-600 text-sm mt-1">{errors.area}</p>
          )}
        </div>

        {/* Tipo de reservación */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Tipo de Reservación
          </label>
          <div className="grid grid-cols-1 gap-3">
            {tiposReservacion.map(tipo => (
              <button
                key={tipo.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tipo_reservacion: tipo.value }))}
                className={`p-3 border-2 rounded-xl text-left transition-all ${
                  formData.tipo_reservacion === tipo.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="font-medium text-text-primary">{tipo.label}</div>
              </button>
            ))}
          </div>
          {errors.tipo_reservacion && (
            <p className="text-error-600 text-sm mt-1">{errors.tipo_reservacion}</p>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Observaciones (opcional)
          </label>
          <textarea
            value={formData.observaciones}
            onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
            placeholder="Alguna nota especial para esta reservación..."
            rows={3}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}
