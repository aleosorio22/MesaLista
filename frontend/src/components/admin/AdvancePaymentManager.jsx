import React, { useState } from 'react';
import { Plus, CreditCard, Trash2, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import reservationService from '../../services/reservationService';

const AdvancePaymentManager = ({ 
  reservationId, 
  anticipos = [], 
  totalEstimada = 0, 
  totalPagado = 0,
  canModify = false,
  onUpdate 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    monto: '',
    metodo_pago: 'Efectivo',
    observaciones: ''
  });
  const [errors, setErrors] = useState({});

  const metodosPago = [
    'Efectivo',
    'Tarjeta de débito',
    'Tarjeta de crédito',
    'Transferencia bancaria',
    'Depósito bancario',
    'Cheque',
    'Otro'
  ];

  const validateForm = () => {
    const newErrors = {};
    const monto = parseFloat(formData.monto);
    const totalPendiente = totalEstimada - totalPagado;

    if (!formData.monto || isNaN(monto) || monto <= 0) {
      newErrors.monto = 'Ingrese un monto válido mayor a 0';
    } else if (monto > totalPendiente) {
      newErrors.monto = `El monto no puede exceder lo pendiente (Q${totalPendiente.toFixed(2)})`;
    }

    if (!formData.metodo_pago.trim()) {
      newErrors.metodo_pago = 'Seleccione un método de pago';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await reservationService.addAdvanceToReservation(reservationId, {
        monto: parseFloat(formData.monto),
        metodo_pago: formData.metodo_pago,
        observaciones: formData.observaciones || null
      });

      if (response.success) {
        // Reset form
        setFormData({
          monto: '',
          metodo_pago: 'Efectivo',
          observaciones: ''
        });
        setShowAddForm(false);
        setErrors({});
        
        // Notificar actualización
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error al agregar anticipo:', error);
      setErrors({ submit: error.message || 'Error al agregar el anticipo' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdvance = async (anticipoId) => {
    if (!window.confirm('¿Está seguro de eliminar este anticipo?')) return;

    try {
      setLoading(true);
      const response = await reservationService.removeAdvanceFromReservation(anticipoId);
      
      if (response.success) {
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error al eliminar anticipo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setFormData({
      monto: '',
      metodo_pago: 'Efectivo',
      observaciones: ''
    });
    setErrors({});
  };

  const totalPendiente = totalEstimada - totalPagado;
  const hayAnticipoPendiente = totalPendiente > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-text-primary flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-primary-600" />
          <span>Pagos y Anticipos</span>
        </h4>
        {canModify && hayAnticipoPendiente && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1 hover:bg-primary-50 px-2 py-1 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Pago</span>
          </button>
        )}
      </div>

      {/* Formulario para agregar anticipo */}
      {showAddForm && canModify && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h5 className="font-medium text-text-primary mb-3">Agregar Nuevo Pago</h5>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Monto <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={totalPendiente}
                  value={formData.monto}
                  onChange={(e) => setFormData(prev => ({ ...prev, monto: e.target.value }))}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.monto ? 'border-error-300 bg-error-50' : 'border-neutral-300 bg-white'
                  }`}
                />
              </div>
              {errors.monto && (
                <p className="mt-1 text-xs text-error-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.monto}</span>
                </p>
              )}
              <p className="mt-1 text-xs text-text-muted">
                Pendiente: Q{totalPendiente.toFixed(2)}
              </p>
            </div>

            {/* Método de pago */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Método de Pago <span className="text-error-500">*</span>
              </label>
              <select
                value={formData.metodo_pago}
                onChange={(e) => setFormData(prev => ({ ...prev, metodo_pago: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.metodo_pago ? 'border-error-300 bg-error-50' : 'border-neutral-300 bg-white'
                }`}
              >
                {metodosPago.map(metodo => (
                  <option key={metodo} value={metodo}>{metodo}</option>
                ))}
              </select>
              {errors.metodo_pago && (
                <p className="mt-1 text-xs text-error-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.metodo_pago}</span>
                </p>
              )}
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Observaciones (opcional)
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Notas adicionales sobre el pago..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white resize-none"
                rows={2}
              />
            </div>

            {/* Error de envío */}
            {errors.submit && (
              <div className="p-2 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-xs text-error-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.submit}</span>
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Agregar Pago'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="btn-secondary text-sm px-4 py-2"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de anticipos existentes */}
      <div className="space-y-2">
        {anticipos && anticipos.length > 0 ? (
          anticipos.map((anticipo) => (
            <div 
              key={anticipo.id} 
              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800">
                    Q{parseFloat(anticipo.monto).toFixed(2)}
                  </span>
                  <span className="text-green-600 text-sm">
                    • {anticipo.metodo_pago}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">
                    {new Date(anticipo.fecha).toLocaleDateString('es-GT', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {anticipo.observaciones && (
                  <p className="text-xs text-green-600 mt-1 italic">
                    "{anticipo.observaciones}"
                  </p>
                )}
              </div>
              {canModify && (
                <button
                  onClick={() => handleRemoveAdvance(anticipo.id)}
                  disabled={loading}
                  className="p-1 text-green-600 hover:text-error-600 hover:bg-error-50 rounded transition-colors disabled:opacity-50"
                  title="Eliminar pago"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6 bg-neutral-50 rounded-lg border border-neutral-200">
            <CreditCard className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No hay pagos registrados</p>
            {canModify && hayAnticipoPendiente && (
              <p className="text-xs text-text-muted mt-1">
                Haga clic en "Agregar Pago" para registrar un anticipo
              </p>
            )}
          </div>
        )}
      </div>

      {/* Información adicional */}
      {!hayAnticipoPendiente && totalPagado >= totalEstimada && (
        <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm font-medium text-green-800">
              ✅ Reservación completamente pagada
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancePaymentManager;
