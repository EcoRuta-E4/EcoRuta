import { useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Icon from '../../../components/Icon.jsx';
import VisorImagen from '../../../components/VisorImagen.jsx';
import {
  getVehiculosLocales,
  saveVehiculosLocales,
  FOTO_DEFECTO_REAL,
} from '../../../api/vehiculos.js';

export default function RegistrarVehiculoPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [vehiculosExistentes] = useState(() => getVehiculosLocales());
  const vehiculoEncontrado = id
    ? vehiculosExistentes.find((v) => v.id === id || v.placa === id)
    : null;
  const esEdicion = Boolean(vehiculoEncontrado);

  // Campos del formulario
  const [placa, setPlaca] = useState(() => vehiculoEncontrado?.placa || '');
  const [numeroInterno, setNumeroInterno] = useState(
    () => vehiculoEncontrado?.numero_interno || ''
  );
  const [marca, setMarca] = useState(() => vehiculoEncontrado?.marca || '');
  const [modelo, setModelo] = useState(() => vehiculoEncontrado?.modelo || '');
  const [capacidad, setCapacidad] = useState(
    () => (vehiculoEncontrado?.capacidad_toneladas ? String(vehiculoEncontrado.capacidad_toneladas) : '')
  );
  const [estado, setEstado] = useState(() => vehiculoEncontrado?.estado || 'disponible');

  // Foto y archivo
  const [fotoPreview, setFotoPreview] = useState(
    () => vehiculoEncontrado?.foto || FOTO_DEFECTO_REAL
  );
  const [nombreArchivo, setNombreArchivo] = useState(
    () => vehiculoEncontrado?.nombre_archivo || 'LFL-420-real.jpg'
  );
  const [tamanoArchivo, setTamanoArchivo] = useState(
    () => vehiculoEncontrado?.tamano_archivo || '1.8 MB'
  );

  // Errores y validación
  const [error, setError] = useState('');
  const [imagenAmpliada, setImagenAmpliada] = useState(false);

  // Manejo de carga de nueva foto real
  function handleCambiarFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('El archivo seleccionado debe ser una imagen (JPG o PNG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen supera el límite de 5 MB. Por favor sube una imagen más ligera.');
      return;
    }

    setError('');
    const tamanoMB = (file.size / (1024 * 1024)).toFixed(1);
    setNombreArchivo(file.name);
    setTamanoArchivo(`${tamanoMB} MB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFotoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const placaLimpia = placa.trim().toUpperCase();

    if (!placaLimpia) {
      setError('Por favor ingresa la placa del vehículo.');
      return;
    }

    // Validación de placa única (RNF-10)
    const duplicada = vehiculosExistentes.some(
      (v) => v.placa.toUpperCase() === placaLimpia && (!esEdicion || v.id !== id)
    );

    if (duplicada) {
      setError(`Ya existe un vehículo registrado con la placa ${placaLimpia}. La placa debe ser única.`);
      return;
    }

    if (!numeroInterno.trim()) {
      setError('Ingresa el número interno del vehículo (ej. ECO-015).');
      return;
    }

    if (!marca.trim() || !modelo.trim()) {
      setError('Completa los campos de marca y modelo del vehículo.');
      return;
    }

    const capNum = parseFloat(capacidad);
    if (isNaN(capNum) || capNum <= 0) {
      setError('Ingresa una capacidad en toneladas válida.');
      return;
    }

    const vehiculoGuardado = {
      id: id || `veh-${placaLimpia.toLowerCase()}-${Date.now()}`,
      placa: placaLimpia,
      numero_interno: numeroInterno.trim(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      tipo: modelo.toLowerCase().includes('volqueta')
        ? 'Volqueta Recolectora'
        : modelo.toLowerCase().includes('recolector')
        ? 'Camión Recolector'
        : 'Compactador',
      capacidad_toneladas: capNum,
      estado,
      activo: true, // RF-07: Se registra como Activo por defecto
      encabezado: `${placaLimpia} · ${marca.trim()}`,
      subtitulo: modelo.trim(),
      linea1: `${capNum} ton - ${modelo.trim()}`,
      linea2: `${capNum} ton`,
      tiene_icono_peso: false,
      tiene_icono_fecha: false,
      fecha_registro: new Date().toLocaleDateString('es-CO'),
      foto: fotoPreview,
      nombre_archivo: nombreArchivo,
      tamano_archivo: tamanoArchivo,
    };

    let listaActualizada;
    if (esEdicion) {
      listaActualizada = vehiculosExistentes.map((v) =>
        v.id === id || v.placa === id ? { ...v, ...vehiculoGuardado } : v
      );
    } else {
      listaActualizada = [vehiculoGuardado, ...vehiculosExistentes];
    }

    saveVehiculosLocales(listaActualizada);
    navigate('/vehiculos');
  }

  return (
    <div className="vehiculos-form-page">
      {/* Barra superior con navegación y acciones */}
      <div className="form-page__topbar">
        <div className="form-page__title-area">
          <button
            type="button"
            className="btn-circle-back"
            onClick={() => navigate('/vehiculos')}
            aria-label="Volver al listado"
          >
            <Icon name="arrow" size={20} stroke={2.2} />
          </button>

          <div>
            <h1 className="form-page__title">
              {esEdicion ? 'Editar Vehículo' : 'Registrar Vehículo'}
            </h1>
            <p className="form-page__subtitle">
              Nueva unidad de recolección · Buenaventura
            </p>

            {/* Breadcrumb */}
            <nav className="form-breadcrumb" aria-label="Migas de pan">
              <Link to="/dashboard" className="breadcrumb-link">
                <Icon name="home" size={15} />
              </Link>
              <span className="breadcrumb-sep">&gt;</span>
              <Link to="/vehiculos" className="breadcrumb-link">
                Vehículos
              </Link>
              <span className="breadcrumb-sep">&gt;</span>
              <span className="breadcrumb-current">
                {esEdicion ? 'Editar vehículo' : 'Registrar vehículo'}
              </span>
            </nav>
          </div>
        </div>

        <div className="form-page__top-actions">
          <Link to="/vehiculos" className="btn-volver-listado">
            <Icon name="back" size={17} stroke={2} />
            <span>Volver al listado</span>
          </Link>

          <button type="button" className="btn-bell" aria-label="Notificaciones">
            <Icon name="bell" size={20} stroke={1.8} />
          </button>
        </div>
      </div>

      {/* Alerta de error si aplica */}
      {error && (
        <div className="form-page__alert" role="alert">
          <Icon name="alert" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Cuadrícula de 2 columnas: Formulario a la izquierda, Fotos y Guía a la derecha */}
      <div className="form-page__layout">
        {/* Columna izquierda: Datos del vehículo */}
        <section className="form-card form-card--main">
          <div className="form-card__head">
            <h2 className="form-card__title">Datos del vehículo</h2>
            <p className="form-card__note">Los campos con * son obligatorios</p>
          </div>

          <form onSubmit={handleSubmit} id="form-vehiculo" className="form-grid-fields">
            {/* Placa */}
            <div className="form-field">
              <label htmlFor="input-placa" className="field-lbl">
                Placa *
              </label>
              <input
                id="input-placa"
                type="text"
                placeholder="Ej. LFL-420"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                maxLength={10}
                required
                className="input-custom input-placa"
              />
              <span className="field-caption">Obligatoria y única en la base de datos</span>
            </div>

            {/* Número interno */}
            <div className="form-field">
              <label htmlFor="input-interno" className="field-lbl">
                Número interno *
              </label>
              <input
                id="input-interno"
                type="text"
                placeholder="Ej. ECO-015"
                value={numeroInterno}
                onChange={(e) => setNumeroInterno(e.target.value)}
                required
                className="input-custom"
              />
            </div>

            {/* Marca */}
            <div className="form-field">
              <label htmlFor="input-marca" className="field-lbl">
                Marca *
              </label>
              <input
                id="input-marca"
                type="text"
                placeholder="Ej. Hino, Isuzu"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                required
                className="input-custom"
              />
            </div>

            {/* Modelo */}
            <div className="form-field">
              <label htmlFor="input-modelo" className="field-lbl">
                Modelo *
              </label>
              <input
                id="input-modelo"
                type="text"
                placeholder="Ej. 500 Compactador"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                required
                className="input-custom"
              />
            </div>

            {/* Capacidad en toneladas con sufijo 'ton' */}
            <div className="form-field">
              <label htmlFor="input-capacidad" className="field-lbl">
                Capacidad en toneladas *
              </label>
              <div className="input-with-suffix">
                <input
                  id="input-capacidad"
                  type="number"
                  step="0.5"
                  min="1"
                  placeholder="Ej. 12"
                  value={capacidad}
                  onChange={(e) => setCapacidad(e.target.value)}
                  required
                  className="input-custom input-has-suffix"
                />
                <span className="input-suffix">ton</span>
              </div>
            </div>

            {/* Estado operativo (RF-09) */}
            <div className="form-field">
              <label htmlFor="select-estado-op" className="field-lbl">
                Estado operativo *
              </label>
              <div className="select-with-dot-wrap">
                <span
                  className="select-status-dot"
                  style={{
                    backgroundColor:
                      estado === 'disponible'
                        ? '#1E9F67'
                        : estado === 'en_servicio'
                        ? '#12654B'
                        : estado === 'mantenimiento'
                        ? '#F0A727'
                        : '#A2A2A0',
                  }}
                />
                <select
                  id="select-estado-op"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="select-custom"
                >
                  <option value="disponible">Disponible</option>
                  <option value="en_servicio">En servicio</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="fuera_de_servicio">Fuera de servicio</option>
                </select>
                <Icon name="down" size={15} stroke={2} />
              </div>
            </div>

            {/* Botones de acción al final del formulario */}
            <div className="form-card__actions">
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => navigate('/vehiculos')}
              >
                Cancelar
              </button>

              <button type="submit" className="btn-guardar-vehiculo">
                <Icon name="plus" size={18} stroke={2.4} />
                <span>{esEdicion ? 'Guardar Cambios' : 'Registrar vehículo'}</span>
              </button>
            </div>
          </form>
        </section>

        {/* Columna derecha: Tarjeta de foto y Guía de registro */}
        <div className="form-page__sidebar-col">
          {/* Card: Foto real del vehículo */}
          <section className="form-card form-card--photo">
            <div className="photo-card__head">
              <div className="photo-card__icon-wrap">
                <Icon name="camera" size={18} stroke={2} />
              </div>
              <h3 className="photo-card__title">Foto real del vehículo</h3>
            </div>

            {/* Vista previa de la foto (ampliación) y botón Cambiar foto separados */}
            <div className="photo-preview-box">
              <button
                type="button"
                className="photo-preview-trigger zoomable-photo"
                onClick={() => setImagenAmpliada(true)}
                title="Clic para ampliar imagen"
                aria-label="Ampliar vista previa de la foto"
              >
                <img
                  src={fotoPreview}
                  alt="Foto del vehículo"
                  className="photo-preview-img"
                />
                <span className="photo-zoom-badge" aria-hidden="true">
                  <Icon name="search" size={14} stroke={2.3} />
                </span>
              </button>

              <button
                type="button"
                className="btn-cambiar-foto"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="camera" size={15} stroke={2} />
                <span>Cambiar foto</span>
              </button>
            </div>

            {/* Input de archivo oculto fuera del contenedor de vista previa */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              style={{ display: 'none' }}
              onChange={handleCambiarFoto}
            />

            {/* Información del archivo y notas */}
            <div className="photo-file-info">
              <div className="file-name-row">
                <span className="file-name-text">
                  archivo: <strong>{nombreArchivo}</strong> ({tamanoArchivo})
                </span>
                <span className="file-check-badge">✓</span>
              </div>
              <p className="file-hint-text">
                Subir foto real del vehículo que operará en Buenaventura. Formatos JPG, PNG hasta 5MB.
              </p>
            </div>
          </section>

          {/* Card: Guía de registro */}
          <section className="form-card form-card--guide">
            <div className="guide-card__head">
              <div className="guide-card__icon-wrap">
                <Icon name="clipboard" size={18} stroke={2} />
              </div>
              <h3 className="guide-card__title">Guía de registro</h3>
            </div>

            <ul className="guide-list">
              <li className="guide-item">
                <span className="guide-check">✓</span>
                <span>La placa debe ser única y sin duplicados</span>
              </li>
              <li className="guide-item">
                <span className="guide-check">✓</span>
                <span>El vehículo se registrará como Activo por defecto</span>
              </li>
              <li className="guide-item">
                <span className="guide-check">✓</span>
                <span>Podrás editar o desactivar la unidad desde su ficha de detalle</span>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <VisorImagen
        src={imagenAmpliada ? fotoPreview : null}
        titulo={placa ? `${placa.toUpperCase()} · ${nombreArchivo}` : nombreArchivo}
        onClose={() => setImagenAmpliada(false)}
      />
    </div>
  );
}
