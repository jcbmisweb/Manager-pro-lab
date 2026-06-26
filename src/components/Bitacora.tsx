import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { NotebookEntry } from '../types';

interface BitacoraProps {
  projectId: string;
}

export const Bitacora: React.FC<BitacoraProps> = ({ projectId }) => {
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'projects', projectId, 'notebookEntries'),
      orderBy('date', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries: NotebookEntry[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NotebookEntry));
      setEntries(fetchedEntries);
    });
    return unsubscribe;
  }, [projectId]);

  const handleAddEntry = async () => {
    if (!notes.trim()) return;
    await addDoc(collection(db, 'projects', projectId, 'notebookEntries'), {
      projectId,
      date: new Date().toISOString(),
      notes,
    });
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Registra tus hallazgos, mediciones o notas de bitácora..."
          className="flex-1 p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          rows={2}
        />
        <button 
          onClick={handleAddEntry} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors flex items-center"
        >
          Guardar
        </button>
      </div>
      
      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4 italic">No hay entradas en la bitácora aún.</p>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="p-4 border border-slate-100 rounded-lg bg-white shadow-sm hover:border-emerald-100 transition-colors">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                {new Date(entry.date).toLocaleString()}
              </p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{entry.notes}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
