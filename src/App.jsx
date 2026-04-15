import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  Zap, 
  Plus, 
  MoreHorizontal, 
  CheckCircle2, 
  Circle, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Edit2,
  Save,
  Trash2,
  Clock,
  DollarSign,
  LogOut,
  FolderOpen,
  ImageIcon,
  Loader2,
  X,
  AlertCircle,
  ChevronDown,
  User as UserIcon,
  Lock,
  Target,
  Users
} from 'lucide-react';

// Firebase
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, getDoc, collection } from "firebase/firestore";

// --- CONFIG ---
const DRIVE_API_KEY = ""; // El entorno inyectará la clave necesaria
const firebaseConfig = {
  apiKey: "AIzaSyCi3nxC2c8Sp4JAs9ylU4uxVagVXToP8HM",
  authDomain: "accountmatrixhub.firebaseapp.com",
  projectId: "accountmatrixhub",
  storageBucket: "accountmatrixhub.firebasestorage.app",
  messagingSenderId: "912278749399",
  appId: "1:912278749399:web:f6c4f8f575b01243d2b092"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'account-matrix-hub';

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('user'); // 'admin' o 'user'
  const [activeTab, setActiveTab] = useState('meta');
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Sucursal seleccionada en Meta
  const [selectedBranch, setSelectedBranch] = useState('Monterrey');

  // Estados de datos iniciales (se sobrescriben con Firestore)
  const [metaData, setMetaData] = useState({
    branches: {
      'Monterrey': { leads: 145, metaLeads: 200, budget: 15000, spent: 8750 },
      'Saltillo': { leads: 80, metaLeads: 150, budget: 10000, spent: 4200 },
      'CDMX': { leads: 210, metaLeads: 300, budget: 25000, spent: 18000 }
    },
    checklists: {
      awareness: [{ id: 1, text: 'Creativos de video listos', done: true }],
      prospeccion: [{ id: 3, text: 'Landing page optimizada', done: true }],
      retargeting: [{ id: 5, text: 'Audiencias personalizadas', done: false }]
    },
    drive: { awareness: '', prospeccion: '', retargeting: '' }
  });

  const [eventos, setEventos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [express, setExpress] = useState([]);

  // Auth Effect
  useEffect(() => {
    const initAuth = async () => {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const userDoc = await getDoc(doc(db, 'artifacts', APP_ID, 'users', u.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role || 'user');
        } else {
          setRole('admin'); 
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Firestore
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'main_data');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.metaData) setMetaData(data.metaData);
        if (data.eventos) setEventos(data.eventos || []);
        if (data.insumos) setInsumos(data.insumos || []);
        if (data.express) setExpress(data.express || []);
      }
    }, (err) => console.error("Firestore Error:", err));
    return () => unsub();
  }, [user]);

  const saveData = async (updates) => {
    if (role !== 'admin') return; 
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'main_data');
    try {
        await setDoc(docRef, {
            metaData, eventos, insumos, express, ...updates
        }, { merge: true });
    } catch (e) {
        console.error("Error saving data:", e);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      if (!loginEmail || !loginPass) {
        await signInAnonymously(auth);
      } else {
        await signInWithEmailAndPassword(auth, loginEmail, loginPass);
      }
    } catch (err) {
      setAuthError('Credenciales incorrectas');
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-blue-100/50">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl shadow-blue-200 mb-6">
            <LayoutDashboard size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800">Account Manager</h1>
          <p className="text-slate-400 mt-2 font-medium">Ingresa para gestionar tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                placeholder="admin@matrix.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                placeholder="••••••••"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
              />
            </div>
          </div>
          {authError && <p className="text-rose-500 text-xs font-bold text-center">{authError}</p>}
          <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]">
            Iniciar Sesión
          </button>
          <div className="text-center pt-2">
            <button type="button" onClick={() => signInAnonymously(auth)} className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">
              Entrar como Invitado
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const currentMetrics = metaData.branches[selectedBranch] || { leads:0, metaLeads:1, budget:0, spent:0 };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="font-black text-xl leading-tight text-slate-800">Account</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manager</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem active={activeTab === 'meta'} icon={<Zap size={20}/>} label="Embudo Meta" onClick={() => setActiveTab('meta')} />
          <NavItem active={activeTab === 'eventos'} icon={<Calendar size={20}/>} label="Eventos" onClick={() => setActiveTab('eventos')} />
          <NavItem active={activeTab === 'insumos'} icon={<Package size={20}/>} label="Insumos" onClick={() => setActiveTab('insumos')} />
          <NavItem active={activeTab === 'express'} icon={<Zap size={20}/>} label="Express" onClick={() => setActiveTab('express')} />
        </nav>

        <div className="p-6 border-t border-slate-50 space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {role === 'admin' ? 'AD' : 'US'}
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 capitalize">{role}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Sesión activa</p>
            </div>
          </div>
          <button onClick={() => signOut(auth)} className="flex items-center gap-3 w-full p-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-bold text-sm">
            <LogOut size={18} /> <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto p-8 md:p-12">
          
          {/* TAB: META */}
          {activeTab === 'meta' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-slate-800">Embudo Meta</h2>
                  <p className="text-slate-400 mt-2 font-medium flex items-center gap-2">
                    <Target size={16} className="text-blue-500"/> Gestiona tus campañas por sucursal
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <select 
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="appearance-none bg-white border border-slate-200 px-6 py-3.5 pr-12 rounded-2xl font-bold text-sm shadow-sm hover:border-blue-400 transition-all outline-none cursor-pointer"
                    >
                      <option value="Monterrey">Monterrey</option>
                      <option value="Saltillo">Saltillo</option>
                      <option value="CDMX">CDMX</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>

                  {role === 'admin' && (
                    <button 
                      onClick={() => {
                        if (isEditingMetrics) saveData({ metaData });
                        setIsEditingMetrics(!isEditingMetrics);
                      }}
                      className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg transition-all ${isEditingMetrics ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-slate-100'}`}
                    >
                      {isEditingMetrics ? <><Save size={18}/> Guardar Cambios</> : <><Edit2 size={18}/> Editar Métricas</>}
                    </button>
                  )}
                </div>
              </header>

              {/* Métricas Principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard 
                  label="Leads Generados" 
                  value={currentMetrics.leads} 
                  icon={<Users className="text-blue-600" size={24}/>}
                  color="bg-blue-50"
                  editing={isEditingMetrics}
                  onChange={(v) => {
                    const newBranches = { ...metaData.branches, [selectedBranch]: { ...currentMetrics, leads: v } };
                    setMetaData({ ...metaData, branches: newBranches });
                  }}
                />
                <MetricCard 
                  label="Meta de Leads" 
                  value={currentMetrics.metaLeads} 
                  subtext={`${Math.round((currentMetrics.leads/(currentMetrics.metaLeads || 1))*100)}% alcanzado`}
                  icon={<Target className="text-emerald-600" size={24}/>}
                  color="bg-emerald-50"
                  editing={isEditingMetrics}
                  onChange={(v) => {
                    const newBranches = { ...metaData.branches, [selectedBranch]: { ...currentMetrics, metaLeads: v } };
                    setMetaData({ ...metaData, branches: newBranches });
                  }}
                />
                <MetricCard 
                  label="Presupuesto" 
                  value={`$${(currentMetrics.budget || 0).toLocaleString()}`} 
                  icon={<DollarSign className="text-indigo-600" size={24}/>}
                  color="bg-indigo-50"
                  editing={isEditingMetrics}
                  isCurrency
                  onChange={(v) => {
                    const newBranches = { ...metaData.branches, [selectedBranch]: { ...currentMetrics, budget: v } };
                    setMetaData({ ...metaData, branches: newBranches });
                  }}
                />
                <MetricCard 
                  label="Gasto Actual" 
                  value={`$${(currentMetrics.spent || 0).toLocaleString()}`} 
                  subtext={`${Math.round((currentMetrics.spent/(currentMetrics.budget || 1))*100)}% usado`}
                  icon={<Zap className="text-amber-600" size={24}/>}
                  color="bg-amber-50"
                  editing={isEditingMetrics}
                  isCurrency
                  onChange={(v) => {
                    const newBranches = { ...metaData.branches, [selectedBranch]: { ...currentMetrics, spent: v } };
                    setMetaData({ ...metaData, branches: newBranches });
                  }}
                />
              </div>

              {/* Checklist */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-2xl text-slate-800">Checklist Operativo</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Control de calidad</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ChecklistCol 
                    title="Awareness" 
                    items={metaData.checklists.awareness} 
                    color="border-l-4 border-blue-500"
                    onUpdate={(items) => {
                      const newMeta = { ...metaData, checklists: { ...metaData.checklists, awareness: items }};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                    role={role}
                  />
                  <ChecklistCol 
                    title="Prospección" 
                    items={metaData.checklists.prospeccion} 
                    color="border-l-4 border-emerald-500"
                    onUpdate={(items) => {
                      const newMeta = { ...metaData, checklists: { ...metaData.checklists, prospeccion: items }};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                    role={role}
                  />
                  <ChecklistCol 
                    title="Retargeting" 
                    items={metaData.checklists.retargeting} 
                    color="border-l-4 border-purple-500"
                    onUpdate={(items) => {
                      const newMeta = { ...metaData, checklists: { ...metaData.checklists, retargeting: items }};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                    role={role}
                  />
                </div>
              </div>

              {/* Google Drive Section */}
              <div className="space-y-8">
                <h3 className="font-black text-2xl text-slate-800">Recursos Creativos</h3>
                <div className="grid grid-cols-1 gap-8">
                  <DriveCarousel 
                    title="Artes de Awareness" 
                    folderId={metaData.drive.awareness} 
                    onLink={(id) => {
                      const newMeta = {...metaData, drive: {...metaData.drive, awareness: id}};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: EVENTOS */}
          {activeTab === 'eventos' && (
            <div className="space-y-12 animate-in slide-in-from-right duration-500">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-slate-800">Eventos</h2>
                  <p className="text-slate-400 mt-2 font-medium">Planificación logística y presupuestaria</p>
                </div>
                {role === 'admin' && (
                   <button 
                    onClick={() => {
                        const nombre = prompt('Nombre del Evento:');
                        if (nombre) {
                            const newEventos = [{ id: Date.now(), title: nombre, date: new Date().toLocaleDateString(), budget: 0, status: 'Planeación' }, ...eventos];
                            setEventos(newEventos);
                            saveData({ eventos: newEventos });
                        }
                    }}
                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-blue-200"
                   >
                     <Plus size={20}/> Nuevo Evento
                   </button>
                )}
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {eventos.map(ev => (
                  <div key={ev.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h4 className="text-xl font-black text-slate-800">{ev.title}</h4>
                            <p className="text-sm font-bold text-slate-400">{ev.date}</p>
                        </div>
                        <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full tracking-widest">{ev.status}</span>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 bg-slate-50 p-4 rounded-2xl">
                             <p className="text-[10px] font-black text-slate-400 uppercase">Presupuesto</p>
                             <p className="text-lg font-black text-slate-800">${(ev.budget || 0).toLocaleString()}</p>
                        </div>
                    </div>
                    {role === 'admin' && (
                         <button onClick={() => {
                            const newEventos = eventos.filter(e => e.id !== ev.id);
                            setEventos(newEventos);
                            saveData({ eventos: newEventos });
                         }} className="absolute top-8 right-8 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                             <Trash2 size={18}/>
                         </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: INSUMOS */}
          {activeTab === 'insumos' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-slate-800">Insumos</h2>
                  <p className="text-slate-400 mt-2 font-medium">Control de renovaciones de materiales</p>
                </div>
                {role === 'admin' && (
                  <button 
                    onClick={() => {
                      const nombre = prompt('Nombre del material:');
                      const suc = prompt('Sucursal (Monterrey/Saltillo/CDMX):');
                      if(nombre) {
                        const newInsumos = [{ id: Date.now(), nombre, sucursal: suc || 'Monterrey', dias: 30, lastDate: new Date().toISOString() }, ...insumos];
                        setInsumos(newInsumos);
                        saveData({ insumos: newInsumos });
                      }
                    }}
                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]"
                  >
                    <Plus size={20}/> Nuevo Insumo
                  </button>
                )}
              </header>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {insumos.map(ins => (
                  <div key={ins.id} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm relative group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Package size={20}/></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ins.sucursal}</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-800 mb-1">{ins.nombre}</h4>
                    <p className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-2"><Clock size={12}/> Renovación cada {ins.dias} días</p>
                    {role === 'admin' && (
                        <button onClick={() => {
                            const newIns = insumos.filter(i => i.id !== ins.id);
                            setInsumos(newIns);
                            saveData({ insumos: newIns });
                        }} className="absolute top-7 right-7 opacity-0 group-hover:opacity-100 text-slate-200 hover:text-rose-500 transition-all">
                            <X size={18}/>
                        </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: EXPRESS */}
          {activeTab === 'express' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500 max-w-4xl mx-auto">
              <header className="flex items-end justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-slate-800">Tareas Express</h2>
                  <p className="text-slate-400 mt-2 font-medium flex items-center gap-2">
                    <Zap size={16} className="text-amber-500 fill-amber-500"/> Cosas para hacer hoy
                  </p>
                </div>
                <div className="text-right">
                   <div className="text-3xl font-black text-blue-600">{express.filter(t => t.done).length}/{express.length}</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completadas</div>
                </div>
              </header>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex gap-4">
                  <input 
                    id="newExpress"
                    type="text" 
                    placeholder="¿Qué hay que hacer hoy?" 
                    className="flex-1 p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700" 
                    onKeyDown={e => {
                      if(e.key === 'Enter') {
                        const input = e.currentTarget;
                        if (!input.value) return;
                        const newExp = [{ id: Date.now(), text: input.value, entry: new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}), done: false }, ...express];
                        setExpress(newExp);
                        saveData({ express: newExp });
                        input.value = '';
                      }
                    }}
                  />
                  <button onClick={() => {
                      const input = document.getElementById('newExpress');
                      if(!input.value) return;
                      const newExp = [{ id: Date.now(), text: input.value, entry: new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}), done: false }, ...express];
                      setExpress(newExp);
                      saveData({ express: newExp });
                      input.value = '';
                  }} className="bg-blue-600 text-white px-8 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">AGREGAR</button>
                </div>

                <div className="space-y-4">
                  {express.map(task => (
                    <div key={task.id} className="flex items-center gap-6 p-5 hover:bg-slate-50 rounded-3xl transition-all group border border-transparent hover:border-slate-100">
                        <button onClick={() => {
                            const newExp = express.map(t => t.id === task.id ? {...t, done: !t.done} : t);
                            setExpress(newExp);
                            saveData({ express: newExp });
                        }}>
                             {task.done ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Circle size={24} className="text-slate-200" />}
                        </button>
                        <div className="flex-1">
                            <p className={`font-black text-slate-700 ${task.done ? 'line-through text-slate-300' : ''}`}>{task.text}</p>
                            <span className="text-[10px] font-bold text-slate-400">{task.entry}</span>
                        </div>
                        {role === 'admin' && (
                             <button onClick={() => {
                                const newExp = express.filter(t => t.id !== task.id);
                                setExpress(newExp);
                                saveData({ express: newExp });
                             }} className="opacity-0 group-hover:opacity-100 text-slate-200 hover:text-rose-500 transition-all">
                                 <Trash2 size={18}/>
                             </button>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around p-5 z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <MobileIcon active={activeTab === 'meta'} icon={<Zap/>} onClick={() => setActiveTab('meta')} />
          <MobileIcon active={activeTab === 'eventos'} icon={<Calendar/>} onClick={() => setActiveTab('eventos')} />
          <MobileIcon active={activeTab === 'insumos'} icon={<Package/>} onClick={() => setActiveTab('insumos')} />
          <MobileIcon active={activeTab === 'express'} icon={<Zap/>} onClick={() => setActiveTab('express')} />
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function NavItem({ active, icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-5 p-5 rounded-2xl transition-all font-black text-sm ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-1' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}
    >
      {React.cloneElement(icon, { size: 22 })} <span>{label}</span>
    </button>
  );
}

function MobileIcon({ active, icon, onClick }) {
  return (
    <button onClick={onClick} className={`p-3 rounded-2xl transition-all ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-300'}`}>
      {React.cloneElement(icon, { size: 24 })}
    </button>
  );
}

function MetricCard({ label, value, subtext, icon, color, editing, onChange }) {
  return (
    <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between h-full group">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
          {editing ? (
            <input 
              type="number" 
              className="w-full text-2xl font-black text-slate-800 border-b-2 border-blue-500 outline-none bg-transparent" 
              defaultValue={typeof value === 'string' ? value.replace(/[^0-9.]/g, '') : value} 
              onBlur={e => onChange(parseFloat(e.target.value) || 0)}
            />
          ) : (
            <div className="text-3xl font-black text-slate-800 tracking-tight">{value}</div>
          )}
        </div>
        <div className={`p-3 rounded-2xl group-hover:scale-110 transition-all ${color}`}>{icon}</div>
      </div>
      {subtext && (
        <div className="pt-4 border-t border-slate-50">
          <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
            <AlertCircle size={10} className="text-blue-500"/> {subtext}
          </p>
        </div>
      )}
    </div>
  );
}

function ChecklistCol({ title, items, color, onUpdate, role }) {
  const [input, setInput] = useState('');
  return (
    <div className={`bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col ${color}`}>
      <div className="flex justify-between items-center mb-8">
        <h4 className="font-black text-lg text-slate-800">{title}</h4>
        <div className="bg-slate-50 text-[10px] font-black text-slate-400 px-3 py-1 rounded-full border border-slate-100">
          {items.filter(i => i.done).length}/{items.length}
        </div>
      </div>
      <div className="space-y-4 flex-1">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4 group">
            <button 
              disabled={role !== 'admin'}
              onClick={() => onUpdate(items.map(i => i.id === item.id ? {...i, done: !i.done} : i))}
              className={`transition-all ${role !== 'admin' ? 'cursor-default' : 'active:scale-90'}`}
            >
              {item.done ? <CheckCircle2 size={22} className="text-emerald-500" /> : <Circle size={22} className="text-slate-200" />}
            </button>
            <span className={`text-sm font-bold flex-1 ${item.done ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{item.text}</span>
            {role === 'admin' && (
              <button onClick={() => onUpdate(items.filter(i => i.id !== item.id))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
                <X size={16}/>
              </button>
            )}
          </div>
        ))}
      </div>
      {role === 'admin' && (
        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-50">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Añadir..." 
            className="flex-1 text-xs font-bold p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
            onKeyDown={e => {
              if(e.key === 'Enter' && input) {
                onUpdate([...items, { id: Date.now(), text: input, done: false }]);
                setInput('');
              }
            }}
          />
          <button onClick={() => {
            if(input) {
              onUpdate([...items, { id: Date.now(), text: input, done: false }]);
              setInput('');
            }
          }} className="bg-slate-100 p-3 rounded-xl text-slate-400 hover:text-blue-500 transition-all"><Plus size={18}/></button>
        </div>
      )}
    </div>
  );
}

function DriveCarousel({ title, folderId, onLink }) {
  const [url, setUrl] = useState(folderId || '');
  const [isEditing, setIsEditing] = useState(!folderId);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-black text-xl text-slate-800 flex items-center gap-3">
          <ImageIcon className="text-blue-600" /> {title}
        </h4>
        <button onClick={() => setIsEditing(!isEditing)} className="p-2 text-slate-400 hover:text-blue-600">
           {isEditing ? <X size={20}/> : <Edit2 size={20}/>}
        </button>
      </div>
      
      {isEditing ? (
          <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="ID de la carpeta de Drive" 
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
              />
              <button onClick={() => {
                  onLink(url);
                  setIsEditing(false);
              }} className="bg-blue-600 text-white px-6 rounded-2xl font-black text-sm">VINCULAR</button>
          </div>
      ) : (
          <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-3xl border border-blue-100 border-dashed">
              <FolderOpen size={40} className="text-blue-400" />
              <div>
                  <p className="font-black text-blue-800">Carpeta vinculada</p>
                  <a href={`https://drive.google.com/drive/folders/${folderId}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:underline">
                      Ver en Google Drive <ExternalLink size={12}/>
                  </a>
              </div>
          </div>
      )}
    </div>
  );
}
