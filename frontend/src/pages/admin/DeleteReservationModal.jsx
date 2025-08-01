import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import reservationService from '../../services/reservationService';
import Modal from '../../components/common/Modal';

export default function DeleteReservationModal({ isOpen, onClose, reservation, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await reservationService.deleteReservation(reservation.id);
      
      if (response.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al eliminar reservación:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-GT', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time ? time.slice(0, 5) : '';
  };

  if (!isOpen || !reservation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Eliminación"
      footer={
        <>
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="bg-error-600 hover:bg-error-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-error-600" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            ¿Eliminar esta reservación?
          </h3>
          <p className="text-text-secondary mb-4">
            Esta acción no se puede deshacer. Se eliminarán todos los datos relacionados.
          </p>
        </div>

        {/* Información de la reservación */}
        <div className="bg-neutral-50 rounded-xl p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Cliente:</span>
              <span className="font-medium text-text-primary">
                {reservation.cliente_nombre} {reservation.cliente_apellido}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Fecha:</span>
              <span className="font-medium text-text-primary">
                {formatDate(reservation.fecha)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Hora:</span>
              <span className="font-medium text-text-primary">
                {formatTime(reservation.hora)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Personas:</span>
              <span className="font-medium text-text-primary">
                {reservation.cantidad_personas}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Área:</span>
              <span className="font-medium text-text-primary">
                {reservation.area}
              </span>
            </div>
            {reservation.total_estimada > 0 && (
              <div className="flex justify-between border-t border-neutral-200 pt-2 mt-2">
                <span className="text-text-secondary">Total Estimado:</span>
                <span className="font-bold text-text-primary">
                  Q{parseFloat(reservation.total_estimada).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Advertencia:</strong> También se eliminarán todos los productos y anticipos asociados a esta reservación.
          </p>
        </div>
      </div>
    </Modal>
  );
}
