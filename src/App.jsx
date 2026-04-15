import React, { useState, useEffect, useMemo } from 'react';
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
  X,
  Lock,
  User,
  MoreVertical,
  AlertCircle
} from 'lucide-react';

// Firebase
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";

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
  const [role, setRole] = useState(null); // 'admin' o 'usuario'
  const [activeTab, setActiveTab] = useState('meta');
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeBranch, setActiveBranch] = useState('monterrey');

  // Estados de login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados de datos
  const [metaData, setMetaData] = useState({
    branches: {
      monterrey: { leads: 45, metaLeads: 100, budget: 5000, spent: 2100 },
      saltillo: { leads: 30, metaLeads: 80, budget: 4000, spent: 1500 },
      cdmx: { leads: 70, metaLeads: 150, budget: 10000, spent: 6500 }
    },
    checklists: {
      awareness: [{ id: 1, text: 'Creativos de video listos', done: true }],
      prospeccion: [{ id: 3, text: 'Landing page optimizada', done: true }],
      retargeting: [{ id: 5, text: 'Audiencias personalizadas creadas', done: false }]
    },
    drive: { awareness: '', prospeccion: '', retargeting: '' }
  });

  const [eventos, setEventos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [express, setExpress] = useState([]);

  // Auth logic
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      // Simulación de rol basado en email o metadata
      if (u) {
        setRole(u.email === 'admin@matrix.com' ? 'admin' : 'usuario');
      }
      setLoading(false);
    });
  }, []);

  // Sync Firestore
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'main_data');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.metaData) setMetaData(data.metaData);
        if (data.eventos) setEventos(data.eventos);
        if (data.insumos) setInsumos(data.insumos);
        if (data.express) setExpress(data.express);
      }
    });
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPass);
    } catch (err) {
      setLoginError('Credenciales incorrectas o error de conexión');
    }
  };

  const saveData = async (updates) => {
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'main_data');
    await setDoc(docRef, {
      metaData, eventos, insumos, express, ...updates
    }, { merge: true });
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-blue-100 p-10 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-2xl text-white mb-4 shadow-lg shadow-blue-200">
            <LayoutDashboard size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Account Matrix</h1>
          <p className="text-slate-400 font-medium">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="usuario@empresa.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
              />
            </div>
          </div>
          {loginError && <p className="text-rose-500 text-xs font-bold text-center mt-2">{loginError}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all mt-4">
            Entrar al Panel
          </button>
          <button 
            type="button"
            onClick={() => signInAnonymously(auth)}
            className="w-full text-slate-400 text-xs font-bold hover:text-slate-600 transition-all mt-2"
          >
            Entrar como Invitado (Solo Lectura)
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Matrix Hub</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{role === 'admin' ? 'Administrador' : 'Colaborador'}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem active={activeTab === 'meta'} icon={<Zap size={18}/>} label="Embudo Meta" onClick={() => setActiveTab('meta')} />
          <NavItem active={activeTab === 'eventos'} icon={<Calendar size={18}/>} label="Eventos" onClick={() => setActiveTab('eventos')} />
          <NavItem active={activeTab === 'insumos'} icon={<Package size={18}/>} label="Insumos" onClick={() => setActiveTab('insumos')} />
          <NavItem active={activeTab === 'express'} icon={<Zap size={18}/>} label="Express" onClick={() => setActiveTab('express')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={() => signOut(auth)} className="flex items-center gap-3 w-full p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
            <LogOut size={18} /> <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          
          {/* TAB: META (SUCURSALES) */}
          {activeTab === 'meta' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">Embudo Meta</h2>
                  <p className="text-slate-500 mt-1 font-medium">Métricas integradas por sucursal</p>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {['monterrey', 'saltillo', 'cdmx'].map(b => (
                    <button 
                      key={b}
                      onClick={() => setActiveBranch(b)}
                      className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeBranch === b ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
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
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 transition-all"
                  >
                    {isEditingMetrics ? <><Save size={16}/> Guardar</> : <><Edit2 size={16}/> Editar Métricas</>}
                  </button>
                )}
              </header>

              {/* Métricas Principales de Sucursal Activa */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard 
                  label="Leads Generados" 
                  value={metaData.branches[activeBranch]?.leads || 0} 
                  icon={<UsersIcon color="bg-blue-50 text-blue-600" />}
                  editing={isEditingMetrics}
                  onChange={(v) => {
                    const newBranches = {...metaData.branches, [activeBranch]: {...metaData.branches[activeBranch], leads: v}};
                    setMetaData({...metaData, branches: newBranches});
                  }}
                />
                <MetricCard 
                  label="Meta de Leads" 
                  value={metaData.branches[activeBranch]?.metaLeads || 1} 
                  subtext={`${Math.round((metaData.branches[activeBranch]?.leads/metaData.branches[activeBranch]?.metaLeads)*100)}% alcanzado`}
                  icon={<TargetIcon color="bg-emerald-50 text-emerald-600" />}
                  editing={isEditingMetrics}
                  onChange={(v) => {
                    const newBranches = {...metaData.branches, [activeBranch]: {...metaData.branches[activeBranch], metaLeads: v}};
                    setMetaData({...metaData, branches: newBranches});
                  }}
                />
                <MetricCard 
                  label="Presupuesto" 
                  value={`$${(metaData.branches[activeBranch]?.budget || 0).toLocaleString()}`} 
                  icon={<MoneyIcon color="bg-indigo-50 text-indigo-600" />}
                  editing={isEditingMetrics}
                  onChange={(v) => {
                    const newBranches = {...metaData.branches, [activeBranch]: {...metaData.branches[activeBranch], budget: v}};
                    setMetaData({...metaData, branches: newBranches});
                  }}
                />
                <MetricCard 
                  label="Gasto" 
                  value={`$${(metaData.branches[activeBranch]?.spent || 0).toLocaleString()}`} 
                  subtext={`${Math.round((metaData.branches[activeBranch]?.spent/metaData.branches[activeBranch]?.budget)*100)}% usado`}
                  icon={<ChartIcon color="bg-amber-50 text-amber-600" />}
                  editing={isEditingMetrics}
                  onChange={(v) => {
                    const newBranches = {...metaData.branches, [activeBranch]: {...metaData.branches[activeBranch], spent: v}};
                    setMetaData({...metaData, branches: newBranches});
                  }}
                />
              </div>

              {/* Checklist & Drive (Globales) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ChecklistCol title="Awareness" items={metaData.checklists.awareness} color="border-l-4 border-blue-500" 
                  onUpdate={(items) => {
                    const n = {...metaData, checklists: {...metaData.checklists, awareness: items}};
                    setMetaData(n); saveData({ metaData: n });
                  }}
                />
                <ChecklistCol title="Prospección" items={metaData.checklists.prospeccion} color="border-l-4 border-emerald-500"
                   onUpdate={(items) => {
                    const n = {...metaData, checklists: {...metaData.checklists, prospeccion: items}};
                    setMetaData(n); saveData({ metaData: n });
                  }}
                />
                <ChecklistCol title="Retargeting" items={metaData.checklists.retargeting} color="border-l-4 border-purple-500"
                   onUpdate={(items) => {
                    const n = {...metaData, checklists: {...metaData.checklists, retargeting: items}};
                    setMetaData(n); saveData({ metaData: n });
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB: EVENTOS */}
          {activeTab === 'eventos' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm border-b-4 border-b-blue-500">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800">Eventos Especiales</h2>
                    <p className="text-slate-400 font-medium">Planificación y seguimiento de activaciones</p>
                  </div>
                  <button 
                    onClick={() => {
                      const nombre = prompt('Nombre del evento:');
                      if(nombre) {
                        const newEventos = [{ id: Date.now(), nombre, fecha: new Date().toLocaleDateString(), tareas: [], gastos: [] }, ...eventos];
                        setEventos(newEventos); saveData({ eventos: newEventos });
                      }
                    }}
                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-100 hover:scale-105 transition-all"
                  >
                    <Plus size={20}/> Nuevo Evento
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {eventos.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed">No hay eventos activos.</div>
                ) : (
                  eventos.map(ev => (
                    <EventCard key={ev.id} ev={ev} onDelete={() => {
                      const n = eventos.filter(e => e.id !== ev.id);
                      setEventos(n); saveData({ eventos: n });
                    }} onUpdate={(updated) => {
                      const n = eventos.map(e => e.id === ev.id ? updated : e);
                      setEventos(n); saveData({ eventos: n });
                    }} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: INSUMOS */}
          {activeTab === 'insumos' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <header className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Insumos Sucursales</h2>
                  <p className="text-slate-500 font-medium">Control de stock y renovaciones</p>
                </div>
                <button 
                  onClick={() => {
                    const nombre = prompt('Material:');
                    if(nombre) {
                      const n = [{ id: Date.now(), nombre, sucursal: 'Monterrey', dias: 30, lastDate: new Date().toISOString() }, ...insumos];
                      setInsumos(n); saveData({ insumos: n });
                    }
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-50"
                >
                  Nuevo Material
                </button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insumos.map(ins => (
                  <InsumoCard key={ins.id} item={ins} 
                    onDelete={() => {
                      const n = insumos.filter(i => i.id !== ins.id);
                      setInsumos(n); saveData({ insumos: n });
                    }}
                    onEdit={(newNombre) => {
                      const n = insumos.map(i => i.id === ins.id ? {...i, nombre: newNombre} : i);
                      setInsumos(n); saveData({ insumos: n });
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB: EXPRESS */}
          {activeTab === 'express' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 border-l-8 border-l-blue-600">
                <h2 className="text-3xl font-black text-slate-800">Tareas Express</h2>
                <p className="text-slate-500 font-medium mb-6">Pendientes rápidos del día</p>
                
                <div className="flex gap-2">
                  <input 
                    id="newExp"
                    className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Escribe una tarea y presiona Enter..."
                    onKeyDown={e => {
                      if(e.key === 'Enter' && e.target.value) {
                        const n = [{ id: Date.now(), text: e.target.value, done: false, priority: 'Media', date: new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}) }, ...express];
                        setExpress(n); saveData({ express: n });
                        e.target.value = '';
                      }
                    }}
                  />
                  <button onClick={() => {
                    const val = document.getElementById('newExp').value;
                    if(val) {
                      const n = [{ id: Date.now(), text: val, done: false, priority: 'Media', date: new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}) }, ...express];
                      setExpress(n); saveData({ express: n });
                      document.getElementById('newExp').value = '';
                    }
                  }} className="bg-blue-600 text-white px-8 rounded-xl font-black">AÑADIR</button>
                </div>
              </div>

              <div className="space-y-3">
                {express.map(task => (
                  <ExpressTask key={task.id} task={task} 
                    onToggle={() => {
                      const n = express.map(t => t.id === task.id ? {...t, done: !t.done} : t);
                      setExpress(n); saveData({ express: n });
                    }}
                    onDelete={() => {
                      const n = express.filter(t => t.id !== task.id);
                      setExpress(n); saveData({ express: n });
                    }}
                    onUpdate={(updated) => {
                      const n = express.map(t => t.id === task.id ? updated : t);
                      setExpress(n); saveData({ express: n });
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
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all font-bold ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
    >
      {icon} <span className="text-sm">{label}</span>
    </button>
  );
}

function MetricCard({ label, value, subtext, icon, editing, onChange }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start group hover:border-blue-200 transition-all">
      <div className="space-y-1 flex-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
        {editing ? (
          <input 
            type="number" 
            className="w-full text-xl font-black text-blue-600 bg-blue-50/50 p-1 rounded border-b-2 border-blue-500 outline-none" 
            defaultValue={typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value} 
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
          />
        ) : (
          <div className="text-2xl font-black text-slate-800 tracking-tight">{value}</div>
        )}
        {subtext && <p className="text-[10px] font-bold text-slate-500">{subtext}</p>}
      </div>
      <div className="ml-4">{icon}</div>
    </div>
  );
}

function ChecklistCol({ title, items, color, onUpdate }) {
  const [input, setInput] = useState('');
  return (
    <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm ${color}`}>
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-black text-slate-800">{title}</h4>
        <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase">
          {items.filter(i => i.done).length}/{items.length} COMPLETADO
        </span>
      </div>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 group">
            <button onClick={() => onUpdate(items.map(i => i.id === item.id ? {...i, done: !i.done} : i))}>
              {item.done ? <CheckCircle2 size={20} className="text-blue-500" /> : <Circle size={20} className="text-slate-200" />}
            </button>
            <span className={`text-sm font-bold flex-1 ${item.done ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{item.text}</span>
          </div>
        ))}
        <div className="pt-4 flex gap-2">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Añadir paso..." 
            className="flex-1 text-xs p-3 bg-slate-50 rounded-xl outline-none"
            onKeyDown={e => { if(e.key === 'Enter' && input) { onUpdate([...items, { id: Date.now(), text: input, done: false }]); setInput(''); } }}
          />
          <button onClick={() => { if(input) { onUpdate([...items, { id: Date.now(), text: input, done: false }]); setInput(''); } }} className="text-blue-500 bg-blue-50 p-3 rounded-xl"><Plus size={16}/></button>
        </div>
      </div>
    </div>
  );
}

function EventCard({ ev, onUpdate, onDelete }) {
  const [taskInput, setTaskInput] = useState('');
  const [actName, setActName] = useState('');
  const [actPrice, setActPrice] = useState('');

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 group relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-100 rotate-3">
            <Calendar size={32}/>
          </div>
          <div>
            <h4 className="text-3xl font-black text-slate-800">{ev.nombre}</h4>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{ev.fecha}</span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border px-3 py-1 rounded-full">{ev.tareas?.length || 0} Tareas</span>
            </div>
          </div>
        </div>
        <button onClick={onDelete} className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
          <Trash2 size={24}/>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h5 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={18} className="text-blue-500"/> Checklist de Producción
          </h5>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
            {ev.tareas?.map((t, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl group/item">
                <button onClick={() => onUpdate({...ev, tareas: ev.tareas.map((tt, i) => i === idx ? {...tt, done: !tt.done} : tt)})}>
                  {t.done ? <CheckCircle2 size={22} className="text-blue-500" /> : <Circle size={22} className="text-slate-300" />}
                </button>
                <span className={`text-sm font-bold flex-1 ${t.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{t.text}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input 
                className="flex-1 bg-white border border-slate-100 p-4 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Añadir requerimiento..." 
                value={taskInput}
                onChange={e => setTaskInput(e.target.value)}
                onKeyDown={e => {
                  if(e.key === 'Enter' && taskInput) {
                    onUpdate({...ev, tareas: [...(ev.tareas || []), { text: taskInput, done: false }]});
                    setTaskInput('');
                  }
                }}
              />
              <button onClick={() => { if(taskInput) { onUpdate({...ev, tareas: [...(ev.tareas || []), { text: taskInput, done: false }]}); setTaskInput(''); } }} className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-50"><Plus/></button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={18} className="text-amber-500"/> Desglose Financiero
            </h5>
            <div className="text-xl font-black text-slate-800">${(ev.gastos?.reduce((a, b) => a + (parseFloat(b.costo) || 0), 0) || 0).toLocaleString()}</div>
          </div>
          <div className="space-y-3">
            {ev.gastos?.map((g, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-black text-slate-600 uppercase tracking-tighter">{g.text}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-blue-600">${parseFloat(g.costo).toLocaleString()}</span>
                  <button onClick={() => onUpdate({...ev, gastos: ev.gastos.filter((_, i) => i !== idx)})} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14}/></button>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <input className="flex-1 bg-white border border-slate-100 p-4 rounded-2xl text-xs font-bold outline-none" placeholder="Descripción" value={actName} onChange={e => setActName(e.target.value)}/>
              <input className="w-24 bg-white border border-slate-100 p-4 rounded-2xl text-xs font-bold outline-none" placeholder="$0.00" value={actPrice} onChange={e => setActPrice(e.target.value)}/>
              <button onClick={() => {
                if(actName && actPrice) {
                  onUpdate({...ev, gastos: [...(ev.gastos || []), { text: actName, costo: parseFloat(actPrice) || 0 }]});
                  setActName(''); setActPrice('');
                }
              }} className="bg-amber-500 text-white p-4 rounded-2xl"><Plus/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsumoCard({ item, onDelete, onEdit }) {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-visible group hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform"><Package size={24}/></div>
          <div>
            <h5 className="font-black text-slate-800 leading-tight text-lg">{item.nombre}</h5>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{item.sucursal || 'Global'}</p>
          </div>
        </div>
        
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-slate-300 hover:text-slate-800 transition-colors"><MoreVertical size={20}/></button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-slate-100 z-10 py-2 animate-in fade-in zoom-in duration-200">
              <button onClick={() => {
                const n = prompt('Nuevo nombre:', item.nombre);
                if(n) onEdit(n);
                setShowMenu(false);
              }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                <Edit2 size={14}/> Editar material
              </button>
              <button onClick={() => {
                if(window.confirm('¿Eliminar material?')) onDelete();
                setShowMenu(false);
              }} className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-2">
                <Trash2 size={14}/> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Clock size={14} className="text-slate-300"/> Ciclo: cada {item.dias} días
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Calendar size={14} className="text-slate-300"/> Prox. Renovación: {new Date(new Date(item.lastDate).getTime() + (item.dias * 86400000)).toLocaleDateString()}
        </div>
      </div>

      <div className="mt-8">
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full w-[60%]"></div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">En Stock</span>
          <button className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest border-b border-transparent hover:border-blue-600 transition-all">Renovar ahora</button>
        </div>
      </div>
    </div>
  );
}

function ExpressTask({ task, onToggle, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const priorityColors = {
    'Alta': 'bg-rose-100 text-rose-600 border-rose-200',
    'Media': 'bg-amber-100 text-amber-600 border-amber-200',
    'Baja': 'bg-emerald-100 text-emerald-600 border-emerald-200'
  };

  return (
    <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all flex items-center justify-between group ${task.done ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-6 flex-1">
        <button onClick={onToggle} className="shrink-0">
          {task.done ? <CheckCircle2 size={26} className="text-emerald-500" /> : <Circle size={26} className="text-slate-200 group-hover:text-blue-500 transition-colors" />}
        </button>
        
        <div className="flex-1 space-y-1">
          {isEditing ? (
            <input 
              autoFocus
              className="w-full font-black text-slate-800 outline-none border-b-2 border-blue-500"
              defaultValue={task.text}
              onBlur={(e) => {
                onUpdate({...task, text: e.target.value});
                setIsEditing(false);
              }}
              onKeyDown={e => {
                if(e.key === 'Enter') {
                  onUpdate({...task, text: e.target.value});
                  setIsEditing(false);
                }
              }}
            />
          ) : (
            <h5 onClick={() => setIsEditing(true)} className={`font-black text-slate-800 text-lg leading-tight cursor-pointer ${task.done ? 'line-through text-slate-400' : ''}`}>
              {task.text}
            </h5>
          )}
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.date}</span>
            <select 
              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border outline-none ${priorityColors[task.priority || 'Media']}`}
              value={task.priority || 'Media'}
              onChange={(e) => onUpdate({...task, priority: e.target.value})}
            >
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="p-2 text-slate-300 hover:text-blue-500"><Edit2 size={18}/></button>
        <button onClick={onDelete} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={18}/></button>
      </div>
    </div>
  );
}

// Icon fallbacks
function UsersIcon({ color }) { return <div className={`p-3 rounded-2xl ${color}`}><LayoutDashboard size={20}/></div>; }
function TargetIcon({ color }) { return <div className={`p-3 rounded-2xl ${color}`}><Zap size={20}/></div>; }
function MoneyIcon({ color }) { return <div className={`p-3 rounded-2xl ${color}`}><DollarSign size={20}/></div>; }
function ChartIcon({ color }) { return <div className={`p-3 rounded-2xl ${color}`}><Package size={20}/></div>; }
