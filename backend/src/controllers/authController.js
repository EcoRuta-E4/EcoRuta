import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

/**
 * Iniciar sesión (RF-01, RF-02, RNF-01, RNF-02)
 */
export const login = async (req, res, next) => {
  try {
    const correo = (req.body.correo || req.body.email || '').trim().toLowerCase();
    const contrasena = req.body.contrasena || req.body.password || '';

    // Buscar usuario por correo (insensible a mayúsculas)
    const { rows } = await query(
      'SELECT id, nombre, correo, contrasena_hash, rol, activo FROM usuarios WHERE LOWER(correo) = LOWER($1)',
      [correo]
    );

    const usuario = rows[0];

    // RF-02: Mensaje comprensible con credenciales incorrectas
    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales incorrectas',
        mensaje: 'Correo o contraseña incorrectos. Verifica tus datos e intenta nuevamente.',
      });
    }

    // Verificar si la cuenta está activa
    if (!usuario.activo) {
      return res.status(403).json({
        error: 'Cuenta inactiva',
        mensaje: 'Tu cuenta de usuario ha sido desactivada. Contacta al administrador del sistema.',
      });
    }

    // RNF-01: Validación de contraseña con hash bcrypt
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!contrasenaValida) {
      return res.status(401).json({
        error: 'Credenciales incorrectas',
        mensaje: 'Correo o contraseña incorrectos. Verifica tus datos e intenta nuevamente.',
      });
    }

    // RNF-02: Generación de token JWT con tiempo de expiración
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('ERROR: JWT_SECRET no está configurado en .env');
      return res.status(500).json({
        error: 'Error de configuración',
        mensaje: 'Error de configuración de seguridad en el servidor.',
      });
    }

    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
    const token = jwt.sign(payload, secret, { expiresIn });

    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: payload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cerrar sesión (RF-03)
 */
export const logout = async (req, res) => {
  return res.status(200).json({
    mensaje: 'Cierre de sesión exitoso. El token ha sido descartado en el cliente.',
  });
};

/**
 * Obtener perfil del usuario autenticado (RF-01, RF-04)
 */
export const obtenerPerfil = async (req, res) => {
  return res.status(200).json({
    usuario: req.usuario,
  });
};
