import React from 'react';

export const PhProtocol: React.FC = () => {
  return (
    <section className="space-y-4 mt-8 bg-white border border-red-200 rounded-xl overflow-hidden shadow-xs">
      <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">🚨</span>
        <h2 className="text-lg font-black text-red-900 uppercase tracking-tight">Seguridad Alimentaria: Protocolo de Medición de pH</h2>
      </div>
      
      <div className="p-6 space-y-6">
        <p className="text-sm text-slate-700 leading-relaxed">
          Para garantizar la seguridad alimentaria (sistema APPCC) y certificar que la fermentación biológica es correcta, <strong>es obligatorio registrar el pH de tu elaboración una vez a la semana en el Cuaderno de Bitacora</strong>. La acidificación es nuestra principal barrera contra microorganismos patógenos (como el <em>Clostridium botulinum</em>).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opcion A */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <span className="w-4 h-4 rounded-sm bg-amber-500 inline-block"></span>
              OPCIÓN A: Tiras Reactivas (Precisión)
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-amber-900/80">
              <li><strong>Adquisición:</strong> Caja de tiras de pH (1-14).</li>
              <li>
                <strong>Procedimiento:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Manos limpias, extrae una tira por el extremo seco.</li>
                  <li>Sumerge la zona reactiva durante <strong>1 segundo</strong> en el líquido (o apoya en la superficie).</li>
                  <li>Retira, sacude el exceso y espera <strong>15 segundos</strong>.</li>
                </ul>
              </li>
              <li><strong>Lectura:</strong> Compara con la escala cromática y anota el número exacto.</li>
            </ol>
          </div>

          {/* Opcion B */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
            <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-500 inline-block"></span>
              OPCIÓN B: Indicador Lombarda (Zero Waste)
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-purple-900/80">
              <li>
                <strong>Reactivo:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Trocea 100g de col lombarda y hierve 5 min.</li>
                  <li>Filtra, enfría y conserva (hasta 2 semanas).</li>
                </ul>
              </li>
              <li>
                <strong>Procedimiento:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>En un vaso, pon una cucharadita del fermento.</li>
                  <li>Añade 3 o 4 gotas del agua de lombarda y remueve.</li>
                </ul>
              </li>
              <li>
                <strong>Interpretación:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>🔴 Rosa/Rojo: pH Ácido (Éxito)</li>
                  <li>🟣 Morado/Azul: pH Neutro (Riesgo)</li>
                  <li>🟢 Verde/Amarillo: pH Básico (Peligro)</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>

        <div className="bg-red-100/50 border border-red-200 rounded-lg p-4 text-center">
          <h4 className="font-bold text-red-900 uppercase text-sm mb-1">El Límite de Seguridad: pH 4.6</h4>
          <p className="text-sm text-red-800">
            A partir de la Semana 2 o 3, todas vuestras elaboraciones deben estabilizarse <strong>por debajo de pH 4.5</strong>. 
            Cualquier dato superior a 4.6 transcurridos los primeros 10 días debe ser notificado inmediatamente.
          </p>
        </div>
      </div>
    </section>
  );
};
