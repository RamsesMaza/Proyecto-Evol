import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.scss";

import slide1 from "../../../assets/img/hero1.webp";
import slide2 from "../../../assets/img/hero2.webp";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Slide {
  img: string;
  title: string;
  text: string;
  btn: string;
}

const slides: Slide[] = [
  {
    img: slide1,
    title: "Certificate bajo Estándares PMI",
    text: "Contamos con cursos profesionales certificados por el PMI para proyectos con las mejores prácticas de la industria.",
    btn: "Empieza ahora"
  },
  {
    img: slide2,
    title: "Certificate con Nosotros ",
    text: "ISO 37001 con Acreditación INACAL",
    btn: "¡Cotiza ahora!"
  },
];

const Hero: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [current]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (startX.current === null) return;

    const diff = e.clientX - startX.current;

    if (diff > 50) prevSlide();
    if (diff < -50) nextSlide();

    startX.current = null;
  };

  return (
    <section
      className={styles.hero}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`${styles.slide} ${
            index === current ? styles.active : ""
          }`}
        >
          <img src={slide.img} alt={slide.title} />

          <div className={styles.overlay}></div>

          <div className={styles.content}>
            <h1>{slide.title}</h1>
            <p>{slide.text}</p>

            <a href="#" className={styles.btn}>
                {slide.btn}
            </a>
          </div>
        </div>
      ))}

      <button className={`${styles.arrow} ${styles.left}`} onClick={prevSlide}>
        <FaChevronLeft />
      </button>

      <button className={`${styles.arrow} ${styles.right}`} onClick={nextSlide}>
        <FaChevronRight />
      </button>
    </section>
  );
};

export default Hero;