// Utilidades para manejo de fechas en Guatemala (GMT-6)
// Esto resuelve problemas de zona horaria entre servidor y cliente

/**
 * Convierte una fecha string (YYYY-MM-DD) a objeto Date local
 * Evita problemas de zona horaria de UTC
 */
export const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    if (dateString.includes('T')) {
      // Si ya tiene formato ISO, extraer solo la fecha
      dateString = dateString.split('T')[0];
    }
    
    const [year, month, day] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } catch (error) {
    console.error('Error al parsear fecha local:', error, dateString);
    return null;
  }
};

/**
 * Convierte un objeto Date a string formato YYYY-MM-DD en hora local
 */
export const formatLocalDate = (date) => {
  if (!date || !(date instanceof Date)) return null;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha para mostrar en la interfaz
 */
export const formatDisplayDate = (dateString, options = {}) => {
  const fecha = parseLocalDate(dateString);
  if (!fecha) return 'Fecha inválida';
  
  const hoy = new Date();
  const mañana = new Date();
  mañana.setDate(hoy.getDate() + 1);
  
  // Comparar solo fechas (sin hora)
  const fechaNormalizada = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const hoyNormalizada = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const mañanaNormalizada = new Date(mañana.getFullYear(), mañana.getMonth(), mañana.getDate());
  
  if (fechaNormalizada.getTime() === hoyNormalizada.getTime()) {
    return options.showRelative !== false ? 'Hoy' : fecha.toLocaleDateString('es-GT');
  } else if (fechaNormalizada.getTime() === mañanaNormalizada.getTime()) {
    return options.showRelative !== false ? 'Mañana' : fecha.toLocaleDateString('es-GT');
  } else {
    const formatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      ...options
    };
    return fecha.toLocaleDateString('es-GT', formatOptions);
  }
};

/**
 * Obtiene el rango de fechas para los próximos N días
 */
export const getDateRange = (days = 7) => {
  const hoy = new Date();
  const fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const fechaFin = new Date(fechaInicio);
  fechaFin.setDate(fechaFin.getDate() + (days - 1));
  
  return {
    inicio: formatLocalDate(fechaInicio),
    fin: formatLocalDate(fechaFin)
  };
};

/**
 * Verifica si una fecha está en el rango de hoy + próximos N días
 */
export const isInDateRange = (dateString, days = 7) => {
  const fecha = parseLocalDate(dateString);
  if (!fecha) return false;
  
  const { inicio, fin } = getDateRange(days);
  const fechaStr = formatLocalDate(fecha);
  
  return fechaStr >= inicio && fechaStr <= fin;
};

export default {
  parseLocalDate,
  formatLocalDate,
  formatDisplayDate,
  getDateRange,
  isInDateRange
};
