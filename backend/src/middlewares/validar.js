const crearValidador = (fuente, destino, schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req[fuente] ?? {});

    if (!result.success) {
      const detalles = result.error.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensaje: issue.message,
      }));

      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: detalles[0]?.mensaje || 'Los datos enviados no son válidos.',
        detalles,
      });
    }

    req[destino] = result.data;
    next();
  };
};

/**
 * Valida el cuerpo JSON de la petición (req.body).
 */
export const validar = (schema) => crearValidador('body', 'body', schema);

/**
 * Valida los parámetros de consulta (?clave=valor). El resultado queda en req.consulta,
 * porque en Express 5 req.query es de solo lectura.
 */
export const validarConsulta = (schema) => crearValidador('query', 'consulta', schema);

/**
 * Valida los parámetros de ruta (:id). El resultado queda en req.parametros.
 */
export const validarParametros = (schema) =>
  crearValidador('params', 'parametros', schema);
