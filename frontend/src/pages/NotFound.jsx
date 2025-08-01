import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="text-9xl font-bold text-neutral-300">404</div>
        <h1 className="text-2xl font-bold text-text-primary">
          Página no encontrada
        </h1>
        <p className="text-text-secondary max-w-md">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link
          to="/admin/dashboard"
          className="btn-primary inline-block"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
