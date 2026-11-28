import { Router } from 'express';
import { autenticar } from '../../middlewares/autenticar.js';
import { soloAdmin } from '../../middlewares/soloAdmin.js';
import {
  validar,
  validarConsulta,
  validarParametros,
} from '../../middlewares/validar.js';
import {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  cambiarEstado,
  desactivar,
  reactivar,
} from './vehiculos.controller.js';
import {
  idVehiculoParamSchema,
  listarVehiculosQuerySchema,
  crearVehiculoSchema,
  actualizarVehiculoSchema,
  cambiarEstadoVehiculoSchema,
} from './vehiculos.schema.js';

const router = Router();

// Todas las rutas de vehículos requieren sesión de administrador (RF-04).
router.use(autenticar, soloAdmin);

router.get('/', validarConsulta(listarVehiculosQuerySchema), listar);
router.get('/:id', validarParametros(idVehiculoParamSchema), obtenerPorId);
router.post('/', validar(crearVehiculoSchema), crear);
router.put(
  '/:id',
  validarParametros(idVehiculoParamSchema),
  validar(actualizarVehiculoSchema),
  actualizar
);
router.patch(
  '/:id',
  validarParametros(idVehiculoParamSchema),
  validar(actualizarVehiculoSchema),
  actualizar
);
router.patch(
  '/:id/estado',
  validarParametros(idVehiculoParamSchema),
  validar(cambiarEstadoVehiculoSchema),
  cambiarEstado
);
router.patch('/:id/desactivar', validarParametros(idVehiculoParamSchema), desactivar);
router.patch('/:id/activar', validarParametros(idVehiculoParamSchema), reactivar);
router.delete('/:id', validarParametros(idVehiculoParamSchema), desactivar);

export default router;
