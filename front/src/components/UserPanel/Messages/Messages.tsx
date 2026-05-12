import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaPaperPlane, FaPaperclip, FaCheckCircle, FaCircle, FaChevronLeft, FaBook, FaEnvelope } from 'react-icons/fa';
import styles from './Messages.module.scss';

interface Message {
  id: string;
  text: string;
  sender: 'student' | 'teacher';
  time: string;
  date: string;
  file?: { name: string; size: string };
}

interface Conversation {
  id: string;
  course: string;
  courseCode: string;
  teacher: string;
  teacherAvatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

const now = new Date();
const today = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

const conversations: Conversation[] = [
  {
    id: 'c1', course: 'Implementación ISO 9001:2015', courseCode: 'ISO-9001-2026',
    teacher: 'Carlos Mendoza', teacherAvatar: 'CM',
    lastMessage: 'Perfecto, revisaré tu avance y te daré feedback antes del viernes.',
    lastTime: '10:32', unread: 2, online: true,
    messages: [
      { id: 'm1', text: 'Buenos días, profesor. Quería consultarle sobre la tarea de la Semana 4.', sender: 'student', time: '09:15', date: today },
      { id: 'm2', text: '¡Hola! Claro, ¿qué necesitas saber exactamente?', sender: 'teacher', time: '09:28', date: today },
      { id: 'm3', text: 'En el ejercicio práctico, no entiendo bien el apartado de identificación de riesgos. ¿Podría darme un ejemplo?', sender: 'student', time: '09:45', date: today },
      { id: 'm4', text: 'Claro, te comparto un ejemplo resuelto. Revisa el archivo adjunto.', sender: 'teacher', time: '10:05', date: today, file: { name: 'Ejemplo_Riesgos_ISO9001.pdf', size: '2.4 MB' } },
      { id: 'm5', text: 'Muchas gracias, me queda más claro ahora.', sender: 'student', time: '10:18', date: today },
      { id: 'm6', text: 'Perfecto, revisaré tu avance y te daré feedback antes del viernes.', sender: 'teacher', time: '10:32', date: today },
    ],
  },
  {
    id: 'c2', course: 'Gestión Ambiental Empresarial', courseCode: 'ISO-14001-2026',
    teacher: 'María Torres', teacherAvatar: 'MT',
    lastMessage: 'Te envié la guía actualizada por correo. Revísala por favor.',
    lastTime: 'Ayer', unread: 0, online: false,
    messages: [
      { id: 'm7', text: 'Hola, María. Quería saber si hay algún cambio en el cronograma.', sender: 'student', time: '16:00', date: 'Ayer' },
      { id: 'm8', text: 'Sí, ajustamos la Semana 6. Te envié la guía actualizada por correo. Revísala por favor.', sender: 'teacher', time: '17:20', date: 'Ayer' },
    ],
  },
  {
    id: 'c3', course: 'Seguridad de la Información', courseCode: 'ISO-27001-2026',
    teacher: 'Ana Castillo', teacherAvatar: 'AC',
    lastMessage: 'Excelente trabajo en el cuestionario. Sigue así.',
    lastTime: 'Lun', unread: 0, online: true,
    messages: [
      { id: 'm9', text: 'Profe, ya terminé el cuestionario de la Semana 3.', sender: 'student', time: '14:00', date: 'Lun' },
      { id: 'm10', text: 'Excelente trabajo en el cuestionario. Sigue así.', sender: 'teacher', time: '15:45', date: 'Lun' },
    ],
  },
  {
    id: 'c4', course: 'Salud Ocupacional ISO 45001', courseCode: 'ISO-45001-2026',
    teacher: 'Pedro Rivas', teacherAvatar: 'PR',
    lastMessage: 'Nos vemos en la sesión presencial del sábado.',
    lastTime: 'Vie', unread: 1, online: false,
    messages: [
      { id: 'm11', text: '¿La clase presencial de esta semana es el sábado a las 9?', sender: 'student', time: '11:30', date: 'Vie' },
      { id: 'm12', text: 'Así es, nos vemos en la sesión presencial del sábado.', sender: 'teacher', time: '12:00', date: 'Vie' },
    ],
  },
  {
    id: 'c5', course: 'Inocuidad Alimentaria HACCP', courseCode: 'HACCP-2026',
    teacher: 'Lucía Fernández', teacherAvatar: 'LF',
    lastMessage: 'Comparte tu avance en el foro cuando puedas.',
    lastTime: 'Mar', unread: 0, online: false,
    messages: [
      { id: 'm13', text: 'Profe, tengo una duda sobre el diagrama de flujo.', sender: 'student', time: '09:00', date: 'Mar' },
      { id: 'm14', text: 'Claro, comparte tu avance en el foro cuando puedas y lo revisamos.', sender: 'teacher', time: '10:15', date: 'Mar' },
    ],
  },
];

const Messages = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [convs, setConvs] = useState<Conversation[]>(conversations);
  const chatEnd = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const active = convs.find(c => c.id === selected);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages.length]);

  const sendMessage = () => {
    if (!input.trim() || !selected) return;
    const now = new Date();
    const msg: Message = {
      id: `m${Date.now()}`,
      text: input.trim(),
      sender: 'student',
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      date: 'Hoy',
    };
    setConvs(prev => prev.map(c => c.id === selected ? {
      ...c,
      lastMessage: msg.text,
      lastTime: msg.time,
      unread: 0,
      messages: [...c.messages, msg],
    } : { ...c, unread: c.unread }));
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleFile = () => fileRef.current?.click();

  const filtered = convs.filter(c =>
    c.course.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.wrapper}>
      {/* Mobile back */}
      {selected && (
        <button className={styles.mobileBack} onClick={() => setSelected(null)}><FaChevronLeft /> Volver</button>
      )}

      <div className={styles.layout}>
        {/* ─── Left: Conversation List ─── */}
        <div className={`${styles.listCol} ${selected ? styles.listHidden : ''}`}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>Mensajes</h2>
            <div className={styles.searchWrap}>
              <FaSearch className={styles.searchIcon} />
              <input className={styles.searchInput} type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.emptyList}>
              <FaEnvelope className={styles.emptyIcon} />
              <p>{search ? 'Sin resultados' : 'No tienes mensajes aún'}</p>
            </div>
          ) : (
            <div className={styles.convList}>
              {filtered.map(c => (
                <button key={c.id} className={`${styles.convItem} ${selected === c.id ? styles.convActive : ''}`} onClick={() => setSelected(c.id)}>
                  <div className={styles.convAvatar} style={{ background: c.online ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.12)', color: c.online ? '#10b981' : '#94a3b8' }}>
                    {c.teacherAvatar}
                    {c.online && <span className={styles.onlineDot} />}
                  </div>
                  <div className={styles.convInfo}>
                    <div className={styles.convTop}>
                      <span className={styles.convTeacher}>{c.teacher}</span>
                      <span className={styles.convTime}>{c.lastTime}</span>
                    </div>
                    <span className={styles.convCourse}>{c.course}</span>
                    <span className={styles.convLast}>{c.lastMessage}</span>
                  </div>
                  {c.unread > 0 && <span className={styles.unreadBadge}>{c.unread}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Right: Chat Window ─── */}
        <div className={`${styles.chatCol} ${!selected ? styles.chatEmpty : ''}`}>
          {!selected ? (
            <div className={styles.chatPlaceholder}>
              <FaEnvelope className={styles.placeholderIcon} />
              <h3>Selecciona una conversación</h3>
              <p>Elige un curso para ver tus mensajes con el docente</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderLeft}>
                  <div className={styles.chatAvatar} style={{ background: active!.online ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.12)', color: active!.online ? '#10b981' : '#94a3b8' }}>
                    {active!.teacherAvatar}
                  </div>
                  <div>
                    <span className={styles.chatTeacher}>{active!.teacher}</span>
                    <div className={styles.chatStatus}>
                      <FaBook className={styles.chatStatusIcon} />
                      <span>{active!.course}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.chatHeaderRight}>
                  <span className={styles.chatOnline} style={{ color: active!.online ? '#10b981' : '#94a3b8' }}>
                    <FaCircle className={styles.onlineIcon} /> {active!.online ? 'En línea' : 'Desconectado'}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className={styles.msgArea}>
                {active!.messages.map((msg, idx) => {
                  const showDate = idx === 0 || active!.messages[idx - 1].date !== msg.date;
                  return (
                    <div key={msg.id}>
                      {showDate && <div className={styles.dateDivider}><span>{msg.date}</span></div>}
                      <div className={`${styles.msgRow} ${msg.sender === 'student' ? styles.msgOwn : styles.msgOther}`}>
                        <div className={`${styles.msgBubble} ${msg.sender === 'student' ? styles.bubbleOwn : styles.bubbleOther}`}>
                          <p className={styles.msgText}>{msg.text}</p>
                          {msg.file && (
                            <div className={styles.msgFile}>
                              <FaPaperclip className={styles.msgFileIcon} />
                              <span className={styles.msgFileName}>{msg.file.name}</span>
                              <span className={styles.msgFileSize}>{msg.file.size}</span>
                            </div>
                          )}
                          <div className={styles.msgMeta}>
                            <span className={styles.msgTime}>{msg.time}</span>
                            {msg.sender === 'student' && <FaCheckCircle className={styles.msgRead} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEnd} />
              </div>

              {/* Input */}
              <div className={styles.inputArea}>
                <input ref={fileRef} type="file" style={{ display: 'none' }} />
                <button className={styles.attachBtn} onClick={handleFile}><FaPaperclip /></button>
                <textarea
                  className={styles.inputField}
                  placeholder="Escribe un mensaje..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button className={styles.sendBtn} onClick={sendMessage} disabled={!input.trim()}>
                  <FaPaperPlane />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
