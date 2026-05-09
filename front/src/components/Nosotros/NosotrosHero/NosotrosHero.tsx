import { useState, useEffect } from "react";
import styles from "./NosotrosHero.module.scss";

// Importación de imágenes
import hero1 from "../../../assets/img/Nosotros-auditor-ACS.webp";
import hero2 from "../../../assets/img/hero2.webp";
import auditorImg from "../../../assets/img/nosotros1.webp"; // Puedes añadir más aquí

const images = [hero1, hero2, auditorImg];

const NosotrosHero = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // Cambia cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.hero}>
      {images.map((img, index) => (
        <div
          key={index}
          className={`${styles.slide} ${index === currentImage ? styles.active : ""}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      <div className={styles.overlay}></div>
      <div className={styles.container}>
        <h1>Sobre Nosotros</h1>
        <div className={styles.line}></div>
        <p>Líderes en Certificación de Sistemas de Gestión con Excelencia Internacional.</p>
      </div>
    </section>
  );
};

export default NosotrosHero;