import lfl420 from '../assets/camiones/lfl-420.png';
import lfl420Real from '../assets/camiones/lfl-420-real.jpg';
import eko208 from '../assets/camiones/eko-208.png';
import bvn315 from '../assets/camiones/bvn-315.png';
import eko104 from '../assets/camiones/eko-104.png';
import bma092 from '../assets/camiones/bma-092.png';
import lfl535 from '../assets/camiones/lfl-535.png';
import { apiFetch } from './client.js';

export const FOTO_DEFECTO_REAL = lfl420Real;

export const VEHICULOS_DEMO = [
  {
    id: 'lfl-420',
    placa: 'LFL-420',
    numero_interno: 'ECO-015',
    marca: 'Hino',
    modelo: '500',
    tipo: 'Compactador',
    capacidad_toneladas: 12,
    estado: 'en_servicio',
    activo: true,
    encabezado: 'LFL-420 · Hino 500',
    subtitulo: 'Compactador',
    linea1: '12 ton - Compactador',
    linea2: '12 ton',
    tiene_icono_peso: false,
    tiene_icono_fecha: false,
    fecha_registro: '15/01/2024',
    foto: lfl420Real || lfl420,
    nombre_archivo: 'LFL-420-real.jpg',
    tamano_archivo: '1.8 MB',
  },
  {
    id: 'eko-208',
    placa: 'EKO-208',
    numero_interno: 'ECO-016',
    marca: 'Isuzu',
    modelo: 'FVR',
    tipo: 'Compactador',
    capacidad_toneladas: 10,
    estado: 'en_servicio',
    activo: true,
    encabezado: 'EKO-208 · Isuzu FVR',
    subtitulo: 'Compactador',
    linea1: '10 ton - Compactador',
    linea2: '10 ton',
    tiene_icono_peso: false,
    tiene_icono_fecha: false,
    fecha_registro: '20/02/2024',
    foto: eko208,
    nombre_archivo: 'EKO-208.png',
    tamano_archivo: '1.2 MB',
  },
  {
    id: 'bvn-315',
    placa: 'BVN-315',
    numero_interno: 'ECO-017',
    marca: 'Volqueta',
    modelo: 'Recolectora',
    tipo: 'Volqueta Recolectora',
    capacidad_toneladas: 8,
    estado: 'en_servicio',
    activo: true,
    encabezado: 'BVN-315 · Volqueta',
    subtitulo: 'Recolectora',
    linea1: '8 ton - Compactador',
    linea2: '8 ton',
    tiene_icono_peso: false,
    tiene_icono_fecha: false,
    fecha_registro: '10/03/2024',
    foto: bvn315,
    nombre_archivo: 'BVN-315.png',
    tamano_archivo: '1.4 MB',
  },
  {
    id: 'eko-104',
    placa: 'EKO-104',
    numero_interno: 'C-01',
    marca: 'Hino',
    modelo: '500 Compactador',
    tipo: 'Compactador',
    capacidad_toneladas: 12,
    estado: 'en_servicio',
    activo: true,
    encabezado: 'EKO-104 ·',
    subtitulo: 'Hino 500 Compactador',
    linea1: '12 ton - Compactador',
    linea2: 'Registro: 18/04/2024',
    tiene_icono_peso: true,
    tiene_icono_fecha: true,
    fecha_registro: '18/04/2024',
    foto: eko104,
    nombre_archivo: 'EKO-104.png',
    tamano_archivo: '1.5 MB',
  },
  {
    id: 'bma-092',
    placa: 'BMA-092',
    numero_interno: 'C-02',
    marca: 'Camión',
    modelo: 'Recolector',
    tipo: 'Camión Recolector',
    capacidad_toneladas: 8,
    estado: 'mantenimiento',
    activo: true,
    encabezado: 'BMA-092 ·',
    subtitulo: 'Camión Recolector',
    linea1: '8 ton',
    linea2: 'Registro: 28/03/2024',
    tiene_icono_peso: true,
    tiene_icono_fecha: true,
    fecha_registro: '28/03/2024',
    foto: bma092,
    nombre_archivo: 'BMA-092.png',
    tamano_archivo: '1.3 MB',
  },
  {
    id: 'lfl-535',
    placa: 'LFL-535',
    numero_interno: 'C-03',
    marca: 'Hino',
    modelo: '500 Compactador',
    tipo: 'Compactador',
    capacidad_toneladas: 12,
    estado: 'fuera_de_servicio',
    activo: true,
    encabezado: 'LFL-535 ·',
    subtitulo: 'Hino 500 Compactador',
    linea1: '12 ton',
    linea2: 'Registro: 05/12/2024',
    tiene_icono_peso: true,
    tiene_icono_fecha: true,
    fecha_registro: '05/12/2024',
    foto: lfl535,
    nombre_archivo: 'LFL-535.png',
    tamano_archivo: '1.6 MB',
  },
];

const STORAGE_KEY = 'ecoruta_vehiculos';

export function getVehiculosLocales() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(VEHICULOS_DEMO));
      return VEHICULOS_DEMO;
    }
    const parsed = JSON.parse(raw);
    return parsed.map((item) => {
      const demoMatch = VEHICULOS_DEMO.find((d) => d.id === item.id || d.placa === item.placa);
      return {
        ...item,
        foto: item.foto || (demoMatch ? demoMatch.foto : eko104),
      };
    });
  } catch {
    return VEHICULOS_DEMO;
  }
}

export function saveVehiculosLocales(lista) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch (err) {
    console.error('Error al guardar vehículos en almacenamiento local:', err);
  }
}

/**
 * Consulta la lista de vehículos (intenta la API de backend, si no existe usa almacenamiento local/demo).
 */
export async function fetchVehiculos() {
  try {
    const res = await apiFetch('/api/admin/vehiculos');
    if (res && (res.datos || res.data)) {
      return res.datos || res.data;
    }
  } catch {
    // Si la API aún no está desplegada en el backend, se trabaja con los datos demostrativos
  }
  return getVehiculosLocales();
}
