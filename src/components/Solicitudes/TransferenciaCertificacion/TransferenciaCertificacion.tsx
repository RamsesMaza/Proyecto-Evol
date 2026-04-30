import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaBuilding, FaUser, FaPhone, FaEnvelope, FaWhatsapp, FaCertificate, FaCalendarAlt } from 'react-icons/fa';
import styles from './TransferenciaCertificacion.module.scss';

const ISO_NORMS = ['ISO 9001:2015','ISO 14001:2015','ISO 45001:2018','ISO 37001:2016','ISO 27001:2013','ISO 13485:2016','ISO 50001:2018','ISO 20000-1','Otra norma'];
const REASONS = ['Mejor precio / costo-beneficio','Mejor servicio y atención','Reconocimiento INACAL','Recomendación de cliente','Cierre del organismo actual','Otro motivo'];
const STEPS = [
  { n:'1', title:'Envía tu solicitud', desc:'Completa el formulario con tus datos actuales.' },
  { n:'2', title:'Revisamos tu certificado', desc:'Evaluamos la norma y vigencia actual.' },
  { n:'3', title:'Plan de transición', desc:'Te enviamos la propuesta de transferencia.' },
  { n:'4', title:'Transferencia sin parar', desc:'Continuidad de tu certificación garantizada.' },
];

interface FormState {
  razonSocial: string; ruc: string; contacto: string; cargo: string;
  telefono: string; email: string;
  organismoActual: string; normaISO: string;
  numeroCertificado: string; fechaVencimiento: string;
  motivoTransferencia: string; comentarios: string;
}
const INIT: FormState = { razonSocial:'', ruc:'', contacto:'', cargo:'', telefono:'', email:'', organismoActual:'', normaISO:'', numeroCertificado:'', fechaVencimiento:'', motivoTransferencia:'', comentarios:'' };

const TransferenciaCertificacion = () => {
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
    if (!form.organismoActual.trim()) e.organismoActual = 'Requerido';
    if (!form.normaISO) e.normaISO = 'Selecciona la norma';
    if (!form.numeroCertificado.trim()) e.numeroCertificado = 'Requerido';
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
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.tag}>Transferencia de Certificación</span>
          <h1>Transfiere tu Certificado a ACS</h1>
          <p>Proceso simplificado, sin pérdida de vigencia y con reconocimiento INACAL.</p>
          <nav className={styles.breadcrumbs}>
            <Link to="/">Inicio</Link><span>/</span>
            <Link to="/solicitudes">Solicitudes</Link><span>/</span>
            <span>Transferencia</span>
          </nav>
        </div>
      </section>

      <section className={styles.main}>
        <div className={styles.container}>
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <h3>Proceso de Transferencia</h3>
              <div className={styles.steps}>
                {STEPS.map(s => (
                  <div key={s.n} className={styles.step}>
                    <div className={styles.stepNum}>{s.n}</div>
                    <div><strong>{s.title}</strong><p>{s.desc}</p></div>
                  </div>
                ))}
              </div>
              <div className={styles.infoBox}>
                <FaCertificate />
                <p>ACS cuenta con acreditación INACAL. Tu transferencia es reconocida internacionalmente.</p>
              </div>
              <div className={styles.sideContact}>
                <h4>¿Tienes dudas?</h4>
                <a href="https://wa.me/51958358020" target="_blank" rel="noreferrer" className={styles.wspBtn}><FaWhatsapp /> WhatsApp</a>
                <a href="mailto:informes@acs.pe" className={styles.mailBtn}><FaEnvelope /> informes@acs.pe</a>
              </div>
            </aside>

            <div className={styles.formCard}>
              {submitted ? (
                <div className={styles.success}>
                  <FaCheckCircle />
                  <h2>¡Solicitud de Transferencia Enviada!</h2>
                  <p>Gracias <strong>{form.contacto}</strong>. Analizaremos tu certificado y te contactaremos en <strong>{form.email}</strong>.</p>
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
                      <input name="cargo" value={form.cargo} onChange={handleChange} placeholder="Responsable de Calidad" />
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label><FaPhone />Teléfono *</label>
                      <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="+51 9XX XXX XXX" />
                      {errors.telefono && <span className={styles.err}>{errors.telefono}</span>}
                    </div>
                    <div className={styles.field}>
                      <label><FaEnvelope />Correo *</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="contacto@empresa.com" />
                      {errors.email && <span className={styles.err}>{errors.email}</span>}
                    </div>
                  </div>

                  <div className={styles.divider}><span>Datos del Certificado Actual</span></div>

                  <div className={styles.field}>
                    <label><FaBuilding />Organismo Certificador Actual *</label>
                    <input name="organismoActual" value={form.organismoActual} onChange={handleChange} placeholder="Bureau Veritas, SGS, ICONTEC..." />
                    {errors.organismoActual && <span className={styles.err}>{errors.organismoActual}</span>}
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label><FaCertificate />Norma ISO *</label>
                      <select name="normaISO" value={form.normaISO} onChange={handleChange}>
                        <option value="">Selecciona la norma</option>
                        {ISO_NORMS.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      {errors.normaISO && <span className={styles.err}>{errors.normaISO}</span>}
                    </div>
                    <div className={styles.field}>
                      <label><FaCertificate />N.° de Certificado *</label>
                      <input name="numeroCertificado" value={form.numeroCertificado} onChange={handleChange} placeholder="ISO-2024-001234" />
                      {errors.numeroCertificado && <span className={styles.err}>{errors.numeroCertificado}</span>}
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label><FaCalendarAlt />Fecha de Vencimiento</label>
                      <input name="fechaVencimiento" type="date" value={form.fechaVencimiento} onChange={handleChange} />
                    </div>
                    <div className={styles.field}>
                      <label>Motivo de Transferencia</label>
                      <select name="motivoTransferencia" value={form.motivoTransferencia} onChange={handleChange}>
                        <option value="">Selecciona el motivo</option>
                        {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>Comentarios adicionales</label>
                    <textarea name="comentarios" value={form.comentarios} onChange={handleChange} rows={3} placeholder="Información adicional..." />
                  </div>

                  <button type="submit" className={styles.submitBtn}>Solicitar Transferencia</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TransferenciaCertificacion;
