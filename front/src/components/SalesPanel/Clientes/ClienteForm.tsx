import { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import type { Cliente, ClienteFormData, ClienteStatus } from './types';
import styles from '../SalesClientes.module.scss';

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSave: (data: ClienteFormData) => void;
  onClose: () => void;
}

interface FieldError {
  field: string;
  message: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s+\-()]{6,20}$/;

const initialForm = (c?: Cliente | null): ClienteFormData => ({
  firstName: c?.firstName || '',
  lastName: c?.lastName || '',
  email: c?.email || '',
  phone: c?.phone || '',
  company: c?.company || '',
  position: c?.position || '',
  address: c?.address || '',
  status: c?.status || 'nuevo',
  notes: c?.notes || '',
  tags: c?.tags || [],
});

const ClienteForm = ({ cliente, onSave, onClose }: ClienteFormProps) => {
  const isEdit = !!cliente;
  const [form, setForm] = useState<ClienteFormData>(initialForm(cliente));
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => { setForm(initialForm(cliente)); }, [cliente]);

  const set = (field: keyof ClienteFormData, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => prev.filter(e => e.field !== field));
  };

  const validate = (): boolean => {
    const errs: FieldError[] = [];
    if (!form.firstName.trim()) errs.push({ field: 'firstName', message: 'El nombre es obligatorio' });
    if (!form.lastName.trim()) errs.push({ field: 'lastName', message: 'El apellido es obligatorio' });
    if (!form.email.trim()) errs.push({ field: 'email', message: 'El correo es obligatorio' });
    else if (!emailRegex.test(form.email)) errs.push({ field: 'email', message: 'Correo inválido' });
    if (!form.phone.trim()) errs.push({ field: 'phone', message: 'El teléfono es obligatorio' });
    else if (!phoneRegex.test(form.phone)) errs.push({ field: 'phone', message: 'Teléfono inválido' });
    if (!form.company.trim()) errs.push({ field: 'company', message: 'La empresa es obligatoria' });
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSave(form);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      set('tags', [...form.tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    set('tags', form.tags.filter(t => t !== tag));
  };

  const err = (field: string) => errors.find(e => e.field === field);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.formModal} onClick={e => e.stopPropagation()}>
        <div className={styles.formModalHeader}>
          <h3 className={styles.formModalTitle}>{isEdit ? 'Editar Cliente' : 'Agregar Cliente'}</h3>
          <button className={styles.formModalClose} onClick={onClose}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formModalBody}>
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Nombre *</label>
              <input className={`${styles.formInput} ${err('firstName') ? styles.formInputError : ''}`} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Ej: Carlos" />
              {err('firstName') && <span className={styles.formError}>{err('firstName')?.message}</span>}
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Apellido *</label>
              <input className={`${styles.formInput} ${err('lastName') ? styles.formInputError : ''}`} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Ej: Gutiérrez" />
              {err('lastName') && <span className={styles.formError}>{err('lastName')?.message}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Correo *</label>
              <input className={`${styles.formInput} ${err('email') ? styles.formInputError : ''}`} value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@ejemplo.com" type="email" />
              {err('email') && <span className={styles.formError}>{err('email')?.message}</span>}
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Teléfono *</label>
              <input className={`${styles.formInput} ${err('phone') ? styles.formInputError : ''}`} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+51 999 888 777" type="tel" />
              {err('phone') && <span className={styles.formError}>{err('phone')?.message}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Empresa *</label>
              <input className={`${styles.formInput} ${err('company') ? styles.formInputError : ''}`} value={form.company} onChange={e => set('company', e.target.value)} placeholder="Nombre de la empresa" />
              {err('company') && <span className={styles.formError}>{err('company')?.message}</span>}
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Cargo</label>
              <input className={styles.formInput} value={form.position} onChange={e => set('position', e.target.value)} placeholder="Ej: Gerente General" />
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Dirección</label>
            <input className={styles.formInput} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Dirección completa" />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Estado</label>
              <select className={styles.formSelect} value={form.status} onChange={e => set('status', e.target.value as ClienteStatus)}>
                <option value="nuevo">Nuevo</option>
                <option value="activo">Activo</option>
                <option value="frecuente">Frecuente</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Etiquetas</label>
              <div className={styles.tagInputWrap}>
                <input className={styles.formInput} value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Escribe y presiona Enter" />
                <button type="button" className={styles.tagAddBtn} onClick={addTag}>+</button>
              </div>
              {form.tags.length > 0 && (
                <div className={styles.formTags}>
                  {form.tags.map(t => <span key={t} className={styles.formTag}>{t} <button type="button" onClick={() => removeTag(t)} className={styles.formTagRemove}><FaTimes /></button></span>)}
                </div>
              )}
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Notas</label>
            <textarea className={styles.formTextarea} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notas internas sobre el cliente..." rows={3} />
          </div>

          <div className={styles.formModalFooter}>
            <button type="button" className={styles.modalBtnSecondary} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.modalBtnPrimary}><FaSave /> {isEdit ? 'Guardar Cambios' : 'Crear Cliente'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteForm;
