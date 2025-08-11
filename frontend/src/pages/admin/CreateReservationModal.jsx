import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Calendar, Users, MapPin, Clock, User, MessageSquare, CreditCard } from 'lucide-react';
import clientService from '../../services/clientService';
import reservationService from '../../services/reservationService';
import Modal from '../../components/common/Modal';
import { formatLocalDate } from '../../utils/dateUtils';

export default function CreateReservationModal({ isOpen, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState({
    // Paso 1: Cliente
    cliente_id: '',
    newClient: {
      nombre: '',
      apellido: '',
      telefono: '',
      email: ''
    },
    
    // Paso 2: Fecha y hora
    fecha: formatLocalDate(new Date()),
    hora: '',
    
    // Paso 3: Detalles
    cantidad_personas: 1,
    area: '',
    tipo_reservacion: '',
    
    // Paso 4: Observaciones
    observaciones: '',
    total_estimada: 0
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, title: 'Cliente', icon: User },
    { number: 2, title: 'Fecha & Hora', icon: Calendar },
    { number: 3, title: 'Detalles', icon: MapPin },
    { number: 4, title: 'Finalizar', icon: Check }
  ];

  const areas = [
    { value: 'Restaurante', label: 'Restaurante', icon: '�️', description: 'Área principal del restaurante' },
    { value: 'Salón Principal', label: 'Salón Principal', icon: '�️', description: 'Salón grande para eventos' },
    { value: 'Salón pequeño', label: 'Salón Pequeño', icon: '�', description: 'Salón íntimo para grupos pequeños' }
  ];

  const tiposReservacion = [
    { value: 'Carta abierta', label: 'Carta Abierta', icon: '📋', description: 'El cliente elige del menú disponible' },
    { value: 'Orden previa', label: 'Orden Previa', icon: '�', description: 'Menú predefinido acordado previamente' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadClients();
      resetForm();
    }
  }, [isOpen]);

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
    setCurrentStep(1);
    setShowNewClientForm(false);
    setShowSuccess(false);
    setFormData({
      cliente_id: '',
      newClient: { nombre: '', apellido: '', telefono: '', email: '' },
      fecha: formatLocalDate(new Date()),
      hora: '',
      cantidad_personas: 1,
      area: '',
      tipo_reservacion: '',
      observaciones: '',
      total_estimada: 0
    });
    setErrors({});
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.cliente_id && !showNewClientForm) {
          newErrors.cliente_id = 'Selecciona un cliente o crea uno nuevo';
        }
        if (showNewClientForm) {
          if (!formData.newClient.nombre.trim()) {
            newErrors['newClient.nombre'] = 'El nombre es obligatorio';
          }
          if (!formData.newClient.apellido.trim()) {
            newErrors['newClient.apellido'] = 'El apellido es obligatorio';
          }
          if (!formData.newClient.telefono.trim()) {
            newErrors['newClient.telefono'] = 'El teléfono es obligatorio';
          }
        }
        break;
      
      case 2:
        if (!formData.fecha) {
          newErrors.fecha = 'La fecha es obligatoria';
        }
        if (!formData.hora) {
          newErrors.hora = 'La hora es obligatoria';
        }
        // Validar que la fecha no sea en el pasado
        const selectedDate = new Date(formData.fecha + 'T' + (formData.hora || '00:00'));
        const now = new Date();
        // Crear fecha actual sin tiempo para comparar solo la fecha
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const reservationDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        
        if (reservationDate < today) {
          newErrors.fecha = 'La fecha no puede ser en el pasado';
        } else if (reservationDate.getTime() === today.getTime() && selectedDate < now) {
          newErrors.fecha = 'La hora no puede ser en el pasado para hoy';
        }
        break;
      
      case 3:
        if (!formData.area) {
          newErrors.area = 'Selecciona un área';
        }
        if (!formData.tipo_reservacion) {
          newErrors.tipo_reservacion = 'Selecciona el tipo de reservación';
        }
        if (formData.cantidad_personas < 1) {
          newErrors.cantidad_personas = 'Debe ser al menos 1 persona';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleCreateClient = async () => {
    try {
      const response = await clientService.createClient(formData.newClient);
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          cliente_id: response.data.id
        }));
        setShowNewClientForm(false);
        await loadClients();
        return true;
      }
    } catch (error) {
      console.error('Error al crear cliente:', error);
      setErrors({ general: error.message || 'Error al crear cliente' });
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      setLoading(true);

      // Si es un cliente nuevo, crearlo primero
      if (showNewClientForm) {
        const clientCreated = await handleCreateClient();
        if (!clientCreated) return;
      }

      // Crear la reservación
      const reservationData = {
        cliente_id: formData.cliente_id,
        fecha: formData.fecha,
        hora: formData.hora,
        cantidad_personas: parseInt(formData.cantidad_personas),
        area: formData.area,
        tipo_reservacion: formData.tipo_reservacion,
        observaciones: formData.observaciones || null,
        total_estimada: parseFloat(formData.total_estimada) || 0
      };

      const response = await reservationService.createReservation(reservationData);
      
      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error('Error al crear reservación:', error);
      setErrors({ general: error.message || 'Error al crear la reservación' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
            currentStep >= step.number
              ? 'bg-primary-500 border-primary-500 text-white'
              : 'border-neutral-300 text-neutral-400'
          }`}>
            {currentStep > step.number ? (
              <Check className="w-5 h-5" />
            ) : (
              <step.icon className="w-5 h-5" />
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
              currentStep > step.number ? 'bg-primary-500' : 'bg-neutral-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Seleccionar Cliente</h3>
        <p className="text-text-secondary text-sm">¿Para quién es esta reservación?</p>
      </div>

      {!showNewClientForm ? (
        <div className="space-y-4">
          <div className="relative">
            <select
              value={formData.cliente_id}
              onChange={(e) => setFormData(prev => ({ ...prev, cliente_id: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-xl bg-white text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.cliente_id ? 'border-error-300' : 'border-neutral-200'
              }`}
            >
              <option value="">Seleccionar cliente existente...</option>
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

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowNewClientForm(true)}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              ¿Cliente nuevo? Crear uno aquí
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-text-primary">Nuevo Cliente</h4>
            <button
              onClick={() => setShowNewClientForm(false)}
              className="text-sm text-text-secondary hover:text-text-primary"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                placeholder="Nombre"
                value={formData.newClient.nombre}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  newClient: { ...prev.newClient, nombre: e.target.value }
                }))}
                className={`w-full px-3 py-3 border rounded-xl text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors['newClient.nombre'] ? 'border-error-300' : 'border-neutral-200'
                }`}
              />
              {errors['newClient.nombre'] && (
                <p className="text-error-600 text-xs mt-1">{errors['newClient.nombre']}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Apellido"
                value={formData.newClient.apellido}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  newClient: { ...prev.newClient, apellido: e.target.value }
                }))}
                className={`w-full px-3 py-3 border rounded-xl text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors['newClient.apellido'] ? 'border-error-300' : 'border-neutral-200'
                }`}
              />
              {errors['newClient.apellido'] && (
                <p className="text-error-600 text-xs mt-1">{errors['newClient.apellido']}</p>
              )}
            </div>
          </div>

          <div>
            <input
              type="tel"
              placeholder="Teléfono"
              value={formData.newClient.telefono}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                newClient: { ...prev.newClient, telefono: e.target.value }
              }))}
              className={`w-full px-3 py-3 border rounded-xl text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors['newClient.telefono'] ? 'border-error-300' : 'border-neutral-200'
              }`}
            />
            {errors['newClient.telefono'] && (
              <p className="text-error-600 text-xs mt-1">{errors['newClient.telefono']}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email (opcional)"
              value={formData.newClient.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                newClient: { ...prev.newClient, email: e.target.value }
              }))}
              className="w-full px-3 py-3 border border-neutral-200 rounded-xl text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Fecha y Hora</h3>
        <p className="text-text-secondary text-sm">¿Cuándo será la reservación?</p>
      </div>

      <div className="space-y-4">
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
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Detalles de la Reservación</h3>
        <p className="text-text-secondary text-sm">Configuremos los detalles</p>
      </div>

      <div className="space-y-6">
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
          <div className="grid grid-cols-2 gap-3">
            {areas.map(area => (
              <button
                key={area.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, area: area.value }))}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  formData.area === area.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="text-2xl mb-2">{area.icon}</div>
                <div className="font-medium text-text-primary">{area.label}</div>
                <div className="text-xs text-text-secondary">{area.description}</div>
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
          <div className="grid grid-cols-2 gap-3">
            {tiposReservacion.map(tipo => (
              <button
                key={tipo.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tipo_reservacion: tipo.value }))}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  formData.tipo_reservacion === tipo.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="text-2xl mb-2">{tipo.icon}</div>
                <div className="font-medium text-text-primary">{tipo.label}</div>
                <div className="text-xs text-text-secondary">{tipo.description}</div>
              </button>
            ))}
          </div>
          {errors.tipo_reservacion && (
            <p className="text-error-600 text-sm mt-1">{errors.tipo_reservacion}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Finalizar Reservación</h3>
        <p className="text-text-secondary text-sm">Agrega observaciones y revisa los detalles</p>
      </div>

      <div className="space-y-4">
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

        {/* Total estimado */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <CreditCard className="w-4 h-4 inline mr-2" />
            Total Estimado (opcional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">Q</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.total_estimada}
              onChange={(e) => setFormData(prev => ({ ...prev, total_estimada: e.target.value }))}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-neutral-200 rounded-xl text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Resumen */}
        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
          <h4 className="font-medium text-text-primary mb-3">Resumen de la Reservación</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Cliente:</span>
              <span className="text-text-primary font-medium">
                {showNewClientForm 
                  ? `${formData.newClient.nombre} ${formData.newClient.apellido}`
                  : clients.find(c => c.id === formData.cliente_id)?.nombre + ' ' + 
                    clients.find(c => c.id === formData.cliente_id)?.apellido
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Fecha:</span>
              <span className="text-text-primary font-medium">
                {new Date(formData.fecha).toLocaleDateString('es-GT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Hora:</span>
              <span className="text-text-primary font-medium">{formData.hora}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Personas:</span>
              <span className="text-text-primary font-medium">{formData.cantidad_personas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Área:</span>
              <span className="text-text-primary font-medium capitalize">
                {areas.find(a => a.value === formData.area)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Tipo:</span>
              <span className="text-text-primary font-medium capitalize">
                {tiposReservacion.find(t => t.value === formData.tipo_reservacion)?.label}
              </span>
            </div>
            {formData.total_estimada > 0 && (
              <div className="flex justify-between border-t border-neutral-200 pt-2 mt-2">
                <span className="text-text-secondary">Total Estimado:</span>
                <span className="text-text-primary font-bold">Q{parseFloat(formData.total_estimada).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccessAnimation = () => (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
        <Check className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        ¡Reservación Creada!
      </h3>
      <p className="text-text-secondary">
        La reservación se ha creado exitosamente
      </p>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="md:max-w-lg"
      footer={null}
    >
      <div className="px-6 py-6">
        {showSuccess ? (
          renderSuccessAnimation()
        ) : (
          <>
            {renderStepIndicator()}
            
            <div className="mb-6">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </div>

            {errors.general && (
              <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-600 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Botones de navegación */}
            <div className="flex justify-between">
              {currentStep > 1 ? (
                <button
                  onClick={prevStep}
                  className="flex items-center space-x-2 px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 btn-primary"
                  disabled={loading}
                >
                  <span>Siguiente</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Reservación'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
