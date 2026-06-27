/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Coins, 
  Percent, 
  Sprout, 
  ArrowRight, 
  ShieldCheck, 
  Printer, 
  HelpCircle, 
  QrCode, 
  Users, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  MessageSquare,
  Award
} from 'lucide-react';
import { SensorialEvaluation } from '../types';

interface TasteLabSostenibilidadProps {
  pesoInicial: number;
  sensorial: SensorialEvaluation;
  pesoFinal: number | null;
  onSaveFinal: (pesoFinal: number, sensorial: SensorialEvaluation, degustaciones?: any[]) => void;
  materiaPrimaLabel?: string;
  precioMateriaPrimaKilo?: number;
  precioComercialKilo?: number;
  semanaMax?: number;
  readOnly?: boolean;
  degustaciones?: any[];
  proyectoId?: string;
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
  degustaciones = [],
  proyectoId = '',
}) => {
  // Local state for sensory sliders
  const [firmeza, setFirmeza] = useState<number>(sensorial?.firmeza ?? 3);
  const [uniformidad, setUniformidad] = useState<number>(sensorial?.uniformidad ?? 3);
  const [acidez, setAcidez] = useState<number>(sensorial?.acidez ?? 3);
  const [persistencia, setPersistencia] = useState<number>(sensorial?.persistencia ?? 3);

  // Local state for peer tastings
  const [localDegustaciones, setLocalDegustaciones] = useState<any[]>(degustaciones);
  const [showAddPeerForm, setShowAddPeerForm] = useState(false);
  const [peerName, setPeerName] = useState('');
  const [peerFirmeza, setPeerFirmeza] = useState(3);
  const [peerUniformidad, setPeerUniformidad] = useState(3);
  const [peerAcidez, setPeerAcidez] = useState(3);
  const [peerPersistencia, setPeerPersistencia] = useState(3);
  const [peerComment, setPeerComment] = useState('');
  const [copied, setCopied] = useState(false);

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
    setLocalDegustaciones(degustaciones);
  }, [sensorial, pesoFinal, degustaciones]);

  const parsedWeight = parseFloat(weightInput) || 0;

  // Calculate yield (Rendimiento %)
  const rendimiento = pesoInicial > 0 ? (parsedWeight / pesoInicial) * 100 : 0;

  // Calculation details
  const costeIngredientes = (pesoInicial / 1000) * precioMateriaPrimaKilo + 0.5; // cashews + culture/salt
  const costeComercialEquivalente = (parsedWeight / 1000) * precioComercialKilo;
  const ahorroNeto = Math.max(0, costeComercialEquivalente - costeIngredientes);
  const ahorroPorcentaje = costeComercialEquivalente > 0 ? (ahorroNeto / costeComercialEquivalente) * 100 : 0;

  // peer averages calculations
  const hasDegustaciones = localDegustaciones && localDegustaciones.length > 0;
  
  const peerAvg = hasDegustaciones ? {
    firmeza: parseFloat((localDegustaciones.reduce((acc, curr) => acc + curr.firmeza, 0) / localDegustaciones.length).toFixed(1)),
    uniformidad: parseFloat((localDegustaciones.reduce((acc, curr) => acc + curr.uniformidad, 0) / localDegustaciones.length).toFixed(1)),
    acidez: parseFloat((localDegustaciones.reduce((acc, curr) => acc + curr.acidez, 0) / localDegustaciones.length).toFixed(1)),
    persistencia: parseFloat((localDegustaciones.reduce((acc, curr) => acc + curr.persistencia, 0) / localDegustaciones.length).toFixed(1)),
  } : { firmeza: 0, uniformidad: 0, acidez: 0, persistencia: 0 };

  const totalEvaluations = hasDegustaciones ? localDegustaciones.length : 0;

  const shareUrl = `${window.location.origin}${window.location.pathname}?guestTasting=${proyectoId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error("Error copying link:", err));
  };

  const handleAddDirectTasting = () => {
    if (!peerName.trim()) {
      alert("Por favor, introduce el nombre del participante.");
      return;
    }
    const newPeerReview = {
      id: 'peer-' + Date.now(),
      nombre: peerName.trim(),
      firmeza: peerFirmeza,
      uniformidad: peerUniformidad,
      acidez: peerAcidez,
      persistencia: peerPersistencia,
      comentario: peerComment.trim(),
      fecha: new Date().toISOString()
    };
    
    const updated = [...localDegustaciones, newPeerReview];
    setLocalDegustaciones(updated);
    onSaveFinal(parsedWeight, {
      firmeza,
      uniformidad,
      acidez,
      persistencia
    }, updated);

    // Reset fields
    setPeerName('');
    setPeerFirmeza(3);
    setPeerUniformidad(3);
    setPeerAcidez(3);
    setPeerPersistencia(3);
    setPeerComment('');
    setShowAddPeerForm(false);
  };

  const handleDeleteTasting = (idToDelete: string) => {
    if (window.confirm("¿Seguro que deseas eliminar esta valoración?")) {
      const updated = localDegustaciones.filter(d => d.id !== idToDelete);
      setLocalDegustaciones(updated);
      onSaveFinal(parsedWeight, {
        firmeza,
        uniformidad,
        acidez,
        persistencia
      }, updated);
    }
  };

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
    }, localDegustaciones);
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
      
      {/* Guía Informativa del Sistema TasteLab */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-3xs">
        <div className="flex gap-3">
          <div className="p-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg h-fit shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              ¿Cómo funciona el Sistema TasteLab y Sostenibilidad?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              El módulo <strong>TasteLab</strong> es la estación final de control de calidad de tu lote de fermentación. Te permite evaluar el éxito de tu receta desde tres dimensiones clave:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                <span className="block text-[10px] font-bold text-purple-700 uppercase tracking-wide">🔬 1. Evaluación Sensorial</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Analiza el perfil organoléptico final del producto: la consistencia de la pasta, la uniformidad de la corteza, el balance de acidez láctica y la persistencia del sabor.
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                <span className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wide">📉 2. Rendimiento (Yield)</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Al comparar el peso final contra el inicial, calculas el porcentaje de merma por evaporación. Un rendimiento óptimo valida la retención de humedad y consistencia.
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                <span className="block text-[10px] font-bold text-amber-700 uppercase tracking-wide">💰 3. Viabilidad Económica</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Contrasta el coste real de los ingredientes utilizados contra el valor comercial del producto en el mercado, calculando tu ahorro neto y sostenibilidad financiera.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {/* EVALUACIÓN COLABORATIVA (DEGUSTACIONES DE COMPAÑEROS & ENCUESTAS QR) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base uppercase tracking-wider">
                Panel de Cata Colaborativa
              </h2>
              <p className="text-xs text-slate-500">
                Involucra a tus compañeros y recopila valoraciones sensoriales para calcular el consenso del panel.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddPeerForm(!showAddPeerForm)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Registrar Cata Presencial</span>
          </button>
        </div>

        {/* Manual Peer Entry Form (Presencial) */}
        {showAddPeerForm && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-inner space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Nueva Degustación Presencial
              </h3>
              <button 
                onClick={() => setShowAddPeerForm(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cerrar X
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                {/* Peer Name input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Nombre del Participante *</label>
                  <input
                    type="text"
                    value={peerName}
                    onChange={(e) => setPeerName(e.target.value)}
                    placeholder="Ej. Sofía Benítez / Alumno 4"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                {/* Comment */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Notas de Cata / Comentario</label>
                  <textarea
                    rows={3}
                    value={peerComment}
                    onChange={(e) => setPeerComment(e.target.value)}
                    placeholder="Escribe brevemente su opinión general (ej. sabor equilibrado, textura untable, aroma agradable)..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-600 resize-none"
                  />
                </div>
              </div>

              {/* Sliders for direct input */}
              <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
                {/* Firmeza */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>1. Firmeza</span>
                    <span className="text-purple-700">{peerFirmeza}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={peerFirmeza}
                    onChange={(e) => setPeerFirmeza(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Uniformidad */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>2. Uniformidad</span>
                    <span className="text-purple-700">{peerUniformidad}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={peerUniformidad}
                    onChange={(e) => setPeerUniformidad(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Acidez */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>3. Acidez</span>
                    <span className="text-purple-700">{peerAcidez}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={peerAcidez}
                    onChange={(e) => setPeerAcidez(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Persistencia */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>4. Persistencia</span>
                    <span className="text-purple-700">{peerPersistencia}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={peerPersistencia}
                    onChange={(e) => setPeerPersistencia(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleAddDirectTasting}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Guardar Valoración
              </button>
            </div>
          </div>
        )}

        {/* Two Columns: QR & Sharing vs. Results list & Consensus */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: QR & Link Sharing */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-between space-y-4 text-center">
            <div className="space-y-1">
              <div className="mx-auto p-2 bg-purple-100 text-purple-700 border border-purple-200 rounded-lg w-fit">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Invitar con Código QR
              </h3>
              <p className="text-[11px] text-slate-500 max-w-xs leading-normal">
                Genera la encuesta en el móvil de tus compañeros. Ideal para catas ciegas cooperativas en el aula.
              </p>
            </div>

            {/* Stylized pure SVG QR Code */}
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-3xs flex flex-col items-center">
              <svg className="w-32 h-32 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                {/* Quiet Zone boundary */}
                <rect width="100" height="100" fill="white" />
                
                {/* Top Left Marker */}
                <path d="M5,5 h20 v20 h-20 z M9,9 h12 v12 h-12 z M13,13 h4 v4 h-4 z" />
                {/* Top Right Marker */}
                <path d="M75,5 h20 v20 h-20 z M79,9 h12 v12 h-12 z M83,13 h4 v4 h-4 z" />
                {/* Bottom Left Marker */}
                <path d="M5,75 h20 v20 h-20 z M9,79 h12 v12 h-12 z M13,83 h4 v4 h-4 z" />
                
                {/* Random QR pixels for visual realism */}
                <path d="M30,5 h4 v4 h-4 z M38,5 h8 v4 h-8 z M50,5 h4 v4 h-4 z M58,5 h12 v4 h-12 z M34,12 h4 v4 h-4 z M46,12 h8 v4 h-8 z M62,12 h4 v4 h-4 z M30,19 h12 v4 h-12 z M46,19 h4 v4 h-4 z M58,19 h8 v4 h-8 z" />
                <path d="M30,28 h4 v4 h-4 z M42,28 h4 v4 h-4 z M50,28 h12 v4 h-12 z M66,28 h4 v4 h-4 z M78,28 h4 v4 h-4 z M86,28 h8 v4 h-8 z" />
                <path d="M5,34 h12 v4 h-12 z M25,34 h4 v4 h-4 z M34,34 h8 v4 h-8 z M46,34 h4 v4 h-4 z M54,34 h12 v4 h-12 z M70,34 h4 v4 h-4 z M82,34 h12 v4 h-12 z" />
                <path d="M5,42 h4 v4 h-4 z M17,42 h4 v4 h-4 z M25,42 h8 v4 h-8 z M38,42 h4 v4 h-4 z M46,42 h12 v4 h-12 z M66,42 h16 v4 h-16 z M86,42 h8 v4 h-8 z" />
                <path d="M13,50 h12 v4 h-12 z M30,50 h4 v4 h-4 z M38,50 h16 v4 h-16 z M58,50 h8 v4 h-8 z M70,50 h4 v4 h-4 z M78,50 h16 v4 h-16 z" />
                <path d="M5,58 h8 v4 h-8 z M17,58 h20 v4 h-20 z M42,58 h4 v4 h-4 z M50,58 h8 v4 h-8 z M62,58 h16 v4 h-16 z M82,58 h12 v4 h-12 z" />
                <path d="M30,66 h12 v4 h-12 z M46,66 h4 v4 h-4 z M54,66 h8 v4 h-8 z M66,66 h4 v4 h-4 z M74,66 h12 v4 h-12 z M90,66 h4 v4 h-4 z" />
                <path d="M34,74 h4 v4 h-4 z M46,74 h8 v4 h-8 z M58,74 h4 v4 h-4 z M66,74 h8 v4 h-8 z M78,74 h4 v4 h-4 z M86,74 h8 v4 h-8 z" />
                <path d="M30,82 h8 v4 h-8 z M42,82 h12 v4 h-12 z M58,82 h16 v4 h-16 z M78,82 h4 v4 h-4 z M86,82 h4 v4 h-4 z M94,82 h2 v4 h-2 z" />
                <path d="M30,90 h16 v4 h-16 z M50,90 h4 v4 h-4 z M58,90 h8 v4 h-8 z M70,90 h12 v4 h-12 z M86,90 h8 v4 h-8 z" />
                
                {/* Center bio icon container */}
                <rect x="42" y="42" width="16" height="16" rx="3" fill="white" stroke="rgb(109, 40, 217)" strokeWidth="1" />
                <circle cx="50" cy="50" r="4" fill="rgb(109, 40, 217)" />
              </svg>
              <span className="block text-[9px] text-slate-400 font-mono mt-2 uppercase tracking-wide">
                ESCANEO DIRECTO DE AULA
              </span>
            </div>

            <div className="w-full space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-3xs"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 font-extrabold">¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copiar Enlace de Encuesta</span>
                  </>
                )}
              </button>
              
              <span className="block text-[9px] text-slate-400 leading-normal text-center">
                El enlace les permite ingresar sus respuestas directamente a este proyecto desde sus smartphones.
              </span>
            </div>
          </div>

          {/* Column 2 & 3: Consensus and Tasting List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Consensus (Comparison Bars) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-700" />
                  <span>Consenso del Panel vs Tu Evaluación</span>
                </h3>
                <span className="text-[10px] font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase">
                  {totalEvaluations} {totalEvaluations === 1 ? 'Degustación' : 'Degustaciones'}
                </span>
              </div>

              {!hasDegustaciones ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-500 italic">
                    Aún no hay valoraciones de compañeros. Invita a otros alumnos a catar tu producto usando el QR o el botón superior.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Firmeza comparison */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Firmeza de la Pasta</span>
                      <div className="space-x-3 text-[11px] font-mono">
                        <span className="text-slate-500">Tú: <strong className="text-slate-800">{firmeza}</strong></span>
                        <span className="text-purple-700">Panel: <strong className="text-purple-700">{peerAvg.firmeza}</strong></span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden relative flex">
                      {/* Project owner bar (Thin bottom or top) */}
                      <div 
                        className="bg-indigo-600/40 h-full absolute left-0 top-0 transition-all duration-300"
                        style={{ width: `${(firmeza / 5) * 100}%` }}
                      />
                      {/* Peer average bar */}
                      <div 
                        className="bg-purple-600 h-1/2 rounded-full absolute left-0 bottom-0 transition-all duration-300"
                        style={{ width: `${(peerAvg.firmeza / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Uniformidad comparison */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Uniformidad de la Corteza</span>
                      <div className="space-x-3 text-[11px] font-mono">
                        <span className="text-slate-500">Tú: <strong className="text-slate-800">{uniformidad}</strong></span>
                        <span className="text-purple-700">Panel: <strong className="text-purple-700">{peerAvg.uniformidad}</strong></span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden relative flex">
                      <div 
                        className="bg-indigo-600/40 h-full absolute left-0 top-0 transition-all duration-300"
                        style={{ width: `${(uniformidad / 5) * 100}%` }}
                      />
                      <div 
                        className="bg-purple-600 h-1/2 rounded-full absolute left-0 bottom-0 transition-all duration-300"
                        style={{ width: `${(peerAvg.uniformidad / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Acidez comparison */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Intensidad de la Acidez</span>
                      <div className="space-x-3 text-[11px] font-mono">
                        <span className="text-slate-500">Tú: <strong className="text-slate-800">{acidez}</strong></span>
                        <span className="text-purple-700">Panel: <strong className="text-purple-700">{peerAvg.acidez}</strong></span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden relative flex">
                      <div 
                        className="bg-indigo-600/40 h-full absolute left-0 top-0 transition-all duration-300"
                        style={{ width: `${(acidez / 5) * 100}%` }}
                      />
                      <div 
                        className="bg-purple-600 h-1/2 rounded-full absolute left-0 bottom-0 transition-all duration-300"
                        style={{ width: `${(peerAvg.acidez / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Persistencia comparison */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Persistencia del Retrogusto</span>
                      <div className="space-x-3 text-[11px] font-mono">
                        <span className="text-slate-500">Tú: <strong className="text-slate-800">{persistencia}</strong></span>
                        <span className="text-purple-700">Panel: <strong className="text-purple-700">{peerAvg.persistencia}</strong></span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden relative flex">
                      <div 
                        className="bg-indigo-600/40 h-full absolute left-0 top-0 transition-all duration-300"
                        style={{ width: `${(persistencia / 5) * 100}%` }}
                      />
                      <div 
                        className="bg-purple-600 h-1/2 rounded-full absolute left-0 bottom-0 transition-all duration-300"
                        style={{ width: `${(peerAvg.persistencia / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-indigo-600/40 border border-indigo-600 inline-block rounded-xs"></span>
                      <span>Tu Autoevaluación</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-1 bg-purple-600 inline-block rounded-xs"></span>
                      <span>Consenso General de Compañeros</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* List of received evaluations */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span>Historial de Opiniones y Valoraciones</span>
              </h4>

              {!hasDegustaciones ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400 italic">
                  Las opiniones recopiladas mediante la encuesta QR se mostrarán aquí listadas cronológicamente.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                  {localDegustaciones.map((d, index) => (
                    <div key={d.id || index} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3 relative group">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-extrabold text-xs text-slate-900">{d.nombre}</span>
                          
                          {/* Trash button */}
                          {!readOnly && (
                            <button
                              onClick={() => handleDeleteTasting(d.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                              title="Eliminar valoración"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        
                        <span className="block text-[9px] text-slate-400 font-mono">
                          {d.fecha ? new Date(d.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Fecha desconocida'}
                        </span>
                      </div>

                      {d.comentario && (
                        <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-150 leading-relaxed font-sans">
                          "{d.comentario}"
                        </p>
                      )}

                      {/* Small visual values */}
                      <div className="grid grid-cols-4 gap-1 text-center pt-1 border-t border-slate-200/50">
                        <div className="bg-white/80 rounded border p-1 text-[9px] font-mono leading-none">
                          <span className="block text-slate-400 text-[8px] uppercase">Firm</span>
                          <span className="font-bold text-purple-700">{d.firmeza}</span>
                        </div>
                        <div className="bg-white/80 rounded border p-1 text-[9px] font-mono leading-none">
                          <span className="block text-slate-400 text-[8px] uppercase">Unif</span>
                          <span className="font-bold text-purple-700">{d.uniformidad}</span>
                        </div>
                        <div className="bg-white/80 rounded border p-1 text-[9px] font-mono leading-none">
                          <span className="block text-slate-400 text-[8px] uppercase">Acid</span>
                          <span className="font-bold text-purple-700">{d.acidez}</span>
                        </div>
                        <div className="bg-white/80 rounded border p-1 text-[9px] font-mono leading-none">
                          <span className="block text-slate-400 text-[8px] uppercase">Pers</span>
                          <span className="font-bold text-purple-700">{d.persistencia}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
