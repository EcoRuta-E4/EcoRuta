import { query } from '../../config/db.js';

const COLUMNAS_VEHICULO =
  'id, placa, numero_interno, marca, modelo, capacidad_toneladas, estado, activo, creado_en';

// Lista blanca de columnas modificables en UPDATE para evitar inyección en nombres de campo.
const CAMPOS_ACTUALIZABLES = [
  'placa',
  'numero_interno',
  'marca',
  'modelo',
  'capacidad_toneladas',
  'estado',
  'activo',
];

/**
 * Convierte NUMERIC de PostgreSQL (texto) a number manteniendo null cuando corresponda.
 */
const formatearVehiculo = (fila) => {
  if (!fila) return null;
  return {
    ...fila,
    capacidad_toneladas:
      fila.capacidad_toneladas === null || fila.capacidad_toneladas === undefined
        ? null
        : Number(fila.capacidad_toneladas),
  };
};

/**
 * Lista los vehículos aplicando filtros opcionales con consultas parametrizadas.
 */
export const listarVehiculos = async ({ estado, activo = 'true', buscar } = {}) => {
  const condiciones = [];
  const parametros = [];

  if (activo === 'true') {
    condiciones.push('activo = TRUE');
  } else if (activo === 'false') {
    condiciones.push('activo = FALSE');
  }

  if (estado) {
    parametros.push(estado);
    condiciones.push(`estado = $${parametros.length}`);
  }

  if (buscar) {
    parametros.push(`%${buscar}%`);
    const indice = parametros.length;
    condiciones.push(
      `(placa ILIKE $${indice} OR COALESCE(numero_interno, '') ILIKE $${indice} OR COALESCE(marca, '') ILIKE $${indice} OR COALESCE(modelo, '') ILIKE $${indice})`
    );
  }

  const donde = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT ${COLUMNAS_VEHICULO}
       FROM vehiculos
       ${donde}
      ORDER BY id DESC`,
    parametros
  );

  return rows.map(formatearVehiculo);
};

/**
 * Obtiene un vehículo por su identificador numérico.
 */
export const obtenerVehiculoPorId = async (id) => {
  const { rows } = await query(
    `SELECT ${COLUMNAS_VEHICULO}
       FROM vehiculos
      WHERE id = $1`,
    [id]
  );

  return formatearVehiculo(rows[0]);
};

/**
 * Registra un nuevo vehículo en la base de datos.
 */
export const crearVehiculo = async ({
  placa,
  numero_interno = null,
  marca = null,
  modelo = null,
  capacidad_toneladas = null,
  estado = 'disponible',
}) => {
  const { rows } = await query(
    `INSERT INTO vehiculos (placa, numero_interno, marca, modelo, capacidad_toneladas, estado)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNAS_VEHICULO}`,
    [placa, numero_interno, marca, modelo, capacidad_toneladas, estado]
  );

  return formatearVehiculo(rows[0]);
};

/**
 * Actualiza los campos enviados de un vehículo existente.
 */
export const actualizarVehiculo = async (id, cambios) => {
  const asignaciones = [];
  const parametros = [];

  for (const campo of CAMPOS_ACTUALIZABLES) {
    if (cambios[campo] !== undefined) {
      parametros.push(cambios[campo]);
      asignaciones.push(`${campo} = $${parametros.length}`);
    }
  }

  parametros.push(id);
  const { rows } = await query(
    `UPDATE vehiculos
        SET ${asignaciones.join(', ')}
      WHERE id = $${parametros.length}
     RETURNING ${COLUMNAS_VEHICULO}`,
    parametros
  );

  return formatearVehiculo(rows[0]);
};

/**
 * Cambia el estado lógico activo/inactivo del vehículo sin borrar su historial (RF-07).
 */
export const cambiarActivoVehiculo = async (id, activo) => {
  const { rows } = await query(
    `UPDATE vehiculos
        SET activo = $1
      WHERE id = $2
     RETURNING ${COLUMNAS_VEHICULO}`,
    [activo, id]
  );

  return formatearVehiculo(rows[0]);
};
