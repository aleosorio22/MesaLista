import React, { useState } from 'react';
import { Clock, Users, MapPin, Phone, Edit, Trash2, Eye, DollarSign, MoreVertical } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ReservationCard({ reservation, canModify, onUpdate, onView, onEdit, onDelete }) {
  const { auth } = useAuth();
  const [showActions, setShowActions] = useState(false);

  const formatTime = (time) => {
    return time ? time.slice(0, 5) : '';
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-GT', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (reservation) => {
    const totalPagado = reservation.total_pagado || 0;
    const totalEstimada = reservation.total_estimada || 0;
    
    if (totalPagado === 0) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (totalPagado >= totalEstimada) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (reservation) => {
    const totalPagado = reservation.total_pagado || 0;
    const totalEstimada = reservation.total_estimada || 0;
    
    if (totalPagado === 0) {
      return 'Pendiente';
    } else if (totalPagado >= totalEstimada) {
      return 'Pagado';
    } else {
      return 'Parcial';
    }
  };

  const getAreaIcon = (area) => {
    switch (area) {
      case 'Restaurante':
        return '�️';
      case 'Salón Principal':
        return '�️';
      case 'Salón pequeño':
        return '�';
      default:
        return '📍';
    }
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    setShowActions(false);
    
    switch (action) {
      case 'view':
        if (onView) onView(reservation);
        break;
      case 'edit':
        if (onEdit) onEdit(reservation);
        break;
      case 'delete':
        if (onDelete) onDelete(reservation);
        break;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header de la tarjeta */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {reservation.cliente_nombre?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text-primary text-base truncate">
                {reservation.cliente_nombre} {reservation.cliente_apellido}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-text-secondary">
                  {formatDate(reservation.fecha)}
                </span>
                <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                <span className="text-sm font-medium text-text-primary">
                  {formatTime(reservation.hora)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Status badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation)}`}>
            {getStatusText(reservation)}
          </div>
        </div>
      </div>

      {/* Información principal */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Personas y área */}
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-text-secondary">
              {reservation.cantidad_personas} persona{reservation.cantidad_personas !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-base">{getAreaIcon(reservation.area)}</span>
            <span className="text-sm text-text-secondary capitalize">
              {reservation.area}
            </span>
          </div>
        </div>

        {/* Tipo de reservación */}
        <div className="mt-2 flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
            reservation.tipo_reservacion === 'Orden previa' 
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {reservation.tipo_reservacion === 'Orden previa' && '📝'}
            {reservation.tipo_reservacion === 'Carta abierta' && '📋'}
            <span className="ml-1">{reservation.tipo_reservacion}</span>
          </div>
        </div>

        {/* Observaciones si existen */}
        {reservation.observaciones && (
          <div className="mt-3 p-2 bg-neutral-50 rounded-lg">
            <p className="text-xs text-text-secondary line-clamp-2">
              {reservation.observaciones}
            </p>
          </div>
        )}
      </div>

      {/* Footer con totales y acciones */}
      <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          {/* Información de totales */}
          <div className="flex items-center space-x-4">
            {reservation.total_estimada > 0 && (
              <div className="text-xs">
                <span className="text-text-secondary">Total: </span>
                <span className="font-semibold text-text-primary">
                  Q{parseFloat(reservation.total_estimada).toFixed(2)}
                </span>
              </div>
            )}
            {reservation.total_pendiente > 0 && (
              <div className="text-xs">
                <span className="text-text-secondary">Pendiente: </span>
                <span className="font-semibold text-orange-600">
                  Q{parseFloat(reservation.total_pendiente).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-2">
            {/* Siempre mostrar botón de ver */}
            <button
              onClick={(e) => handleActionClick(e, 'view')}
              className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Botones de edición y eliminación solo si tiene permisos */}
            {canModify && (
              <>
                <button
                  onClick={(e) => handleActionClick(e, 'edit')}
                  className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleActionClick(e, 'delete')}
                  className="p-2 text-neutral-500 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Información del usuario que creó la reserva */}
        {reservation.usuario_nombre && (
          <div className="mt-2 text-xs text-text-muted">
            Creado por: {reservation.usuario_nombre}
          </div>
        )}
      </div>
    </div>
  );
}
