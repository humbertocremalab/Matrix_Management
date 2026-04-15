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
  Target,
  Users,
  TrendingUp
} from 'lucide-react';

// Firebase
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// --- CONFIG & SAFETY ---
const DRIVE_API_KEY = "AIzaSyBH8-5rLNM_--UWRMIywOb-m5-UOuzUYUw";

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
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
  const [activeTab, setActiveTab] = useState('meta');
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados de datos iniciales
  const [metaData, setMetaData] = useState({
    metrics: { leads: 0, metaLeads: 100, budget: 0, spent: 0 },
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

  // Auth logic with safety
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Sync Firestore - Usando la ruta obligatoria /artifacts/{appId}/public/data/{collection}
  useEffect(() => {
    if (!user) return;
    
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'main_data');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.metaData) setMetaData(data.metaData);
        if (data.eventos) setEventos(data.eventos);
        if (data.insumos) setInsumos(data.insumos);
        if (data.express) setExpress(data.express);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const saveData = async (updates) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'main_data');
      await setDoc(docRef, {
        metaData, eventos, insumos, express, ...updates
      }, { merge: true });
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-slate-500 font-medium animate-pulse">Cargando Account Matrix...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-sm z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <h1 className="font-black text-lg leading-tight tracking-tight">Account</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matrix Hub</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          <NavItem active={activeTab === 'meta'} icon={<Zap size={18}/>} label="Embudo Meta" onClick={() => setActiveTab('meta')} />
          <NavItem active={activeTab === 'eventos'} icon={<Calendar size={18}/>} label="Eventos" onClick={() => setActiveTab('eventos')} />
          <NavItem active={activeTab === 'insumos'} icon={<Package size={18}/>} label="Insumos" onClick={() => setActiveTab('insumos')} />
          <NavItem active={activeTab === 'express'} icon={<Zap size={18}/>} label="Express" onClick={() => setActiveTab('express')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="mb-4 px-4">
             <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Usuario</p>
             <p className="text-xs font-mono truncate text-slate-500">{user?.uid}</p>
          </div>
          <button onClick={() => signOut(auth)} className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all group">
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> 
            <span className="text-sm font-bold">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-around p-3 z-50">
          <MobileIcon active={activeTab === 'meta'} icon={<Zap/>} onClick={() => setActiveTab('meta')} />
          <MobileIcon active={activeTab === 'eventos'} icon={<Calendar/>} onClick={() => setActiveTab('eventos')} />
          <MobileIcon active={activeTab === 'insumos'} icon={<Package/>} onClick={() => setActiveTab('insumos')} />
          <MobileIcon active={activeTab === 'express'} icon={<Plus/>} onClick={() => setActiveTab('express')} />
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 scroll-smooth">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          
          {activeTab === 'meta' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-slate-900">Embudo Meta</h2>
                  <p className="text-slate-500 mt-2 font-medium">Control estratégico de inversión y conversión</p>
                </div>
                <button 
                  onClick={() => {
                    if (isEditingMetrics) saveData({ metaData });
                    setIsEditingMetrics(!isEditingMetrics);
                  }}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all border ${isEditingMetrics ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  {isEditingMetrics ? <><Save size={16}/> Guardar Cambios</> : <><Edit2 size={16}/> Gestionar Métricas</>}
                </button>
              </header>

              {/* Métricas Principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                  label="Leads" 
                  value={metaData.metrics.leads} 
                  icon={<Users className="text-blue-600" size={20} />}
                  bg="bg-blue-50"
                  editing={isEditingMetrics}
                  onChange={(v) => setMetaData({...metaData, metrics: {...metaData.metrics, leads: v}})}
                />
                <MetricCard 
                  label="Meta" 
                  value={metaData.metrics.metaLeads} 
                  subtext={`${Math.round((metaData.metrics.leads/metaData.metrics.metaLeads)*100) || 0}% de avance`}
                  icon={<Target className="text-emerald-600" size={20} />}
                  bg="bg-emerald-50"
                  editing={isEditingMetrics}
                  onChange={(v) => setMetaData({...metaData, metrics: {...metaData.metrics, metaLeads: v}})}
                />
                <MetricCard 
                  label="Presupuesto" 
                  value={`$${(metaData.metrics.budget || 0).toLocaleString()}`} 
                  icon={<DollarSign className="text-indigo-600" size={20} />}
                  bg="bg-indigo-50"
                  editing={isEditingMetrics}
                  isCurrency
                  onChange={(v) => setMetaData({...metaData, metrics: {...metaData.metrics, budget: v}})}
                />
                <MetricCard 
                  label="Gasto Real" 
                  value={`$${(metaData.metrics.spent || 0).toLocaleString()}`} 
                  subtext={`$${(metaData.metrics.budget - metaData.metrics.spent).toLocaleString()} disponible`}
                  icon={<TrendingUp className="text-amber-600" size={20} />}
                  bg="bg-amber-50"
                  editing={isEditingMetrics}
                  isCurrency
                  onChange={(v) => setMetaData({...metaData, metrics: {...metaData.metrics, spent: v}})}
                />
              </div>

              {/* Checklist Embudo */}
              <div className="space-y-6">
                <h3 className="font-black text-xl text-slate-900">Validación de Etapas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ChecklistCol 
                    title="Awareness" 
                    items={metaData.checklists.awareness || []} 
                    color="border-t-4 border-blue-500"
                    onUpdate={(items) => {
                      const newMeta = { ...metaData, checklists: { ...metaData.checklists, awareness: items }};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                  />
                  <ChecklistCol 
                    title="Prospección" 
                    items={metaData.checklists.prospeccion || []} 
                    color="border-t-4 border-emerald-500"
                    onUpdate={(items) => {
                      const newMeta = { ...metaData, checklists: { ...metaData.checklists, prospeccion: items }};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                  />
                  <ChecklistCol 
                    title="Retargeting" 
                    items={metaData.checklists.retargeting || []} 
                    color="border-t-4 border-purple-500"
                    onUpdate={(items) => {
                      const newMeta = { ...metaData, checklists: { ...metaData.checklists, retargeting: items }};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                  />
                </div>
              </div>

              {/* Artes del Embudo */}
              <div className="space-y-6">
                <h3 className="font-black text-xl text-slate-900">Repositorio de Creativos</h3>
                <div className="grid grid-cols-1 gap-6">
                  <DriveCarousel 
                    title="Awareness (Vídeos/Branding)" 
                    folderId={metaData.drive.awareness} 
                    onLink={(id) => {
                      const newMeta = {...metaData, drive: {...metaData.drive, awareness: id}};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                  />
                  <DriveCarousel 
                    title="Prospección (Estáticos/Ofertas)" 
                    folderId={metaData.drive.prospeccion} 
                    onLink={(id) => {
                      const newMeta = {...metaData, drive: {...metaData.drive, prospeccion: id}};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                  />
                  <DriveCarousel 
                    title="Retargeting (Testimonios/UGC)" 
                    folderId={metaData.drive.retargeting} 
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
                  <h2 className="text-4xl font-black tracking-tight text-slate-900">Eventos</h2>
                  <p className="text-slate-500 mt-2 font-medium">Logística y presupuestos de activaciones</p>
                </div>
                <button 
                  onClick={() => {
                    const nombre = prompt('Nombre del nuevo evento:');
                    if(nombre) {
                      const newEventos = [...eventos, { id: Date.now(), nombre, fecha: new Date().toLocaleDateString(), tareas: [], gastos: [] }];
                      setEventos(newEventos);
                      saveData({ eventos: newEventos });
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                >
                  <Plus size={20}/> Crear Evento
                </button>
              </header>

              <div className="grid grid-cols-1 gap-8">
                {eventos.length === 0 ? (
                  <div className="py-32 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
                    <Calendar className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-400 font-bold">No hay eventos planificados aún.</p>
                  </div>
                ) : (
                  eventos.map(ev => (
                    <EventCard key={ev.id} ev={ev} 
                      onDelete={() => {
                        const newEventos = eventos.filter(e => e.id !== ev.id);
                        setEventos(newEventos);
                        saveData({ eventos: newEventos });
                      }}
                      onUpdate={(updated) => {
                        const newEventos = eventos.map(e => e.id === ev.id ? updated : e);
                        setEventos(newEventos);
                        saveData({ eventos: newEventos });
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
                  <h2 className="text-4xl font-black tracking-tight text-slate-900">Insumos</h2>
                  <p className="text-slate-500 mt-2 font-medium">Inventario de materiales y renovaciones</p>
                </div>
                <button 
                  onClick={() => {
                    const nombre = prompt('Material o Insumo:');
                    if(nombre) {
                      const newInsumos = [...insumos, { id: Date.now(), nombre, sucursal: 'Sucursal General', dias: 30, lastDate: new Date().toISOString() }];
                      setInsumos(newInsumos);
                      saveData({ insumos: newInsumos });
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  <Plus size={20}/> Registrar Insumo
                </button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {insumos.map(ins => (
                  <InsumoCard key={ins.id} item={ins} onDelete={() => {
                    const newInsumos = insumos.filter(i => i.id !== ins.id);
                    setInsumos(newInsumos);
                    saveData({ insumos: newInsumos });
                  }} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'express' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500 max-w-3xl mx-auto">
              <header className="text-center md:text-left">
                <h2 className="text-4xl font-black tracking-tight text-slate-900">Tareas Express</h2>
                <p className="text-slate-500 mt-2 font-medium">Gestión ágil de pendientes diarios</p>
              </header>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  id="newExpress"
                  type="text" 
                  placeholder="¿Qué hay que resolver hoy?" 
                  className="flex-1 p-5 bg-white border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold shadow-sm" 
                  onKeyDown={e => {
                    if(e.key === 'Enter') {
                      const input = e.currentTarget;
                      if (!input.value) return;
                      const newExp = [...express, { id: Date.now(), text: input.value, entry: new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}), done: false, priority: 'Media' }];
                      setExpress(newExp);
                      saveData({ express: newExp });
                      input.value = '';
                    }
                  }}
                />
                <button onClick={() => {
                   const input = document.getElementById('newExpress');
                   if(input.value) {
                    const newExp = [...express, { id: Date.now(), text: input.value, entry: new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}), done: false, priority: 'Media' }];
                    setExpress(newExp);
                    saveData({ express: newExp });
                    input.value = '';
                   }
                }} className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Añadir</button>
              </div>

              <div className="space-y-4">
                {express.length === 0 ? (
                  <p className="text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-xs">Sin tareas pendientes</p>
                ) : (
                  express.map(task => (
                    <ExpressTask key={task.id} task={task} 
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
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- COMPONENTS ---

function NavItem({ active, icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold group ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
    >
      <span className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function MobileIcon({ active, icon, onClick }) {
  return (
    <button onClick={onClick} className={`p-4 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
      {React.cloneElement(icon, { size: 24 })}
    </button>
  );
}

function MetricCard({ label, value, subtext, icon, bg, editing, onChange, isCurrency }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex justify-between items-start group">
      <div className="space-y-2 flex-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
        {editing ? (
          <div className="flex items-center border-b-2 border-blue-500">
            {isCurrency && <span className="font-black text-slate-800">$</span>}
            <input 
              type="number" 
              className="w-full text-xl font-black text-slate-800 bg-transparent outline-none p-1" 
              defaultValue={typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value} 
              onChange={e => onChange(parseFloat(e.target.value) || 0)}
            />
          </div>
        ) : (
          <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        )}
        {subtext && <p className="text-[10px] font-bold text-slate-500 bg-slate-50 inline-block px-2 py-0.5 rounded-full">{subtext}</p>}
      </div>
      <div className={`${bg} p-3 rounded-2xl group-hover:rotate-12 transition-transform`}>
        {icon}
      </div>
    </div>
  );
}

function ChecklistCol({ title, items, color, onUpdate }) {
  const [input, setInput] = useState('');
  return (
    <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md ${color}`}>
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-black text-sm text-slate-800 uppercase tracking-tight">{title}</h4>
        <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-full">
          {items.filter(i => i.done).length}/{items.length}
        </span>
      </div>
      <div className="space-y-4 min-h-[120px]">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 group animate-in fade-in slide-in-from-left-2">
            <button onClick={() => onUpdate(items.map(i => i.id === item.id ? {...i, done: !i.done} : i))} className="transition-transform active:scale-90">
              {item.done ? <CheckCircle2 size={20} className="text-blue-500" /> : <Circle size={20} className="text-slate-200 group-hover:text-blue-200" />}
            </button>
            <span className={`text-sm font-bold flex-1 transition-all ${item.done ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{item.text}</span>
            <button onClick={() => onUpdate(items.filter(i => i.id !== item.id))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
               <X size={14} />
            </button>
          </div>
        ))}
        <div className="flex gap-2 mt-6 pt-4 border-t border-slate-50">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Añadir tarea..." 
            className="flex-1 text-xs font-bold p-3 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-100 transition-all"
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
          }} className="p-3 text-white bg-slate-900 rounded-xl hover:scale-105 active:scale-95 transition-all"><Plus size={16}/></button>
        </div>
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
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <h4 className="font-black text-slate-800 text-base flex items-center gap-2">
          <FolderOpen size={20} className="text-amber-500" /> {title}
        </h4>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all" 
          placeholder="ID de carpeta de Drive..."
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button 
          onClick={() => {
            const id = url.includes('folders/') ? url.split('folders/')[1].split('?')[0] : url;
            onLink(id);
          }}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black shadow-lg hover:shadow-none transition-all"
        >
          Sincronizar
        </button>
      </div>
      
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-blue-500" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conectando con Google Drive...</p>
        </div>
      ) : files.length > 0 ? (
        <div className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x scrollbar-hide">
          {files.map(f => (
            <div key={f.id} className="min-w-[180px] snap-center aspect-[4/5] bg-slate-100 rounded-3xl overflow-hidden relative group shadow-sm">
              {f.thumbnailLink ? (
                <img src={f.thumbnailLink.replace('s220', 's800')} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={f.name} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <ImageIcon className="text-slate-300" size={32}/>
                  <span className="text-[10px] font-bold text-slate-400 truncate w-full">{f.name}</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end justify-between">
                 <span className="text-[10px] text-white font-bold truncate max-w-[100px]">{f.name}</span>
                 <a href={f.webContentLink} target="_blank" className="p-2 bg-white rounded-full text-slate-900 shadow-xl">
                   <ExternalLink size={14} />
                 </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 border-4 border-dashed border-slate-50 rounded-[3rem] flex flex-col items-center justify-center text-slate-200 group">
          <ImageIcon size={48} className="mb-4 opacity-20 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Vincula una carpeta para visualizar artes</p>
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
    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10 animate-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-200"><Calendar size={32}/></div>
          <div>
            <h4 className="text-3xl font-black text-slate-900 tracking-tight">{ev.nombre}</h4>
            <div className="flex items-center gap-2 mt-1">
               <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">{ev.fecha}</span>
            </div>
          </div>
        </div>
        <button onClick={onDelete} className="p-4 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"><Trash2 size={24}/></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tareas del Evento */}
        <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <h5 className="font-black text-slate-900 flex items-center gap-3"><CheckCircle2 size={22} className="text-blue-500"/> Plan de Acción</h5>
            <span className="bg-white px-4 py-1.5 rounded-full text-[11px] font-black text-slate-400 border border-slate-100">
              {ev.tareas.filter(t => t.done).length}/{ev.tareas.length}
            </span>
          </div>
          <div className="space-y-4">
              {ev.tareas.map((t, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-50 animate-in slide-in-from-top-2">
                  <button onClick={() => onUpdate({...ev, tareas: ev.tareas.map((tt, i) => i === idx ? {...tt, done: !tt.done} : tt)})}>
                    {t.done ? <CheckCircle2 size={22} className="text-blue-500" /> : <Circle size={22} className="text-slate-200" />}
                  </button>
                  <span className={`text-sm font-bold flex-1 ${t.done ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{t.text}</span>
                  <button onClick={() => onUpdate({...ev, tareas: ev.tareas.filter((_, i) => i !== idx)})} className="text-slate-200 hover:text-rose-400"><X size={16}/></button>
                </div>
              ))}
              <div className="flex gap-3 mt-6">
                 <input className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" placeholder="Nuevo requerimiento..." value={task} onChange={e => setTask(e.target.value)} onKeyDown={e => {
                   if(e.key === 'Enter' && task) {
                     onUpdate({...ev, tareas: [...ev.tareas, { text: task, done: false }]});
                     setTask('');
                   }
                 }}/>
                 <button onClick={() => { if(task) { onUpdate({...ev, tareas: [...ev.tareas, { text: task, done: false }]}); setTask(''); } }} className="bg-slate-900 text-white p-4 rounded-2xl hover:scale-105 transition-all"><Plus size={20}/></button>
              </div>
          </div>
        </div>

        {/* Presupuesto del Evento */}
        <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <h5 className="font-black text-slate-900 flex items-center gap-3"><DollarSign size={22} className="text-amber-500"/> Costos Directos</h5>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase">Total Invertido</p>
              <span className="text-2xl font-black text-slate-900">
                ${(ev.gastos || []).reduce((a, b) => a + (parseFloat(b.costo) || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="space-y-3">
              {(ev.gastos || []).map((g, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                     <span className="text-sm font-bold text-slate-700">{g.text}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-900">${(parseFloat(g.costo) || 0).toLocaleString()}</span>
                    <button onClick={() => onUpdate({...ev, gastos: ev.gastos.filter((_, i) => i !== idx)})} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-400 transition-all"><X size={16}/></button>
                  </div>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                 <input className="flex-[2] bg-white p-4 rounded-2xl border border-slate-200 text-sm font-bold outline-none" placeholder="Concepto..." value={act} onChange={e => setAct(e.target.value)}/>
                 <div className="flex-1 flex gap-2">
                    <input className="w-full bg-white p-4 rounded-2xl border border-slate-200 text-sm font-bold outline-none" placeholder="$0" type="number" value={price} onChange={e => setPrice(e.target.value)}/>
                    <button onClick={() => {
                      if(act && price) {
                        onUpdate({...ev, gastos: [...(ev.gastos || []), { text: act, costo: parseFloat(price) }]});
                        setAct(''); setPrice('');
                      }
                    }} className="bg-amber-500 text-white p-4 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-amber-100"><Plus size={20}/></button>
                 </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsumoCard({ item, onDelete }) {
  const diff = new Date(item.lastDate).getTime() + (item.dias * 24 * 60 * 60 * 1000) - new Date().getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const isVencido = daysLeft <= 0;
  
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all">
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner"><Package size={28}/></div>
          <div>
            <h5 className="font-black text-slate-900 text-lg leading-tight">{item.nombre}</h5>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Material Impreso</p>
          </div>
        </div>
        <button onClick={onDelete} className="p-2 text-slate-200 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={20}/></button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
          <div className="p-1.5 bg-slate-50 rounded-lg"><Clock size={14} className="text-slate-400"/></div>
          <span className="uppercase tracking-tight">{item.sucursal}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
          <div className="p-1.5 bg-slate-50 rounded-lg"><Calendar size={14} className="text-slate-400"/></div>
          <span className="uppercase tracking-tight">Ciclo: {item.dias} días</span>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isVencido ? 'bg-rose-500 text-white animate-pulse' : 'bg-blue-600 text-white'}`}>
          {isVencido ? 'Renovación Urgente' : `${daysLeft} Días Restantes`}
        </div>
        <div className="text-right">
           <p className="text-[8px] font-black text-slate-400 uppercase">Frecuencia</p>
           <p className="text-[10px] font-black text-slate-900">MENSUAL</p>
        </div>
      </div>
    </div>
  );
}

function ExpressTask({ task, onToggle, onDelete }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-between group animate-in slide-in-from-bottom-2">
      <div className="flex items-center gap-6">
        <button onClick={onToggle} className="transition-transform active:scale-75">
          {task.done ? <CheckCircle2 size={32} className="text-emerald-500" /> : <Circle size={32} className="text-slate-100 group-hover:text-blue-200" />}
        </button>
        <div>
          <h5 className={`text-lg font-black transition-all tracking-tight ${task.done ? 'text-slate-300 line-through' : 'text-slate-800'}`}>{task.text}</h5>
          <div className="flex items-center gap-4 mt-2">
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${task.priority === 'Alta' ? 'bg-rose-100 text-rose-500' : 'bg-slate-100 text-slate-400'}`}>{task.priority}</span>
            <div className="h-1 w-1 rounded-full bg-slate-200"></div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Creado: {task.entry}</span>
            {task.exit && (
              <>
                <div className="h-1 w-1 rounded-full bg-emerald-200"></div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Listo: {task.exit}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <button onClick={onDelete} className="p-3 bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all">
         <Trash2 size={20} />
      </button>
    </div>
  );
}
