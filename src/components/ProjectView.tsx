import React, { useState, useEffect } from 'react';
import { Challenge, Project } from '../types';
import { Bitacora } from './Bitacora';
import { collection, addDoc, query, where, getDocs, limit, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface ProjectViewProps {
  challenge: Challenge;
  onClose: () => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ challenge, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ficha' | 'bitacora'>('ficha');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!challenge?.id) {
      setLoading(false);
      return;
    }
    const fetchProject = async () => {
      try {
        const q = query(collection(db, 'projects'), where('challengeId', '==', challenge.id), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setActiveProject({ id: doc.id, ...doc.data() } as Project);
        }
      } catch (err) {
        console.error("Error fetching project:", err);
      }
      setLoading(false);
    };
    fetchProject();
  }, [challenge?.id]);

  const handleStartProject = async () => {
    if (!challenge) return;
    setIsCreating(true);
    const newProject: Omit<Project, 'id'> = {
      challengeId: challenge.id,
      block: challenge.bloque,
      title: `Lote: ${challenge.name}`,
      objectives: [challenge.scientificObjective, challenge.sustainableObjective],
      technicalData: { "Variable": challenge.investigationVariable },
      infographicUrl: '',
      status: 'en curso'
    };
    
    try {
      const docRef = await addDoc(collection(db, 'projects'), newProject);
      setActiveProject({ ...newProject, id: docRef.id });
      setActiveTab('bitacora');
    } catch (err) {
      console.error("Error creating project:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!activeProject) return;
    const newStatus = activeProject.status === 'en curso' ? 'completado' : 'en curso';
    try {
      await updateDoc(doc(db, 'projects', activeProject.id), { status: newStatus });
      setActiveProject({ ...activeProject, status: newStatus });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="p-6">
        <button onClick={onClose} className="mb-4 text-sm text-slate-500 hover:text-slate-800">
          ← Volver al Dashboard
        </button>
        <h1 className="text-3xl font-bold mb-4">{challenge.name}</h1>
        
        <div className="flex gap-4 border-b mb-6">
          <button 
            onClick={() => setActiveTab('ficha')}
            className={`pb-2 text-sm font-semibold ${activeTab === 'ficha' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500'}`}
          >
            Ficha Técnica
          </button>
          <button 
            onClick={() => setActiveTab('bitacora')}
            disabled={!activeProject}
            className={`pb-2 text-sm font-semibold ${activeTab === 'bitacora' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500'} ${!activeProject ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Cuaderno de Bitácora
          </button>
        </div>

        {activeTab === 'ficha' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-sm text-slate-700 uppercase mb-2">Descripción</h3>
              <p className="text-sm text-slate-600 mb-4">{challenge.description}</p>
              
              <h3 className="font-bold text-sm text-slate-700 uppercase mb-2">Objetivos</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600 mb-4">
                <li>Científico: {challenge.scientificObjective}</li>
                <li>Sostenible: {challenge.sustainableObjective}</li>
              </ul>
              <h3 className="font-bold text-sm text-slate-700 uppercase mb-2">Variables</h3>
              <p className="text-sm text-slate-600">Variable de investigación: {challenge.investigationVariable}</p>
              
              {activeProject && (
                <div className="mt-4 p-3 bg-slate-100 rounded border">
                  <p className="text-sm font-semibold text-slate-800">Estado: {activeProject.status}</p>
                  <button onClick={handleToggleStatus} className="mt-2 text-xs text-emerald-600 font-bold uppercase underline">
                    {activeProject.status === 'en curso' ? 'Marcar como Completado' : 'Reabrir Proyecto'}
                  </button>
                </div>
              )}
              
              {!activeProject && !loading && (
                <button 
                  onClick={handleStartProject}
                  disabled={isCreating}
                  className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded font-semibold"
                >
                  {isCreating ? 'Iniciando...' : 'Iniciar Reto'}
                </button>
              )}
              {loading && <p className="text-sm text-slate-500 mt-4">Cargando estado del reto...</p>}
            </div>
            <div>
              <div className="bg-slate-100 p-8 rounded-lg text-center text-slate-500">
                  Visualizador de infografía (Pendiente de implementación real)
              </div>
            </div>
          </div>
        ) : activeProject ? (
          <Bitacora projectId={activeProject.id} />
        ) : (
          <div className="text-slate-600">
            <p>Debes iniciar el reto para acceder al cuaderno de bitácora.</p>
          </div>
        )}
      </div>
    </div>
  );
};
