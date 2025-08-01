# Guía de Colores y Estilos - Sistema de Reservaciones

## 🎨 Paleta de Colores Configurada

### Color Principal (Verde)
```jsx
// Colores primarios del sistema
bg-primary-500     // Verde principal (#22c55e)
bg-primary-600     // Verde hover (#16a34a)
bg-primary-50      // Verde muy claro para backgrounds
text-primary-600   // Verde para textos
```

### Colores de Fondo
```jsx
bg-background      // Fondo principal blanco
bg-sidebar         // Fondo del sidebar (#f8fafc)
bg-background-muted // Fondo alternativo (#f1f5f9)
```

### Colores de Texto
```jsx
text-text-primary    // Texto principal (#0f172a)
text-text-secondary  // Texto secundario (#64748b)
text-text-muted      // Texto atenuado (#94a3b8)
```

### Colores de Estado
```jsx
// Éxito (Verde)
bg-success-500       // Para elementos de éxito
text-success-600     // Para textos de éxito

// Advertencia (Amarillo/Naranja)
bg-warning-500       // Para advertencias
text-warning-600     // Para textos de advertencia

// Error (Rojo)
bg-error-500         // Para errores
text-error-500       // Para textos de error
```

## 🎯 Clases de Componentes Predefinidas

### Botones
```jsx
className="btn-primary"      // Botón principal verde
className="btn-secondary"    // Botón secundario blanco con borde
```

### Cards y Contenedores
```jsx
className="card"             // Card básico con sombra
className="stat-card"        // Card para estadísticas del dashboard
```

### Inputs
```jsx
className="input"            // Input con estilo del sistema
```

### Sidebar
```jsx
className="sidebar-item-active"   // Item del sidebar activo (verde)
className="sidebar-item"          // Item del sidebar inactivo
```

### Badges y Notificaciones
```jsx
className="badge-notification"    // Badge de notificación verde
```

### Estadísticas
```jsx
className="stat-positive"         // Texto verde para estadísticas positivas
className="stat-negative"         // Texto rojo para estadísticas negativas
```

## 💡 Ejemplos de Uso

### Dashboard Card
```jsx
<div className="stat-card">
  <h3 className="text-text-secondary text-sm font-medium">Ventas del día</h3>
  <p className="text-2xl font-bold text-text-primary">$25,430</p>
  <p className="stat-positive text-sm">+12%</p>
</div>
```

### Botón Principal
```jsx
<button className="btn-primary">
  Crear Reservación
</button>
```

### Item del Sidebar Activo
```jsx
<div className="sidebar-item-active flex items-center px-4 py-2 rounded-lg">
  <HomeIcon className="w-5 h-5 mr-3" />
  Dashboard
</div>
```

### Badge de Notificación
```jsx
<div className="relative">
  <BellIcon className="w-6 h-6" />
  <span className="badge-notification absolute -top-2 -right-2">3</span>
</div>
```

## 🔄 Ventajas del Sistema

1. **Consistencia**: Todos los colores están centralizados en la configuración de Tailwind
2. **Fácil mantenimiento**: Cambiar un color en `tailwind.config.js` lo actualiza en toda la app
3. **Clases predefinidas**: Componentes comunes ya tienen sus estilos definidos
4. **Escalabilidad**: Fácil agregar nuevos colores o modificar existentes
5. **Accesibilidad**: Los contrastes están optimizados para legibilidad

## 🚀 Fuente Configurada
ss
- **Fuente principal**: Inter (Google Fonts)
- **Pesos disponibles**: 300, 400, 500, 600, 700, 800
- **Uso**: `font-sans` (aplicado por defecto al body)
