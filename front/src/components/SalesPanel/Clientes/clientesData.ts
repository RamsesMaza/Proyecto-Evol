import type { Cliente, ClienteFormData, ClienteStats, FilterPreset } from './types';

const now = new Date();
const d = (daysAgo: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const initialClientes: Cliente[] = [
  {
    id: '1', firstName: 'Carlos', lastName: 'Gutiérrez', email: 'carlos.gutierrez@techcorp.pe', phone: '+51 999 888 777', company: 'TechCorp Perú', position: 'CEO', address: 'Av. La Marina 1234, San Miguel, Lima', status: 'frecuente', tags: ['premium', 'tecnología'], notes: 'Cliente VIP con varios proyectos activos.', isFavorite: true, createdAt: d(180), updatedAt: d(2), totalCompras: 12, totalGastado: 48500, ultimaCompra: d(5),
    activity: [
      { id: 'a1', type: 'compra', description: 'Compra de licencia Enterprise Anual', date: d(5), amount: 12000 },
      { id: 'a2', type: 'cotizacion', description: 'Solicitó cotización para módulo adicional', date: d(3) },
      { id: 'a3', type: 'reunion', description: 'Reunión de seguimiento mensual', date: d(7) },
      { id: 'a4', type: 'mensaje', description: 'Consultó sobre actualización de sistema', date: d(1) },
    ],
    cotizaciones: [
      { id: 'c1', date: d(10), amount: 8500, status: 'aprobada', items: 3, description: 'Módulo de Reporting Avanzado' },
      { id: 'c2', date: d(3), amount: 15000, status: 'pendiente', items: 5, description: 'Integración ERP Completa' },
    ],
    notas: [
      { id: 'n1', content: 'Prefiere comunicación vía WhatsApp. Llamar solo en emergencias.', date: d(60), author: 'Asesor' },
      { id: 'n2', content: 'Interesado en renovar contrato anual con descuento por fidelidad.', date: d(15), author: 'Asesor' },
    ],
  },
  {
    id: '2', firstName: 'María', lastName: 'Fernández', email: 'maria.f@consultgroup.pe', phone: '+51 988 777 666', company: 'ConsultGroup SAC', position: 'Directora de Operaciones', address: 'Calle Las Flores 456, Miraflores, Lima', status: 'activo', tags: ['consultoría'], notes: '', isFavorite: false, createdAt: d(120), updatedAt: d(10), totalCompras: 5, totalGastado: 22300, ultimaCompra: d(30),
    activity: [
      { id: 'a5', type: 'compra', description: 'Paquete Consultoría Básico', date: d(30), amount: 4500 },
      { id: 'a6', type: 'llamada', description: 'Llamada de seguimiento post-venta', date: d(15) },
    ],
    cotizaciones: [
      { id: 'c3', date: d(20), amount: 3200, status: 'convertida', items: 2, description: 'Taller de Capacitación' },
    ],
    notas: [],
  },
  {
    id: '3', firstName: 'Juan', lastName: 'Paredes', email: 'jparedes@innovate.pe', phone: '+51 977 666 555', company: 'Innovate Tech', position: 'CTO', address: 'Av. Principal 789, Surco, Lima', status: 'activo', tags: ['tecnología', 'startup'], notes: 'Startup en crecimiento con alto potencial.', isFavorite: true, createdAt: d(90), updatedAt: d(5), totalCompras: 3, totalGastado: 8900, ultimaCompra: d(45),
    activity: [
      { id: 'a7', type: 'compra', description: 'Suscripción Startup Pack', date: d(45), amount: 2900 },
      { id: 'a8', type: 'reunion', description: 'Demo de producto para su equipo', date: d(20) },
    ],
    cotizaciones: [
      { id: 'c4', date: d(10), amount: 6000, status: 'pendiente', items: 4, description: 'Plan Escalable Anual' },
    ],
    notas: [
      { id: 'n3', content: 'Muy técnico. Enviar documentación detallada siempre.', date: d(30), author: 'Asesor' },
    ],
  },
  {
    id: '4', firstName: 'Ana', lastName: 'López', email: 'ana.lopez@soluciones.pe', phone: '+51 966 555 444', company: 'Soluciones Integrales EIRL', position: 'Gerente General', address: 'Jr. Las Dalias 234, San Isidro, Lima', status: 'nuevo', tags: ['servicios'], notes: 'Cliente potencial grande. Requiere seguimiento semanal.', isFavorite: true, createdAt: d(15), updatedAt: d(1), totalCompras: 1, totalGastado: 1500, ultimaCompra: d(10),
    activity: [
      { id: 'a9', type: 'compra', description: 'Paquete Inicial', date: d(10), amount: 1500 },
      { id: 'a10', type: 'cotizacion', description: 'Solicitó cotización de plan completo', date: d(5) },
    ],
    cotizaciones: [
      { id: 'c5', date: d(5), amount: 12000, status: 'pendiente', items: 8, description: 'Plan Corporativo Completo' },
    ],
    notas: [],
  },
  {
    id: '5', firstName: 'Roberto', lastName: 'Mendoza', email: 'rmendoza@datawise.pe', phone: '+51 955 444 333', company: 'DataWise Analytics', position: 'Analista Senior', address: 'Av. Del Pinar 567, La Molina, Lima', status: 'inactivo', tags: ['analítica'], notes: 'Dejó de responder. Intentar contacto nuevamente.', isFavorite: false, createdAt: d(200), updatedAt: d(90), totalCompras: 2, totalGastado: 3400, ultimaCompra: d(120),
    activity: [
      { id: 'a11', type: 'compra', description: 'Licencia Basic 6 meses', date: d(120), amount: 1700 },
    ],
    cotizaciones: [],
    notas: [
      { id: 'n4', content: 'Último contacto hace 3 meses. Enviar email de reactivación.', date: d(90), author: 'Asesor' },
    ],
  },
  {
    id: '6', firstName: 'Laura', lastName: 'Castillo', email: 'lcastillo@crece.pe', phone: '+51 944 333 222', company: 'Crece Consultores', position: 'Consultora Líder', address: 'Calle Los Olivos 890, San Borja, Lima', status: 'activo', tags: ['consultoría', 'premium'], notes: '', isFavorite: false, createdAt: d(75), updatedAt: d(8), totalCompras: 4, totalGastado: 15600, ultimaCompra: d(15),
    activity: [
      { id: 'a12', type: 'compra', description: 'Plan Consultoría Premium', date: d(15), amount: 8000 },
      { id: 'a13', type: 'llamada', description: 'Llamada de satisfacción', date: d(8) },
    ],
    cotizaciones: [
      { id: 'c6', date: d(12), amount: 4500, status: 'aprobada', items: 3, description: 'Módulo de Gestión' },
    ],
    notas: [],
  },
  {
    id: '7', firstName: 'Diego', lastName: 'Ramírez', email: 'dramirez@nexus.pe', phone: '+51 933 222 111', company: 'Nexus Corp', position: 'Gerente de TI', address: 'Av. La Encalada 345, Santiago de Surco, Lima', status: 'frecuente', tags: ['corporativo', 'tecnología'], notes: 'Cliente estratégico. Contrato anual vigente.', isFavorite: true, createdAt: d(365), updatedAt: d(3), totalCompras: 18, totalGastado: 92300, ultimaCompra: d(2),
    activity: [
      { id: 'a14', type: 'compra', description: 'Renovación Contrato Anual Enterprise', date: d(2), amount: 24000 },
      { id: 'a15', type: 'cotizacion', description: 'Solicitó add-on de seguridad', date: d(5) },
      { id: 'a16', type: 'reunion', description: 'Revisión trimestral de resultados', date: d(10) },
    ],
    cotizaciones: [
      { id: 'c7', date: d(5), amount: 7500, status: 'pendiente', items: 2, description: 'Add-on Seguridad Avanzada' },
    ],
    notas: [
      { id: 'n5', content: 'Siempre pide factura electrónica con RUC específico.', date: d(100), author: 'Asesor' },
      { id: 'n6', content: 'Sugirió mejorar el módulo de reportes. Pasar a desarrollo.', date: d(30), author: 'Asesor' },
    ],
  },
  {
    id: '8', firstName: 'Carmen', lastName: 'Salazar', email: 'csalazar@globalex.pe', phone: '+51 922 111 000', company: 'GlobalEx Perú', position: 'Jefa de Operaciones', address: 'Av. Javier Prado 2345, San Isidro, Lima', status: 'activo', tags: ['logística'], notes: '', isFavorite: false, createdAt: d(60), updatedAt: d(12), totalCompras: 3, totalGastado: 7800, ultimaCompra: d(25),
    activity: [
      { id: 'a17', type: 'compra', description: 'Suscripción Anual', date: d(25), amount: 3600 },
    ],
    cotizaciones: [
      { id: 'c8', date: d(15), amount: 2800, status: 'convertida', items: 2, description: 'Módulo Tracking' },
    ],
    notas: [],
  },
  {
    id: '9', firstName: 'Pedro', lastName: 'Sánchez', email: 'psanchez@buildcorp.pe', phone: '+51 911 000 999', company: 'BuildCorp SAC', position: 'Arquitecto Principal', address: 'Jr. Los Pinos 678, Jesús María, Lima', status: 'nuevo', tags: ['construcción'], notes: 'Recomendado por cliente existente.', isFavorite: false, createdAt: d(8), updatedAt: d(0), totalCompras: 0, totalGastado: 0, ultimaCompra: null,
    activity: [
      { id: 'a18', type: 'cotizacion', description: 'Primer contacto. Solicita cotización.', date: d(5) },
      { id: 'a19', type: 'llamada', description: 'Llamada de introducción realizada', date: d(3) },
    ],
    cotizaciones: [
      { id: 'c9', date: d(5), amount: 9500, status: 'pendiente', items: 6, description: 'Plan Constructora' },
    ],
    notas: [
      { id: 'n7', content: 'Recomendado por Carlos Gutiérrez (TechCorp). Dar tratamiento VIP.', date: d(5), author: 'Asesor' },
    ],
  },
  {
    id: '10', firstName: 'Sofía', lastName: 'Torres', email: 'storres@eduplus.pe', phone: '+51 900 888 777', company: 'EduPlus Instituto', position: 'Directora Académica', address: 'Av. Universitaria 123, Los Olivos, Lima', status: 'activo', tags: ['educación'], notes: 'Proyecto de digitalización institucional.', isFavorite: false, createdAt: d(45), updatedAt: d(6), totalCompras: 2, totalGastado: 4200, ultimaCompra: d(20),
    activity: [
      { id: 'a20', type: 'compra', description: 'Plataforma Educativa Básica', date: d(20), amount: 2800 },
    ],
    cotizaciones: [
      { id: 'c10', date: d(10), amount: 3600, status: 'aprobada', items: 3, description: 'Módulo Evaluaciones' },
    ],
    notas: [],
  },
  {
    id: '11', firstName: 'Luis', lastName: 'Herrera', email: 'lherrera@finanzas.pe', phone: '+51 989 777 666', company: 'Finanzas Corporativas SAC', position: 'CFO', address: 'Av. Salaverry 890, Jesús María, Lima', status: 'inactivo', tags: ['finanzas'], notes: '', isFavorite: false, createdAt: d(300), updatedAt: d(150), totalCompras: 1, totalGastado: 1200, ultimaCompra: d(180),
    activity: [],
    cotizaciones: [],
    notas: [
      { id: 'n8', content: 'Cliente perdido por falta de seguimiento.', date: d(150), author: 'Asesor' },
    ],
  },
  {
    id: '12', firstName: 'Valeria', lastName: 'Ríos', email: 'vrios@saludtotal.pe', phone: '+51 978 666 555', company: 'SaludTotal EIRL', position: 'Administradora', address: 'Calle Los Claveles 456, Surquillo, Lima', status: 'nuevo', tags: ['salud'], notes: 'Requiere explicación detallada del producto.', isFavorite: true, createdAt: d(5), updatedAt: d(0), totalCompras: 0, totalGastado: 0, ultimaCompra: null,
    activity: [
      { id: 'a21', type: 'mensaje', description: 'Solicitó información por WhatsApp', date: d(3) },
      { id: 'a22', type: 'reunion', description: 'Agendada demo para próxima semana', date: d(0) },
    ],
    cotizaciones: [],
    notas: [],
  },
  {
    id: '13', firstName: 'Miguel', lastName: 'Ángeles', email: 'mangeles@soltek.pe', phone: '+51 967 555 444', company: 'SolTek Solutions', position: 'Ingeniero de Sistemas', address: 'Av. Los Ingenieros 789, La Molina, Lima', status: 'activo', tags: ['tecnología', 'soporte'], notes: '', isFavorite: false, createdAt: d(100), updatedAt: d(20), totalCompras: 6, totalGastado: 18900, ultimaCompra: d(18),
    activity: [
      { id: 'a23', type: 'compra', description: 'Soporte Técnico Premium + Licencias', date: d(18), amount: 4500 },
    ],
    cotizaciones: [
      { id: 'c11', date: d(12), amount: 3200, status: 'pendiente', items: 2, description: 'Actualización de Servidores' },
    ],
    notas: [],
  },
  {
    id: '14', firstName: 'Gabriela', lastName: 'Paz', email: 'gpaz@creartive.pe', phone: '+51 956 444 333', company: 'Creartive Agency', position: 'Directora Creativa', address: 'Calle Bellavista 234, Barranco, Lima', status: 'activo', tags: ['diseño', 'marketing'], notes: 'Agencia con varios clientes. Potencial de expansión.', isFavorite: false, createdAt: d(80), updatedAt: d(4), totalCompras: 4, totalGastado: 11200, ultimaCompra: d(10),
    activity: [
      { id: 'a24', type: 'compra', description: 'Suite Creativa Completa', date: d(10), amount: 4800 },
      { id: 'a25', type: 'mensaje', description: 'Preguntó por integración con Canva', date: d(2) },
    ],
    cotizaciones: [
      { id: 'c12', date: d(8), amount: 2200, status: 'convertida', items: 1, description: 'Plugin de Automatización' },
    ],
    notas: [],
  },
  {
    id: '15', firstName: 'Fernando', lastName: 'Quispe', email: 'fquispe@agroindustria.pe', phone: '+51 945 333 222', company: 'AgroIndustrias del Sur', position: 'Gerente de Producción', address: 'Carretera Central Km 45, Huarochirí, Lima', status: 'nuevo', tags: ['agroindustria'], notes: 'Cliente de provincia con necesidades específicas.', isFavorite: false, createdAt: d(3), updatedAt: d(0), totalCompras: 0, totalGastado: 0, ultimaCompra: null,
    activity: [
      { id: 'a26', type: 'llamada', description: 'Primer contacto telefónico. Interesado en sistema de tracking.', date: d(2) },
    ],
    cotizaciones: [],
    notas: [],
  },
  {
    id: '16', firstName: 'Patricia', lastName: 'Vega', email: 'pvega@hotelera.pe', phone: '+51 934 222 111', company: 'Hotelera del Pacífico', position: 'Gerente de Reservas', address: 'Malecón Cisneros 567, Miraflores, Lima', status: 'activo', tags: ['hotelería', 'turismo'], notes: 'Cadena de 3 hoteles. Implementación por fases.', isFavorite: true, createdAt: d(70), updatedAt: d(7), totalCompras: 3, totalGastado: 28500, ultimaCompra: d(12),
    activity: [
      { id: 'a27', type: 'compra', description: 'Sistema de Gestión Hotelera - Fase 1', date: d(12), amount: 15000 },
      { id: 'a28', type: 'reunion', description: 'Reunión para planificar Fase 2', date: d(6) },
    ],
    cotizaciones: [
      { id: 'c13', date: d(6), amount: 18000, status: 'pendiente', items: 6, description: 'Sistema de Gestión Hotelera - Fase 2' },
    ],
    notas: [
      { id: 'n9', content: 'Solicita reports consolidados de los 3 hoteles.', date: d(30), author: 'Asesor' },
    ],
  },
  {
    id: '17', firstName: 'Andrés', lastName: 'Núñez', email: 'anunez@translog.pe', phone: '+51 923 111 000', company: 'TransLog Perú', position: 'Jefe de Flota', address: 'Av. Argentina 1234, Callao, Lima', status: 'inactivo', tags: ['logística', 'transporte'], notes: '', isFavorite: false, createdAt: d(250), updatedAt: d(100), totalCompras: 2, totalGastado: 5600, ultimaCompra: d(150),
    activity: [],
    cotizaciones: [],
    notas: [],
  },
  {
    id: '18', firstName: 'Rosa', lastName: 'Márquez', email: 'rmarquez@biztech.pe', phone: '+51 912 000 999', company: 'BizTech Solutions', position: 'Gerente de Marketing', address: 'Av. Canaval y Moreyra 678, San Isidro, Lima', status: 'activo', tags: ['marketing', 'tecnología'], notes: 'Empresa en expansión. Evaluando planes superiores.', isFavorite: false, createdAt: d(50), updatedAt: d(9), totalCompras: 2, totalGastado: 5800, ultimaCompra: d(22),
    activity: [
      { id: 'a29', type: 'compra', description: 'Herramienta de Automatización Marketing', date: d(22), amount: 3200 },
    ],
    cotizaciones: [
      { id: 'c14', date: d(14), amount: 4500, status: 'pendiente', items: 3, description: 'Módulo de Analytics Avanzado' },
    ],
    notas: [],
  },
  {
    id: '19', firstName: 'Oscar', lastName: 'Delgado', email: 'odelgado@legalcorp.pe', phone: '+51 901 888 777', company: 'LegalCorp Abogados', position: 'Socio Fundador', address: 'Jr. Las Letras 345, San Isidro, Lima', status: 'nuevo', tags: ['legal'], notes: 'Bufete de abogados. Buscan digitalizar expedientes.', isFavorite: false, createdAt: d(6), updatedAt: d(0), totalCompras: 0, totalGastado: 0, ultimaCompra: null,
    activity: [
      { id: 'a30', type: 'cotizacion', description: 'Solicitó cotización para sistema de gestión documental', date: d(4) },
      { id: 'a31', type: 'reunion', description: 'Demo programada', date: d(1) },
    ],
    cotizaciones: [
      { id: 'c15', date: d(4), amount: 14000, status: 'pendiente', items: 5, description: 'Sistema Gestión Documental Legal' },
    ],
    notas: [
      { id: 'n10', content: 'Requiere firma digital y cumplimiento normativo.', date: d(3), author: 'Asesor' },
    ],
  },
  {
    id: '20', firstName: 'Mónica', lastName: 'Barrios', email: 'mbarrios@greenenergy.pe', phone: '+51 990 777 666', company: 'GreenEnergy Perú', position: 'CEO', address: 'Av. Los Forestales 789, La Molina, Lima', status: 'frecuente', tags: ['energía', 'sostenibilidad', 'premium'], notes: 'Empresa sostenible. Usa nuestros servicios para toda su operación.', isFavorite: true, createdAt: d(240), updatedAt: d(1), totalCompras: 15, totalGastado: 67800, ultimaCompra: d(5),
    activity: [
      { id: 'a32', type: 'compra', description: 'Suite Corporativa Anual', date: d(5), amount: 18000 },
      { id: 'a33', type: 'cotizacion', description: 'Interesada en nuevo módulo de sostenibilidad', date: d(3) },
      { id: 'a34', type: 'mensaje', description: 'Envió feedback sobre última actualización', date: d(1) },
    ],
    cotizaciones: [
      { id: 'c16', date: d(3), amount: 6000, status: 'pendiente', items: 2, description: 'Módulo Reporting Sostenible' },
    ],
    notas: [
      { id: 'n11', content: 'Cliente referente. Usar como caso de éxito.', date: d(60), author: 'Asesor' },
    ],
  },
  {
    id: '21', firstName: 'Jorge', lastName: 'Hidalgo', email: 'jhidalgo@mineracorp.pe', phone: '+51 979 666 555', company: 'MineraCorp SAC', position: 'Superintendente', address: 'Av. Las Minerales 456, Arequipa', status: 'activo', tags: ['minería', 'industria'], notes: 'Operación en Arequipa. Visitas mensuales requeridas.', isFavorite: false, createdAt: d(110), updatedAt: d(14), totalCompras: 5, totalGastado: 34200, ultimaCompra: d(14),
    activity: [
      { id: 'a35', type: 'compra', description: 'Software de Gestión Minera', date: d(14), amount: 12000 },
    ],
    cotizaciones: [
      { id: 'c17', date: d(10), amount: 8500, status: 'aprobada', items: 4, description: 'Módulo de Seguridad' },
    ],
    notas: [],
  },
  {
    id: '22', firstName: 'Claudia', lastName: 'Espinoza', email: 'cespinoza@retailmax.pe', phone: '+51 968 555 444', company: 'RetailMax Stores', position: 'Gerente de Tienda', address: 'CC Jockey Plaza, Surco, Lima', status: 'activo', tags: ['retail'], notes: '', isFavorite: false, createdAt: d(40), updatedAt: d(3), totalCompras: 2, totalGastado: 4500, ultimaCompra: d(20),
    activity: [
      { id: 'a36', type: 'compra', description: 'Sistema POS Básico', date: d(20), amount: 2200 },
    ],
    cotizaciones: [
      { id: 'c18', date: d(8), amount: 3000, status: 'convertida', items: 2, description: 'Módulo Inventarios Avanzado' },
    ],
    notas: [],
  },
  {
    id: '23', firstName: 'Ricardo', lastName: 'Palacios', email: 'rpalacios@logitech.pe', phone: '+51 957 444 333', company: 'LogiTech Distribution', position: 'Gerente de Logística', address: 'Av. Elmer Faucett s/n, Callao, Lima', status: 'inactivo', tags: ['logística', 'distribución'], notes: '', isFavorite: false, createdAt: d(180), updatedAt: d(120), totalCompras: 1, totalGastado: 2200, ultimaCompra: d(160),
    activity: [],
    cotizaciones: [],
    notas: [],
  },
  {
    id: '24', firstName: 'Elena', lastName: 'Molina', email: 'emolina@nutricorp.pe', phone: '+51 946 333 222', company: 'NutriCorp Alimentos', position: 'Jefa de Calidad', address: 'Panamericana Norte Km 20, Puente Piedra, Lima', status: 'nuevo', tags: ['alimentos', 'calidad'], notes: 'Proyecto de trazabilidad alimentaria.', isFavorite: false, createdAt: d(2), updatedAt: d(0), totalCompras: 0, totalGastado: 0, ultimaCompra: null,
    activity: [
      { id: 'a37', type: 'mensaje', description: 'Contacto inicial vía web. Solicitó información.', date: d(1) },
    ],
    cotizaciones: [],
    notas: [],
  },
  {
    id: '25', firstName: 'David', lastName: 'Córdova', email: 'dcordova@tecnoedu.pe', phone: '+51 935 222 111', company: 'TecnoEdu Learning', position: 'Director de Innovación', address: 'Av. Primavera 1234, Surco, Lima', status: 'frecuente', tags: ['educación', 'tecnología', 'premium'], notes: 'Aliado estratégico. Co-creamos contenido educativo.', isFavorite: true, createdAt: d(300), updatedAt: d(4), totalCompras: 20, totalGastado: 156000, ultimaCompra: d(4),
    activity: [
      { id: 'a38', type: 'compra', description: 'Plataforma Educativa Enterprise + Contenido', date: d(4), amount: 28000 },
      { id: 'a39', type: 'reunion', description: 'Reunión estratégica mensual', date: d(8) },
      { id: 'a40', type: 'cotizacion', description: 'Propuesta para nuevo programa educativo', date: d(10) },
    ],
    cotizaciones: [
      { id: 'c19', date: d(10), amount: 32000, status: 'pendiente', items: 10, description: 'Programa de Innovación Educativa 2026' },
      { id: 'c20', date: d(2), amount: 5000, status: 'aprobada', items: 2, description: 'Workshop de IA para docentes' },
    ],
    notas: [
      { id: 'n12', content: 'Reunión semanal cada viernes 10am.', date: d(90), author: 'Asesor' },
      { id: 'n13', content: 'Interesado en expandir a otras instituciones educativas.', date: d(30), author: 'Asesor' },
    ],
  },
];

export const calculateStats = (clientes: Cliente[]): ClienteStats => {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    total: clientes.length,
    activos: clientes.filter(c => c.status === 'activo' || c.status === 'frecuente').length,
    nuevosEsteMes: clientes.filter(c => new Date(c.createdAt) >= firstOfMonth).length,
    frecuentes: clientes.filter(c => c.status === 'frecuente').length,
    conversionRate: Math.round((clientes.filter(c => c.totalCompras > 0).length / clientes.length) * 100),
  };
};

const presetToStatus: Record<string, string> = {
  activos: 'activo',
  inactivos: 'inactivo',
  nuevos: 'nuevo',
  frecuentes: 'frecuente',
};

export const filterClientes = (clientes: Cliente[], query: string, preset: FilterPreset): Cliente[] => {
  let filtered = [...clientes];

  if (preset !== 'todos') {
    const status = presetToStatus[preset];
    filtered = filtered.filter(c => c.status === status);
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(c =>
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }

  return filtered;
};

export const sortClientes = (clientes: Cliente[], field: string, dir: 'asc' | 'desc'): Cliente[] => {
  return [...clientes].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';
    switch (field) {
      case 'firstName': aVal = a.firstName; bVal = b.firstName; break;
      case 'lastName': aVal = a.lastName; bVal = b.lastName; break;
      case 'email': aVal = a.email; bVal = b.email; break;
      case 'company': aVal = a.company; bVal = b.company; break;
      case 'status': aVal = a.status; bVal = b.status; break;
      case 'createdAt': aVal = a.createdAt; bVal = b.createdAt; break;
      case 'totalGastado': aVal = a.totalGastado; bVal = b.totalGastado; break;
      case 'ultimaCompra': aVal = a.ultimaCompra || ''; bVal = b.ultimaCompra || ''; break;
    }
    if (aVal < bVal) return dir === 'asc' ? -1 : 1;
    if (aVal > bVal) return dir === 'asc' ? 1 : -1;
    return 0;
  });
};

export const generateId = () => Math.random().toString(36).substring(2, 10);

export const newClienteFromForm = (data: ClienteFormData): Cliente => {
  const nowStr = new Date().toISOString().split('T')[0];
  return {
    id: generateId(),
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    company: data.company,
    position: data.position,
    address: data.address,
    status: data.status,
    tags: data.tags,
    notes: data.notes,
    isFavorite: false,
    createdAt: nowStr,
    updatedAt: nowStr,
    totalCompras: 0,
    totalGastado: 0,
    ultimaCompra: null,
    activity: [],
    cotizaciones: [],
    notas: [],
  };
};
