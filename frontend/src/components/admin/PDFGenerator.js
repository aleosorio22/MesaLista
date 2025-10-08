import jsPDF from 'jspdf';

// Función para convertir imagen a base64
const getLogoBase64 = () => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = this.width;
      canvas.height = this.height;
      ctx.drawImage(this, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = '/logo.png'; // Ruta desde la carpeta public
  });
};

export const generateReservationPDF = async (reservationData) => {
  if (!reservationData || !reservationData.reservacion) {
    console.error('No hay datos de reservación para generar PDF');
    return;
  }

  const { reservacion, cliente, productos = [], anticipos = [] } = reservationData;
  
  // Crear nuevo documento PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Colores minimalistas y suaves (como en las imágenes)
  const headerColor = [139, 105, 76]; // Marrón suave para headers
  const lightBeige = [248, 245, 240]; // Beige muy claro para fondos
  const textColor = [68, 68, 68]; // Gris oscuro para texto
  const borderColor = [200, 200, 200]; // Gris claro para bordes
  
  let yPosition = 20;

  // ==================== HEADER CON LOGO CENTRADO ====================
  // Intentar cargar el logo real desde public
  try {
    const logoBase64 = await getLogoBase64();
    // Agregar el logo real al PDF - perfectamente centrado
    // A4 width = 210mm, logo width = 20mm, centro = (210-20)/2 = 95mm
    doc.addImage(logoBase64, 'PNG', 95, yPosition, 20, 20);
  } catch (error) {
    console.warn('No se pudo cargar el logo, usando texto:', error);
    // Fallback: crear un recuadro con texto estilizado - también centrado
    doc.setFillColor(...headerColor);
    doc.roundedRect(95, yPosition, 20, 20, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    // Centro del recuadro: 95 + 20/2 = 105mm
    doc.text('CAFÉ', 105, yPosition + 8, { align: 'center' });
    doc.text('EL ÁNGEL', 105, yPosition + 14, { align: 'center' });
  }

  yPosition += 25;

  // Información de la empresa centrada y compacta
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Café El Ángel', 105, yPosition, { align: 'center' });
  
  yPosition += 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Aldea El Porvenir, El Progreso, Jutiapa • Tel: 3146-7151', 105, yPosition, { align: 'center' });

  yPosition += 10;

  // ==================== TÍTULO DEL DOCUMENTO ====================
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...headerColor);
  doc.text('DATOS DE RESERVACIÓN', 105, yPosition, { align: 'center' });

  yPosition += 8;

  // Línea separadora sutil
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(25, yPosition, 185, yPosition);

  yPosition += 10;

  // ==================== INFORMACIÓN DEL CLIENTE ====================
  // Header de sección con fondo suave
  doc.setFillColor(...lightBeige);
  doc.rect(25, yPosition - 2, 160, 6, 'F');
  
  doc.setTextColor(...headerColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL CLIENTE', 30, yPosition + 2);

  yPosition += 8;

  // Información del cliente con espaciado compacto
  doc.setTextColor(...textColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  doc.text('Nombre:', 30, yPosition);
  doc.text(`${cliente.nombre} ${cliente.apellido}`, 70, yPosition);

  yPosition += 4;
  doc.text('Email:', 30, yPosition);
  doc.text(cliente.email || '', 70, yPosition);

  yPosition += 4;
  doc.text('Teléfono:', 30, yPosition);
  doc.text(cliente.telefono || '', 70, yPosition);

  yPosition += 8;

  // ==================== DETALLES DE LA RESERVACIÓN ====================
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatTime = (time) => time ? time.slice(0, 5) : '';

  doc.text('Fecha:', 30, yPosition);
  doc.text(formatDate(reservacion.fecha), 70, yPosition);

  yPosition += 4;
  doc.text('Hora:', 30, yPosition);
  doc.text(formatTime(reservacion.hora), 70, yPosition);

  yPosition += 4;
  doc.text('Personas:', 30, yPosition);
  doc.text(reservacion.cantidad_personas?.toString() || '0', 70, yPosition);

  yPosition += 4;
  doc.text('Tipo:', 30, yPosition);
  doc.text(reservacion.tipo_reservacion || '', 70, yPosition);

  yPosition += 4;
  doc.text('Tomada por:', 30, yPosition);
  doc.text(reservacion.usuario_nombre || '', 70, yPosition);

  yPosition += 4;
  doc.text('Estado:', 30, yPosition);
  
  // Determinar estado simple
  const getStatusText = () => {
    const totalPagado = reservacion.total_pagado || 0;
    const totalEstimada = reservacion.total_estimada || 0;
    
    if (totalPagado === 0) return 'Confirmada';
    if (totalPagado >= totalEstimada) return 'Pagada';
    return 'Pago parcial';
  };
  
  doc.text(getStatusText(), 70, yPosition);

  // Observaciones si existen
  if (reservacion.observaciones) {
    yPosition += 4;
    doc.text('Notas:', 30, yPosition);
    const observaciones = doc.splitTextToSize(reservacion.observaciones, 110);
    doc.text(observaciones, 70, yPosition);
    yPosition += Math.max(4, observaciones.length * 3);
  }

  yPosition += 8;

  // ==================== PRODUCTOS SOLICITADOS ====================
  if (productos.length > 0) {
    // Verificar si necesitamos nueva página
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(...lightBeige);
    doc.rect(25, yPosition - 2, 160, 6, 'F');
    
    doc.setTextColor(...headerColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUCTOS SOLICITADOS', 30, yPosition + 2);

    yPosition += 8;

    // Headers de tabla compacta
    doc.setFillColor(...lightBeige);
    doc.rect(25, yPosition - 2, 160, 6, 'F');
    
    doc.setTextColor(...textColor);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUCTO', 30, yPosition + 2);
    doc.text('CANT', 120, yPosition + 2, { align: 'center' });
    doc.text('PRECIO UNIT', 145, yPosition + 2, { align: 'center' });
    doc.text('SUBTOTAL', 175, yPosition + 2, { align: 'center' });

    yPosition += 8;

    // Productos con líneas alternadas sutiles
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    productos.forEach((producto, index) => {
      // Verificar si necesitamos nueva página
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        
        // Repetir headers en nueva página
        doc.setFillColor(...lightBeige);
        doc.rect(25, yPosition - 2, 160, 6, 'F');
        
        doc.setTextColor(...textColor);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('PRODUCTO', 30, yPosition + 2);
        doc.text('CANT', 120, yPosition + 2, { align: 'center' });
        doc.text('PRECIO UNIT', 145, yPosition + 2, { align: 'center' });
        doc.text('SUBTOTAL', 175, yPosition + 2, { align: 'center' });
        
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
      }

      if (index % 2 === 0) {
        doc.setFillColor(252, 252, 252);
        doc.rect(25, yPosition - 1, 160, 5, 'F');
      }
      
      doc.setTextColor(...textColor);
      doc.text(producto.producto_nombre, 30, yPosition + 2);
      doc.text(producto.cantidad?.toString() || '0', 120, yPosition + 2, { align: 'center' });
      doc.text(`Q${parseFloat(producto.precio_unitario || 0).toFixed(2)}`, 145, yPosition + 2, { align: 'center' });
      doc.text(`Q${parseFloat(producto.subtotal || 0).toFixed(2)}`, 175, yPosition + 2, { align: 'center' });
      
      yPosition += 5;
    });

    yPosition += 6;
  }

  // ==================== RESUMEN FINANCIERO ====================
  // Verificar si necesitamos nueva página
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFillColor(...lightBeige);
  doc.rect(25, yPosition - 2, 160, 6, 'F');
  
  doc.setTextColor(...headerColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN FINANCIERO', 30, yPosition + 2);

  yPosition += 10;

  const formatCurrency = (amount) => `Q${parseFloat(amount || 0).toFixed(2)}`;
  const totalEstimado = parseFloat(reservacion.total_estimada || 0);
  const totalPagado = parseFloat(reservacion.total_pagado || 0);
  const saldoPendiente = totalEstimado - totalPagado;

  // Fondo sutil para resumen con mejor diseño
  doc.setFillColor(252, 252, 252);
  doc.rect(25, yPosition - 2, 160, 20, 'F');
  
  // Borde sutil
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.rect(25, yPosition - 2, 160, 20);

  doc.setTextColor(...textColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  // Total Estimado
  doc.text('Total Estimado:', 30, yPosition + 2);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(totalEstimado), 170, yPosition + 2, { align: 'right' });

  yPosition += 4;
  
  // Total Pagado (en verde)
  doc.setFont('helvetica', 'normal');
  doc.text('Total Pagado:', 30, yPosition + 2);
  doc.setTextColor(0, 120, 0); // Verde más suave
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(totalPagado), 170, yPosition + 2, { align: 'right' });

  yPosition += 4;

  // Línea separadora dentro del resumen
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.2);
  doc.line(30, yPosition + 1, 180, yPosition + 1);

  yPosition += 3;

  // Saldo Pendiente con estilo destacado
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SALDO PENDIENTE:', 30, yPosition + 2);
  
  // Color según el estado del saldo
  if (saldoPendiente <= 0) {
    doc.setTextColor(0, 120, 0); // Verde si está pagado
  } else {
    doc.setTextColor(180, 50, 50); // Rojo suave si hay saldo pendiente
  }
  doc.text(formatCurrency(Math.max(0, saldoPendiente)), 170, yPosition + 2, { align: 'right' });

  yPosition += 12;

  // ==================== ANTICIPOS ====================
  if (anticipos.length > 0) {
    // Verificar si necesitamos nueva página
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(...lightBeige);
    doc.rect(25, yPosition - 2, 160, 6, 'F');
    
    doc.setTextColor(...headerColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ANTICIPOS RECIBIDOS', 30, yPosition + 2);

    yPosition += 8;

    // Fondo para los anticipos
    const alturaAnticips = anticipos.length * 5 + 4;
    doc.setFillColor(252, 252, 252);
    doc.rect(25, yPosition - 2, 160, alturaAnticips, 'F');
    
    // Borde sutil
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.rect(25, yPosition - 2, 160, alturaAnticips);

    anticipos.forEach((anticipo, index) => {
      // Verificar si necesitamos nueva página
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        
        // Repetir header si es nueva página
        doc.setFillColor(...lightBeige);
        doc.rect(25, yPosition - 2, 160, 6, 'F');
        
        doc.setTextColor(...headerColor);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('ANTICIPOS RECIBIDOS (continuación)', 30, yPosition + 2);
        
        yPosition += 8;
      }

      doc.setTextColor(...textColor);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      
      const fecha = new Date(anticipo.fecha).toLocaleDateString('es-ES');
      
      // Fecha y método de pago
      doc.text(`${fecha}`, 30, yPosition);
      doc.text(`${anticipo.metodo_pago}`, 70, yPosition);
      
      // Monto alineado a la derecha en verde
      doc.setTextColor(0, 120, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(anticipo.monto), 170, yPosition, { align: 'right' });
      
      // Observaciones si existen
      if (anticipo.observaciones) {
        yPosition += 3;
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.text(`(${anticipo.observaciones})`, 30, yPosition);
      }
      
      yPosition += 4;
    });

    yPosition += 4;
  }

  // ==================== FOOTER SIMPLE ====================
  // Verificar si necesitamos nueva página para el footer
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  yPosition += 10;

  // Línea separadora
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(25, yPosition, 185, yPosition);

  yPosition += 8;

  // Mensaje de agradecimiento centrado
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('¡Gracias por su reservación!', 105, yPosition, { align: 'center' });

  yPosition += 6;

  // Términos compactos
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Términos: Las reservaciones tienen un límite de 3 horas desde el registro.', 105, yPosition, { align: 'center' });

  yPosition += 8;

  // Número de reservación
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Número de reservación: RES${reservacion.id}${new Date().getFullYear()}${String(Date.now()).slice(-6)}`, 105, yPosition, { align: 'center' });

  // Abrir el PDF directamente en una nueva ventana/pestaña
  const fileName = `Reservacion_${reservacion.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Generar el PDF como blob y abrirlo
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  // Abrir en nueva ventana/pestaña
  window.open(pdfUrl, '_blank');
  
  // Limpiar la URL después de un tiempo para liberar memoria
  setTimeout(() => {
    URL.revokeObjectURL(pdfUrl);
  }, 1000);
  
  console.log(`PDF generado y abierto: ${fileName}`);
  return doc;
};