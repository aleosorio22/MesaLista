const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Configuración de variables de entorno
dotenv.config();

// Importar la configuración de la base de datos
const db = require('./config/database');

// Importar rutas
const usuarioRoutes = require('./routes/usuarioRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const productoRoutes = require('./routes/productoRoutes');
const reservacionRoutes = require('./routes/reservacionRoutes'); // Agregar esta línea

// Inicializar app
const app = express();

//cors para permitir solicitudes desde el frontend
const corsOptions = {
  origin: [
    'https://mesalista.netlify.app',
    'https://mesalista.cafeelangel.com',
    'http://localhost:5173'
  ], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));


// Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'API de Sistema de Reservaciones para Café El Ángel' });
});

// Rutas de la API
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/reservaciones', reservacionRoutes); // Agregar esta línea

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
