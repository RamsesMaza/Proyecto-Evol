import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaCertificate } from "react-icons/fa";
import styles from "./VerifyCertificate.module.scss";

const VerifyCertificate: React.FC = () => {
  const [code, setCode] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    console.log("Verificando:", code);
  };

  return (
    <section className={styles.verifyCertificate}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Verifica tu Certificado</h1>
          <div className={styles.line}></div>
          <nav className={styles.breadcrumbs}>
            <Link to="/">Inicio</Link> / <span>Verifica tu Certificado</span>
          </nav>
        </header>

        <div className={styles.content}>
          <p>
            Ingrese el código de seguridad de su certificado para validar su
            autenticidad en nuestra base de datos global.
          </p>

          <form className={styles.verifyForm} onSubmit={handleSearch}>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <FaCertificate className={styles.iconInput} />
                <input
                  type="text"
                  placeholder="Ej: ACS-12345-2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button type="submit" className={styles.btn}>
                <FaSearch /> Verificar
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default VerifyCertificate;
