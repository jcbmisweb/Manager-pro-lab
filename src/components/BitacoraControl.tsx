/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Save, Info, Image as ImageIcon, Trash2, Camera, Upload } from 'lucide-react';
import { SemanalLog } from '../types';
import { compressImage } from '../utils/imageCompressor';

interface BitacoraControlProps {
  semanas: Record<number, SemanalLog>;
  onSaveWeek: (week: number, ph: number, notas: string, fotos?: string[]) => void;
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;
  readOnly?: boolean;
}

export const BitacoraControl: React.FC<BitacoraControlProps> = ({
  semanas,
  onSaveWeek,
  selectedWeek,
  setSelectedWeek,
  readOnly = false,
}) => {
  const currentLog = semanas[selectedWeek];
  
  // Local transient states
  const [localPh, setLocalPh] = useState<number>(currentLog?.ph ?? 5.5);
  const [localNotas, setLocalNotas] = useState<string>(currentLog?.notas ?? '');
  const [localFotos, setLocalFotos] = useState<string[]>(currentLog?.fotos ?? []);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Synchronize local state when selectedWeek or semanas changes
  useEffect(() => {
    const log = semanas[selectedWeek];
    if (log) {
      setLocalPh(log.ph);
      setLocalNotas(log.notas || '');
      setLocalFotos(log.fotos || []);
    } else {
      setLocalPh(5.5);
      setLocalNotas('');
      setLocalFotos([]);
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
    onSaveWeek(selectedWeek, localPh, localNotas, localFotos);
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

      {/* Active Week Form Controls */}
      <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1 bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
              Semana {selectedWeek} Activa
            </span>
            <h3 className="text-sm font-bold text-slate-800 mt-1">
              Registro del Punto Crítico de Control (PCC-01)
            </h3>
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

        {/* pH Range Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label htmlFor="input-ph-range" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Medición de pH de la Pasta
            </label>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-md font-mono font-bold text-base text-slate-900 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">pH:</span>
              <span id="valor-ph-actual">{localPh.toFixed(1)}</span>
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
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 focus:outline-hidden disabled:opacity-50"
            />
            {/* Range markers */}
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2 px-1">
              <span>3.0 (Ácido)</span>
              <span>4.0</span>
              <span>4.5 (Punto Crítico)</span>
              <span>5.0</span>
              <span>6.0</span>
              <span>7.0 (Neutro)</span>
            </div>
          </div>
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
