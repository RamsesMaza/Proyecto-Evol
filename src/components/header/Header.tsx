import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./Header.module.scss";

import {
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaLinkedin,
  FaFacebook,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import ACS from "../../assets/logos/Logo-Acs.webp";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <span>
            <FaEnvelope /> informes@acs.pe
          </span>
          <span>
            <FaMapMarkerAlt /> Calle ejemplo Lima - Perú
          </span>
          <span>
            <FaPhone /> +51 999 999 999
          </span>
        </div>

        <div className={styles.topRight}>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">
            <FaLinkedin />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <FaFacebook />
          </a>
        </div>
      </div>

      <div className={styles.navbar}>
        <div className={styles.logoContainer}>
          <Link to="/" onClick={closeMenu}>
            <img src={ACS} alt="ACS Logo" className={styles.logoImg} />
          </Link>
        </div>

        <button className={styles.hamburger} onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div
          className={`${styles.navContainer} ${isMenuOpen ? styles.navOpen : ""}`}
        >
          <nav className={styles.navLinks}>
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              Inicio
            </NavLink>

            <NavLink
              to="/nosotros"
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              Nosotros
            </NavLink>

            <div className={styles.dropdown}>
              <NavLink
                to="/solicitudes"
                className={({ isActive }) => (isActive ? styles.active : "")}
              >
                Solicitudes
              </NavLink>
              <div className={styles.dropdownMenu}>
                <Link to="/solicitudes/servicios" onClick={closeMenu}>
                  Solicitar Servicios
                </Link>
                <Link to="/solicitudes/transferencia" onClick={closeMenu}>
                  Transferencia de Certificación
                </Link>
                <Link to="/solicitudes/auditorias" onClick={closeMenu}>
                  Otras Auditorías
                </Link>
              </div>
            </div>

            <div className={styles.dropdown}>
              <NavLink
                to="/servicios"
                className={({ isActive }) => (isActive ? styles.active : "")}
              >
                Servicios
              </NavLink>
              <div className={styles.megaMenu}>
                <div>
                  <h4>CERTIFICACIONES</h4>
                  <Link to="/servicios/iso-9001" onClick={closeMenu}>
                    ISO 9001:2015 – Gestión de Calidad
                  </Link>
                  <Link to="/servicios/iso-14001" onClick={closeMenu}>
                    ISO 14001:2015 – Gestión Ambiental
                  </Link>
                  <Link to="/servicios/iso-45001" onClick={closeMenu}>
                    ISO 45001:2018 – Gestión en SST
                  </Link>
                  <Link to="/servicios/iso-27001" onClick={closeMenu}>
                    ISO 27001:2013 – Seg. de la Información
                  </Link>
                  <Link to="/servicios/iso-13485" onClick={closeMenu}>
                    ISO 13485:2016 – Dispositivos Clínicos
                  </Link>
                </div>

                <div>
                  <h4>&nbsp;</h4>
                  <Link to="/servicios/iso-50001" onClick={closeMenu}>
                    ISO 50001:2018 – Gestión Energética
                  </Link>
                  <Link to="/servicios/iso-20000" onClick={closeMenu}>
                    ISO 20000-1:2011 – Gestión de Servicios TI
                  </Link>
                  <Link to="/servicios/haccp" onClick={closeMenu}>
                    CERTIFICACION HACCP
                  </Link>
                  <Link to="/servicios/iso-14006" onClick={closeMenu}>
                    ISO 14006:2020 – Gestión de Ecodiseño
                  </Link>
                  <Link to="/servicios/iso-14046" onClick={closeMenu}>
                    ISO 14046:2014 – Huella de Agua
                  </Link>
                </div>

                <div>
                  <h4>&nbsp;</h4>
                  <Link
                    to="/servicios/iso-37001"
                    className={styles.accredited}
                    onClick={closeMenu}
                  >
                    ISO 37001 – ACREDITADA POR INACAL
                  </Link>
                  <Link to="/servicios/iso-14064" onClick={closeMenu}>
                    ISO 14064:2018 – Huella de Carbono
                  </Link>
                  <Link to="/servicios/iso-42001" onClick={closeMenu}>
                    ISO 42001:2023 – Gestión de la IA
                  </Link>
                  <Link to="/servicios/empresa-segura" onClick={closeMenu}>
                    Marca de Certificación Empresa Segura
                  </Link>
                  <Link to="/servicios/iso-46001" onClick={closeMenu}>
                    ISO 46001:2019 Gestión de la Eficiencia del Agua
                  </Link>
                </div>

                {/* Columna 4 */}
                <div>
                  <h4>Cursos PMI</h4>
                  <Link to="/pmi/construccion" onClick={closeMenu}>
                    Gerencia de proyectos de construcción bajo el enfoque PMI
                  </Link>
                  <Link to="/pmi/ingenieria" onClick={closeMenu}>
                    Dirección de proyectos en servicios de Ingeniería y
                    arquitectura con enfoque PMI
                  </Link>
                  <Link to="/pmi/planeamiento" onClick={closeMenu}>
                    Gestión de planeamiento y control de proyectos con enfoque
                    PMI
                  </Link>
                  <Link to="/pmi/pmp" onClick={closeMenu}>
                    Profesional en Gestión de Proyectos (PMP)®
                  </Link>
                  <Link
                    to="/pmi"
                    className={styles.viewMore}
                    onClick={closeMenu}
                  >
                    Ver más
                  </Link>
                </div>
              </div>
            </div>

            <NavLink
              to="/blog"
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              Blog
            </NavLink>

            <NavLink
              to="/contacto"
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              Contacto
            </NavLink>
          </nav>

          <div className={styles.actions}>
            <Link to="/login" className={styles.loginBtn}>Login</Link>
            <button className={styles.btn}>
              <NavLink to="/verifica-tu-certificado" className={styles.btn}>
                Verifica tu certificado
              </NavLink>
            </button>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
