import { z } from 'zod';

export const ESTADOS_VEHICULO = [
  'disponible',
  'en_servicio',
  'mantenimiento',
  'fuera_de_servicio',
];

const MENSAJE_ESTADO =
  'El estado debe ser disponible, en_servicio, mantenimiento o fuera_de_servicio.';

// Convierte cadenas vacías (o solo espacios) a undefined para ignorar filtros vacíos (?estado=).
const filtroOpcional = (schema) =>
  z.preprocess(
    (valor) => (typeof valor === 'string' && valor.trim() === '' ? undefined : valor),
    schema.optional()
  );

// Normaliza campos de texto opcionales: recorta espacios y convierte "" en null.
const textoOpcional = (max, nombreCampo) =>
  z.preprocess(
    (valor) => {
      if (valor === undefined) return undefined;
      if (valor === null) return null;
      if (typeof valor === 'string') {
        const limpio = valor.trim();
        return limpio === '' ? null : limpio;
      }
      return valor;
    },
    z
      .string({ error: `${nombreCampo} debe ser texto.` })
      .max(max, `${nombreCampo} no puede superar ${max} caracteres.`)
      .nullable()
      .optional()
  );

// Valida capacidad_toneladas evitando conversiones implícitas de "" o booleanos a números.
const capacidadSchema = z.preprocess(
  (valor) => {
    if (valor === undefined) return undefined;
    if (valor === null) return null;
    if (typeof valor === 'string') {
      const limpio = valor.trim();
      if (limpio === '') return null;
      const numero = Number(limpio);
      return Number.isFinite(numero) ? numero : valor;
    }
    return valor;
  },
  z
    .number({ error: 'La capacidad en toneladas debe ser un número válido.' })
    .positive('La capacidad en toneladas debe ser mayor que 0.')
    .max(999.99, 'La capacidad en toneladas no puede superar 999.99.')
    .nullable()
    .optional()
);

const placaSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? 'La placa es obligatoria.'
        : 'La placa debe ser texto.',
  })
  .trim()
  .toUpperCase()
  .min(3, 'La placa debe tener al menos 3 caracteres.')
  .max(10, 'La placa no puede superar 10 caracteres.')
  .regex(
    /^[A-Z0-9-]+$/,
    'La placa solo puede contener letras, números y guiones (sin espacios).'
  );

const estadoSchema = z.enum(ESTADOS_VEHICULO, { error: MENSAJE_ESTADO });

/**
 * Parámetro :id de ruta para consultar, editar o desactivar un vehículo.
 */
export const idVehiculoParamSchema = z.object({
  id: z
    .string()
    .regex(
      /^[1-9]\d*$/,
      'El identificador del vehículo debe ser un número entero positivo.'
    )
    .transform(Number),
});

/**
 * Filtros de consulta para GET /api/admin/vehiculos
 */
export const listarVehiculosQuerySchema = z.object({
  estado: filtroOpcional(estadoSchema),
  activo: filtroOpcional(
    z.preprocess(
      (valor) => (typeof valor === 'string' ? valor.trim().toLowerCase() : valor),
      z.enum(['true', 'false', 'todos'], {
        error: 'El filtro activo debe ser true, false o todos.',
      })
    )
  ),
  buscar: filtroOpcional(
    z
      .string({ error: 'El término de búsqueda debe ser texto.' })
      .trim()
      .max(50, 'El término de búsqueda no puede superar 50 caracteres.')
  ),
});

/**
 * Cuerpo para registrar un vehículo (POST /api/admin/vehiculos)
 */
export const crearVehiculoSchema = z.object({
  placa: placaSchema,
  numero_interno: textoOpcional(20, 'El número interno'),
  marca: textoOpcional(50, 'La marca'),
  modelo: textoOpcional(50, 'El modelo'),
  capacidad_toneladas: capacidadSchema,
  estado: estadoSchema.default('disponible'),
});

/**
 * Cuerpo para editar un vehículo (PUT o PATCH /api/admin/vehiculos/:id)
 */
export const actualizarVehiculoSchema = z
  .object({
    placa: placaSchema.optional(),
    numero_interno: textoOpcional(20, 'El número interno'),
    marca: textoOpcional(50, 'La marca'),
    modelo: textoOpcional(50, 'El modelo'),
    capacidad_toneladas: capacidadSchema,
    estado: estadoSchema.optional(),
    activo: z
      .boolean({ error: 'El campo activo debe ser verdadero o falso.' })
      .optional(),
  })
  .refine((datos) => Object.values(datos).some((valor) => valor !== undefined), {
    message: 'Debes enviar al menos un campo para actualizar el vehículo.',
  });

/**
 * Cuerpo para cambiar el estado operativo (PATCH /api/admin/vehiculos/:id/estado)
 */
export const cambiarEstadoVehiculoSchema = z.object({
  estado: estadoSchema,
});
