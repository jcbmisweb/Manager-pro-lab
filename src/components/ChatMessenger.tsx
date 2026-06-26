import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, Check, CheckCheck, Clock, Paperclip } from 'lucide-react';
import { Mensaje, Usuario, Aula } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

interface ChatMessengerProps {
  currentUser: {
    id: string;
    nombre: string;
    rol: 'admin' | 'profesor' | 'alumno';
    aulaId?: string;
  };
  usuarios: Usuario[];
  aulas: Aula[];
  proyectos: any[];
}

export function ChatMessenger({ currentUser, usuarios, aulas, proyectos }: ChatMessengerProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);

  const [activeContactId, setActiveContactId] = useState<string>('');
  const [nuevoMensajeText, setNuevoMensajeText] = useState('');
  const [mensajeProyectoId, setMensajeProyectoId] = useState<string>('general');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "mensajes"), (snap) => {
      setMensajes(snap.docs.map(doc => doc.data() as Mensaje));
    });
    return () => unsub();
  }, []);

  // For teachers, find students in their classrooms. For students, find their assigned teacher.
  const myAssignedAulas = aulas.filter(a => a.profesorId === currentUser.id);
  const myAssignedAulaIds = myAssignedAulas.map(a => a.id);

  // Filter contacts based on roles
  const contacts = usuarios.filter(u => {
    if (u.id === currentUser.id || u.estado === 'eliminado') return false;

    if (currentUser.rol === 'alumno') {
      // Students can message teachers of their classroom or admins
      if (u.rol === 'profesor') {
        // Find which classroom current student is in, and check if this professor is responsible for it
        const studentAula = aulas.find(a => a.id === currentUser.aulaId);
        return studentAula ? studentAula.profesorId === u.id : true; // fallback to showing professor
      }
      return u.rol === 'admin';
    } else if (currentUser.rol === 'profesor') {
      // Teachers can message students in their classrooms
      if (u.rol === 'alumno') {
        return u.aulaId ? myAssignedAulaIds.includes(u.aulaId) : false;
      }
      return u.rol === 'admin';
    } else {
      // Admin can message anyone
      return true;
    }
  });

  // Set default active contact
  useEffect(() => {
    if (contacts.length > 0 && !activeContactId) {
      setActiveContactId(contacts[0].id);
    }
  }, [contacts, activeContactId]);

  // Mark incoming messages from activeContact as read
  useEffect(() => {
    if (activeContactId) {
      mensajes.forEach(m => {
        if (m.emisorId === activeContactId && m.receptorId === currentUser.id && !m.leido) {
          updateDoc(doc(db, "mensajes", m.id), { leido: true }).catch(console.error);
        }
      });
    }
  }, [activeContactId, mensajes, currentUser.id]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, activeContactId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensajeText.trim() || !activeContactId) return;

    const msgId = 'm-' + Date.now();
    const msg: Mensaje = {
      id: msgId,
      emisorId: currentUser.id,
      receptorId: activeContactId,
      proyectoId: mensajeProyectoId === 'general' ? undefined : mensajeProyectoId,
      mensaje: nuevoMensajeText.trim(),
      fecha: new Date().toISOString(),
      leido: false
    };

    setDoc(doc(db, "mensajes", msgId), msg).catch(console.error);
    setNuevoMensajeText('');
  };

  // Filter messages between current user and active contact
  const conversationMessages = mensajes.filter(m => 
    (m.emisorId === currentUser.id && m.receptorId === activeContactId) ||
    (m.emisorId === activeContactId && m.receptorId === currentUser.id)
  );

  const activeContact = usuarios.find(u => u.id === activeContactId);

  // Get active student projects for dropdown
  const relevantProjects = proyectos.filter(p => {
    if (currentUser.rol === 'alumno') {
      return p.alumnoId === currentUser.id;
    } else {
      return p.alumnoId === activeContactId;
    }
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-3 h-[500px]">
      
      {/* Contact List */}
      <div className="border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Bandeja de Mensajería</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {contacts.length === 0 ? (
            <p className="p-4 text-xs text-slate-400 italic text-center">No hay contactos disponibles.</p>
          ) : (
            contacts.map(c => {
              // Calculate unread count
              const unreadCount = mensajes.filter(m => m.emisorId === c.id && m.receptorId === currentUser.id && !m.leido).length;
              
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveContactId(c.id)}
                  className={`w-full p-3 text-left flex items-start gap-3 transition-colors ${
                    activeContactId === c.id ? 'bg-emerald-50/60' : 'hover:bg-slate-100/50'
                  }`}
                >
                  <div className="p-2 bg-slate-200 text-slate-700 rounded-full">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-xs text-slate-800 line-clamp-1">{c.nombre}</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 capitalize">{c.rol} • {c.estado}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="col-span-2 flex flex-col h-full bg-white">
        {activeContact ? (
          <>
            {/* Thread Header */}
            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                  Conversación activa con
                </span>
                <h4 className="font-bold text-xs text-slate-800">{activeContact.nombre} ({activeContact.correo})</h4>
              </div>
              
              {/* Context Dropdown */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-medium">Contexto:</span>
                <select
                  value={mensajeProyectoId}
                  onChange={(e) => setMensajeProyectoId(e.target.value)}
                  className="text-[11px] p-1 bg-white border border-slate-200 rounded font-semibold text-slate-700 focus:outline-hidden"
                >
                  <option value="general">Mensaje General del Aula</option>
                  {relevantProjects.map(p => (
                    <option key={p.id} value={p.id}>Proyecto: {p.nombre || 'Sin título'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/10">
              {conversationMessages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-slate-400 space-y-1.5 p-6">
                  <span className="text-3xl">💬</span>
                  <p className="text-xs font-semibold text-center">Inicia una conversación con {activeContact.nombre}</p>
                  <p className="text-[10px] text-center max-w-xs">Puedes enlazar los mensajes a un proyecto específico o enviarlos como consultas de carácter general.</p>
                </div>
              ) : (
                conversationMessages.map(m => {
                  const isMe = m.emisorId === currentUser.id;
                  const timeStr = new Date(m.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl p-3 shadow-3xs space-y-1 ${
                        isMe ? 'bg-slate-900 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'
                      }`}>
                        {/* Project Badge */}
                        {m.proyectoId && (
                          <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isMe ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'
                          }`}>
                            Proyecto: {proyectos.find(p => p.id === m.proyectoId)?.nombre || m.proyectoId}
                          </span>
                        )}
                        <p className="text-xs leading-relaxed break-words">{m.mensaje}</p>
                        <div className="flex justify-end items-center gap-1 text-[9px] opacity-70">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{timeStr}</span>
                          {isMe && (
                            <span>
                              {m.leido ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
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

            {/* Form Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex gap-2">
              <input
                type="text"
                value={nuevoMensajeText}
                onChange={(e) => setNuevoMensajeText(e.target.value)}
                placeholder={`Escribe un mensaje para ${activeContact.nombre}...`}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col justify-center items-center text-slate-400 space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300" />
            <p className="text-xs italic">Selecciona un contacto para chatear.</p>
          </div>
        )}
      </div>

    </div>
  );
}
