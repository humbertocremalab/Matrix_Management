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
  X,
  Users,
  Settings,
  Target
} from 'lucide-react';

// Firebase
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc 
} from "firebase/firestore";

// --- CONFIG ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'matrix-manager-pro';
const DRIVE_API_KEY = "AIzaSyBH8-5rLNM_--UWRMIywOb-m5-UOuzUYUw";

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('user'); // 'admin' o 'user'
  const [activeTab, setActiveTab] = useState('meta');
  const [sucursalMeta, setSucursalMeta] = useState('Monterrey');
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Estados de datos (organizados por sucursal para Meta)
  const [metaBranches, setMetaBranches] = useState({
    Monterrey: {
      metrics: { leads: 145, metaLeads: 200, budget: 15000, spent: 8750 },
      checklists: { awareness: [], prospeccion: [], retargeting: [] },
      drive: { awareness: '', prospeccion: '', retargeting: '' }
    },
    Saltillo: {
      metrics: { leads: 0, metaLeads: 100, budget: 5000, spent: 0 },
      checklists: { awareness: [], prospeccion: [], retargeting: [] },
      drive: { awareness: '', prospeccion: '', retargeting: '' }
    },
    CDMX: {
      metrics: { leads: 0, metaLeads: 300, budget: 25000, spent: 0 },
      checklists: { awareness: [], prospeccion: [], retargeting: [] },
      drive: { awareness: '', prospeccion: '', retargeting: '' }
    }
  });

  const [eventos, setEventos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [express, setExpress] = useState([]);

  // Auth Listener
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
      if (u) {
        setRole(u.email === 'admin@matrix.com' ? 'admin' : 'user');
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
        if (data.metaBranches) setMetaBranches(data.metaBranches);
        if (data.eventos) setEventos(data.eventos);
        if (data.insumos) setInsumos(data.insumos);
        if (data.express) setExpress(data.express);
      }
    }, (err) => console.error(err));
  }, [user]);

  const saveData = async (updates) => {
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'main_data');
    await setDoc(docRef, {
      metaBranches, eventos, insumos, express, ...updates
    }, { merge: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
    } catch (err) {
      // Intento anónimo si falla para la demo
      await signInAnonymously(auth);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-12 h-12 rounded-2xl text-white flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Bienvenido</h2>
          <p className="text-slate-400 font-medium">Inicia sesión para continuar</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={loginForm.email}
            onChange={e => setLoginForm({...loginForm, email: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={loginForm.password}
            onChange={e => setLoginForm({...loginForm, password: e.target.value})}
          />
          <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );

  const currentMeta = metaBranches[sucursalMeta] || { metrics: { leads: 0, metaLeads: 1, budget: 0, spent: 0 }, checklists: { awareness: [], prospeccion: [], retargeting: [] }, drive: { awareness: '', prospeccion: '', retargeting: '' } };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col p-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Account</h1>
            <p className="text-xs text-slate-400">{role === 'admin' ? 'Administrador' : 'Usuario'}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem active={activeTab === 'meta'} icon={<Zap size={20}/>} label="Embudo Meta" onClick={() => setActiveTab('meta')} />
          <NavItem active={activeTab === 'eventos'} icon={<Calendar size={20}/>} label="Eventos" onClick={() => setActiveTab('eventos')} />
          <NavItem active={activeTab === 'insumos'} icon={<Package size={20}/>} label="Insumos" onClick={() => setActiveTab('insumos')} />
          <NavItem active={activeTab === 'express'} icon={<MoreHorizontal size={20}/>} label="Express" onClick={() => setActiveTab('express')} />
        </nav>

        <button onClick={() => signOut(auth)} className="flex items-center gap-3 p-4 text-slate-400 hover:text-rose-500 transition-colors font-bold text-sm">
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          {activeTab === 'meta' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Embudo Meta</h2>
                  <p className="text-slate-500 mt-1">Gestiona tus campañas y leads por sucursal</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['Monterrey', 'Saltillo', 'CDMX'].map(branch => (
                      <button 
                        key={branch}
                        onClick={() => setSucursalMeta(branch)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${sucursalMeta === branch ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                      >
                        {branch}
                      </button>
                    ))}
                  </div>

                  {role === 'admin' && (
                    <button 
                      onClick={() => {
                        if (isEditingMetrics) saveData({ metaBranches });
                        setIsEditingMetrics(!isEditingMetrics);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 transition-all"
                    >
                      {isEditingMetrics ? <><Save size={16}/> Guardar</> : <><Edit2 size={16}/> Editar</>}
                    </button>
                  )}
                </div>
              </header>

              {/* Métricas Principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard 
                  label="Leads Generados" 
                  value={currentMeta.metrics.leads} 
                  icon={<UsersIcon color="bg-blue-50 text-blue-600" />}
                  editing={isEditingMetrics}
                  onChange={(v) => {
                    const updated = { ...metaBranches };
                    updated[sucursalMeta].metrics.leads = parseInt(v) || 0;
                    setMetaBranches(updated);
                  }}
                />
                <MetricCard 
                  label="Meta de Leads" 
                  value={currentMeta.metrics.metaLeads} 
                  subtext={`${Math.round((currentMeta.metrics.leads/currentMeta.metrics.metaLeads)*100)}% alcanzado`}
                  icon={<TargetIcon color="bg-emerald-50 text-emerald-600" />}
                  editing={isEditingMetrics}
                  onChange={(v) => {
                    const updated = { ...metaBranches };
                    updated[sucursalMeta].metrics.metaLeads = parseInt(v) || 1;
                    setMetaBranches(updated);
                  }}
                />
                <MetricCard 
                  label="Presupuesto" 
                  value={`$${currentMeta.metrics.budget.toLocaleString()}`} 
                  icon={<MoneyIcon color="bg-indigo-50 text-indigo-600" />}
                  editing={isEditingMetrics}
                  isCurrency
                  onChange={(v) => {
                    const updated = { ...metaBranches };
                    updated[sucursalMeta].metrics.budget = parseInt(v) || 0;
                    setMetaBranches(updated);
                  }}
                />
                <MetricCard 
                  label="Gasto" 
                  value={`$${currentMeta.metrics.spent.toLocaleString()}`} 
                  subtext={`${Math.round((currentMeta.metrics.spent/currentMeta.metrics.budget)*100)}% usado`}
                  icon={<ChartIcon color="bg-amber-50 text-amber-600" />}
                  editing={isEditingMetrics}
                  isCurrency
                  onChange={(v) => {
                    const updated = { ...metaBranches };
                    updated[sucursalMeta].metrics.spent = parseInt(v) || 0;
                    setMetaBranches(updated);
                  }}
                />
              </div>

              {/* Checklist Embudo */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Checklist - {sucursalMeta}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['awareness', 'prospeccion', 'retargeting'].map(phase => (
                    <ChecklistCol 
                      key={phase}
                      title={phase.charAt(0).toUpperCase() + phase.slice(1)} 
                      items={currentMeta.checklists[phase]} 
                      color={phase === 'awareness' ? "border-l-4 border-blue-500" : phase === 'prospeccion' ? "border-l-4 border-emerald-500" : "border-l-4 border-purple-500"}
                      onUpdate={(items) => {
                        const updated = { ...metaBranches };
                        updated[sucursalMeta].checklists[phase] = items;
                        setMetaBranches(updated);
                        saveData({ metaBranches: updated });
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Artes del Embudo */}
              <div className="space-y-6">
                <h3 className="font-bold text-lg">Artes del Embudo</h3>
                <div className="space-y-6">
                  {['awareness', 'prospeccion', 'retargeting'].map(phase => (
                    <DriveCarousel 
                      key={phase}
                      title={phase.charAt(0).toUpperCase() + phase.slice(1)} 
                      folderId={currentMeta.drive[phase]} 
                      onLink={(id) => {
                        const updated = { ...metaBranches };
                        updated[sucursalMeta].drive[phase] = id;
                        setMetaBranches(updated);
                        saveData({ metaBranches: updated });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eventos' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <header className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Eventos Operativos</h2>
                <button 
                  onClick={() => {
                    const newEv = { id: Date.now(), nombre: 'Nuevo Evento', fecha: '20 ABR', tareas: [], gastos: [] };
                    setEventos([...eventos, newEv]);
                    saveData({ eventos: [...eventos, newEv] });
                  }}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  <Plus size={20}/>
                </button>
              </header>
              <div className="grid grid-cols-1 gap-8">
                {eventos.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 font-medium">No hay eventos creados. Selecciona o crea uno para comenzar.</div>
                ) : (
                  eventos.map(ev => (
                    <EventCard 
                      key={ev.id} 
                      ev={ev} 
                      onDelete={() => {
                        const newEventos = eventos.filter(e => e.id !== ev.id);
                        setEventos(newEventos);
                        saveData({ eventos: newEventos });
                      }}
                      onUpdate={(updated) => {
                        const newEventos = eventos.map(e => e.id === ev.id ? updated : e);
                        setEventos(newEventos);
                        saveData({ eventos: newEventos });
                      }} 
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'insumos' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <header className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Stock de Insumos</h2>
                <button 
                  onClick={() => {
                    const newItem = { id: Date.now(), nombre: 'Nuevo Material', sucursal: sucursalMeta, dias: 30 };
                    setInsumos([...insumos, newItem]);
                    saveData({ insumos: [...insumos, newItem] });
                  }}
                  className="bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Plus size={20} className="text-slate-600"/>
                </button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insumos.map(ins => (
                  <InsumoCard 
                    key={ins.id} 
                    item={ins} 
                    onUpdate={(updated) => {
                      const newInsumos = insumos.map(i => i.id === ins.id ? updated : i);
                      setInsumos(newInsumos);
                      saveData({ insumos: newInsumos });
                    }}
                    onDelete={() => {
                      const newInsumos = insumos.filter(i => i.id !== ins.id);
                      setInsumos(newInsumos);
                      saveData({ insumos: newInsumos });
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'express' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <header className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Matrix Express</h2>
                  <p className="text-slate-500 mt-1">Tareas rápidas y pendientes del día</p>
                </div>
                <button 
                  onClick={() => {
                    const newTask = { id: Date.now(), text: 'Nueva tarea', priority: 'Media', done: false, entry: new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}) };
                    setExpress([...express, newTask]);
                    saveData({ express: [...express, newTask] });
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:scale-105 transition-all"
                >
                  Nueva Tarea
                </button>
              </header>

              <div className="space-y-3">
                {express.map(task => (
                  <ExpressTask 
                    key={task.id} 
                    task={task} 
                    onUpdate={(updated) => {
                      const newExp = express.map(t => t.id === task.id ? updated : t);
                      setExpress(newExp);
                      saveData({ express: newExp });
                    }}
                    onDelete={() => {
                      const newExp = express.filter(t => t.id !== task.id);
                      setExpress(newExp);
                      saveData({ express: newExp });
                    }}
                    onToggle={() => {
                      const newExp = express.map(t => t.id === task.id ? {...t, done: !t.done, exit: !t.done ? new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}) : null} : t);
                      setExpress(newExp);
                      saveData({ express: newExp });
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

function NavItem({ active, icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-50' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
    >
      {icon} {label}
    </button>
  );
}

function MetricCard({ label, value, subtext, icon, editing, onChange }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        {editing ? (
          <input 
            type="number"
            className="text-2xl font-black text-slate-800 w-full outline-none border-b border-blue-200"
            defaultValue={typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
        )}
        {subtext && <p className="text-[10px] font-bold text-slate-400 bg-slate-50 inline-block px-2 py-1 rounded-md">{subtext}</p>}
      </div>
      {icon}
    </div>
  );
}

function ChecklistCol({ title, items = [], color, onUpdate }) {
  const [input, setInput] = useState('');
  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm ${color}`}>
      <h4 className="font-bold text-slate-800 mb-4 text-sm">{title}</h4>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 group">
            <button onClick={() => onUpdate(items.map(i => i.id === item.id ? {...i, done: !i.done} : i))}>
              {item.done ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} className="text-slate-300" />}
            </button>
            <span className={`text-sm font-medium flex-1 ${item.done ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{item.text}</span>
            <button onClick={() => onUpdate(items.filter(i => i.id !== item.id))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
              <X size={14}/>
            </button>
          </div>
        ))}
        <div className="flex gap-2 mt-4">
          <input 
            className="flex-1 bg-slate-50 border border-slate-100 p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-400 transition-all" 
            placeholder="Añadir..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && input) {
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

function DriveCarousel({ title, folderId, onLink }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (folderId) {
      setLoading(true);
      fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${DRIVE_API_KEY}&fields=files(id,name,thumbnailLink,webViewLink)`)
        .then(res => res.json())
        .then(data => {
          setFiles(data.files || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [folderId]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-500 rounded-xl"><FolderOpen size={18}/></div>
          <h4 className="font-bold text-slate-800">{title}</h4>
        </div>
        <button 
          onClick={() => {
            const id = prompt("Pega el Folder ID de Google Drive:");
            if (id) onLink(id);
          }}
          className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
        >
          {folderId ? 'Cambiar Carpeta' : 'Vincular Drive'}
        </button>
      </div>

      {!folderId ? (
        <div className="h-40 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300 gap-2">
          <ImageIcon size={32}/>
          <p className="text-xs font-bold">Sin carpeta vinculada</p>
        </div>
      ) : loading ? (
        <div className="h-40 flex items-center justify-center text-blue-500"><Loader2 className="animate-spin"/></div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {files.map(file => (
            <a key={file.id} href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-40 group">
              <div className="aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden mb-2 relative border border-slate-100 transition-all group-hover:shadow-lg">
                <img src={file.thumbnailLink?.replace('=s220', '=s400')} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ExternalLink className="text-white" size={24}/>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-500 truncate px-1">{file.name}</p>
            </a>
          ))}
          {files.length === 0 && <div className="text-slate-400 text-xs py-10 w-full text-center">No se encontraron archivos en la carpeta.</div>}
        </div>
      )}
    </div>
  );
}

function EventCard({ ev, onUpdate, onDelete }) {
  const [task, setTask] = useState('');
  const [act, setAct] = useState('');
  const [price, setPrice] = useState('');

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 md:p-12 space-y-10">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center"><Calendar size={32}/></div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">{ev.nombre}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{ev.fecha}</p>
          </div>
        </div>
        <button onClick={onDelete} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20}/></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={18} className="text-blue-500" />
            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Plan de Acción</h4>
          </div>
          <div className="space-y-3">
             {ev.tareas.map((t, idx) => (
               <div key={idx} className="flex items-center gap-3 group">
                 <button onClick={() => onUpdate({...ev, tareas: ev.tareas.map((tt, i) => i === idx ? {...tt, done: !tt.done} : tt)})}>
                   {t.done ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} className="text-slate-300" />}
                 </button>
                 <span className={`text-sm font-semibold flex-1 ${t.done ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{t.text}</span>
                 <button onClick={() => onUpdate({...ev, tareas: ev.tareas.filter((_, i) => i !== idx)})} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500"><X size={14}/></button>
               </div>
             ))}
             <div className="flex gap-2">
               <input 
                 className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold outline-none" 
                 placeholder="Nueva tarea operativa..."
                 value={task}
                 onChange={e => setTask(e.target.value)}
                 onKeyDown={e => { if(e.key === 'Enter' && task) { onUpdate({...ev, tareas: [...ev.tareas, {text: task, done: false}]}); setTask(''); } }}
               />
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={18} className="text-emerald-500" />
            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Gastos del Evento</h4>
          </div>
          <div className="space-y-3">
             {ev.gastos.map((g, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm group">
                 <span className="text-sm font-bold text-slate-600">{g.text}</span>
                 <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-800">${g.costo.toLocaleString()}</span>
                    <button onClick={() => onUpdate({...ev, gastos: ev.gastos.filter((_, i) => i !== idx)})} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500"><X size={14}/></button>
                 </div>
               </div>
             ))}
             <div className="flex gap-2">
               <input className="flex-1 bg-slate-50 p-3 rounded-xl text-xs font-bold outline-none" placeholder="Actividad" value={act} onChange={e => setAct(e.target.value)} />
               <input className="w-24 bg-slate-50 p-3 rounded-xl text-xs font-bold outline-none" placeholder="$0" value={price} onChange={e => setPrice(e.target.value)} />
               <button onClick={() => { if(act && price) { onUpdate({...ev, gastos: [...ev.gastos, {text: act, costo: parseInt(price)}]}); setAct(''); setPrice(''); } }} className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><Plus size={16}/></button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsumoCard({ item, onUpdate, onDelete }) {
  const [showEdit, setShowEdit] = useState(false);
  const daysLeft = item.dias || 15; 
  const isVencido = daysLeft <= 0;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center"><Package size={20}/></div>
          <div>
            <h5 className="font-bold text-slate-800 leading-tight">{item.nombre}</h5>
            <p className="text-[10px] font-bold text-slate-400">Material</p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowEdit(!showEdit)} className="text-slate-200 hover:text-slate-400 transition-colors"><MoreHorizontal size={20}/></button>
          {showEdit && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-10 py-2">
              <button 
                onClick={() => {
                  const n = prompt("Nombre:", item.nombre);
                  const s = prompt("Sucursal:", item.sucursal);
                  const d = prompt("Días para renovar:", item.dias);
                  if(n) onUpdate({...item, nombre: n, sucursal: s, dias: parseInt(d)});
                  setShowEdit(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
              >
                <Edit2 size={14}/> Editar
              </button>
              <button 
                onClick={() => { if(confirm("¿Borrar?")) onDelete(); setShowEdit(false); }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-2"
              >
                <Trash2 size={14}/> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <Clock size={12}/> {item.sucursal || 'Sucursal Centro'}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <Calendar size={12}/> Renueva: {item.dias} días
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Estado Stock</span>
          <span className={`text-xs font-black ${isVencido ? 'text-rose-500' : 'text-emerald-500'}`}>{isVencido ? 'Agotado' : 'Disponible'}</span>
        </div>
        <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${isVencido ? 'w-0 bg-rose-500' : 'w-full bg-emerald-500'}`}></div>
        </div>
      </div>
    </div>
  );
}

function ExpressTask({ task, onToggle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const priorities = ['Alta', 'Media', 'Baja'];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onToggle}>
          {task.done ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Circle size={24} className="text-slate-200" />}
        </button>
        <div className="flex-1">
          {isEditing ? (
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm font-bold"
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => {
                  if(e.key === 'Enter') {
                    onUpdate({...task, text: editText});
                    setIsEditing(false);
                  }
                }}
              />
              <button onClick={() => { onUpdate({...task, text: editText}); setIsEditing(false); }} className="text-emerald-500"><CheckCircle2 size={20}/></button>
            </div>
          ) : (
            <h5 className={`font-bold transition-all ${task.done ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{task.text}</h5>
          )}
          <div className="flex gap-4 mt-1 items-center">
            <select 
              className={`px-2 py-0.5 rounded text-[8px] font-black uppercase outline-none cursor-pointer ${task.priority === 'Alta' ? 'bg-rose-50 text-rose-500' : task.priority === 'Baja' ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400'}`}
              value={task.priority}
              onChange={e => onUpdate({...task, priority: e.target.value})}
            >
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <span className="text-[10px] font-bold text-slate-300">Entrada: {task.entry}</span>
            {task.exit && <span className="text-[10px] font-bold text-emerald-400">Completada: {task.exit}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(!isEditing)} className="p-2 text-slate-300 hover:text-blue-500"><Edit2 size={16}/></button>
        <button onClick={onDelete} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
      </div>
    </div>
  );
}

// Iconos Auxiliares
const UsersIcon = ({ color }) => <div className={`p-2 rounded-xl ${color}`}><Users size={20}/></div>;
const TargetIcon = ({ color }) => <div className={`p-2 rounded-xl ${color}`}><Target size={20}/></div>;
const MoneyIcon = ({ color }) => <div className={`p-2 rounded-xl ${color}`}><DollarSign size={20}/></div>;
const ChartIcon = ({ color }) => <div className={`p-2 rounded-xl ${color}`}><LayoutDashboard size={20}/></div>;
