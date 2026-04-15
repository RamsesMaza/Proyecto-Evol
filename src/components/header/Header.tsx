import React from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./Header.module.scss";

import {
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaLinkedin,
  FaFacebook,
  FaWhatsapp,
} from "react-icons/fa";

import ACS from "../../assets/logos/Logo-Acs.webp";

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      {/* Top Bar - Datos de contacto y Redes */}
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

      {/* Navbar Principal */}
      <div className={styles.navbar}>
        <div className={styles.logoContainer}>
          <Link to="/">
            <img src={ACS} alt="ACS Logo" className={styles.logoImg} />
          </Link>
        </div>

        <nav className={styles.navLinks}>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Inicio
          </NavLink>

          <NavLink
            to="/nosotros"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Nosotros
          </NavLink>

          {/* NavLink Dropdown Solicitudes */}
          <div className={styles.dropdown}>
            <NavLink
              to="/solicitudes"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              Solicitudes
            </NavLink>
            <div className={styles.dropdownMenu}>
              <Link to="/solicitudes/servicios">Solicitar Servicios</Link>
              <Link to="/solicitudes/transferencia">
                Transferencia de Certificación
              </Link>
              <Link to="/solicitudes/auditorias">Otras Auditorías</Link>
            </div>
          </div>

          {/* NavLink Mega Menu Servicios */}
          <div className={styles.dropdown}>
            <NavLink
              to="/servicios"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              Servicios
            </NavLink>
            <div className={styles.megaMenu}>
              {/* Columna 1 */}
              <div>
                <h4>CERTIFICACIONES</h4>
                <Link to="/servicios/iso-9001">
                  ISO 9001:2015 – Gestión de Calidad
                </Link>
                <Link to="/servicios/iso-14001">
                  ISO 14001:2015 – Gestión Ambiental
                </Link>
                <Link to="/servicios/iso-45001">
                  ISO 45001:2018 – Gestión en SST
                </Link>
                <Link to="/servicios/iso-27001">
                  ISO 27001:2013 – Seg. de la Información
                </Link>
                <Link to="/servicios/iso-13485">
                  ISO 13485:2016 – Dispositivos Clínicos
                </Link>
              </div>

              {/* Columna 2 */}
              <div>
                <h4>&nbsp;</h4>
                <Link to="/servicios/iso-50001">
                  ISO 50001:2018 – Gestión Energética
                </Link>
                <Link to="/servicios/iso-20000">
                  ISO 20000-1:2011 – Gestión de Servicios TI
                </Link>
                <Link to="/servicios/haccp">CERTIFICACION HACCP</Link>
                <Link to="/servicios/iso-14006">
                  ISO 14006:2020 – Gestión de Ecodiseño
                </Link>
                <Link to="/servicios/iso-14046">
                  ISO 14046:2014 – Huella de Agua
                </Link>
              </div>

              {/* Columna 3 */}
              <div>
                <h4>&nbsp;</h4>
                <Link to="/servicios/iso-37001" className={styles.accredited}>
                  ISO 37001 – ACREDITADA POR INACAL
                </Link>
                <Link to="/servicios/iso-14064">
                  ISO 14064:2018 – Huella de Carbono
                </Link>
                <Link to="/servicios/iso-42001">
                  ISO 42001:2023 – Gestión de la IA
                </Link>
                <Link to="/servicios/empresa-segura">
                  Marca de Certificación Empresa Segura
                </Link>
                <Link to="/servicios/iso-46001">
                  ISO 46001:2019 Gestión de la Eficiencia del Agua
                </Link>
              </div>

              {/* Columna 4 */}
              <div>
                <h4>Cursos PMI</h4>
                <Link to="/pmi/construccion">
                  Gerencia de proyectos de construcción bajo el enfoque PMI
                </Link>
                <Link to="/pmi/ingenieria">
                  Dirección de proyectos en servicios de Ingeniería y
                  arquitectura con enfoque PMI
                </Link>
                <Link to="/pmi/planeamiento">
                  Gestión de planeamiento y control de proyectos con enfoque PMI
                </Link>
                <Link to="/pmi/pmp">
                  Profesional en Gestión de Proyectos (PMP)®
                </Link>
                <Link to="/pmi" className={styles.viewMore}>
                  Ver más
                </Link>
              </div>
            </div>
          </div>

          <NavLink
            to="/blog"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Blog
          </NavLink>

          <NavLink
            to="/contacto"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Contacto
          </NavLink>
        </nav>

        <div className={styles.actions}>
          <button className={styles.loginBtn}>Login</button>
          <button className={styles.btn}>Verifica tu certificado</button>
        </div>
      </div>

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/51999999999"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsapp}
      >
        <FaWhatsapp />
      </a>
    </header>
  );
};

export default Header;
