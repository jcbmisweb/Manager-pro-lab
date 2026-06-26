/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Download, ShieldCheck, FileText, BarChart3, AlertTriangle, Check } from 'lucide-react';

interface DocumentViewerProps {
  docType: 'pdf' | 'infografia' | null;
  onClose: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ docType, onClose }) => {
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  if (!docType) return null;

  const isPdf = docType === 'pdf';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded ${isPdf ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">
                {isPdf ? 'Reto_01A_Manual.pdf' : 'Reto_01A_Infografia.png'}
              </h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                {isPdf ? 'Manual de Procedimiento de Laboratorio' : 'Infografía de Puntos Críticos (PCC)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          {isPdf ? (
            /* PDF Manual Mock Content */
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex gap-2.5 items-start">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-emerald-950 text-xs uppercase tracking-wide">
                    Estándar de Seguridad Microbiológica (FCCP-A)
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    El pH del queso madurado debe descender por debajo de 4.4 en las primeras 48h para garantizar un medio hostil contra patógenos.
                  </p>
                </div>
              </div>

              {/* El Iniciador */}
              <div className="bg-amber-50/50 border border-amber-200 p-3.5 rounded-lg">
                <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider">
                  🧪 El Iniciador: Kéfir de Agua
                </h4>
                <p className="text-xs text-amber-800 mt-1 font-sans">
                  <strong>Receta de Activación:</strong> Mezclar 1L de agua purificada, 60g de azúcar cruda, 30g de cristales activos de kéfir, higos secos para nutrición mineral y rodajas de limón fresco. Fermentar en oscuridad de 24 a 48 horas antes de inocular la crema.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider text-xs">
                  Fases del Proceso Técnico & Cronograma:
                </h4>
                <ol className="mt-2.5 space-y-3 font-sans list-decimal list-inside pl-1 text-slate-600">
                  <li>
                    <strong className="text-slate-900">Semanas 1-2 (Arranque y Moldeo):</strong> Lavado riguroso con agua filtrada y remojo de los anacardos crudos (8-12h). Inocular la crema de anacardos fina con el iniciador de kéfir de agua. Moldeado inicial, salado exterior y deshidratación inicial para ganar firmeza estructural.
                  </li>
                  <li>
                    <strong className="text-slate-900">Molienda Controlada:</strong> Triturar los ingredientes cuidando de no exceder los límites térmicos enzimáticos.
                  </li>
                  <li>
                    <strong className="text-slate-900">Fermentación Primaria (12h):</strong> Reposo térmico vigilado en cámara para iniciar la cascada ácida.
                  </li>
                  <li>
                    <strong className="text-slate-900">Semanas 3-7 (Maduración Lenta):</strong> Reposo controlado en ambiente fresco (12-15°C, 75-80% de humedad relativa). Volteo periódico cada 48h. Monitoreo constante de la superficie.
                  </li>
                  <li>
                    <strong className="text-slate-900">Semana 8 (Presentación y Cata):</strong> Análisis de rendimiento neto y evaluación final con cata organoléptica en el módulo sensorial.
                  </li>
                </ol>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <h5 className="font-semibold text-xs text-slate-900 uppercase">Parámetros Críticos de Control:</h5>
                <ul className="mt-1.5 space-y-2 text-xs text-slate-600 font-mono">
                  <li className="flex justify-between border-b border-slate-100 pb-1">
                    <span>🌡️ Temp. de Triturado:</span>
                    <span className="font-bold text-slate-800">&lt; 35°C - 42°C</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 pb-1">
                    <span>🌡️ Temp. Fermentación:</span>
                    <span className="font-bold text-slate-800">28°C - 30°C (12 h)</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 pb-1">
                    <span>🧪 pH de Seguridad:</span>
                    <span className="font-bold text-emerald-600">≤ 4.4</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            /* Infografía Mock Content */
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                  <span className="block text-lg font-bold text-emerald-600">pH &lt; 4.5</span>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-tight">🟢 Seguro</span>
                  <span className="text-[9px] text-emerald-600 block mt-0.5 font-sans">Ideal bacteriano</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                  <span className="block text-lg font-bold text-amber-600">4.5 - 4.6</span>
                  <span className="text-[10px] text-amber-800 uppercase font-bold tracking-tight">🟡 Retirar</span>
                  <span className="text-[9px] text-amber-600 block mt-0.5 font-sans">Levadura Kahm</span>
                </div>
                <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg">
                  <span className="block text-lg font-bold text-red-600">pH &gt; 4.6</span>
                  <span className="text-[10px] text-red-800 uppercase font-bold tracking-tight">🔴 Descartar</span>
                  <span className="text-[9px] text-red-600 block mt-0.5 font-sans">Peligro o Moho</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-slate-700" />
                  Semáforo de Seguridad del pH y Curva de Maduración
                </h4>
                
                {/* Simulated Infographic Graph */}
                <div className="mt-4 h-40 flex items-end justify-between border-b border-l border-slate-300 pb-2 pl-2 relative">
                  
                  {/* Warning guideline at pH 4.5 */}
                  <div className="absolute left-0 right-0 border-t border-dashed border-amber-300 top-1/2" />
                  <span className="absolute left-1 text-[8px] font-mono text-amber-600 bg-white px-1 -translate-y-1/2" style={{ top: '50%' }}>
                    pH 4.5 Alerta
                  </span>
                  
                  {/* Danger guideline at pH 4.6 */}
                  <div className="absolute left-0 right-0 border-t border-dashed border-red-300 top-2/5" />
                  <span className="absolute left-1 text-[8px] font-mono text-red-600 bg-white px-1 -translate-y-1/2" style={{ top: '40%' }}>
                    pH 4.6 Descarte
                  </span>

                  {/* Bars representing pH curve over weeks */}
                  <div className="w-[10%] flex flex-col items-center gap-1 z-10">
                    <span className="text-[9px] font-mono font-bold text-red-600">5.5</span>
                    <div className="w-full bg-red-400 h-28 rounded-t-sm" />
                    <span className="text-[8px] text-slate-400 font-mono">Sem 1</span>
                  </div>
                  <div className="w-[10%] flex flex-col items-center gap-1 z-10">
                    <span className="text-[9px] font-mono font-bold text-red-600">4.8</span>
                    <div className="w-full bg-red-400 h-24 rounded-t-sm" />
                    <span className="text-[8px] text-slate-400 font-mono">Sem 2</span>
                  </div>
                  <div className="w-[10%] flex flex-col items-center gap-1 z-10">
                    <span className="text-[9px] font-mono font-bold text-amber-600">4.6</span>
                    <div className="w-full bg-amber-400 h-20 rounded-t-sm" />
                    <span className="text-[8px] text-slate-400 font-mono">Sem 3</span>
                  </div>
                  <div className="w-[10%] flex flex-col items-center gap-1 z-10">
                    <span className="text-[9px] font-mono text-emerald-600">4.4</span>
                    <div className="w-full bg-emerald-500 h-16 rounded-t-sm" />
                    <span className="text-[8px] text-slate-400 font-mono">Sem 4</span>
                  </div>
                  <div className="w-[10%] flex flex-col items-center gap-1 z-10">
                    <span className="text-[9px] font-mono text-emerald-600">4.3</span>
                    <div className="w-full bg-emerald-600 h-14 rounded-t-sm" />
                    <span className="text-[8px] text-slate-400 font-mono">Sem 5</span>
                  </div>
                  <div className="w-[10%] flex flex-col items-center gap-1 z-10">
                    <span className="text-[9px] font-mono text-emerald-600">4.2</span>
                    <div className="w-full bg-emerald-600 h-12 rounded-t-sm" />
                    <span className="text-[8px] text-slate-400 font-mono">Sem 6</span>
                  </div>
                  <div className="w-[10%] flex flex-col items-center gap-1 z-10">
                    <span className="text-[9px] font-mono text-emerald-600">4.1</span>
                    <div className="w-full bg-emerald-600 h-11 rounded-t-sm" />
                    <span className="text-[8px] text-slate-400 font-mono">Sem 7</span>
                  </div>
                  <div className="w-[10%] flex flex-col items-center gap-1 z-10">
                    <span className="text-[9px] font-mono text-emerald-600">4.0</span>
                    <div className="w-full bg-emerald-700 h-10 rounded-t-sm" />
                    <span className="text-[8px] text-slate-400 font-mono">Sem 8</span>
                  </div>

                </div>
              </div>

              <div className="flex gap-2 p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>
                  <strong>Acción Correctiva Crítica:</strong> Si la corteza desarrolla mohos oscuros o levadura Kahm extendida persistente, se debe retirar o descartar según corresponda. Si el pH es mayor a 4.6 en semanas avanzadas, descarte por seguridad microbiológica.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3.5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="w-full sm:w-auto">
            {downloadStatus && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg animate-fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{downloadStatus}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cerrar Vista
            </button>
            
            <button
              onClick={() => {
                setDownloadStatus(
                  `Descargado: ${isPdf ? 'Manual de Laboratorio' : 'Infografía de Puntos Críticos'}`
                );
                setTimeout(() => {
                  setDownloadStatus(null);
                }, 3000);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar Archivo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
