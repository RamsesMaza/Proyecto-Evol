import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaBuilding, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import styles from './SolicitarServicios.module.scss';

const ISO_SERVICES = [
  'ISO 9001:2015 – Gestión de la Calidad',
  'ISO 14001:2015 – Gestión Ambiental',
  'ISO 45001:2018 – Seguridad y Salud en el Trabajo',
  'ISO 37001:2016 – Antisoborno (Acreditada INACAL)',
  'ISO 27001:2013 – Seguridad de la Información',
  'ISO 13485:2016 – Dispositivos Médicos',
  'ISO 50001:2018 – Gestión Energética',
  'ISO 20000-1:2011 – Gestión de Servicios TI',
  'HACCP – Inocuidad Alimentaria',
  'ISO 14064:2018 – Huella de Carbono',
  'ISO 42001:2023 – Gestión de la IA',
  'ISO 46001:2019 – Eficiencia del Agua',
  'Cursos PMI', 'Otro',
];

const STEPS = [
  { n: '1', title: 'Completa el formulario', desc: 'Llena tus datos y el servicio de interés.' },
  { n: '2', title: 'Revisión de asesor', desc: 'Un asesor evaluará tu solicitud en 24 h.' },
  { n: '3', title: 'Propuesta a medida', desc: 'Recibirás una cotización personalizada.' },
  { n: '4', title: 'Inicio del proceso', desc: 'Comenzamos tu camino hacia la certificación.' },
];

interface FormState {
  razonSocial: string; ruc: string; contacto: string; cargo: string;
  telefono: string; email: string; ciudad: string;
  servicio: string; empleados: string; actividad: string;
  certificadoActual: string; comentarios: string;
}

const INIT: FormState = {
  razonSocial: '', ruc: '', contacto: '', cargo: '',
  telefono: '', email: '', ciudad: '',
  servicio: '', empleados: '', actividad: '',
  certificadoActual: 'no', comentarios: '',
};

const SolicitarServicios = () => {
  const [form, setForm] = useState<FormState>(INIT);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.razonSocial.trim()) e.razonSocial = 'Requerido';
    if (!form.ruc.trim()) e.ruc = 'Requerido';
    if (!form.contacto.trim()) e.contacto = 'Requerido';
    if (!form.telefono.trim()) e.telefono = 'Requerido';
    if (!form.email.trim()) e.email = 'Requerido';
    if (!form.servicio) e.servicio = 'Selecciona un servicio';
    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(err => ({ ...err, [e.target.name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    console.log('Solicitud de servicios:', form);
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.tag}>Solicitar Servicios</span>
          <h1>Inicia tu Proceso de Certificación</h1>
          <p>Completa el formulario y un asesor especializado te contactará en menos de 24 horas.</p>
          <nav className={styles.breadcrumbs}>
            <Link to="/">Inicio</Link><span>/</span>
            <Link to="/solicitudes">Solicitudes</Link><span>/</span>
            <span>Solicitar Servicios</span>
          </nav>
        </div>
      </section>

      <section className={styles.main}>
        <div className={styles.container}>
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <h3>¿Cómo funciona?</h3>
              <div className={styles.steps}>
                {STEPS.map(s => (
                  <div key={s.n} className={styles.step}>
                    <div className={styles.stepNum}>{s.n}</div>
                    <div><strong>{s.title}</strong><p>{s.desc}</p></div>
                  </div>
                ))}
              </div>
              <div className={styles.sideContact}>
                <h4>¿Prefieres contactarnos?</h4>
                <a href="https://wa.me/51958358020" target="_blank" rel="noreferrer" className={styles.wspBtn}><FaWhatsapp /> WhatsApp</a>
                <a href="mailto:informes@acs.pe" className={styles.mailBtn}><FaEnvelope /> informes@acs.pe</a>
              </div>
            </aside>

            <div className={styles.formCard}>
              {submitted ? (
                <div className={styles.success}>
                  <FaCheckCircle />
                  <h2>¡Solicitud enviada!</h2>
                  <p>Gracias <strong>{form.contacto}</strong>, un asesor de ACS te contactará pronto al correo <strong>{form.email}</strong>.</p>
                  <button onClick={() => { setForm(INIT); setSubmitted(false); }} className={styles.resetBtn}>Nueva solicitud</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h2 className={styles.formTitle}>Datos de la Empresa</h2>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label><FaBuilding />Razón Social *</label>
                      <input name="razonSocial" value={form.razonSocial} onChange={handleChange} placeholder="Empresa S.A.C." />
                      {errors.razonSocial && <span className={styles.err}>{errors.razonSocial}</span>}
                    </div>
                    <div className={styles.field}>
                      <label><FaBuilding />RUC *</label>
                      <input name="ruc" value={form.ruc} onChange={handleChange} placeholder="20XXXXXXXXX" maxLength={11} />
                      {errors.ruc && <span className={styles.err}>{errors.ruc}</span>}
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label><FaUser />Persona de Contacto *</label>
                      <input name="contacto" value={form.contacto} onChange={handleChange} placeholder="Nombres y apellidos" />
                      {errors.contacto && <span className={styles.err}>{errors.contacto}</span>}
                    </div>
                    <div className={styles.field}>
                      <label><FaUser />Cargo</label>
                      <input name="cargo" value={form.cargo} onChange={handleChange} placeholder="Gerente General" />
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label><FaPhone />Teléfono / Celular *</label>
                      <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="+51 9XX XXX XXX" />
                      {errors.telefono && <span className={styles.err}>{errors.telefono}</span>}
                    </div>
                    <div className={styles.field}>
                      <label><FaEnvelope />Correo Electrónico *</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="contacto@empresa.com" />
                      {errors.email && <span className={styles.err}>{errors.email}</span>}
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label><FaMapMarkerAlt />Ciudad</label>
                      <input name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Lima" />
                    </div>
                    <div className={styles.field}>
                      <label>N.° de Empleados</label>
                      <select name="empleados" value={form.empleados} onChange={handleChange}>
                        <option value="">Selecciona un rango</option>
                        {['1 – 10','11 – 50','51 – 200','201 – 500','500+'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className={styles.divider}><span>Información del Servicio</span></div>

                  <div className={styles.field}>
                    <label>Servicio de Interés *</label>
                    <select name="servicio" value={form.servicio} onChange={handleChange}>
                      <option value="">Selecciona la norma o servicio</option>
                      {ISO_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.servicio && <span className={styles.err}>{errors.servicio}</span>}
                  </div>

                  <div className={styles.field}>
                    <label>Actividad Principal de la Empresa</label>
                    <input name="actividad" value={form.actividad} onChange={handleChange} placeholder="Construcción, manufactura, servicios TI..." />
                  </div>

                  <div className={styles.radioGroup}>
                    <label>¿Cuenta actualmente con alguna certificación ISO?</label>
                    <div className={styles.radios}>
                      {['sí','no'].map(v => (
                        <label key={v} className={styles.radioLabel}>
                          <input type="radio" name="certificadoActual" value={v} checked={form.certificadoActual === v} onChange={handleChange} />
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>Comentarios adicionales</label>
                    <textarea name="comentarios" value={form.comentarios} onChange={handleChange} rows={4} placeholder="Cuéntanos más sobre tus necesidades..." />
                  </div>

                  <button type="submit" className={styles.submitBtn}>Enviar Solicitud</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SolicitarServicios;
