import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaPaperPlane, FaCheckCircle, FaChevronLeft, FaEnvelope, FaUser, FaPlus, FaTimes, FaSpinner, FaUserPlus } from 'react-icons/fa';
import { fetchConversations, fetchThread, sendMessage, fetchUnreadCount, fetchContacts, type Conversation, type Message, type MessageUser } from '../../../services/messagesApi';
import { useAuth } from '../../../context/AuthContext';
import styles from './Messages.module.scss';

interface Props {
  pendingContactId?: number | null;
  onContactConsumed?: () => void;
}

const Messages = ({ pendingContactId, onContactConsumed }: Props) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const chatEnd = useRef<HTMLDivElement>(null);

  /* New message modal */
  const [showNewModal, setShowNewModal] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [contacts, setContacts] = useState<MessageUser[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const contactTimer = useRef<ReturnType<typeof setTimeout>>();

  const loadConversations = async () => {
    try {
      const [convs, unreadCount] = await Promise.all([
        fetchConversations(),
        fetchUnreadCount(),
      ]);
      setConversations(convs);
      setUnread(unreadCount.count);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadConversations(); }, []);

  /* Handle pending contact (navigated from CourseView) */
  useEffect(() => {
    if (pendingContactId && conversations.length > 0) {
      const existing = conversations.find(c => c.user.id === pendingContactId);
      if (existing) {
        setSelectedUserId(pendingContactId);
        loadThread(pendingContactId);
      } else {
        setShowNewModal(true);
      }
      onContactConsumed?.();
    }
  }, [pendingContactId, conversations]);

  const loadThread = async (otherUserId: number) => {
    setSelectedUserId(otherUserId);
    try {
      const msgs = await fetchThread(otherUserId);
      setMessages(msgs);
      setTimeout(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) { console.error(e); }
  };

  const active = selectedUserId ? conversations.find(c => c.user.id === selectedUserId) : null;

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim() || !selectedUserId) return;
    try {
      const msg = await sendMessage({ receiverId: selectedUserId, body: input.trim() });
      setMessages(prev => [...prev, msg]);
      setInput('');
      loadConversations();
    } catch (e) { console.error(e); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filtered = conversations.filter(c =>
    `${c.user.firstName} ${c.user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.user.email.toLowerCase().includes(search.toLowerCase())
  );

  /* ─── Contact picker ─── */
  const openContactPicker = () => {
    setShowNewModal(true);
    setContactSearch('');
    setContacts([]);
    fetchContacts().then(res => setContacts(res.users)).catch(() => {});
  };

  const handleContactSearch = (q: string) => {
    setContactSearch(q);
    if (contactTimer.current) clearTimeout(contactTimer.current);
    if (q.length < 2) {
      fetchContacts().then(res => setContacts(res.users)).catch(() => {});
      return;
    }
    setContactsLoading(true);
    contactTimer.current = setTimeout(async () => {
      try {
        const res = await fetchContacts(q);
        setContacts(res.users.filter(u => u.id !== user?.id));
      } catch { setContacts([]); }
      setContactsLoading(false);
    }, 300);
  };

  const selectContact = (u: MessageUser) => {
    setShowNewModal(false);
    const existing = conversations.find(c => c.user.id === u.id);
    if (existing) {
      setSelectedUserId(u.id);
      loadThread(u.id);
    } else {
      const dummyConv: Conversation = {
        user: u,
        lastMessage: { id: 0, senderId: 0, receiverId: u.id, subject: null, body: '', read: true, parentId: null, createdAt: new Date().toISOString(), sender: { id: 0, firstName: '', lastName: '', email: '' } },
        unread: 0,
      };
      setConversations(prev => [dummyConv, ...prev]);
      setSelectedUserId(u.id);
      setMessages([]);
    }
  };

  return (
    <div className={styles.wrapper}>
      {selectedUserId && (
        <button className={styles.mobileBack} onClick={() => setSelectedUserId(null)}><FaChevronLeft /> Volver</button>
      )}

      <div className={styles.layout}>
        <div className={`${styles.listCol} ${selectedUserId ? styles.listHidden : ''}`}>
          <div className={styles.listHeader}>
            <div className={styles.listHeaderTop}>
              <h2 className={styles.listTitle}>
                Mensajes {unread > 0 && <span className={styles.unreadBadge}>{unread}</span>}
              </h2>
              <button className={styles.newMsgBtn} onClick={openContactPicker} title="Nuevo mensaje">
                <FaPlus />
              </button>
            </div>
            <div className={styles.searchWrap}>
              <FaSearch className={styles.searchIcon} />
              <input className={styles.searchInput} type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className={styles.emptyList}><p>Cargando...</p></div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyList}>
              <FaEnvelope className={styles.emptyIcon} />
              <p>{search ? 'Sin resultados' : 'No tienes mensajes aún'}</p>
              {!search && (
                <button className={styles.startChatBtn} onClick={openContactPicker}>
                  <FaUserPlus /> Iniciar conversación
                </button>
              )}
            </div>
          ) : (
            <div className={styles.convList}>
              {filtered.map(c => (
                <button key={c.user.id} className={`${styles.convItem} ${selectedUserId === c.user.id ? styles.convActive : ''}`} onClick={() => loadThread(c.user.id)}>
                  <div className={styles.convAvatar}>
                    {`${c.user.firstName.charAt(0)}${c.user.lastName.charAt(0)}`}
                    {c.unread > 0 && <span className={styles.onlineDot} />}
                  </div>
                  <div className={styles.convInfo}>
                    <div className={styles.convTop}>
                      <span className={styles.convTeacher}>{c.user.firstName} {c.user.lastName}</span>
                      <span className={styles.convTime}>{new Date(c.lastMessage.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={styles.convCourse}>{c.user.email}</span>
                    <span className={styles.convLast}>{c.lastMessage.body}</span>
                  </div>
                  {c.unread > 0 && <span className={styles.unreadBadge}>{c.unread}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`${styles.chatCol} ${!selectedUserId ? styles.chatEmpty : ''}`}>
          {!selectedUserId ? (
            <div className={styles.chatPlaceholder}>
              <FaEnvelope className={styles.placeholderIcon} />
              <h3>Selecciona una conversación</h3>
              <p>Elige un contacto para ver tus mensajes</p>
              <button className={styles.startChatBtn} onClick={openContactPicker}>
                <FaUserPlus /> Iniciar conversación
              </button>
            </div>
          ) : (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderLeft}>
                  <div className={styles.chatAvatar}>
                    {active ? `${active.user.firstName.charAt(0)}${active.user.lastName.charAt(0)}` : '?'}
                  </div>
                  <div>
                    <span className={styles.chatTeacher}>{active ? `${active.user.firstName} ${active.user.lastName}` : 'Usuario'}</span>
                    <div className={styles.chatStatus}>
                      <FaUser className={styles.chatStatusIcon} />
                      <span>{active?.user.email || ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.msgArea}>
                {messages.length === 0 ? (
                  <div className={styles.emptyList}><p>No hay mensajes. Envía el primero.</p></div>
                ) : (
                  messages.map((msg, idx) => {
                    const isOwn = msg.senderId === user?.id;
                    const showDate = idx === 0 || new Date(messages[idx - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
                    return (
                      <div key={msg.id}>
                        {showDate && <div className={styles.dateDivider}><span>{new Date(msg.createdAt).toLocaleDateString()}</span></div>}
                        <div className={`${styles.msgRow} ${isOwn ? styles.msgOwn : styles.msgOther}`}>
                          <div className={`${styles.msgBubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}>
                            <p className={styles.msgText}>{msg.body}</p>
                            <div className={styles.msgMeta}>
                              <span className={styles.msgTime}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isOwn && <FaCheckCircle className={styles.msgRead} />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEnd} />
              </div>

              <div className={styles.inputArea}>
                <textarea
                  className={styles.inputField}
                  placeholder="Escribe un mensaje..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim()}>
                  <FaPaperPlane />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── New Message Modal ─── */}
      {showNewModal && (
        <div className={styles.contactOverlay} onClick={() => setShowNewModal(false)}>
          <div className={styles.contactModal} onClick={e => e.stopPropagation()}>
            <div className={styles.contactModalHead}>
              <h3 className={styles.contactModalTitle}><FaUserPlus /> Nuevo mensaje</h3>
              <button className={styles.contactModalClose} onClick={() => setShowNewModal(false)}><FaTimes /></button>
            </div>
            <div className={styles.contactSearchWrap}>
              <FaSearch className={styles.contactSearchIcon} />
              <input className={styles.contactSearchInput}
                placeholder="Buscar por nombre o email..."
                value={contactSearch}
                onChange={e => handleContactSearch(e.target.value)}
                autoFocus
              />
              {contactsLoading && <FaSpinner className={styles.contactSearchSpin} />}
            </div>
            <div className={styles.contactList}>
              {contacts.length === 0 ? (
                <div className={styles.contactEmpty}>
                  {contactSearch.length < 2 ? 'Cargando contactos...' : 'Sin resultados'}
                </div>
              ) : (
                contacts.map(c => (
                  <button key={c.id} className={styles.contactItem} onClick={() => selectContact(c)}>
                    <div className={styles.contactAvatar}>
                      {`${c.firstName.charAt(0)}${c.lastName.charAt(0)}`}
                    </div>
                    <div className={styles.contactInfo}>
                      <span className={styles.contactName}>{c.firstName} {c.lastName}</span>
                      <span className={styles.contactEmail}>{c.email}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
