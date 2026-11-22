import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Configuración de CORS (permite FRONTEND_URL, por defecto http://localhost:5173)
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite peticiones sin origen (como Postman/Thunder Client/móviles) o que coincidan con FRONTEND_URL
      if (!origin || origin === frontendUrl || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // En desarrollo somos permisivos para facilitar pruebas
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Endpoint de verificación de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({
    estado: 'ok',
    servicio: 'EcoRuta API Backend',
    fecha: new Date().toISOString(),
  });
});

// Enrutadores principales
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    mensaje: `La ruta ${req.method} ${req.originalUrl} no existe en este servidor.`,
  });
});

// Manejador global de errores (500)
app.use((err, req, res, next) => {
  console.error('Error no controlado en la aplicación:', err);

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.name || 'Error interno del servidor',
    mensaje: err.message || 'Ocurrió un error inesperado en el servidor.',
  });
});

export default app;
