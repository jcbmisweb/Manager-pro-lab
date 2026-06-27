import React, { useState, useEffect } from 'react';
import { RetoCreator } from './RetoCreator';

interface Usuario {
  uid: string;
  nombre: string;
  correo: string;
  rol: 'admin' | 'profesor' | 'alumno';
  claseAsignada: string;
}

export function AdminPanel() {
  const [clases, setClases] = useState<string[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nuevaClase, setNuevaClase] = useState('');

  const [editing, setEditing] = useState<Record<string, { rol: 'admin' | 'profesor' | 'alumno', clase: string }>>({});

  useEffect(() => {
    const savedClases = localStorage.getItem('mpl_clases');
    const savedUsuarios = localStorage.getItem('mpl_usuarios_global');
    
    setClases(savedClases ? JSON.parse(savedClases) : ["2HCA", "2HCB"]);
    const initialUsuarios = savedUsuarios ? JSON.parse(savedUsuarios) : [
      { uid: "u1", nombre: "Tú (Director)", correo: "director@lab.com", rol: "admin", claseAsignada: "" },
      { uid: "u2", nombre: "Prof. Carlos Silva", correo: "carlos.silva@lab.com", rol: "alumno", claseAsignada: "" },
      { uid: "u3", nombre: "Ana Gómez Ortiz", correo: "ana@alumno.com", rol: "alumno", claseAsignada: "2HCA" },
      { uid: "u4", nombre: "Lucas Mendoza", correo: "lucas@alumno.com", rol: "alumno", claseAsignada: "" },
      { uid: "u5", nombre: "Juan Codina", correo: "juan.codina@murciaeduca.es", rol: "admin", claseAsignada: "" }
    ];
    setUsuarios(initialUsuarios);
  }, []);

  const guardarDatos = (nuevasClases: string[], nuevosUsuarios: Usuario[]) => {
    localStorage.setItem('mpl_clases', JSON.stringify(nuevasClases));
    localStorage.setItem('mpl_usuarios_global', JSON.stringify(nuevosUsuarios));
    setClases(nuevasClases);
    setUsuarios(nuevosUsuarios);
    setEditing({}); // Clear editing state after save
  };

  const handleClaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clase = nuevaClase.trim().toUpperCase();
    if (clase && !clases.includes(clase)) {
      guardarDatos([...clases, clase], usuarios);
      setNuevaClase('');
    }
  };

  const actualizarUsuario = (uid: string) => {
    const userToUpdate = usuarios.find(u => u.uid === uid);
    if (!userToUpdate) return;
    
    const changes = editing[uid];
    const nuevoRol = changes?.rol ?? userToUpdate.rol;
    const nuevaClase = changes?.clase ?? userToUpdate.claseAsignada;

    const nuevosUsuarios = usuarios.map(u => 
      u.uid === uid ? { ...u, rol: nuevoRol, claseAsignada: nuevaClase } : u
    );
    guardarDatos(clases, nuevosUsuarios);
    alert(`Perfil actualizado correctamente.`);
  };

  const updateEditing = (uid: string, field: 'rol' | 'clase', value: string) => {
    setEditing(prev => ({
      ...prev,
      [uid]: {
        ...prev[uid] || { rol: usuarios.find(u => u.uid === uid)!.rol, clase: usuarios.find(u => u.uid === uid)!.claseAsignada },
        [field]: value
      }
    }));
  };

  return (
    <div className="container mx-auto p-4 space-y-6 text-slate-100">
      <header className="border-b border-slate-700 pb-4 mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Eco-Lab: Retos de Cocina Sostenible y Conservación Biológica • Panel de Control Raíz
        </h1>
        <p className="text-slate-400">Estructura de Clases y Gestión de Permisos</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-lg font-semibold mb-4 border-l-4 border-purple-500 pl-2">Crear Nueva Clase</h2>
            <form onSubmit={handleClaseSubmit}>
              <input 
                type="text" 
                value={nuevaClase}
                onChange={(e) => setNuevaClase(e.target.value)}
                placeholder="Ej: 2HCA" 
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded mb-4"
              />
              <button type="submit" className="w-full bg-purple-600 p-2 rounded font-semibold hover:bg-purple-700">Dar de Alta Clase</button>
            </form>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-lg font-semibold mb-4 border-l-4 border-purple-500 pl-2">Clases en el Sistema</h2>
            <div className="text-slate-400">
              {clases.map(c => <div key={c}>• Clase <strong>{c}</strong></div>)}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 border-l-4 border-purple-500 pl-2">Gestionar Usuarios</h2>
          <div className="space-y-4">
            {usuarios.map(u => (
              <div key={u.uid} className="flex justify-between items-center p-4 bg-slate-900 rounded-lg border border-slate-700">
                <div>
                  <div className="font-semibold">{u.nombre}</div>
                  <div className="text-sm text-slate-400">{u.correo}</div>
                  <span className={`inline-block text-xs font-bold px-2 py-1 rounded mt-1 ${
                    u.rol === 'admin' ? 'bg-red-900 text-red-200' : 
                    u.rol === 'profesor' ? 'bg-indigo-900 text-indigo-200' : 'bg-emerald-900 text-emerald-200'
                  }`}>
                    {u.rol} {u.claseAsignada ? `➔ ${u.claseAsignada}` : ''}
                  </span>
                </div>
                
                {u.rol !== 'admin' && (
                  <div className="flex gap-2">
                    <select 
                      value={editing[u.uid]?.rol ?? u.rol}
                      onChange={(e) => updateEditing(u.uid, 'rol', e.target.value as any)}
                      className="bg-slate-800 text-sm p-1 rounded"
                    >
                      <option value="alumno">Alumno</option>
                      <option value="profesor">Profesor</option>
                    </select>
                    <select 
                      value={editing[u.uid]?.clase ?? u.claseAsignada}
                      onChange={(e) => updateEditing(u.uid, 'clase', e.target.value)}
                      className="bg-slate-800 text-sm p-1 rounded"
                    >
                      <option value="">Sin Clase</option>
                      {clases.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button 
                      onClick={() => actualizarUsuario(u.uid)}
                      className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8">
        <RetoCreator />
      </div>
    </div>
  );
}
