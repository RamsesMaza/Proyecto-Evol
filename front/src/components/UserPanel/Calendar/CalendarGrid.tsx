import { useMemo } from 'react';
import { FaBell, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import type { CalendarEvent } from './Calendar';
import { formatDate } from './Calendar';
import styles from './Calendar.module.scss';

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  if (c.length < 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface Props {
  view: 'month' | 'week' | 'day';
  year: number;
  month: number;
  daysInMonth: number;
  firstDOW: number;
  today: Date;
  selectedDate: string;
  events: CalendarEvent[];
  onDaySelect: (date: string) => void;
  onEventClick: (ev: CalendarEvent) => void;
}

const CELL_COUNT = 42;
const DOW_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/* ═══════════ MONTH VIEW ═══════════ */
const MonthView = ({ year, month, daysInMonth, firstDOW, todayStr, selectedDate, events, onDaySelect, onEventClick }: any) => {
  const cells = useMemo(() => {
    const prev = new Date(year, month, 0).getDate();
    const result: { day: number; date: string; isCurrent: boolean }[] = [];
    for (let i = 0; i < CELL_COUNT; i++) {
      let day: number, isCurrent: boolean;
      if (i < firstDOW) { day = prev - firstDOW + 1 + i; isCurrent = false; }
      else if (i >= firstDOW + daysInMonth) { day = i - firstDOW - daysInMonth + 1; isCurrent = false; }
      else { day = i - firstDOW + 1; isCurrent = true; }
      const d = new Date(year, month + (i < firstDOW ? -1 : i >= firstDOW + daysInMonth ? 1 : 0), day);
      result.push({ day, date: formatDate(d), isCurrent });
    }
    return result;
  }, [year, month, daysInMonth, firstDOW]);

  return (
    <div className={styles.grid}>
      {cells.map((cell, idx) => {
        const dayEvents = events.filter((e: CalendarEvent) => e.date === cell.date);
        const isToday = cell.date === todayStr;
        const isSelected = cell.date === selectedDate;
        return (
          <div key={idx}
            className={`${styles.dayCell} ${!cell.isCurrent ? styles.dayOther : ''} ${isToday ? styles.dayToday : ''} ${isSelected ? styles.daySelected : ''}`}
            onClick={() => onDaySelect(cell.date)}>
            <span className={styles.dayNum}>{cell.day}</span>
            {dayEvents.length > 0 && (
              <div className={styles.eventDots}>
                {dayEvents.slice(0, 2).map((ev: CalendarEvent) => {
                  const ec = ev.color || (ev.type === 'reminder' ? '#dc2626' : '#2563eb');
                  return (
                    <span key={ev.id}
                      className={styles.eventTag}
                      style={{ background: hexToRgba(ec, 0.12), color: ec, borderLeft: `2px solid ${ec}` }}
                      onClick={e => { e.stopPropagation(); onEventClick(ev); }} title={ev.title}>
                      {ev.title}
                    </span>
                  );
                })}
                {dayEvents.length > 2 && <span className={styles.moreTag}>+{dayEvents.length - 2} más</span>}
              </div>
            )}
            <div className={styles.dayHover} />
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════ WEEK VIEW ═══════════ */
const WeekView = ({ selectedDate, todayStr, events, onDaySelect, onEventClick }: any) => {
  const base = new Date(selectedDate + 'T00:00:00');
  const startOfWeek = new Date(base);
  startOfWeek.setDate(base.getDate() - base.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  return (
    <div className={styles.weekGrid}>
      {days.map((d: Date) => {
        const ds = formatDate(d);
        const dayEvents = events.filter((e: CalendarEvent) => e.date === ds);
        const isToday = ds === todayStr;
        const isSelected = ds === selectedDate;
        return (
          <div key={ds} className={`${styles.weekCol} ${isToday ? styles.weekColToday : ''} ${isSelected ? styles.weekColSelected : ''}`}
            onClick={() => onDaySelect(ds)}>
            <div className={styles.weekColHeader}>
              <span className={styles.weekColDOW}>{DOW_FULL[d.getDay()].slice(0, 3)}</span>
              <span className={`${styles.weekColNum} ${isToday ? styles.weekColNumToday : ''}`}>{d.getDate()}</span>
            </div>
            <div className={styles.weekEvents}>
              {dayEvents.length === 0 && <span className={styles.weekEmpty}>Sin eventos</span>}
              {dayEvents.map((ev: CalendarEvent) => {
                const ec = ev.color || (ev.type === 'reminder' ? '#dc2626' : '#2563eb');
                return (
                  <div key={ev.id} className={styles.weekEvent}
                    style={{ borderLeftColor: ec, background: hexToRgba(ec, 0.06) }}
                    onClick={e => { e.stopPropagation(); onEventClick(ev); }}>
                    <span className={styles.weekEventTime} style={{ color: ec }}>{ev.from || 'Todo el día'}</span>
                    <span className={styles.weekEventTitle}>{ev.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════ DAY VIEW ═══════════ */
const DayView = ({ selectedDate, events, onEventClick }: any) => {
  const dayEvents = events.filter((e: CalendarEvent) => e.date === selectedDate);

  if (dayEvents.length === 0) {
    return (
      <div className={styles.dayView}>
        <div className={styles.dayEmpty}>
          <FaCalendarAlt className={styles.dayEmptyIcon} />
          <h3>Sin eventos este día</h3>
          <p>Selecciona otro día o crea un nuevo evento</p>
        </div>
      </div>
    );
  }

  const sorted = [...dayEvents].sort((a: CalendarEvent, b: CalendarEvent) => {
    if (!a.from) return 1;
    if (!b.from) return -1;
    return a.from.localeCompare(b.from);
  });

  return (
    <div className={styles.dayView}>
      <div className={styles.dayTimeline}>
        {sorted.map((ev: CalendarEvent) => (
          <div key={ev.id} className={styles.dayEvent} onClick={() => onEventClick(ev)}>
            <div className={styles.dayEventDot} style={{ background: ev.color || (ev.type === 'reminder' ? '#dc2626' : '#2563eb') }} />
            <div className={styles.dayEventTime}>
              <span>{ev.from || '—'}</span>
              {ev.to && <><FaChevronRight className={styles.dayEventArrow} /><span>{ev.to}</span></>}
            </div>
            <div className={styles.dayEventBody}>
              <span className={styles.dayEventTitle}>{ev.title}</span>
              {ev.location && <span className={styles.dayEventLoc}>{ev.location}</span>}
              <span className={styles.dayEventType} style={{ background: hexToRgba(ev.color || (ev.type === 'reminder' ? '#dc2626' : '#2563eb'), 0.1), color: ev.color || (ev.type === 'reminder' ? '#dc2626' : '#2563eb') }}>
                {ev.type === 'reminder' ? <FaBell className={styles.tagIcon} /> : <FaCalendarAlt className={styles.tagIcon} />} {ev.type === 'reminder' ? 'Recordatorio' : 'Evento'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════ MAIN ═══════════ */
const CalendarGrid = (props: Props) => {
  const todayStr = formatDate(props.today);
  const selectedDate = props.selectedDate;

  if (props.view === 'month') return <MonthView {...props} todayStr={todayStr} />;
  if (props.view === 'week') return <WeekView todayStr={todayStr} selectedDate={selectedDate} events={props.events} onDaySelect={props.onDaySelect} onEventClick={props.onEventClick} />;
  return <DayView selectedDate={selectedDate} events={props.events} onEventClick={props.onEventClick} />;
};

export default CalendarGrid;
