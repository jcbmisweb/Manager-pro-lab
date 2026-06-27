/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Save, Info, Image as ImageIcon, Trash2, Camera, Upload, AlertCircle, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { SemanalLog, Challenge, LogbookWeekConfig } from '../types';
import { compressImage } from '../utils/imageCompressor';

interface BitacoraControlProps {
  semanas: Record<number, SemanalLog>;
  onSaveWeek: (week: number, ph: number, notas: string, fotos?: string[], parametros?: Record<string, string | number>) => void;
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;
  readOnly?: boolean;
  challenge?: Challenge;
}

export const BitacoraControl: React.FC<BitacoraControlProps> = ({
  semanas,
  onSaveWeek,
  selectedWeek,
  setSelectedWeek,
  readOnly = false,
  challenge,
}) => {
  const currentLog = semanas[selectedWeek];

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

  const chartData = Object.entries(semanas)
    .map(([weekStr, logVal]) => {
      const log = logVal as SemanalLog;
      const wNum = parseInt(weekStr, 10);
      return {
        semana: `Sem ${wNum}`,
        ph: typeof log?.ph === 'number' ? log.ph : null,
        completado: log?.completado
      };
    })
    .sort((a, b) => parseInt(a.semana.replace('Sem ', '')) - parseInt(b.semana.replace('Sem ', '')));

  // Local transient states
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [localPh, setLocalPh] = useState<number>(currentLog?.ph ?? 5.5);
  const isUnsafePh = localPh > 5.0;
  const [localNotas, setLocalNotas] = useState<string>(currentLog?.notas ?? '');
  const [localFotos, setLocalFotos] = useState<string[]>(currentLog?.fotos ?? []);
  const [localParametros, setLocalParametros] = useState<Record<string, string | number>>(currentLog?.parametros ?? {});
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

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

  // Synchronize local state when selectedWeek or semanas changes
  useEffect(() => {
    const log = semanas[selectedWeek];
    if (log) {
      setLocalPh(log.ph);
      setLocalNotas(log.notas || '');
      setLocalFotos(log.fotos || []);
      setLocalParametros(log.parametros || {});
    } else {
      setLocalPh(5.5);
      setLocalNotas('');
      setLocalFotos([]);
      setLocalParametros({});
    }
  }, [selectedWeek, semanas]);

  // Compute alert level based on pH
  const getAlertInfo = (val: number) => {
    if (val < 4.5) {
      return {
        level: 'safe',
        className: 'status-safe text-emerald-800 bg-emerald-50 border-emerald-200',
        badge: '🟢 SEGURO',
        desc: 'Ambiente seguro. Fermentación láctica óptima.'
      };
    } else if (val >= 4.5 && val <= 4.6) {
      return {
        level: 'warning',
        className: 'status-warning text-amber-800 bg-amber-50 border-amber-200',
        badge: '🟡 ALERTA LEVADURA KAHM',
        desc: 'Presencia o riesgo de Levadura Kahm. Retirar capa superficial, regular la temperatura y optimizar ventilación inmediata.'
      };
    } else {
      return {
        level: 'danger',
        className: 'status-danger text-red-800 bg-red-50 border-red-200',
        badge: '🔴 PELIGRO / DESCARTAR',
        desc: '¡Alerta de Contaminación Crítica o Moho! pH fuera de rango bactericida. Descartar lote inmediatamente para prevenir patógenos.'
      };
    }
  };

  const alertInfo = getAlertInfo(localPh);

  const handleSave = () => {
    if (readOnly) return;
    onSaveWeek(selectedWeek, localPh, localNotas, localFotos, localParametros);
  };

  // Process and compress image file
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

        // Compress image using canvas utility
        const compressed = await compressImage(base64, 800, 800, 0.7);
        newPhotos.push(compressed);
      } catch (error) {
        console.error('Error compressing file:', error);
      }
    }

    setLocalFotos(prev => [...prev, ...newPhotos]);
    setIsCompressing(false);
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    if (readOnly) return;
    setLocalFotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
      
      {/* Module Title */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <div className="p-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-base uppercase tracking-wider">
            Bitácora de Control Técnico (Semanas 1 a {Object.keys(semanas).length})
          </h2>
          <p className="text-xs text-slate-500">
            {readOnly 
              ? 'Visualizando bitácora técnica de seguimiento del alumno. Modo lectura habilitado.'
              : 'Monitoriza los puntos críticos de control (PCC) de pH y acidez en cada ciclo semanal.'
            }
          </p>
        </div>
      </div>

      {/* Week Timeline Selector */}
      <div>
        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2.5">
          Cronograma de Maduración
        </span>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {Array.from({ length: Object.keys(semanas).length }).map((_, i) => {
            const wNum = i + 1;
            const log = semanas[wNum];
            const isSelected = selectedWeek === wNum;
            const isCompleted = log?.completado;

            // Get status color indicator
            const phVal = log?.ph ?? 5.5;
            let statusDot = 'bg-slate-300';
            if (isCompleted) {
              if (phVal < 4.5) statusDot = 'bg-emerald-500';
              else if (phVal >= 4.5 && phVal < 5.0) statusDot = 'bg-amber-500';
              else statusDot = 'bg-red-500';
            }

            return (
              <button
                key={wNum}
                id={`tab-semana-${wNum}`}
                onClick={() => setSelectedWeek(wNum)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="text-[10px] uppercase font-bold font-mono tracking-tighter opacity-70">
                  SEM
                </span>
                <span className="text-base font-black font-mono leading-none mt-1">
                  0{wNum}
                </span>

                {/* Status Dot indicator */}
                <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${statusDot}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Evolución Histórica de pH Recharts Graph */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>📈 Evolución Histórica del pH</span>
              <span className="text-[10px] font-mono uppercase bg-slate-200 text-slate-800 px-2 py-0.5 rounded-sm">Tendencia Semanal</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Curva de acidificación biológica frente al umbral bactericida seguro (&lt; 4.5).
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" /> pH Lote</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-red-500 inline-block" /> Crítico 4.5</span>
          </div>
        </div>

        <div ref={chartContainerRef} className="w-full h-56 pt-2 bg-white p-2 rounded-lg border border-slate-100">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <YAxis domain={[3, 7]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(value: any) => [typeof value === 'number' ? `${value.toFixed(1)} pH` : 'N/A', 'Nivel de pH']}
              />
              <ReferenceLine y={4.5} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: 'Límite Crítico (4.5)', fill: '#ef4444', fontSize: 10 }} />
              {challenge?.phFinalEsperado && (
                <ReferenceLine y={challenge.phFinalEsperado} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'insideBottomRight', value: `Meta (${challenge.phFinalEsperado})`, fill: '#10b981', fontSize: 10 }} />
              )}
              <Line
                type="monotone"
                dataKey="ph"
                name="pH"
                stroke="#0f172a"
                strokeWidth={3}
                connectNulls
                dot={{ r: 4, fill: '#0f172a', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#0f172a', stroke: '#38bdf8', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={handleDownloadChartPNG}
            disabled={isExporting || chartData.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold font-sans rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generando PNG...' : 'Descargar Gráfica (PNG)'}</span>
          </button>
        </div>
      </div>

      {/* Active Week Form Controls */}
      <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase mb-1.5">
              Semana {selectedWeek} {weekConfig ? `— Fase: ${weekConfig.fase}` : 'Activa'}
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              {weekConfig ? weekConfig.accionAlumno : 'Registro del Punto Crítico de Control'}
            </h3>
            {weekConfig?.puntoCriticoControl && (
              <p className="text-xs font-semibold text-slate-500 mt-1">
                <span className="text-red-600 font-bold uppercase mr-1">PCC:</span>
                {weekConfig.puntoCriticoControl}
              </p>
            )}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {(() => {
              if (!currentLog?.fechaRegistro) return <span>Pendiente de guardar</span>;
              const date = new Date(currentLog.fechaRegistro);
              if (isNaN(date.getTime())) return <span>Pendiente de guardar</span>;
              try {
                return <span>Registrado: {date.toLocaleDateString()}</span>;
              } catch (e) {
                return <span>Pendiente de guardar</span>;
              }
            })()}
          </div>
        </div>

        {/* pH Range Slider & Validation Highlight */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <label htmlFor="input-ph-range" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Medición de pH de la Pasta
              </label>
              {isUnsafePh && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 animate-pulse mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Valor fuera del rango seguro (&gt; 5.0)
                </span>
              )}
            </div>
            
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono font-bold text-base transition-all ${
              isUnsafePh
                ? 'bg-red-50 border-2 border-red-500 text-red-900 shadow-xs ring-2 ring-red-200'
                : 'bg-white border border-slate-200 text-slate-900 shadow-2xs'
            }`}>
              <span className={`text-[10px] font-semibold uppercase ${isUnsafePh ? 'text-red-700 font-extrabold' : 'text-slate-400'}`}>pH:</span>
              <input
                id="valor-ph-actual"
                type="number"
                min="3.0"
                max="7.0"
                step="0.1"
                value={localPh}
                disabled={readOnly}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) setLocalPh(val);
                }}
                className="w-16 bg-transparent text-right font-mono font-bold focus:outline-hidden"
              />
            </div>
          </div>

          <div className="relative pt-2">
            <input
              id="input-ph-range"
              type="range"
              min="3.0"
              max="7.0"
              step="0.1"
              value={localPh}
              disabled={readOnly}
              onChange={(e) => setLocalPh(parseFloat(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-hidden disabled:opacity-50 transition-colors ${
                isUnsafePh ? 'bg-red-200 accent-red-600' : 'bg-slate-200 accent-slate-900'
              }`}
            />
            {/* Range markers */}
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2 px-1">
              <span>3.0 (Ácido)</span>
              <span>4.0</span>
              <span className={isUnsafePh ? 'text-red-600 font-bold' : ''}>4.5 (Punto Crítico)</span>
              <span className={isUnsafePh ? 'text-red-600 font-bold underline' : ''}>5.0 (Umbral Seguro)</span>
              <span>6.0</span>
              <span>7.0 (Neutro)</span>
            </div>
          </div>

          {isUnsafePh && (
            <div className="p-3 bg-red-100/80 border border-red-300 rounded-xl text-xs text-red-900 font-sans flex items-start gap-2 shadow-2xs animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <strong className="font-bold">¡ALERTA DE SEGURIDAD CRÍTICA!</strong> El valor de pH ({localPh.toFixed(1)}) supera el límite seguro (&gt; 5.0). A este nivel de acidez no se inhiben bacterias patógenas ni mohos indeseados. Calibra el pehachímetro o descarta la muestra.
              </div>
            </div>
          )}
        </div>

        {/* Asynchronous Alert Box */}
        <div
          id="cuadro-alerta-ph"
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 ${alertInfo.className}`}
        >
          <div className="text-xl leading-none pt-0.5">
            {alertInfo.level === 'safe' && '🟢'}
            {alertInfo.level === 'warning' && '🟡'}
            {alertInfo.level === 'danger' && '🔴'}
          </div>
          <div>
            <span className="block font-mono text-xs font-extrabold uppercase tracking-wide">
              Estatus: {alertInfo.badge}
            </span>
            <p className="text-xs font-semibold mt-1 font-sans">
              {alertInfo.desc}
            </p>
            {alertInfo.level === 'danger' && (
              <span className="block mt-2 text-[10px] uppercase font-bold text-red-600 bg-red-100/50 px-2 py-0.5 rounded-sm w-max">
                ¡Alerta Sanitaria! Riesgo de Listeria o E. Coli.
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Parameters from week config */}
        {weekConfig?.parametrosRegistrar && weekConfig.parametrosRegistrar.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h4 className="text-sm font-bold text-slate-800">Parámetros a Registrar (PCC)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {weekConfig.parametrosRegistrar.filter(p => p.toLowerCase() !== 'ph').map((paramName) => (
                <div key={paramName}>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {paramName}
                  </label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={localParametros[paramName] || ''}
                    onChange={(e) => setLocalParametros({ ...localParametros, [paramName]: e.target.value })}
                    placeholder={`Registrar ${paramName}`}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-transparent transition-all disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observation text notes */}
        <div className="space-y-2">
          <label htmlFor="input-notas-semanales" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Notas de Observación Crítica
          </label>
          <textarea
            id="input-notas-semanales"
            rows={3}
            value={localNotas}
            disabled={readOnly}
            onChange={(e) => setLocalNotas(e.target.value)}
            placeholder={readOnly ? "Sin anotaciones." : "Ej: Formación uniforme de corteza, ausencia de mohos oscuros, aroma láctico limpio y ligeramente ácido..."}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-transparent resize-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
          />
          <span className="block text-[10px] text-slate-400 font-sans">
            Registra observaciones clave como textura táctil, humedad externa de la tela quesera y presencia de notas fúngicas.
          </span>
        </div>

        {/* Dynamic Image Upload & Gallery */}
        <div className="space-y-3 pt-2 border-t border-slate-200/60">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Galería Fotográfica Contextual</span>
            </label>
            {!readOnly && (
              <div className="relative">
                <input
                  type="file"
                  id="week-photo-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="week-photo-upload"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase rounded-lg cursor-pointer shadow-3xs hover:shadow-2xs transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Fotos</span>
                </label>
              </div>
            )}
          </div>

          {isCompressing && (
            <div className="text-center py-4 bg-slate-100/55 rounded-lg border border-dashed text-xs text-slate-500 animate-pulse">
              ⚙️ Optimizando y comprimiendo imágenes a alta velocidad...
            </div>
          )}

          {localFotos.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 border border-dashed rounded-lg text-[11px] text-slate-400 italic">
              No hay fotos vinculadas a este registro semanal. Las fotos que subas quedarán vinculadas exclusivamente a esta fecha.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {localFotos.map((foto, index) => (
                <div key={index} className="group relative aspect-square bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shadow-3xs">
                  <img src={foto} alt={`Foto semanal ${index + 1}`} className="w-full h-full object-cover" />
                  
                  {!readOnly && (
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors cursor-pointer"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save/Register Action for the current week */}
        {!readOnly && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              id="btn-guardar-semana"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Guardar Semana {selectedWeek}</span>
            </button>
          </div>
        )}

      </div>

      {/* Week Progress Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">
            Progreso del Reto:
          </span>
          <span className="text-xs font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-800 font-mono">
            {Object.values(semanas).filter((s: any) => s.completado).length} de {Object.keys(semanas).length} semanas completas
          </span>
        </div>

        {selectedWeek === Object.keys(semanas).length && (
          <div className="animate-pulse bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
            <span>✨</span>
            <span>¡Fase Final! Desbloquea la Evaluación Sensorial a continuación.</span>
          </div>
        )}
      </div>

    </div>
  );
};
