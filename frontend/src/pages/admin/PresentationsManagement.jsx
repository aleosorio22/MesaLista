import React from 'react';

export default function PresentationsManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Gestión de Presentaciones</h1>
        <p className="text-text-secondary">Administra las presentaciones de productos</p>
      </div>
      
      <div className="card p-8 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Próximamente
        </h2>
        <p className="text-text-secondary">
          La gestión de presentaciones estará disponible pronto
        </p>
      </div>
    </div>
  );
}
