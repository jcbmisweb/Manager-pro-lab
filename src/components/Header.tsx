import React from 'react';
import { Beaker, BookOpen, Image, LogOut, FolderKanban, Sparkles, User } from 'lucide-react';
import { Challenge, UserSession } from '../types';

interface HeaderProps {
  onOpenDoc: (docType: 'pdf' | 'infografia') => void;
  user: UserSession | null;
  activeChallenge: Challenge | null;
  onLogout: () => void;
  onGoHome: () => void;
  onGoCatalog: () => void;
  currentTab: 'projects' | 'catalog' | 'lab';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDoc,
  user,
  activeChallenge,
  onLogout,
  onGoHome,
  onGoCatalog,
  currentTab,
}) => {
  if (!user) {
    // Elegant, minimal header for anonymous landing state
    return (
      <header className="bg-slate-950 border-b border-slate-900 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-amber-500 to-orange-600 text-white p-2 rounded-lg flex items-center justify-center">
              <Beaker className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold tracking-widest text-white uppercase font-mono">
              Manager pro LAB
            </span>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
            Suite Digital v2.0
          </span>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Bar with Brand & User Session info */}
      <div className="border-b border-slate-100 bg-slate-50 py-2 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-mono text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
              SISTEMA HOMOLOGADO
            </span>
            <span>Estándares de Calidad y HACCP en Bioprocesos</span>
          </div>
          <div className="flex items-center gap-3 font-medium text-slate-600">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-3xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="line-clamp-1">{user.name}</span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">({user.email})</span>
            </div>
            <button
              onClick={onLogout}
              className="hover:text-red-600 text-slate-400 transition-colors flex items-center gap-1 cursor-pointer py-1 px-2 hover:bg-red-50 rounded"
              title="Cerrar Sesión"
              id="btn-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand Identity & Dynamic Title */}
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl flex items-center justify-center shadow-inner text-white bg-gradient-to-tr ${activeChallenge ? activeChallenge.gradient : 'from-slate-800 to-slate-950'}`}>
              <Beaker className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase font-mono">
                  Manager pro LAB
                </span>
                {activeChallenge && (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border bg-white shadow-3xs text-slate-800 border-slate-200`}>
                    {activeChallenge.code}
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                {activeChallenge ? activeChallenge.name : 'Mesa de Trabajo e Investigación'}
              </h1>
              <p className="text-xs text-slate-500 font-sans">
                {activeChallenge ? activeChallenge.scientificObjective : 'Exploración de Bioprocesos Alimentarios y Materiales Biobasados Sostenibles'}
              </p>
            </div>
          </div>

          {/* Tab Navigation & Help files triggers */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider gap-0.5 mr-2">
              <button
                onClick={onGoHome}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${currentTab === 'projects' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                id="btn-nav-projects"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Mis Proyectos</span>
              </button>
              <button
                onClick={onGoCatalog}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${currentTab === 'catalog' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                id="btn-nav-catalog"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Catálogo Retos</span>
              </button>
            </div>

            {activeChallenge && (
              <div className="flex items-center gap-2">
                <button
                  id="btn-doc-pdf"
                  onClick={() => onOpenDoc('pdf')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Descargar Guía Técnica PDF"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Guía PDF</span>
                </button>

                <button
                  id="btn-doc-info"
                  onClick={() => onOpenDoc('infografia')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Ver Infografía del Reto"
                >
                  <Image className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Infografía</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
