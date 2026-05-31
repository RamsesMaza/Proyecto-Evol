import { useState, useEffect } from 'react';
import { FaBell, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import type { CalendarEvent } from './Calendar';
import styles from './Calendar.module.scss';

function getContrastColor(hex: string): string {
  const c = hex.replace('#', '');
  if (c.length < 6) return '#0f172a';
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#0f172a' : '#ffffff';
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  if (c.length < 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface Props {
  editing: CalendarEvent | null;
  events: CalendarEvent[];
  selectedDate: string;
  onSave: (ev: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const COLORS = [
  { key: 'reminder', value: '#dc2626', label: 'Rojo' },
  { key: 'event', value: '#2563eb', label: 'Azul' },
  { key: 'green', value: '#10b981', label: 'Verde' },
  { key: 'yellow', value: '#f59e0b', label: 'Amarillo' },
  { key: 'purple', value: '#8b5cf6', label: 'Púrpura' },
  { key: 'pink', value: '#ec4899', label: 'Rosa' },
  { key: 'orange', value: '#f97316', label: 'Naranja' },
  { key: 'teal', value: '#14b8a6', label: 'Teal' },
];

const EventPanel = ({ editing, selectedDate, onSave, onDelete, onClose }: Props) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'reminder' | 'event'>('event');
  const [date, setDate] = useState<Date>(new Date());
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState('#2563eb');

  const isEditing = editing && !!editing.id;

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || '');
      setType(editing.type || 'event');
      setDate(editing.date ? new Date(editing.date + 'T00:00:00') : new Date());
      setFrom(editing.from || '');
      setTo(editing.to || '');
      setLocation(editing.location || '');
      setColor(editing.color || (editing.type === 'reminder' ? '#dc2626' : '#2563eb'));
    } else {
      resetForm();
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) setColor(type === 'reminder' ? '#dc2626' : '#2563eb');
  }, [type, editing]);

  const resetForm = () => {
    setTitle('');
    setType('event');
    const d = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    setDate(d);
    setFrom('');
    setTo('');
    setLocation('');
    setColor('#2563eb');
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    onSave({
      id: editing?.id || '',
      title: title.trim(),
      date: `${y}-${m}-${d}`,
      from,
      to,
      type,
      location,
      color,
    });
    resetForm();
  };

  const handleDelete = () => {
    if (editing?.id) onDelete(editing.id);
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const today = new Date();

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>{isEditing ? 'Editar Evento' : 'Nuevo Evento'}</h3>
        <button className={styles.panelClose} onClick={handleCancel}><FaTimes /></button>
      </div>

      {/* Type selector */}
      <div className={styles.typeGroup}>
        <button className={`${styles.typeBtn} ${type === 'reminder' ? styles.typeActive : ''}`} onClick={() => setType('reminder')}><FaBell className={styles.typeIcon} /> Recordatorio</button>
        <button className={`${styles.typeBtn} ${type === 'event' ? styles.typeActive : ''}`} onClick={() => setType('event')}><FaCalendarAlt className={styles.typeIcon} /> Evento</button>
      </div>

      {/* Title */}
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Título</label>
        <input className={styles.fieldInput} type="text" placeholder="Nombre del evento" value={title} onChange={e => setTitle(e.target.value)} />
      </div>

      {/* Date */}
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Fecha</label>
        <DatePicker
          selected={date}
          onChange={(d: Date | null) => d && setDate(d)}
          dateFormat="dd/MM/yyyy"
          className={styles.fieldInput}
          wrapperClassName={styles.dateWrap}
          popperClassName={styles.datePopper}
        />
      </div>

      {/* Time range */}
      <div className={styles.timeRow}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Desde</label>
          <input className={styles.fieldInput} type="time" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Hasta</label>
          <input className={styles.fieldInput} type="time" value={to} onChange={e => setTo(e.target.value)} />
        </div>
      </div>

      {/* Color picker */}
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Color</label>
        <div className={styles.colorRow}>
          {COLORS.map(c => (
            <button key={c.key}
              className={`${styles.colorSwatch} ${color === c.value ? styles.colorActive : ''}`}
              style={{ background: c.value, color: getContrastColor(c.value) }}
              onClick={() => setColor(c.value)}
              title={c.label}
            >
              {color === c.value && <span className={styles.swatchCheck}>✓</span>}
            </button>
          ))}
        </div>
        {color && <span className={styles.colorLabel} style={{ color }}>● {COLORS.find(c => c.value === color)?.label || 'Personalizado'}</span>}
      </div>

      {/* Location */}
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Ubicación <span className={styles.optional}>(opcional)</span></label>
        <input className={styles.fieldInput} type="text" placeholder="Lugar o enlace" value={location} onChange={e => setLocation(e.target.value)} />
      </div>

      {/* Mini Calendar */}
      <div className={styles.miniCal}>
        <div className={styles.miniCalHeader}>
          <button className={styles.miniNav} onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}>{'<'}</button>
          <span>{monthNames[date.getMonth()]} {date.getFullYear()}</span>
          <button className={styles.miniNav} onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}>{'>'}</button>
        </div>
        <div className={styles.miniDOW}>
          {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(d => <span key={d}>{d}</span>)}
        </div>
        <MiniMonthGrid year={date.getFullYear()} month={date.getMonth()} selected={date} onSelect={setDate} today={today} />
      </div>

      {/* Preview */}
      {title.trim() && (
        <div className={styles.previewRow}>
          <span className={styles.fieldLabel}>Vista previa</span>
          <div className={styles.previewTag} style={{ background: hexToRgba(color, 0.12), color, borderLeft: `3px solid ${color}` }}>
            <span className={styles.previewBadge} style={{ background: color, color: getContrastColor(color) }}>
              {type === 'reminder' ? <FaBell /> : <FaCalendarAlt />}
            </span>
            <span className={styles.previewText}>{title}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.saveBtn} onClick={handleSave} disabled={!title.trim()}>{isEditing ? 'Guardar' : 'Crear'}</button>
        {isEditing && <button className={styles.deleteBtn} onClick={handleDelete}>Eliminar</button>}
        <button className={styles.cancelBtn} onClick={handleCancel}>Cancelar</button>
      </div>
    </div>
  );
};

/* ─── Mini Month Grid ─── */
interface MiniProps {
  year: number; month: number; selected: Date; onSelect: (d: Date) => void; today: Date;
}

const MiniMonthGrid = ({ year, month, selected, onSelect, today }: MiniProps) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDOW = new Date(year, month, 1).getDay();
  const todayStr = formatMini(today);
  const selectedStr = formatMini(selected);

  const cells: { day: number; date: string; current: boolean }[] = [];
  const prev = new Date(year, month, 0).getDate();
  for (let i = 0; i < 42; i++) {
    let day: number, current: boolean;
    if (i < firstDOW) { day = prev - firstDOW + 1 + i; current = false; }
    else if (i >= firstDOW + daysInMonth) { day = i - firstDOW - daysInMonth + 1; current = false; }
    else { day = i - firstDOW + 1; current = true; }
    const d = new Date(year, month + (current ? 0 : i < firstDOW ? -1 : 1), day);
    cells.push({ day, date: formatMini(d), current });
  }

  return (
    <div className={styles.miniGrid}>
      {cells.map((c, i) => {
        const isSel = c.date === selectedStr;
        const isT = c.date === todayStr && !isSel;
        return (
          <button key={i}
            className={`${styles.miniCell} ${!c.current ? styles.miniOther : ''} ${isSel ? styles.miniSel : ''} ${isT ? styles.miniToday : ''}`}
            onClick={() => c.current && onSelect(new Date(year, month, c.day))}
            disabled={!c.current}>
            {c.day}
          </button>
        );
      })}
    </div>
  );
};

const formatMini = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default EventPanel;
