import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Edit, 
  Plus,
  Trash2,
  Search,
  DollarSign,
  User,
  FileText,
  AlertCircle,
  Download
} from 'lucide-react';
import reservationService from '../../services/reservationService';
import productService from '../../services/productService';
import AdvancePaymentManager from '../../components/admin/AdvancePaymentManager';
import { generateReservationPDF } from '../../components/admin/PDFGenerator';
import { useAuth } from '../../contexts/AuthContext';

export default function ReservationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reservationData, setReservationData] = useState(null);
  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [productLoading, setProductLoading] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Verificar permisos
  const isAdmin = auth?.user?.rol === 'admin';
  const isEditor = auth?.user?.rol === 'editor';
  const isOwner = reservationData?.reservacion?.usuario_id === auth?.user?.id;
  const canModify = isAdmin || isEditor || isOwner;

  useEffect(() => {
    if (id) {
      loadReservationDetails();
    }
  }, [id]);

  const loadReservationDetails = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getCompleteReservation(id);
      if (response.success) {
        setReservationData(response.data);
        setProducts(response.data.productos || []);
      }
    } catch (error) {
      console.error('Error cargando detalles:', error);
      navigate('/admin/reservaciones');
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
      console.error('Error cargando productos:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(date).toLocaleDateString('es-ES', options);
  };

  const formatTime = (time) => {
    return time ? time.slice(0, 5) : '';
  };

  const handleAddProduct = async () => {
    if (!selectedProduct || productQuantity <= 0) return;

    try {
      setProductLoading(true);
      await reservationService.addProductToReservation(id, {
        producto_id: selectedProduct,
        cantidad: parseInt(productQuantity)
      });
      
      await loadReservationDetails();
      setSelectedProduct('');
      setProductQuantity(1);
      setShowAddProduct(false);
      setProductSearchQuery('');
    } catch (error) {
      console.error('Error agregando producto:', error);
    } finally {
      setProductLoading(false);
    }
  };

  // Filtrar productos basado en la búsqueda
  const filteredProducts = availableProducts.filter(product => {
    const searchTerm = productSearchQuery.toLowerCase();
    return product.nombre.toLowerCase().includes(searchTerm) ||
           product.descripcion?.toLowerCase().includes(searchTerm);
  });

  const handleRemoveProduct = async (productId) => {
    if (!confirm('¿Está seguro de eliminar este producto?')) return;

    try {
      await reservationService.removeProductFromReservation(productId);
      await loadReservationDetails();
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  const getStatusColor = (reservation) => {
    const totalPagado = reservation.total_pagado || 0;
    const totalEstimada = reservation.total_estimada || 0;
    
    if (totalPagado === 0) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (totalPagado >= totalEstimada) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (reservation) => {
    const totalPagado = reservation.total_pagado || 0;
    const totalEstimada = reservation.total_estimada || 0;
    
    if (totalPagado === 0) {
      return 'Pendiente';
    } else if (totalPagado >= totalEstimada) {
      return 'Pagado';
    } else {
      return 'Parcial';
    }
  };

  const handleEditReservation = () => {
    navigate(`/admin/reservaciones/${id}/editar`);
  };

  const handleGeneratePDF = async () => {
    if (reservationData) {
      try {
        await generateReservationPDF(reservationData);
      } catch (error) {
        console.error('Error generando PDF:', error);
      }
    } else {
      console.warn('No hay datos de reservación para generar PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-text-secondary">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (!reservationData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
          <p className="text-text-primary font-semibold mb-2">Reservación no encontrada</p>
          <button
            onClick={() => navigate('/admin/reservaciones')}
            className="text-primary-600 hover:text-primary-700"
          >
            Volver a reservaciones
          </button>
        </div>
      </div>
    );
  }

  const { reservacion, cliente, anticipos } = reservationData;

  return (
    <div className="min-h-screen bg-background">
      {/* Header móvil */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin/reservaciones')}
                className="p-2 text-neutral-500 hover:text-text-primary rounded-lg hover:bg-neutral-50"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-text-primary">Detalles de Reservación</h1>
                <p className="text-sm text-text-secondary">#{reservacion.id}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleGeneratePDF}
                className="p-2 text-gray-600 hover:text-gray-700 rounded-lg hover:bg-gray-50"
                title="Descargar PDF de la reservación"
                disabled={!reservationData}
              >
                <Download className="w-5 h-5" />
              </button>
              {canModify && (
                <button
                  onClick={handleEditReservation}
                  className="p-2 text-primary-600 hover:text-primary-700 rounded-lg hover:bg-primary-50"
                  title="Editar reservación"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-4">
        {/* Status y información principal */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(reservacion)}`}>
              {getStatusText(reservacion)}
            </div>
            <div className="text-sm text-text-secondary">
              Creado por: {reservacion.usuario_nombre || 'N/A'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-neutral-500" />
              <div>
                <p className="text-sm text-text-secondary">Fecha</p>
                <p className="font-medium text-text-primary">{formatDate(reservacion.fecha)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-neutral-500" />
              <div>
                <p className="text-sm text-text-secondary">Hora</p>
                <p className="font-medium text-text-primary">{formatTime(reservacion.hora)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-neutral-500" />
              <div>
                <p className="text-sm text-text-secondary">Personas</p>
                <p className="font-medium text-text-primary">
                  {reservacion.cantidad_personas} persona{reservacion.cantidad_personas !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-neutral-500" />
              <div>
                <p className="text-sm text-text-secondary">Área</p>
                <p className="font-medium text-text-primary">{reservacion.area}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                reservacion.tipo_reservacion === 'Orden previa' 
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {reservacion.tipo_reservacion === 'Orden previa' && '📝'}
                {reservacion.tipo_reservacion === 'Carta abierta' && '📋'}
                <span className="ml-1">{reservacion.tipo_reservacion}</span>
              </div>
            </div>

            {reservacion.observaciones && (
              <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                <p className="text-sm text-text-secondary">{reservacion.observaciones}</p>
              </div>
            )}
          </div>
        </div>

        {/* Información del cliente */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Información del Cliente
          </h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-text-secondary">Nombre completo</p>
              <p className="font-medium text-text-primary">
                {cliente.nombre} {cliente.apellido}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-neutral-500" />
                <div>
                  <p className="text-sm text-text-secondary">Teléfono</p>
                  <p className="font-medium text-text-primary">{cliente.telefono}</p>
                </div>
              </div>

              {cliente.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-neutral-500" />
                  <div>
                    <p className="text-sm text-text-secondary">Email</p>
                    <p className="font-medium text-text-primary">{cliente.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Productos ({products.length})
            </h3>
            
            {canModify && (
              <button
                onClick={() => {
                  setShowAddProduct(true);
                  loadAvailableProducts();
                }}
                className="p-2 text-primary-600 hover:text-primary-700 rounded-lg hover:bg-primary-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{product.producto_nombre}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-text-secondary">
                        Cantidad: {product.cantidad}
                      </span>
                      <span className="text-sm text-text-secondary">
                        Precio: Q{parseFloat(product.precio_unitario).toFixed(2)}
                      </span>
                      <span className="text-sm font-medium text-primary-600">
                        Total: Q{parseFloat(product.subtotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {canModify && (
                    <button
                      onClick={() => handleRemoveProduct(product.producto_id)}
                      className="p-2 text-error-500 hover:text-error-600 rounded-lg hover:bg-error-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-text-secondary">No hay productos agregados</p>
              {canModify && (
                <button
                  onClick={() => {
                    setShowAddProduct(true);
                    loadAvailableProducts();
                  }}
                  className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
                >
                  Agregar primer producto
                </button>
              )}
            </div>
          )}
        </div>

        {/* Totales */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Resumen Financiero
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Total estimado:</span>
              <span className="font-medium text-text-primary">
                Q{parseFloat(reservacion.total_estimada || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-secondary">Total pagado:</span>
              <span className="font-medium text-green-600">
                Q{parseFloat(reservacion.total_pagado || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between pt-2 border-t border-neutral-100">
              <span className="font-medium text-text-primary">Pendiente:</span>
              <span className="font-bold text-orange-600">
                Q{parseFloat(reservacion.total_pendiente || 0).toFixed(2)}
              </span>
            </div>
          </div>

        </div>

        {/* Gestión de anticipos/pagos */}
        <AdvancePaymentManager
          reservationId={id}
          anticipos={anticipos || []}
          totalEstimada={parseFloat(reservacion.total_estimada || 0)}
          totalPagado={parseFloat(reservacion.total_pagado || 0)}
          canModify={canModify}
          onUpdate={loadReservationDetails}
        />
      </div>

      {/* Modal agregar producto */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full sm:max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">Agregar Producto</h3>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="p-2 text-neutral-500 hover:text-text-primary rounded-lg"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Producto
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccionar producto</option>
                  {filteredProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.nombre} - Q{parseFloat(product.precio).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 flex space-x-3">
              <button
                onClick={() => setShowAddProduct(false)}
                className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProduct}
                disabled={!selectedProduct || productQuantity <= 0 || productLoading}
                className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50"
              >
                {productLoading ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}