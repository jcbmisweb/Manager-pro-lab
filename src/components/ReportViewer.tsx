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
    degustaciones?: any[];
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
          .section-title { font-size: 16px; font-weight: bold; text-transform: uppercase; border-left: 4px solid #10b981; padding-left: 8px; margin-top: 30px; margin-bottom: 15px; page-break-after: avoid; }
          .entry-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
          .entry-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; font-size: 12px; color: #64748b; font-family: monospace; }
          .entry-ph { background-color: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-weight: bold; color: #0f172a; }
          .entry-text { font-size: 13px; line-height: 1.6; color: #334155; }
          .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 15px; }
          .gallery-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; }
          .radar-score { display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; margin-right: 8px; }
          
          /* TasteLab & Sostenibilidad Print Styles */
          .tastelab-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background-color: #f8fafc; margin-bottom: 25px; page-break-inside: avoid; }
          .tastelab-card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #1e1b4b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; }
          .metric-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
          .metric-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; background-color: #ffffff; }
          .metric-label { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; }
          .metric-val { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 4px; display: block; font-family: monospace; }
          .metric-desc { font-size: 10px; color: #475569; margin-top: 2px; display: block; }
          
          .sensory-profile { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 15px; }
          .sensory-row { display: flex; flex-direction: column; gap: 4px; }
          .sensory-header { display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; color: #334155; }
          .sensory-desc { font-size: 10px; color: #4f46e5; font-weight: 600; }
          .sensory-bar-bg { height: 8px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden; width: 100%; display: flex; }
          .sensory-bar-fill { height: 100%; background-image: linear-gradient(to right, #818cf8, #4f46e5); border-radius: 4px; }
          
          .eco-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px; }
          .eco-box { background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px; font-size: 10px; line-height: 1.4; color: #065f46; text-align: center; }
          .eco-title { font-weight: bold; text-transform: uppercase; font-size: 9px; margin-bottom: 3px; display: block; color: #047857; }
          .eco-val { font-size: 12px; font-weight: 800; display: block; font-family: monospace; margin-top: 2px; }
          
          .consensus-container { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-top: 25px; page-break-inside: avoid; }
          .consensus-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #1e1b4b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; }
          .consensus-profile-bar { height: 12px; background-color: #e2e8f0; border-radius: 6px; overflow: hidden; position: relative; width: 100%; }
          .consensus-fill-user { background-color: rgba(79, 70, 229, 0.3); height: 100%; position: absolute; left: 0; top: 0; }
          .consensus-fill-panel { background-color: #4f46e5; height: 50%; border-radius: 3px; position: absolute; left: 0; bottom: 0; }
          .peer-opinion-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 15px; }
          .peer-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background-color: #f8fafc; font-size: 11px; line-height: 1.4; }
          .peer-card-header { display: flex; justify-content: space-between; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
          .peer-card-date { font-size: 8px; color: #94a3b8; font-family: monospace; }
          .peer-card-comment { font-style: italic; color: #475569; background: #ffffff; padding: 6px; border-radius: 6px; border: 1px solid #f1f5f9; margin-top: 4px; margin-bottom: 6px; }
          .peer-card-ratings { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; text-align: center; }
          .peer-card-rating { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px; font-family: monospace; font-size: 10px; }
          .peer-card-rating span { display: block; font-size: 7px; color: #94a3b8; text-transform: uppercase; }
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

  const getFirmezaText = (v: number) => {
    if (v === 0) return 'Líquida / Pastosa';
    if (v === 1) return 'Untable blanda';
    if (v === 2) return 'Semicurada blanda';
    if (v === 3) return 'Firmeza media estándar';
    if (v === 4) return 'Sólida / Curación uniforme';
    return 'Sólida / Corte limpio perfecto';
  };

  const getUniformidadText = (v: number) => {
    if (v === 0) return 'Grietas / Defectos graves';
    if (v === 1) return 'Grietas ligeras externas';
    if (v === 2) return 'Rugosidades marcadas';
    if (v === 3) return 'Capa delgada homogénea';
    if (v === 4) return 'Capa uniforme sin manchas';
    return 'Cobertura homogénea impecable';
  };

  const getAcidezText = (v: number) => {
    if (v === 0) return 'Neutro / Plano';
    if (v === 1) return 'Acidez imperceptible';
    if (v === 2) return 'Ligeramente agrio';
    if (v === 3) return 'Ácido láctico agradable';
    if (v === 4) return 'Ácido balanceado firme';
    return 'Ácido balanceado excelente / Umami';
  };

  const getPersistenciaText = (v: number) => {
    if (v === 0) return 'Fugaz / Insípido';
    if (v === 1) return 'Final muy tenue';
    if (v === 2) return 'Notas medias cortas';
    if (v === 3) return 'Retrogusto láctico marcado';
    if (v === 4) return 'Persistente y aromático';
    return 'Muy persistente / Sabor madurado profundo';
  };

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
            {proyecto.pesoFinal !== null && (() => {
              const pFinal = proyecto.pesoFinal || 0;
              const rendimiento = proyecto.pesoInicial > 0 ? (pFinal / proyecto.pesoInicial) * 100 : 0;
              const perdidaPeso = Math.max(0, proyecto.pesoInicial - pFinal);
              
              const precioMateriaPrimaKilo = challenge.precioMateriaPrimaKilo || 14.5;
              const precioComercialKilo = challenge.precioComercialKilo || 55.0;

              const costeIngredientes = (proyecto.pesoInicial / 1000) * precioMateriaPrimaKilo + 0.5;
              const costeComercialEquivalente = (pFinal / 1000) * precioComercialKilo;
              const ahorroNeto = Math.max(0, costeComercialEquivalente - costeIngredientes);
              const ahorroPorcentaje = costeComercialEquivalente > 0 ? (ahorroNeto / costeComercialEquivalente) * 100 : 0;

              const hasDegustaciones = proyecto.degustaciones && proyecto.degustaciones.length > 0;
              const peerAvg = hasDegustaciones ? {
                firmeza: parseFloat((proyecto.degustaciones!.reduce((acc, curr) => acc + curr.firmeza, 0) / proyecto.degustaciones!.length).toFixed(1)),
                uniformidad: parseFloat((proyecto.degustaciones!.reduce((acc, curr) => acc + curr.uniformidad, 0) / proyecto.degustaciones!.length).toFixed(1)),
                acidez: parseFloat((proyecto.degustaciones!.reduce((acc, curr) => acc + curr.acidez, 0) / proyecto.degustaciones!.length).toFixed(1)),
                persistencia: parseFloat((proyecto.degustaciones!.reduce((acc, curr) => acc + curr.persistencia, 0) / proyecto.degustaciones!.length).toFixed(1)),
              } : { firmeza: 0, uniformidad: 0, acidez: 0, persistencia: 0 };

              return (
                <>
                  {/* TASTELAB ANALYTICS INTEGRATION */}
                  <div className="section-title border-l-4 border-emerald-500 pl-2 text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 mt-8">
                    Resultados del Análisis Sensorial TasteLab y Sostenibilidad
                  </div>

                  <div className="tastelab-card bg-slate-50 border border-slate-200/60 rounded-xl p-5 space-y-4">
                    <div className="tastelab-card-title text-xs font-bold text-indigo-950 border-b border-slate-200/50 pb-2 mb-3 uppercase tracking-wider">
                      Ficha de Rendimiento Técnico y Viabilidad Comercial
                    </div>

                    {/* Yield and Savings metrics */}
                    <div className="metric-cols grid grid-cols-3 gap-3">
                      <div className="metric-box bg-white border border-slate-150 p-3 rounded-lg text-center shadow-3xs">
                        <span className="metric-label block text-[9px] uppercase font-mono text-slate-400 font-bold">Rendimiento Neto</span>
                        <span className="metric-val text-sm font-extrabold text-slate-800 block mt-1">{rendimiento.toFixed(1)}%</span>
                        <span className="metric-desc text-[9px] text-slate-500 mt-1 block">
                          {rendimiento >= 65 && rendimiento <= 80 ? "🟢 Rango óptimo" : "🟡 Desviación humedad"}
                        </span>
                      </div>
                      <div className="metric-box bg-white border border-slate-150 p-3 rounded-lg text-center shadow-3xs">
                        <span className="metric-label block text-[9px] uppercase font-mono text-slate-400 font-bold">Pérdida de Peso</span>
                        <span className="metric-val text-sm font-extrabold text-slate-800 block mt-1">{perdidaPeso.toFixed(1)} g</span>
                        <span className="metric-desc text-[9px] text-slate-500 mt-1 block">Merma por evaporación</span>
                      </div>
                      <div className="metric-box bg-white border border-slate-150 p-3 rounded-lg text-center shadow-3xs">
                        <span className="metric-label block text-[9px] uppercase font-mono text-slate-400 font-bold">Ahorro Neto Estimado</span>
                        <span className="metric-val text-sm font-extrabold text-emerald-600 block mt-1">+{ahorroNeto.toFixed(2)} €</span>
                        <span className="metric-desc text-[9px] text-emerald-600 block">-{ahorroPorcentaje.toFixed(0)}% frente a comercial</span>
                      </div>
                    </div>

                    {/* Sensory Characterisation Bars */}
                    <div className="space-y-3 pt-2">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-1">
                        Firma Organoléptica (Autoevaluación)
                      </div>
                      
                      <div className="sensory-profile grid gap-3">
                        {/* Firmeza bar */}
                        <div className="sensory-row">
                          <div className="sensory-header flex justify-between text-xs">
                            <span className="font-semibold text-slate-600">Firmeza de la Pasta ({proyecto.sensorial.firmeza}/5)</span>
                            <span className="sensory-desc text-[11px] text-indigo-600 font-medium">{getFirmezaText(proyecto.sensorial.firmeza)}</span>
                          </div>
                          <div className="sensory-bar-bg h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="sensory-bar-fill h-full bg-gradient-to-r from-indigo-500 to-indigo-600" style={{ width: `${(proyecto.sensorial.firmeza / 5) * 100}%` }} />
                          </div>
                        </div>

                        {/* Uniformidad bar */}
                        <div className="sensory-row">
                          <div className="sensory-header flex justify-between text-xs">
                            <span className="font-semibold text-slate-600">Uniformidad de la Corteza ({proyecto.sensorial.uniformidad}/5)</span>
                            <span className="sensory-desc text-[11px] text-indigo-600 font-medium">{getUniformidadText(proyecto.sensorial.uniformidad)}</span>
                          </div>
                          <div className="sensory-bar-bg h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="sensory-bar-fill h-full bg-gradient-to-r from-indigo-500 to-indigo-600" style={{ width: `${(proyecto.sensorial.uniformidad / 5) * 100}%` }} />
                          </div>
                        </div>

                        {/* Acidez bar */}
                        <div className="sensory-row">
                          <div className="sensory-header flex justify-between text-xs">
                            <span className="font-semibold text-slate-600">Intensidad de la Acidez ({proyecto.sensorial.acidez}/5)</span>
                            <span className="sensory-desc text-[11px] text-indigo-600 font-medium">{getAcidezText(proyecto.sensorial.acidez)}</span>
                          </div>
                          <div className="sensory-bar-bg h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="sensory-bar-fill h-full bg-gradient-to-r from-indigo-500 to-indigo-600" style={{ width: `${(proyecto.sensorial.acidez / 5) * 100}%` }} />
                          </div>
                        </div>

                        {/* Persistencia bar */}
                        <div className="sensory-row">
                          <div className="sensory-header flex justify-between text-xs">
                            <span className="font-semibold text-slate-600">Persistencia del Retrogusto ({proyecto.sensorial.persistencia}/5)</span>
                            <span className="sensory-desc text-[11px] text-indigo-600 font-medium">{getPersistenciaText(proyecto.sensorial.persistencia)}</span>
                          </div>
                          <div className="sensory-bar-bg h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="sensory-bar-fill h-full bg-gradient-to-r from-indigo-500 to-indigo-600" style={{ width: `${(proyecto.sensorial.persistencia / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Environmental Impacts */}
                    <div className="pt-2">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-1 mb-2">
                        Indicadores de Impacto Ecológico y Economía Circular
                      </div>
                      <div className="eco-grid grid grid-cols-3 gap-2">
                        <div className="eco-box bg-emerald-50 text-emerald-800 border border-emerald-200 p-2 rounded-lg text-center">
                          <span className="eco-title block text-[8px] font-bold text-emerald-600 uppercase">Huella Carbono CO₂eq</span>
                          <span className="eco-val font-bold text-xs">-85% Reducido</span>
                        </div>
                        <div className="eco-box bg-emerald-50 text-emerald-800 border border-emerald-200 p-2 rounded-lg text-center">
                          <span className="eco-title block text-[8px] font-bold text-emerald-600 uppercase">Residuos Plásticos</span>
                          <span className="eco-val font-bold text-xs">Residuo Cero</span>
                        </div>
                        <div className="eco-box bg-emerald-50 text-emerald-800 border border-emerald-200 p-2 rounded-lg text-center">
                          <span className="eco-title block text-[8px] font-bold text-emerald-600 uppercase">Huella Hídrica Directa</span>
                          <span className="eco-val font-bold text-xs">100% Sostenible</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PEER REVIEW PANEL CONSENSUS IF THERE ARE REVIEW ENTRIES */}
                  {hasDegustaciones && (
                    <div className="consensus-container bg-slate-50 border border-slate-200 rounded-xl p-5 mt-5 space-y-4 page-break-inside-avoid shadow-3xs">
                      <div className="consensus-title text-xs font-bold text-indigo-950 border-b border-slate-200 pb-2 uppercase tracking-wider flex justify-between items-center">
                        <span>Análisis del Consenso del Panel de Cata Colaborativo</span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold">
                          {proyecto.degustaciones!.length} valoraciones recibidas
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        {/* Firmeza Consensus */}
                        <div className="space-y-1">
                          <div className="flex justify-between font-semibold">
                            <span>Consenso de Firmeza</span>
                            <span className="font-mono text-[10px] text-slate-500">Autoevaluación: <strong className="text-slate-800">{proyecto.sensorial.firmeza}</strong> | Panel: <strong className="text-indigo-600">{peerAvg.firmeza}</strong></span>
                          </div>
                          <div className="consensus-profile-bar h-2.5 bg-slate-200 rounded-full relative overflow-hidden">
                            <div className="consensus-fill-user h-full absolute left-0 top-0 bg-indigo-500/30" style={{ width: `${(proyecto.sensorial.firmeza / 5) * 100}%` }} />
                            <div className="consensus-fill-panel h-1.25 absolute left-0 bottom-0 bg-indigo-600" style={{ width: `${(peerAvg.firmeza / 5) * 100}%` }} />
                          </div>
                        </div>

                        {/* Uniformidad Consensus */}
                        <div className="space-y-1">
                          <div className="flex justify-between font-semibold">
                            <span>Consenso de Uniformidad</span>
                            <span className="font-mono text-[10px] text-slate-500">Autoevaluación: <strong className="text-slate-800">{proyecto.sensorial.uniformidad}</strong> | Panel: <strong className="text-indigo-600">{peerAvg.uniformidad}</strong></span>
                          </div>
                          <div className="consensus-profile-bar h-2.5 bg-slate-200 rounded-full relative overflow-hidden">
                            <div className="consensus-fill-user h-full absolute left-0 top-0 bg-indigo-500/30" style={{ width: `${(proyecto.sensorial.uniformidad / 5) * 100}%` }} />
                            <div className="consensus-fill-panel h-1.25 absolute left-0 bottom-0 bg-indigo-600" style={{ width: `${(peerAvg.uniformidad / 5) * 100}%` }} />
                          </div>
                        </div>

                        {/* Acidez Consensus */}
                        <div className="space-y-1">
                          <div className="flex justify-between font-semibold">
                            <span>Consenso de Acidez</span>
                            <span className="font-mono text-[10px] text-slate-500">Autoevaluación: <strong className="text-slate-800">{proyecto.sensorial.acidez}</strong> | Panel: <strong className="text-indigo-600">{peerAvg.acidez}</strong></span>
                          </div>
                          <div className="consensus-profile-bar h-2.5 bg-slate-200 rounded-full relative overflow-hidden">
                            <div className="consensus-fill-user h-full absolute left-0 top-0 bg-indigo-500/30" style={{ width: `${(proyecto.sensorial.acidez / 5) * 100}%` }} />
                            <div className="consensus-fill-panel h-1.25 absolute left-0 bottom-0 bg-indigo-600" style={{ width: `${(peerAvg.acidez / 5) * 100}%` }} />
                          </div>
                        </div>

                        {/* Persistencia Consensus */}
                        <div className="space-y-1">
                          <div className="flex justify-between font-semibold">
                            <span>Consenso de Persistencia</span>
                            <span className="font-mono text-[10px] text-slate-500">Autoevaluación: <strong className="text-slate-800">{proyecto.sensorial.persistencia}</strong> | Panel: <strong className="text-indigo-600">{peerAvg.persistencia}</strong></span>
                          </div>
                          <div className="consensus-profile-bar h-2.5 bg-slate-200 rounded-full relative overflow-hidden">
                            <div className="consensus-fill-user h-full absolute left-0 top-0 bg-indigo-500/30" style={{ width: `${(proyecto.sensorial.persistencia / 5) * 100}%` }} />
                            <div className="consensus-fill-panel h-1.25 absolute left-0 bottom-0 bg-indigo-600" style={{ width: `${(peerAvg.persistencia / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* History list of peer opinions and descriptions */}
                      <div className="pt-3">
                        <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-1 mb-3">
                          Historial de Valoraciones y Notas de Cata de Compañeros
                        </div>
                        <div className="peer-opinion-grid grid grid-cols-2 gap-3">
                          {proyecto.degustaciones!.map((d, idx) => (
                            <div key={d.id || idx} className="peer-card border border-slate-200 rounded-lg p-3 bg-white space-y-2 shadow-3xs">
                              <div className="peer-card-header flex justify-between font-bold text-xs text-slate-800">
                                <span>{d.nombre}</span>
                                <span className="peer-card-date text-[9px] text-slate-400 font-mono">
                                  {d.fecha ? new Date(d.fecha).toLocaleDateString() : ""}
                                </span>
                              </div>
                              {d.comentario && (
                                <p className="peer-card-comment italic text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                  "{d.comentario}"
                                </p>
                              )}
                              <div className="peer-card-ratings grid grid-cols-4 gap-1">
                                <div className="peer-card-rating bg-slate-50 p-1 rounded text-center border text-[10px]">
                                  <span className="block text-[7px] text-slate-400 font-bold uppercase">Firm</span>
                                  <strong className="text-indigo-600">{d.firmeza}</strong>
                                </div>
                                <div className="peer-card-rating bg-slate-50 p-1 rounded text-center border text-[10px]">
                                  <span className="block text-[7px] text-slate-400 font-bold uppercase">Unif</span>
                                  <strong className="text-indigo-600">{d.uniformidad}</strong>
                                </div>
                                <div className="peer-card-rating bg-slate-50 p-1 rounded text-center border text-[10px]">
                                  <span className="block text-[7px] text-slate-400 font-bold uppercase">Acid</span>
                                  <strong className="text-indigo-600">{d.acidez}</strong>
                                </div>
                                <div className="peer-card-rating bg-slate-50 p-1 rounded text-center border text-[10px]">
                                  <span className="block text-[7px] text-slate-400 font-bold uppercase">Pers</span>
                                  <strong className="text-indigo-600">{d.persistencia}</strong>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

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
