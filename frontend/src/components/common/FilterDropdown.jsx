import React, { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

const FilterDropdown = ({ 
  title = "Filtros",
  filters = [],
  activeFilters = {},
  onFilterChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (filterKey, value) => {
    onFilterChange(filterKey, value);
  };

  const getActiveFiltersCount = () => {
    return Object.values(activeFilters).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
      >
        <Filter className="w-4 h-4 text-text-muted" />
        <span className="text-sm font-medium text-text-primary">{title}</span>
        {getActiveFiltersCount() > 0 && (
          <span className="badge-notification text-xs px-2 py-1">
            {getActiveFiltersCount()}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-20">
            <div className="px-4 py-2 border-b border-neutral-200">
              <h3 className="text-sm font-medium text-text-primary">Filtrar por:</h3>
            </div>
            
            <div className="p-4 space-y-4">
              {filters.map((filter, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    {filter.label}
                  </label>
                  
                  {filter.type === 'select' && (
                    <select
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-full input text-sm"
                    >
                      <option value="">Todos</option>
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {filter.type === 'text' && (
                    <input
                      type="text"
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      placeholder={filter.placeholder}
                      className="w-full input text-sm"
                    />
                  )}
                </div>
              ))}
            </div>

            {getActiveFiltersCount() > 0 && (
              <div className="px-4 py-2 border-t border-neutral-200">
                <button
                  onClick={() => {
                    filters.forEach(filter => {
                      handleFilterChange(filter.key, '');
                    });
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FilterDropdown;
