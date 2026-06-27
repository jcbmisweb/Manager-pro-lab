import React, { useState } from 'react';
import { Challenge } from '../types';

interface ProjectAdminManagerProps {
  challenge: Challenge;
  onClose: () => void;
  onSave: (updatedChallenge: Challenge) => void;
}

export const ProjectAdminManager: React.FC<ProjectAdminManagerProps> = ({ challenge, onClose, onSave }) => {
  const [editedChallenge, setEditedChallenge] = useState<Challenge>(challenge);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[80vh]">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <div>
          <h2 className="font-bold text-slate-800">{editedChallenge.code}: {editedChallenge.name}</h2>
          <p className="text-xs text-slate-500">Gestión de estructura del proyecto y ficha técnica</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-md text-xs font-bold transition-colors">
            Cerrar
          </button>
          <button onClick={() => onSave(editedChallenge)} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 transition-colors">
            Guardar Cambios
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Identificación del Proyecto */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Identificación del Proyecto</h3>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Nombre del Proyecto */}
            <div className="space-y-2 flex-1">
              <label className="text-xs font-bold text-slate-600 block">Nombre del Proyecto</label>
              <input 
                type="text"
                value={editedChallenge.name || ''}
                onChange={e => setEditedChallenge({...editedChallenge, name: e.target.value})}
                placeholder="Nombre del proyecto"
                style={{ colorScheme: 'light', color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-slate-900 bg-white font-medium"
              />
            </div>
          </div>

          <div className="flex gap-4">
            {/* Código del Proyecto */}
            <div className="space-y-2 w-32">
              <label className="text-xs font-bold text-slate-600 block">Código</label>
              <input 
                type="text"
                value={editedChallenge.code || ''}
                onChange={e => setEditedChallenge({...editedChallenge, code: e.target.value})}
                placeholder="PROY-01"
                style={{ colorScheme: 'light', color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none font-mono text-slate-900 bg-white font-medium"
              />
            </div>

            {/* Bloque del Proyecto */}
            <div className="space-y-2 flex-1">
              <label className="text-xs font-bold text-slate-600 block font-bold text-indigo-900">Bloque / Categoría</label>
              <select 
                value={editedChallenge.bloque || 'A'}
                onChange={e => setEditedChallenge({...editedChallenge, bloque: e.target.value as 'A' | 'B' | 'C'})}
                style={{ colorScheme: 'light', color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full text-sm p-2 bg-indigo-50 border border-indigo-200 font-bold rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none text-slate-900"
              >
                <option value="A">Bloque A</option>
                <option value="B">Bloque B</option>
                <option value="C">Bloque C</option>
              </select>
            </div>

            {/* Emoji */}
            <div className="space-y-2 w-24">
              <label className="text-xs font-bold text-slate-600 block">Icono / Emoji</label>
              <input 
                type="text"
                value={editedChallenge.emoji || '🔬'}
                onChange={e => setEditedChallenge({...editedChallenge, emoji: e.target.value})}
                placeholder="🔬"
                maxLength={4}
                style={{ colorScheme: 'light', color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-center outline-none text-slate-900 bg-white font-medium"
              />
            </div>
          </div>
        </section>

        {/* Infografía y PDF - Ahora con enlaces de Drive */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Documentación del Proyecto (Enlaces Drive)</h3>
          <div className="flex gap-4">
            {/* Infografía */}
            <div className="space-y-2 flex-1">
              <label className="text-xs font-bold text-slate-600">URL Infografía</label>
              <input 
                type="text"
                value={editedChallenge.infographicUrl || ''}
                onChange={e => setEditedChallenge({...editedChallenge, infographicUrl: e.target.value})}
                placeholder="https://drive.google.com/..."
                style={{ colorScheme: 'light', color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 bg-white font-medium"
              />
            </div>

            {/* PDF */}
            <div className="space-y-2 flex-1">
              <label className="text-xs font-bold text-slate-600">URL Ficha PDF</label>
              <input 
                type="text"
                value={editedChallenge.pdfUrl || ''}
                onChange={e => setEditedChallenge({...editedChallenge, pdfUrl: e.target.value})}
                placeholder="https://drive.google.com/..."
                style={{ colorScheme: 'light', color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 bg-white font-medium"
              />
            </div>
          </div>
        </section>

        {/* 1. Ficha del Proyecto */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">1. Ficha del Proyecto (Estructura de Reto)</h3>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Objetivo Sostenible</label>
            <textarea 
              value={editedChallenge.sustainableObjective || ''} 
              onChange={e => setEditedChallenge({...editedChallenge, sustainableObjective: e.target.value})}
              style={{ colorScheme: 'light', color: '#0f172a', backgroundColor: '#ffffff' }}
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] text-slate-900 bg-white font-medium outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reto Técnico (Variable)</label>
            <textarea 
              value={editedChallenge.investigationVariable || ''} 
              onChange={e => setEditedChallenge({...editedChallenge, investigationVariable: e.target.value})}
              style={{ colorScheme: 'light', color: '#0f172a', backgroundColor: '#ffffff' }}
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] text-slate-900 bg-white font-medium outline-none"
            />
          </div>
        </section>

        {/* 2. Fichas Técnicas de Insumos Base */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">2. Fichas Técnicas de Insumos Base</h3>
          
          {editedChallenge.insumosBase && editedChallenge.insumosBase.length > 0 ? (
            editedChallenge.insumosBase.map((insumo, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                <input 
                  type="text" 
                  value={insumo.titulo} 
                  onChange={(e) => {
                    const newInsumos = [...editedChallenge.insumosBase!];
                    newInsumos[idx].titulo = e.target.value;
                    setEditedChallenge({...editedChallenge, insumosBase: newInsumos});
                  }}
                  style={{ colorScheme: 'light', color: '#0f172a' }}
                  className="font-bold text-slate-800 bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none px-1 py-0.5 w-full"
                />
                
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Ingredientes</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {insumo.ingredientes.map((ing) => (
                      <li key={ing.id} className="text-sm text-slate-600">
                        <span className="font-semibold">{ing.cantidad}</span> {ing.nombre} {ing.notas && <span className="italic">({ing.notas})</span>}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Procedimiento</h4>
                  <ol className="list-decimal pl-5 space-y-1">
                    {insumo.pasos.map((paso) => (
                      <li key={paso.id} className="text-sm text-slate-600">
                        {paso.descripcion}
                      </li>
                    ))}
                  </ol>
                </div>
                
                {insumo.mantenimiento && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-1">Mantenimiento</h4>
                    <p className="text-sm text-slate-600">{insumo.mantenimiento}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 italic">No hay insumos base definidos.</p>
          )}
        </section>

        {/* 3. Ficha Técnica de la Elaboración Principal */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">3. Ficha Técnica de la Elaboración Principal</h3>
          
          {editedChallenge.elaboracionPrincipal ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
              <input 
                type="text" 
                value={editedChallenge.elaboracionPrincipal.titulo} 
                onChange={(e) => {
                  setEditedChallenge({
                    ...editedChallenge, 
                    elaboracionPrincipal: { ...editedChallenge.elaboracionPrincipal!, titulo: e.target.value }
                  });
                }}
                style={{ colorScheme: 'light', color: '#0f172a' }}
                className="font-bold text-slate-800 bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none px-1 py-0.5 w-full"
              />
              
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">Ingredientes / Materia Prima</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {editedChallenge.elaboracionPrincipal.ingredientes.map((ing) => (
                    <li key={ing.id} className="text-sm text-slate-600">
                      <span className="font-semibold">{ing.cantidad}</span> {ing.nombre}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">Procedimiento de Montaje</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  {editedChallenge.elaboracionPrincipal.pasos.map((paso) => (
                    <li key={paso.id} className="text-sm text-slate-600">
                      {paso.descripcion}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No hay elaboración principal definida.</p>
          )}
        </section>

        {/* 4. Cronograma y Monitorización */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">4. Cronograma y Monitorización</h3>
          
          {editedChallenge.cronograma && editedChallenge.cronograma.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="p-2 font-bold text-slate-700">Fase</th>
                    <th className="p-2 font-bold text-slate-700">Semana</th>
                    <th className="p-2 font-bold text-slate-700">Acción del Alumno</th>
                    <th className="p-2 font-bold text-slate-700">Punto Crítico de Control (PCC)</th>
                  </tr>
                </thead>
                <tbody>
                  {editedChallenge.cronograma.map((fase) => (
                    <tr key={fase.id} className="border-b border-slate-200">
                      <td className="p-2 font-semibold text-slate-800 align-top">{fase.fase}</td>
                      <td className="p-2 text-slate-600 align-top">{fase.semanas}</td>
                      <td className="p-2 text-slate-600 align-top">{fase.accionAlumno}</td>
                      <td className="p-2 text-slate-600 align-top">{fase.puntoCriticoControl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No hay cronograma definido.</p>
          )}
        </section>

      </div>
    </div>
  );
};
