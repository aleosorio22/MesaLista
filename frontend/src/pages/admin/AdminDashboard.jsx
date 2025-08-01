import React from 'react';
import { 
  DollarSign, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      title: "Ventas del día",
      value: "$25,430",
      change: "+12%",
      changeType: "positive",
      icon: DollarSign
    },
    {
      title: "Usuarios activos",
      value: "48",
      change: "+3",
      changeType: "positive",
      icon: Users
    },
    {
      title: "Productos bajos",
      value: "12",
      change: "-2",
      changeType: "negative",
      icon: Package
    },
    {
      title: "Pedidos pendientes",
      value: "35",
      change: "+5",
      changeType: "positive",
      icon: ShoppingCart
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "Nueva venta registrada",
      description: "Venta #1234 por $1,250.00",
      time: "Hace 5 min",
      icon: DollarSign
    },
    {
      id: 2,
      type: "Producto bajo en stock",
      description: "Pan Integral - Quedan 5 unidades",
      time: "Hace 10 min",
      icon: Package
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Resumen del día</h1>
        <p className="text-text-secondary">Bienvenido al panel administrativo</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-text-primary mt-2">
                  {stat.value}
                </p>
                <p className={`text-sm mt-1 ${
                  stat.changeType === 'positive' ? 'stat-positive' : 'stat-negative'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="inline w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="inline w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <stat.icon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Módulos principales */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Módulos principales
          </h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-background-muted rounded-lg">
              <div className="p-2 bg-primary-50 rounded-lg mr-4">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">Usuarios</h3>
                <p className="text-sm text-text-secondary">
                  Gestión completa de usuarios del sistema
                </p>
                <p className="text-sm text-text-muted">48 usuarios activos</p>
              </div>
              <button className="text-primary-600 text-sm hover:text-primary-700">
                Ver más →
              </button>
            </div>

            <div className="flex items-center p-4 bg-background-muted rounded-lg">
              <div className="p-2 bg-primary-50 rounded-lg mr-4">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">Productos</h3>
                <p className="text-sm text-text-secondary">
                  Control de inventario y productos
                </p>
                <p className="text-sm text-text-muted">12 productos bajos</p>
              </div>
              <button className="text-primary-600 text-sm hover:text-primary-700">
                Ver más →
              </button>
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Actividad Reciente
            </h2>
            <Activity className="w-5 h-5 text-primary-600" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="p-1 bg-primary-50 rounded-full">
                  <activity.icon className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {activity.type}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {activity.description}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
