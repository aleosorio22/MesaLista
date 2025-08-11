import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Calendar, Users, MapPin, Clock, User, MessageSquare, CreditCard, Search, UtensilsCrossed, Home, Building, FileText, ChefHat } from 'lucide-react';
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
  const [clientSearchQuery, setClientSearchQuery] = useState('');

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
    { value: 'Restaurante', label: 'Restaurante', icon: UtensilsCrossed, description: 'Área principal del restaurante' },
    { value: 'Salón Principal', label: 'Salón Principal', icon: Building, description: 'Salón grande para eventos' },
    { value: 'Salón pequeño', label: 'Salón Pequeño', icon: Home, description: 'Salón íntimo para grupos pequeños' }
  ];

  const tiposReservacion = [
    { value: 'Carta abierta', label: 'Carta Abierta', icon: FileText, description: 'El cliente elige del menú disponible' },
    { value: 'Orden previa', label: 'Orden Previa', icon: ChefHat, description: 'Menú predefinido acordado previamente' }
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
    setClientSearchQuery('');
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

  // Filtrar clientes basado en la búsqueda
  const filteredClients = clients.filter(client => {
    if (!clientSearchQuery) return true;
    
    const searchLower = clientSearchQuery.toLowerCase();
    const nombreCompleto = `${client.nombre} ${client.apellido}`.toLowerCase();
    const telefono = client.telefono?.toLowerCase() || '';
    
    return nombreCompleto.includes(searchLower) || telefono.includes(searchLower);
  });

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
        // Actualizar cliente_id y cerrar formulario de cliente nuevo
        setFormData(prev => ({
          ...prev,
          cliente_id: response.data.id
        }));
        setShowNewClientForm(false);
        await loadClients();
        return response.data.id; // Retornar el ID del cliente creado
      }
      return null;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      setErrors({ general: error.message || 'Error al crear cliente' });
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      let clienteIdFinal = formData.cliente_id;

      // Si es un cliente nuevo, crearlo primero
      if (showNewClientForm) {
        const newClientId = await handleCreateClient();
        if (!newClientId) {
          setLoading(false);
          return;
        }
        clienteIdFinal = newClientId; // Usar el ID retornado directamente
      }

      // Validar que tenemos cliente_id
      if (!clienteIdFinal) {
        setErrors({ general: 'Debe seleccionar un cliente para crear la reservación' });
        setLoading(false);
        return;
      }

      // Crear la reservación
      const reservationData = {
        cliente_id: clienteIdFinal,
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
          {/* Input de búsqueda */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar cliente por nombre o teléfono..."
              value={clientSearchQuery}
              onChange={(e) => setClientSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl bg-white text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Dropdown de clientes filtrados */}
          <div className="relative">
            <select
              value={formData.cliente_id}
              onChange={(e) => setFormData(prev => ({ ...prev, cliente_id: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-xl bg-white text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.cliente_id ? 'border-error-300' : 'border-neutral-200'
              }`}
            >
              <option value="">
                {clientSearchQuery ? 
                  `${filteredClients.length} cliente${filteredClients.length !== 1 ? 's' : ''} encontrado${filteredClients.length !== 1 ? 's' : ''}` : 
                  'Seleccionar cliente existente...'
                }
              </option>
              {filteredClients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.nombre} {client.apellido} - {client.telefono}
                </option>
              ))}
            </select>
            {errors.cliente_id && (
              <p className="text-error-600 text-sm mt-1">{errors.cliente_id}</p>
            )}
            
            {/* Mensaje cuando no hay resultados */}
            {clientSearchQuery && filteredClients.length === 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-b-xl shadow-lg p-3 text-sm text-neutral-500">
                No se encontraron clientes que coincidan con "{clientSearchQuery}"
              </div>
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
                <div className="mb-2">
                  <area.icon className="w-8 h-8 text-primary-600" />
                </div>
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
                <div className="mb-2">
                  <tipo.icon className="w-8 h-8 text-primary-600" />
                </div>
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

  // Función auxiliar para obtener el cliente seleccionado
  const getSelectedClientName = () => {
    if (showNewClientForm) {
      return `${formData.newClient.nombre} ${formData.newClient.apellido}`.trim();
    }
    
    if (!formData.cliente_id) {
      return 'Cliente no seleccionado';
    }
    
    // Convertir ambos a string para comparación segura
    const clienteIdString = String(formData.cliente_id);
    const selectedClient = clients.find(c => String(c.id) === clienteIdString);
    
    return selectedClient 
      ? `${selectedClient.nombre} ${selectedClient.apellido}`.trim()
      : 'Cliente no seleccionado';
  };

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
                {getSelectedClientName()}
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
