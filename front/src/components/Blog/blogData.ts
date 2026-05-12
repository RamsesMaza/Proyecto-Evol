import blog1 from "../../assets/img/blog1.jpg";
import blog2 from "../../assets/img/blog2.jpg";
import blog3 from "../../assets/img/blog3.jpg";
import blog4 from "../../assets/img/blog4.jpg";
import blog5 from "../../assets/img/blog5.jpg";
import blog6 from "../../assets/img/blog6.jpg";

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  image: string;
  author: string;
  authorAvatar?: string;
  date: string;
  readingTime: string;
  commentsCount: number;
  featured?: boolean;
  content?: { type: string; value: string }[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "que-es-la-norma-iso-9001",
    title: "¿Qué es la norma ISO 9001 y por qué es importante para tu empresa?",
    excerpt: "Descubre cómo la certificación ISO 9001 puede transformar la gestión de calidad de tu organización y abrirte puertas a nuevos mercados.",
    category: "Calidad",
    tags: ["ISO 9001", "Calidad", "Certificación", "Gestión"],
    image: blog1,
    author: "Carlos Mendoza",
    date: "10 Feb 2024",
    readingTime: "5 min de lectura",
    commentsCount: 12,
    featured: true,
    content: [
      { type: "paragraph", value: "La norma ISO 9001 es el estándar internacional más reconocido para sistemas de gestión de calidad (SGC). Implementarla no solo mejora procesos internos, sino que genera confianza en clientes y stakeholders." },
      { type: "heading", value: "¿Qué beneficios aporta la ISO 9001?" },
      { type: "paragraph", value: "Las empresas certificadas reportan una mejora significativa en la eficiencia operativa, reducción de costos por errores y mayor satisfacción del cliente. Además, la ISO 9001 es frecuentemente un requisito para participar en licitaciones públicas y trabajar con grandes corporaciones." },
      { type: "blockquote", value: "La calidad no es un acto, es un hábito. — Aristóteles" },
      { type: "paragraph", value: "El proceso de certificación implica una auditoría externa realizada por un organismo acreditado. Una vez obtenida, la certificación se mantiene mediante auditorías periódicas de seguimiento." },
      { type: "heading", value: "Pasos para la implementación" },
      { type: "paragraph", value: "1. Diagnóstico inicial\n2. Planificación del SGC\n3. Capacitación del equipo\n4. Documentación de procesos\n5. Implementación y operación\n6. Auditoría interna\n7. Revisión por la dirección\n8. Certificación externa" },
    ],
  },
  {
    id: 2,
    slug: "implementacion-iso-14001-empresas-modernas",
    title: "Implementación de ISO 14001 en empresas modernas",
    excerpt: "La gestión ambiental ya no es opcional. Conoce cómo la ISO 14001 ayuda a tu empresa a ser sostenible y competitiva.",
    category: "Medio Ambiente",
    tags: ["ISO 14001", "Sostenibilidad", "Medio Ambiente"],
    image: blog2,
    author: "Lucía Ramos",
    date: "08 Feb 2024",
    readingTime: "4 min de lectura",
    commentsCount: 8,
    content: [
      { type: "paragraph", value: "La ISO 14001 establece los requisitos para un sistema de gestión ambiental (SGA) efectivo. En un mundo donde la sostenibilidad es clave, esta certificación marca la diferencia." },
      { type: "heading", value: "Ventajas competitivas" },
      { type: "paragraph", value: "Las empresas con ISO 14001 reducen su impacto ambiental, optimizan el uso de recursos y mejoran su imagen corporativa. Además, cumplen con la legislación ambiental vigente y anticipan futuras regulaciones." },
    ],
  },
  {
    id: 3,
    slug: "claves-auditoria-iso-sin-errores",
    title: "Claves para aprobar una auditoría ISO sin errores",
    excerpt: "Prepara a tu equipo y documentación con estos consejos prácticos para enfrentar una auditoría de certificación con éxito.",
    category: "Auditoría",
    tags: ["Auditoría", "ISO", "Certificación", "Preparación"],
    image: blog3,
    author: "Jorge Castillo",
    date: "05 Feb 2024",
    readingTime: "6 min de lectura",
    commentsCount: 15,
    content: [
      { type: "paragraph", value: "Una auditoría ISO puede ser estresante, pero con la preparación adecuada, tu empresa puede demostrar su compromiso con la calidad y la mejora continua." },
      { type: "heading", value: "Errores comunes" },
      { type: "paragraph", value: "La falta de documentación actualizada, el desconocimiento del personal sobre los procesos y la ausencia de registros de acciones correctivas son los principales hallazgos en las auditorías." },
    ],
  },
  {
    id: 4,
    slug: "iso-45001-seguridad-salud-trabajo",
    title: "ISO 45001: Seguridad y salud en el trabajo",
    excerpt: "Protege a tu equipo con el estándar internacional para sistemas de gestión de seguridad y salud ocupacional.",
    category: "Seguridad",
    tags: ["ISO 45001", "Seguridad", "Salud Ocupacional"],
    image: blog4,
    author: "Ana Torres",
    date: "02 Feb 2024",
    readingTime: "5 min de lectura",
    commentsCount: 10,
    content: [
      { type: "paragraph", value: "La ISO 45001 es la primera norma internacional que aborda la seguridad y salud en el trabajo. Su enfoque preventivo ayuda a reducir accidentes y enfermedades laborales." },
      { type: "heading", value: "Beneficios clave" },
      { type: "paragraph", value: "Además de proteger a los trabajadores, la ISO 45001 mejora la productividad al reducir el ausentismo y crear una cultura de seguridad en la organización." },
    ],
  },
  {
    id: 5,
    slug: "beneficios-certificar-normas-iso",
    title: "Beneficios de certificar tu empresa en normas ISO",
    excerpt: "Descubre por qué cada vez más empresas eligen certificarse en estándares ISO y cómo esto impulsa su crecimiento.",
    category: "Gestión",
    tags: ["ISO", "Certificación", "Beneficios", "Crecimiento"],
    image: blog5,
    author: "Diego Morales",
    date: "30 Ene 2024",
    readingTime: "4 min de lectura",
    commentsCount: 7,
    content: [
      { type: "paragraph", value: "La certificación ISO es una inversión estratégica que genera retornos medibles. Desde el acceso a nuevos mercados hasta la optimización de procesos, los beneficios son múltiples." },
      { type: "heading", value: "Retorno de inversión" },
      { type: "paragraph", value: "Las empresas certificadas reportan un aumento promedio del 20% en eficiencia operativa y una reducción del 30% en costos por no conformidades durante el primer año." },
    ],
  },
  {
    id: 6,
    slug: "errores-comunes-implementar-sistemas-gestion-iso",
    title: "Errores comunes al implementar sistemas de gestión ISO",
    excerpt: "Evita estos errores frecuentes que cometen las empresas al iniciar su camino hacia la certificación ISO.",
    category: "Mejora Continua",
    tags: ["ISO", "Implementación", "Errores", "Mejora Continua"],
    image: blog6,
    author: "María López",
    date: "28 Ene 2024",
    readingTime: "7 min de lectura",
    commentsCount: 20,
    content: [
      { type: "paragraph", value: "Implementar un sistema de gestión ISO es un desafío que muchas empresas enfrentan sin la preparación adecuada. Conocer los errores más comunes puede ahorrarte tiempo y recursos." },
      { type: "heading", value: "El error más frecuente" },
      { type: "paragraph", value: "La falta de compromiso de la alta dirección es la causa principal del fracaso en las implementaciones ISO. Sin el apoyo visible de los líderes, cualquier sistema de gestión está destinado al fracaso." },
    ],
  },
];
