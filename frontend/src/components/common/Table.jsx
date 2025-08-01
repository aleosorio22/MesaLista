import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const Table = ({ 
  columns, 
  data, 
  onSort, 
  sortField, 
  sortDirection,
  onRowClick,
  loading = false,
  emptyMessage = "No hay datos disponibles"
}) => {
  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-text-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="p-8 text-center">
          <p className="text-text-secondary">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider ${
                    column.sortable && onSort ? 'cursor-pointer hover:bg-neutral-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.field)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && onSort && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={`w-3 h-3 ${
                            sortField === column.field && sortDirection === 'asc' 
                              ? 'text-primary-600' 
                              : 'text-neutral-400'
                          }`} 
                        />
                        <ChevronDown 
                          className={`w-3 h-3 -mt-1 ${
                            sortField === column.field && sortDirection === 'desc' 
                              ? 'text-primary-600' 
                              : 'text-neutral-400'
                          }`} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${
                  onRowClick ? 'cursor-pointer hover:bg-neutral-50' : ''
                } transition-colors duration-150`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm">
                    {column.render ? column.render(row) : row[column.field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
