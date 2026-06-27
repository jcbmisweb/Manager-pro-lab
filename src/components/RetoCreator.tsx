import React, { useState, useRef, useEffect } from 'react';
import { Clipboard, Wand2, ArrowRight, Trash2, Database, Zap } from 'lucide-react';
import { CHALLENGES, MODULO_INFO, Challenge } from '../types';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
import { ProjectAdminManager } from './ProjectAdminManager';

const PROMPT_MAESTRO = `Actúa como un experto en digitalización de laboratorios. Tu tarea es extraer la información de un documento de laboratorio y convertirla a un formato JSON estrictamente estructurado para la aplicación 'Eco-Lab'. El JSON debe tener la siguiente estructura:
{
  "id": "reto-01",
  "name": "Título del reto",
  "descripcion": "Descripción breve",
  "emoji": "🔬",
  "cronograma": [
    { "semanas": "1-2", "fase": "Fase inicial", "accionAlumno": "Acción a realizar", "puntoCriticoControl": "Control" }
  ]
}
No incluyas explicaciones adicionales, ni marcas de código como \`\`\`json. Solo el objeto JSON puro.`;

export function RetoCreator() {
  const [jsonText, setJsonText] = useState('');
  const [infografiaBase64, setInfografiaBase64] = useState('');
  const [success, setSuccess] = useState(false);
  const [incluirInfografia, setIncluirInfografia] = useState(true);
  const [retos, setRetos] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<any | null>(null);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'ManagerproLab'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ ...doc.data(), type: 'dinamico', expanded: false } as any));
      setAllProjects(fetched);
    });
    return () => unsub();
  }, []);

  const copyPrompt = () => {
    navigator.clipboard.writeText(PROMPT_MAESTRO);
    alert('Prompt copiado al portapapeles');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInfografiaBase64(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const publicarNuevoReto = async () => {
    let cleanJson = jsonText.trim();
    cleanJson = cleanJson.replace(/\[cite\]/g, '').replace(/\[cite_start\]/g, '');
    cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '');

    if (!cleanJson) {
      alert("Por favor, introduce primero el texto estructurado (JSON) que te dio la IA.");
      return;
    }

    let objetoReto;
    try {
      objetoReto = JSON.parse(cleanJson);
    } catch (error) {
      console.error("Error al parsear JSON:", error);
      alert("Error en el formato del JSON: Asegúrate de que el texto sea un JSON válido y sin caracteres extraños.");
      return;
    }

    if (incluirInfografia) {
      if (!infografiaBase64) {
        alert("Es obligatorio subir una imagen de infografía si has marcado incluirla.");
        return;
      }
      objetoReto.infografia = infografiaBase64;
    } else {
      objetoReto.infografia = null;
    }

    try {
      if (!objetoReto.id) objetoReto.id = 'reto-' + Date.now();
      
      // Merge with default values if they are missing
      const retoFinal = {
        ...objetoReto,
        isPublished: true,
      };

      await setDoc(doc(db, "ManagerproLab", retoFinal.id), retoFinal);
      
      setSuccess(true);
      setJsonText('');
      setInfografiaBase64('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
      alert("Error al guardar: " + error);
    }
  };

  const limpiarTodo = () => {
    if (window.confirm("¿Estás seguro de que quieres borrar TODOS los proyectos dinámicos? Esta acción no se puede deshacer. Se borrarán de la base de datos de todos los usuarios.")) {
      allProjects.forEach(async (p) => {
        await deleteDoc(doc(db, "ManagerproLab", p.id));
      });
      alert("Almacenamiento limpiado.");
    }
  };

  const borrarReto = async (id: string, type: string) => {
    if (window.confirm(`¿Estás seguro de que quieres borrar el reto ${id}?`)) {
      if (window.confirm(`Última advertencia: ¿Estás realmente seguro de borrar el reto ${id}? Esta acción no se puede deshacer.`)) {
        try {
          await deleteDoc(doc(db, "ManagerproLab", id));
        } catch (error) {
          console.error("Error al borrar el reto:", error);
          alert("Error al borrar el reto.");
        }
      }
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl text-slate-100">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
          PUENTE DE DIGITALIZACIÓN IA
        </h1>
        <p className="text-slate-400">Digitalización inteligente libre de errores de citación.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* PASO 1 */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 flex flex-col">
          <div className="inline-block bg-emerald-900/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full mb-4 w-max">
            PASO 1
          </div>
          <h2 className="text-3xl font-bold mb-6">COPIA EL PROMPT MAESTRO</h2>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-6 flex-grow">
            <div className="flex items-center gap-2 mb-3 text-emerald-400">
              <Wand2 size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Nuevo: Generación creativa</span>
            </div>
            <p className="text-sm text-slate-400">
              Hemos optimizado el prompt para que la IA estructure los datos exactamente como tu sistema los necesita.
            </p>
          </div>
          <button 
            onClick={copyPrompt}
            className="flex items-center justify-center gap-2 w-full py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
          >
            <Clipboard size={20} /> COPIAR PROMPT MAESTRO
          </button>
        </div>

        {/* PASO 2 */}
        <div className="bg-white text-slate-950 rounded-3xl p-8 flex flex-col">
          <div className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-4 w-max">
            PASO 2
          </div>
          <h2 className="text-3xl font-bold mb-2">IMPORTA EL RESULTADO</h2>
          <p className="text-sm text-slate-500 mb-8">
            Pega el código JSON de la IA. El sistema limpiará automáticamente etiquetas inválidas.
          </p>
          
          <textarea 
            className="w-full h-60 bg-white border border-emerald-500 rounded-2xl p-4 text-sm font-mono focus:ring-2 focus:ring-emerald-200 outline-none"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Pega el código JSON aquí..."
          />
          
          <div className="mt-4 mb-6">
            <label className="flex items-center gap-2 mb-2 cursor-pointer text-sm">
              <input 
                type="checkbox" 
                checked={incluirInfografia} 
                onChange={(e) => setIncluirInfografia(e.target.checked)} 
              />
              Incluir infografía
            </label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200"
              disabled={!incluirInfografia}
            >
              {infografiaBase64 ? "Cambiar Infografía" : "Seleccionar Infografía"}
            </button>
          </div>

          <button 
            onClick={publicarNuevoReto}
            className="flex items-center justify-center gap-2 w-full py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-colors"
          >
            LIMPIAR E IMPORTAR RECETA <ArrowRight size={20} />
          </button>
          
          <button 
            onClick={limpiarTodo}
            className="flex items-center justify-center gap-2 w-full py-2 mt-4 bg-red-100 text-red-700 font-bold rounded-2xl hover:bg-red-200 transition-colors"
          >
            <Trash2 size={16} /> LIMPIAR TODO EL ALMACENAMIENTO
          </button>
          
          {success && (
            <div className="mt-4 p-4 bg-emerald-100 text-emerald-800 rounded-xl text-sm">
              🎉 <strong>¡Reto Sincronizado!</strong> Los datos han quedado empaquetados.
            </div>
          )}
        </div>
      </div>
            {/* GESTIÓN DE RETOS */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
        <h2 className="text-2xl font-bold mb-6">Gestión de Retos</h2>
        
        <div className="mb-6 space-y-6">
          {['A', 'B', 'C'].map((bloque) => {
            const retosEnBloque = allProjects.filter(p => (p.bloque || 'A') === bloque);
            
            return (
              <div key={bloque} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h3 className="text-lg font-bold text-slate-300 mb-4">Bloque {bloque}</h3>
                <div className="space-y-4">
                  {retosEnBloque.length > 0 ? (
                    retosEnBloque.map((reto: any) => (
                      <div 
                        key={reto.id} 
                        className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Database size={16} className="text-blue-400" />
                          <div>
                            <span className="font-semibold text-slate-100 block">{reto.name || reto.titulo}</span>
                            <span className="text-xs text-slate-400">Estado: {reto.isPublished ? "Publicado (Visible)" : "Borrador (Oculto)"}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                             <span className="text-xs text-slate-400">PUBLICAR</span>
                             <button 
                               onClick={async () => {
                                 const isPublished = !reto.isPublished;
                                 await updateDoc(doc(db, "ManagerproLab", reto.id), { isPublished });
                               }}
                               className={`w-10 h-5 rounded-full p-1 transition-colors ${reto.isPublished ? 'bg-emerald-500' : 'bg-slate-600'}`}
                             >
                               <div className={`w-3 h-3 bg-white rounded-full transition-transform ${reto.isPublished ? 'translate-x-5' : 'translate-x-0'}`} />
                             </button>
                          </div>
                          <button 
                            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
                            onClick={() => setEditingChallenge(reto)}
                          >
                            GESTIONAR
                          </button>
                          <button 
                            onClick={() => { borrarReto(reto.id, 'dinamico'); }}
                            className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Borrar reto"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-600 text-sm italic">Sin retos en este bloque.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {editingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-4xl">
            <ProjectAdminManager 
              challenge={editingChallenge as Challenge} 
              onClose={() => setEditingChallenge(null)}
              onSave={async (updatedChallenge) => {
                await setDoc(doc(db, "ManagerproLab", updatedChallenge.id), updatedChallenge);
                setEditingChallenge(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
