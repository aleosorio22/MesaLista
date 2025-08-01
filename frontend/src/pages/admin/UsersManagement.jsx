import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Mail, Shield, Eye } from 'lucide-react';
import userService from '../../services/userService';
import Table from '../../components/common/Table';
import CardList from '../../components/common/CardList';
import SearchBar from '../../components/common/SearchBar';
import FilterDropdown from '../../components/common/FilterDropdown';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';

export default function UsersManagement() {
  const { auth } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
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
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    rol: 'editor'
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  // Verificar si es admin
  const isAdmin = auth?.user?.rol === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAdmin]);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchQuery, filters, sortField, sortDirection]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    // Aplicar búsqueda
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.correo.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Aplicar filtros
    if (filters.rol) {
      filtered = filtered.filter(user => user.rol === filters.rol);
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
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
    
    if (!formData.correo.trim()) {
      errors.correo = 'El correo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      errors.correo = 'El correo no es válido';
    }
    
    if (!showEditModal && !formData.contraseña.trim()) {
      errors.contraseña = 'La contraseña es obligatoria';
    } else if (formData.contraseña && formData.contraseña.length < 6) {
      errors.contraseña = 'La contraseña debe tener al menos 6 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const response = await userService.createUser(formData);
      if (response.success) {
        await loadUsers();
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      setFormErrors({ general: error.message || 'Error al crear usuario' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const updateData = {
        nombre: formData.nombre,
        correo: formData.correo,
        rol: formData.rol
      };
      
      const response = await userService.updateUser(selectedUser.id, updateData);
      if (response.success) {
        await loadUsers();
        setShowEditModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setFormErrors({ general: error.message || 'Error al actualizar usuario' });
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      correo: '',
      contraseña: '',
      rol: 'editor'
    });
    setFormErrors({});
    setSelectedUser(null);
  };

  // Helper para obtener el estilo del rol
  const getRoleStyle = (rol) => {
    switch (rol) {
      case 'admin':
        return 'bg-primary-100 text-primary-800';
      case 'editor':
        return 'bg-neutral-100 text-neutral-800';
      case 'visualizador':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  // Helper para obtener el texto del rol
  const getRoleLabel = (rol) => {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'editor':
        return 'Editor';
      case 'visualizador':
        return 'Visualizador';
      default:
        return rol;
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre,
      correo: user.correo,
      contraseña: '',
      rol: user.rol
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Columnas para la tabla
  const columns = [
    {
      header: 'Usuario',
      field: 'nombre',
      sortable: true,
      render: (user) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-medium text-sm">
              {user.nombre.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-text-primary">{user.nombre}</div>
            <div className="text-sm text-text-secondary">{user.correo}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Rol',
      field: 'rol',
      sortable: true,
      render: (user) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleStyle(user.rol)}`}>
          {getRoleLabel(user.rol)}
        </span>
      )
    },
    {
      header: 'Acciones',
      field: 'actions',
      render: (user) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(user);
            }}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          {user.id !== auth.user.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDeleteModal(user);
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
  const renderUserCard = (user) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
          <span className="text-white font-medium">
            {user.nombre.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-medium text-text-primary">{user.nombre}</h3>
          <p className="text-sm text-text-secondary">{user.correo}</p>
          <span className={`inline-flex px-2 py-1 mt-1 text-xs font-semibold rounded-full ${getRoleStyle(user.rol)}`}>
            {getRoleLabel(user.rol)}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            openEditModal(user);
          }}
          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        {user.id !== auth.user.id && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(user);
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
    {
      key: 'rol',
      label: 'Rol',
      type: 'select',
      options: [
        { value: 'admin', label: 'Administrador' },
        { value: 'editor', label: 'Editor' },
        { value: 'visualizador', label: 'Visualizador' }
      ]
    }
  ];

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Gestión de Usuarios</h1>
          <p className="text-text-secondary">Administra los usuarios del sistema</p>
        </div>
        
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Acceso Restringido
          </h2>
          <p className="text-text-secondary">
            Solo los administradores pueden gestionar usuarios
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Gestión de Usuarios</h1>
          <p className="text-text-secondary">Administra los usuarios del sistema</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre, email..."
          className="flex-1"
        />
        <FilterDropdown
          filters={filterOptions}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total</p>
              <p className="text-2xl font-bold text-text-primary">{users.length}</p>
            </div>
            <User className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Administradores</p>
              <p className="text-2xl font-bold text-text-primary">
                {users.filter(u => u.rol === 'admin').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Editores</p>
              <p className="text-2xl font-bold text-text-primary">
                {users.filter(u => u.rol === 'editor').length}
              </p>
            </div>
            <Edit className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Visualizadores</p>
              <p className="text-2xl font-bold text-text-primary">
                {users.filter(u => u.rol === 'visualizador').length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Tabla/Cards */}
      {isMobile ? (
        <CardList
          data={filteredUsers}
          renderCard={renderUserCard}
          loading={loading}
          emptyMessage="No se encontraron usuarios"
        />
      ) : (
        <Table
          columns={columns}
          data={filteredUsers}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          loading={loading}
          emptyMessage="No se encontraron usuarios"
        />
      )}

      {/* Modal Crear Usuario */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Crear Nuevo Usuario"
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
              onClick={handleCreateUser}
              className="btn-primary"
              disabled={formLoading}
            >
              {formLoading ? 'Creando...' : 'Crear Usuario'}
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

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className={`input ${formErrors.nombre ? 'border-error-300' : ''}`}
              placeholder="Nombre completo"
            />
            {formErrors.nombre && (
              <p className="text-error-600 text-sm mt-1">{formErrors.nombre}</p>
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
              placeholder="usuario@ejemplo.com"
            />
            {formErrors.correo && (
              <p className="text-error-600 text-sm mt-1">{formErrors.correo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={formData.contraseña}
              onChange={(e) => setFormData({...formData, contraseña: e.target.value})}
              className={`input ${formErrors.contraseña ? 'border-error-300' : ''}`}
              placeholder="Mínimo 6 caracteres"
            />
            {formErrors.contraseña && (
              <p className="text-error-600 text-sm mt-1">{formErrors.contraseña}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Rol
            </label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData({...formData, rol: e.target.value})}
              className="input"
            >
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
              <option value="visualizador">Visualizador</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Usuario */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Editar Usuario"
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
              onClick={handleEditUser}
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

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className={`input ${formErrors.nombre ? 'border-error-300' : ''}`}
              placeholder="Nombre completo"
            />
            {formErrors.nombre && (
              <p className="text-error-600 text-sm mt-1">{formErrors.nombre}</p>
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
              placeholder="usuario@ejemplo.com"
            />
            {formErrors.correo && (
              <p className="text-error-600 text-sm mt-1">{formErrors.correo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Rol
            </label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData({...formData, rol: e.target.value})}
              className="input"
            >
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
              <option value="visualizador">Visualizador</option>
            </select>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="text-sm text-text-secondary">
              <strong>Nota:</strong> La contraseña no se puede cambiar desde aquí. 
              El usuario debe cambiarla desde su perfil.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal Eliminar Usuario */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        title="Confirmar Eliminación"
        footer={
          <>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                // TODO: Implementar eliminación
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
              className="bg-error-600 hover:bg-error-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Eliminar
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
              ¿Estás seguro de que deseas eliminar al usuario{' '}
              <strong>{selectedUser?.nombre}</strong>?
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
