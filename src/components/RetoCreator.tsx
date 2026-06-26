import React, { useState, useRef, useEffect } from 'react';
import { Clipboard, Wand2, ArrowRight, Trash2, Database, Zap } from 'lucide-react';
import { CHALLENGES, MODULO_INFO } from '../types';

const PROMPT_MAESTRO = `Actúa como un experto en digitalización de laboratorios. Tu tarea es extraer la información de un documento de laboratorio y convertirla a un formato JSON estrictamente estructurado para la aplicación 'Manager pro LAB'. El JSON debe tener la siguiente estructura:
{
  "id": "reto-01",
  "titulo": "Título del reto",
  "descripcion": "Descripción breve",
  "emoji": "🔬",
  "puntos_criticos": {
    "parametro_evaluacion": "Parámetro a evaluar",
    "tipo_control": "slider-temperatura",
    "min_seguro": 20,
    "max_seguro": 25
  },
  "semaforo_valores": {
    "verde": "Todo correcto",
    "amarillo": "Alerta leve",
    "rojo": "Peligro"
  }
}
No incluyas explicaciones adicionales, ni marcas de código como \`\`\`json. Solo el objeto JSON puro.`;

export function RetoCreator() {
  const [jsonText, setJsonText] = useState('');
  const [infografiaBase64, setInfografiaBase64] = useState('');
  const [success, setSuccess] = useState(false);
  const [incluirInfografia, setIncluirInfografia] = useState(true);
  const [retos, setRetos] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cargarRetos();
  }, []);

  const cargarRetos = () => {
    const catalogo = JSON.parse(localStorage.getItem('mpl_catalogo_retos_dinamicos') || '{}');
    const ocultosSistema = JSON.parse(localStorage.getItem('mpl_ocultos_sistema') || '[]');
    
    const proyectos = [
      ...CHALLENGES.filter(c => !ocultosSistema.includes(c.id)).map(c => ({ ...c, type: 'sistema', expanded: false })),
      ...Object.values(catalogo).map((r: any) => ({ ...r, type: 'dinamico', expanded: false }))
    ];
    setRetos(Object.values(catalogo));
    setAllProjects(proyectos);
  };

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

  const publicarNuevoReto = () => {
    let cleanJson = jsonText.trim();
    // Limpiar etiquetas de citación si existen
    cleanJson = cleanJson.replace(/\[cite\]/g, '').replace(/\[cite_start\]/g, '');
    // Quitar marcas de código si quedaron
    cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '');

    console.log("Intentando procesar JSON:", cleanJson);
    console.log("¿Tiene infografía?", !!infografiaBase64);

    if (!cleanJson) {
      alert("Por favor, introduce primero el texto estructurado (JSON) que te dio la IA.");
      return;
    }

    let objetoReto;
    try {
      objetoReto = JSON.parse(cleanJson);
      console.log("JSON parseado:", objetoReto);
    } catch (error) {
      console.error("Error al parsear JSON:", error);
      alert("Error en el formato del JSON: Asegúrate de que el texto sea un JSON válido y sin caracteres extraños.");
      return;
    }

    // Ensure bloque is present
    if (!objetoReto.bloque) {
      objetoReto.bloque = 'A'; // Default block
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
      let catalogoGlobal = JSON.parse(localStorage.getItem('mpl_catalogo_retos_dinamicos') || '{}');
      catalogoGlobal[objetoReto.id] = objetoReto;
      console.log("Guardando en localStorage...");
      localStorage.setItem('mpl_catalogo_retos_dinamicos', JSON.stringify(catalogoGlobal));
      console.log("Guardado con éxito.");
      
      setSuccess(true);
      setJsonText('');
      setInfografiaBase64('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      cargarRetos();
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
      alert("Error al guardar: El almacenamiento puede estar lleno (" + error + "). Por favor, borra algunos proyectos o usa el botón de limpiar todo.");
    }
  };

  const limpiarTodo = () => {
    if (window.confirm("¿Estás seguro de que quieres borrar TODOS los proyectos dinámicos? Esta acción no se puede deshacer.")) {
      localStorage.removeItem('mpl_catalogo_retos_dinamicos');
      cargarRetos();
      alert("Almacenamiento limpiado.");
    }
  };

  const borrarReto = (id: string, type: 'sistema' | 'dinamico') => {
    if (window.confirm(`¿Estás seguro de que quieres borrar el reto ${id}?`)) {
      if (window.confirm(`Última advertencia: ¿Estás realmente seguro de borrar el reto ${id}? Esta acción no se puede deshacer.`)) {
        if (type === 'dinamico') {
          let catalogoGlobal = JSON.parse(localStorage.getItem('mpl_catalogo_retos_dinamicos') || '{}');
          delete catalogoGlobal[id];
          try {
            try {
          localStorage.setItem('mpl_catalogo_retos_dinamicos', JSON.stringify(catalogoGlobal));
        } catch (e) {
          console.error(e);
          alert("El almacenamiento está lleno. Por favor, borra algunos proyectos antes de añadir nuevos.");
          return;
        }
          } catch (e) {
            console.error(e);
            alert("El almacenamiento está lleno. Por favor, borra algunos proyectos antes de añadir nuevos.");
            return;
          }
        } else {
          // Sistema
          let ocultos = JSON.parse(localStorage.getItem('mpl_ocultos_sistema') || '[]');
          if (!ocultos.includes(id)) {
            ocultos.push(id);
            localStorage.setItem('mpl_ocultos_sistema', JSON.stringify(ocultos));
          }
        }
        cargarRetos();
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
        <h2 className="text-2xl font-bold mb-6">Retos Actuales - {MODULO_INFO.nombre}</h2>
        <div className="mb-4 text-sm text-slate-400">
          <p>Curso: {MODULO_INFO.curso} | Nivel: {MODULO_INFO.nivel}</p>
          <p>Profesor: {MODULO_INFO.profesor}</p>
        </div>
        
        {['A', 'B', 'C'].map(bloque => (
          <div key={bloque} className="mb-6">
            <h3 className="text-lg font-bold mb-3 text-emerald-400">Bloque {bloque}</h3>
            {allProjects.filter(p => p.bloque === bloque).length === 0 ? (
              <p className="text-slate-500 text-sm italic">No hay retos en este bloque.</p>
            ) : (
              <div className="space-y-4">
                {allProjects.filter(p => p.bloque === bloque).map((reto: any) => (
                  <div 
                    key={reto.id} 
                    className={`bg-slate-800 rounded-xl border border-slate-700 transition-all overflow-hidden ${expandedId === reto.id ? 'border-emerald-500 ring-1 ring-emerald-500/30' : ''}`}
                  >
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/50"
                      onClick={() => setExpandedId(expandedId === reto.id ? null : reto.id)}
                    >
                      <div className="flex items-center gap-3">
                        {reto.type === 'sistema' ? (
                          <Database size={16} className="text-blue-400" title="Proyecto del Sistema" />
                        ) : (
                          <Zap size={16} className="text-emerald-400" title="Proyecto Dinámico" />
                        )}
                        <div>
                          <span className="font-semibold text-slate-100 block">{reto.titulo} ({reto.id})</span>
                          <span className="text-xs text-slate-400 block">{reto.descripcion}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${reto.type === 'sistema' ? 'bg-blue-900/30 text-blue-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                          {reto.type}
                        </span>
                      </div>
                      {reto.type === 'dinamico' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); borrarReto(reto.id, 'dinamico'); }}
                          className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Borrar reto"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                      {reto.type === 'sistema' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); borrarReto(reto.id, 'sistema'); }}
                          className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Ocultar reto de sistema"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                    
                    {/* Vista Expandida */}
                    {expandedId === reto.id && (
                      <div className="p-4 bg-slate-950 border-t border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-3 rounded-lg">
                          <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Datos Técnicos (JSON)</h4>
                          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(reto, null, 2)}
                          </pre>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-lg">
                          <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Infografía</h4>
                          {reto.infografia ? (
                            <img src={reto.infografia} alt="Infografía" className="rounded border border-slate-700 w-full object-contain max-h-60" />
                          ) : (
                            <div className="flex items-center justify-center h-40 border border-dashed border-slate-700 text-slate-600 rounded">
                              Sin infografía
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
