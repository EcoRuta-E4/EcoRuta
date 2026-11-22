export const validar = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errores = result.error.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensaje: issue.message,
      }));

      return res.status(400).json({
        error: 'Datos inválidos',
        detalles: errores,
      });
    }

    req.body = result.data;
    next();
  };
};
