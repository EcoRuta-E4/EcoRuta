import {
  listarVehiculos,
  obtenerVehiculoPorId,
  crearVehiculo,
  actualizarVehiculo,
  cambiarActivoVehiculo,
} from './vehiculos.service.js';

const responderNoEncontrado = (res) =>
  res.status(404).json({
    error: 'Vehículo no encontrado',
    mensaje: 'No existe un vehículo registrado con ese identificador.',
  });

/**
 * Traduce errores conocidos de PostgreSQL a respuestas HTTP claras en español.
 */
const manejarErrorVehiculo = (error, res, next, placa) => {
  // 23505 = unique_violation (RF-08: placa repetida)
  if (error.code === '23505') {
    const detallePlaca = placa ? ` con la placa ${placa}` : '';
    return res.status(409).json({
      error: 'Placa duplicada',
      mensaje: `Ya existe un vehículo registrado${detallePlaca}. La placa no puede repetirse.`,
    });
  }

  // 23514 = check_violation (RF-09 / capacidad positiva)
  if (error.code === '23514') {
    return res.status(400).json({
      error: 'Datos inválidos',
      mensaje: 'Los datos del vehículo no cumplen las restricciones de validación.',
    });
  }

  // 42P01 = tabla inexistente
  if (error.code === '42P01' || error.code === '42883') {
    return res.status(503).json({
      error: 'Base de datos desactualizada',
      mensaje:
        'La base de datos aún no tiene la tabla de vehículos. Ejecuta "npm run migrate up".',
    });
  }

  return next(error);
};

/**
 * GET /api/admin/vehiculos — Listar vehículos (RF-07)
 */
export const listar = async (req, res, next) => {
  try {
    const vehiculos = await listarVehiculos(req.consulta);
    return res.status(200).json({ datos: vehiculos });
  } catch (error) {
    return manejarErrorVehiculo(error, res, next);
  }
};

/**
 * GET /api/admin/vehiculos/:id — Consultar vehículo por ID (RF-07)
 */
export const obtenerPorId = async (req, res, next) => {
  try {
    const vehiculo = await obtenerVehiculoPorId(req.parametros.id);
    if (!vehiculo) return responderNoEncontrado(res);

    return res.status(200).json({ datos: vehiculo });
  } catch (error) {
    return manejarErrorVehiculo(error, res, next);
  }
};

/**
 * POST /api/admin/vehiculos — Registrar vehículo (RF-07, RF-08, RF-09)
 */
export const crear = async (req, res, next) => {
  try {
    const vehiculo = await crearVehiculo(req.body);
    return res.status(201).json({
      mensaje: 'Vehículo registrado correctamente.',
      datos: vehiculo,
    });
  } catch (error) {
    return manejarErrorVehiculo(error, res, next, req.body?.placa);
  }
};

/**
 * PUT / PATCH /api/admin/vehiculos/:id — Editar vehículo (RF-07, RF-08, RF-09)
 */
export const actualizar = async (req, res, next) => {
  try {
    const vehiculo = await actualizarVehiculo(req.parametros.id, req.body);
    if (!vehiculo) return responderNoEncontrado(res);

    return res.status(200).json({
      mensaje: 'Vehículo actualizado correctamente.',
      datos: vehiculo,
    });
  } catch (error) {
    return manejarErrorVehiculo(error, res, next, req.body?.placa);
  }
};

/**
 * PATCH /api/admin/vehiculos/:id/estado — Cambiar estado operativo (RF-09)
 */
export const cambiarEstado = async (req, res, next) => {
  try {
    const vehiculo = await actualizarVehiculo(req.parametros.id, {
      estado: req.body.estado,
    });
    if (!vehiculo) return responderNoEncontrado(res);

    return res.status(200).json({
      mensaje: 'Estado del vehículo actualizado correctamente.',
      datos: vehiculo,
    });
  } catch (error) {
    return manejarErrorVehiculo(error, res, next);
  }
};

/**
 * DELETE / PATCH /api/admin/vehiculos/:id/desactivar — Desactivar sin borrar historial (RF-07)
 */
export const desactivar = async (req, res, next) => {
  try {
    const vehiculo = await cambiarActivoVehiculo(req.parametros.id, false);
    if (!vehiculo) return responderNoEncontrado(res);

    return res.status(200).json({
      mensaje: 'Vehículo desactivado correctamente. El registro se conserva en el historial.',
      datos: vehiculo,
    });
  } catch (error) {
    return manejarErrorVehiculo(error, res, next);
  }
};

/**
 * PATCH /api/admin/vehiculos/:id/activar — Reactivar un vehículo desactivado (RF-07)
 */
export const reactivar = async (req, res, next) => {
  try {
    const vehiculo = await cambiarActivoVehiculo(req.parametros.id, true);
    if (!vehiculo) return responderNoEncontrado(res);

    return res.status(200).json({
      mensaje: 'Vehículo reactivado correctamente.',
      datos: vehiculo,
    });
  } catch (error) {
    return manejarErrorVehiculo(error, res, next);
  }
};
