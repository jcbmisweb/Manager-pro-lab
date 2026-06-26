/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Scale, Beaker, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

interface ConfiguracionInicialProps {
  pesoInicial: number;
  tipoInoculante: string;
  started: boolean;
  fechaInicio: string | null;
  onStart: (peso: number, inoculante: string) => void;
  onReset: () => void;
  materiaPrimaLabel?: string;
  inoculantOptions?: string[];
}

export const ConfiguracionInicial: React.FC<ConfiguracionInicialProps> = ({
  pesoInicial,
  tipoInoculante,
  started,
  fechaInicio,
  onStart,
  onReset,
  materiaPrimaLabel = 'Materia prima',
  inoculantOptions = ['Re-siembra de lote anterior', 'Cápsula comercial de probióticos'],
}) => {
  const [peso, setPeso] = useState<number>(pesoInicial);
  const [inoculante, setInoculante] = useState<string>(tipoInoculante);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Sync state with props if they change (e.g. on reset)
  useEffect(() => {
    setPeso(pesoInicial);
    setInoculante(tipoInoculante || inoculantOptions[0] || '');
    setErrorMsg('');
  }, [pesoInicial, tipoInoculante, started, inoculantOptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (peso <= 0) {
      setErrorMsg(`El peso de ${materiaPrimaLabel.toLowerCase()} debe ser un número positivo mayor que 0.`);
      return;
    }
    if (peso < 50) {
      setErrorMsg('Recomendamos al menos 50g para garantizar una fermentación controlada.');
      return;
    }
    setErrorMsg('');
    onStart(peso, inoculante);
  };

  if (started) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
              Línea Base Activa
            </h3>
          </div>
          <button
            onClick={onReset}
            className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium cursor-pointer"
          >
            Reiniciar Experimento
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="block text-[10px] uppercase font-mono text-slate-400">Peso Inicial</span>
            <span className="text-lg font-bold text-slate-800 font-mono">{pesoInicial} g</span>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="block text-[10px] uppercase font-mono text-slate-400">Agente Inoculante</span>
            <span className="text-xs font-semibold text-slate-700 line-clamp-1">{tipoInoculante}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="block text-[10px] uppercase font-mono text-slate-400">Fecha de Registro</span>
            <span className="text-xs font-semibold text-slate-700 block mt-0.5">
              {(() => {
                if (!fechaInicio) return 'No registrada';
                const date = new Date(fechaInicio);
                if (isNaN(date.getTime())) return 'No registrada';
                try {
                  return date.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                } catch (e) {
                  return 'No registrada';
                }
              })()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden animate-fade-in my-8">
      {/* Visual Accent */}
      <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />

      <div className="p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 mb-3">
            <Scale className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Inicialización Técnica de Lote
          </h2>
          <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
            Configura los parámetros del protocolo de fermentación para registrar tu lote piloto de {materiaPrimaLabel.toLowerCase()}.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 flex gap-2 text-xs items-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" id="form-inicial">
          {/* Input Peso Seco */}
          <div>
            <label htmlFor="peso-anacardos" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Peso inicial de {materiaPrimaLabel.toLowerCase()} (g) *
            </label>
            <div className="relative rounded-lg shadow-xs">
              <input
                id="peso-anacardos"
                type="number"
                min="1"
                step="1"
                required
                value={peso}
                onChange={(e) => setPeso(parseInt(e.target.value) || 0)}
                placeholder="Ej. 200"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-slate-800 transition-all font-semibold"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <span className="text-xs font-mono text-slate-400 font-bold uppercase">gramos (g)</span>
              </div>
            </div>
            <span className="block text-[11px] text-slate-400 mt-1">
              Sugerido: {pesoInicial}g. Es la masa de referencia para calcular el rendimiento del cultivo final.
            </span>
          </div>

          {/* Select Inoculante */}
          <div>
            <label htmlFor="agente-inoculante" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tipo de Agente Inoculante *
            </label>
            <div className="relative rounded-lg shadow-xs">
              <select
                id="agente-inoculante"
                required
                value={inoculante}
                onChange={(e) => setInoculante(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800 transition-all font-medium appearance-none cursor-pointer"
              >
                {inoculantOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
            <span className="block text-[11px] text-slate-400 mt-1">
              Determina la velocidad de acidificación inicial y la diversidad del fermento.
            </span>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            id="btn-iniciar-seguimiento"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <Beaker className="w-4 h-4 text-emerald-400" />
            <span>Iniciar Seguimiento Técnico</span>
          </button>
        </form>
      </div>
    </div>
  );
};
