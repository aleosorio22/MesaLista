import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, MapPin, CreditCard, Package, Plus, Edit, Trash2, User, Search, Minus } from 'lucide-react';
import reservationService from '../../services/reservationService';
import productService from '../../services/productService';
import Modal from '../../components/common/Modal';
import AdvancePaymentManager from '../../components/admin/AdvancePaymentManager';
import { formatDisplayDate } from '../../utils/dateUtils';

export default function ReservationDetailsModal({ isOpen, onClose, reservationId, canModify, onUpdate }) {
  const [loading, setLoading] = useState(true);
  const [reservationData, setReservationData] = useState(null);
  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [productLoading, setProductLoading] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && reservationId) {
      loadReservationDetails();
      if (canModify) {
        loadAvailableProducts();
      }
    }
  }, [isOpen, reservationId]);

  const loadReservationDetails = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getCompleteReservation(reservationId);
      if (response.success) {
        setReservationData(response.data);
        setProducts(response.data.productos || []);
      }
    } catch (error) {
      console.error('Error al cargar detalles de reservación:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableProducts = async () => {
    try {
      const response = await productService.getAllProducts(false);
      if (response.success) {
        setAvailableProducts(response.data.filter(p => p.activo));
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return formatDisplayDate(date, { 
      showRelative: false,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time ? time.slice(0, 5) : '';
  };

  const handleAddProduct = async () => {
    if (!selectedProduct || productQuantity < 1) return;

    try {
      setProductLoading(true);
      const response = await reservationService.addProductToReservation(reservationId, {
        producto_id: selectedProduct,
        cantidad: productQuantity
      });

      if (response.success) {
        await loadReservationDetails();
        setSelectedProduct('');
        setProductQuantity(1);
        setProductSearchQuery('');
        setShowAddProduct(false);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error al agregar producto:', error);
    } finally {
      setProductLoading(false);
    }
  };

  // Filtrar productos basado en la búsqueda
  const filteredProducts = availableProducts.filter(product => {
    if (!productSearchQuery) return true;
    
    const searchLower = productSearchQuery.toLowerCase();
    const nombre = product.nombre?.toLowerCase() || '';
    const categoria = product.categoria_nombre?.toLowerCase() || '';
    
    return nombre.includes(searchLower) || categoria.includes(searchLower);
  });

  const handleRemoveProduct = async (productId) => {
    try {
      const response = await reservationService.removeProductFromReservation(productId);
      if (response.success) {
        await loadReservationDetails();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const getStatusColor = (reservation) => {
    const totalPagado = reservation?.total_pagado || 0;
    const totalEstimada = reservation?.total_estimada || 0;
    
    if (totalPagado === 0) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (totalPagado >= totalEstimada) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (reservation) => {
    const totalPagado = reservation?.total_pagado || 0;
    const totalEstimada = reservation?.total_estimada || 0;
    
    if (totalPagado === 0) {
      return 'Pendiente de pago';
    } else if (totalPagado >= totalEstimada) {
      return 'Completamente pagado';
    } else {
      return 'Pago parcial';
    }
  };

  if (!isOpen || !reservationData) return null;

  const { reservacion, cliente, anticipos } = reservationData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de Reservación"
      maxWidth="md:max-w-4xl"
      footer={null}
    >
      <div className="max-h-[85vh] overflow-y-auto px-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-text-secondary">Cargando detalles...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header con información del cliente */}
            <div className="bg-neutral-50 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                    {cliente?.nombre?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-text-primary truncate">
                      {cliente?.nombre} {cliente?.apellido}
                    </h3>
                    <p className="text-text-secondary">{cliente?.telefono}</p>
                    {cliente?.correo && (
                      <p className="text-text-secondary text-sm truncate">{cliente.correo}</p>
                    )}
                  </div>
                </div>
                <div className={`px-3 py-2 rounded-full text-sm font-medium border text-center sm:text-left ${getStatusColor(reservacion)}`}>
                  {getStatusText(reservacion)}
                </div>
              </div>
            </div>

            {/* Información de la reservación */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-neutral-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary">Fecha</p>
                    <p className="font-medium text-text-primary">
                      {formatDate(reservacion.fecha)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-neutral-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary">Hora</p>
                    <p className="font-medium text-text-primary">
                      {formatTime(reservacion.hora)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-neutral-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary">Personas</p>
                    <p className="font-medium text-text-primary">
                      {reservacion.cantidad_personas} persona{reservacion.cantidad_personas !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-neutral-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary">Área</p>
                    <p className="font-medium text-text-primary">{reservacion.area}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-neutral-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary">Tipo</p>
                    <p className="font-medium text-text-primary">{reservacion.tipo_reservacion}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-neutral-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary">Creado por</p>
                    <p className="font-medium text-text-primary truncate">
                      {reservationData.usuario?.nombre || 'Usuario'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {reservacion.observaciones && (
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-medium text-text-primary mb-2">Observaciones</h4>
                <p className="text-text-secondary">{reservacion.observaciones}</p>
              </div>
            )}

            {/* Productos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-text-primary">Productos</h4>
                {canModify && (
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                )}
              </div>

              {showAddProduct && canModify && (
                <div className="bg-neutral-50 rounded-xl p-4 mb-4 space-y-4">
                  {/* Buscador de productos */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-neutral-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar producto por nombre o categoría..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Selector de producto y cantidad */}
                  <div className="space-y-3">
                    <div>
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full px-3 py-3 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">
                          {productSearchQuery ? 
                            `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''} encontrado${filteredProducts.length !== 1 ? 's' : ''}` : 
                            'Seleccionar producto...'
                          }
                        </option>
                        {filteredProducts.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.nombre} - Q{parseFloat(product.precio).toFixed(2)}
                            {product.categoria_nombre && ` (${product.categoria_nombre})`}
                          </option>
                        ))}
                      </select>
                      
                      {/* Mensaje cuando no hay resultados */}
                      {productSearchQuery && filteredProducts.length === 0 && (
                        <div className="mt-2 p-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-500">
                          No se encontraron productos que coincidan con "{productSearchQuery}"
                        </div>
                      )}
                    </div>

                    {/* Cantidad y botones */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 sm:max-w-40">
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Cantidad</label>
                        <div className="flex items-stretch border border-neutral-200 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                            className="flex items-center justify-center w-10 px-2 py-2 text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:bg-neutral-100 transition-colors rounded-l-lg border-r border-neutral-200"
                            disabled={productQuantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={productQuantity}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                setProductQuantity(1);
                              } else {
                                const num = parseInt(value);
                                setProductQuantity(num > 0 ? num : 1);
                              }
                            }}
                            className="flex-1 text-center py-2 px-2 border-0 focus:ring-0 focus:outline-none text-sm min-w-0"
                            placeholder="1"
                          />
                          <button
                            type="button"
                            onClick={() => setProductQuantity(productQuantity + 1)}
                            className="flex items-center justify-center w-10 px-2 py-2 text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:bg-neutral-100 transition-colors rounded-r-lg border-l border-neutral-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Botones */}
                      <div className="flex gap-2 sm:items-end">
                        <button
                          onClick={handleAddProduct}
                          disabled={!selectedProduct || productQuantity < 1 || productLoading}
                          className="flex-1 sm:flex-initial btn-primary text-sm px-4 py-2 disabled:opacity-50"
                        >
                          {productLoading ? 'Agregando...' : 'Agregar'}
                        </button>
                        <button
                          onClick={() => {
                            setShowAddProduct(false);
                            setProductSearchQuery('');
                            setSelectedProduct('');
                          }}
                          className="flex-1 sm:flex-initial btn-secondary text-sm px-4 py-2"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {products.length > 0 ? (
                  products.map((product) => (
                    <div key={product.id} className="bg-white border border-neutral-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-text-primary truncate">{product.producto_nombre}</h5>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-text-secondary mt-1">
                            <span>Cantidad: {product.cantidad}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Precio: Q{parseFloat(product.precio_unitario).toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <span className="font-semibold text-lg text-text-primary">
                            Q{parseFloat(product.subtotal).toFixed(2)}
                          </span>
                          {canModify && (
                            <button
                              onClick={() => handleRemoveProduct(product.id)}
                              className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    <Package className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                    <p>No hay productos agregados</p>
                  </div>
                )}
              </div>
            </div>

            {/* Totales y gestión de anticipos */}
            <div className="bg-neutral-50 rounded-xl p-4">
              <h4 className="font-semibold text-text-primary mb-4">Resumen Financiero</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Estimado:</span>
                  <span className="font-semibold text-text-primary">
                    Q{parseFloat(reservacion.total_estimada || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Pagado:</span>
                  <span className="font-semibold text-green-600">
                    Q{parseFloat(reservacion.total_pagado || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-3">
                  <span className="text-text-secondary">Pendiente:</span>
                  <span className="font-semibold text-orange-600">
                    Q{parseFloat(reservacion.total_pendiente || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Gestión de anticipos/pagos */}
            <AdvancePaymentManager
              reservationId={reservationId}
              anticipos={anticipos}
              totalEstimada={parseFloat(reservacion.total_estimada || 0)}
              totalPagado={parseFloat(reservacion.total_pagado || 0)}
              canModify={canModify}
              onUpdate={() => {
                loadReservationDetails();
                if (onUpdate) onUpdate();
              }}
            />

            {/* Información adicional */}
            <div className="text-xs text-text-muted text-center">
              Creado el {new Date(reservacion.creada_en).toLocaleString('es-GT')}
              {reservacion.actualizada_en !== reservacion.creada_en && (
                <span> • Actualizado el {new Date(reservacion.actualizada_en).toLocaleString('es-GT')}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
