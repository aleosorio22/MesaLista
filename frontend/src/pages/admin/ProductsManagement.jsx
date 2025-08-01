import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, DollarSign, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';
import productService from '../../services/productService';
import Table from '../../components/common/Table';
import CardList from '../../components/common/CardList';
import SearchBar from '../../components/common/SearchBar';
import FilterDropdown from '../../components/common/FilterDropdown';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';

export default function ProductsManagement() {
  const { auth } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('nombre');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [includeInactive, setIncludeInactive] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    activo: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  // Verificar permisos - Solo administradores pueden gestionar productos
  const isAdmin = auth?.user?.rol === 'admin';
  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const canCreate = isAdmin;

  useEffect(() => {
    loadProducts();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [includeInactive]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, filters, sortField, sortDirection]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts(includeInactive);
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Aplicar búsqueda
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.precio.toString().includes(searchQuery)
      );
    }

    // Aplicar filtros
    if (filters.activo !== undefined) {
      filtered = filtered.filter(product => 
        filters.activo === 'true' ? product.activo : !product.activo
      );
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

    setFilteredProducts(filtered);
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
      errors.nombre = 'El nombre del producto es obligatorio';
    }
    
    if (!formData.precio || formData.precio === '') {
      errors.precio = 'El precio es obligatorio';
    } else if (isNaN(formData.precio) || parseFloat(formData.precio) < 0) {
      errors.precio = 'El precio debe ser un número positivo';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProduct = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const productData = {
        ...formData,
        precio: parseFloat(formData.precio)
      };
      const response = await productService.createProduct(productData);
      if (response.success) {
        await loadProducts();
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
      setFormErrors({ general: error.message || 'Error al crear producto' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditProduct = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const productData = {
        ...formData,
        precio: parseFloat(formData.precio)
      };
      const response = await productService.updateProduct(selectedProduct.id, productData);
      if (response.success) {
        await loadProducts();
        setShowEditModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      setFormErrors({ general: error.message || 'Error al actualizar producto' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      setFormLoading(true);
      const response = await productService.deleteProduct(selectedProduct.id);
      if (response.success) {
        await loadProducts();
        setShowDeleteModal(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      precio: '',
      activo: true
    });
    setFormErrors({});
    setSelectedProduct(null);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      nombre: product.nombre,
      precio: product.precio.toString(),
      activo: Boolean(product.activo)
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Columnas para la tabla
  const columns = [
    {
      header: 'Producto',
      field: 'nombre',
      sortable: true,
      render: (product) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-text-primary">{product.nombre}</div>
            <div className="text-sm text-text-secondary">
              {product.activo ? (
                <span className="text-primary-600">Activo</span>
              ) : (
                <span className="text-error-600">Inactivo</span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Precio',
      field: 'precio',
      sortable: true,
      render: (product) => (
        <div className="text-text-primary font-mono font-semibold">
          Q{parseFloat(product.precio).toFixed(2)}
        </div>
      )
    },
    {
      header: 'Estado',
      field: 'activo',
      sortable: true,
      render: (product) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          product.activo 
            ? 'bg-primary-100 text-primary-800' 
            : 'bg-error-100 text-error-800'
        }`}>
          {product.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Acciones',
      field: 'actions',
      render: (product) => (
        <div className="flex items-center space-x-2">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(product);
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
                openDeleteModal(product);
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
  const renderProductCard = (product) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-text-primary">{product.nombre}</h3>
          <p className="text-lg font-semibold text-text-primary">Q{parseFloat(product.precio).toFixed(2)}</p>
          <span className={`inline-flex px-2 py-1 mt-1 text-xs font-semibold rounded-full ${
            product.activo 
              ? 'bg-primary-100 text-primary-800' 
              : 'bg-error-100 text-error-800'
          }`}>
            {product.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(product);
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
              openDeleteModal(product);
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
      key: 'activo',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' }
      ]
    }
  ];

  // Mensaje para usuarios sin permisos
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Gestión de Productos</h1>
          <p className="text-text-secondary">Administra el inventario de productos</p>
        </div>
        
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Acceso Restringido
          </h2>
          <p className="text-text-secondary">
            Solo los administradores pueden gestionar productos
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
          <h1 className="text-2xl font-bold text-text-primary">Gestión de Productos</h1>
          <p className="text-text-secondary">Administra el inventario de productos</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIncludeInactive(!includeInactive)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              includeInactive 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-neutral-100 text-neutral-700'
            }`}
            title={includeInactive ? 'Ocultar inactivos' : 'Mostrar inactivos'}
          >
            {includeInactive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="text-sm">
              {includeInactive ? 'Mostrar inactivos' : 'Solo activos'}
            </span>
          </button>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre o precio..."
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
              <p className="text-sm font-medium text-text-secondary">Total Productos</p>
              <p className="text-2xl font-bold text-text-primary">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Activos</p>
              <p className="text-2xl font-bold text-text-primary">
                {products.filter(p => p.activo).length}
              </p>
            </div>
            <ToggleRight className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Inactivos</p>
              <p className="text-2xl font-bold text-text-primary">
                {products.filter(p => !p.activo).length}
              </p>
            </div>
            <ToggleLeft className="w-8 h-8 text-error-600" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Precio Promedio</p>
              <p className="text-2xl font-bold text-text-primary">
                Q{products.length > 0 
                  ? (products.reduce((sum, p) => sum + parseFloat(p.precio), 0) / products.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Tabla/Cards */}
      {isMobile ? (
        <CardList
          data={filteredProducts}
          renderCard={renderProductCard}
          loading={loading}
          emptyMessage="No se encontraron productos"
        />
      ) : (
        <Table
          columns={columns}
          data={filteredProducts}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          loading={loading}
          emptyMessage="No se encontraron productos"
        />
      )}

      {/* Modal Crear Producto */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Crear Nuevo Producto"
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
              onClick={handleCreateProduct}
              className="btn-primary"
              disabled={formLoading}
            >
              {formLoading ? 'Creando...' : 'Crear Producto'}
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
              Nombre del Producto
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className={`input ${formErrors.nombre ? 'border-error-300' : ''}`}
              placeholder="Nombre del producto"
            />
            {formErrors.nombre && (
              <p className="text-error-600 text-sm mt-1">{formErrors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Precio
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.precio}
              onChange={(e) => setFormData({...formData, precio: e.target.value})}
              className={`input ${formErrors.precio ? 'border-error-300' : ''}`}
              placeholder="0.00"
            />
            {formErrors.precio && (
              <p className="text-error-600 text-sm mt-1">{formErrors.precio}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                className="checkbox"
              />
              <span className="text-sm font-medium text-text-primary">
                Producto activo
              </span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Producto */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Editar Producto"
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
              onClick={handleEditProduct}
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
              Nombre del Producto
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className={`input ${formErrors.nombre ? 'border-error-300' : ''}`}
              placeholder="Nombre del producto"
            />
            {formErrors.nombre && (
              <p className="text-error-600 text-sm mt-1">{formErrors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Precio
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.precio}
              onChange={(e) => setFormData({...formData, precio: e.target.value})}
              className={`input ${formErrors.precio ? 'border-error-300' : ''}`}
              placeholder="0.00"
            />
            {formErrors.precio && (
              <p className="text-error-600 text-sm mt-1">{formErrors.precio}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                className="checkbox"
              />
              <span className="text-sm font-medium text-text-primary">
                Producto activo
              </span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Modal Eliminar Producto */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        title="Confirmar Eliminación"
        footer={
          <>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedProduct(null);
              }}
              className="btn-secondary"
              disabled={formLoading}
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteProduct}
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
              ¿Estás seguro de que deseas eliminar el producto{' '}
              <strong>{selectedProduct?.nombre}</strong>?
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
