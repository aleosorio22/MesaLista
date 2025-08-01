import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Mail, Phone, Users } from 'lucide-react';
import clientService from '../../services/clientService';
import Table from '../../components/common/Table';
import CardList from '../../components/common/CardList';
import SearchBar from '../../components/common/SearchBar';
import FilterDropdown from '../../components/common/FilterDropdown';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';

export default function ClientsManagement() {
  const { auth } = useAuth();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('nombre');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  // Verificar permisos
  const canEdit = auth?.user?.rol === 'admin' || auth?.user?.rol === 'editor';
  const canDelete = auth?.user?.rol === 'admin' || auth?.user?.rol === 'editor';

  useEffect(() => {
    loadClients();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    filterAndSortClients();
  }, [clients, searchQuery, filters, sortField, sortDirection]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getAllClients();
      if (response.success) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortClients = () => {
    let filtered = [...clients];

    // Aplicar búsqueda
    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.telefono.includes(searchQuery) ||
        (client.correo && client.correo.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Aplicar filtros adicionales si los hubiera
    // Por ahora no hay filtros específicos para clientes

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue ? bValue.toLowerCase() : '';
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredClients(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio';
    }
    
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d{8,}$/.test(formData.telefono.replace(/[\s-()]/g, ''))) {
      errors.telefono = 'El teléfono debe tener al menos 8 dígitos';
    }
    
    if (formData.correo && !/\S+@\S+\.\S+/.test(formData.correo)) {
      errors.correo = 'El correo no es válido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateClient = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const response = await clientService.createClient(formData);
      if (response.success) {
        await loadClients();
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error al crear cliente:', error);
      setFormErrors({ general: error.message || 'Error al crear cliente' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClient = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const response = await clientService.updateClient(selectedClient.id, formData);
      if (response.success) {
        await loadClients();
        setShowEditModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      setFormErrors({ general: error.message || 'Error al actualizar cliente' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    try {
      setFormLoading(true);
      const response = await clientService.deleteClient(selectedClient.id);
      if (response.success) {
        await loadClients();
        setShowDeleteModal(false);
        setSelectedClient(null);
      }
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      telefono: '',
      correo: ''
    });
    setFormErrors({});
    setSelectedClient(null);
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setFormData({
      nombre: client.nombre,
      apellido: client.apellido,
      telefono: client.telefono,
      correo: client.correo || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (client) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  // Columnas para la tabla
  const columns = [
    {
      header: 'Cliente',
      field: 'nombre',
      sortable: true,
      render: (client) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-medium text-sm">
              {client.nombre.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-text-primary">
              {client.nombre} {client.apellido}
            </div>
            <div className="text-sm text-text-secondary">{client.telefono}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Correo',
      field: 'correo',
      sortable: true,
      render: (client) => (
        <div className="text-text-primary">
          {client.correo || (
            <span className="text-text-secondary italic">Sin correo</span>
          )}
        </div>
      )
    },
    {
      header: 'Teléfono',
      field: 'telefono',
      sortable: true,
      render: (client) => (
        <div className="text-text-primary font-mono">
          {client.telefono}
        </div>
      )
    },
    {
      header: 'Acciones',
      field: 'actions',
      render: (client) => (
        <div className="flex items-center space-x-2">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(client);
              }}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDeleteModal(client);
              }}
              className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  // Render para las tarjetas móviles
  const renderClientCard = (client) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
          <span className="text-white font-medium">
            {client.nombre.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-medium text-text-primary">
            {client.nombre} {client.apellido}
          </h3>
          <p className="text-sm text-text-secondary font-mono">{client.telefono}</p>
          {client.correo && (
            <p className="text-sm text-text-secondary">{client.correo}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(client);
            }}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(client);
            }}
            className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  const filterOptions = [
    // Por ahora no hay filtros específicos para clientes
    // Se pueden agregar después si es necesario
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Gestión de Clientes</h1>
          <p className="text-text-secondary">Administra los clientes del sistema</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre, apellido, teléfono o correo..."
          className="flex-1"
        />
        {filterOptions.length > 0 && (
          <FilterDropdown
            filters={filterOptions}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
          />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total Clientes</p>
              <p className="text-2xl font-bold text-text-primary">{clients.length}</p>
            </div>
            <Users className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Con Correo</p>
              <p className="text-2xl font-bold text-text-primary">
                {clients.filter(c => c.correo).length}
              </p>
            </div>
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Registrados Hoy</p>
              <p className="text-2xl font-bold text-text-primary">
                {/* Aquí se podría calcular los clientes registrados hoy si tuviéramos fecha de creación */}
                0
              </p>
            </div>
            <User className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Tabla/Cards */}
      {isMobile ? (
        <CardList
          data={filteredClients}
          renderCard={renderClientCard}
          loading={loading}
          emptyMessage="No se encontraron clientes"
        />
      ) : (
        <Table
          columns={columns}
          data={filteredClients}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          loading={loading}
          emptyMessage="No se encontraron clientes"
        />
      )}

      {/* Modal Crear Cliente */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Crear Nuevo Cliente"
        footer={
          <>
            <button
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="btn-secondary"
              disabled={formLoading}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateClient}
              className="btn-primary"
              disabled={formLoading}
            >
              {formLoading ? 'Creando...' : 'Crear Cliente'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {formErrors.general && (
            <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded-lg text-sm">
              {formErrors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className={`input ${formErrors.nombre ? 'border-error-300' : ''}`}
                placeholder="Nombre del cliente"
              />
              {formErrors.nombre && (
                <p className="text-error-600 text-sm mt-1">{formErrors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Apellido
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                className={`input ${formErrors.apellido ? 'border-error-300' : ''}`}
                placeholder="Apellido del cliente"
              />
              {formErrors.apellido && (
                <p className="text-error-600 text-sm mt-1">{formErrors.apellido}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className={`input ${formErrors.telefono ? 'border-error-300' : ''}`}
              placeholder="Número de teléfono"
            />
            {formErrors.telefono && (
              <p className="text-error-600 text-sm mt-1">{formErrors.telefono}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Correo electrónico 
            </label>
            <input
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({...formData, correo: e.target.value})}
              className={`input ${formErrors.correo ? 'border-error-300' : ''}`}
              placeholder="cliente@ejemplo.com"
            />
            {formErrors.correo && (
              <p className="text-error-600 text-sm mt-1">{formErrors.correo}</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Editar Cliente */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Editar Cliente"
        footer={
          <>
            <button
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
              className="btn-secondary"
              disabled={formLoading}
            >
              Cancelar
            </button>
            <button
              onClick={handleEditClient}
              className="btn-primary"
              disabled={formLoading}
            >
              {formLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {formErrors.general && (
            <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded-lg text-sm">
              {formErrors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className={`input ${formErrors.nombre ? 'border-error-300' : ''}`}
                placeholder="Nombre del cliente"
              />
              {formErrors.nombre && (
                <p className="text-error-600 text-sm mt-1">{formErrors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Apellido
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                className={`input ${formErrors.apellido ? 'border-error-300' : ''}`}
                placeholder="Apellido del cliente"
              />
              {formErrors.apellido && (
                <p className="text-error-600 text-sm mt-1">{formErrors.apellido}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className={`input ${formErrors.telefono ? 'border-error-300' : ''}`}
              placeholder="Número de teléfono"
            />
            {formErrors.telefono && (
              <p className="text-error-600 text-sm mt-1">{formErrors.telefono}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Correo electrónico (opcional)
            </label>
            <input
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({...formData, correo: e.target.value})}
              className={`input ${formErrors.correo ? 'border-error-300' : ''}`}
              placeholder="cliente@ejemplo.com"
            />
            {formErrors.correo && (
              <p className="text-error-600 text-sm mt-1">{formErrors.correo}</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Eliminar Cliente */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedClient(null);
        }}
        title="Confirmar Eliminación"
        footer={
          <>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedClient(null);
              }}
              className="btn-secondary"
              disabled={formLoading}
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteClient}
              className="bg-error-600 hover:bg-error-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              disabled={formLoading}
            >
              {formLoading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-error-600" />
            </div>
            <p className="text-text-primary">
              ¿Estás seguro de que deseas eliminar al cliente{' '}
              <strong>{selectedClient?.nombre} {selectedClient?.apellido}</strong>?
            </p>
            <p className="text-sm text-text-secondary mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
