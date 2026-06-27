import React, { useRef } from 'react';
import { FileText, Printer, Download, Award, ShieldAlert, Calendar } from 'lucide-react';
import { IESConfig, Aula, Usuario, Challenge } from '../types';

interface ReportViewerProps {
  iesConfig: IESConfig;
  aula: Aula | null;
  alumno: { id: string; nombre: string; correo: string };
  profesor: Usuario | null;
  proyecto: {
    id: string;
    nombre: string;
    challengeId: string;
    fechaCreacion: string;
    pesoInicial: number;
    tipoInoculante: string;
    started: boolean;
    semanas: Record<number, { ph: number; notas: string; completado: boolean; fechaRegistro?: string; fotos?: string[] }>;
    pesoFinal: number | null;
    sensorial: { firmeza: number; uniformidad: number; acidez: number; persistencia: number };
  };
  challenge: Challenge;
  onClose: () => void;
}

export function ReportViewer({
  iesConfig,
  aula,
  alumno,
  profesor,
  proyecto,
  challenge,
  onClose
}: ReportViewerProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      // Setup a clean printable window
      const win = window.open('', '', 'height=700,width=900');
      if (win) {
        win.document.write('<html><head><title>Informe Técnico - ' + proyecto.nombre + '</title>');
        win.document.write('<style>');
        win.document.write(`
          body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { max-height: 80px; max-width: 150px; }
          .ies-name { font-size: 20px; font-weight: bold; color: #0f172a; }
          .report-title { font-size: 24px; font-weight: 800; color: #1e293b; margin-top: 10px; text-transform: uppercase; }
          .meta-grid { display: grid; grid-columns: 1fr 1fr; gap: 15px; background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; font-size: 13px; line-height: 1.5; border: 1px solid #e2e8f0; }
          .section-title { font-size: 16px; font-weight: bold; text-transform: uppercase; border-left: 4px solid #10b981; padding-left: 8px; margin-top: 30px; margin-bottom: 15px; }
          .entry-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
          .entry-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; font-size: 12px; color: #64748b; font-family: monospace; }
          .entry-ph { background-color: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-weight: bold; color: #0f172a; }
          .entry-text { font-size: 13px; line-height: 1.6; color: #334155; }
          .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 15px; }
          .gallery-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; }
          .radar-score { display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; margin-right: 8px; }
        `);
        win.document.write('</style></head><body>');
        win.document.write(printContent);
        win.document.write('</body></html>');
        win.document.close();
        win.focus();
        setTimeout(() => {
          win.print();
          win.close();
        }, 500);
      }
    }
  };

  const completedWeeksKeys = Object.keys(proyecto.semanas)
    .map(Number)
    .filter(w => proyecto.semanas[w]?.completado)
    .sort((a, b) => a - b);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scale-in">
        
        {/* Header toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-sm text-slate-800 uppercase tracking-wide">Informe Técnico Final Compilado</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-3xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Scrollable Report Frame */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100/30">
          <div 
            ref={printAreaRef}
            className="bg-white max-w-3xl mx-auto p-8 rounded-xl border border-slate-200/60 shadow-xs text-slate-800"
          >
            {/* Cabecera Institucional */}
            <div className="header flex justify-between items-center border-b-2 border-slate-200 pb-5 mb-6">
              <div>
                <span className="ies-name font-black tracking-tight text-xl text-slate-900">
                  {iesConfig.nombre || "IES Valle de Leiva"}
                </span>
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold mt-0.5">
                  Innovaciones en cocina sostenible
                </p>
                <h1 className="report-title font-extrabold text-lg mt-2 text-slate-800 uppercase">
                  Informe Técnico de Laboratorio y Bioprocesos
                </h1>
              </div>
              {iesConfig.logo ? (
                <img 
                  src={iesConfig.logo} 
                  alt="Logo IES" 
                  className="logo max-h-[70px] max-w-[140px] object-contain border rounded p-1 bg-white shadow-3xs" 
                />
              ) : (
                <div className="w-16 h-16 rounded bg-slate-100 border flex items-center justify-center font-bold text-slate-400 text-xs">
                  [LOGO Centro]
                </div>
              )}
            </div>

            {/* Datos de Contexto */}
            <div className="meta-grid grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200/50 text-xs leading-relaxed mb-6">
              <div>
                <p className="text-slate-400 uppercase font-mono text-[9px] font-bold">Proyecto de Investigación</p>
                <p className="font-bold text-sm text-slate-800 mt-0.5">{proyecto.nombre}</p>
                
                <p className="text-slate-400 uppercase font-mono text-[9px] font-bold mt-2.5">Reto Homologado</p>
                <p className="font-bold text-slate-700 mt-0.5">{challenge.code} - {challenge.name}</p>
                
                <p className="text-slate-400 uppercase font-mono text-[9px] font-bold mt-2.5">Fecha de Inicialización</p>
                <p className="font-semibold text-slate-700 mt-0.5">
                  {proyecto.fechaCreacion ? new Date(proyecto.fechaCreacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No definida'}
                </p>
              </div>
              
              <div className="border-l border-slate-200 pl-4">
                <p className="text-slate-400 uppercase font-mono text-[9px] font-bold">Investigador / Alumno</p>
                <p className="font-bold text-sm text-slate-800 mt-0.5">{alumno.nombre}</p>
                <p className="text-slate-500 font-medium">{alumno.correo}</p>
                
                <p className="text-slate-400 uppercase font-mono text-[9px] font-bold mt-2.5">Aula / Grupo</p>
                <p className="font-bold text-slate-700 mt-0.5">{aula ? aula.nombre : 'Sin aula asignada'}</p>
                
                <p className="text-slate-400 uppercase font-mono text-[9px] font-bold mt-2.5">Profesor Responsable</p>
                <p className="font-bold text-slate-700 mt-0.5">{profesor ? profesor.nombre : 'No asignado'}</p>
              </div>
            </div>

            {/* Ficha Técnica y Línea Base */}
            <div className="section-title border-l-4 border-emerald-500 pl-2 text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 mt-6">
              Línea Base y Parámetros del Cultivo
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="border border-slate-200 p-3 rounded-lg text-center">
                <span className="block text-[9px] uppercase font-mono text-slate-400">Peso Inicial</span>
                <span className="text-sm font-bold text-slate-800">{proyecto.pesoInicial} g</span>
              </div>
              <div className="border border-slate-200 p-3 rounded-lg text-center">
                <span className="block text-[9px] uppercase font-mono text-slate-400">Inoculante</span>
                <span className="text-xs font-semibold text-slate-700 line-clamp-1 mt-0.5">{proyecto.tipoInoculante}</span>
              </div>
              <div className="border border-slate-200 p-3 rounded-lg text-center">
                <span className="block text-[9px] uppercase font-mono text-slate-400">Rango Seguro pH</span>
                <span className="text-xs font-bold text-emerald-600 mt-0.5">{"< 4.5"}</span>
              </div>
            </div>

            {/* Desarrollo del Proyecto - Diario de Campo (CRONOLÓGICO) */}
            <div className="section-title border-l-4 border-emerald-500 pl-2 text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 mt-8">
              Diario de Campo y Monitoreo (Orden Cronológico)
            </div>

            {completedWeeksKeys.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center p-6 border border-dashed rounded-lg">
                No hay semanas completadas registradas en la bitácora aún.
              </p>
            ) : (
              <div className="space-y-4">
                {completedWeeksKeys.map((wNum) => {
                  const s = proyecto.semanas[wNum];
                  const regDate = s.fechaRegistro ? new Date(s.fechaRegistro).toLocaleDateString() : `Semana ${wNum}`;
                  
                  return (
                    <div key={wNum} className="entry-card border border-slate-200 rounded-xl p-5 space-y-3">
                      <div className="entry-header flex justify-between items-center text-xs text-slate-400 font-mono font-semibold">
                        <span>[SEMANA {wNum}] — {regDate}</span>
                        <span className="entry-ph bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono font-bold">
                          pH: {s.ph.toFixed(1)}
                        </span>
                      </div>
                      
                      <p className="entry-text text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">
                        {s.notas || "Sin anotaciones de observación registradas."}
                      </p>

                      {/* Fotos de esta semana integradas en el orden exacto */}
                      {s.fotos && s.fotos.length > 0 && (
                        <div className="gallery grid grid-cols-3 gap-3 pt-2">
                          {s.fotos.map((f, index) => (
                            <img 
                              key={index} 
                              src={f} 
                              alt={`Avance Semana ${wNum}`} 
                              className="gallery-img w-full aspect-[4/3] object-cover rounded-lg border border-slate-100 shadow-3xs" 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Evaluación Organoléptica si existe */}
            {proyecto.pesoFinal !== null && (
              <>
                <div className="section-title border-l-4 border-emerald-500 pl-2 text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 mt-8">
                  Resultados del Análisis Sensorial TasteLab
                </div>
                <div className="bg-slate-50 p-4 border border-slate-200/60 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-slate-600">Rendimiento Técnico de Masa:</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">
                        Masa Final: {proyecto.pesoFinal}g (Rendimiento: {Math.round((proyecto.pesoFinal / proyecto.pesoInicial) * 100)}%)
                      </p>
                    </div>
                    <div className="border-l border-slate-200 pl-4">
                      <p className="font-semibold text-slate-600">Puntajes Organolépticos (0 - 5):</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="radar-score bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Firmeza: {proyecto.sensorial.firmeza}
                        </span>
                        <span className="radar-score bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Uniformidad: {proyecto.sensorial.uniformidad}
                        </span>
                        <span className="radar-score bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Acidez: {proyecto.sensorial.acidez}
                        </span>
                        <span className="radar-score bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Persistencia: {proyecto.sensorial.persistencia}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Certificación y Firmas */}
            <div className="border-t border-dashed border-slate-300 mt-10 pt-8 grid grid-cols-2 gap-8 text-center text-[11px] text-slate-500 page-break-inside-avoid">
              <div className="space-y-6">
                <p>Firma del Alumno Investigador</p>
                <div className="w-1/2 mx-auto border-b border-slate-400 h-8" />
                <p className="font-bold text-slate-700">{alumno.nombre}</p>
              </div>
              <div className="space-y-6">
                <p>Sello del Centro y Firma del Profesor</p>
                <div className="w-1/2 mx-auto border-b border-slate-400 h-8" />
                <p className="font-bold text-slate-700">{profesor ? profesor.nombre : 'Juan Codina (Profesor)'}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
