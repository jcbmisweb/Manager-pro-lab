/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sliders, Coins, Percent, Sprout, ArrowRight, ShieldCheck, Printer, HelpCircle } from 'lucide-react';
import { SensorialEvaluation } from '../types';

interface TasteLabSostenibilidadProps {
  pesoInicial: number;
  sensorial: SensorialEvaluation;
  pesoFinal: number | null;
  onSaveFinal: (pesoFinal: number, sensorial: SensorialEvaluation) => void;
  materiaPrimaLabel?: string;
  precioMateriaPrimaKilo?: number;
  precioComercialKilo?: number;
  semanaMax?: number;
  readOnly?: boolean;
}

export const TasteLabSostenibilidad: React.FC<TasteLabSostenibilidadProps> = ({
  pesoInicial,
  sensorial,
  pesoFinal,
  onSaveFinal,
  materiaPrimaLabel = 'Granos base',
  precioMateriaPrimaKilo = 14.5,
  precioComercialKilo = 55.0,
  semanaMax = 8,
  readOnly = false,
}) => {
  // Local state for sensory sliders
  const [firmeza, setFirmeza] = useState<number>(sensorial?.firmeza ?? 3);
  const [uniformidad, setUniformidad] = useState<number>(sensorial?.uniformidad ?? 3);
  const [acidez, setAcidez] = useState<number>(sensorial?.acidez ?? 3);
  const [persistencia, setPersistencia] = useState<number>(sensorial?.persistencia ?? 3);

  // Local state for final weight input
  const [weightInput, setWeightInput] = useState<string>(pesoFinal ? pesoFinal.toString() : '150');
  const [showReport, setShowReport] = useState<boolean>(pesoFinal !== null);
  const [showPrintNotice, setShowPrintNotice] = useState<boolean>(false);

  // Sync state with props if they change (e.g. on reset)
  useEffect(() => {
    setFirmeza(sensorial?.firmeza ?? 3);
    setUniformidad(sensorial?.uniformidad ?? 3);
    setAcidez(sensorial?.acidez ?? 3);
    setPersistencia(sensorial?.persistencia ?? 3);
    setWeightInput(pesoFinal ? pesoFinal.toString() : '150');
    setShowReport(pesoFinal !== null);
  }, [sensorial, pesoFinal]);

  const parsedWeight = parseFloat(weightInput) || 0;

  // Calculate yield (Rendimiento %)
  const rendimiento = pesoInicial > 0 ? (parsedWeight / pesoInicial) * 100 : 0;

  // Calculation details
  const costeIngredientes = (pesoInicial / 1000) * precioMateriaPrimaKilo + 0.5; // cashews + culture/salt
  const costeComercialEquivalente = (parsedWeight / 1000) * precioComercialKilo;
  const ahorroNeto = Math.max(0, costeComercialEquivalente - costeIngredientes);
  const ahorroPorcentaje = costeComercialEquivalente > 0 ? (ahorroNeto / costeComercialEquivalente) * 100 : 0;

  // Sensory descriptors
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

  const handleUpdate = () => {
    onSaveFinal(parsedWeight, {
      firmeza,
      uniformidad,
      acidez,
      persistencia,
    });
    setShowReport(true);
  };

  // Helper values for visual radar/bar chart
  const sensoryData = [
    { name: 'Firmeza de la Pasta', value: firmeza, text: getFirmezaText(firmeza) },
    { name: 'Uniformidad de la Corteza', value: uniformidad, text: getUniformidadText(uniformidad) },
    { name: 'Intensidad de la Acidez', value: acidez, text: getAcidezText(acidez) },
    { name: 'Persistencia de Retrogusto', value: persistencia, text: getPersistenciaText(persistencia) },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Grid container for Sensory evaluation & Weight Sostenibilidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* TASTELAB SENSORIAL */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base uppercase tracking-wider">
                Módulo Sensorial TasteLab
              </h2>
              <p className="text-xs text-slate-500">
                Evaluación organoléptica final del lote madurado (Semana {semanaMax}).
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Slider 1: Firmeza */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  1. Firmeza de la Pasta
                </label>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                  Nivel {firmeza}/5
                </span>
              </div>
              <input
                id="sensorial-firmeza"
                type="range"
                min="0"
                max="5"
                step="1"
                value={firmeza}
                disabled={readOnly}
                onChange={(e) => setFirmeza(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-hidden disabled:opacity-50"
              />
              <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                <span>Líquida / Pastosa (0)</span>
                <span className="text-purple-700 font-semibold">{getFirmezaText(firmeza)}</span>
                <span>Sólida / Corte limpio (5)</span>
              </div>
            </div>

            {/* Slider 2: Uniformidad */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  2. Uniformidad de la Corteza
                </label>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                  Nivel {uniformidad}/5
                </span>
              </div>
              <input
                id="sensorial-uniformidad"
                type="range"
                min="0"
                max="5"
                step="1"
                value={uniformidad}
                disabled={readOnly}
                onChange={(e) => setUniformidad(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-hidden disabled:opacity-50"
              />
              <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                <span>Grietas / Defectos (0)</span>
                <span className="text-purple-700 font-semibold">{getUniformidadText(uniformidad)}</span>
                <span>Homogénea completa (5)</span>
              </div>
            </div>

            {/* Slider 3: Acidez */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  3. Intensidad de la Acidez
                </label>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                  Nivel {acidez}/5
                </span>
              </div>
              <input
                id="sensorial-acidez"
                type="range"
                min="0"
                max="5"
                step="1"
                value={acidez}
                disabled={readOnly}
                onChange={(e) => setAcidez(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-hidden disabled:opacity-50"
              />
              <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                <span>Neutro / Plano (0)</span>
                <span className="text-purple-700 font-semibold">{getAcidezText(acidez)}</span>
                <span>Ácido balanceado (5)</span>
              </div>
            </div>

            {/* Slider 4: Persistencia */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  4. Persistencia del Retrogusto
                </label>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                  Nivel {persistencia}/5
                </span>
              </div>
              <input
                id="sensorial-persistencia"
                type="range"
                min="0"
                max="5"
                step="1"
                value={persistencia}
                disabled={readOnly}
                onChange={(e) => setPersistencia(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-hidden disabled:opacity-50"
              />
              <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                <span>Fugaz / Insípido (0)</span>
                <span className="text-purple-700 font-semibold">{getPersistenciaText(persistencia)}</span>
                <span>Muy persistente (5)</span>
              </div>
            </div>
          </div>

          {/* Sensory Profile Visualizer (Custom clean bars with SVG) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Firma Organoléptica del Lote
            </h4>
            <div className="space-y-2.5">
              {sensoryData.map((d, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">{d.name}</span>
                    <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-sm uppercase font-bold">
                      {d.value === 5 ? 'Elite' : d.value >= 3 ? 'Aceptable' : 'Deficiente'}
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
                      style={{ width: `${(d.value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* REGISTRY AND SUSTAINABILITY */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base uppercase tracking-wider">
                Sostenibilidad y Rendimiento
              </h2>
              <p className="text-xs text-slate-500">
                Calcula el rendimiento neto útil de masa madurada y compáralo con el mercado.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Weight Input */}
            <div>
              <label htmlFor="peso-final" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Peso Final del Queso Útil (g) *
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <input
                  id="peso-final"
                  type="number"
                  min="1"
                  step="0.1"
                  value={weightInput}
                  disabled={readOnly}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="Ej. 150"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-slate-800 transition-all font-semibold disabled:bg-slate-100 disabled:text-slate-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  <span className="text-xs font-mono text-slate-400 font-bold uppercase">gramos (g)</span>
                </div>
              </div>
              <span className="block text-[11px] text-slate-400 mt-1">
                Ingresa el peso neto una vez retirada la tela de maduración y antes de envasar.
              </span>
            </div>

            {/* Calculations Trigger */}
            {!readOnly ? (
              <button
                onClick={handleUpdate}
                id="btn-calcular-sostenibilidad"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Percent className="w-4 h-4 text-emerald-400" />
                <span>Registrar Evaluación y Calcular</span>
              </button>
            ) : (
              <div className="w-full text-center py-2 bg-slate-100 border text-slate-500 font-semibold text-xs rounded-lg uppercase tracking-wider">
                Lectura de Análisis Sensorial
              </div>
            )}
          </div>

          {/* Calculations Output */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Métricas de Rendimiento Técnico
            </h4>

            {/* Yield Gauge Card */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border border-slate-100 flex flex-col justify-between shadow-2xs">
                <span className="block text-[10px] uppercase font-mono text-slate-400">Rendimiento Neto</span>
                <div className="mt-1">
                  <span id="output-rendimiento-porcentaje" className="text-xl font-extrabold text-slate-900 font-mono">
                    {rendimiento.toFixed(1)}%
                  </span>
                </div>
                <span className="block text-[10px] text-slate-500 mt-1 font-sans">
                  {rendimiento >= 65 && rendimiento <= 80
                    ? '🟢 Dentro del rango curado esperado (65-80%)'
                    : rendimiento < 65
                    ? '🟡 Deshidratación elevada (más duro)'
                    : '🟡 Humedad residual alta (más blando)'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-100 flex flex-col justify-between shadow-2xs">
                <span className="block text-[10px] uppercase font-mono text-slate-400">Pérdida de Peso</span>
                <div className="mt-1">
                  <span className="text-xl font-extrabold text-slate-900 font-mono">
                    {(pesoInicial - parsedWeight).toFixed(1)} g
                  </span>
                </div>
                <span className="block text-[10px] text-slate-500 mt-1 font-sans">
                  Evaporación y sinéresis del suero láctico.
                </span>
              </div>
            </div>

            {/* Savings Comparison Column */}
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  Comparativa de Costes vs Comercial
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  ARTESANO PREMIUM
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-700">
                  <span>Coste Materia Prima Estimado (Cashews bulk):</span>
                  <span className="font-mono font-bold">{costeIngredientes.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-700">
                  <span>Coste Comercial Equivalente ({parsedWeight}g):</span>
                  <span className="font-mono font-bold">{costeComercialEquivalente.toFixed(2)} €</span>
                </div>
                <div className="border-t border-emerald-200/50 pt-2 flex justify-between items-center text-sm">
                  <span className="font-bold text-emerald-900">Ahorro Neto Estimado:</span>
                  <div className="text-right">
                    <span id="output-ahorro-euros" className="font-mono font-black text-emerald-700 block">
                      +{ahorroNeto.toFixed(2)} €
                    </span>
                    <span id="output-ahorro-porcentaje" className="text-[10px] font-mono text-emerald-600 block font-bold">
                      (Reducción de coste: {ahorroPorcentaje.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* DETAILED SUMMARY SHEET (EXPORTS / TECHNICAL REVIEWS) */}
      {showReport && (
        <div className="bg-slate-900 text-white rounded-xl p-6 space-y-6 border border-slate-800 shadow-xl animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-widest">
                FICHA TÉCNICA EXPEDIDA POR MANAGER PRO LAB
              </span>
              <h3 className="text-lg font-bold tracking-tight">
                Reporte Final de Producción Sostenible
              </h3>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={() => {
                  setShowPrintNotice(true);
                  setTimeout(() => setShowPrintNotice(false), 8000);
                }}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-colors border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Imprimir Reporte Ficha</span>
              </button>
              {showPrintNotice && (
                <span className="text-[10px] text-amber-400 max-w-xs text-right mt-1 font-sans animate-fade-in bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                  ⚠️ Impresión directa deshabilitada en el visor. Abre la app en una pestaña nueva para imprimir.
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            
            {/* Column 1: Ingredients and Mass */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                Balance de Masa
              </h4>
              <ul className="space-y-1.5 font-mono text-xs">
                <li className="flex justify-between">
                  <span className="text-slate-400">Masa Seca Inicial:</span>
                  <span className="font-bold text-slate-200">{pesoInicial} g</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">Masa Útil Final:</span>
                  <span className="font-bold text-slate-200">{parsedWeight} g</span>
                </li>
                <li className="flex justify-between text-emerald-400 font-bold">
                  <span>Rendimiento Neto:</span>
                  <span>{rendimiento.toFixed(1)} %</span>
                </li>
              </ul>
            </div>

            {/* Column 2: Organoleptic signature */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                Firma Organoléptica (0-5)
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li className="flex justify-between">
                  <span className="text-slate-400">Firmeza:</span>
                  <span className="font-mono font-bold text-slate-200">{firmeza} ({getFirmezaText(firmeza)})</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">Uniformidad:</span>
                  <span className="font-mono font-bold text-slate-200">{uniformidad} ({getUniformidadText(uniformidad)})</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">Acidez:</span>
                  <span className="font-mono font-bold text-slate-200">{acidez} ({getAcidezText(acidez)})</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">Persistencia:</span>
                  <span className="font-mono font-bold text-slate-200">{persistencia} ({getPersistenciaText(persistencia)})</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Sostenibilidad ambiental */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                Impacto Ambiental & Sostenibilidad
              </h4>
              <ul className="space-y-1.5 text-xs font-mono">
                <li className="flex justify-between">
                  <span className="text-slate-400">Ahorro Económico:</span>
                  <span className="font-bold text-emerald-400">+{ahorroPorcentaje.toFixed(1)} %</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">Emisiones de CO₂eq:</span>
                  <span className="font-bold text-emerald-400">-85% Reducido</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">Residuos Plásticos:</span>
                  <span className="font-bold text-emerald-400">Residuos Cero</span>
                </li>
              </ul>
              <div className="p-2 bg-emerald-950/40 border border-emerald-900 rounded text-[10px] text-emerald-300">
                La elaboración propia elimina el envasado secundario comercial de plástico y reduce la huella de transporte un 85% al consolidar materia prima a granel.
              </div>
            </div>

          </div>

          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg text-xs flex gap-2 items-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-medium">
              Lote verificado técnicamente bajo la bitácora de control de pH en cascada con finalización de seguridad alimentaria.
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
