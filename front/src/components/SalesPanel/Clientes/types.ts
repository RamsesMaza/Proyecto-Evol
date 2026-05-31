export type ClienteStatus = 'activo' | 'inactivo' | 'nuevo' | 'frecuente';
export type ActivityType = 'compra' | 'cotizacion' | 'mensaje' | 'llamada' | 'reunion' | 'nota';
export type CotizacionStatus = 'pendiente' | 'aprobada' | 'rechazada' | 'convertida';

export interface Cliente {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  address: string;
  status: ClienteStatus;
  tags: string[];
  notes: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  totalCompras: number;
  totalGastado: number;
  ultimaCompra: string | null;
  activity: Actividad[];
  cotizaciones: Cotizacion[];
  notas: Nota[];
}

export interface Actividad {
  id: string;
  type: ActivityType;
  description: string;
  date: string;
  amount?: number;
}

export interface Cotizacion {
  id: string;
  date: string;
  amount: number;
  status: CotizacionStatus;
  items: number;
  description: string;
}

export interface Nota {
  id: string;
  content: string;
  date: string;
  author: string;
}

export interface ClienteFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  address: string;
  status: ClienteStatus;
  notes: string;
  tags: string[];
}

export interface ClienteStats {
  total: number;
  activos: number;
  nuevosEsteMes: number;
  frecuentes: number;
  conversionRate: number;
}

export type SortField = 'firstName' | 'lastName' | 'email' | 'company' | 'status' | 'createdAt' | 'totalGastado' | 'ultimaCompra';
export type SortDir = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  dir: SortDir;
}

export type FilterPreset = 'todos' | 'activos' | 'inactivos' | 'nuevos' | 'frecuentes';
