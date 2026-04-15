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
  X,
  User,
  ShieldCheck,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

// Firebase
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

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

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'user'
  const [loginStep, setLoginStep] = useState('choice'); // 'choice' | 'loading'
  const [activeTab, setActiveTab] = useState('meta');
  const [loading, setLoading] = useState(true);
  
  // Estados de datos
  const [selectedBranch, setSelectedBranch] = useState('Monterrey');
  const [metaData, setMetaData] = useState({
    branches: {
      'Monterrey': { leads: 145, metaLeads: 200, budget: 15000, spent: 8750 },
      'Saltillo': { leads: 80, metaLeads: 120, budget: 10000, spent: 4200 },
      'CDMX': { leads: 210, metaLeads: 300, budget: 25000, spent: 18000 }
    },
    checklists: {
      awareness: [{ id: 1, text: 'Creativos de video listos', done: true }],
      prospeccion: [{ id: 2, text: 'Landing page optimizada', done: true }],
      retargeting: [{ id: 3, text: 'Audiencias creadas', done: false }]
    },
    drive: { awareness: '', prospeccion: '', retargeting: '' }
  });

  const [eventos, setEventos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [express, setExpress] = useState([]);
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);

  // Auth & Role
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
      if (u) {
        setUser(u);
        // En una app real, el rol vendría de Firestore. Aquí simulamos persistencia simple
        const savedRole = localStorage.getItem('app_role');
        if (savedRole) {
          setRole(savedRole);
          setLoginStep('ready');
        }
      }
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
    }, (err) => console.error("Firestore error:", err));
  }, [user, role]);

  const saveData = async (updates) => {
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'main_data');
    await setDoc(docRef, {
      metaData, eventos, insumos, express, ...updates
    }, { merge: true });
  };

  const handleLogin = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem('app_role', selectedRole);
    setLoginStep('ready');
  };

  const handleLogout = async () => {
    localStorage.removeItem('app_role');
    setRole(null);
    setLoginStep('choice');
    await signOut(auth);
  };

  // --- RENDERS ---

  if (!user || (role && loading)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-400 font-medium animate-pulse">Sincronizando datos...</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc] p-6">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-blue-100 p-10 space-y-8 border border-slate-100">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-200 mb-4">
              <LayoutDashboard size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Bienvenido al Panel</h1>
            <p className="text-slate-500 text-sm">Selecciona tu perfil de acceso para continuar</p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => handleLogin('admin')}
              className="w-full flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Administrador</p>
                  <p className="text-xs text-slate-400">Acceso total a edición y gestión</p>
                </div>
              </div>
              <ChevronDown className="-rotate-90 text-slate-300" size={20} />
            </button>

            <button 
              onClick={() => handleLogin('user')}
              className="w-full flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <User size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Usuario Operativo</p>
                  <p className="text-xs text-slate-400">Consulta y actualización básica</p>
                </div>
              </div>
              <ChevronDown className="-rotate-90 text-slate-300" size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 shrink-0">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-100">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <h1 className="font-black text-xl leading-none tracking-tight">MatrixHub</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Console v2.0</p>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-4">
          <NavItem active={activeTab === 'meta'} icon={<Zap size={18}/>} label="Embudo Meta" onClick={() => setActiveTab('meta')} />
          <NavItem active={activeTab === 'eventos'} icon={<Calendar size={18}/>} label="Eventos" onClick={() => setActiveTab('eventos')} />
          <NavItem active={activeTab === 'insumos'} icon={<Package size={18}/>} label="Insumos" onClick={() => setActiveTab('insumos')} />
          <NavItem active={activeTab === 'express'} icon={<Zap size={18}/>} label="Express" onClick={() => setActiveTab('express')} />
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-2xl">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${role === 'admin' ? 'bg-blue-600' : 'bg-emerald-500'}`}>
              {role === 'admin' ? <ShieldCheck size={20}/> : <User size={20}/>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{role === 'admin' ? 'Admin Matrix' : 'Operador'}</p>
              <p className="text-[10px] text-slate-400 uppercase font-black">{role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-bold text-sm">
            <LogOut size={18} /> <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-6xl mx-auto p-6 md:p-12">
          
          {/* TAB: META */}
          {activeTab === 'meta' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                  <h2 className="text-4xl font-black tracking-tight text-slate-900">Embudo Meta</h2>
                  <p className="text-slate-500 font-medium">Visualización de rendimiento por sucursal</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {['Monterrey', 'Saltillo', 'CDMX'].map(b => (
                      <button 
                        key={b}
                        onClick={() => setSelectedBranch(b)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedBranch === b ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  {role === 'admin' && (
                    <button 
                      onClick={() => {
                        if (isEditingMetrics) saveData({ metaData });
                        setIsEditingMetrics(!isEditingMetrics);
                      }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all border ${isEditingMetrics ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {isEditingMetrics ? <><Save size={16}/> Guardar</> : <><Edit2 size={16}/> Editar</>}
                    </button>
                  )}
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <MetricCard 
                  label="Leads Generados" 
                  value={metaData.branches[selectedBranch].leads} 
                  icon={<UsersIcon color="bg-blue-50 text-blue-600" />}
                  editing={isEditingMetrics}
                  onChange={(v) => setMetaData({...metaData, branches: {...metaData.branches, [selectedBranch]: {...metaData.branches[selectedBranch], leads: v}}})}
                />
                <MetricCard 
                  label="Meta de Leads" 
                  value={metaData.branches[selectedBranch].metaLeads} 
                  subtext={`${Math.round((metaData.branches[selectedBranch].leads / metaData.branches[selectedBranch].metaLeads) * 100)}% alcanzado`}
                  icon={<TargetIcon color="bg-emerald-50 text-emerald-600" />}
                  editing={isEditingMetrics}
                  onChange={(v) => setMetaData({...metaData, branches: {...metaData.branches, [selectedBranch]: {...metaData.branches[selectedBranch], metaLeads: v}}})}
                />
                <MetricCard 
                  label="Presupuesto" 
                  value={`$${metaData.branches[selectedBranch].budget.toLocaleString()}`} 
                  icon={<MoneyIcon color="bg-indigo-50 text-indigo-600" />}
                  editing={isEditingMetrics}
                  isCurrency
                  onChange={(v) => setMetaData({...metaData, branches: {...metaData.branches, [selectedBranch]: {...metaData.branches[selectedBranch], budget: v}}})}
                />
                <MetricCard 
                  label="Gasto" 
                  value={`$${metaData.branches[selectedBranch].spent.toLocaleString()}`} 
                  subtext={`${Math.round((metaData.branches[selectedBranch].spent / metaData.branches[selectedBranch].budget) * 100)}% usado`}
                  icon={<ChartIcon color="bg-amber-50 text-amber-600" />}
                  editing={isEditingMetrics}
                  isCurrency
                  onChange={(v) => setMetaData({...metaData, branches: {...metaData.branches, [selectedBranch]: {...metaData.branches[selectedBranch], spent: v}}})}
                />
              </div>

              <div className="space-y-6">
                <h3 className="font-black text-xl text-slate-800">Checklist Operativo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ChecklistCol title="Awareness" items={metaData.checklists.awareness} color="border-l-4 border-blue-500" 
                    onUpdate={(items) => {
                      const newM = { ...metaData, checklists: { ...metaData.checklists, awareness: items }};
                      setMetaData(newM); saveData({ metaData: newM });
                    }} 
                  />
                  <ChecklistCol title="Prospección" items={metaData.checklists.prospeccion} color="border-l-4 border-emerald-500"
                    onUpdate={(items) => {
                      const newM = { ...metaData, checklists: { ...metaData.checklists, prospeccion: items }};
                      setMetaData(newM); saveData({ metaData: newM });
                    }} 
                  />
                  <ChecklistCol title="Retargeting" items={metaData.checklists.retargeting} color="border-l-4 border-purple-500"
                    onUpdate={(items) => {
                      const newM = { ...metaData, checklists: { ...metaData.checklists, retargeting: items }};
                      setMetaData(newM); saveData({ metaData: newM });
                    }} 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-black text-xl text-slate-800">Recursos Creativos (Drive)</h3>
                <div className="grid grid-cols-1 gap-6">
                  <DriveCarousel title="Awareness" folderId={metaData.drive.awareness} onLink={(id) => {
                    const newM = {...metaData, drive: {...metaData.drive, awareness: id}};
                    setMetaData(newM); saveData({ metaData: newM });
                  }} />
                  <DriveCarousel title="Prospección" folderId={metaData.drive.prospeccion} onLink={(id) => {
                    const newM = {...metaData, drive: {...metaData.drive, prospeccion: id}};
                    setMetaData(newM); saveData({ metaData: newM });
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* TAB: EVENTOS */}
          {activeTab === 'eventos' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <header className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Eventos</h2>
                  <p className="text-slate-500 font-medium mt-1">Planificación y control de gastos directos</p>
                </div>
                {role === 'admin' && (
                  <button 
                    onClick={() => {
                      const n = prompt('Nombre del evento:');
                      if(n) {
                        const newE = [...eventos, { id: Date.now(), nombre: n, fecha: new Date().toLocaleDateString(), tareas: [], gastos: [] }];
                        setEventos(newE); saveData({ eventos: newE });
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-200 hover:scale-105 transition-all"
                  >
                    <Plus size={20}/> Nuevo Evento
                  </button>
                )}
              </header>

              <div className="space-y-10">
                {eventos.length === 0 ? (
                  <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 opacity-60">
                    <Calendar size={64} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">Sin eventos registrados</p>
                  </div>
                ) : (
                  eventos.map(ev => (
                    <EventCard 
                      key={ev.id} 
                      ev={ev} 
                      isAdmin={role === 'admin'}
                      onDelete={() => {
                        const newE = eventos.filter(e => e.id !== ev.id);
                        setEventos(newE); saveData({ eventos: newE });
                      }}
                      onUpdate={(upd) => {
                        const newE = eventos.map(e => e.id === ev.id ? upd : e);
                        setEventos(newE); saveData({ eventos: newE });
                      }} 
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: INSUMOS */}
          {activeTab === 'insumos' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <header className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Insumos y Stock</h2>
                  <p className="text-slate-500 font-medium">Control de renovaciones de material impreso</p>
                </div>
                {role === 'admin' && (
                  <button 
                    onClick={() => {
                      const n = prompt('Nombre del material:');
                      if(n) {
                        const newI = [...insumos, { id: Date.now(), nombre: n, sucursal: 'Monterrey', dias: 30, lastDate: new Date().toISOString() }];
                        setInsumos(newI); saveData({ insumos: newI });
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                  >
                    <Plus size={20}/> Agregar Material
                  </button>
                )}
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insumos.map(ins => (
                  <InsumoCard 
                    key={ins.id} 
                    item={ins} 
                    isAdmin={role === 'admin'}
                    onDelete={() => {
                      const newI = insumos.filter(i => i.id !== ins.id);
                      setInsumos(newI); saveData({ insumos: newI });
                    }}
                    onUpdate={(upd) => {
                      const newI = insumos.map(i => i.id === ins.id ? upd : i);
                      setInsumos(newI); saveData({ insumos: newI });
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB: EXPRESS */}
          {activeTab === 'express' && (
            <div className="space-y-10 animate-in slide-in-from-bottom duration-500 max-w-4xl mx-auto">
              <header className="text-center space-y-2">
                <h2 className="text-4xl font-black text-slate-900">Tareas Express</h2>
                <p className="text-slate-500 font-medium max-w-lg mx-auto">Pendientes rápidos y urgencias del día a día sin planificación previa</p>
              </header>

              <div className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-xl flex gap-3">
                <input 
                  id="newExpress"
                  type="text" 
                  placeholder="¿Qué hay que resolver hoy?" 
                  className="flex-1 p-5 rounded-2xl outline-none font-bold text-slate-700 placeholder:text-slate-300" 
                  onKeyDown={e => {
                    if(e.key === 'Enter') {
                      const val = e.currentTarget.value;
                      if(!val) return;
                      const newX = [{ id: Date.now(), text: val, entry: new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}), done: false, priority: 'Media' }, ...express];
                      setExpress(newX); saveData({ express: newX });
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const inp = document.getElementById('newExpress');
                    if(inp.value) {
                      const newX = [{ id: Date.now(), text: inp.value, entry: new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}), done: false, priority: 'Media' }, ...express];
                      setExpress(newX); saveData({ express: newX });
                      inp.value = '';
                    }
                  }}
                  className="bg-blue-600 text-white px-8 rounded-[1.5rem] font-black text-sm shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
                >
                  Agregar
                </button>
              </div>

              <div className="space-y-4">
                {express.map(task => (
                  <ExpressTask 
                    key={task.id} 
                    task={task} 
                    isAdmin={role === 'admin'}
                    onDelete={() => {
                      const newX = express.filter(t => t.id !== task.id);
                      setExpress(newX); saveData({ express: newX });
                    }}
                    onUpdate={(upd) => {
                      const newX = express.map(t => t.id === task.id ? upd : t);
                      setExpress(newX); saveData({ express: newX });
                    }}
                    onToggle={() => {
                      const newX = express.map(t => t.id === task.id ? {...t, done: !t.done, exit: !t.done ? new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}) : null} : t);
                      setExpress(newX); saveData({ express: newX });
                    }} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function NavItem({ active, icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-[1.25rem] transition-all font-bold ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-1' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
    >
      <div className={`${active ? 'text-white' : 'text-slate-400'}`}>{icon}</div>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function MetricCard({ label, value, subtext, icon, editing, onChange }) {
  return (
    <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-white transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
      </div>
      <div className="mt-6 space-y-1">
        {editing ? (
          <input 
            type="number" 
            className="w-full text-3xl font-black text-slate-900 border-b-4 border-blue-500 bg-transparent outline-none pb-1" 
            defaultValue={typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value} 
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
          />
        ) : (
          <h4 className="text-3xl font-black text-slate-900">{value}</h4>
        )}
        {subtext && <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{subtext}</p>}
      </div>
    </div>
  );
}

function ChecklistCol({ title, items, color, onUpdate }) {
  const [input, setInput] = useState('');
  return (
    <div className={`bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm ${color} relative overflow-hidden`}>
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-black text-slate-800 tracking-tight">{title}</h4>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full">
            {items.filter(i => i.done).length}/{items.length}
          </span>
        </div>
      </div>
      <div className="space-y-4 min-h-[140px]">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4 group/item">
            <button 
              onClick={() => onUpdate(items.map(i => i.id === item.id ? {...i, done: !i.done} : i))}
              className={`transition-all ${item.done ? 'text-blue-500 scale-110' : 'text-slate-200 hover:text-slate-400'}`}
            >
              {item.done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
            </button>
            <span className={`text-sm font-bold flex-1 transition-all ${item.done ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{item.text}</span>
            <button 
              onClick={() => onUpdate(items.filter(i => i.id !== item.id))}
              className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <div className="flex gap-2 pt-4">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Añadir paso..." 
            className="flex-1 text-xs p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
            onKeyDown={e => {
              if(e.key === 'Enter' && input) {
                onUpdate([...items, { id: Date.now(), text: input, done: false }]);
                setInput('');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

function EventCard({ ev, onUpdate, onDelete, isAdmin }) {
  const [task, setTask] = useState('');
  const [act, setAct] = useState('');
  const [price, setPrice] = useState('');

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 group/card relative overflow-hidden">
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner"><Calendar size={32}/></div>
          <div>
            <h4 className="text-3xl font-black text-slate-900 leading-none">{ev.nombre}</h4>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ev.fecha}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{ev.tareas.length} Tareas</span>
            </div>
          </div>
        </div>
        {isAdmin && (
          <button 
            onClick={() => {
              if(confirm('¿Seguro que deseas eliminar este evento?')) onDelete();
            }}
            className="p-4 bg-rose-50 text-rose-400 rounded-2xl hover:bg-rose-500 hover:text-white hover:rotate-6 transition-all shadow-sm"
          >
            <Trash2 size={24}/>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <h5 className="font-black text-slate-800 flex items-center gap-3"><CheckCircle2 size={20} className="text-blue-500"/> Tareas</h5>
            <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 shadow-sm border border-slate-50">
              {ev.tareas.filter(t => t.done).length}/{ev.tareas.length}
            </span>
          </div>
          <div className="space-y-4">
             {ev.tareas.map((t, idx) => (
               <div key={idx} className="flex items-center gap-4 p-3 hover:bg-white rounded-2xl transition-all group/item">
                 <button onClick={() => onUpdate({...ev, tareas: ev.tareas.map((tt, i) => i === idx ? {...tt, done: !tt.done} : tt)})}>
                   {t.done ? <CheckCircle2 size={24} className="text-blue-500" /> : <Circle size={24} className="text-slate-200" />}
                 </button>
                 <span className={`text-sm font-bold flex-1 ${t.done ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{t.text}</span>
                 <button onClick={() => onUpdate({...ev, tareas: ev.tareas.filter((_, i) => i !== idx)})} className="opacity-0 group-hover/item:opacity-100 text-rose-300 hover:text-rose-500"><X size={16}/></button>
               </div>
             ))}
             <div className="flex gap-2 pt-4">
                <input className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 text-sm font-bold outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20" placeholder="Nueva tarea..." value={task} onChange={e => setTask(e.target.value)} />
                <button onClick={() => { if(task) { onUpdate({...ev, tareas: [...ev.tareas, { text: task, done: false }]}); setTask(''); } }} className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-100"><Plus size={20}/></button>
             </div>
          </div>
        </div>

        <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <h5 className="font-black text-slate-800 flex items-center gap-3"><DollarSign size={20} className="text-amber-500"/> Gastos</h5>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Invertido</span>
              <span className="bg-white px-5 py-2 rounded-full text-sm font-black text-slate-800 shadow-sm border border-slate-50">
                ${ev.gastos.reduce((a, b) => a + (parseFloat(b.costo) || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="space-y-3">
             {ev.gastos.map((g, idx) => (
               <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-50 group/item">
                 <span className="text-sm font-black text-slate-600">{g.text}</span>
                 <div className="flex items-center gap-4">
                   <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">${g.costo.toLocaleString()}</span>
                   <button onClick={() => onUpdate({...ev, gastos: ev.gastos.filter((_, i) => i !== idx)})} className="opacity-0 group-hover/item:opacity-100 text-rose-300 hover:text-rose-500"><X size={16}/></button>
                 </div>
               </div>
             ))}
             <div className="flex flex-col gap-3 pt-4">
                <div className="flex gap-3">
                  <input className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 text-sm font-bold outline-none shadow-sm" placeholder="Concepto..." value={act} onChange={e => setAct(e.target.value)}/>
                  <input className="w-32 bg-white p-4 rounded-2xl border border-slate-100 text-sm font-bold outline-none shadow-sm" placeholder="$" type="number" value={price} onChange={e => setPrice(e.target.value)}/>
                </div>
                <button onClick={() => {
                  if(act && price) {
                    onUpdate({...ev, gastos: [...ev.gastos, { text: act, costo: parseFloat(price) }]});
                    setAct(''); setPrice('');
                  }
                }} className="w-full bg-white p-4 border-2 border-slate-200 rounded-2xl text-xs font-black uppercase text-slate-400 hover:bg-slate-50 transition-all">Añadir Gasto</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsumoCard({ item, isAdmin, onDelete, onUpdate }) {
  const [showMenu, setShowMenu] = useState(false);
  const daysLeft = 12; // Simulando
  const isVencido = daysLeft <= 0;
  
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group overflow-hidden hover:shadow-2xl transition-all">
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner"><Package size={28}/></div>
          <div>
            <h5 className="font-black text-slate-900 text-lg leading-tight">{item.nombre}</h5>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Material Impreso</p>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 rounded-xl transition-all ${showMenu ? 'bg-slate-100 text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}
          >
            <MoreHorizontal size={24}/>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-top-2">
              <button 
                onClick={() => {
                  const n = prompt('Nuevo nombre:', item.nombre);
                  if(n) onUpdate({...item, nombre: n});
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors text-left"
              >
                <Edit2 size={16}/> Editar material
              </button>
              <button 
                onClick={() => {
                  if(confirm('¿Eliminar material?')) onDelete();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors text-left"
              >
                <Trash2 size={16}/> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="space-y-1">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sucursal</p>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Clock size={14} className="text-slate-400"/> {item.sucursal}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Siguiente</p>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Calendar size={14} className="text-slate-400"/> 24 Abr 26
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight ${isVencido ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white'} shadow-md`}>
          {isVencido ? 'Vencido' : `${daysLeft}d restantes`}
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Ciclo</p>
          <p className="text-xs font-black text-slate-900">Cada {item.dias} días</p>
        </div>
      </div>
    </div>
  );
}

function ExpressTask({ task, onToggle, onDelete, onUpdate, isAdmin }) {
  const [isEditing, setIsEditing] = useState(false);
  const priorityColors = {
    'Alta': 'bg-rose-100 text-rose-600',
    'Media': 'bg-blue-100 text-blue-600',
    'Baja': 'bg-slate-100 text-slate-500'
  };

  return (
    <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all flex items-center justify-between group relative overflow-hidden ${task.done ? 'bg-slate-50/50' : ''}`}>
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <button 
          onClick={onToggle}
          className={`shrink-0 transition-all ${task.done ? 'text-emerald-500 scale-110' : 'text-slate-200 hover:text-slate-400'}`}
        >
          {task.done ? <CheckCircle2 size={32} /> : <Circle size={32} />}
        </button>
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input 
              autoFocus
              className="w-full text-lg font-black text-slate-800 bg-transparent outline-none border-b-2 border-blue-500"
              defaultValue={task.text}
              onBlur={(e) => {
                onUpdate({...task, text: e.target.value});
                setIsEditing(false);
              }}
              onKeyDown={e => {
                if(e.key === 'Enter') {
                  onUpdate({...task, text: e.currentTarget.value});
                  setIsEditing(false);
                }
              }}
            />
          ) : (
            <h4 
              className={`text-lg font-black truncate transition-all ${task.done ? 'text-slate-300 line-through' : 'text-slate-800'}`}
              onDoubleClick={() => isAdmin && setIsEditing(true)}
            >
              {task.text}
            </h4>
          )}
          
          <div className="flex items-center gap-4 mt-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={12}/> Entrada: {task.entry}
            </span>
            {task.exit && (
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 size={12}/> Salida: {task.exit}
              </span>
            )}
            <button 
              onClick={() => {
                if(!isAdmin) return;
                const next = task.priority === 'Alta' ? 'Baja' : task.priority === 'Baja' ? 'Media' : 'Alta';
                onUpdate({...task, priority: next});
              }}
              className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${priorityColors[task.priority || 'Media']}`}
            >
              Prioridad {task.priority || 'Media'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all ml-4">
        {isAdmin && (
          <>
            <button onClick={() => setIsEditing(true)} className="p-3 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={20}/></button>
            <button onClick={onDelete} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={20}/></button>
          </>
        )}
      </div>
    </div>
  );
}

function DriveCarousel({ title, folderId, onLink }) {
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
        <h4 className="font-black text-slate-800 flex items-center gap-3"><FolderOpen size={20} className="text-blue-600"/> {title}</h4>
      </div>
      <div className="flex gap-3">
        <input 
          className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20" 
          placeholder="Enlace de la carpeta de Google Drive..."
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button 
          onClick={() => {
            const id = url.includes('folders/') ? url.split('folders/')[1].split('?')[0] : url;
            onLink(id);
          }}
          className="bg-slate-900 text-white px-8 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg"
        >
          Sincronizar
        </button>
      </div>
      
      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
      ) : files.length > 0 ? (
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide pt-2">
          {files.map(f => (
            <div key={f.id} className="min-w-[160px] aspect-video bg-slate-50 rounded-[1.5rem] overflow-hidden relative group shadow-sm border border-slate-100">
              {f.thumbnailLink ? <img src={f.thumbnailLink} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-50"><ImageIcon className="text-indigo-200" size={32}/></div>}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all p-4 text-center">
                <p className="text-[10px] font-bold text-white mb-3 line-clamp-2">{f.name}</p>
                <a href={f.webContentLink} target="_blank" className="p-3 bg-white rounded-xl text-slate-900 shadow-xl scale-90 hover:scale-100 transition-all">
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 border-4 border-dotted border-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-200">
          <FolderOpen size={48} className="mb-4 opacity-10" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Vincula una carpeta para ver los artes</p>
        </div>
      )}
    </div>
  );
}

// Helper icons
function UsersIcon({ color }) { return <div className={`${color} p-2 rounded-lg`}><LayoutDashboard size={20}/></div>; }
function TargetIcon({ color }) { return <div className={`${color} p-2 rounded-lg`}><CheckCircle2 size={20}/></div>; }
function MoneyIcon({ color }) { return <div className={`${color} p-2 rounded-lg`}><DollarSign size={20}/></div>; }
function ChartIcon({ color }) { return <div className={`${color} p-2 rounded-lg`}><Zap size={20}/></div>; }
