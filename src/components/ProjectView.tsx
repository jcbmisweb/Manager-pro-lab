import React from 'react';
import { Challenge } from '../types';
import { PhProtocol } from './PhProtocol';

interface ProjectViewProps {
  challenge: Challenge;
  onClose: () => void;
  onStartProject?: (challengeId: string, title: string) => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ challenge, onClose, onStartProject }) => {
  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{challenge.code}</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{challenge.name}</h1>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Infografía */}
          {(challenge.infographicUrl || challenge.pdfUrl) && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Documentación del Proyecto</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenge.infographicUrl && (
                  <a 
                    href={challenge.infographicUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-4 bg-slate-100 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-200 transition-colors gap-2 font-bold"
                  >
                    <span>🖼️</span> Descargar Infografía
                  </a>
                )}
                {challenge.pdfUrl && (
                  <a 
                    href={challenge.pdfUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-4 bg-blue-100 rounded-xl border border-blue-200 text-blue-800 hover:bg-blue-200 transition-colors gap-2 font-bold"
                  >
                    <span>📄</span> Descargar Ficha Técnica (PDF)
                  </a>
                )}
              </div>
            </section>
          )}

          {/* 1. Estructura de Reto */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">1. Ficha del Proyecto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Objetivo Sostenible</h3>
                <p className="text-sm text-emerald-900 leading-relaxed">{challenge.sustainableObjective}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Reto Técnico (Variable)</h3>
                <p className="text-sm text-blue-900 leading-relaxed">{challenge.investigationVariable}</p>
              </div>
            </div>
            {challenge.description && (
              <p className="text-sm text-slate-600 mt-2 italic">{challenge.description}</p>
            )}
          </section>

          {/* 2. Insumos Base */}
          {challenge.insumosBase && challenge.insumosBase.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">2. Insumos Base</h2>
              <div className="space-y-6">
                {challenge.insumosBase.map((insumo, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                      <h3 className="font-bold text-slate-800">{insumo.titulo}</h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ingredientes</h4>
                        <ul className="space-y-2">
                          {insumo.ingredientes.map(ing => (
                            <li key={ing.id} className="text-sm text-slate-700 flex justify-between border-b border-slate-100 pb-1">
                              <span>{ing.nombre} {ing.notas && <span className="text-xs text-slate-400 italic ml-1">({ing.notas})</span>}</span>
                              <span className="font-bold">{ing.cantidad}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Procedimiento</h4>
                        <ol className="list-decimal pl-4 space-y-2 text-sm text-slate-700">
                          {insumo.pasos.map(paso => (
                            <li key={paso.id}>{paso.descripcion}</li>
                          ))}
                        </ol>
                        {insumo.mantenimiento && (
                          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <h5 className="text-xs font-bold text-amber-800 uppercase mb-1">Mantenimiento</h5>
                            <p className="text-xs text-amber-900">{insumo.mantenimiento}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Elaboración Principal */}
          {challenge.elaboracionPrincipal && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">3. Elaboración Principal</h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-800 px-4 py-2 border-b border-slate-900">
                  <h3 className="font-bold text-white">{challenge.elaboracionPrincipal.titulo}</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Materia Prima</h4>
                    <ul className="space-y-2">
                      {challenge.elaboracionPrincipal.ingredientes.map(ing => (
                        <li key={ing.id} className="text-sm text-slate-700 flex justify-between border-b border-slate-200 pb-1">
                          <span>{ing.nombre}</span>
                          <span className="font-bold">{ing.cantidad}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Montaje</h4>
                    <ol className="list-decimal pl-4 space-y-2 text-sm text-slate-700">
                      {challenge.elaboracionPrincipal.pasos.map(paso => (
                        <li key={paso.id}>{paso.descripcion}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 4. Cronograma */}
          {challenge.cronograma && challenge.cronograma.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">4. Cronograma y Monitorización</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                      <th className="p-3 font-bold text-slate-700">Fase</th>
                      <th className="p-3 font-bold text-slate-700 text-center">Semana</th>
                      <th className="p-3 font-bold text-slate-700">Acción del Alumno</th>
                      <th className="p-3 font-bold text-slate-700">PCC (Punto Crítico)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenge.cronograma.map((fase) => (
                      <tr key={fase.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-800 align-top">{fase.fase}</td>
                        <td className="p-3 text-slate-600 align-top text-center font-mono bg-slate-50">{fase.semanas}</td>
                        <td className="p-3 text-slate-600 align-top">{fase.accionAlumno}</td>
                        <td className="p-3 text-red-600 font-medium align-top">{fase.puntoCriticoControl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <PhProtocol />
          
          {/* Action Footer */}
          <div className="pt-8 flex justify-end gap-4 border-t border-slate-200">
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">
              Cancelar
            </button>
            {onStartProject && (
              <button 
                onClick={() => {
                  onStartProject(challenge.id, `Proyecto: ${challenge.name}`);
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-all shadow-md flex items-center gap-2"
              >
                <span>🚀</span> Iniciar Laboratorio
              </button>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};
