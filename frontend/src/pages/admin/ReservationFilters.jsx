import React from 'react';
import { X } from 'lucide-react';

export default function ReservationFilters({ filters, onFilterChange }) {
  const areas = [
    { value: 'Restaurante', label: '�️ Restaurante' },
    { value: 'Salón Principal', label: '�️ Salón Principal' },
    { value: 'Salón pequeño', label: '� Salón Pequeño' }
  ];

  const tiposReservacion = [
    { value: 'Carta abierta', label: '� Carta Abierta' },
    { value: 'Orden previa', label: '📝 Orden Previa' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters };
    if (value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text-primary">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            <X className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Filtro por área */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">
            Área
          </label>
          <select
            value={filters.area || ''}
            onChange={(e) => handleFilterChange('area', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todas las áreas</option>
            {areas.map(area => (
              <option key={area.value} value={area.value}>
                {area.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por tipo de reservación */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">
            Tipo de Reservación
          </label>
          <select
            value={filters.tipo_reservacion || ''}
            onChange={(e) => handleFilterChange('tipo_reservacion', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            {tiposReservacion.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Indicadores de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200">
          {Object.entries(filters).map(([key, value]) => {
            const getFilterLabel = () => {
              if (key === 'area') {
                const area = areas.find(a => a.value === value);
                return area ? area.label : value;
              }
              if (key === 'tipo_reservacion') {
                const tipo = tiposReservacion.find(t => t.value === value);
                return tipo ? tipo.label : value;
              }
              return value;
            };

            return (
              <span
                key={key}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
              >
                <span>{getFilterLabel()}</span>
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="hover:bg-primary-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
