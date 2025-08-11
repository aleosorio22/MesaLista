const db = require('../config/database');

exports.create = async (reservacionData) => {
    const { 
        cliente_id, 
        usuario_id, 
        fecha, 
        hora, 
        cantidad_personas, 
        area, 
        tipo_reservacion, 
        observaciones,
        total_estimada
    } = reservacionData;
    
    const query = `
        INSERT INTO reservaciones (
            cliente_id, 
            usuario_id, 
            fecha, 
            hora, 
            cantidad_personas, 
            area, 
            tipo_reservacion, 
            observaciones,
            total_estimada,
            total_pendiente
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
        cliente_id,
        usuario_id,
        fecha,
        hora,
        cantidad_personas,
        area,
        tipo_reservacion,
        observaciones || null,
        total_estimada || 0,
        total_estimada || 0 // Inicialmente el pendiente es igual al total estimado
    ]);
    
    return result.insertId;
};

exports.findById = async (id) => {
    const [rows] = await db.execute(
        'SELECT * FROM reservaciones WHERE id = ?',
        [id]
    );
    return rows[0];
};

exports.findByClienteId = async (clienteId) => {
    const [rows] = await db.execute(
        'SELECT * FROM reservaciones WHERE cliente_id = ? ORDER BY fecha DESC, hora DESC',
        [clienteId]
    );
    return rows;
};

exports.findByFecha = async (fecha) => {
    const [rows] = await db.execute(
        'SELECT * FROM reservaciones WHERE fecha = ? ORDER BY hora',
        [fecha]
    );
    return rows;
};

exports.findByFechaRango = async (fechaInicio, fechaFin) => {
    const query = `
        SELECT r.*, 
               c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
               u.nombre AS usuario_nombre
        FROM reservaciones r
        LEFT JOIN clientes c ON r.cliente_id = c.id
        LEFT JOIN usuarios u ON r.usuario_id = u.id
        WHERE r.fecha >= ? AND r.fecha <= ?
        ORDER BY r.fecha ASC, r.hora ASC
    `;
    
    const [rows] = await db.execute(query, [fechaInicio, fechaFin]);
    return rows;
};

exports.getProximasSemana = async () => {
    // Calcular fechas para los próximos 7 días en hora local
    const hoy = new Date();
    
    // Asegurar que trabajamos con fechas locales, no UTC
    const fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + 6); // +6 porque incluimos el día actual
    
    // Formatear fechas para MySQL (YYYY-MM-DD)
    const formatoFecha = (fecha) => {
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
    };
    
    const fechaInicioStr = formatoFecha(fechaInicio);
    const fechaFinStr = formatoFecha(fechaFin);
    
    console.log(`Buscando reservaciones desde ${fechaInicioStr} hasta ${fechaFinStr} (hora local)`);
    
    const reservaciones = await this.findByFechaRango(fechaInicioStr, fechaFinStr);
    
    // Formatear las fechas para asegurar consistencia
    // No convertir a Date, mantener como string YYYY-MM-DD
    const reservacionesFormateadas = reservaciones.map(reservacion => {
        let fechaFormateada = reservacion.fecha;
        
        if (reservacion.fecha instanceof Date) {
            // Si es Date, convertir a string local (no UTC)
            const fecha = reservacion.fecha;
            fechaFormateada = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
        } else if (typeof reservacion.fecha === 'string' && reservacion.fecha.includes('T')) {
            // Si es ISO string, extraer solo la fecha
            fechaFormateada = reservacion.fecha.split('T')[0];
        }
        
        return {
            ...reservacion,
            fecha: fechaFormateada
        };
    });
    
    return reservacionesFormateadas;
};

exports.update = async (id, reservacionData) => {
    // Construir la consulta dinámicamente basada en los campos proporcionados
    const fields = [];
    const values = [];
    
    const updateableFields = [
        'cliente_id', 'usuario_id', 'fecha', 'hora', 'cantidad_personas', 
        'area', 'tipo_reservacion', 'observaciones', 'total_estimada', 
        'total_pagado', 'total_pendiente'
    ];
    
    updateableFields.forEach(field => {
        if (reservacionData[field] !== undefined) {
            fields.push(`${field} = ?`);
            values.push(reservacionData[field]);
        }
    });
    
    // Si no hay campos para actualizar, retornar
    if (fields.length === 0) return true;
    
    // Agregar el ID al final de los valores
    values.push(id);
    
    const query = `UPDATE reservaciones SET ${fields.join(', ')} WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
};

exports.delete = async (id) => {
    // Primero eliminamos los registros relacionados en reservacion_productos
    await db.execute(
        'DELETE FROM reservacion_productos WHERE reservacion_id = ?',
        [id]
    );
    
    // Luego eliminamos los anticipos relacionados
    await db.execute(
        'DELETE FROM anticipos WHERE reservacion_id = ?',
        [id]
    );
    
    // Finalmente eliminamos la reservación
    const [result] = await db.execute(
        'DELETE FROM reservaciones WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
};

exports.getAll = async (filtros = {}) => {
    let query = `
        SELECT r.*, 
               c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
               u.nombre AS usuario_nombre
        FROM reservaciones r
        LEFT JOIN clientes c ON r.cliente_id = c.id
        LEFT JOIN usuarios u ON r.usuario_id = u.id
    `;
    
    const conditions = [];
    const values = [];
    
    if (filtros.fecha) {
        conditions.push('r.fecha = ?');
        values.push(filtros.fecha);
    }
    
    if (filtros.cliente_id) {
        conditions.push('r.cliente_id = ?');
        values.push(filtros.cliente_id);
    }
    
    if (filtros.usuario_id) {
        conditions.push('r.usuario_id = ?');
        values.push(filtros.usuario_id);
    }
    
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY r.fecha DESC, r.hora ASC';
    
    const [rows] = await db.execute(query, values);
    return rows;
};

// Métodos para la gestión de productos en la reservación
exports.addProducto = async (reservacionProductoData) => {
    const { 
        reservacion_id, 
        producto_id, 
        cantidad, 
        precio_unitario 
    } = reservacionProductoData;
    
    // Calcular el subtotal
    const subtotal = cantidad * precio_unitario;
    
    const query = `
        INSERT INTO reservacion_productos (
            reservacion_id, 
            producto_id, 
            cantidad, 
            precio_unitario, 
            subtotal
        )
        VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
        reservacion_id,
        producto_id,
        cantidad,
        precio_unitario,
        subtotal
    ]);
    
    // Actualizar los totales de la reservación
    await this.actualizarTotales(reservacion_id);
    
    return result.insertId;
};

exports.updateProducto = async (id, reservacionProductoData) => {
    const fields = [];
    const values = [];
    
    if (reservacionProductoData.cantidad !== undefined) {
        fields.push('cantidad = ?');
        values.push(reservacionProductoData.cantidad);
    }
    
    if (reservacionProductoData.precio_unitario !== undefined) {
        fields.push('precio_unitario = ?');
        values.push(reservacionProductoData.precio_unitario);
    }
    
    // Si se actualizó cantidad o precio, recalcular subtotal
    if (fields.length > 0) {
        // Obtener datos actuales
        const [rows] = await db.execute(
            'SELECT * FROM reservacion_productos WHERE id = ?',
            [id]
        );
        
        if (rows.length === 0) return false;
        
        const actual = rows[0];
        const cantidad = reservacionProductoData.cantidad !== undefined ? 
            reservacionProductoData.cantidad : actual.cantidad;
        const precio = reservacionProductoData.precio_unitario !== undefined ? 
            reservacionProductoData.precio_unitario : actual.precio_unitario;
        
        fields.push('subtotal = ?');
        values.push(cantidad * precio);
    }
    
    if (fields.length === 0) return true;
    
    values.push(id);
    
    const query = `UPDATE reservacion_productos SET ${fields.join(', ')} WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    
    // Obtener el ID de la reservación para actualizar totales
    const [rows] = await db.execute(
        'SELECT reservacion_id FROM reservacion_productos WHERE id = ?',
        [id]
    );
    
    if (rows.length > 0) {
        await this.actualizarTotales(rows[0].reservacion_id);
    }
    
    return result.affectedRows > 0;
};

exports.removeProducto = async (id) => {
    // Obtener el ID de la reservación antes de eliminar
    const [rows] = await db.execute(
        'SELECT reservacion_id FROM reservacion_productos WHERE id = ?',
        [id]
    );
    
    if (rows.length === 0) return false;
    const reservacionId = rows[0].reservacion_id;
    
    // Eliminar el producto de la reservación
    const [result] = await db.execute(
        'DELETE FROM reservacion_productos WHERE id = ?',
        [id]
    );
    
    // Actualizar los totales de la reservación
    await this.actualizarTotales(reservacionId);
    
    return result.affectedRows > 0;
};

exports.getProductosByReservacionId = async (reservacionId) => {
    const query = `
        SELECT rp.*, p.nombre as producto_nombre
        FROM reservacion_productos rp
        JOIN productos p ON rp.producto_id = p.id
        WHERE rp.reservacion_id = ?
    `;
    
    const [rows] = await db.execute(query, [reservacionId]);
    return rows;
};

// Métodos para la gestión de anticipos
exports.addAnticipo = async (anticipoData) => {
    const { 
        reservacion_id, 
        monto, 
        metodo_pago, 
        observaciones 
    } = anticipoData;
    
    const query = `
        INSERT INTO anticipos (
            reservacion_id, 
            monto, 
            metodo_pago, 
            observaciones
        )
        VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
        reservacion_id,
        monto,
        metodo_pago,
        observaciones || null
    ]);
    
    // Actualizar los totales de la reservación
    await this.actualizarTotalesPagos(reservacion_id);
    
    return result.insertId;
};

exports.removeAnticipo = async (id) => {
    // Obtener el ID de la reservación antes de eliminar
    const [rows] = await db.execute(
        'SELECT reservacion_id FROM anticipos WHERE id = ?',
        [id]
    );
    
    if (rows.length === 0) return false;
    const reservacionId = rows[0].reservacion_id;
    
    // Eliminar el anticipo
    const [result] = await db.execute(
        'DELETE FROM anticipos WHERE id = ?',
        [id]
    );
    
    // Actualizar los totales de la reservación
    await this.actualizarTotalesPagos(reservacionId);
    
    return result.affectedRows > 0;
};

exports.getAnticiposByReservacionId = async (reservacionId) => {
    const [rows] = await db.execute(
        'SELECT * FROM anticipos WHERE reservacion_id = ? ORDER BY fecha DESC',
        [reservacionId]
    );
    return rows;
};

// Métodos auxiliares para actualizar totales
exports.actualizarTotales = async (reservacionId) => {
    // Calcular el total de productos
    const [productos] = await db.execute(
        'SELECT SUM(subtotal) as total FROM reservacion_productos WHERE reservacion_id = ?',
        [reservacionId]
    );
    
    const totalEstimada = productos[0].total || 0;
    
    // Actualizar el total estimado y pendiente
    await this.actualizarTotalesPagos(reservacionId, totalEstimada);
};

exports.actualizarTotalesPagos = async (reservacionId, totalEstimada = null) => {
    // Si no se proporciona el total estimado, obtenerlo de la base de datos
    if (totalEstimada === null) {
        const [reservacion] = await db.execute(
            'SELECT total_estimada FROM reservaciones WHERE id = ?',
            [reservacionId]
        );
        
        if (reservacion.length === 0) return false;
        totalEstimada = reservacion[0].total_estimada;
    }
    
    // Calcular el total pagado (suma de anticipos)
    const [anticipos] = await db.execute(
        'SELECT SUM(monto) as total_pagado FROM anticipos WHERE reservacion_id = ?',
        [reservacionId]
    );
    
    const totalPagado = anticipos[0].total_pagado || 0;
    const totalPendiente = totalEstimada - totalPagado;
    
    // Actualizar la reservación
    await db.execute(
        'UPDATE reservaciones SET total_estimada = ?, total_pagado = ?, total_pendiente = ? WHERE id = ?',
        [totalEstimada, totalPagado, totalPendiente, reservacionId]
    );
    
    return true;
};