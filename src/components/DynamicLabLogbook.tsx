import React, { useState, useEffect } from 'react';

export function DynamicLabLogbook({ idReto }: { idReto: string }) {
  const [reto, setReto] = useState<any>(null);
  const [valor, setValor] = useState<number>(0);

  useEffect(() => {
    const catalogo = JSON.parse(localStorage.getItem('mpl_catalogo_retos_dinamicos') || '{}');
    const retoActual = catalogo[idReto];
    setReto(retoActual);
    if (retoActual) {
      setValor(retoActual.puntos_criticos.min_seguro);
    }
  }, [idReto]);

  if (!reto) return <div className="text-white">Cargando proyecto dinámico...</div>;

  const evaluarSemaforo = (v: number) => {
    const min = reto.puntos_criticos.min_seguro;
    const max = reto.puntos_criticos.max_seguro;
    
    if (v >= min && v <= max) return { clase: "v", text: `🟢 SEGURO: ${reto.semaforo_valores.verde}` };
    if (v > max && v <= (max + 3)) return { clase: "a", text: `🟡 ALERTA: ${reto.semaforo_valores.amarillo}` };
    return { clase: "r", text: `🔴 PELIGRO: ${reto.semaforo_valores.rojo}` };
  };

  const semaforo = evaluarSemaforo(valor);

  return (
    <div className="container mx-auto p-4 max-w-2xl text-white">
      <div className="project-header border-b border-slate-700 pb-4 mb-6 flex items-center gap-4">
        <div className="text-5xl">{reto.emoji}</div>
        <div>
          <h1 className="text-2xl font-bold">{reto.titulo}</h1>
          <p className="text-slate-400">{reto.descripcion}</p>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
        <h3 className="text-lg font-semibold mb-4">Módulo de Control de Puntos Críticos (PCC)</h3>
        <div className="mb-4">
          <label className="text-slate-400">{reto.puntos_criticos.parametro_evaluacion}</label>
          <input 
            type="range" 
            min={reto.puntos_criticos.min_seguro - 5} 
            max={reto.puntos_criticos.max_seguro + 5}
            step="0.1"
            value={valor}
            onChange={(e) => setValor(parseFloat(e.target.value))}
            className="w-full my-4"
          />
          <div className="text-2xl font-bold text-emerald-400 text-center">{valor.toFixed(1)}</div>
        </div>
      </div>

      <div className={`p-6 rounded-xl text-center font-semibold border ${
        semaforo.clase === 'v' ? 'bg-emerald-900/20 border-emerald-500 text-emerald-400' :
        semaforo.clase === 'a' ? 'bg-amber-900/20 border-amber-500 text-amber-400' :
        'bg-red-900/20 border-red-500 text-red-400'
      }`}>
        {semaforo.text}
      </div>
    </div>
  );
}
