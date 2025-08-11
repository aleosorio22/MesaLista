import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Search, Filter, Users, Clock, MapPin } from 'lucide-react';
import reservationService from '../../services/reservationService';
import { useAuth } from '../../contexts/AuthContext';
import CreateReservationModal from './CreateReservationModal';
import ReservationCard from './ReservationCard';
import ReservationFilters from './ReservationFilters';
import ReservationDetailsModal from './ReservationDetailsModal';
import EditReservationModal from './EditReservationModal';
import DeleteReservationModal from './DeleteReservationModal';
import { formatDisplayDate, formatLocalDate } from '../../utils/dateUtils';

export default function ReservationsManagement() {
  const { auth } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // Quitar fecha por defecto para búsqueda global
  const [filters, setFilters] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [searchMode, setSearchMode] = useState(false); // Nuevo estado para modo de búsqueda

  // Permisos basados en rol
  const isAdmin = auth?.user?.rol === 'admin';
  const isEditor = auth?.user?.rol === 'editor';
  const isVisualizer = auth?.user?.rol === 'visualizador';
  const canCreateReservations = true; // Todos los roles pueden crear
  const canModifyAny = isAdmin || isEditor; // Solo admin y editor pueden modificar cualquieraa

  // Inicializar selectedDate con formato local
  const [selectedDateState, setSelectedDateState] = useState(formatLocalDate(new Date()));

  useEffect(() => {
    // Solo cargar con fecha si no estamos en modo búsqueda
    if (!searchMode) {
      loadReservations();
    }
  }, [selectedDate, searchMode]);

  useEffect(() => {
    // Cargar con búsqueda si hay query o filtros
    if (searchQuery || Object.keys(filters).length > 0) {
      setSearchMode(true);
      loadReservationsWithSearch();
    } else {
      setSearchMode(false);
      if (!selectedDate) {
        // Si no hay fecha seleccionada, usar fecha de hoy
        setSelectedDate(formatLocalDate(new Date()));
      }
    }
  }, [searchQuery, filters]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const filterParams = {};
      
      // Solo aplicar filtro de fecha si no estamos en modo búsqueda
      if (selectedDate && !searchMode) {
        filterParams.fecha = selectedDate;
      }
      
      const response = await reservationService.getAllReservations(filterParams);
      if (response.success) {
        setReservations(response.data);
        setFilteredReservations(response.data);
      }
    } catch (error) {
      console.error('Error al cargar reservaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReservationsWithSearch = async () => {
    try {
      setLoading(true);
      const searchParams = {};
      
      // Agregar búsqueda por texto
      if (searchQuery) {
        searchParams.search = searchQuery;
      }
      
      // Agregar filtros adicionales
      Object.assign(searchParams, filters);
      
      const response = await reservationService.getAllReservations(searchParams);
      if (response.success) {
        setReservations(response.data);
        setFilteredReservations(response.data);
      }
    } catch (error) {
      console.error('Error al buscar reservaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    if (searchMode) {
      loadReservationsWithSearch();
    } else {
      loadReservations();
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Si hay búsqueda activa, limpiarla al cambiar fecha
    if (searchQuery) {
      setSearchQuery('');
    }
    if (Object.keys(filters).length > 0) {
      setFilters({});
    }
    setSearchMode(false);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    // Si está vacía la búsqueda y no hay filtros, volver a modo fecha
    if (!query && Object.keys(filters).length === 0) {
      setSearchMode(false);
      if (!selectedDate) {
        setSelectedDate(formatLocalDate(new Date()));
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Si no hay filtros ni búsqueda, volver a modo fecha
    if (Object.keys(newFilters).length === 0 && !searchQuery) {
      setSearchMode(false);
      if (!selectedDate) {
        setSelectedDate(formatLocalDate(new Date()));
      }
    }
  };

  // Funciones de manejo de modales
  const closeModals = () => {
    setShowDetailsModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedReservation(null);
  };

  const handleViewReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  const handleEditReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowEditModal(true);
  };

  const handleDeleteReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowDeleteModal(true);
  };

  const handleEditSuccess = () => {
    closeModals();
    if (searchMode) {
      loadReservationsWithSearch();
    } else {
      loadReservations();
    }
  };

  const handleDeleteSuccess = () => {
    closeModals();
    if (searchMode) {
      loadReservationsWithSearch();
    } else {
      loadReservations();
    }
  };

  const getDisplayedStats = () => {
    // Usar las reservaciones filtradas que se están mostrando actualmente
    const displayedReservations = filteredReservations;
    
    return {
      total: displayedReservations.length,
      personas: displayedReservations.reduce((sum, r) => sum + (r.cantidad_personas || 0), 0),
      estimado: displayedReservations.reduce((sum, r) => sum + (parseFloat(r.total_estimada) || 0), 0)
    };
  };

  const stats = getDisplayedStats();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header móvil */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>   
            <h1 className="text-xl font-bold text-text-primary">Reservaciones</h1>
            <p className="text-sm text-text-secondary">
              {searchMode ? (
                searchQuery ? `Resultados para "${searchQuery}"` : 'Búsqueda con filtros'
              ) : (
                selectedDate === formatLocalDate(new Date()) ? 'Hoy' : formatDisplayDate(selectedDate, { showRelative: false })
              )}
            </p>
          </div>
          {canCreateReservations && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full shadow-lg transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-primary-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-primary-600">{stats.total}</div>
            <div className="text-xs text-primary-500">
              {searchMode ? 'Hoy' : 'Reservas'}
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-blue-600">{stats.personas}</div>
            <div className="text-xs text-blue-500">Personas</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-green-600">Q{parseFloat(stats.estimado || 0).toFixed(2)}</div>
            <div className="text-xs text-green-500">Estimado</div>
          </div>
        </div>

        {/* Controles de fecha y búsqueda */}
        <div className="space-y-3">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-colors ${
                showFilters 
                  ? 'bg-primary-100 border-primary-200 text-primary-600' 
                  : 'bg-white border-neutral-200 text-neutral-500'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              disabled={searchMode}
              className={`w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                searchMode ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            {searchMode && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-xl">
                <span className="text-xs text-neutral-500">Búsqueda activa</span>
              </div>
            )}
          </div>
        </div>

        {/* Panel de filtros colapsable */}
        {showFilters && (
          <div className="mt-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <ReservationFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        )}
      </div>

      {/* Lista de reservaciones */}
      <div className="px-4 pb-4">
        {loading ? (
          <div className="space-y-3 mt-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-12 h-12 bg-neutral-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredReservations.length > 0 ? (
          <div className="mt-4">
            {searchMode ? (
              // Modo búsqueda: mostrar categorizado
              <div className="space-y-6">
                {/* Próximas reservaciones */}
                {filteredReservations.some(r => {
                  const reservationDate = r.fecha instanceof Date ? formatLocalDate(r.fecha) : r.fecha;
                  return reservationDate >= formatLocalDate(new Date());
                }) && (
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        Próximas Reservaciones
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {filteredReservations
                        .filter(r => {
                          const reservationDate = r.fecha instanceof Date ? formatLocalDate(r.fecha) : r.fecha;
                          return reservationDate >= formatLocalDate(new Date());
                        })
                        .map((reservation) => (
                          <ReservationCard
                            key={reservation.id}
                            reservation={reservation}
                            canModify={canModifyAny || (isVisualizer && reservation.usuario_id === auth.user.id)}
                            onUpdate={() => searchMode ? loadReservationsWithSearch() : loadReservations()}
                            onView={handleViewReservation}
                            onEdit={handleEditReservation}
                            onDelete={handleDeleteReservation}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Reservaciones pasadas */}
                {filteredReservations.some(r => {
                  const reservationDate = r.fecha instanceof Date ? formatLocalDate(r.fecha) : r.fecha;
                  return reservationDate < formatLocalDate(new Date());
                }) && (
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full mr-2"></div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        Reservaciones Anteriores
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {filteredReservations
                        .filter(r => {
                          const reservationDate = r.fecha instanceof Date ? formatLocalDate(r.fecha) : r.fecha;
                          return reservationDate < formatLocalDate(new Date());
                        })
                        .map((reservation) => (
                          <ReservationCard
                            key={reservation.id}
                            reservation={reservation}
                            canModify={canModifyAny || (isVisualizer && reservation.usuario_id === auth.user.id)}
                            onUpdate={() => searchMode ? loadReservationsWithSearch() : loadReservations()}
                            onView={handleViewReservation}
                            onEdit={handleEditReservation}
                            onDelete={handleDeleteReservation}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Modo fecha: mostrar todas juntas
              <div className="space-y-3">
                {filteredReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    canModify={canModifyAny || (isVisualizer && reservation.usuario_id === auth.user.id)}
                    onUpdate={() => searchMode ? loadReservationsWithSearch() : loadReservations()}
                    onView={handleViewReservation}
                    onEdit={handleEditReservation}
                    onDelete={handleDeleteReservation}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              No hay reservaciones
            </h3>
            <p className="text-text-secondary mb-6">
              {searchMode ? (
                searchQuery ? `No se encontraron resultados para "${searchQuery}"` : 'No se encontraron resultados con los filtros aplicados'
              ) : (
                'No hay reservaciones para esta fecha'
              )}
            </p>
            {canCreateReservations && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Reservación</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de crear reservación */}
      {showCreateModal && (
        <CreateReservationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Modal de detalles */}
      {showDetailsModal && selectedReservation && (
        <ReservationDetailsModal
          isOpen={showDetailsModal}
          onClose={closeModals}
          reservationId={selectedReservation.id}
          canModify={canModifyAny || (isVisualizer && selectedReservation.usuario_id === auth.user.id)}
          onUpdate={loadReservations}
        />
      )}

      {/* Modal de edición */}
      {showEditModal && selectedReservation && (
        <EditReservationModal
          isOpen={showEditModal}
          onClose={closeModals}
          reservation={selectedReservation}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal de eliminación */}
      {showDeleteModal && selectedReservation && (
        <DeleteReservationModal
          isOpen={showDeleteModal}
          onClose={closeModals}
          reservation={selectedReservation}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
