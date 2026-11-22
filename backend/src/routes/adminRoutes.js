import { Router } from 'express';
import { autenticar } from '../middlewares/autenticar.js';
import { soloAdmin } from '../middlewares/soloAdmin.js';
import { query } from '../config/db.js';

const router = Router();

// Todas las rutas de este router requieren autenticación y rol de administrador (RF-04)
router.use(autenticar, soloAdmin);

/**
 * Verificar estado y permisos del administrador
 */
router.get('/verificar', (req, res) => {
  return res.status(200).json({
    autorizado: true,
    mensaje: 'Acceso autorizado al panel de administración.',
    admin: req.usuario,
  });
});

/**
 * Resumen del panel administrativo (RF-04, conecta con v_resumen_dashboard si existe)
 */
router.get('/dashboard-resumen', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM v_resumen_dashboard LIMIT 1');
    return res.status(200).json({
      mensaje: 'Datos del resumen del panel obtenidos correctamente.',
      datos: rows[0] || {},
    });
  } catch (error) {
    // Si la vista aún no está creada en la base de datos, informarlo limpiamente
    if (error.code === '42P01') {
      return res.status(200).json({
        mensaje: 'Panel de administración accesible. (La vista v_resumen_dashboard aún no ha sido migrada).',
        datos: null,
      });
    }
    next(error);
  }
});

export default router;
