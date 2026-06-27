import React, { useState, useEffect } from 'react';
import {
  CHALLENGES,
  Challenge,
  RetoState,
  SemanalLog,
  SensorialEvaluation,
  UserSession,
  Aula,
  Usuario,
  IESConfig,
  getInitialStateForChallenge
} from './types';
import { ConfiguracionInicial } from './components/ConfiguracionInicial';
import { ProjectDashboard } from './components/ProjectDashboard';
import { ProjectAdminManager } from './components/ProjectAdminManager';
import { BitacoraControl } from './components/BitacoraControl';
import { TasteLabSostenibilidad } from './components/TasteLabSostenibilidad';
import { ChatMessenger } from './components/ChatMessenger';
import { ReportViewer } from './components/ReportViewer';
import { RetoCreator } from './components/RetoCreator';
import { compressImage } from './utils/imageCompressor';
import { auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from './firebase';
import { db } from './firebase';
import { collection, getDocs, getDoc, deleteDoc, doc, writeBatch, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

import {
  Sliders,
  CalendarCheck,
  Scale,
  Beaker,
  Sprout,
  RotateCcw,
  Info,
  Award,
  LogIn,
  Layers,
  Sparkles,
  ArrowRight,
  LogOut,
  FolderKanban,
  FileSpreadsheet,
  Trash2,
  BookmarkCheck,
  ChevronRight,
  BookOpen,
  Image as ImageIcon,
  Flame,
  Globe,
  Settings,
  Users,
  Briefcase,
  Plus,
  ShieldAlert,
  GraduationCap,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // ----------------------------------------------------
  // I. SYSTEM STATES (PERSISTED)
  // ----------------------------------------------------

  // 1. Current Active Session
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('mpl_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validamos que el objeto tenga cara de usuario
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {}
    // En producción/Vercel, empezamos sin sesión para obligar al login de Google
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // 2. IES Configuration
  const [iesConfig, setIesConfig] = useState<IESConfig>(() => {
    try {
      const saved = localStorage.getItem('mpl_ies_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      nombre: 'IES Valle de Leiva',
      logo: ''
    };
  });

  // 3. Classrooms (Aulas)
  const [aulas, setAulas] = useState<Aula[]>(() => {
    try {
      const saved = localStorage.getItem('mpl_aulas');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'aula-1', nombre: '2º Cocina y Gastronomía - Sección A', profesorId: 'u-prof-1' },
      { id: 'aula-2', nombre: '2º Cocina y Gastronomía - Sección B', profesorId: 'u-prof-2' }
    ];
  });

  // 4. Users (Usuarios)
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    try {
      const saved = localStorage.getItem('mpl_usuarios');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'u-admin-1', nombre: 'Juan Codina', correo: 'juan.codina@murciaeduca.es', rol: 'admin', estado: 'activo' },
      { id: 'u-prof-1', nombre: 'Prof. Carlos Silva', correo: 'carlos.silva@murciaeduca.es', rol: 'profesor', estado: 'activo' },
      { id: 'u-prof-2', nombre: 'Prof. María Ortega', correo: 'maria.ortega@murciaeduca.es', rol: 'profesor', estado: 'activo' },
      { id: 'u-stud-1', nombre: 'Ana Gómez Ortiz', correo: 'ana@alumno.com', rol: 'alumno', estado: 'activo', aulaId: 'aula-1' },
      { id: 'u-stud-2', fontName: 'Lucas Mendoza', nombre: 'Lucas Mendoza', correo: 'lucas@alumno.com', rol: 'alumno', estado: 'activo', aulaId: 'aula-1' },
      { id: 'u-stud-3', nombre: 'Sofía Martínez', correo: 'sofia@alumno.com', rol: 'alumno', estado: 'activo' } // Unassigned new student
    ];
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');

  // 5. Projects list (All student projects)
  const [proyectos, setProyectos] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('mpl_proyectos_all');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Seed an initial project for student 1 (Ana Gómez Ortiz) to inspect immediately
    const initialSemanas: Record<number, SemanalLog> = {};
    for (let i = 1; i <= 8; i++) {
      initialSemanas[i] = {
        ph: i === 1 ? 5.8 : i === 2 ? 5.2 : i === 3 ? 4.3 : 5.5,
        completado: i <= 3,
        notas: i === 1 
          ? "Primeros signos de inoculación. Formación de capa húmeda uniforme y aroma a levadura fresca."
          : i === 2 
          ? "Acidificación en curso. Estructura de cuajada firme, la sinéresis es óptima. Aroma láctico limpio."
          : i === 3
          ? "Control crítico: pH bajo 4.5. Nivel de acidez seguro alcanzado. Excelente dureza y corteza limpia sin mohos indeseados."
          : "",
        fechaRegistro: i <= 3 ? new Date(Date.now() - 3600000 * 24 * (4 - i)).toISOString() : undefined,
        fotos: []
      };
    }

    return [
      {
        id: 'p-demo-1',
        alumnoId: 'u-stud-1',
        challengeId: 'reto-01a',
        nombre: 'Queso Probiótico Sostenible de Altramuz y Soya',
        fechaCreacion: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
        pesoInicial: 400,
        tipoInoculante: 'Kéfir de Soya local',
        started: true,
        semanas: initialSemanas,
        pesoFinal: null,
        sensorial: { firmeza: 3, uniformidad: 3, acidez: 3, persistencia: 3 }
      }
    ];
  });

  // ----------------------------------------------------
  // II. WORKBENCH & ACTIVE SELECTION STATES
  // ----------------------------------------------------
  const [openProyectoId, setOpenProyectoId] = useState<string | null>(null);
  const [openProyectoReadOnly, setOpenProyectoReadOnly] = useState<boolean>(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [activeLabTab, setActiveLabTab] = useState<'bitacora' | 'tastelab'>('bitacora');

  // Sub-dashboard tab states
  const [adminTab, setAdminTab] = useState<'ies' | 'aulas' | 'alumnos' | 'proyectos' | 'digitalizacion'>('ies');
  const [activeCatalogId, setActiveCatalogId] = useState<string | null>(null);

  // Project Admin States
  const [challengesState, setChallengesState] = useState<Challenge[]>(CHALLENGES);
  const [managingChallengeId, setManagingChallengeId] = useState<string | null>(null);

  // Infographic visibility option per challenge item (Requirement 5)
  const [showInfographics, setShowInfographics] = useState<Record<string, boolean>>({});

  // Message chat & Report compiler triggers
  const [chatOpened, setChatOpened] = useState<boolean>(false);
  const [compiledReportData, setCompiledReportData] = useState<any | null>(null);

  // Classroom creation helper states
  const [nuevaAulaNombre, setNuevaAulaNombre] = useState('');
  const [nuevaAulaProfId, setNuevaAulaProfId] = useState('');

  const [mensajes, setMensajes] = useState<any[]>([]);

  // ----------------------------------------------------
  // FIREBASE INITIAL DATA SYNC
  // ----------------------------------------------------
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    // Escuchar configuraciones institucionales
    const unsubIes = onSnapshot(doc(db, "settings", "iesConfig"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as IESConfig;
        setIesConfig(prev => {
          if (prev.nombre === data.nombre && prev.logo === data.logo) return prev;
          return data;
        });
      } else {
        setDoc(doc(db, "settings", "iesConfig"), {
          nombre: 'IES Valle de Leiva',
          logo: ''
        }, { merge: true }).catch(console.error);
      }
    }, (err) => console.warn("iesConfig listener error:", err));
    unsubs.push(unsubIes);

    // Migración inicial para mover listas únicas (settings/X) a colecciones reales
    const runMigration = async () => {
      const migrateCollection = async (docName: string, colName: string) => {
        try {
          const snap = await getDoc(doc(db, "settings", docName));
          if (snap.exists()) {
            const list = snap.data().list || [];
            const batch = writeBatch(db);
            list.forEach((item: any) => {
              if (item.id) {
                batch.set(doc(db, colName, item.id), item);
              }
            });
            batch.delete(snap.ref); // Clean up old setting doc
            await batch.commit().catch(console.error);
          }
        } catch (e) {
          console.warn(`Migration error for ${docName}:`, e);
        }
      };
      await migrateCollection("usuarios", "usuarios");
      await migrateCollection("aulas", "aulas");
      await migrateCollection("proyectos", "proyectos");
    };

    runMigration().then(() => {
      // Configurar listeners en tiempo real para las colecciones DESPUÉS de migrar
      const u1 = onSnapshot(collection(db, "usuarios"), (snapshot) => {
        setUsuarios(snapshot.docs.map(doc => doc.data() as Usuario));
      }, (err) => console.warn("usuarios listener error:", err));
      const u2 = onSnapshot(collection(db, "aulas"), (snapshot) => {
        setAulas(snapshot.docs.map(doc => doc.data() as Aula));
      }, (err) => console.warn("aulas listener error:", err));
      const u3 = onSnapshot(collection(db, "proyectos"), (snapshot) => {
        setProyectos(snapshot.docs.map(doc => doc.data() as Challenge));
      }, (err) => console.warn("proyectos listener error:", err));
      const u4 = onSnapshot(collection(db, "mensajes"), (snapshot) => {
        setMensajes(snapshot.docs.map(doc => doc.data() as any));
      }, (err) => console.warn("mensajes listener error:", err));
      
      const u5 = onSnapshot(collection(db, "ManagerproLab"), (snapshot) => {
        if (!snapshot.empty) {
          // Sort them by code or id so they appear in order
          const fetchedChallenges = snapshot.docs.map(doc => doc.data() as Challenge);
          fetchedChallenges.sort((a, b) => a.id.localeCompare(b.id));
          setChallengesState(fetchedChallenges);
        } else {
          // Seed the initial challenges if empty
          const batch = writeBatch(db);
          CHALLENGES.forEach(c => {
            batch.set(doc(db, "ManagerproLab", c.id), c);
          });
          batch.commit().catch(console.error);
        }
      }, (err) => console.warn("ManagerproLab listener error:", err));

      unsubs.push(u1, u2, u3, u4, u5);
    }).catch(err => console.warn("runMigration promise error:", err));

    return () => {
      unsubs.forEach(fn => fn());
    };
  }, []);

  // Synchronize user state when usuarios updates in real-time
  useEffect(() => {
    if (user && usuarios.length > 0) {
      const currentUser = usuarios.find(u => u.id === user.id);
      if (currentUser && (currentUser.aulaId !== user.aulaId || currentUser.rol !== user.role || currentUser.estado !== user.estado)) {
        setUser(prev => prev ? {
          ...prev,
          aulaId: currentUser.aulaId,
          role: currentUser.rol,
          estado: currentUser.estado
        } : null);
      }
    }
  }, [usuarios, user?.id]);

  // ----------------------------------------------------
  // III. SAVING AND STORAGE SYNCHRONIZATION
  // ----------------------------------------------------
  useEffect(() => {
    // Manejar el resultado de una redirección previa (Login persistente tras recarga)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Login por redirección exitoso:", result.user.email);
        }
      })
      .catch((err) => {
        console.error("Error en resultado de redirección Google:", err);
        if (err.code === 'auth/unauthorized-domain') {
          const currentDomain = window.location.hostname;
          alert(`Error: El dominio '${currentDomain}' no está autorizado en la consola de Firebase. Por favor, añádelo en Authentication -> Settings -> Authorized Domains.`);
        }
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Firebase Auth State Changed:", firebaseUser);
      if (firebaseUser) {
        try {
          const userEmail = (firebaseUser.email || '').toLowerCase().trim();
          
          // Verificar en Firestore si el usuario ya existe
          const userRef = doc(db, "usuarios", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          let currentUserRole: 'admin' | 'profesor' | 'alumno' = 'alumno';
          let currentUserEstado: 'activo' | 'bloqueado' | 'suspendido' | 'eliminado' = 'activo';
          let currentUserName = firebaseUser.displayName || 'Usuario Google';
          let currentAulaId: string | undefined = undefined;

          if (!userSnap.exists()) {
            // El usuario es nuevo en el sistema
            const isAdmin = userEmail === 'juan.codina@murciaeduca.es' || userEmail === 'jcbmisweb@gmail.com' || userEmail.includes('admin');
            currentUserRole = isAdmin ? 'admin' : 'alumno';

            const newUser: Usuario = {
              id: firebaseUser.uid,
              nombre: currentUserName,
              correo: userEmail,
              rol: currentUserRole,
              estado: 'activo'
            };
            
            // Guardar en Firestore directamente
            await setDoc(userRef, newUser).catch(console.error);
          } else {
            // El usuario ya existe
            const data = userSnap.data() as Usuario;
            currentUserRole = data.rol;
            currentUserEstado = data.estado || 'activo';
            currentUserName = data.nombre || currentUserName;
            currentAulaId = data.aulaId;
          }

          setUser({
            id: firebaseUser.uid,
            name: currentUserName,
            email: userEmail,
            role: currentUserRole,
            loggedIn: true,
            estado: currentUserEstado,
            aulaId: currentAulaId
          });
        } catch (e) {
          console.error("Error cargando perfil de usuario:", e);
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Usuario Google',
            email: firebaseUser.email || '',
            role: 'alumno',
            loggedIn: true,
            estado: 'activo'
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('mpl_user_session', JSON.stringify(user));
  }, [user]);

  // Firebase synchronization is now handled via collections
  
  // ----------------------------------------------------
  // IV. CORE SYSTEM OPERATIONS (HANDLERS)
  // ----------------------------------------------------

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error completo de login:", error);
      
      if (error.code === 'auth/popup-blocked') {
        alert("El navegador bloqueó la ventana emergente. Por favor, permite las popups para este sitio o intenta de nuevo.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        // El usuario cerró la ventana intencionalmente, no hacer nada
        console.log("Login cancelado por el usuario.");
      } else if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        alert(`Error: El dominio '${currentDomain}' no está autorizado en tu consola de Firebase. Debes añadirlo en Authentication > Settings > Authorized Domains.`);
      } else {
        // Intentar redirección como último recurso
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirErr: any) {
          console.error("Error en redirección:", redirErr);
          alert(`Error al iniciar sesión: ${error.message || "Error desconocido"}. Revisa la consola para más detalles.`);
        }
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setOpenProyectoId(null);
      setOpenProyectoReadOnly(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSaveName = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "usuarios", user.id), { nombre: editName });
      setUser({ ...user, name: editName });
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  // IES name/logo modification (Admin)
  const updateIESNombre = (nombre: string) => {
    setIesConfig(prev => ({ ...prev, nombre }));
  };

  // VI. SYSTEM RESET (ADMIN ONLY)
  const handleSystemReset = async () => {
    // Strictly guard for the main admin email
    const mainAdminEmail = 'juan.codina@murciaeduca.es';
    if (user?.email?.toLowerCase().trim() !== mainAdminEmail) {
      alert("Operación no permitida. Solo el administrador principal puede realizar esta acción.");
      return;
    }

    const confirm1 = window.confirm("⚠️ ATENCIÓN: Estás a punto de borrar TODOS los datos de la aplicación (alumnos, proyectos, aulas, configuraciones) tanto localmente como en la base de datos Firestore. Esto es irreversible. ¿Deseas continuar?");
    if (!confirm1) return;

    const confirm2 = window.prompt("Para confirmar el borrado total de la aplicación y empezar de cero el nuevo curso, escribe 'BORRAR TODO' en mayúsculas:");
    if (confirm2 !== 'BORRAR TODO') {
      alert("Confirmación fallida. No se ha borrado nada.");
      return;
    }

    try {
      // 1. Clear LocalStorage
      const keysToClear = [
        'mpl_user_session', 
        'mpl_ies_config', 
        'mpl_aulas', 
        'mpl_usuarios', 
        'mpl_proyectos_all',
        'mpl_clases',
        'mpl_usuarios_global',
        'mpl_mensajes_chat'
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));

      // 2. Clear Firestore Collections (Attempt)
      const collectionsToClear = ['usuarios', 'aulas', 'proyectos', 'bitacora', 'mensajes'];
      for (const colName of collectionsToClear) {
        const querySnapshot = await getDocs(collection(db, colName));
        if (!querySnapshot.empty) {
          const batch = writeBatch(db);
          querySnapshot.forEach((document) => {
            batch.delete(doc(db, colName, document.id));
          });
          await batch.commit();
        }
      }

      alert("Sistema reseteado correctamente en local y base de datos. La aplicación se reiniciará con los valores de fábrica.");
      window.location.reload();
    } catch (error) {
      console.error("Error durante el reseteo del sistema:", error);
      alert("Se produjo un error al intentar borrar algunos datos de la base de datos (Firestore). Es posible que necesites revisar los permisos. Sin embargo, los datos locales han sido limpiados.");
      window.location.reload();
    }
  };

  const handleIESLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        const compressed = await compressImage(reader.result as string, 300, 150, 0.85);
        updateDoc(doc(db, "settings", "iesConfig"), { logo: compressed }).catch(console.error);
      };
      reader.readAsDataURL(file);
    }
  };

  // User Administration
  const changeUserRole = (userId: string, rol: 'admin' | 'profesor' | 'alumno') => {
    const userToChange = usuarios.find(u => u.id === userId);
    if (userToChange?.correo === 'juan.codina@murciaeduca.es' && rol !== 'admin') {
      alert('No se puede cambiar el rol del administrador principal.');
      return;
    }
    const newAulaId = rol !== 'alumno' ? null : userToChange?.aulaId || null;
    updateDoc(doc(db, "usuarios", userId), { rol, aulaId: newAulaId }).catch(console.error);
    // If we changed current logged in user role
    if (user && user.id === userId) {
      setUser(prev => prev ? { ...prev, role: rol } : null);
    }
  };

  const changeUserStatus = (userId: string, estado: 'activo' | 'bloqueado' | 'suspendido' | 'eliminado') => {
    const userToChange = usuarios.find(u => u.id === userId);
    if (userToChange?.correo === 'juan.codina@murciaeduca.es' && estado !== 'activo') {
      alert('No se puede cambiar el estado a inactivo para el administrador principal.');
      return;
    }
    updateDoc(doc(db, "usuarios", userId), { estado }).catch(console.error);
    // If we changed current logged in user status
    if (user && user.id === userId) {
      if (estado !== 'activo') {
        handleLogout();
      }
    }
  };

  const deleteUser = (userId: string) => {
    const userToDelete = usuarios.find(u => u.id === userId);
    if (userToDelete?.correo === 'juan.codina@murciaeduca.es') {
      alert('No se puede eliminar al administrador principal.');
      return;
    }
    if (window.confirm('¿Estás seguro de que deseas eliminar permanentemente a este usuario?')) {
      deleteDoc(doc(db, "usuarios", userId)).catch(console.error);
      if (user && user.id === userId) {
        handleLogout();
      }
    }
  };

  const assignStudentToAula = (studentId: string, aulaId: string) => {
    updateDoc(doc(db, "usuarios", studentId), { aulaId }).catch(console.error);
  };

  // Create classrooms
  const handleCrearAula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaAulaNombre.trim() || !nuevaAulaProfId) {
      alert('Debes ingresar un nombre para el aula y seleccionar un profesor a cargo.');
      return;
    }
    const newAula: Aula = {
      id: 'aula-' + Date.now(),
      nombre: nuevaAulaNombre.trim(),
      profesorId: nuevaAulaProfId
    };
    setDoc(doc(db, "aulas", newAula.id), newAula).catch(console.error);
    setNuevaAulaNombre('');
    setNuevaAulaProfId('');
  };

  const handleEliminarAula = (aulaId: string) => {
    const studentsInAula = usuarios.filter(u => u.aulaId === aulaId);
    if (studentsInAula.length > 0) {
      alert("No se puede eliminar un aula que tiene alumnos inscritos.");
      return;
    }
    if (window.confirm("¿Estás seguro de que deseas eliminar esta aula? Esta acción no se puede deshacer.")) {
      deleteDoc(doc(db, "aulas", aulaId)).catch(console.error);
    }
  };

  // Student Project initiation
  const handleStartProject = (challengeId: string, title: string) => {
    console.log("handleStartProject called with:", { challengeId, title });
    console.log("Current user:", user);
    if (!user) {
      console.warn("No user found!");
      alert("Inicia sesión para iniciar un proyecto.");
      return;
    }
    
    // Check if classroom is assigned
    if (user.role === 'alumno' && !user.aulaId) {
      console.warn("User is alumno but no aulaId!");
      alert("Debes tener asignada una clase por el Administrador antes de iniciar un proyecto.");
      return;
    }

    const challenge = challengesState.find(c => c.id === challengeId);
    console.log("Found challenge:", challenge);
    if (!challenge) {
      console.error("Challenge not found for ID:", challengeId);
      return;
    }

    const userProjects = proyectos.filter(p => p.alumnoId === user.id);
    if (userProjects.length >= 5) {
      alert("Has alcanzado el límite de 5 proyectos. Elimina alguno para poder iniciar uno nuevo.");
      return;
    }

    // Create default week records
    const semanasMap: Record<number, SemanalLog> = {};
    for (let i = 1; i <= challenge.semanaMax; i++) {
      semanasMap[i] = {
        ph: challenge.phInicialDefault,
        completado: false,
        notas: '',
        fotos: []
      };
    }

    const nuevoP: any = {
      id: 'p-' + Date.now(),
      alumnoId: user.id,
      challengeId: challenge.id,
      nombre: title.trim() || `Proyecto: ${challenge.name}`,
      fechaCreacion: new Date().toISOString(),
      pesoInicial: challenge.initialWeightDefault,
      tipoInoculante: challenge.inoculantOptions[0] || 'Starter estándar',
      started: false,
      semanas: semanasMap,
      pesoFinal: null,
      sensorial: { firmeza: 3, uniformidad: 3, acidez: 3, persistencia: 3 }
    };

    setDoc(doc(db, "proyectos", nuevoP.id), nuevoP).catch(console.error);
    setProyectos(prev => [...prev, nuevoP as unknown as Challenge]);
    setOpenProyectoId(nuevoP.id);
    setOpenProyectoReadOnly(false);
    setSelectedWeek(1);
    setActiveLabTab('bitacora');
  };

  // Modify active project configs
  const handleSaveInitialConfig = (peso: number, inoculante: string) => {
    if (!openProyectoId) return;
    updateDoc(doc(db, "proyectos", openProyectoId), {
      pesoInicial: peso,
      tipoInoculante: inoculante,
      started: true
    }).catch(console.error);
  };

  const handleResetExperiment = () => {
    const currentProj = proyectos.find(p => p.id === openProyectoId);
    if (!currentProj) return;
    const challenge = challengesState.find(c => c.id === currentProj.challengeId);
    if (!challenge) return;

    const resetSemanas: Record<number, SemanalLog> = {};
    for (let i = 1; i <= challenge.semanaMax; i++) {
      resetSemanas[i] = {
        ph: challenge.phInicialDefault,
        completado: false,
        notas: '',
        fotos: []
      };
    }

    updateDoc(doc(db, "proyectos", currentProj.id), {
      started: false,
      semanas: resetSemanas,
      pesoFinal: null,
      sensorial: { firmeza: 3, uniformidad: 3, acidez: 3, persistencia: 3 }
    }).catch(console.error);
    
    setSelectedWeek(1);
    setActiveLabTab('bitacora');
  };

  // Save week details
  const handleSaveWeek = (week: number, ph: number, notas: string, fotos?: string[], parametros?: Record<string, string | number>) => {
    const currentProj = proyectos.find(p => p.id === openProyectoId);
    if (!currentProj) return;
    
    const updatedSemanas = { ...currentProj.semanas };
    updatedSemanas[week] = {
      ...updatedSemanas[week],
      ph,
      notas,
      completado: true,
      fechaRegistro: new Date().toISOString(),
      fotos: fotos || [],
      parametros: parametros || {}
    };
    
    updateDoc(doc(db, "proyectos", currentProj.id), {
      semanas: updatedSemanas
    }).catch(console.error);
    
    alert("¡Semana guardada con éxito en la bitácora técnica!");
  };

  // Save TasteLab evaluation
  const handleSaveFinal = (pesoFinal: number, sensorial: SensorialEvaluation) => {
    if (!openProyectoId) return;
    
    updateDoc(doc(db, "proyectos", openProyectoId), {
      pesoFinal,
      sensorial
    }).catch(console.error);
    
    alert("Análisis Sensorial y métricas de sostenibilidad guardadas con éxito.");
  };

  // ----------------------------------------------------
  // V. COMPUTED VIEWS HELPERS
  // ----------------------------------------------------
  const activeProject = proyectos.find(p => p.id === openProyectoId);
  const activeChallenge = activeProject ? challengesState.find(c => c.id === activeProject.challengeId) : null;

  // Find conversations and unread counts for messenger alert
  const unreadMessagesCount = user ? 
    mensajes.filter((m: any) => m.receptorId === user.id && !m.leido).length : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex flex-col justify-between">
      
      {/* 1. BRAND HEADER BANNER */}
      <header id="main-application-header" className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-3xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo & Brand title */}
          <div className="flex items-center gap-3">
            {iesConfig.logo ? (
              <img 
                src={iesConfig.logo} 
                alt="Logo IES" 
                className="h-10 max-w-[120px] object-contain border rounded p-0.5 bg-slate-50" 
              />
            ) : (
              <div className="w-9 h-9 bg-slate-900 text-emerald-400 font-black rounded-lg flex items-center justify-center border border-slate-800 text-sm shadow-xs font-mono">
                IES
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-sm uppercase">
                  {iesConfig.nombre}
                </span>
                <span className="bg-slate-100 text-slate-500 text-[9px] font-mono px-2 py-0.5 rounded font-extrabold">
                  LAB-MANAGER PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase mt-0.5">
                Plataforma de Gestión de Proyectos de Bioprocesos
              </p>
            </div>
          </div>

          {/* User Profile Bar */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  {isEditingName ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-xs border rounded px-1 w-32"
                      />
                      <button onClick={handleSaveName} className="text-[10px] bg-emerald-500 text-white px-1.5 rounded">Guardar</button>
                      <button onClick={() => setIsEditingName(false)} className="text-[10px] bg-slate-500 text-white px-1.5 rounded">X</button>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-xs text-slate-800">{user.name}</span>
                      <button 
                        onClick={() => { setEditName(user.name); setIsEditingName(true); }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <Settings className="w-3 h-3" />
                      </button>
                    </>
                  )}
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    user.role === 'admin' 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : user.role === 'profesor'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
              </div>

              {/* Chat Quick Access with alert dot */}
              <button
                onClick={() => setChatOpened(true)}
                className="relative p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200"
                title="Mensajería Directa"
              >
                <MessageSquare className="w-4 h-4" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-100 transition-all cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </header>

      {/* 2. MAIN HUB ROUTING CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <GraduationCap className="w-12 h-12 text-slate-300 animate-spin-slow mb-4" />
            <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Sincronizando con Firebase...</p>
          </div>
        ) : !user ? (
          <div className="max-w-md mx-auto bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center space-y-6 mt-12">
            <GraduationCap className="w-12 h-12 text-slate-900 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Acceso Seguro a Bioprocesos IES</h2>
              <p className="text-xs text-slate-500 mt-1">
                Inicia sesión de forma segura con tu cuenta de Google (Firebase Authentication) para sincronizar tus proyectos de bioprocesos.
              </p>
            </div>
            
            <div className="pt-2 space-y-4">
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold p-3.5 rounded-xl shadow-xs transition-all cursor-pointer text-sm"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Entrar con Google (Ventana)</span>
                </button>

                <button
                  onClick={() => signInWithRedirect(auth, googleProvider)}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium p-3 rounded-xl shadow-xs transition-all cursor-pointer text-sm"
                >
                  <span>Usar modo Redirección (Recomendado)</span>
                </button>
              </div>

            </div>
          </div>
        ) : (
          <>
            
            {/* If a student project workspace is active */}
            {openProyectoId && activeProject && activeChallenge ? (
              <div className="space-y-6">
                
                {/* Workspace Header toolbar */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setOpenProyectoId(null); setOpenProyectoReadOnly(false); }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
                      >
                        ← Volver a mi panel
                      </button>
                      <span className="text-slate-300">|</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-200 uppercase">
                        {activeChallenge.code}
                      </span>
                    </div>
                    
                    <h1 className="text-lg font-black text-slate-900 tracking-tight mt-1 uppercase">
                      {activeProject.nombre}
                    </h1>
                    <p className="text-xs text-slate-500">
                      Evaluando: {activeChallenge.name} • {openProyectoReadOnly ? '👁️ Modo Seguimiento (Profesor)' : '✏️ Modo Laboratorio (Alumno)'}
                    </p>
                  </div>

                  <div className="flex gap-2.5">
                    {/* Compilation button (Requirement 7.3) */}
                    <button
                      onClick={() => {
                        const projectOwner = usuarios.find(u => u.id === activeProject.alumnoId) || { nombre: 'Alumno', correo: 'alumno@correo.com' };
                        const projectAula = aulas.find(a => a.id === projectOwner.aulaId) || null;
                        const classProfessor = projectAula ? usuarios.find(u => u.id === projectAula.profesorId) || null : null;
                        
                        setCompiledReportData({
                          iesConfig,
                          aula: projectAula,
                          alumno: projectOwner,
                          profesor: classProfessor,
                          proyecto: activeProject,
                          challenge: activeChallenge
                        });
                      }}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Generar Informe Técnico</span>
                    </button>
                  </div>
                </div>

                {/* Main tracking view with configuration details */}
                {!activeProject.started ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">
                      Inicialización Científica del Lote de Cultivo
                    </h3>
                    <ConfiguracionInicial
                      pesoInicialDefault={activeChallenge.initialWeightDefault}
                      inoculanteOptions={activeChallenge.inoculantOptions}
                      materiaPrimaLabel={activeChallenge.materiaPrimaLabel}
                      onStart={(peso, inoculante) => {
                        if (openProyectoReadOnly) {
                          alert("No puedes editar la configuración inicial en modo lectura.");
                          return;
                        }
                        handleSaveInitialConfig(peso, inoculante);
                      }}
                      onReset={() => {}}
                      started={false}
                    />
                  </div>
                ) : (
                  <div className="space-y-8">
                    
                    {/* Workbench Tabs */}
                    <div className="flex gap-1 border-b border-slate-200 bg-white p-1 rounded-xl border max-w-sm">
                      <button
                        onClick={() => setActiveLabTab('bitacora')}
                        className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          activeLabTab === 'bitacora'
                            ? 'bg-slate-900 text-white shadow-3xs'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        Bitácora de Control
                      </button>
                      <button
                        onClick={() => setActiveLabTab('tastelab')}
                        className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          activeLabTab === 'tastelab'
                            ? 'bg-slate-900 text-white shadow-3xs'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        TasteLab Sensorial
                      </button>
                    </div>

                    {/* Active Workbench Tab render */}
                    {activeLabTab === 'bitacora' ? (
                      <BitacoraControl
                        proyectoId={activeProject.id}
                        semanas={activeProject.semanas}
                        diario={activeProject.diario || []}
                        onSaveDiarioEntry={(entry) => {
                          const currentProj = proyectos.find(p => p.id === activeProject.id);
                          if (!currentProj) return;
                          const updatedDiario = [...(currentProj.diario || []), entry];
                          updateDoc(doc(db, "proyectos", currentProj.id), { diario: updatedDiario }).catch(console.error);
                        }}
                        onSaveWeek={handleSaveWeek}
                        selectedWeek={selectedWeek}
                        setSelectedWeek={setSelectedWeek}
                        readOnly={openProyectoReadOnly}
                        challenge={activeChallenge}
                      />
                    ) : (
                      <TasteLabSostenibilidad
                        pesoInicial={activeProject.pesoInicial}
                        sensorial={activeProject.sensorial}
                        pesoFinal={activeProject.pesoFinal}
                        onSaveFinal={handleSaveFinal}
                        materiaPrimaLabel={activeChallenge.materiaPrimaLabel}
                        precioMateriaPrimaKilo={activeChallenge.precioMateriaPrimaKilo}
                        precioComercialKilo={activeChallenge.precioComercialKilo}
                        semanaMax={activeChallenge.semanaMax}
                        readOnly={openProyectoReadOnly}
                      />
                    )}

                    {/* Reset button inside workbench */}
                    {!openProyectoReadOnly && (
                      <div className="flex justify-end pt-4">
                        <button
                          onClick={() => {
                            if (window.confirm("¿Estás seguro de que deseas vaciar y reiniciar el experimento? Se borrará todo el registro de pH, notas e imágenes.")) {
                              handleResetExperiment();
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 font-bold uppercase tracking-wider cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Reiniciar Experimento</span>
                        </button>
                      </div>
                    )}

                  </div>
                )}

              </div>
            ) : (
              
              /* ----------------------------------------------------
               * VI. DASHBOARD ROUTING ACCORDING TO USER ROLE
               * ---------------------------------------------------- */
              <div className="space-y-8 animate-fade-in">
                
                {/* 🛡️ A. GENERAL ADMIN DASHBOARD PANEL */}
                {user.role === 'admin' && (
                  <div className="space-y-6">
                    
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-3xs">
                      <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Settings className="w-5 h-5 text-red-600" />
                        <span>Consola de Administrador General</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Control general de las variables institucionales, logo, asignación de aulas y promoción de roles.
                      </p>

                      {/* Admin sub-tabs */}
                      <div className="flex gap-2 border-b border-slate-200 mt-5 pb-px">
                        <button
                          onClick={() => setAdminTab('ies')}
                          className={`pb-2.5 text-xs font-bold px-1.5 transition-all border-b-2 cursor-pointer ${
                            adminTab === 'ies'
                              ? 'border-red-600 text-slate-900'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Configuración Institucional
                        </button>
                        <button
                          onClick={() => setAdminTab('aulas')}
                          className={`pb-2.5 text-xs font-bold px-1.5 transition-all border-b-2 cursor-pointer ${
                            adminTab === 'aulas'
                              ? 'border-red-600 text-slate-900'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Gestión de Aulas / Clases
                        </button>
                        <button
                          onClick={() => setAdminTab('alumnos')}
                          className={`pb-2.5 text-xs font-bold px-1.5 transition-all border-b-2 cursor-pointer ${
                            adminTab === 'alumnos'
                              ? 'border-red-600 text-slate-900'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Gestión de Alumnos y Roles
                        </button>
                        <button
                          onClick={() => setAdminTab('proyectos')}
                          className={`pb-2.5 text-xs font-bold px-1.5 transition-all border-b-2 cursor-pointer ${
                            adminTab === 'proyectos'
                              ? 'border-red-600 text-slate-900'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Proyectos
                        </button>
                        <button
                          onClick={() => setAdminTab('digitalizacion')}
                          className={`pb-2.5 text-xs font-bold px-1.5 transition-all border-b-2 cursor-pointer ${
                            adminTab === 'digitalizacion'
                              ? 'border-red-600 text-slate-900'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Puente de Digitalización IA
                        </button>
                      </div>

                      <div className="pt-6">
                        
                        {/* Tab A.1: IES CONFIG */}
                        {adminTab === 'ies' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                  Nombre de la Institución (IES)
                                </label>
                                <input
                                  type="text"
                                  value={iesConfig.nombre}
                                  onChange={(e) => updateIESNombre(e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:bg-white"
                                />
                                <button
                                  onClick={() => updateDoc(doc(db, "settings", "iesConfig"), { nombre: iesConfig.nombre }).then(() => alert('Nombre guardado')).catch(console.error)}
                                  className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded cursor-pointer"
                                >
                                  Guardar Nombre
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Logo Institucional de la Web
                              </span>
                              <div className="flex items-center gap-4">
                                {iesConfig.logo ? (
                                  <img src={iesConfig.logo} alt="Logo" className="h-14 border rounded p-1 bg-white" />
                                ) : (
                                  <div className="w-14 h-14 bg-slate-100 border flex items-center justify-center font-bold text-slate-400 text-xs text-center rounded">
                                    Sin Logo
                                  </div>
                                )}
                                <div>
                                  <input
                                    type="file"
                                    id="ies-logo-upload"
                                    accept="image/*"
                                    onChange={handleIESLogoUpload}
                                    className="hidden"
                                  />
                                  <label
                                    htmlFor="ies-logo-upload"
                                    className="inline-block px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase rounded cursor-pointer"
                                  >
                                    Cargar nuevo logo
                                  </label>
                                  <span className="block text-[9px] text-slate-400 mt-1">Sube el logo oficial del centro educativo</span>
                                </div>
                              </div>
                            </div>

                            {/* DANGER ZONE: SYSTEM RESET */}
                            <div className="md:col-span-2 mt-4 pt-6 border-t border-rose-100">
                              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                  <h4 className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <Trash2 className="w-4 h-4" />
                                    Zona de Peligro: Reinicio de Curso
                                  </h4>
                                  <p className="text-[10px] text-rose-600 mt-1 max-w-md">
                                    Esta acción eliminará permanentemente todos los alumnos, aulas, proyectos y configuraciones. 
                                    Úsala solo al finalizar el año escolar para preparar el sistema para el siguiente curso.
                                  </p>
                                </div>
                                <button
                                  onClick={handleSystemReset}
                                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  Resetear todo el Sistema
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tab A.2: CLASSROOMS */}
                        {adminTab === 'aulas' && (
                          <div className="space-y-6">
                            {/* Classroom creation form */}
                            <form onSubmit={handleCrearAula} className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                  Nombre de la Nueva Aula / Grupo
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ej: 2º Cocina - Sección C"
                                  value={nuevaAulaNombre}
                                  onChange={(e) => setNuevaAulaNombre(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                  Asignar Profesor a Cargo
                                </label>
                                <select
                                  value={nuevaAulaProfId}
                                  onChange={(e) => setNuevaAulaProfId(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                                >
                                  <option value="">-- Seleccionar --</option>
                                  {usuarios.filter(u => u.rol === 'profesor' || u.rol === 'admin').map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                  ))}
                                </select>
                              </div>
                              <button
                                type="submit"
                                className="w-full bg-slate-900 text-white text-xs font-bold uppercase py-2.5 px-4 rounded-lg flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-800"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Crear Aula</span>
                              </button>
                            </form>

                            {/* Classrooms list */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {aulas.map(a => {
                                const prof = usuarios.find(u => u.id === a.profesorId);
                                const studentsCount = usuarios.filter(u => u.aulaId === a.id).length;
                                return (
                                  <div key={a.id} className="border border-slate-200 p-4 rounded-xl flex justify-between items-center bg-white shadow-3xs">
                                    <div>
                                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">{a.nombre}</h4>
                                      <p className="text-[10px] text-slate-500 mt-1">
                                        Profesor: <span className="font-semibold">{prof?.nombre || 'No asignado'}</span> • {studentsCount} Alumnos inscritos
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-bold px-2 py-0.5 rounded">
                                        {a.id}
                                      </span>
                                      {studentsCount === 0 && (
                                        <button
                                          onClick={() => handleEliminarAula(a.id)}
                                          title="Eliminar aula"
                                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded transition-colors cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Tab A.3: USERS & ALUMNOS */}
                        {adminTab === 'alumnos' && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                              <thead>
                                <tr className="border-b text-[10px] text-slate-400 font-mono uppercase font-bold">
                                  <th className="pb-2.5 font-bold">Investigador</th>
                                  <th className="pb-2.5 font-bold">Correo</th>
                                  <th className="pb-2.5 font-bold">Rol actual</th>
                                  <th className="pb-2.5 font-bold">Clase asignada</th>
                                  <th className="pb-2.5 font-bold">Estado</th>
                                  <th className="pb-2.5 font-bold text-right">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {usuarios.map(u => {
                                  let rowClasses = "transition-colors ";
                                  if (u.rol === 'admin') {
                                    rowClasses += "bg-orange-50 hover:bg-orange-100";
                                  } else if (u.rol === 'alumno') {
                                    rowClasses += u.aulaId ? "bg-emerald-50 hover:bg-emerald-100" : "bg-emerald-100 hover:bg-emerald-200";
                                  } else if (u.rol === 'profesor') {
                                    const isAssigned = aulas.some(a => a.profesorId === u.id);
                                    rowClasses += isAssigned ? "bg-blue-50 hover:bg-blue-100" : "bg-blue-100 hover:bg-blue-200";
                                  }

                                  return (
                                    <tr key={u.id} className={rowClasses}>
                                      <td className="py-3 px-2 font-bold text-slate-800">{u.nombre}</td>
                                      <td className="py-3 px-2 font-mono text-slate-500">{u.correo}</td>
                                      <td className="py-3 px-2">
                                        <select
                                          value={u.rol}
                                          onChange={(e: any) => changeUserRole(u.id, e.target.value)}
                                          className="text-[10px] p-1 bg-white/60 border border-slate-300 rounded text-slate-700 font-bold uppercase cursor-pointer"
                                        >
                                          <option value="admin">Admin</option>
                                          <option value="profesor">Profesor</option>
                                          <option value="alumno">Alumno</option>
                                        </select>
                                      </td>
                                      <td className="py-3 px-2">
                                        {u.rol === 'alumno' ? (
                                          <select
                                            value={u.aulaId || ''}
                                            onChange={(e) => assignStudentToAula(u.id, e.target.value)}
                                            className="text-[11px] p-1 bg-white/60 border border-slate-300 rounded text-slate-700 font-semibold"
                                          >
                                            <option value="">-- Sin asignar --</option>
                                            {aulas.map(a => (
                                              <option key={a.id} value={a.id}>{a.nombre}</option>
                                            ))}
                                          </select>
                                        ) : (u.rol === 'profesor' || u.rol === 'admin') ? (
                                          <span className="text-slate-500 font-semibold text-[11px]">
                                            {aulas.filter(a => a.profesorId === u.id).map(a => a.nombre).join(', ') || <span className="italic">Sin asignar</span>}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400 italic text-[11px]">No aplica</span>
                                        )}
                                      </td>
                                      <td className="py-3 px-2">
                                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                          u.estado === 'activo'
                                            ? 'bg-emerald-100/50 text-emerald-700 border border-emerald-200'
                                            : u.estado === 'bloqueado'
                                            ? 'bg-red-100/50 text-red-700 border border-red-200'
                                            : u.estado === 'eliminado'
                                            ? 'bg-slate-100/50 text-slate-500 border border-slate-200'
                                            : 'bg-amber-100/50 text-amber-700 border border-amber-200'
                                        }`}>
                                          {u.estado}
                                        </span>
                                      </td>
                                      <td className="py-3 px-2 text-right flex items-center justify-end gap-1.5">
                                        <select
                                          value={u.estado}
                                          onChange={(e: any) => changeUserStatus(u.id, e.target.value)}
                                          className="text-[10px] p-1 bg-white/60 border border-slate-300 rounded text-slate-700 font-bold uppercase cursor-pointer"
                                        >
                                          <option value="activo">Activo</option>
                                          <option value="bloqueado">Bloqueado</option>
                                          <option value="suspendido">Suspendido</option>
                                          <option value="eliminado">Eliminado</option>
                                        </select>
                                        <button
                                          onClick={() => deleteUser(u.id)}
                                          title="Eliminar permanentemente"
                                          className="p-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded transition-colors cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Tab A.4: PROYECTOS */}
                        {adminTab === 'proyectos' && (
                          <div className="space-y-4">
                            {managingChallengeId ? (
                              <ProjectAdminManager 
                                challenge={challengesState.find(c => c.id === managingChallengeId)!} 
                                onClose={() => setManagingChallengeId(null)}
                                onSave={(updatedChallenge) => {
                                  updateDoc(doc(db, "ManagerproLab", updatedChallenge.id), updatedChallenge as any)
                                    .then(() => setManagingChallengeId(null))
                                    .catch(console.error);
                                }}
                              />
                            ) : (
                              <>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                                  Gestión de Proyectos y Retos
                                </h3>
                                <p className="text-xs text-slate-600 mb-4">
                                  Configura la visibilidad de los proyectos (retos) para que aparezcan o no a los alumnos. 
                                  Aquí también podrás gestionar la ficha técnica de cocina, receta y cuaderno de bitácora.
                                </p>
                                
                                <div className="space-y-6">
                                  {['A', 'B', 'C'].map(block => (
                                    <div key={block} className="border border-slate-200 rounded-xl overflow-hidden">
                                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                                        <h4 className="font-bold text-slate-800 text-sm">Bloque {block}</h4>
                                      </div>
                                      <div className="p-4 space-y-3">
                                        {challengesState.filter(c => c.bloque === block).map(c => (
                                          <div key={c.id} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                            <div>
                                              <div className="font-bold text-slate-800 text-sm">{c.code}: {c.name}</div>
                                              <div className="text-xs text-slate-500 mt-1">
                                                Estado: <span className={`font-semibold ${c.isPublished ? 'text-green-600' : 'text-amber-600'}`}>
                                                  {c.isPublished ? 'Publicado (Visible)' : 'Borrador (Oculto)'}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <label className="flex items-center gap-2 cursor-pointer">
                                                <div className="relative">
                                                  <input 
                                                    type="checkbox" 
                                                    className="sr-only" 
                                                    checked={!!c.isPublished}
                                                    onChange={() => {
                                                      updateDoc(doc(db, "ManagerproLab", c.id), { isPublished: !c.isPublished })
                                                        .catch(console.error);
                                                    }}
                                                  />
                                                  <div className={`block w-10 h-6 rounded-full transition-colors ${c.isPublished ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                                  <div className={`dot absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${c.isPublished ? 'left-5' : 'left-1'}`}></div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 uppercase">Publicar</span>
                                              </label>
                                              
                                              <button 
                                                onClick={() => setManagingChallengeId(c.id)}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-bold uppercase hover:bg-blue-100 transition-colors"
                                              >
                                                Gestionar
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Tab A.5: PUENTE DE DIGITALIZACIÓN */}
                        {adminTab === 'digitalizacion' && (
                          <div className="space-y-4">
                            <RetoCreator />
                          </div>
                        )}

                      </div>

                    </div>

                  </div>
                )}

                {/* 🍎 B. PROFESSOR DASHBOARD PANEL */}
                {(user.role === 'profesor' || user.role === 'admin') && (
                  <div className="space-y-6">
                    
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-3xs">
                      <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        <span>Módulo de Profesorado Técnico</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Sigue en tiempo real el progreso de los lotes fermentativos y bitácoras de los alumnos asignados a tus clases.
                      </p>

                      <div className="mt-6 space-y-8">
                        {aulas.filter(a => a.profesorId === user.id).map(a => {
                          const studentsInAula = usuarios.filter(u => u.aulaId === a.id && u.estado !== 'eliminado');
                          
                          return (
                            <div key={a.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-3xs">
                              {/* Classroom Header */}
                              <div className="bg-slate-50 border-b border-slate-200 p-4">
                                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-2">
                                  <Users className="w-4 h-4 text-blue-600" />
                                  <span>{a.nombre}</span>
                                </h3>
                              </div>

                              {/* Student list */}
                              <div className="divide-y divide-slate-100 bg-white">
                                {studentsInAula.length === 0 ? (
                                  <p className="p-4 text-xs text-slate-400 italic">No hay alumnos inscritos en esta aula todavía.</p>
                                ) : (
                                  studentsInAula.map(s => {
                                    // Get current project of this student
                                    const activeP = proyectos.find(p => p.alumnoId === s.id);
                                    
                                    // Calc completed weeks
                                    const completedWCount = activeP 
                                      ? Object.values(activeP.semanas).filter((w: any) => w.completado).length 
                                      : 0;
                                    const totalW = activeP ? Object.keys(activeP.semanas).length : 0;
                                    
                                    // Latest pH recorded
                                    let latestPh: number | null = null;
                                    if (activeP && completedWCount > 0) {
                                      const sortedW = Object.keys(activeP.semanas).map(Number).filter(wNum => activeP.semanas[wNum]?.completado).sort((x, y) => y - x);
                                      if (sortedW.length > 0) {
                                        latestPh = activeP.semanas[sortedW[0]].ph;
                                      }
                                    }

                                    return (
                                      <div key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs text-slate-800">{s.nombre}</span>
                                            <span className={`inline-block text-[8px] font-bold px-1 py-0.2 rounded uppercase tracking-wider ${
                                              s.estado === 'activo'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-amber-50 text-amber-700'
                                            }`}>
                                              {s.estado}
                                            </span>
                                          </div>
                                          <p className="text-[10px] text-slate-400 font-mono">{s.correo}</p>
                                          
                                          {activeP ? (
                                            <p className="text-[11px] font-semibold text-slate-600 mt-1.5">
                                              Proyecto: <span className="text-slate-800">{activeP.nombre}</span>
                                            </p>
                                          ) : (
                                            <p className="text-[11px] text-slate-400 italic mt-1.5">No ha iniciado ningún proyecto.</p>
                                          )}
                                        </div>

                                        {/* Project status indicators */}
                                        {activeP && (
                                          <div className="flex flex-wrap items-center gap-3">
                                            <div className="text-center px-3 py-1 bg-slate-50 border rounded-lg">
                                              <span className="block text-[8px] uppercase font-mono text-slate-400">Progreso Bitácora</span>
                                              <span className="text-xs font-bold text-slate-800 font-mono">
                                                {completedWCount} / {totalW} semanas
                                              </span>
                                            </div>

                                            <div className="text-center px-3 py-1 bg-slate-50 border rounded-lg">
                                              <span className="block text-[8px] uppercase font-mono text-slate-400">Último pH PCC</span>
                                              <span className={`text-xs font-bold font-mono ${
                                                latestPh === null 
                                                  ? 'text-slate-400' 
                                                  : latestPh < 4.5 
                                                  ? 'text-emerald-600' 
                                                  : 'text-rose-600'
                                              }`}>
                                                {latestPh !== null ? latestPh.toFixed(1) : 'Sin datos'}
                                              </span>
                                            </div>
                                          </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-1.5 text-right">
                                          {activeP && (
                                            <button
                                              onClick={() => {
                                                setOpenProyectoId(activeP.id);
                                                setOpenProyectoReadOnly(true);
                                                setSelectedWeek(completedWCount > 0 ? completedWCount : 1);
                                                setActiveLabTab('bitacora');
                                              }}
                                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white border text-[10px] font-bold uppercase tracking-wide rounded-lg cursor-pointer shadow-3xs transition-colors"
                                            >
                                              Seguimiento 👁️
                                            </button>
                                          )}

                                          {/* Direct chat button */}
                                          <button
                                            onClick={() => setChatOpened(true)}
                                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border rounded-lg cursor-pointer"
                                            title="Enviar mensaje"
                                          >
                                            <MessageSquare className="w-3.5 h-3.5" />
                                          </button>

                                          <select
                                            value={s.estado}
                                            onChange={(e: any) => changeUserStatus(s.id, e.target.value)}
                                            className="text-[10px] p-1.5 bg-white border rounded text-slate-700 font-bold uppercase cursor-pointer"
                                          >
                                            <option value="activo">Activo</option>
                                            <option value="bloqueado">Bloquear</option>
                                            <option value="suspendido">Suspender</option>
                                            <option value="eliminado">Soft Delete</option>
                                          </select>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}

                {/* 🎓 C. ALUMNO DASHBOARD PANEL */}
                {user.role === 'alumno' && (
                  <div className="space-y-8">
                    
                    {/* Active projects of this student */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-3xs space-y-4">
                      <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <FolderKanban className="w-5 h-5 text-emerald-600" />
                        <span>Mis Proyectos de Bioprocesos</span>
                      </h2>
                      
                      {proyectos.filter(p => p.alumnoId === user.id).length === 0 ? (
                        <div className="text-center py-8 border border-dashed rounded-xl space-y-3 bg-slate-50/50">
                          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-xs text-slate-400 italic">No tienes ningún lote de cultivo o fermentación activo en este momento.</p>
                          <p className="text-[10px] text-slate-400 max-w-sm mx-auto">Selecciona alguno de los retos homologados de bioprocesos abajo para iniciar tu primer experimento de laboratorio.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {proyectos.filter(p => p.alumnoId === user.id).map(p => {
                            const chal = challengesState.find(c => c.id === p.challengeId);
                            const compWeeks = Object.values(p.semanas).filter((w: any) => w.completado).length;
                            const totalWeeks = Object.keys(p.semanas).length;

                            return (
                              <div key={p.id} className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between space-y-4 shadow-3xs">
                                <div>
                                  <div className="flex justify-between items-start">
                                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                      {chal?.code || 'RETO'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {compWeeks} de {totalWeeks} sem.
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide mt-2 line-clamp-1">
                                    {p.nombre}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 font-medium">Inoculante: {p.tipoInoculante}</p>
                                  
                                  <button
                                    onClick={() => {
                                      if (window.confirm("¿Seguro que deseas eliminar este proyecto?")) {
                                        deleteDoc(doc(db, "proyectos", p.id)).catch(console.error);
                                        setProyectos(prev => prev.filter(pr => pr.id !== p.id));
                                      }
                                    }}
                                    className="text-[10px] text-red-500 font-bold hover:underline mt-2"
                                  >
                                    Eliminar
                                  </button>
                                  
                                  {/* pH Traffic Light Indicator */}
                                  {(() => {
                                    const logEntries = Object.values(p.semanas) as any[];
                                    const completedLogs = logEntries.filter(w => w.completado && w.ph !== undefined).sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime());
                                    const latestLog = completedLogs[0];
                                    if (!latestLog) return null;
                                    
                                    const val = latestLog.ph;
                                    let badge = '🟢 Seguro';
                                    let colorCls = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                                    
                                    if (val >= 4.5 && val <= 4.6) {
                                      badge = '🟡 Alerta Kahm';
                                      colorCls = 'text-amber-700 bg-amber-50 border-amber-200';
                                    } else if (val > 4.6) {
                                      badge = '🔴 Peligro (Descartar)';
                                      colorCls = 'text-red-700 bg-red-50 border-red-200';
                                    }
                                    
                                    return (
                                      <div className={`mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${colorCls}`}>
                                        pH Actual: {val.toFixed(1)} - {badge}
                                      </div>
                                    );
                                  })()}
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setOpenProyectoId(p.id);
                                      setOpenProyectoReadOnly(false);
                                      setSelectedWeek(compWeeks > 0 ? compWeeks : 1);
                                      setActiveLabTab('bitacora');
                                    }}
                                    className="flex-1 text-center py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase rounded-lg transition-all shadow-3xs cursor-pointer"
                                  >
                                    Entrar al Laboratorio 🧪
                                  </button>

                                  <button
                                    onClick={() => {
                                      const projectOwner = usuarios.find(u => u.id === p.alumnoId) || { nombre: 'Alumno', correo: 'alumno@correo.com' };
                                      const projectAula = aulas.find(a => a.id === projectOwner.aulaId) || null;
                                      const classProfessor = projectAula ? usuarios.find(u => u.id === projectAula.profesorId) || null : null;
                                      
                                      setCompiledReportData({
                                        iesConfig,
                                        aula: projectAula,
                                        alumno: projectOwner,
                                        profesor: classProfessor,
                                        proyecto: p,
                                        challenge: chal
                                      });
                                    }}
                                    className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase rounded-lg border border-slate-200 transition-all cursor-pointer"
                                    title="Descargar Informe Técnico"
                                  >
                                    Informe
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Challenges Catalog (with expansion features & infographic toggle - Req 5 & 6) */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-3xs space-y-4">
                      <div className="border-b pb-3 flex justify-between items-center">
                        <div>
                          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                            <span>Catálogo de Retos Homologados de Bioprocesos</span>
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Explora los proyectos microbiológicos y de bio-conservación disponibles. Pulsa en el botón "+" para ver la ficha completa.
                          </p>
                        </div>
                      </div>

                      <ProjectDashboard challenges={challengesState} onStartProject={handleStartProject} />
                    </div>

                  </div>
                )}

              </div>
            )}

          </>
        )}

      </main>

      {/* 3. FOOTER */}
      <footer className="mt-12 bg-slate-900 border-t border-slate-800 py-6 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <p className="text-[10px] text-slate-500 font-mono">
            &copy; {new Date().getFullYear()} {iesConfig.nombre} • Todos los derechos reservados • Desarrollado con tecnología de micro-compresión de imágenes.
          </p>
        </div>
      </footer>

      {/* ----------------------------------------------------
       * VII. MODALS OVERLAYS (MESSENGER & REPORT COMPILER)
       * ---------------------------------------------------- */}
      
      {/* Messages Drawer */}
      {chatOpened && user && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scale-in">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-800">Mensajería Directa Escolar</span>
              <button
                onClick={() => setChatOpened(false)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
            <div className="p-4">
              <ChatMessenger 
                currentUser={user}
                usuarios={usuarios}
                aulas={aulas}
                proyectos={proyectos}
              />
            </div>
          </div>
        </div>
      )}

      {/* Compiled Report Preview */}
      {compiledReportData && (
        <ReportViewer
          iesConfig={compiledReportData.iesConfig}
          aula={compiledReportData.aula}
          alumno={compiledReportData.alumno}
          profesor={compiledReportData.profesor}
          proyecto={compiledReportData.proyecto}
          challenge={compiledReportData.challenge}
          onClose={() => setCompiledReportData(null)}
        />
      )}

    </div>
  );
}
