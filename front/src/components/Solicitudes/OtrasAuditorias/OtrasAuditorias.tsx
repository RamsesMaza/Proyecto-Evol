import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaBuilding, FaUser, FaPhone, FaEnvelope, FaWhatsapp, FaSearch, FaCalendarAlt } from 'react-icons/fa';
import styles from './OtrasAuditorias.module.scss';

const AUDIT_TYPES = [
  'Auditoría de Segunda Parte (a Proveedores)',
  'Auditoría de Debida Diligencia',
  'Pre-auditoría de Certificación',
  'Auditoría de Evaluación de Cumplimiento Normativo',
  'Auditoría Interna (apoyo externo)',
  'Auditoría Ambiental',
  'Auditoría de Seguridad y Salud en el Trabajo',
  'Otra auditoría especializada',
];
const ISO_NORMS = ['ISO 9001:2015','ISO 14001:2015','ISO 45001:2018','ISO 37001:2016','ISO 27001:2013','ISO 50001:2018','HACCP','Otra norma / estándar'];
const STEPS = [
  { n:'1', title:'Describe tu necesidad', desc:'Selecciona el tipo de auditoría y el alcance.' },
  { n:'2', title:'Análisis técnico', desc:'Nuestros auditores revisan los requisitos.' },
  { n:'3', title:'Propuesta técnica', desc:'Recibirás un plan y cotización detallados.' },
  { n:'4', title:'Ejecución', desc:'Coordinamos fechas y ejecutamos la auditoría.' },
];

interface FormState {
  razonSocial: string; ruc: string; contacto: string; cargo: string;
  telefono: string; email: string;
  tipoAuditoria: string; normaAplicable: string;
  alcance: string; numeroSitios: string; numeroEmpleados: string;
  fechaDeseada: string; comentarios: string;
}
const INIT: FormState = { razonSocial:'', ruc:'', contacto:'', cargo:'', telefono:'', email:'', tipoAuditoria:'', normaAplicable:'', alcance:'', numeroSitios:'', numeroEmpleados:'', fechaDeseada:'', comentarios:'' };

const OtrasAuditorias = () => {
  const [form, setForm] = useState<FormState>(INIT);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.razonSocial.trim()) e.razonSocial = 'Requerido';
    if (!form.contacto.trim()) e.contacto = 'Requerido';
    if (!form.telefono.trim()) e.telefono = 'Requerido';
    if (!form.email.trim()) e.email = 'Requerido';
    if (!form.tipoAuditoria) e.tipoAuditoria = 'Selecciona el tipo';
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
          <span className={styles.tag}>Otras Auditorías</span>
          <h1>Servicios Especializados de Auditoría</h1>
          <p>Auditorías de segunda parte, a proveedores, de cumplimiento y más. Equipo certificado y experiencia internacional.</p>
          <nav className={styles.breadcrumbs}>
            <Link to="/">Inicio</Link><span>/</span>
            <Link to="/solicitudes">Solicitudes</Link><span>/</span>
            <span>Otras Auditorías</span>
          </nav>
        </div>
      </section>

      <section className={styles.main}>
        <div className={styles.container}>
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <h3>¿Cómo lo hacemos?</h3>
              <div className={styles.steps}>
                {STEPS.map(s => (
                  <div key={s.n} className={styles.step}>
                    <div className={styles.stepNum}>{s.n}</div>
                    <div><strong>{s.title}</strong><p>{s.desc}</p></div>
                  </div>
                ))}
              </div>
              <div className={styles.infoBox}>
                <FaSearch />
                <p>Auditores con certificaciones nacionales e internacionales y experiencia en múltiples sectores.</p>
              </div>
              <div className={styles.sideContact}>
                <h4>Contáctanos</h4>
                <a href="https://wa.me/51958358020" target="_blank" rel="noreferrer" className={styles.wspBtn}><FaWhatsapp /> WhatsApp</a>
                <a href="mailto:informes@acs.pe" className={styles.mailBtn}><FaEnvelope /> informes@acs.pe</a>
              </div>
            </aside>

            <div className={styles.formCard}>
              {submitted ? (
                <div className={styles.success}>
                  <FaCheckCircle />
                  <h2>¡Solicitud Recibida!</h2>
                  <p>Gracias <strong>{form.contacto}</strong>. Un auditor experto te contactará pronto en <strong>{form.email}</strong>.</p>
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
                      <label><FaBuilding />RUC</label>
                      <input name="ruc" value={form.ruc} onChange={handleChange} placeholder="20XXXXXXXXX" maxLength={11} />
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
                      <input name="cargo" value={form.cargo} onChange={handleChange} placeholder="Gerente de Operaciones" />
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

                  <div className={styles.divider}><span>Datos de la Auditoría</span></div>

                  <div className={styles.field}>
                    <label>Tipo de Auditoría *</label>
                    <select name="tipoAuditoria" value={form.tipoAuditoria} onChange={handleChange}>
                      <option value="">Selecciona el tipo de auditoría</option>
                      {AUDIT_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    {errors.tipoAuditoria && <span className={styles.err}>{errors.tipoAuditoria}</span>}
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label>Norma o Estándar Aplicable</label>
                      <select name="normaAplicable" value={form.normaAplicable} onChange={handleChange}>
                        <option value="">Selecciona (opcional)</option>
                        {ISO_NORMS.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label>N.° de Sitios / Instalaciones</label>
                      <input name="numeroSitios" value={form.numeroSitios} onChange={handleChange} placeholder="Ej: 1, 3, 5..." />
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label>N.° de Empleados</label>
                      <input name="numeroEmpleados" value={form.numeroEmpleados} onChange={handleChange} placeholder="Ej: 50" />
                    </div>
                    <div className={styles.field}>
                      <label><FaCalendarAlt />Fecha Estimada Deseada</label>
                      <input name="fechaDeseada" type="date" value={form.fechaDeseada} onChange={handleChange} />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>Alcance de la Auditoría</label>
                    <textarea name="alcance" value={form.alcance} onChange={handleChange} rows={2} placeholder="Procesos, áreas o requisitos a auditar..." />
                  </div>

                  <div className={styles.field}>
                    <label>Requisitos adicionales</label>
                    <textarea name="comentarios" value={form.comentarios} onChange={handleChange} rows={3} placeholder="Información adicional, requisitos especiales..." />
                  </div>

                  <button type="submit" className={styles.submitBtn}>Solicitar Auditoría</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OtrasAuditorias;
