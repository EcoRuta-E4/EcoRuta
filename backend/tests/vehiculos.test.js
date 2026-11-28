import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Simula la capa de datos para ejecutar pruebas rápidas sin requerir PostgreSQL.
vi.mock('../src/config/db.js', () => ({
  query: vi.fn(),
  default: { query: vi.fn() },
}));

import app from '../src/app.js';
import { query } from '../src/config/db.js';
import { ESTADOS_VEHICULO } from '../src/modules/vehiculos/vehiculos.schema.js';

process.env.JWT_SECRET = 'clave-de-prueba-vehiculos';

const tokenDe = (rol = 'admin') =>
  jwt.sign(
    { id: 1, nombre: 'Admin Prueba', correo: 'admin@ecoruta.co', rol },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

const tokenAdmin = () => tokenDe('admin');

const FILA_VEHICULO = {
  id: 1,
  placa: 'TUR101',
  numero_interno: 'C-01',
  marca: 'Chevrolet',
  modelo: 'NPR 2022',
  capacidad_toneladas: '6.00',
  estado: 'disponible',
  activo: true,
  creado_en: '2026-11-28T05:00:00.000Z',
};

beforeEach(() => {
  query.mockReset();
});

describe('Seguridad en /api/admin/vehiculos (RF-04)', () => {
  it.each([
    ['get', '/api/admin/vehiculos'],
    ['get', '/api/admin/vehiculos/1'],
    ['post', '/api/admin/vehiculos'],
    ['put', '/api/admin/vehiculos/1'],
    ['patch', '/api/admin/vehiculos/1/estado'],
    ['patch', '/api/admin/vehiculos/1/desactivar'],
    ['delete', '/api/admin/vehiculos/1'],
  ])('%s %s responde 401 sin token y no consulta la base', async (metodo, ruta) => {
    const res = await request(app)[metodo](ruta);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No autorizado');
    expect(query).not.toHaveBeenCalled();
  });

  it('responde 401 con token inválido', async () => {
    const res = await request(app)
      .get('/api/admin/vehiculos')
      .set('Authorization', 'Bearer token.invalido.123');
    expect(res.status).toBe(401);
    expect(query).not.toHaveBeenCalled();
  });

  it('responde 403 si el usuario autenticado no es administrador', async () => {
    const res = await request(app)
      .post('/api/admin/vehiculos')
      .set('Authorization', `Bearer ${tokenDe('ciudadano')}`)
      .send({ placa: 'ABC123' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Acceso denegado');
    expect(query).not.toHaveBeenCalled();
  });
});

describe('GET /api/admin/vehiculos (RF-07)', () => {
  it('lista los vehículos activos por defecto y convierte capacidad_toneladas a number', async () => {
    query.mockResolvedValue({
      rows: [
        FILA_VEHICULO,
        { ...FILA_VEHICULO, id: 2, placa: 'TUR102', capacidad_toneladas: null },
      ],
    });

    const res = await request(app)
      .get('/api/admin/vehiculos')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.datos).toHaveLength(2);
    expect(res.body.datos[0].capacidad_toneladas).toBe(6);
    expect(typeof res.body.datos[0].capacidad_toneladas).toBe('number');
    expect(res.body.datos[1].capacidad_toneladas).toBeNull();
    expect(query).toHaveBeenCalledWith(expect.stringMatching(/WHERE activo = TRUE/), []);
  });

  it('aplica filtros estado, activo=todos y buscar usando parámetros ($1, $2)', async () => {
    query.mockResolvedValue({ rows: [FILA_VEHICULO] });

    const res = await request(app)
      .get('/api/admin/vehiculos?estado=mantenimiento&activo=todos&buscar=TUR')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    const [sql, params] = query.mock.calls[0];
    expect(sql).toMatch(/WHERE estado = \$1 AND \(placa ILIKE \$2/);
    expect(sql).not.toMatch(/activo = TRUE/);
    expect(params).toEqual(['mantenimiento', '%TUR%']);
  });

  it('ignora filtros vacíos (?estado=&buscar=)', async () => {
    query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .get('/api/admin/vehiculos?estado=&buscar=&activo=')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.datos).toEqual([]);
    expect(query).toHaveBeenCalledWith(expect.stringMatching(/WHERE activo = TRUE/), []);
  });

  it.each([
    'estado=descompuesto',
    "estado=disponible'%20OR%201=1",
    'activo=si',
  ])('rechaza filtro inválido (%s) con 400 sin consultar la base', async (consulta) => {
    const res = await request(app)
      .get(`/api/admin/vehiculos?${consulta}`)
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Datos inválidos');
    expect(query).not.toHaveBeenCalled();
  });
});

describe('GET /api/admin/vehiculos/:id (RF-07)', () => {
  it('devuelve el vehículo solicitado con 200', async () => {
    query.mockResolvedValue({ rows: [FILA_VEHICULO] });

    const res = await request(app)
      .get('/api/admin/vehiculos/1')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.datos.placa).toBe('TUR101');
    expect(res.body.datos.capacidad_toneladas).toBe(6);
    expect(query).toHaveBeenCalledWith(expect.stringMatching(/WHERE id = \$1/), [1]);
  });

  it('devuelve 404 si el vehículo no existe', async () => {
    query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .get('/api/admin/vehiculos/999')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Vehículo no encontrado');
  });

  it.each(['abc', '0', '-3', '2.5'])('devuelve 400 si el id (%s) no es entero positivo', async (id) => {
    const res = await request(app)
      .get(`/api/admin/vehiculos/${id}`)
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Datos inválidos');
    expect(query).not.toHaveBeenCalled();
  });
});

describe('POST /api/admin/vehiculos (RF-07, RF-08, RF-09, RNF-04)', () => {
  it('registra un vehículo válido con 201, normaliza placa a mayúsculas y asigna estado disponible por defecto', async () => {
    query.mockResolvedValue({
      rows: [{ ...FILA_VEHICULO, id: 10, placa: 'LFL-420', capacidad_toneladas: '12.00' }],
    });

    const res = await request(app)
      .post('/api/admin/vehiculos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({
        placa: '  lfl-420 ',
        numero_interno: 'ECO-015',
        marca: 'Hino',
        modelo: '500',
        capacidad_toneladas: 12,
      });

    expect(res.status).toBe(201);
    expect(res.body.mensaje).toMatch(/registrado/i);
    expect(res.body.datos.placa).toBe('LFL-420');
    expect(res.body.datos.capacidad_toneladas).toBe(12);
    expect(query).toHaveBeenCalledWith(
      expect.stringMatching(/INSERT INTO vehiculos/),
      ['LFL-420', 'ECO-015', 'Hino', '500', 12, 'disponible']
    );
  });

  it.each(ESTADOS_VEHICULO)('acepta el estado válido "%s"', async (estado) => {
    query.mockResolvedValue({ rows: [{ ...FILA_VEHICULO, estado }] });

    const res = await request(app)
      .post('/api/admin/vehiculos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ placa: 'TUR200', estado });

    expect(res.status).toBe(201);
    expect(res.body.datos.estado).toBe(estado);
  });

  it('responde 409 con mensaje claro en español si PostgreSQL reporta placa repetida (23505)', async () => {
    const errorPg = new Error('duplicate key value violates unique constraint "vehiculos_placa_key"');
    errorPg.code = '23505';
    query.mockRejectedValue(errorPg);

    const res = await request(app)
      .post('/api/admin/vehiculos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ placa: 'tur101', marca: 'Chevrolet' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Placa duplicada');
    expect(res.body.mensaje).toMatch(/TUR101/);
    expect(res.body.mensaje).toMatch(/no puede repetirse/i);
  });

  it.each([
    ['sin placa', {}, 'placa'],
    ['placa muy corta', { placa: 'AB' }, 'placa'],
    ['placa mayor a 10 caracteres', { placa: 'PLACA123456' }, 'placa'],
    ['placa con espacios internos', { placa: 'ABC 123' }, 'placa'],
    ['estado inválido', { placa: 'ABC123', estado: 'reparando' }, 'estado'],
    ['capacidad cero', { placa: 'ABC123', capacidad_toneladas: 0 }, 'capacidad_toneladas'],
    ['capacidad negativa', { placa: 'ABC123', capacidad_toneladas: -5 }, 'capacidad_toneladas'],
    ['capacidad no numérica', { placa: 'ABC123', capacidad_toneladas: 'diez' }, 'capacidad_toneladas'],
    ['capacidad booleana', { placa: 'ABC123', capacidad_toneladas: true }, 'capacidad_toneladas'],
    ['capacidad mayor al límite NUMERIC(5,2)', { placa: 'ABC123', capacidad_toneladas: 1500 }, 'capacidad_toneladas'],
  ])('rechaza petición inválida (%s) con 400 sin consultar la base', async (_caso, payload, campo) => {
    const res = await request(app)
      .post('/api/admin/vehiculos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Datos inválidos');
    expect(res.body.mensaje).toBeTruthy();
    expect(res.body.detalles).toEqual(
      expect.arrayContaining([expect.objectContaining({ campo })])
    );
    expect(query).not.toHaveBeenCalled();
  });
});

describe('PUT / PATCH /api/admin/vehiculos/:id (RF-07, RF-08, RF-09)', () => {
  it('actualiza datos y estado de un vehículo con parámetros', async () => {
    query.mockResolvedValue({
      rows: [{ ...FILA_VEHICULO, marca: 'Isuzu', estado: 'mantenimiento' }],
    });

    const res = await request(app)
      .put('/api/admin/vehiculos/1')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ marca: 'Isuzu', estado: 'mantenimiento' });

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toMatch(/actualizado/i);
    expect(res.body.datos.estado).toBe('mantenimiento');
    expect(query).toHaveBeenCalledWith(
      expect.stringMatching(/UPDATE vehiculos[\s\S]*SET marca = \$1, estado = \$2[\s\S]*WHERE id = \$3/),
      ['Isuzu', 'mantenimiento', 1]
    );
  });

  it('cambia solo el estado operativo mediante PATCH /api/admin/vehiculos/:id/estado', async () => {
    query.mockResolvedValue({
      rows: [{ ...FILA_VEHICULO, estado: 'en_servicio' }],
    });

    const res = await request(app)
      .patch('/api/admin/vehiculos/1/estado')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ estado: 'en_servicio' });

    expect(res.status).toBe(200);
    expect(res.body.datos.estado).toBe('en_servicio');
  });

  it('rechaza actualización con cuerpo vacío ({}) sin consultar la base', async () => {
    const res = await request(app)
      .patch('/api/admin/vehiculos/1')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.mensaje).toMatch(/al menos un campo/i);
    expect(query).not.toHaveBeenCalled();
  });

  it('responde 409 al editar hacia una placa ya registrada', async () => {
    const errorPg = new Error('duplicate key');
    errorPg.code = '23505';
    query.mockRejectedValue(errorPg);

    const res = await request(app)
      .put('/api/admin/vehiculos/1')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ placa: 'TUR102' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Placa duplicada');
    expect(res.body.mensaje).toMatch(/TUR102/);
  });

  it('responde 404 si se intenta editar un vehículo inexistente', async () => {
    query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .patch('/api/admin/vehiculos/999')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ estado: 'disponible' });

    expect(res.status).toBe(404);
  });
});

describe('Desactivar y reactivar vehículos (RF-07)', () => {
  it('PATCH /api/admin/vehiculos/:id/desactivar marca activo = FALSE sin borrar el registro', async () => {
    query.mockResolvedValue({ rows: [{ ...FILA_VEHICULO, activo: false }] });

    const res = await request(app)
      .patch('/api/admin/vehiculos/1/desactivar')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.datos.activo).toBe(false);
    expect(res.body.mensaje).toMatch(/desactivado/i);
    const [sql, params] = query.mock.calls[0];
    expect(sql).toMatch(/UPDATE vehiculos/i);
    expect(sql).not.toMatch(/DELETE FROM/i);
    expect(params).toEqual([false, 1]);
  });

  it('DELETE /api/admin/vehiculos/:id también realiza desactivación lógica (activo = FALSE)', async () => {
    query.mockResolvedValue({ rows: [{ ...FILA_VEHICULO, activo: false }] });

    const res = await request(app)
      .delete('/api/admin/vehiculos/1')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.datos.activo).toBe(false);
    expect(query).toHaveBeenCalledWith(expect.stringMatching(/UPDATE vehiculos/i), [false, 1]);
  });

  it('PATCH /api/admin/vehiculos/:id/activar reactiva el vehículo (activo = TRUE)', async () => {
    query.mockResolvedValue({ rows: [{ ...FILA_VEHICULO, activo: true }] });

    const res = await request(app)
      .patch('/api/admin/vehiculos/1/activar')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.datos.activo).toBe(true);
    expect(query).toHaveBeenCalledWith(expect.stringMatching(/UPDATE vehiculos/i), [true, 1]);
  });

  it('responde 404 al desactivar un vehículo inexistente', async () => {
    query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .delete('/api/admin/vehiculos/999')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });
});

describe('Manejo de migraciones faltantes en vehículos (503)', () => {
  it('responde 503 si la tabla vehiculos no existe (42P01)', async () => {
    const errorPg = new Error('relation "vehiculos" does not exist');
    errorPg.code = '42P01';
    query.mockRejectedValue(errorPg);

    const res = await request(app)
      .get('/api/admin/vehiculos')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(503);
    expect(res.body.error).toBe('Base de datos desactualizada');
  });
});
