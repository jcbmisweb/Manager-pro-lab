import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, Check, CheckCheck, Clock, Search, Users, ArrowLeft } from 'lucide-react';
import { Mensaje, Usuario, Aula, UserSession } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';

interface ChatMessengerProps {
  currentUser: UserSession;
  usuarios: Usuario[];
  aulas: Aula[];
  proyectos: any[];
}

interface ChatThread {
  id: string; // Contact's user ID or Classroom's ID
  tipo: 'individual' | 'grupal';
  nombre: string;
  subtitulo: string;
  ultimoMensaje?: Mensaje;
  unreadCount: number;
  targetUser?: Usuario;
  targetAula?: Aula;
}

export function ChatMessenger({ currentUser, usuarios, aulas, proyectos }: ChatMessengerProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [activeTab, setActiveTab] = useState<'chats' | 'contactos'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [nuevoMensajeText, setNuevoMensajeText] = useState('');
  const [mensajeProyectoId, setMensajeProyectoId] = useState<string>('general');
  const [selectionPrompt, setSelectionPrompt] = useState<{ contact: Usuario; aula?: Aula } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time chat messages from Firestore
  useEffect(() => {
    const q = query(collection(db, "mensajes"), orderBy("fecha", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMensajes(snap.docs.map(doc => doc.data() as Mensaje));
    }, err => console.warn("ChatMessenger snaps err:", err));
    return () => unsub();
  }, []);

  // Determine classroom/group possibilities for a given contact
  const getContactAula = (c: Usuario): Aula | undefined => {
    if (c.rol === 'alumno' && c.aulaId) {
      return aulas.find(a => a.id === c.aulaId);
    }
    if (c.rol === 'profesor') {
      if (currentUser.role === 'alumno' && currentUser.aulaId) {
        const myAula = aulas.find(a => a.id === currentUser.aulaId);
        if (myAula && myAula.profesorId === c.id) {
          return myAula;
        }
      }
      return aulas.find(a => a.profesorId === c.id);
    }
    return undefined;
  };

  // List of contacts current user can message
  const contacts = usuarios.filter(u => {
    if (u.id === currentUser.id || u.estado === 'eliminado') return false;

    if (currentUser.role === 'alumno') {
      if (u.rol === 'profesor') {
        const studentAula = aulas.find(a => a.id === currentUser.aulaId);
        return studentAula ? studentAula.profesorId === u.id : true;
      }
      return u.rol === 'admin';
    } else if (currentUser.role === 'profesor') {
      if (u.rol === 'alumno') {
        const myAssignedAulaIds = aulas.filter(a => a.profesorId === currentUser.id).map(a => a.id);
        return u.aulaId ? myAssignedAulaIds.includes(u.aulaId) : false;
      }
      return u.rol === 'admin';
    } else {
      // Admins can see and chat with anyone
      return true;
    }
  });

  // Calculate accessible classroom groups for the current user
  const myAccessibleAulas = aulas.filter(a => {
    if (currentUser.role === 'alumno') {
      return a.id === currentUser.aulaId;
    } else if (currentUser.role === 'profesor') {
      return a.profesorId === currentUser.id;
    } else {
      return true; // Admins can access all classrooms
    }
  });

  // Automatically mark incoming messages as read when a chat thread is open
  useEffect(() => {
    if (activeChat) {
      if (activeChat.tipo === 'individual') {
        mensajes.forEach(m => {
          if (
            m.tipo !== 'grupal' &&
            m.emisorId === activeChat.id &&
            m.receptorId === currentUser.id &&
            !m.leido
          ) {
            updateDoc(doc(db, "mensajes", m.id), { leido: true }).catch(console.error);
          }
        });
      } else if (activeChat.tipo === 'grupal') {
        mensajes.forEach(m => {
          if (
            m.tipo === 'grupal' &&
            m.aulaId === activeChat.id &&
            m.emisorId !== currentUser.id &&
            !(m.leidos || []).includes(currentUser.id)
          ) {
            const currentLeidos = m.leidos || [];
            updateDoc(doc(db, "mensajes", m.id), {
              leidos: [...currentLeidos, currentUser.id]
            }).catch(console.error);
          }
        });
      }
    }
  }, [activeChat, mensajes, currentUser.id]);

  // Smooth scroll to chat bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, activeChat]);

  // Compute Active Chat Threads (CHATS list)
  const groupThreads: ChatThread[] = myAccessibleAulas.map(aula => {
    const classMessages = mensajes.filter(m => m.tipo === 'grupal' && m.aulaId === aula.id);
    const lastMsg = classMessages.length > 0 ? classMessages[classMessages.length - 1] : undefined;
    const unreadCount = classMessages.filter(
      m => m.emisorId !== currentUser.id && !(m.leidos || []).includes(currentUser.id)
    ).length;

    return {
      id: aula.id,
      tipo: 'grupal',
      nombre: `Aula: ${aula.nombre}`,
      subtitulo: 'Grupo del Aula',
      ultimoMensaje: lastMsg,
      unreadCount,
      targetAula: aula
    };
  });

  const individualUserIds = Array.from(new Set(
    mensajes
      .filter(m => m.tipo !== 'grupal' && (m.emisorId === currentUser.id || m.receptorId === currentUser.id))
      .map(m => m.emisorId === currentUser.id ? m.receptorId : m.emisorId)
  ));

  const individualThreads: ChatThread[] = individualUserIds
    .map(uid => {
      const u = usuarios.find(usr => usr.id === uid);
      if (!u || u.estado === 'eliminado') return null;

      const userMessages = mensajes.filter(m =>
        m.tipo !== 'grupal' &&
        ((m.emisorId === currentUser.id && m.receptorId === u.id) ||
         (m.emisorId === u.id && m.receptorId === currentUser.id))
      );

      const lastMsg = userMessages.length > 0 ? userMessages[userMessages.length - 1] : undefined;
      const unreadCount = userMessages.filter(
        m => m.emisorId === u.id && m.receptorId === currentUser.id && !m.leido
      ).length;

      return {
        id: u.id,
        tipo: 'individual' as const,
        nombre: u.nombre,
        subtitulo: `${u.rol.toUpperCase()} • Directo`,
        ultimoMensaje: lastMsg,
        unreadCount,
        targetUser: u
      };
    })
    .filter(Boolean) as ChatThread[];

  // Merge and sort all active chat threads
  const allThreads = [...groupThreads, ...individualThreads].sort((a, b) => {
    const timeA = a.ultimoMensaje ? new Date(a.ultimoMensaje.fecha).getTime() : 0;
    const timeB = b.ultimoMensaje ? new Date(b.ultimoMensaje.fecha).getTime() : 0;

    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return a.nombre.localeCompare(b.nombre);
  });

  // Filter content with Search query
  const filteredThreads = allThreads.filter(t =>
    t.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subtitulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.ultimoMensaje?.mensaje || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(c =>
    c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.correo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.rol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // When a user selects a contact in the CONTACTS tab
  const handleContactSelection = (c: Usuario) => {
    const aula = getContactAula(c);
    if (aula) {
      setSelectionPrompt({ contact: c, aula });
    } else {
      // Switch straight to Individual Chat
      const thread: ChatThread = {
        id: c.id,
        tipo: 'individual',
        nombre: c.nombre,
        subtitulo: `${c.rol.toUpperCase()} • Directo`,
        unreadCount: 0,
        targetUser: c
      };
      setActiveChat(thread);
      setActiveTab('chats');
    }
  };

  // Send message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensajeText.trim() || !activeChat) return;

    const msgId = 'm-' + Date.now();
    const msg: any = {
      id: msgId,
      emisorId: currentUser.id,
      emisorNombre: currentUser.name || 'Usuario',
      receptorId: activeChat.id,
      tipo: activeChat.tipo,
      mensaje: nuevoMensajeText.trim(),
      fecha: new Date().toISOString(),
      leido: false
    };

    if (activeChat.tipo === 'grupal') {
      msg.aulaId = activeChat.id;
      msg.leidos = [currentUser.id];
    }

    if (mensajeProyectoId !== 'general') {
      msg.proyectoId = mensajeProyectoId;
    }

    setDoc(doc(db, "mensajes", msgId), msg)
      .then(() => {
        setNuevoMensajeText('');
      })
      .catch(console.error);
  };

  // Filter messages for active chat thread
  const conversationMessages = mensajes.filter(m => {
    if (!activeChat) return false;
    if (activeChat.tipo === 'individual') {
      return (
        m.tipo !== 'grupal' &&
        ((m.emisorId === currentUser.id && m.receptorId === activeChat.id) ||
         (m.emisorId === activeChat.id && m.receptorId === currentUser.id))
      );
    } else {
      return m.tipo === 'grupal' && m.aulaId === activeChat.id;
    }
  });

  // Get active student projects for Dropdown Context
  const relevantProjects = proyectos.filter(p => {
    if (!activeChat) return false;
    if (currentUser.role === 'alumno') {
      return p.alumnoId === currentUser.id;
    } else {
      return p.alumnoId === (activeChat.tipo === 'individual' ? activeChat.id : '');
    }
  });

  // Date formatter helper
  const formatMsgDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md grid grid-cols-1 md:grid-cols-3 h-[580px] relative">
      
      {/* LEFT SIDEBAR: Conversations & Contacts */}
      <div className={`border-r border-slate-200 flex flex-col h-full bg-slate-50 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Sidebar Header: WhatsApp style */}
        <div className="p-3 bg-[#00a884] text-white flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-700/50 flex items-center justify-center font-bold text-xs uppercase text-white">
              {currentUser.name ? currentUser.name[0] : 'U'}
            </div>
            <div>
              <h4 className="font-bold text-xs tracking-wide line-clamp-1">{currentUser.name}</h4>
              <p className="text-[9px] text-emerald-100 uppercase font-bold tracking-wider">{currentUser.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-white">
          <button
            onClick={() => { setActiveTab('chats'); setSearchQuery(''); }}
            className={`py-3 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'chats'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chats
            {allThreads.reduce((sum, t) => sum + t.unreadCount, 0) > 0 && (
              <span className="bg-[#00a884] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {allThreads.reduce((sum, t) => sum + t.unreadCount, 0)}
              </span>
            )}
          </button>
          
          <button
            onClick={() => { setActiveTab('contactos'); setSearchQuery(''); }}
            className={`py-3 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'contactos'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Contactos
          </button>
        </div>

        {/* Real-time Search Input */}
        <div className="p-2 bg-white border-b border-slate-100">
          <div className="relative flex items-center bg-slate-100 rounded-lg px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder={activeTab === 'chats' ? "Buscar conversación..." : "Buscar contacto..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-700 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Sidebar Scroller list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
          {activeTab === 'chats' ? (
            filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-slate-400 italic text-xs">
                No hay conversaciones activas.<br />Ve a la pestaña de "Contactos" para iniciar una.
              </div>
            ) : (
              filteredThreads.map(t => {
                const isActive = activeChat?.id === t.id && activeChat?.tipo === t.tipo;
                const formattedTime = t.ultimoMensaje ? formatMsgDate(t.ultimoMensaje.fecha) : '';
                
                return (
                  <button
                    key={`${t.tipo}-${t.id}`}
                    onClick={() => setActiveChat(t)}
                    className={`w-full p-3 text-left flex items-start gap-3 transition-colors ${
                      isActive ? 'bg-slate-100 border-l-4 border-[#00a884]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-full shrink-0 ${t.tipo === 'grupal' ? 'bg-emerald-100 text-[#00a884]' : 'bg-slate-100 text-slate-600'}`}>
                      {t.tipo === 'grupal' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-bold text-xs text-slate-800 line-clamp-1">{t.nombre}</span>
                        <span className="text-[9px] text-slate-400 font-medium shrink-0">{formattedTime}</span>
                      </div>
                      
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-[10px] text-slate-500 truncate flex-1">
                          {t.ultimoMensaje ? (
                            <span>
                              {t.ultimoMensaje.emisorId === currentUser.id ? 'Tú: ' : t.tipo === 'grupal' ? `${t.ultimoMensaje.emisorNombre}: ` : ''}
                              {t.ultimoMensaje.mensaje}
                            </span>
                          ) : (
                            <span className="italic text-slate-400">Sin mensajes aún</span>
                          )}
                        </p>

                        {t.unreadCount > 0 && (
                          <span className="bg-[#00a884] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0">
                            {t.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )
          ) : (
            filteredContacts.length === 0 ? (
              <p className="p-6 text-xs text-slate-400 italic text-center">No se encontraron contactos.</p>
            ) : (
              filteredContacts.map(c => {
                const contactAula = getContactAula(c);
                return (
                  <button
                    key={c.id}
                    onClick={() => handleContactSelection(c)}
                    className="w-full p-3 text-left flex items-start gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-full shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{c.nombre}</h5>
                      <p className="text-[10px] text-slate-400 truncate font-mono">{c.correo}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-1 rounded uppercase">
                          {c.rol}
                        </span>
                        {contactAula && (
                          <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1 rounded uppercase">
                            {contactAula.nombre}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )
          )}
        </div>
      </div>

      {/* RIGHT WORKSPACE: The Conversation Thread */}
      <div className={`col-span-2 flex flex-col h-full bg-[#efeae2] relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        
        {/* WhatsApp Background overlay */}
        <div 
          className="absolute inset-0 opacity-4 pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(#00a884 0.6px, transparent 0.6px), radial-gradient(#00a884 0.6px, #efeae2 0.6px)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        />

        {activeChat ? (
          <>
            {/* Active Thread Header */}
            <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-[#f0f2f5] z-10 shadow-3xs shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => setActiveChat(null)}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg md:hidden shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className={`p-1.5 rounded-full shrink-0 ${activeChat.tipo === 'grupal' ? 'bg-emerald-100 text-[#00a884]' : 'bg-slate-200 text-slate-700'}`}>
                  {activeChat.tipo === 'grupal' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-[#111b21] line-clamp-1 leading-snug">{activeChat.nombre}</h4>
                  <p className="text-[9px] text-slate-500 capitalize leading-none truncate">
                    {activeChat.tipo === 'grupal' 
                      ? `${activeChat.subtitulo} • Todos los miembros del Aula` 
                      : `${activeChat.targetUser?.rol || 'Miembro'} • Directo`
                    }
                  </p>
                </div>
              </div>
              
              {/* Context Dropdown (linked project) */}
              <div className="flex items-center gap-1 shrink-0 bg-white border border-slate-200 rounded-lg px-1.5 py-1">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Vinculado a:</span>
                <select
                  value={mensajeProyectoId}
                  onChange={(e) => setMensajeProyectoId(e.target.value)}
                  className="text-[10px] bg-transparent border-0 font-bold text-slate-700 focus:outline-hidden"
                >
                  <option value="general">Mensaje General</option>
                  {relevantProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre || 'Sin título'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Messages Thread list */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5 z-10 flex flex-col bg-[#efeae2]">
              {conversationMessages.length === 0 ? (
                <div className="my-auto flex flex-col justify-center items-center text-slate-500 space-y-2 p-6">
                  <span className="text-4xl">💬</span>
                  <p className="text-xs font-bold text-center text-slate-700">Inicia una conversación</p>
                  <p className="text-[10px] text-center max-w-xs text-slate-500">
                    Escribe tu primer mensaje a continuación. Se guardará de manera segura y en tiempo real.
                  </p>
                </div>
              ) : (
                conversationMessages.map(m => {
                  const isMe = m.emisorId === currentUser.id;
                  const timeStr = new Date(m.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  // For group chats, did anyone else read this message?
                  const isRead = activeChat.tipo === 'individual' 
                    ? m.leido 
                    : (m.leidos || []).some(id => id !== currentUser.id);

                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                      <div 
                        className={`rounded-lg p-2.5 max-w-[75%] shadow-3xs flex flex-col relative ${
                          isMe 
                            ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none ml-auto' 
                            : 'bg-white text-[#111b21] rounded-tl-none mr-auto'
                        }`}
                      >
                        {/* Sender's Name: Only on Group chats from other users */}
                        {activeChat.tipo === 'grupal' && !isMe && (
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block mb-1">
                            {m.emisorNombre || 'Usuario'}
                          </span>
                        )}

                        {/* Project context badge */}
                        {m.proyectoId && (
                          <div className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase self-start mb-1 tracking-wider ${
                            isMe ? 'bg-[#cceebd] text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            Proyecto: {proyectos.find(p => p.id === m.proyectoId)?.nombre || m.proyectoId}
                          </div>
                        )}

                        {/* Content text */}
                        <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">{m.mensaje}</p>

                        {/* Message status bar (Time + double blue checkmarks) */}
                        <div className="flex justify-end items-center gap-1 text-[9px] text-slate-400 select-none mt-1 self-end leading-none">
                          <span>{timeStr}</span>
                          {isMe && (
                            <span>
                              {isRead ? (
                                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] font-black shrink-0" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Bottom Send Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-[#f0f2f5] flex gap-2.5 items-center border-t border-slate-200 z-10 shrink-0">
              <input
                type="text"
                value={nuevoMensajeText}
                onChange={(e) => setNuevoMensajeText(e.target.value)}
                placeholder="Escribe un mensaje aquí..."
                className="flex-1 px-4 py-2 bg-white rounded-lg text-xs text-slate-800 focus:outline-hidden border border-slate-200/60 shadow-2xs placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!nuevoMensajeText.trim()}
                className={`p-2.5 rounded-full text-white transition-all shadow-md shrink-0 flex items-center justify-center ${
                  nuevoMensajeText.trim() 
                    ? 'bg-[#00a884] hover:bg-[#008f72] cursor-pointer scale-100 hover:scale-105 active:scale-95' 
                    : 'bg-slate-300 cursor-not-allowed scale-100'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* WhatsApp Empty / Splash screen */
          <div className="h-full flex flex-col justify-center items-center text-slate-500 space-y-4 p-8 z-10">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center shadow-md border border-emerald-200">
              <MessageSquare className="w-10 h-10 text-[#00a884]" />
            </div>
            
            <div className="text-center max-w-sm">
              <h2 className="text-lg font-bold text-[#111b21] tracking-tight">WhatsApp Web • Pro Lab</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Envía y recibe mensajes individuales o grupales de tu aula en tiempo real. 
                Los datos se sincronizan de forma segura con tu laboratorio.
              </p>
              <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-4 border-t border-slate-200/60 pt-4 w-full justify-center">
                <span>🔒 Cifrado y sincronizado en la nube</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* POPUP SELECTION PROMPT OVERLAY */}
      {selectionPrompt && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 animate-scale-in text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-[#00a884] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              💬
            </div>
            
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">¿Cómo deseas enviar el mensaje?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Estás abriendo una conversación con <strong className="text-slate-800">{selectionPrompt.contact.nombre}</strong>.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  const thread: ChatThread = {
                    id: selectionPrompt.contact.id,
                    tipo: 'individual',
                    nombre: selectionPrompt.contact.nombre,
                    subtitulo: `${selectionPrompt.contact.rol.toUpperCase()} • Directo`,
                    unreadCount: 0,
                    targetUser: selectionPrompt.contact
                  };
                  setActiveChat(thread);
                  setSelectionPrompt(null);
                  setActiveTab('chats');
                }}
                className="w-full py-2.5 bg-[#00a884] hover:bg-[#008f72] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Chat Individual (Privado)
              </button>
              
              {selectionPrompt.aula && (
                <button
                  onClick={() => {
                    const thread: ChatThread = {
                      id: selectionPrompt.aula!.id,
                      tipo: 'grupal',
                      nombre: `Aula: ${selectionPrompt.aula!.nombre}`,
                      subtitulo: `${selectionPrompt.aula!.materia || 'Laboratorio'} • Grupo`,
                      unreadCount: 0,
                      targetAula: selectionPrompt.aula
                    };
                    setActiveChat(thread);
                    setSelectionPrompt(null);
                    setActiveTab('chats');
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Chat Grupal ({selectionPrompt.aula.nombre})
                </button>
              )}
              
              <button
                onClick={() => setSelectionPrompt(null)}
                className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
