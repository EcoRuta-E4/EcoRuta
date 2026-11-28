import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../../components/Icon.jsx';
import VisorImagen from '../../../components/VisorImagen.jsx';
import { getVehiculosLocales, saveVehiculosLocales } from '../../../api/vehiculos.js';
import mapaImg from '../../../assets/mapa-simulacion.png';

const ESTADO_INFO = {
  disponible: {
    label: 'Disponible',
    bg: '#D1FAE5',
    color: '#065F46',
    dot: '#1E9F67',
    desc: 'Lista para asignación de ruta',
  },
  en_servicio: {
    label: 'En servicio',
    bg: '#B1E6CC',
    color: '#0d4d38',
    dot: '#12654B',
    desc: 'Operando en ruta asignada',
  },
  mantenimiento: {
    label: 'Mantenimiento',
    bg: '#FDE09C',
    color: '#7a4d00',
    dot: '#F0A727',
    desc: 'En revisión técnica o taller',
  },
  fuera_de_servicio: {
    label: 'Fuera de servicio',
    bg: '#DDDDDD',
    color: '#494949',
    dot: '#A2A2A0',
    desc: 'No disponible para operación',
  },
};

export default function DetalleVehiculoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehiculos, setVehiculos] = useState(() => getVehiculosLocales());
  const [mensaje, setMensaje] = useState(null);
  const [imagenAmpliada, setImagenAmpliada] = useState(false);

  const vehiculo = vehiculos.find(
    (v) => v.id === id || v.placa.toLowerCase() === (id || '').toLowerCase()
  );

  if (!vehiculo) {
    return (
      <div className="vehiculos-detalle-page">
        <div className="detalle-not-found">
          <Icon name="vehiculos" size={52} stroke={1.4} />
          <h2>Vehículo no encontrado</h2>
          <p>No encontramos ninguna unidad con el identificador "{id}" en el registro.</p>
          <Link to="/vehiculos" className="btn-volver-listado">
            <Icon name="back" size={16} />
            <span>Volver al listado de vehículos</span>
          </Link>
        </div>
      </div>
    );
  }

  const estadoInfo = ESTADO_INFO[vehiculo.estado] || ESTADO_INFO.disponible;
  const estaActivo = vehiculo.activo !== false;

  function handleToggleActivo() {
    if (estaActivo) {
      const confirmar = window.confirm(
        `¿Deseas desactivar el vehículo con placa ${vehiculo.placa}?\n\nDe acuerdo con RF-07, el registro histórico se conservará en la base de datos pero la unidad dejará de estar activa.`
      );
      if (!confirmar) return;
    }

    const nuevoEstadoActivo = !estaActivo;
    const actualizados = vehiculos.map((v) =>
      v.id === vehiculo.id || v.placa === vehiculo.placa
        ? { ...v, activo: nuevoEstadoActivo }
        : v
    );
    setVehiculos(actualizados);
    saveVehiculosLocales(actualizados);
    setMensaje(
      nuevoEstadoActivo
        ? `El vehículo ${vehiculo.placa} fue reactivado correctamente.`
        : `El vehículo ${vehiculo.placa} fue desactivado. Su historial permanece guardado.`
    );
    setTimeout(() => setMensaje(null), 5000);
  }

  return (
    <div className="vehiculos-detalle-page">
      {/* Encabezado superior del módulo */}
      <header className="detalle-topbar">
        <div className="detalle-topbar__left">
          <div className="detalle-topbar__icon">
            <Icon name="vehiculos" size={24} stroke={1.8} />
          </div>
          <div>
            <h1 className="detalle-topbar__module">Vehículos</h1>
            <p className="detalle-topbar__sub">Gestión de Flota · Buenaventura</p>
          </div>
        </div>

        <button type="button" className="btn-bell" aria-label="Notificaciones">
          <Icon name="bell" size={20} stroke={1.8} />
        </button>
      </header>

      {/* Migas de pan */}
      <nav className="form-breadcrumb detalle-breadcrumb" aria-label="Migas de pan">
        <Link to="/dashboard" className="breadcrumb-link">
          <Icon name="home" size={15} />
        </Link>
        <span className="breadcrumb-sep">&gt;</span>
        <Link to="/vehiculos" className="breadcrumb-link">
          Vehículos
        </Link>
        <span className="breadcrumb-sep">&gt;</span>
        <span className="breadcrumb-current">
          Detalle del vehículo <strong>{vehiculo.placa}</strong>
        </span>
      </nav>

      {/* Mensaje de confirmación tras desactivar/reactivar */}
      {mensaje && (
        <div className="vehiculos-toast" role="status">
          <Icon name="check" size={18} stroke={2.4} />
          <span>{mensaje}</span>
        </div>
      )}

      {/* Aviso si el vehículo está desactivado */}
      {!estaActivo && (
        <div className="detalle-inactive-banner" role="alert">
          <Icon name="alert" size={18} />
          <span>
            Este vehículo se encuentra <strong>Desactivado (inactivo)</strong>. Su ficha permanece
            en el histórico del sistema (RF-07) y no aparece en el catálogo operativo.
          </span>
        </div>
      )}

      {/* Contenedor principal de la ficha de consulta */}
      <section className="detalle-sheet">
        {/* Cabecera de la ficha con título y botones Editar / Desactivar */}
        <div className="detalle-sheet__head">
          <div className="detalle-sheet__title-wrap">
            <button
              type="button"
              className="btn-square-back"
              onClick={() => navigate('/vehiculos')}
              aria-label="Volver al listado"
            >
              <Icon name="back" size={18} stroke={2.2} />
            </button>
            <div>
              <h2 className="detalle-sheet__title">
                {vehiculo.placa} · {vehiculo.marca} {vehiculo.modelo}
              </h2>
              <p className="detalle-sheet__subtitle">
                {vehiculo.tipo || 'Compactador'} · N° Interno: {vehiculo.numero_interno || 'Sin asignar'} · Buenaventura
              </p>
            </div>
          </div>

          <div className="detalle-sheet__actions">
            <Link to="/vehiculos" className="btn-volver-catalogo">
              <Icon name="back" size={15} stroke={2} />
              <span>Volver al listado</span>
            </Link>

            <button
              type="button"
              className="btn-editar-detalle"
              onClick={() => navigate(`/vehiculos/${vehiculo.id || vehiculo.placa}/editar`)}
            >
              <Icon name="pencil" size={15} stroke={2} />
              <span>Editar vehículo</span>
            </button>

            <button
              type="button"
              className={estaActivo ? 'btn-desactivar-detalle' : 'btn-reactivar-detalle'}
              onClick={handleToggleActivo}
            >
              <Icon name={estaActivo ? 'trash' : 'check'} size={15} stroke={2} />
              <span>{estaActivo ? 'Desactivar' : 'Reactivar'}</span>
            </button>
          </div>
        </div>

        {/* Cuerpo en dos columnas: Ficha de datos a la izquierda, Mapa/Operación a la derecha */}
        <div className="detalle-sheet__grid">
          {/* Columna izquierda: Foto + Ficha técnica */}
          <div className="detalle-card detalle-card--info">
            <div className="detalle-info-left">
              <button
                type="button"
                className="detalle-photo-stage zoomable-photo"
                onClick={() => setImagenAmpliada(true)}
                title="Clic para ampliar imagen"
                aria-label={`Ampliar foto del vehículo ${vehiculo.placa}`}
              >
                <img
                  src={vehiculo.foto}
                  alt={`Vehículo ${vehiculo.placa}`}
                  className="detalle-photo-img"
                />
                <span className="photo-zoom-badge" aria-hidden="true">
                  <Icon name="search" size={15} stroke={2.2} />
                </span>
              </button>

              <div className="detalle-mini-box">
                <div className="detalle-mini-box__icon">
                  <Icon name="clipboard" size={18} stroke={1.8} />
                </div>
                <div>
                  <span className="detalle-mini-box__label">Número interno</span>
                  <strong className="detalle-mini-box__val">
                    {vehiculo.numero_interno || 'No asignado'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="detalle-info-right">
              {/* Placa única */}
              <div className="detalle-field-card">
                <span className="detalle-field-card__lbl">Placa única:</span>
                <div className="detalle-field-card__val-row">
                  <strong>{vehiculo.placa} (Verificada)</strong>
                  <span className="badge-verified" title="Placa única en base de datos">
                    <Icon name="check" size={12} stroke={3} />
                  </span>
                </div>
              </div>

              {/* Estado operativo (RF-09) */}
              <div className="detalle-field-card">
                <div className="detalle-field-card__inline">
                  <span className="detalle-field-card__lbl">Estado operativo:</span>
                  <span
                    className="truck-pill"
                    style={{ backgroundColor: estadoInfo.bg, color: estadoInfo.color }}
                  >
                    <span className="truck-pill__dot" style={{ backgroundColor: estadoInfo.dot }} />
                    {estadoInfo.label}
                  </span>
                </div>
                <span className="detalle-field-card__sub">{estadoInfo.desc}</span>
              </div>

              {/* Estado en el sistema (activo vs desactivado) */}
              <div className="detalle-field-card">
                <div className="detalle-field-card__inline">
                  <span className="detalle-field-card__lbl">Registro en sistema:</span>
                  <span className={`pill-activo ${estaActivo ? 'is-active' : 'is-inactive'}`}>
                    <span className="truck-pill__dot" />
                    {estaActivo ? 'Activo' : 'Inactivo (Desactivado)'}
                  </span>
                </div>
              </div>

              {/* Capacidad */}
              <div className="detalle-field-card">
                <span className="detalle-field-card__lbl">Capacidad:</span>
                <strong className="detalle-field-card__val">
                  {vehiculo.capacidad_toneladas} toneladas
                </strong>
              </div>

              {/* Marca / Modelo / Tipo */}
              <div className="detalle-field-card">
                <span className="detalle-field-card__lbl">Marca / Modelo:</span>
                <strong className="detalle-field-card__val">
                  {vehiculo.marca} {vehiculo.modelo} · {vehiculo.tipo || 'Compactador'}
                </strong>
              </div>

              {/* Fecha de registro */}
              <div className="detalle-field-card">
                <span className="detalle-field-card__lbl">Fecha de registro:</span>
                <strong className="detalle-field-card__val">
                  {vehiculo.fecha_registro || 'No registrada'}
                </strong>
              </div>
            </div>
          </div>

          {/* Columna derecha: Contexto geográfico / operación */}
          <div className="detalle-card detalle-card--map">
            <div className="detalle-map-box">
              <img src={mapaImg} alt="Mapa de cobertura en Buenaventura" className="detalle-map-img" />
              <div className="detalle-map-badge">
                <span className="truck-pill__dot" style={{ backgroundColor: estadoInfo.dot }} />
                <span>
                  {vehiculo.placa} · {estadoInfo.label}
                </span>
              </div>
            </div>

            <div className="detalle-map-meta">
              <div className="detalle-meta-row">
                <span className="detalle-meta-row__lbl">Jurisdicción:</span>
                <strong className="detalle-meta-row__val">Distrito Especial de Buenaventura</strong>
              </div>
              <div className="detalle-meta-row">
                <span className="detalle-meta-row__lbl">Configuración:</span>
                <strong className="detalle-meta-row__val">
                  {vehiculo.tipo || 'Compactador'} · {vehiculo.capacidad_toneladas} ton
                </strong>
              </div>
              <div className="detalle-meta-row">
                <span className="detalle-meta-row__lbl">Disponibilidad:</span>
                <span className="detalle-meta-status">
                  <span
                    className="truck-pill__dot"
                    style={{ backgroundColor: estaActivo ? '#1E9F67' : '#d92d20' }}
                  />
                  <span>{estaActivo ? 'Habilitado para programación' : 'Deshabilitado'}</span>
                </span>
              </div>
            </div>

            <div className="detalle-map-footer">
              <Link to="/mapa-rutas" className="detalle-map-link">
                Ver en mapa de rutas →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <VisorImagen
        src={imagenAmpliada ? vehiculo.foto : null}
        titulo={`${vehiculo.placa} · ${vehiculo.marca} ${vehiculo.modelo}`}
        onClose={() => setImagenAmpliada(false)}
      />
    </div>
  );
}
