import React, { useState, useRef, useMemo } from 'react';
import { Calendar, Save, Info, Image as ImageIcon, Trash2, Camera, Upload, AlertCircle, Download, BookOpen, Plus, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { SemanalLog, Challenge, LogbookWeekConfig, DiarioEntry } from '../types';
import { compressImage } from '../utils/imageCompressor';

interface BitacoraControlProps {
  proyectoId: string;
  semanas: Record<number, SemanalLog>;
  diario: DiarioEntry[];
  onSaveDiarioEntry: (entry: DiarioEntry) => void;
  onSaveWeek: (week: number, ph: number, notas: string, fotos?: string[], parametros?: Record<string, string | number>) => void;
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;
  readOnly?: boolean;
  challenge?: Challenge;
}

export const BitacoraControl: React.FC<BitacoraControlProps> = ({
  semanas,
  diario,
  onSaveDiarioEntry,
  onSaveWeek,
  selectedWeek,
  setSelectedWeek,
  readOnly = false,
  challenge,
}) => {
  const getWeekConfig = (chal?: Challenge, w?: number): LogbookWeekConfig | undefined => {
    if (!chal || !chal.cronograma || !w) return undefined;
    return chal.cronograma.find(c => {
      if (c.semanas.includes('-')) {
        const [start, end] = c.semanas.split('-').map(Number);
        return w >= start && w <= end;
      }
      return parseInt(c.semanas, 10) === w;
    });
  };

  const weekConfig = getWeekConfig(challenge, selectedWeek);

  // Graph data based on daily logs
  const chartData = useMemo(() => {
    return diario
      .filter(d => !d.skipPh && typeof d.ph === 'number')
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .map(d => {
        const date = new Date(d.fecha);
        return {
          fechaStr: `${date.getDate()}/${date.getMonth() + 1}`,
          ph: d.ph,
          fase: d.fase
        };
      });
  }, [diario]);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleDownloadChartPNG = async () => {
    if (!chartContainerRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(chartContainerRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `grafica_evolucion_ph_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al exportar gráfica PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Diario Form State
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [skipPh, setSkipPh] = useState(false);
  const [localPh, setLocalPh] = useState<number>(5.0);
  const [localNotas, setLocalNotas] = useState<string>('');
  const [localFotos, setLocalFotos] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const isUnsafePh = !skipPh && localPh > 5.0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || !e.target.files) return;
    setIsCompressing(true);
    const files = Array.from(e.target.files);
    const newPhotos: string[] = [];

    for (const file of files) {
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file as any);
        });
        const compressed = await compressImage(base64, 800, 800, 0.7);
        newPhotos.push(compressed);
      } catch (error) {
        console.error('Error compressing file:', error);
      }
    }
    setLocalFotos(prev => [...prev, ...newPhotos]);
    setIsCompressing(false);
  };

  const handleSaveEntry = () => {
    if (readOnly || !localNotas.trim()) {
      alert("Por favor, escribe lo que has hecho (Notas).");
      return;
    }
    
    const newEntry: DiarioEntry = {
      id: `entry-${Date.now()}`,
      fase: selectedWeek,
      fecha: new Date().toISOString(),
      notas: localNotas,
      fotos: localFotos,
      skipPh: skipPh,
      ph: skipPh ? undefined : localPh
    };

    onSaveDiarioEntry(newEntry);
    
    // Also consider the phase completed if they made an entry
    // Legacy support to unblock the next phase in the UI
    if (!semanas[selectedWeek]?.completado) {
       onSaveWeek(selectedWeek, skipPh ? 0 : localPh, localNotas, localFotos);
    }

    // Reset form
    setLocalNotas('');
    setLocalFotos([]);
    setShowNewEntry(false);
  };

  const getAlertInfo = (val: number) => {
    if (val <= 4.5) {
      return { level: 'safe', className: 'text-emerald-800 bg-emerald-50 border border-emerald-200', badge: '🟢 SEGURO' };
    } else if (val <= 5.0) {
      return { level: 'warning', className: 'text-amber-800 bg-amber-50 border border-amber-200', badge: '🟠 PRECAUCIÓN' };
    } else {
      return { level: 'danger', className: 'text-red-800 bg-red-50 border border-red-200', badge: '🔴 CRÍTICO' };
    }
  };

  const currentPhaseEntries = diario
    .filter(d => d.fase === selectedWeek)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <div className="p-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-base uppercase tracking-wider">
            Cuaderno de Bitácora Diario
          </h2>
          <p className="text-xs text-slate-500">
            {readOnly 
              ? 'Visualizando diario de laboratorio del alumno. Modo lectura habilitado.'
              : 'Registra tus observaciones diarias, añade fotos y mide el pH continuamente.'
            }
          </p>
        </div>
      </div>

      {/* Week Timeline Selector */}
      <div>
        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2.5">
          Fases del Proyecto (Cronograma)
        </span>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {Array.from({ length: Object.keys(semanas).length }).map((_, i) => {
            const wNum = i + 1;
            const isSelected = selectedWeek === wNum;
            const phaseEntries = diario.filter(d => d.fase === wNum);
            const isCompleted = phaseEntries.length > 0 || semanas[wNum]?.completado;

            let statusDot = 'bg-slate-300';
            if (isCompleted) {
              const lastPhEntry = phaseEntries.find(d => !d.skipPh);
              if (lastPhEntry && lastPhEntry.ph !== undefined) {
                if (lastPhEntry.ph <= 4.5) statusDot = 'bg-emerald-500';
                else if (lastPhEntry.ph <= 5.0) statusDot = 'bg-amber-500';
                else statusDot = 'bg-red-500';
              } else {
                 statusDot = 'bg-blue-500'; // Has entries but no pH
              }
            }

            return (
              <button
                key={wNum}
                onClick={() => { setSelectedWeek(wNum); setShowNewEntry(false); }}
                className={`relative flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="text-[10px] uppercase font-bold font-mono tracking-tighter opacity-70">
                  FASE
                </span>
                <span className="text-base font-black font-mono leading-none mt-1">
                  0{wNum}
                </span>
                <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${statusDot}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase Context */}
      <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5">
        <span className="inline-flex items-center gap-1 bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase mb-1.5">
          Fase {selectedWeek} {weekConfig ? `— ${weekConfig.fase}` : ''}
        </span>
        <h3 className="text-sm font-bold text-slate-800">
          {weekConfig ? weekConfig.accionAlumno : 'Registro de la fase'}
        </h3>
        {weekConfig?.puntoCriticoControl && (
          <p className="text-xs font-semibold text-slate-500 mt-1">
            <span className="text-red-600 font-bold uppercase mr-1">PCC:</span>
            {weekConfig.puntoCriticoControl}
          </p>
        )}
      </div>

      {/* Historical Graph */}
      {chartData.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">📈 Evolución Histórica del pH</h3>
            <button onClick={handleDownloadChartPNG} disabled={isExporting} className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800">
              <Download className="w-3.5 h-3.5" /> {isExporting ? 'Exportando...' : 'Exportar PNG'}
            </button>
          </div>
          <div ref={chartContainerRef} className="h-56 w-full pt-4 bg-white rounded-lg border border-slate-100 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="fechaStr" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={[3.0, 7.5]} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                />
                <ReferenceLine y={4.5} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Punto Crítico (4.5)', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="ph" name="pH Registrado" stroke="#0f172a" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#38bdf8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Entradas del Diario ({currentPhaseEntries.length})
          </h3>
          {!readOnly && !showNewEntry && (
            <button 
              onClick={() => setShowNewEntry(true)}
              className="px-3 py-1.5 bg-slate-900 text-white text-[10px] uppercase font-bold rounded-lg flex items-center gap-1 hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5" /> Nueva Entrada
            </button>
          )}
        </div>

        {/* New Entry Form */}
        {showNewEntry && !readOnly && (
          <div className="p-5 border-2 border-slate-900 rounded-xl bg-slate-50 space-y-5 shadow-sm">
            <h4 className="font-bold text-slate-900">Nueva Entrada Diaria</h4>
            
            {/* Notas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lo que he hecho / Observaciones</label>
              <textarea
                rows={3}
                value={localNotas}
                onChange={(e) => setLocalNotas(e.target.value)}
                placeholder="Describe tus acciones y observaciones del día..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-slate-900 outline-hidden resize-none"
              />
            </div>

            {/* pH Control */}
            <div className="p-4 border border-slate-200 bg-white rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                  Control de pH
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={skipPh} 
                    onChange={(e) => setSkipPh(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  Omitir medición hoy (No recomendado)
                </label>
              </div>

              {!skipPh && (
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-500">Desliza para ajustar:</span>
                    <span className={`font-mono font-bold px-2 py-1 rounded text-sm ${
                      localPh <= 4.5 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : localPh <= 5.0 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                      pH {localPh.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3.0" max="7.0" step="0.1"
                    value={localPh}
                    onChange={(e) => setLocalPh(parseFloat(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                      localPh <= 4.5 
                        ? 'bg-emerald-200 accent-emerald-600' 
                        : localPh <= 5.0 
                        ? 'bg-amber-200 accent-amber-500' 
                        : 'bg-red-200 accent-red-600'
                    }`}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
                    <span>3.0</span>
                    <span className={localPh <= 4.5 ? 'text-emerald-600 font-bold underline' : ''}>4.5 (PCC Seguro)</span>
                    <span className={localPh > 4.5 && localPh <= 5.0 ? 'text-amber-600 font-bold underline' : ''}>5.0 (Alerta)</span>
                    <span className={localPh > 5.0 ? 'text-red-600 font-bold underline' : ''}>&gt;5.0 (Crítico)</span>
                    <span>7.0</span>
                  </div>
                  {localPh <= 4.5 && (
                    <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-semibold flex gap-2 items-center">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>Zona Segura (Verde): Acidez óptima alcanzada (pH ≤ 4.5).</span>
                    </div>
                  )}
                  {localPh > 4.5 && localPh <= 5.0 && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 font-semibold flex gap-2 items-center">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Zona de Alerta (Naranja): Acercándose al límite crítico de seguridad (4.5 - 5.0).</span>
                    </div>
                  )}
                  {localPh > 5.0 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800 font-semibold animate-pulse flex gap-2 items-center">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>Zona de Peligro (Rojo): El valor de pH supera el límite seguro (&gt; 5.0).</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Photos */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
                <Camera className="w-4 h-4" /> Fotos (Evidencia)
              </label>
              <input type="file" multiple accept="image/*" id="daily-photo" className="hidden" onChange={handleFileChange} />
              <label htmlFor="daily-photo" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" /> Subir Fotos
              </label>
              
              {isCompressing && <p className="text-xs text-slate-500 mt-2 animate-pulse">Comprimiendo...</p>}
              
              {localFotos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {localFotos.map((f, i) => (
                    <div key={i} className="relative aspect-square bg-slate-100 rounded overflow-hidden">
                      <img src={f} className="w-full h-full object-cover" />
                      <button onClick={() => setLocalFotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded shadow cursor-pointer">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button onClick={() => setShowNewEntry(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Cancelar</button>
              <button onClick={handleSaveEntry} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase rounded-lg flex items-center gap-1">
                <Save className="w-4 h-4" /> Guardar Entrada
              </button>
            </div>
          </div>
        )}

        {/* List of past entries */}
        <div className="space-y-4 mt-4">
          {currentPhaseEntries.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50">
              <p className="text-sm text-slate-500 italic">No hay entradas para esta fase todavía.</p>
            </div>
          ) : (
            currentPhaseEntries.map((entry, idx) => (
              <div key={entry.id || idx} className="p-4 border border-slate-200 rounded-xl bg-white shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    {new Date(entry.fecha).toLocaleString()}
                  </span>
                  {!entry.skipPh && entry.ph !== undefined && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getAlertInfo(entry.ph).className}`}>
                      {getAlertInfo(entry.ph).badge} (pH {entry.ph.toFixed(1)})
                    </span>
                  )}
                  {entry.skipPh && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">
                      pH Omitido
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{entry.notas}</p>
                
                {entry.fotos && entry.fotos.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
                    {entry.fotos.map((f, i) => (
                      <div key={i} className="aspect-square bg-slate-100 rounded overflow-hidden">
                        <img src={f} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(f, '_blank')} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
