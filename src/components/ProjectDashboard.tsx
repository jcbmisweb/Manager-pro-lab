import React, { useState } from 'react';
import { CHALLENGES, Challenge } from '../types';
import { Plus } from 'lucide-react';
import { ProjectView } from './ProjectView';

export const ProjectDashboard: React.FC = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const blocks: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
  const BLOCK_NAMES: Record<string, string> = {
    'A': 'Proyecto del Bloque A (Lácteos Veganos y Proteína Alternativa)',
    'B': 'Proyecto del Bloque B (Bebidas Probióticas y Zero Waste)',
    'C': 'Proyecto del Bloque C: Fermentaciones Vegetales y Condimentos Técnicos'
  };
  
  if (selectedChallenge) {
    return <ProjectView challenge={selectedChallenge} onClose={() => setSelectedChallenge(null)} />;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard de Proyectos</h1>
      {blocks.map(block => (
        <div key={block} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 bg-gray-100 p-2 rounded">{BLOCK_NAMES[block]}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHALLENGES
              .filter(c => c.bloque === block)
              .map(c => (
                  <div key={c.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-3xs flex flex-col justify-between">
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{c.emoji}</div>
                        <div>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded uppercase">
                            {c.code}
                          </span>
                          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide line-clamp-1 mt-0.5">
                            {c.name}
                          </h4>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedChallenge(c)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                      >
                        Ver Ficha Completa
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      ))}
    </div>
  );
};
