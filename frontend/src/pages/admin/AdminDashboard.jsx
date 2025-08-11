import React from 'react';
import WeeklyReservations from '../../components/admin/WeeklyReservations';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">Bienvenido al panel administrativo</p>
      </div>

      {/* Reservaciones de la próxima semana */}
      <div className="max-w-4xl">
        <WeeklyReservations />
      </div>
    </div>
  );
}
