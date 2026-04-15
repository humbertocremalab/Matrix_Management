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
  Image as ImageIcon,
  Loader2,
  Lock,
  User as UserIcon,
  ShieldCheck
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
  const [role, setRole] = useState(null); // 'admin' o 'user'
  const [activeTab, setActiveTab] = useState('meta');
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Estados de datos
  const [metaData, setMetaData] = useState({
    metrics: { leads: 145, metaLeads: 200, budget: 15000, spent: 8750 },
    checklists: {
      awareness: [],
      prospeccion: [],
      retargeting: []
    },
    drive: { awareness: '', prospeccion: '', retargeting: '' }
  });

  const [eventos, setEventos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [express, setExpress] = useState([]);

  // Auth & Role Check
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
      // Al iniciar sesión de forma anónima o con token, 
      // recuperamos el rol guardado en localStorage para esta demo
      const savedRole = localStorage.getItem('app_role');
      if (savedRole) setRole(savedRole);
    });
  }, []);

  // Sync Firestore
  useEffect(() => {
    if (!user || !role) return;
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'main_data');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.metaData) setMetaData(data.metaData);
        if (data.eventos) setEventos(data.eventos);
        if (data.insumos) setInsumos(data.insumos);
        if (data.express) setExpress(data.express);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching data:", err);
      setLoading(false);
    });
  }, [user, role]);

  const saveData = async (updates) => {
    if (role !== 'admin' && !updates.onlyChecklist) return; // Protección básica
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'main_data');
    await setDoc(docRef, {
      metaData, eventos, insumos, express, ...updates
    }, { merge: true });
  };

  const handleLogin = (selectedRole, pass) => {
    // Simulación de contraseñas para la demo
    const passwords = { admin: 'admin123', user: 'user123' };
    if (pass === passwords[selectedRole]) {
      setRole(selectedRole);
      localStorage.setItem('app_role', selectedRole);
      setLoginError('');
    } else {
      setLoginError('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem('app_role');
    signOut(auth);
  };

  // Pantalla de Login
  if (!role) return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-10 border border-slate-100 space-y-8 animate-in zoom-in duration-300">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-blue-600 rounded-3xl text-white mb-2 shadow-lg shadow-blue-100">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800">Bienvenido</h1>
          <p className="text-slate-400 font-medium">Selecciona tu perfil de acceso</p>
        </div>

        <div className="space-y-4">
          <LoginButton 
            icon={<ShieldCheck className="text-blue-600"/>} 
            title="Administrador" 
            desc="Control total de métricas y gestión" 
            onClick={() => {
              const p = prompt('Contraseña de Admin (admin123):');
              if(p) handleLogin('admin', p);
            }}
          />
          <LoginButton 
            icon={<UserIcon className="text-emerald-600"/>} 
            title="Usuario" 
            desc="Solo visualización y checklists" 
            onClick={() => {
              const p = prompt('Contraseña de Usuario (user123):');
              if(p) handleLogin('user', p);
            }}
          />
          {loginError && <p className="text-center text-rose-500 text-xs font-bold uppercase tracking-widest">{loginError}</p>}
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando Matrix...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Account</h1>
            <p className="text-xs text-slate-400 uppercase font-black tracking-tighter">Matrix Hub</p>
          </div>
        </div>

        <div className="px-6 mb-6">
           <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${role === 'admin' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
              {role === 'admin' ? <ShieldCheck size={12}/> : <UserIcon size={12}/>}
              <span className="text-[10px] font-black uppercase tracking-widest">{role}</span>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem active={activeTab === 'meta'} icon={<Zap size={18}/>} label="Embudo Meta" onClick={() => setActiveTab('meta')} />
          <NavItem active={activeTab === 'eventos'} icon={<Calendar size={18}/>} label="Eventos" onClick={() => setActiveTab('eventos')} />
          <NavItem active={activeTab === 'insumos'} icon={<Package size={18}/>} label="Insumos" onClick={() => setActiveTab('insumos')} />
          <NavItem active={activeTab === 'express'} icon={<Zap size={18}/>} label="Express" onClick={() => setActiveTab('express')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all group">
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> 
            <span className="text-sm font-bold">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50">
         <MobileIcon active={activeTab === 'meta'} icon={<Zap/>} onClick={() => setActiveTab('meta')} />
         <MobileIcon active={activeTab === 'eventos'} icon={<Calendar/>} onClick={() => setActiveTab('eventos')} />
         <MobileIcon active={activeTab === 'insumos'} icon={<Package/>} onClick={() => setActiveTab('insumos')} />
         <MobileIcon active={activeTab === 'express'} icon={<Zap/>} onClick={() => setActiveTab('express')} />
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          
          {activeTab === 'meta' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Embudo Meta</h2>
                  <p className="text-slate-500 mt-1">Gestión estratégica de leads y pauta</p>
                </div>
                {role === 'admin' && (
                  <button 
                    onClick={() => {
                      if (isEditingMetrics) saveData({ metaData });
                      setIsEditingMetrics(!isEditingMetrics);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 transition-all"
                  >
                    {isEditingMetrics ? <><Save size={16}/> Guardar</> : <><Edit2 size={16}/> Editar Métricas</>}
                  </button>
                )}
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard 
                  label="Leads Generados" 
                  value={metaData.metrics.leads} 
                  icon={<UsersIcon color="bg-blue-50 text-blue-600" />}
                  editing={isEditingMetrics}
                  onChange={(v) => setMetaData({...metaData, metrics: {...metaData.metrics, leads: v}})}
                />
                <MetricCard 
                  label="Meta de Leads" 
                  value={metaData.metrics.metaLeads} 
                  subtext={`${Math.round((metaData.metrics.leads/metaData.metrics.metaLeads)*100)}% alcanzado`}
                  icon={<TargetIcon color="bg-emerald-50 text-emerald-600" />}
                  editing={isEditingMetrics}
                  onChange={(v) => setMetaData({...metaData, metrics: {...metaData.metrics, metaLeads: v}})}
                />
                <MetricCard 
                  label="Presupuesto" 
                  value={`$${metaData.metrics.budget.toLocaleString()}`} 
                  icon={<MoneyIcon color="bg-indigo-50 text-indigo-600" />}
                  editing={isEditingMetrics}
                  isCurrency
                  onChange={(v) => setMetaData({...metaData, metrics: {...metaData.metrics, budget: v}})}
                />
                <MetricCard 
                  label="Gasto" 
                  value={`$${metaData.metrics.spent.toLocaleString()}`} 
                  subtext={`${Math.round((metaData.metrics.spent/metaData.metrics.budget)*100)}% usado`}
                  icon={<ChartIcon color="bg-amber-50 text-amber-600" />}
                  editing={isEditingMetrics}
                  isCurrency
                  onChange={(v) => setMetaData({...metaData, metrics: {...metaData.metrics, spent: v}})}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg">Checklist del Embudo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ChecklistCol 
                    title="Awareness" 
                    items={metaData.checklists.awareness || []} 
                    color="border-l-4 border-blue-500"
                    role={role}
                    onUpdate={(items) => {
                      const newMeta = { ...metaData, checklists: { ...metaData.checklists, awareness: items }};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta, onlyChecklist: true });
                    }}
                  />
                  <ChecklistCol 
                    title="Prospección" 
                    items={metaData.checklists.prospeccion || []} 
                    color="border-l-4 border-emerald-500"
                    role={role}
                    onUpdate={(items) => {
                      const newMeta = { ...metaData, checklists: { ...metaData.checklists, prospeccion: items }};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta, onlyChecklist: true });
                    }}
                  />
                  <ChecklistCol 
                    title="Retargeting" 
                    items={metaData.checklists.retargeting || []} 
                    color="border-l-4 border-purple-500"
                    role={role}
                    onUpdate={(items) => {
                      const newMeta = { ...metaData, checklists: { ...metaData.checklists, retargeting: items }};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta, onlyChecklist: true });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold text-lg">Artes del Embudo (Google Drive)</h3>
                <div className="space-y-6">
                  <DriveCarousel 
                    title="Awareness" 
                    folderId={metaData.drive.awareness} 
                    isAdmin={role === 'admin'}
                    onLink={(id) => {
                      const newMeta = {...metaData, drive: {...metaData.drive, awareness: id}};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                  />
                  <DriveCarousel 
                    title="Prospección" 
                    folderId={metaData.drive.prospeccion} 
                    isAdmin={role === 'admin'}
                    onLink={(id) => {
                      const newMeta = {...metaData, drive: {...metaData.drive, prospeccion: id}};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                  />
                  <DriveCarousel 
                    title="Retargeting" 
                    folderId={metaData.drive.retargeting} 
                    isAdmin={role === 'admin'}
                    onLink={(id) => {
                      const newMeta = {...metaData, drive: {...metaData.drive, retargeting: id}};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eventos' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <header className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Eventos</h2>
                  <p className="text-slate-500 mt-1">Control de logística y presupuesto de eventos</p>
                </div>
                {role === 'admin' && (
                  <button 
                    onClick={() => {
                      const nombre = prompt('Nombre del nuevo evento:');
                      if(nombre) {
                        const newEventos = [...eventos, { id: Date.now(), nombre, fecha: new Date().toLocaleDateString(), tareas: [], gastos: [] }];
                        setEventos(newEventos);
                        saveData({ eventos: newEventos });
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                  >
                    <Plus size={18}/> Nuevo Evento
                  </button>
                )}
              </header>

              <div className="grid grid-cols-1 gap-8">
                {eventos.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-300 font-bold uppercase tracking-widest text-[10px]">No hay eventos activos</div>
                ) : (
                  eventos.map(ev => (
                    <EventCard key={ev.id} ev={ev} role={role} onUpdate={(updated) => {
                      const newEventos = eventos.map(e => e.id === ev.id ? updated : e);
                      setEventos(newEventos);
                      saveData({ eventos: newEventos, onlyChecklist: true });
                    }} onDelete={() => {
                      if(confirm('¿Seguro que deseas eliminar este evento?')) {
                        const newEventos = eventos.filter(e => e.id !== ev.id);
                        setEventos(newEventos);
                        saveData({ eventos: newEventos });
                      }
                    }} />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'insumos' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <header className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Insumos y Renovaciones</h2>
                  <p className="text-slate-500 mt-1">Inventario de material impreso en sucursales</p>
                </div>
                {role === 'admin' && (
                  <button 
                    onClick={() => {
                      const nombre = prompt('Nombre del material:');
                      if(nombre) {
                        const newInsumos = [...insumos, { id: Date.now(), nombre, sucursal: 'Sucursal General', dias: 30, lastDate: new Date().toISOString() }];
                        setInsumos(newInsumos);
                        saveData({ insumos: newInsumos });
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                  >
                    <Plus size={18}/> Registrar Material
                  </button>
                )}
              </header>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insumos.length === 0 && <div className="col-span-full py-20 text-center text-slate-300 font-black text-xs uppercase tracking-widest">Sin insumos registrados</div>}
                {insumos.map(ins => (
                  <InsumoCard key={ins.id} item={ins} role={role} onUpdate={(updated) => {
                    const newInsumos = insumos.map(i => i.id === ins.id ? updated : i);
                    setInsumos(newInsumos);
                    saveData({ insumos: newInsumos });
                  }} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'express' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500 max-w-3xl">
              <header>
                <h2 className="text-3xl font-bold tracking-tight">Tareas Express</h2>
                <p className="text-slate-500 mt-1">Atención rápida de requerimientos diarios</p>
              </header>
              
              <div className="flex gap-2">
                <input 
                  id="newExpress"
                  type="text" 
                  placeholder="Escribe una nueva tarea y presiona Enter..." 
                  className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm" 
                  onKeyDown={e => {
                    if(e.key === 'Enter' && e.currentTarget.value) {
                      const val = e.currentTarget.value;
                      const newExpress = [...express, { id: Date.now(), text: val, entry: new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}), done: false, priority: 'Normal' }];
                      setExpress(newExpress);
                      saveData({ express: newExpress, onlyChecklist: true });
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              <div className="space-y-3">
                {express.length === 0 && <div className="text-center py-10 text-slate-300 font-bold uppercase text-[10px] tracking-widest">Bandeja de tareas vacía</div>}
                {express.map(task => (
                  <ExpressTask key={task.id} task={task} onToggle={() => {
                    const newExp = express.map(t => t.id === task.id ? {...t, done: !t.done, exit: !t.done ? new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}) : null} : t);
                    setExpress(newExp);
                    saveData({ express: newExp, onlyChecklist: true });
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- LOGIN COMPONENTS ---

function LoginButton({ icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:scale-[1.02] transition-all group text-left">
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h3 className="font-black text-slate-800">{title}</h3>
        <p className="text-xs font-bold text-slate-400">{desc}</p>
      </div>
    </button>
  );
}

// --- SHARED COMPONENTS ---

function NavItem({ active, icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all font-bold ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
    >
      {icon} <span className="text-sm">{label}</span>
    </button>
  );
}

function MobileIcon({ active, icon, onClick }) {
  return (
    <button onClick={onClick} className={`p-2 rounded-lg ${active ? 'text-blue-600' : 'text-slate-300'}`}>
      {React.cloneElement(icon, { size: 24 })}
    </button>
  );
}

function MetricCard({ label, value, subtext, icon, editing, onChange }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-start">
      <div className="space-y-1 flex-1">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">{label}</span>
        {editing ? (
          <input 
            type="number" 
            className="w-full text-xl font-black text-slate-800 border-b-2 border-blue-500 outline-none bg-slate-50 px-1" 
            defaultValue={typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value} 
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
          />
        ) : (
          <div className="text-2xl font-black text-slate-800">{value}</div>
        )}
        {subtext && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{subtext}</p>}
      </div>
      <div className="ml-4">{icon}</div>
    </div>
  );
}

function ChecklistCol({ title, items, color, onUpdate, role }) {
  const [input, setInput] = useState('');
  return (
    <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm ${color}`}>
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-black text-xs text-slate-800 uppercase tracking-widest">{title}</h4>
        <span className="text-[10px] font-black bg-slate-50 text-slate-400 px-2.5 py-1 rounded-full border border-slate-100">
          {items.filter(i => i.done).length}/{items.length}
        </span>
      </div>
      <div className="space-y-4 min-h-[120px]">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <button onClick={() => onUpdate(items.map(i => i.id === item.id ? {...i, done: !i.done} : i))}>
              {item.done ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} className="text-slate-200" />}
            </button>
            <span className={`text-sm font-bold flex-1 transition-all ${item.done ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{item.text}</span>
          </div>
        ))}
        {role === 'admin' && (
          <div className="flex gap-2 mt-6 pt-4 border-t border-slate-50">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Añadir..." 
              className="flex-1 text-[11px] font-bold p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white"
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
            }} className="p-2 text-blue-500 hover:scale-110 transition-transform"><Plus size={18}/></button>
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
        .then(data => {
          if(data.files) setFiles(data.files);
          setLoading(false);
        }).catch(() => setLoading(false));
    }
  }, [folderId]);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest">{title}</h4>
      </div>
      
      {isAdmin && (
        <div className="flex gap-2">
          <input 
            className="flex-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black outline-none focus:ring-2 focus:ring-blue-100 transition-all uppercase tracking-tighter" 
            placeholder="URL o ID de la carpeta en Drive"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          <button 
            onClick={() => {
              const id = url.includes('folders/') ? url.split('folders/')[1].split('?')[0] : url;
              onLink(id);
            }}
            className="bg-slate-800 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-100"
          >
            Vincular
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
      ) : files.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {files.map(f => (
            <div key={f.id} className="min-w-[140px] aspect-square bg-slate-50 rounded-3xl overflow-hidden relative group border border-slate-100">
              {f.thumbnailLink ? <img src={f.thumbnailLink} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50"><ImageIcon className="text-slate-200 mb-2"/> <span className="text-[8px] font-black text-slate-300 uppercase">{f.name.substring(0,10)}</span></div>}
              <a href={f.webContentLink} target="_blank" className="absolute inset-0 bg-blue-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <ExternalLink className="text-white" size={20} />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 border-2 border-dashed border-slate-50 rounded-[2rem] flex flex-col items-center justify-center text-slate-200">
          <FolderOpen size={40} className="mb-4 opacity-30" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Sin carpeta vinculada</p>
        </div>
      )}
    </div>
  );
}

function EventCard({ ev, onUpdate, onDelete, role }) {
  const [task, setTask] = useState('');
  const [act, setAct] = useState('');
  const [price, setPrice] = useState('');

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100"><Calendar size={28}/></div>
          <div>
            <h4 className="text-2xl font-black text-slate-800">{ev.nombre}</h4>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{ev.fecha}</p>
          </div>
        </div>
        {role === 'admin' && (
          <button onClick={onDelete} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 size={20}/></button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50 space-y-6">
          <div className="flex items-center justify-between">
            <h5 className="font-black text-xs uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Checkpoints</h5>
            <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-slate-400 border border-slate-100">
              {ev.tareas.filter(t => t.done).length}/{ev.tareas.length}
            </span>
          </div>
          <div className="space-y-4">
             {ev.tareas.map((t, idx) => (
               <div key={idx} className="flex items-center gap-3">
                 <button onClick={() => onUpdate({...ev, tareas: ev.tareas.map((tt, i) => i === idx ? {...tt, done: !tt.done} : tt)})}>
                   {t.done ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} className="text-slate-200" />}
                 </button>
                 <span className={`text-sm font-bold flex-1 ${t.done ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{t.text}</span>
               </div>
             ))}
             <div className="flex gap-2 pt-4">
                <input className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 text-xs font-bold outline-none" placeholder="Tarea..." value={task} onChange={e => setTask(e.target.value)} onKeyDown={e => {
                  if(e.key === 'Enter' && task) {
                    onUpdate({...ev, tareas: [...ev.tareas, { text: task, done: false }]});
                    setTask('');
                  }
                }}/>
                <button onClick={() => { if(task) { onUpdate({...ev, tareas: [...ev.tareas, { text: task, done: false }]}); setTask(''); } }} className="bg-white p-3 border border-slate-100 rounded-2xl text-blue-500"><Plus size={18}/></button>
             </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50 space-y-6">
          <div className="flex items-center justify-between">
            <h5 className="font-black text-xs uppercase tracking-widest flex items-center gap-2"><DollarSign size={16} className="text-emerald-500"/> Presupuesto</h5>
            <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-emerald-600 border border-emerald-100 shadow-sm">
              ${ev.gastos.reduce((a, b) => a + (parseFloat(b.costo) || 0), 0).toLocaleString()}
            </span>
          </div>
          <div className="space-y-3">
             {ev.gastos.map((g, idx) => (
               <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{g.text}</span>
                 <span className="text-sm font-black text-slate-800">${g.costo.toLocaleString()}</span>
               </div>
             ))}
             {role === 'admin' && (
               <div className="flex gap-2 pt-2">
                  <input className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 text-xs font-bold outline-none" placeholder="Rubro..." value={act} onChange={e => setAct(e.target.value)}/>
                  <input className="w-20 bg-white p-3.5 rounded-2xl border border-slate-100 text-xs font-bold outline-none" placeholder="$" value={price} onChange={e => setPrice(e.target.value)}/>
                  <button onClick={() => {
                    if(act && price) {
                      onUpdate({...ev, gastos: [...ev.gastos, { text: act, costo: parseFloat(price) }]});
                      setAct(''); setPrice('');
                    }
                  }} className="bg-slate-800 text-white px-4 rounded-2xl"><Plus size={18}/></button>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InsumoCard({ item, role, onUpdate }) {
  const isVencido = false; // Logic simplified
  
  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all">
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Package size={22}/></div>
          <div>
            <h5 className="font-black text-slate-800 leading-none mb-1">{item.nombre}</h5>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Material Sede</p>
          </div>
        </div>
        <button className="text-slate-200 hover:text-slate-400"><MoreHorizontal size={20}/></button>
      </div>
      
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Clock size={12} className="text-blue-500"/> {item.sucursal}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Calendar size={12} className="text-blue-500"/> Ciclo: {item.dias} Días
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${isVencido ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
          Activo
        </div>
        {role === 'admin' && (
          <button 
            onClick={() => onUpdate({...item, lastDate: new Date().toISOString()})}
            className="text-[10px] font-black text-slate-300 hover:text-blue-600 uppercase transition-colors"
          >
            Renovar
          </button>
        )}
      </div>
    </div>
  );
}

function ExpressTask({ task, onToggle }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group animate-in slide-in-from-left duration-300">
      <div className="flex items-center gap-5">
        <button onClick={onToggle} className="hover:scale-110 transition-transform">
          {task.done ? <CheckCircle2 size={26} className="text-emerald-500" /> : <Circle size={26} className="text-slate-100" />}
        </button>
        <div>
          <h5 className={`text-base font-black transition-all ${task.done ? 'text-slate-200 line-through' : 'text-slate-700'}`}>{task.text}</h5>
          <div className="flex gap-4 mt-1.5 items-center">
            <span className="bg-slate-50 text-slate-400 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">{task.priority}</span>
            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Entrada: {task.entry}</span>
            {task.exit && (
              <>
                <div className="w-1 h-1 bg-emerald-200 rounded-full"></div>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Cierre: {task.exit}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function UsersIcon({color}) { return <div className={`p-3 rounded-2xl ${color} shadow-sm`}><LayoutDashboard size={20}/></div> }
function TargetIcon({color}) { return <div className={`p-3 rounded-2xl ${color} shadow-sm`}><Zap size={20}/></div> }
function MoneyIcon({color}) { return <div className={`p-3 rounded-2xl ${color} shadow-sm`}><DollarSign size={20}/></div> }
function ChartIcon({color}) { return <div className={`p-3 rounded-2xl ${color} shadow-sm`}><LayoutDashboard size={20}/></div> }
