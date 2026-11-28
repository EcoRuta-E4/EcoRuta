import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/Icon.jsx';
import VisorImagen from '../../../components/VisorImagen.jsx';
import { getVehiculosLocales, saveVehiculosLocales } from '../../../api/vehiculos.js';

export default function VehiculosPage() {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState(() => getVehiculosLocales());
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCapacidad, setFiltroCapacidad] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1); // Empieza en la página 1 con datos reales

  // Mensaje de acción reciente (ej. desactivación)
  const [notificacion, setNotificacion] = useState(null);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  // Indicadores de resumen calculados con datos reales de la flota activa
  const indicadores = useMemo(() => {
    const lista = busqueda.trim() || filtroEstado !== 'todos' || filtroTipo !== 'todos' || filtroCapacidad !== 'todos'
      ? vehiculos
      : vehiculos;

    const activos = lista.filter((v) => v.activo !== false);
    return {
      disponibles: activos.filter((v) => v.estado === 'disponible').length,
      en_servicio: activos.filter((v) => v.estado === 'en_servicio').length,
      mantenimiento: activos.filter((v) => v.estado === 'mantenimiento').length,
      fuera_de_servicio: activos.filter((v) => v.estado === 'fuera_de_servicio').length,
      total: activos.length,
    };
  }, [vehiculos, busqueda, filtroEstado, filtroTipo, filtroCapacidad]);

  // Filtrado de vehículos activos
  const vehiculosFiltrados = useMemo(() => {
    return vehiculos.filter((v) => {
      // Distinción entre estado operativo y activo (la papelera desactiva el vehículo sin borrar el registro histórico)
      if (v.activo === false) return false;

      // Filtro de texto (placa, modelo, marca o tipo)
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const textoCompleto = `${v.placa} ${v.numero_interno || ''} ${v.marca || ''} ${v.modelo || ''} ${v.tipo || ''} ${v.encabezado || ''} ${v.subtitulo || ''}`.toLowerCase();
        if (!textoCompleto.includes(q)) return false;
      }

      // Filtro de estado
      if (filtroEstado !== 'todos' && v.estado !== filtroEstado) {
        return false;
      }

      // Filtro de tipo
      if (filtroTipo !== 'todos' && v.tipo !== filtroTipo) {
        return false;
      }

      // Filtro de capacidad
      if (filtroCapacidad !== 'todos') {
        const cap = parseFloat(filtroCapacidad);
        if (v.capacidad_toneladas !== cap) return false;
      }

      return true;
    });
  }, [vehiculos, busqueda, filtroEstado, filtroTipo, filtroCapacidad]);

  // Paginación dinámica (6 tarjetas por página)
  const ITEMS_POR_PAGINA = 6;
  const totalPaginas = Math.ceil(vehiculosFiltrados.length / ITEMS_POR_PAGINA) || 1;
  const vehiculosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return vehiculosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [vehiculosFiltrados, paginaActual]);

  function handleDesactivar(vehiculo) {
    const seguro = window.confirm(
      `¿Deseas desactivar el vehículo con placa ${vehiculo.placa}?\n\nDe acuerdo con RF-07, el vehículo pasará a estado inactivo pero se conservará su registro histórico en la base de datos.`
    );
    if (!seguro) return;

    const listaActualizada = vehiculos.map((v) =>
      v.id === vehiculo.id || v.placa === vehiculo.placa ? { ...v, activo: false } : v
    );
    setVehiculos(listaActualizada);
    saveVehiculosLocales(listaActualizada);
    setNotificacion(`El vehículo ${vehiculo.placa} fue desactivado correctamente conservando su historial.`);
    setTimeout(() => setNotificacion(null), 5000);
  }

  function handleAbrirNuevo() {
    navigate('/vehiculos/nuevo');
  }

  function handleAbrirEditar(vehiculo) {
    navigate(`/vehiculos/${vehiculo.id || vehiculo.placa}/editar`);
  }

  function handleAbrirDetalle(vehiculo) {
    navigate(`/vehiculos/${vehiculo.id || vehiculo.placa}`);
  }

  // Estilos de la píldora de estado
  function getEstadoBadge(estado) {
    switch (estado) {
      case 'en_servicio':
        return {
          label: 'En servicio',
          className: 'pill-en-servicio',
          dotColor: '#12654B',
        };
      case 'mantenimiento':
        return {
          label: 'Mantenimiento',
          className: 'pill-mantenimiento',
          dotColor: '#F0A727',
        };
      case 'fuera_de_servicio':
        return {
          label: 'Fuera de servicio',
          className: 'pill-fuera-servicio',
          dotColor: '#A2A2A0',
        };
      default:
        return {
          label: 'Disponible',
          className: 'pill-disponible',
          dotColor: '#1E9F67',
        };
    }
  }

  return (
    <div className="vehiculos-page">
      {/* Encabezado del módulo */}
      <header className="vehiculos-head">
        <div className="vehiculos-head__text">
          <h1 className="vehiculos-title">Gestión de Vehículos · Buenaventura</h1>
          <p className="vehiculos-subtitle">2 Localidades · 12 Comunas · 104 Barrios</p>
        </div>
        <button type="button" className="btn-registrar" onClick={handleAbrirNuevo}>
          <Icon name="plus" size={18} stroke={2.2} />
          <span>Registrar Vehículo</span>
        </button>
      </header>

      {/* Panel de resumen, búsqueda y filtros */}
      <section className="vehiculos-panel" aria-label="Filtros y resumen de flota">
        {/* Indicadores compactos a la izquierda (2x2) */}
        <div className="vehiculos-kpis">
          <div className="kpi-item">
            <span className="kpi-dot" style={{ backgroundColor: '#1E9F67' }} />
            <span className="kpi-text">{indicadores.disponibles} Disponibles</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-dot" style={{ backgroundColor: '#12654B' }} />
            <span className="kpi-text">{indicadores.en_servicio} En servicio</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-dot" style={{ backgroundColor: '#F0A727' }} />
            <span className="kpi-text">{indicadores.mantenimiento} Mantenimiento</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-dot" style={{ backgroundColor: '#A2A2A0' }} />
            <span className="kpi-text">{indicadores.fuera_de_servicio} Fuera de servicio</span>
          </div>
        </div>

        {/* Fila de controles a la derecha */}
        <div className="vehiculos-controls">
          {/* Buscador */}
          <div className="search-box">
            <Icon name="search" size={17} />
            <input
              type="text"
              placeholder="Buscar por placa, modelo o tipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar vehículos"
            />
          </div>

          {/* Selector 1: Estado */}
          <div className="filter-select-wrap select-estado">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="todos">Estado: Todos</option>
              <option value="en_servicio">En servicio</option>
              <option value="disponible">Disponible</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="fuera_de_servicio">Fuera de servicio</option>
            </select>
            <Icon name="down" size={14} stroke={2} />
          </div>

          {/* Selector 2: Tipo */}
          <div className="filter-select-wrap select-tipo">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              aria-label="Filtrar por tipo"
            >
              <option value="todos">Tipo: Todos</option>
              <option value="Compactador">Compactador</option>
              <option value="Volqueta Recolectora">Volqueta Recolectora</option>
              <option value="Camión Recolector">Camión Recolector</option>
            </select>
            <Icon name="down" size={14} stroke={2} />
          </div>

          {/* Selector 3: Capacidad */}
          <div className="filter-select-wrap select-capacidad">
            <select
              value={filtroCapacidad}
              onChange={(e) => setFiltroCapacidad(e.target.value)}
              aria-label="Filtrar por capacidad"
            >
              <option value="todos">Capacidad: Todos</option>
              <option value="8">8 ton</option>
              <option value="10">10 ton</option>
              <option value="12">12 ton</option>
            </select>
            <Icon name="down" size={14} stroke={2} />
          </div>
        </div>
      </section>

      {/* Notificación de acción */}
      {notificacion && (
        <div className="vehiculos-toast" role="status">
          <Icon name="check" size={18} stroke={2.5} />
          <span>{notificacion}</span>
        </div>
      )}

      {/* Cuadrícula de tarjetas (3 columnas x 2 filas) */}
      <section className="vehiculos-grid" aria-label="Listado de vehículos">
        {vehiculosPaginados.length === 0 ? (
          <div className="vehiculos-empty">
            <Icon name="vehiculos" size={48} stroke={1.4} />
            <p>No se encontraron vehículos con los filtros seleccionados.</p>
            <button
              type="button"
              className="btn-limpiar"
              onClick={() => {
                setBusqueda('');
                setFiltroEstado('todos');
                setFiltroTipo('todos');
                setFiltroCapacidad('todos');
              }}
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          vehiculosPaginados.map((v) => {
            const badge = getEstadoBadge(v.estado);
            return (
              <article key={v.id} className="truck-card">
                <div className="truck-card__top">
                  {/* Foto a la izquierda (165 x 110 px) */}
                  <button
                    type="button"
                    className="truck-card__photo-wrap zoomable-photo"
                    onClick={() =>
                      setImagenAmpliada({
                        src: v.foto,
                        titulo: `${v.placa} · ${v.marca || ''} ${v.modelo || ''}`.trim(),
                      })
                    }
                    title="Clic para ampliar imagen"
                    aria-label={`Ampliar foto del vehículo ${v.placa}`}
                  >
                    <img
                      src={v.foto}
                      alt={`Vehículo ${v.placa}`}
                      className="truck-card__photo"
                      loading="lazy"
                    />
                    <span className="photo-zoom-badge" aria-hidden="true">
                      <Icon name="search" size={13} stroke={2.4} />
                    </span>
                  </button>

                  {/* Ficha de datos a la derecha */}
                  <div className="truck-card__info">
                    <div className="truck-card__heading">
                      <strong className="truck-card__title">{v.encabezado}</strong>
                      {v.subtitulo && <span className="truck-card__subtitle">{v.subtitulo}</span>}
                    </div>

                    {/* Píldora de estado */}
                    <div className="truck-card__badge-row">
                      <span className={`truck-pill ${badge.className}`}>
                        <span className="truck-pill__dot" style={{ backgroundColor: badge.dotColor }} />
                        {badge.label}
                      </span>
                    </div>

                    {/* Líneas inferiores de capacidad y registro */}
                    <div className="truck-card__meta">
                      <div className="meta-line">
                        {v.tiene_icono_peso && <Icon name="weight" size={14} />}
                        <span>{v.linea1}</span>
                      </div>
                      <div className="meta-line">
                        {v.tiene_icono_fecha && <Icon name="calendar" size={14} />}
                        <span>{v.linea2}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones en el pie de la tarjeta */}
                <div className="truck-card__actions">
                  <button
                    type="button"
                    className="btn-detalles"
                    onClick={() => handleAbrirDetalle(v)}
                    aria-label={`Ver detalles del vehículo ${v.placa}`}
                  >
                    <Icon name="eye" size={16} stroke={1.8} />
                    <span>Ver detalles</span>
                  </button>

                  <button
                    type="button"
                    className="btn-accion btn-accion--edit"
                    onClick={() => handleAbrirEditar(v)}
                    title="Editar vehículo"
                    aria-label={`Editar vehículo ${v.placa}`}
                  >
                    <Icon name="pencil" size={15} stroke={2} />
                  </button>

                  <button
                    type="button"
                    className="btn-accion btn-accion--delete"
                    onClick={() => handleDesactivar(v)}
                    title="Desactivar vehículo"
                    aria-label={`Desactivar vehículo ${v.placa}`}
                  >
                    <Icon name="trash" size={15} stroke={2} />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Paginación dinámica alineada con el borde derecho */}
      <footer className="vehiculos-pagination">
        <button
          type="button"
          className={`pag-btn pag-btn--nav ${paginaActual === 1 ? 'pag-btn--disabled' : ''}`}
          disabled={paginaActual === 1}
          onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
          aria-label="Página anterior"
        >
          <Icon name="chevronLeft" size={16} stroke={2.2} />
        </button>

        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            type="button"
            className={`pag-btn pag-btn--num ${paginaActual === num ? 'is-active' : ''}`}
            onClick={() => setPaginaActual(num)}
            aria-label={`Página ${num}`}
            aria-current={paginaActual === num ? 'page' : undefined}
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          className={`pag-btn pag-btn--nav ${paginaActual === totalPaginas ? 'pag-btn--disabled' : ''}`}
          disabled={paginaActual === totalPaginas}
          onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
          aria-label="Página siguiente"
        >
          <Icon name="chevronRight" size={16} stroke={2.2} />
        </button>
      </footer>

      <VisorImagen
        src={imagenAmpliada?.src}
        titulo={imagenAmpliada?.titulo}
        onClose={() => setImagenAmpliada(null)}
      />
    </div>
  );
}
