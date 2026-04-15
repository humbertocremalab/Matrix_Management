import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  Zap, 
  Plus, 
  CheckCircle2, 
  Circle, 
  ExternalLink,
  Edit2,
  Save,
  Trash2,
  Clock,
  DollarSign,
  LogOut,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Lock,
  User as UserIcon,
  ShieldCheck,
  MapPin,
  ChevronRight
} from 'lucide-react';

// Firebase
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// --- CONFIG ---
const DRIVE_API_KEY = "AIzaSyBH8-5rLNM_--UWRMIywOb-m5-UOuzUYUw";
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
  const [role, setRole] = useState(null);
  const [showPassModal, setShowPassModal] = useState(null); // 'admin' | 'user'
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('meta');
  const [activeSucursal, setActiveSucursal] = useState('mty');
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Estados de datos iniciales con estructura por sucursal
  const [metaData, setMetaData] = useState({
    sucursales: {
      mty: { leads: 0, metaLeads: 100, budget: 5000, spent: 0 },
      slw: { leads: 0, metaLeads: 100, budget: 5000, spent: 0 },
      cdmx: { leads: 0, metaLeads: 100, budget: 5000, spent: 0 }
    },
    checklists: { awareness: [], prospeccion: [], retargeting: [] },
    drive: { awareness: '', prospeccion: '', retargeting: '' }
  });

  const [eventos, setEventos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [express, setExpress] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      const savedRole = localStorage.getItem('app_role');
      if (savedRole) setRole(savedRole);
    });
  }, []);

  useEffect(() => {
    if (!user || !role) return;
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'main_data');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // Mezclamos con el estado inicial para evitar errores de campos faltantes
        if (data.metaData) {
            setMetaData(prev => ({
                ...prev,
                ...data.metaData,
                sucursales: {
                    ...prev.sucursales,
                    ...(data.metaData.sucursales || {})
                }
            }));
        }
        if (data.eventos) setEventos(data.eventos);
        if (data.insumos) setInsumos(data.insumos);
        if (data.express) setExpress(data.express);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
    });
  }, [user, role]);

  const saveData = async (updates) => {
    if (role !== 'admin' && !updates.onlyChecklist) return;
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'main_data');
    await setDoc(docRef, {
      metaData, eventos, insumos, express, ...updates
    }, { merge: true });
  };

  const handleLogin = () => {
    const passwords = { admin: 'admin123', user: 'user123' };
    if (passwordInput === passwords[showPassModal]) {
      setRole(showPassModal);
      localStorage.setItem('app_role', showPassModal);
      setLoginError('');
      setShowPassModal(null);
      setPasswordInput('');
    } else {
      setLoginError('Contraseña incorrecta');
    }
  };

  // Obtener estadísticas de la sucursal actual con fallback de seguridad
  const currentStats = metaData?.sucursales?.[activeSucursal] || { leads: 0, metaLeads: 1, budget: 0, spent: 0 };

  if (!role) return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-100 space-y-8 animate-in zoom-in duration-300">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-blue-600 rounded-3xl text-white mb-2 shadow-lg shadow-blue-200">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800">Account Matrix</h1>
          <p className="text-slate-400 font-medium">Panel de Gestión Centralizada</p>
        </div>

        {showPassModal ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Contraseña para {showPassModal}</label>
              <div className="relative">
                <input 
                  autoFocus
                  type="password" 
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <Lock className="absolute right-6 top-5 text-slate-300" size={20} />
              </div>
              {loginError && <p className="text-rose-500 text-[10px] font-black uppercase text-center mt-2 tracking-widest">{loginError}</p>}
            </div>
            <div className="flex gap-3">
               <button onClick={() => { setShowPassModal(null); setLoginError(''); setPasswordInput(''); }} className="flex-1 p-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
               <button onClick={handleLogin} className="flex-2 px-10 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Entrar</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <LoginButton icon={<ShieldCheck className="text-blue-600"/>} title="Administrador" desc="Control total y edición" onClick={() => setShowPassModal('admin')} />
            <LoginButton icon={<UserIcon className="text-emerald-600"/>} title="Usuario" desc="Visualización y checklists" onClick={() => setShowPassModal('user')} />
          </div>
        )}
      </div>
    </div>
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={44} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Inicializando Hub</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 p-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="font-black text-xl leading-none">Account</h1>
            <p className="text-[9px] text-slate-300 uppercase font-black tracking-widest mt-1">Matrix v4.0</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          <NavItem active={activeTab === 'meta'} icon={<Zap size={20}/>} label="Embudo Meta" onClick={() => setActiveTab('meta')} />
          <NavItem active={activeTab === 'eventos'} icon={<Calendar size={20}/>} label="Eventos" onClick={() => setActiveTab('eventos')} />
          <NavItem active={activeTab === 'insumos'} icon={<Package size={20}/>} label="Insumos" onClick={() => setActiveTab('insumos')} />
          <NavItem active={activeTab === 'express'} icon={<Zap size={20}/>} label="Express" onClick={() => setActiveTab('express')} />
        </nav>

        <div className="mt-auto space-y-4">
           <div className={`p-4 rounded-3xl border flex items-center gap-3 ${role === 'admin' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
              <div className="bg-white p-2 rounded-xl shadow-sm">
                {role === 'admin' ? <ShieldCheck size={16}/> : <UserIcon size={16}/>}
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Acceso</p>
                <p className="text-xs font-black uppercase tracking-widest">{role}</p>
              </div>
           </div>
           <button onClick={() => { setRole(null); localStorage.removeItem('app_role'); signOut(auth); }} className="w-full p-4 flex items-center gap-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-black text-xs uppercase tracking-widest group">
             <LogOut size={18} className="group-hover:translate-x-1 transition-transform"/> Salir del Hub
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto p-12 space-y-12">
          
          {activeTab === 'meta' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-slate-800">Embudo Meta</h2>
                  <p className="text-slate-400 font-bold mt-2">Seguimiento de pauta por sucursal</p>
                </div>
                {role === 'admin' && (
                  <button 
                    onClick={() => {
                      if (isEditingMetrics) saveData({ metaData });
                      setIsEditingMetrics(!isEditingMetrics);
                    }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isEditingMetrics ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {isEditingMetrics ? <><Save size={16}/> Guardar</> : <><Edit2 size={16}/> Editar</>}
                  </button>
                )}
              </div>

              {/* Selector de Sucursales */}
              <div className="flex gap-2 p-1.5 bg-slate-100 w-fit rounded-[2rem] border border-slate-200">
                <SucursalTab label="Monterrey" active={activeSucursal === 'mty'} onClick={() => setActiveSucursal('mty')} />
                <SucursalTab label="Saltillo" active={activeSucursal === 'slw'} onClick={() => setActiveSucursal('slw')} />
                <SucursalTab label="CDMX" active={activeSucursal === 'cdmx'} onClick={() => setActiveSucursal('cdmx')} />
              </div>

              {/* Métricas Dinámicas por Sucursal */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard 
                  label="Leads Reales" 
                  value={currentStats.leads} 
                  icon={<UserIcon size={24} className="text-blue-500"/>}
                  editing={isEditingMetrics}
                  onChange={(v) => {
                    const newStats = {...metaData.sucursales, [activeSucursal]: {...currentStats, leads: v}};
                    setMetaData({...metaData, sucursales: newStats});
                  }}
                />
                <MetricCard 
                  label="Meta Mensual" 
                  value={currentStats.metaLeads} 
                  subtext={`${Math.round((currentStats.leads / (currentStats.metaLeads || 1)) * 100)}% de avance`}
                  icon={<Zap size={24} className="text-amber-500"/>}
                  editing={isEditingMetrics}
                  onChange={(v) => {
                    const newStats = {...metaData.sucursales, [activeSucursal]: {...currentStats, metaLeads: v}};
                    setMetaData({...metaData, sucursales: newStats});
                  }}
                />
                <MetricCard 
                  label="Presupuesto" 
                  value={`$${(currentStats.budget || 0).toLocaleString()}`} 
                  icon={<DollarSign size={24} className="text-emerald-500"/>}
                  editing={isEditingMetrics}
                  isCurrency
                  onChange={(v) => {
                    const newStats = {...metaData.sucursales, [activeSucursal]: {...currentStats, budget: v}};
                    setMetaData({...metaData, sucursales: newStats});
                  }}
                />
                <MetricCard 
                  label="Gasto Real" 
                  value={`$${(currentStats.spent || 0).toLocaleString()}`} 
                  subtext={`${Math.round((currentStats.spent / (currentStats.budget || 1)) * 100)}% de uso`}
                  icon={<LayoutDashboard size={24} className="text-purple-500"/>}
                  editing={isEditingMetrics}
                  isCurrency
                  onChange={(v) => {
                    const newStats = {...metaData.sucursales, [activeSucursal]: {...currentStats, spent: v}};
                    setMetaData({...metaData, sucursales: newStats});
                  }}
                />
              </div>

              {/* El resto se mantiene global o similar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                <ChecklistCol title="Awareness" items={metaData.checklists.awareness} color="border-l-4 border-blue-500" role={role} onUpdate={(items) => {
                  const newMeta = { ...metaData, checklists: { ...metaData.checklists, awareness: items }};
                  setMetaData(newMeta); saveData({ metaData: newMeta, onlyChecklist: true });
                }} />
                <ChecklistCol title="Prospección" items={metaData.checklists.prospeccion} color="border-l-4 border-emerald-500" role={role} onUpdate={(items) => {
                  const newMeta = { ...metaData, checklists: { ...metaData.checklists, prospeccion: items }};
                  setMetaData(newMeta); saveData({ metaData: newMeta, onlyChecklist: true });
                }} />
                <ChecklistCol title="Retargeting" items={metaData.checklists.retargeting} color="border-l-4 border-purple-500" role={role} onUpdate={(items) => {
                  const newMeta = { ...metaData, checklists: { ...metaData.checklists, retargeting: items }};
                  setMetaData(newMeta); saveData({ metaData: newMeta, onlyChecklist: true });
                }} />
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-800 ml-2">Artes en Google Drive</h3>
                <div className="grid grid-cols-1 gap-6">
                   <DriveCarousel title="Awareness" folderId={metaData.drive.awareness} isAdmin={role === 'admin'} onLink={(id) => {
                      const newMeta = {...metaData, drive: {...metaData.drive, awareness: id}};
                      setMetaData(newMeta); saveData({ metaData: newMeta });
                   }} />
                   <DriveCarousel title="Prospección" folderId={metaData.drive.prospeccion} isAdmin={role === 'admin'} onLink={(id) => {
                      const newMeta = {...metaData, drive: {...metaData.drive, prospeccion: id}};
                      setMetaData(newMeta); saveData({ metaData: newMeta });
                   }} />
                   <DriveCarousel title="Retargeting" folderId={metaData.drive.retargeting} isAdmin={role === 'admin'} onLink={(id) => {
                      const newMeta = {...metaData, drive: {...metaData.drive, retargeting: id}};
                      setMetaData(newMeta); saveData({ metaData: newMeta });
                   }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eventos' && (
            <div className="animate-in slide-in-from-right duration-500">
               <h2 className="text-4xl font-black text-slate-800 mb-8">Gestión de Eventos</h2>
               <div className="grid grid-cols-1 gap-8">
                {eventos.map(ev => <EventCard key={ev.id} ev={ev} role={role} onUpdate={(u) => {
                  const newEvs = eventos.map(e => e.id === ev.id ? u : e);
                  setEventos(newEvs); saveData({ eventos: newEvs, onlyChecklist: true });
                }} onDelete={() => {
                  const newEvs = eventos.filter(e => e.id !== ev.id);
                  setEventos(newEvs); saveData({ eventos: newEvs });
                }} />)}
                {role === 'admin' && (
                   <button onClick={() => {
                      const n = prompt('Nombre del evento:');
                      if(n) {
                        const newEvs = [...eventos, { id: Date.now(), nombre: n, fecha: 'Abr 2026', tareas: [], gastos: [] }];
                        setEventos(newEvs); saveData({ eventos: newEvs });
                      }
                   }} className="w-full py-12 border-4 border-dashed border-slate-200 rounded-[3rem] text-slate-300 font-black uppercase tracking-widest hover:border-blue-400 hover:text-blue-400 transition-all flex flex-col items-center gap-4">
                     <Plus size={40}/> Crear Nuevo Evento
                   </button>
                )}
               </div>
            </div>
          )}

          {activeTab === 'express' && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right duration-500">
               <h2 className="text-4xl font-black text-slate-800">Tareas Express</h2>
               <div className="relative">
                 <input 
                  className="w-full p-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="¿Qué falta por resolver hoy?"
                  onKeyDown={e => {
                    if(e.key === 'Enter' && e.currentTarget.value) {
                      const val = e.currentTarget.value;
                      const newTask = { id: Date.now(), text: val, entry: 'Hoy', done: false, priority: 'Alta' };
                      const newExp = [...express, newTask];
                      setExpress(newExp); saveData({ express: newExp, onlyChecklist: true });
                      e.currentTarget.value = '';
                    }
                  }}
                 />
                 <Zap className="absolute right-8 top-8 text-amber-400" size={30}/>
               </div>
               <div className="space-y-4">
                 {express.map(t => (
                   <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group">
                     <div className="flex items-center gap-6">
                       <button onClick={() => {
                         const newE = express.map(et => et.id === t.id ? {...et, done: !et.done, exit: !et.done ? 'Ahora' : null} : et);
                         setExpress(newE); saveData({ express: newE, onlyChecklist: true });
                       }}>
                         {t.done ? <CheckCircle2 size={28} className="text-blue-500"/> : <Circle size={28} className="text-slate-100"/>}
                       </button>
                       <span className={`text-lg font-bold ${t.done ? 'text-slate-200 line-through' : 'text-slate-700'}`}>{t.text}</span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'insumos' && (
             <div className="space-y-8 animate-in slide-in-from-right duration-500">
               <h2 className="text-4xl font-black text-slate-800">Insumos y Sucursales</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {insumos.map(i => <InsumoCard key={i.id} item={i} role={role} onUpdate={(u) => {
                   const newI = insumos.map(ins => ins.id === i.id ? u : ins);
                   setInsumos(newI); saveData({ insumos: newI });
                 }} />)}
               </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function LoginButton({ icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-5 p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-slate-200 hover:scale-[1.02] transition-all group text-left">
      <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-50 group-hover:bg-blue-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <div>
        <h3 className="font-black text-slate-800 text-lg">{title}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{desc}</p>
      </div>
    </button>
  );
}

function NavItem({ active, icon, label, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
      {icon} {label}
    </button>
  );
}

function SucursalTab({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-8 py-3 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
      {label}
    </button>
  );
}

function MetricCard({ label, value, subtext, icon, editing, onChange, isCurrency }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-6">
        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">{icon}</div>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{label}</span>
        {editing ? (
          <div className="flex items-center gap-1 border-b-2 border-blue-500 bg-slate-50 rounded-lg p-2">
            {isCurrency && <span className="font-black text-slate-400">$</span>}
            <input type="number" className="w-full font-black text-xl text-slate-800 bg-transparent outline-none" defaultValue={typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value} onChange={e => onChange(parseFloat(e.target.value) || 0)} />
          </div>
        ) : (
          <div className="text-3xl font-black text-slate-800 tracking-tighter">{value}</div>
        )}
        {subtext && <p className="text-[10px] font-bold text-slate-400 uppercase">{subtext}</p>}
      </div>
    </div>
  );
}

function ChecklistCol({ title, items, color, onUpdate, role }) {
  const [input, setInput] = useState('');
  return (
    <div className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm ${color}`}>
      <div className="flex justify-between items-center mb-8">
        <h4 className="font-black text-xs text-slate-800 uppercase tracking-[0.2em]">{title}</h4>
        <span className="bg-slate-50 text-[10px] font-black text-slate-400 px-3 py-1.5 rounded-full border border-slate-100">{items?.length ? items.filter(i => i.done).length : 0}/{items?.length || 0}</span>
      </div>
      <div className="space-y-5">
        {items?.map(i => (
          <div key={i.id} className="flex items-center gap-4 group">
            <button onClick={() => onUpdate(items.map(it => it.id === i.id ? {...it, done: !it.done} : it))}>
              {i.done ? <CheckCircle2 size={22} className="text-blue-500"/> : <Circle size={22} className="text-slate-100 group-hover:text-blue-200 transition-colors"/>}
            </button>
            <span className={`text-sm font-bold flex-1 transition-all ${i.done ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{i.text}</span>
          </div>
        ))}
        {role === 'admin' && (
          <div className="flex gap-2 pt-6 mt-4 border-t border-slate-50">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Nueva tarea..." className="flex-1 bg-slate-50 p-4 rounded-2xl text-[10px] font-bold border border-slate-100 outline-none focus:bg-white" onKeyDown={e => {
              if(e.key === 'Enter' && input) { onUpdate([...(items || []), { id: Date.now(), text: input, done: false }]); setInput(''); }
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

function DriveCarousel({ title, folderId, onLink, isAdmin }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState(folderId || '');

  useEffect(() => {
    if(folderId) {
      setLoading(true);
      fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,thumbnailLink,webContentLink)&key=${DRIVE_API_KEY}`)
        .then(res => res.json())
        .then(data => { if(data.files) setFiles(data.files); setLoading(false); }).catch(() => setLoading(false));
    } else {
        setFiles([]);
    }
  }, [folderId]);

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-3"><ImageIcon className="text-blue-500"/> {title}</h4>
      </div>
      {isAdmin && (
        <div className="flex gap-3">
          <input className="flex-1 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black outline-none tracking-tight" placeholder="URL de Carpeta Drive" value={url} onChange={e => setUrl(e.target.value)} />
          <button onClick={() => { const id = url.includes('folders/') ? url.split('folders/')[1].split('?')[0] : url; onLink(id); }} className="bg-slate-800 text-white px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200">Enlazar</button>
        </div>
      )}
      {loading ? ( <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div> ) : files.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {files.map(f => (
            <div key={f.id} className="aspect-square bg-slate-50 rounded-[2rem] overflow-hidden relative group border border-slate-100">
              {f.thumbnailLink ? <img src={f.thumbnailLink} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-slate-300 uppercase">{f.name.substring(0,8)}</div>}
              <a href={f.webContentLink} target="_blank" className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><ExternalLink className="text-white" size={24} /></a>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-200 gap-4">
          <FolderOpen size={44} className="opacity-20" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-30">No hay contenido vinculado</span>
        </div>
      )}
    </div>
  );
}

function EventCard({ ev, onUpdate, onDelete, role }) {
  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-blue-100"><Calendar size={32}/></div>
          <div>
            <h4 className="text-3xl font-black text-slate-800">{ev.nombre}</h4>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{ev.fecha}</p>
          </div>
        </div>
        {role === 'admin' && <button onClick={onDelete} className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 size={24}/></button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100/50 space-y-6">
            <h5 className="font-black text-xs uppercase tracking-widest flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500"/> Logística</h5>
            <div className="space-y-4">
               {ev.tareas?.map((t, i) => (
                 <div key={i} className="flex items-center gap-4">
                   <button onClick={() => onUpdate({...ev, tareas: ev.tareas.map((tt, idx) => idx === i ? {...tt, done: !tt.done} : tt)})}>
                     {t.done ? <CheckCircle2 size={22} className="text-blue-500"/> : <Circle size={22} className="text-slate-200"/>}
                   </button>
                   <span className={`text-sm font-bold ${t.done ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{t.text}</span>
                 </div>
               ))}
            </div>
         </div>
         <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100/50 space-y-6">
            <h5 className="font-black text-xs uppercase tracking-widest flex items-center gap-3"><DollarSign size={18} className="text-emerald-500"/> Gastos</h5>
            <div className="space-y-4">
               {ev.gastos?.map((g, i) => (
                 <div key={i} className="bg-white p-5 rounded-3xl flex justify-between items-center border border-slate-100 shadow-sm">
                   <span className="text-[10px] font-black text-slate-400 uppercase">{g.text}</span>
                   <span className="text-sm font-black text-slate-800">${g.costo.toLocaleString()}</span>
                 </div>
               ))}
               <div className="flex justify-between p-4 mt-4 border-t border-slate-200 pt-6">
                 <span className="text-[10px] font-black text-slate-300 uppercase">Total Estimado</span>
                 <span className="text-xl font-black text-slate-800">${ev.gastos?.reduce((a, b) => a + b.costo, 0).toLocaleString() || 0}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function InsumoCard({ item, role, onUpdate }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-100 transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between mb-8">
        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-slate-300"><Package size={24}/></div>
        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">Activo</div>
      </div>
      <div className="space-y-2 mb-8">
        <h5 className="text-xl font-black text-slate-800">{item.nombre}</h5>
        <div className="flex items-center gap-2 text-slate-300">
           <MapPin size={12}/>
           <span className="text-[10px] font-bold uppercase tracking-widest">{item.sucursal}</span>
        </div>
      </div>
      <div className="flex justify-between items-end">
         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Ciclo: {item.dias} Días
         </div>
         {role === 'admin' && (
           <button onClick={() => onUpdate({...item, lastDate: new Date().toISOString()})} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Renovar</button>
         )}
      </div>
    </div>
  );
}
