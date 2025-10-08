import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  MapPin, 
  Check, 
  Search, 
  Clock,
  Users,
  UtensilsCrossed,
  Building,
  Home,
  FileText,
  ChefHat,
  Plus
} from 'lucide-react';
import clientService from '../../services/clientService';
import reservationService from '../../services/reservationService';
import { formatLocalDate } from '../../utils/dateUtils';

export default function CreateReservationPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  // Datos del formulario
  const [formData, setFormData] = useState({
    cliente_id: '',
    newClient: {
      nombre: '',
      apellido: '',
      telefono: '',
      email: ''
    },
    fecha: formatLocalDate(new Date()),
    hora: '',
    cantidad_personas: 1,
    area: '',
    tipo_reservacion: '',
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
    loadClients();
  }, []);

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

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      newClient: {
        nombre: '',
        apellido: '',
        telefono: '',
        email: ''
      },
      fecha: formatLocalDate(new Date()),
      hora: '',
      cantidad_personas: 1,
      area: '',
      tipo_reservacion: '',
      observaciones: '',
      total_estimada: 0
    });
    setCurrentStep(1);
    setErrors({});
    setShowNewClientForm(false);
    setClientSearchQuery('');
  };

  // Filtrar clientes basado en la búsqueda
  const filteredClients = clients.filter(client => {
    const searchTerm = clientSearchQuery.toLowerCase();
    return client.nombre.toLowerCase().includes(searchTerm) ||
           client.apellido.toLowerCase().includes(searchTerm) ||
           client.telefono.includes(searchTerm);
  });

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (showNewClientForm) {
          if (!formData.newClient.nombre.trim()) {
            newErrors['newClient.nombre'] = 'El nombre es requerido';
          }
          if (!formData.newClient.apellido.trim()) {
            newErrors['newClient.apellido'] = 'El apellido es requerido';
          }
          if (!formData.newClient.telefono.trim()) {
            newErrors['newClient.telefono'] = 'El teléfono es requerido';
          }
        } else {
          if (!formData.cliente_id) {
            newErrors.cliente_id = 'Debe seleccionar un cliente';
          }
        }
        break;
      case 2:
        if (!formData.fecha) {
          newErrors.fecha = 'La fecha es requerida';
        }
        if (!formData.hora) {
          newErrors.hora = 'La hora es requerida';
        }
        break;
      case 3:
        if (!formData.area) {
          newErrors.area = 'Debe seleccionar un área';
        }
        if (!formData.tipo_reservacion) {
          newErrors.tipo_reservacion = 'Debe seleccionar un tipo de reservación';
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
    if (!validateStep(1)) return;

    try {
      setLoading(true);
      const response = await clientService.createClient(formData.newClient);
      if (response.success) {
        setFormData(prev => ({ ...prev, cliente_id: response.data.id }));
        setShowNewClientForm(false);
        await loadClients();
        // Avanzar automáticamente al siguiente paso
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error creando cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    try {
      setLoading(true);
      
      let clienteId = formData.cliente_id;
      
      if (showNewClientForm) {
        const response = await clientService.createClient(formData.newClient);
        if (response.success) {
          clienteId = response.data.id;
        }
      }

      const reservationData = {
        cliente_id: clienteId,
        fecha: formData.fecha,
        hora: formData.hora,
        cantidad_personas: parseInt(formData.cantidad_personas),
        area: formData.area,
        tipo_reservacion: formData.tipo_reservacion,
        observaciones: formData.observaciones.trim() || null,
        total_estimada: parseFloat(formData.total_estimada) || 0
      };

      const response = await reservationService.createReservation(reservationData);
      
      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate(`/admin/reservaciones/${response.data.id}/ver`);
        }, 2000);
      }

    } catch (error) {
      console.error('Error creando reservación:', error);
      alert('Error al crear la reservación. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6 px-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-300 ${
            currentStep >= step.number
              ? 'bg-primary-500 border-primary-500 text-white'
              : 'border-neutral-300 text-neutral-400'
          }`}>
            {currentStep > step.number ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-all duration-300 ${
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
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>¿Cliente nuevo? Crear uno aquí</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {showNewClientForm && (
            <button
              onClick={handleCreateClient}
              disabled={loading}
              className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? 'Creando cliente...' : 'Crear y Seleccionar Cliente'}
            </button>
          )}
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
        <p className="text-text-secondary text-sm">Complete la información de la reserva</p>
      </div>

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
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Confirmar Reservación</h3>
        <p className="text-text-secondary text-sm">Revise los datos antes de crear la reservación</p>
      </div>

      <div className="bg-neutral-50 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-text-primary mb-2">Cliente</h4>
            <p className="text-sm text-text-secondary">
              {showNewClientForm ? 
                `${formData.newClient.nombre} ${formData.newClient.apellido}` :
                clients.find(c => c.id == formData.cliente_id)?.nombre + ' ' + 
                clients.find(c => c.id == formData.cliente_id)?.apellido
              }
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-text-primary mb-2">Fecha y Hora</h4>
            <p className="text-sm text-text-secondary">
              {formData.fecha} a las {formData.hora}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-text-primary mb-2">Personas</h4>
            <p className="text-sm text-text-secondary">
              {formData.cantidad_personas} persona{formData.cantidad_personas !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-text-primary mb-2">Área</h4>
            <p className="text-sm text-text-secondary">{formData.area}</p>
          </div>
          
          <div className="sm:col-span-2">
            <h4 className="font-medium text-text-primary mb-2">Tipo</h4>
            <p className="text-sm text-text-secondary">{formData.tipo_reservacion}</p>
          </div>
          
          {formData.total_estimada > 0 && (
            <div className="sm:col-span-2">
              <h4 className="font-medium text-text-primary mb-2">Total Estimado</h4>
              <p className="text-sm text-text-secondary">Q{parseFloat(formData.total_estimada).toFixed(2)}</p>
            </div>
          )}
          
          {formData.observaciones && (
            <div className="sm:col-span-2">
              <h4 className="font-medium text-text-primary mb-2">Observaciones</h4>
              <p className="text-sm text-text-secondary">{formData.observaciones}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">¡Reservación Creada!</h3>
          <p className="text-text-secondary text-sm mb-4">
            Redirigiendo a los detalles de la reservación...
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header móvil */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin/reservaciones')}
                className="p-2 text-neutral-500 hover:text-text-primary rounded-lg hover:bg-neutral-50"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-text-primary">Nueva Reservación</h1>
                <p className="text-sm text-text-secondary">
                  Paso {currentStep} de {steps.length}: {steps[currentStep - 1]?.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de pasos */}
      <div className="bg-white border-b border-neutral-100 py-4">
        {renderStepIndicator()}
      </div>

      {/* Contenido */}
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="bg-white border-t border-neutral-200 px-4 py-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex justify-between space-x-4">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50 flex-1 sm:flex-none"
            >
              Anterior
            </button>
          )}
          
          <div className="flex-1 flex justify-end">
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 flex-1 sm:flex-none"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 flex-1 sm:flex-none"
              >
                {loading ? 'Creando...' : 'Crear Reservación'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}