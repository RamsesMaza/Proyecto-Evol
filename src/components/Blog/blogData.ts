import blog1 from "../../assets/img/blog1.jpg";
import blog2 from "../../assets/img/blog2.jpg";
import blog3 from "../../assets/img/blog3.jpg";
import blog4 from "../../assets/img/blog4.jpg";
import blog5 from "../../assets/img/blog5.jpg";
import blog6 from "../../assets/img/blog6.jpg";

export interface BlogPost {
  id: number;
  title: string;
  category: string;
  image: string;
  author: string;
  date: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "¿Qué es la norma ISO 9001 y por qué es importante?",
    category: "Calidad",
    image: blog1,
    author: "Carlos Mendoza",
    date: "10 Feb 2024",
  },
  {
    id: 2,
    title: "Implementación de ISO 14001 en empresas modernas",
    category: "Medio Ambiente",
    image: blog2,
    author: "Lucía Ramos",
    date: "08 Feb 2024",
  },
  {
    id: 3,
    title: "Claves para aprobar una auditoría ISO sin errores",
    category: "Auditoría",
    image: blog3,
    author: "Jorge Castillo",
    date: "05 Feb 2024",
  },
  {
    id: 4,
    title: "ISO 45001: Seguridad y salud en el trabajo",
    category: "Seguridad",
    image: blog4,
    author: "Ana Torres",
    date: "02 Feb 2024",
  },
  {
    id: 5,
    title: "Beneficios de certificar tu empresa en normas ISO",
    category: "Gestión",
    image: blog5,
    author: "Diego Morales",
    date: "30 Ene 2024",
  },
  {
    id: 6,
    title: "Errores comunes al implementar sistemas de gestión ISO",
    category: "Mejora Continua",
    image: blog6,
    author: "María López",
    date: "28 Ene 2024",
  },
];