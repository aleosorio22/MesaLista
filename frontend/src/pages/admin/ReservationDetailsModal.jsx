import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, MapPin, CreditCard, Package, Plus, Edit, Trash2, User } from 'lucide-react';
import reservationService from '../../services/reservationService';
import productService from '../../services/productService';
import Modal from '../../components/common/Modal';
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
        setShowAddProduct(false);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error al agregar producto:', error);
    } finally {
      setProductLoading(false);
    }
  };

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
      maxWidth="md:max-w-2xl"
      footer={null}
    >
      <div className="max-h-[80vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header con información del cliente */}
            <div className="bg-neutral-50 rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {cliente?.nombre?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {cliente?.nombre} {cliente?.apellido}
                  </h3>
                  <p className="text-text-secondary">{cliente?.telefono}</p>
                  {cliente?.correo && (
                    <p className="text-text-secondary text-sm">{cliente.correo}</p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(reservacion)}`}>
                  {getStatusText(reservacion)}
                </div>
              </div>
            </div>

            {/* Información de la reservación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-text-secondary">Fecha</p>
                    <p className="font-medium text-text-primary">
                      {formatDate(reservacion.fecha)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-text-secondary">Hora</p>
                    <p className="font-medium text-text-primary">
                      {formatTime(reservacion.hora)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-text-secondary">Personas</p>
                    <p className="font-medium text-text-primary">
                      {reservacion.cantidad_personas} persona{reservacion.cantidad_personas !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-text-secondary">Área</p>
                    <p className="font-medium text-text-primary">{reservacion.area}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-text-secondary">Tipo</p>
                    <p className="font-medium text-text-primary">{reservacion.tipo_reservacion}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-text-secondary">Creado por</p>
                    <p className="font-medium text-text-primary">
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
                <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar producto...</option>
                        {availableProducts.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.nombre} - Q{parseFloat(product.precio).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(parseInt(e.target.value))}
                        className="w-20 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Cant."
                      />
                      <button
                        onClick={handleAddProduct}
                        disabled={!selectedProduct || productQuantity < 1 || productLoading}
                        className="btn-primary text-sm px-3 py-2 disabled:opacity-50"
                      >
                        {productLoading ? '...' : 'Agregar'}
                      </button>
                      <button
                        onClick={() => setShowAddProduct(false)}
                        className="btn-secondary text-sm px-3 py-2"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {products.length > 0 ? (
                  products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium text-text-primary">{product.producto_nombre}</h5>
                        <p className="text-sm text-text-secondary">
                          {product.cantidad} x Q{parseFloat(product.precio_unitario).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-text-primary">
                          Q{parseFloat(product.subtotal).toFixed(2)}
                        </span>
                        {canModify && (
                          <button
                            onClick={() => handleRemoveProduct(product.id)}
                            className="p-1 text-error-600 hover:bg-error-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-text-secondary py-4">No hay productos agregados</p>
                )}
              </div>
            </div>

            {/* Totales y anticipos */}
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

              {anticipos && anticipos.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-text-primary mb-2">Anticipos</h5>
                  <div className="space-y-2">
                    {anticipos.map((anticipo) => (
                      <div key={anticipo.id} className="flex justify-between text-sm">
                        <span className="text-text-secondary">
                          {new Date(anticipo.fecha).toLocaleDateString('es-GT')}
                          {anticipo.metodo_pago && ` - ${anticipo.metodo_pago}`}
                        </span>
                        <span className="font-medium text-green-600">
                          Q{parseFloat(anticipo.monto).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
