import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import styles from "./ContactMainSection.module.scss";

const ContactMainSection = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "El nombre es obligatorio";
    if (!form.email.trim()) errs.email = "El correo es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Correo inválido";
    if (!form.subject.trim()) errs.subject = "El asunto es obligatorio";
    if (!form.message.trim()) errs.message = "El mensaje no puede estar vacío";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  return (
    <section ref={ref} className={styles.section}>
      <div className={styles.container}>
        <div className={`${styles.layout} ${visible ? styles.layoutVisible : ''}`}>
          {/* ─── Left: Contact Info ─── */}
          <div className={styles.infoCol}>
            <span className={styles.badge}>Información</span>
            <h2 className={styles.title}>¿Tienes alguna duda?</h2>
            <p className={styles.subtitle}>
              Completa el formulario y un asesor se pondrá en contacto contigo.
            </p>

            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="16" width="16"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/></svg></div>
                <div><span className={styles.infoLabel}>Dirección</span><span className={styles.infoValue}>Calle Chasquitambo 576, Los Olivos, Lima</span></div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="16" width="16"><path d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154.1-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9 0-14.9-10.9-27-24-27H24C10.9 104 0 117.9 0 132.7c0 8.4 3.4 15.4 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"/></svg></div>
                <div><span className={styles.infoLabel}>Correo</span><span className={styles.infoValue}>comercial@acs.pe</span></div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="16" width="16"><path d="M497.39 361.8l-112-48a16 16 0 0 0-15.2 2.8l-49.6 40.4c-22.1-12.3-50.4-40.5-62.7-62.7l40.4-49.6a16 16 0 0 0 2.8-15.2l-48-112A16 16 0 0 0 235.2 112l-80 48c-2.8 1.7-4.4 4.6-4.4 7.6 0 95.8 77.2 173 173 173 3 0 5.9-1.6 7.6-4.4l48-80a16 16 0 0 0-2.2-17.4z"/></svg></div>
                <div><span className={styles.infoLabel}>Teléfono</span><span className={styles.infoValue}>+51 958 358 020</span></div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="16" width="16"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8L334.6 349c-3.9 5.3-11.4 6.5-16.8 2.6z"/></svg></div>
                <div><span className={styles.infoLabel}>Horario</span><span className={styles.infoValue}>Lun – Vie · 08:00 AM – 05:00 PM</span></div>
              </div>
            </div>
          </div>

          {/* ─── Right: Contact Form ─── */}
          <div className={styles.formCol}>
            {sent ? (
              <div className={styles.success}>
                <FaCheckCircle className={styles.successIcon} />
                <h3>¡Mensaje enviado!</h3>
                <p>Nos pondremos en contacto contigo a la brevedad.</p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Nombre completo</label>
                    <input className={`${styles.input} ${errors.name ? styles.inputError : ''}`} type="text" name="name" value={form.name} onChange={handleChange} placeholder="Ej: Juan Pérez" />
                    {errors.name && <span className={styles.error}>{errors.name}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Correo electrónico</label>
                    <input className={`${styles.input} ${errors.email ? styles.inputError : ''}`} type="email" name="email" value={form.email} onChange={handleChange} placeholder="Ej: juan@correo.com" />
                    {errors.email && <span className={styles.error}>{errors.email}</span>}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Asunto</label>
                  <input className={`${styles.input} ${errors.subject ? styles.inputError : ''}`} type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="¿Sobre qué deseas consultar?" />
                  {errors.subject && <span className={styles.error}>{errors.subject}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Mensaje</label>
                  <textarea className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`} name="message" value={form.message} onChange={handleChange} placeholder="Escribe tu mensaje aquí..." rows={5} />
                  {errors.message && <span className={styles.error}>{errors.message}</span>}
                </div>
                <button type="submit" className={styles.submit}>
                  <FaPaperPlane /> Enviar mensaje
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ─── Map ─── */}
        <div className={`${styles.mapWrap} ${visible ? styles.mapVisible : ''}`}>
          <iframe
            title="Ubicación ACS"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.585532585354!2d-77.0691501!3d-11.9685386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105cf4cb6347f8d%3A0xc0747444c1844b20!2sCalle%20Chasquitambo%20576%2C%20Los%20Olivos%2015301!5e0!3m2!1ses!2spe!4v1713650000000!5m2!1ses!2spe"
            width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default ContactMainSection;
