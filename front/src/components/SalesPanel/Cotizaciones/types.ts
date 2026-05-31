export type CotizacionEstado = 'pendiente' | 'aprobada' | 'rechazada' | 'expirada' | 'revision';

export interface CotizacionItem {
  id: string;
  cotizacionId: string;
  producto: string;
  descripcion: string | null;
  cantidad: number;
  precioUnit: number;
  descuento: number;
  total: number;
}

export interface CotizacionActividad {
  id: string;
  cotizacionId: string;
  tipo: string;
  descripcion: string;
  usuario: string | null;
  fecha: string;
}

export interface Cotizacion {
  id: string;
  codigo: string;
  clienteId: number | null;
  clienteNombre: string;
  clienteEmail: string;
  clientePhone: string | null;
  clienteCompany: string | null;
  vendedorId: number | null;
  vendedorNombre: string | null;
  fecha: string;
  vencimiento: string;
  estado: string;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  notas: string | null;
  terminos: string | null;
  metodoPago: string | null;
  createdAt: string;
  updatedAt: string;
  items: CotizacionItem[];
  actividad: CotizacionActividad[];
  origen?: string;
}

export interface CotizacionStats {
  total: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  expiradas: number;
  ingresosProyectados: number;
  conversionRate: number;
  esteMes: number;
}

export interface CotizacionFormData {
  clienteNombre: string;
  clienteEmail: string;
  clientePhone?: string;
  clienteCompany?: string;
  vencimiento: string;
  notas?: string;
  terminos?: string;
  metodoPago?: string;
  descuento?: number;
  impuesto?: number;
  items: {
    producto: string;
    descripcion?: string;
    cantidad: number;
    precioUnit: number;
    descuento?: number;
  }[];
}

export type SortField = 'codigo' | 'clienteNombre' | 'fecha' | 'vencimiento' | 'estado' | 'total';
export type SortDir = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  dir: SortDir;
}

export type FilterPreset = 'todas' | 'pendiente' | 'aprobada' | 'rechazada' | 'expirada' | 'revision';
