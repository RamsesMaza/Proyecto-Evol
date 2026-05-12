import { useState, useEffect, useCallback } from 'react';
import CalendarGrid from './CalendarGrid';
import EventPanel from './EventPanel';
import styles from './Calendar.module.scss';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  from?: string;
  to?: string;
  type: 'reminder' | 'event';
  location?: string;
  color?: string;
}

type ViewMode = 'month' | 'week' | 'day';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const loadEvents = (): CalendarEvent[] => {
  try {
    const raw = localStorage.getItem('up_events');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const Calendar = () => {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [view, setView] = useState<ViewMode>('month');
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(today));
  const [editing, setEditing] = useState<CalendarEvent | null>(null);

  useEffect(() => { localStorage.setItem('up_events', JSON.stringify(events)); }, [events]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDOW = new Date(year, month, 1).getDay();

  const sel = new Date(selectedDate + 'T00:00:00');
  const selDate = sel.getDate();

  const go = (d: number) => {
    if (view === 'month') setCursor(new Date(year, month + d, 1));
    else if (view === 'week') {
      const w = new Date(sel);
      w.setDate(sel.getDate() + d * 7);
      setSelectedDate(formatDate(w));
      setCursor(new Date(w.getFullYear(), w.getMonth(), 1));
    } else {
      const day = new Date(sel);
      day.setDate(sel.getDate() + d);
      setSelectedDate(formatDate(day));
      setCursor(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  };

  const handleDaySelect = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
    const dayEvents = events.filter(e => e.date === dateStr);
    if (dayEvents.length === 1) setEditing(dayEvents[0]);
    else setEditing(null);
  }, [events]);

  const handleAdd = useCallback(() => {
    setEditing({ id: '', title: '', date: selectedDate, type: 'event' });
  }, [selectedDate]);

  const handleEdit = useCallback((e: CalendarEvent) => setEditing(e), []);

  const handleSave = useCallback((ev: CalendarEvent) => {
    if (ev.id && events.some(x => x.id === ev.id)) {
      setEvents(prev => prev.map(x => x.id === ev.id ? ev : x));
    } else {
      setEvents(prev => [...prev, { ...ev, id: genId() }]);
    }
    setEditing(null);
  }, [events]);

  const handleDelete = useCallback((id: string) => {
    setEvents(prev => prev.filter(x => x.id !== id));
    setEditing(null);
  }, []);

  const handlePlus = useCallback(() => {
    setEditing({ id: '', title: '', date: selectedDate, type: 'event' });
  }, [selectedDate]);

  const eventsForDate = (dateStr: string) => events.filter(e => e.date === dateStr);

  return (
    <div className={styles.wrapper}>
      {/* ─── Header ─── */}
      <div className={styles.header}>
        <div className={styles.viewTabs}>
          {(['month', 'week', 'day'] as ViewMode[]).map(v => (
            <button key={v} className={`${styles.viewTab} ${view === v ? styles.viewTabActive : ''}`} onClick={() => setView(v)}>
              {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Día'}
            </button>
          ))}
        </div>

        <div className={styles.nav}>
          <button className={styles.navBtn} onClick={() => go(-1)}>{'<'}</button>
          <span className={styles.navTitle}>
            {view === 'month' && `${MONTHS[month]} ${year}`}
            {view === 'week' && `Semana del ${selDate} ${MONTHS[month]} ${year}`}
            {view === 'day' && `${selDate} ${MONTHS[month]} ${year}`}
          </span>
          <button className={styles.navBtn} onClick={() => go(1)}>{'>'}</button>
        </div>

        <button className={styles.addBtn} onClick={handlePlus}>+ Añadir</button>
      </div>

      {/* ─── Body ─── */}
      <div className={styles.body}>
        <div className={styles.gridCol}>
          {view === 'month' && (
            <>
              <div className={styles.dowRow}>
                {DOW.map(d => <div key={d} className={styles.dowCell}>{d}</div>)}
              </div>
              <CalendarGrid
                view="month"
                year={year} month={month} daysInMonth={daysInMonth} firstDOW={firstDOW}
                today={today} selectedDate={selectedDate} events={events}
                onDaySelect={handleDaySelect} onEventClick={handleEdit}
              />
            </>
          )}
          {view === 'week' && (
            <CalendarGrid
              view="week"
              year={year} month={month} daysInMonth={daysInMonth} firstDOW={firstDOW}
              today={today} selectedDate={selectedDate} events={events}
              onDaySelect={handleDaySelect} onEventClick={handleEdit}
            />
          )}
          {view === 'day' && (
            <CalendarGrid
              view="day"
              year={year} month={month} daysInMonth={daysInMonth} firstDOW={firstDOW}
              today={today} selectedDate={selectedDate} events={events}
              onDaySelect={handleDaySelect} onEventClick={handleEdit}
            />
          )}
        </div>

        <div className={styles.panelCol}>
          <EventPanel
            editing={editing}
            events={events}
            selectedDate={selectedDate}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={() => setEditing(null)}
          />
        </div>
      </div>
    </div>
  );
};

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export { DOW, MONTHS };
export default Calendar;
