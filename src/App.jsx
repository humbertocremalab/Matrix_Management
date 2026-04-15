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
  TrendingUp,
  Users
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
  const [activeTab, setActiveTab] = useState('meta');
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados de datos
  const [metaData, setMetaData] = useState({
    metrics: { leads: 145, metaLeads: 200, budget: 15000, spent: 8750 },
    checklists: {
      awareness: [{ id: 1, text: 'Creativos de video listos', done: true }, { id: 2, text: 'Segmentación configurada', done: false }],
      prospeccion: [{ id: 3, text: 'Landing page optimizada', done: true }, { id: 4, text: 'Formulario de contacto activo', done: false }],
      retargeting: [{ id: 5, text: 'Audiencias personalizadas creadas', done: false }, { id: 6, text: 'Pixel instalado en web', done: true }]
    },
    drive: { awareness: '', prospeccion: '', retargeting: '' }
  });

  const [eventos, setEventos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [express, setExpress] = useState([]);

  // Auth
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
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
      setLoading(false);
    }, (error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
    });
  }, [user]);

  const saveData = async (updates) => {
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'main_data');
    await setDoc(docRef, {
      metaData, eventos, insumos, express, ...updates
    }, { merge: true });
  };

  if (!user || loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium animate-pulse text-sm">Cargando Matrix Hub...</p>
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
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Matrix Hub</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem active={activeTab === 'meta'} icon={<Zap size={18}/>} label="Embudo Meta" onClick={() => setActiveTab('meta')} />
          <NavItem active={activeTab === 'eventos'} icon={<Calendar size={18}/>} label="Eventos" onClick={() => setActiveTab('eventos')} />
          <NavItem active={activeTab === 'insumos'} icon={<Package size={18}/>} label="Insumos" onClick={() => setActiveTab('insumos')} />
          <NavItem active={activeTab === 'express'} icon={<Zap size={18}/>} label="Express" onClick={() => setActiveTab('express')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={() => signOut(auth)} className="flex items-center gap-3 w-full p-3 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all">
            <LogOut size={18} /> <span className="text-sm font-bold">Cerrar sesión</span>
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
                  <h2 className="text-3xl font-black tracking-tight">Embudo Meta</h2>
                  <p className="text-slate-500 mt-1 font-medium">Gestiona tus campañas y leads de Meta Ads</p>
                </div>
                <button 
                  onClick={() => {
                    if (isEditingMetrics) saveData({ metaData });
                    setIsEditingMetrics(!isEditingMetrics);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${isEditingMetrics ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  {isEditingMetrics ? <><Save size={16}/> Guardar</> : <><Edit2 size={16}/> Editar Métricas</>}
                </button>
              </header>

              {/* Métricas Principales */}
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

              {/* Checklist Embudo */}
              <div className="space-y-4">
                <h3 className="font-black text-lg text-slate-800">Checklist Operativo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ChecklistCol 
                    title="Awareness" 
                    items={metaData.checklists.awareness} 
                    color="border-l-4 border-blue-500"
                    onUpdate={(items) => {
                      const newMeta = { ...metaData, checklists: { ...metaData.checklists, awareness: items }};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
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
                  />
                </div>
              </div>

              {/* Artes del Embudo */}
              <div className="space-y-6">
                <h3 className="font-black text-lg text-slate-800">Galería de Creativos (Drive)</h3>
                <div className="space-y-6">
                  <DriveCarousel 
                    title="Creativos: Awareness" 
                    folderId={metaData.drive.awareness} 
                    onLink={(id) => {
                      const newMeta = {...metaData, drive: {...metaData.drive, awareness: id}};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                  />
                  <DriveCarousel 
                    title="Creativos: Prospección" 
                    folderId={metaData.drive.prospeccion} 
                    onLink={(id) => {
                      const newMeta = {...metaData, drive: {...metaData.drive, prospeccion: id}};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                  />
                  <DriveCarousel 
                    title="Creativos: Retargeting" 
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
                  <h2 className="text-3xl font-black tracking-tight">Eventos</h2>
                  <p className="text-slate-500 mt-1 font-medium">Gestiona tareas y presupuestos de tus eventos</p>
                </div>
                <button 
                  onClick={() => {
                    const nombre = prompt('Nombre del evento:');
                    if(nombre) {
                      const newEventos = [...eventos, { id: Date.now(), nombre, fecha: new Date().toLocaleDateString('es-ES'), tareas: [], gastos: [] }];
                      setEventos(newEventos);
                      saveData({ eventos: newEventos });
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  <Plus size={18}/> Nuevo Evento
                </button>
              </header>

              <div className="grid grid-cols-1 gap-8">
                {eventos.length === 0 ? (
                  <div className="py-24 border-4 border-dashed border-slate-100 rounded-[3rem] text-center flex flex-col items-center justify-center space-y-4">
                    <Calendar size={60} className="text-slate-200" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay eventos registrados</p>
                  </div>
                ) : (
                  eventos.map(ev => (
                    <EventCard key={ev.id} ev={ev} onUpdate={(updated) => {
                      const newEventos = eventos.map(e => e.id === ev.id ? updated : e);
                      setEventos(newEventos);
                      saveData({ eventos: newEventos });
                    }} 
                    onDelete={() => {
                        const newEventos = eventos.filter(e => e.id !== ev.id);
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
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <header className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">Insumos y Stock</h2>
                  <p className="text-slate-500 mt-1 font-medium">Control de materiales impresos en sucursales</p>
                </div>
                <button 
                  onClick={() => {
                    const nombre = prompt('Nombre del material:');
                    if(nombre) {
                      const newInsumos = [...insumos, { id: Date.now(), nombre, sucursal: 'Sucursal Centro', dias: 30, lastDate: new Date().toISOString() }];
                      setInsumos(newInsumos);
                      saveData({ insumos: newInsumos });
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  <Plus size={18}/> Agregar Material
                </button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insumos.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">Sin insumos listados</div>
                ) : (
                  insumos.map(ins => (
                    <InsumoCard key={ins.id} item={ins} onDelete={() => {
                        const newInsumos = insumos.filter(i => i.id !== ins.id);
                        setInsumos(newInsumos);
                        saveData({ insumos: newInsumos });
                    }} />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'express' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500 max-w-3xl">
              <header>
                <h2 className="text-3xl font-black tracking-tight">Tareas Express</h2>
                <p className="text-slate-500 mt-1 font-medium">Bomberazos y tareas no planificadas del día</p>
              </header>
              <div className="flex gap-2">
                <input 
                  id="newExpress"
                  type="text" 
                  placeholder="Escribe algo rápido y presiona Enter..." 
                  className="flex-1 p-5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700" 
                  onKeyDown={e => {
                    if(e.key === 'Enter') {
                      const input = e.currentTarget;
                      if(!input.value) return;
                      const newExpress = [...express, { id: Date.now(), text: input.value, entry: new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}), done: false, priority: 'Media' }];
                      setExpress(newExpress);
                      saveData({ express: newExpress });
                      input.value = '';
                    }
                  }}
                />
                <button onClick={() => {
                   const input = document.getElementById('newExpress');
                   if(input.value) {
                    const newExpress = [...express, { id: Date.now(), text: input.value, entry: new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}), done: false, priority: 'Media' }];
                    setExpress(newExpress);
                    saveData({ express: newExpress });
                    input.value = '';
                   }
                }} className="bg-blue-600 text-white px-8 py-2 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">AGREGAR</button>
              </div>

              <div className="space-y-3">
                {express.length === 0 ? (
                  <div className="py-12 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">Bandeja de entrada vacía</div>
                ) : (
                  express.map(task => (
                    <ExpressTask key={task.id} task={task} onToggle={() => {
                      const newExp = express.map(t => t.id === task.id ? {...t, done: !t.done, exit: !t.done ? new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}) : null} : t);
                      setExpress(newExp);
                      saveData({ express: newExp });
                    }} 
                    onDelete={() => {
                        const newExp = express.filter(t => t.id !== task.id);
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
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
    >
      {icon} <span className="text-sm">{label}</span>
    </button>
  );
}

function MobileIcon({ active, icon, onClick }) {
  return (
    <button onClick={onClick} className={`p-3 rounded-xl transition-all ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}>
      {React.cloneElement(icon, { size: 22 })}
    </button>
  );
}

function MetricCard({ label, value, subtext, icon, editing, onChange, isCurrency }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
        {editing ? (
          <input 
            type="number" 
            className="w-full text-xl font-black text-slate-800 border-b-2 border-blue-500 outline-none bg-blue-50/50 px-2 rounded-t-lg" 
            defaultValue={typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value} 
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
          />
        ) : (
          <div className="text-2xl font-black text-slate-800">{value}</div>
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
        <h4 className="font-black text-sm text-slate-800 tracking-tight">{title}</h4>
        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
          {items.filter(i => i.done).length}/{items.length}
        </span>
      </div>
      <div className="space-y-3 min-h-[120px]">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 group">
            <button 
              className="hover:scale-110 transition-transform"
              onClick={() => onUpdate(items.map(i => i.id === item.id ? {...i, done: !i.done} : i))}
            >
              {item.done ? <CheckCircle2 size={20} className="text-blue-500" /> : <Circle size={20} className="text-slate-200" />}
            </button>
            <span className={`text-sm font-bold flex-1 transition-all ${item.done ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{item.text}</span>
            <button 
                onClick={() => onUpdate(items.filter(i => i.id !== item.id))}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
            >
                <X size={14}/>
            </button>
          </div>
        ))}
        <div className="flex gap-2 mt-6">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Añadir..." 
            className="flex-1 text-xs font-bold p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
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
          }} className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded-xl text-slate-400 hover:bg-blue-600 hover:text-white transition-all"><Plus size={18}/></button>
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
    } else {
        setFiles([]);
    }
  }, [folderId]);

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-black text-slate-800 text-sm">{title}</h4>
        {folderId && (
            <button onClick={() => onLink('')} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Desvincular</button>
        )}
      </div>
      <div className="flex gap-2">
        <input 
          className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10" 
          placeholder="Pega la URL de la carpeta de Google Drive aquí..."
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button 
          onClick={() => {
            let id = url;
            if(url.includes('folders/')) {
                 id = url.split('folders/')[1].split('?')[0].split('/')[0];
            }
            onLink(id);
          }}
          className="bg-blue-600 text-white px-8 py-2 rounded-2xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
        >
          CONECTAR
        </button>
      </div>
      
      {loading ? (
        <div className="py-16 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-500" size={30} />
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizando Drive...</p>
        </div>
      ) : files.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide">
          {files.map(f => (
            <div key={f.id} className="min-w-[140px] aspect-square bg-slate-50 rounded-2xl overflow-hidden relative group shadow-sm">
              {f.thumbnailLink ? (
                  <img src={f.thumbnailLink.replace('s220', 's500')} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-slate-200" size={30}/></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-3">
                 <p className="text-[9px] text-white font-bold truncate mb-2">{f.name}</p>
                 <a href={f.webContentLink} target="_blank" className="w-full bg-white text-black py-1.5 rounded-lg text-[10px] font-black text-center flex items-center justify-center gap-2">
                    VER ARCHIVO <ExternalLink size={10} />
                 </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 border-4 border-dashed border-slate-50 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 space-y-3">
          <FolderOpen size={48} className="opacity-10" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-center px-10 leading-relaxed">Configura el acceso público en Drive para visualizar los creativos aquí</p>
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
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 group">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-inner shadow-blue-100/50"><Calendar size={32}/></div>
          <div>
            <h4 className="text-3xl font-black text-slate-800 tracking-tight">{ev.nombre}</h4>
            <div className="flex items-center gap-3 mt-1">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{ev.fecha}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest">Activo</span>
            </div>
          </div>
        </div>
        <button 
            onClick={() => { if(confirm('¿Eliminar evento?')) onDelete() }}
            className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
        >
            <Trash2 size={22}/>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Columna Tareas */}
        <div className="bg-slate-50/40 p-8 rounded-[2rem] border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <h5 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                <CheckCircle2 size={18} className="text-blue-500"/> LOGÍSTICA
            </h5>
            <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 border border-slate-100 shadow-sm">
              {ev.tareas.filter(t => t.done).length}/{ev.tareas.length} COMPLETADO
            </span>
          </div>
          <div className="space-y-4">
             {ev.tareas.map((t, idx) => (
               <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-50 shadow-sm">
                 <button 
                    className="hover:scale-110 transition-transform"
                    onClick={() => onUpdate({...ev, tareas: ev.tareas.map((tt, i) => i === idx ? {...tt, done: !tt.done} : tt)})}
                 >
                   {t.done ? <CheckCircle2 size={22} className="text-emerald-500" /> : <Circle size={22} className="text-slate-200" />}
                 </button>
                 <span className={`text-sm font-bold flex-1 transition-all ${t.done ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{t.text}</span>
                 <button onClick={() => onUpdate({...ev, tareas: ev.tareas.filter((_, i) => i !== idx)})}>
                    <X size={14} className="text-slate-200 hover:text-rose-500" />
                 </button>
               </div>
             ))}
             <div className="flex gap-2 pt-2">
                <input 
                    className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/5 shadow-sm" 
                    placeholder="Escribir tarea..." 
                    value={task} 
                    onChange={e => setTask(e.target.value)} 
                    onKeyDown={e => {
                        if(e.key === 'Enter' && task) {
                            onUpdate({...ev, tareas: [...ev.tareas, { text: task, done: false }]});
                            setTask('');
                        }
                    }}
                />
                <button 
                    onClick={() => { if(task) { onUpdate({...ev, tareas: [...ev.tareas, { text: task, done: false }]}); setTask(''); } }} 
                    className="bg-blue-600 text-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg shadow-blue-100 active:scale-90 transition-all"
                >
                    <Plus size={24}/>
                </button>
             </div>
          </div>
        </div>

        {/* Columna Gastos */}
        <div className="bg-slate-50/40 p-8 rounded-[2rem] border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <h5 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                <DollarSign size={18} className="text-amber-500"/> PRESUPUESTO
            </h5>
            <span className="bg-amber-500 px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-lg shadow-amber-100">
              $ {ev.gastos.reduce((a, b) => a + (parseFloat(b.costo) || 0), 0).toLocaleString()} TOTAL
            </span>
          </div>
          <div className="space-y-4">
             {ev.gastos.map((g, idx) => (
               <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-50 rounded-2xl shadow-sm group/item">
                 <div>
                    <span className="text-sm font-black text-slate-700 block">{g.text}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Concepto Registrado</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-lg font-black text-slate-800">${parseFloat(g.costo).toLocaleString()}</span>
                    <button onClick={() => onUpdate({...ev, gastos: ev.gastos.filter((_, i) => i !== idx)})} className="opacity-0 group-hover/item:opacity-100 text-rose-500">
                        <Trash2 size={16}/>
                    </button>
                 </div>
               </div>
             ))}
             <div className="flex gap-2 pt-2">
                <input className="flex-[2] bg-white p-4 rounded-2xl border border-slate-200 text-sm font-bold outline-none shadow-sm" placeholder="Concepto..." value={act} onChange={e => setAct(e.target.value)}/>
                <input className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 text-sm font-black outline-none shadow-sm" placeholder="$" type="number" value={price} onChange={e => setPrice(e.target.value)}/>
                <button onClick={() => {
                  if(act && price) {
                    onUpdate({...ev, gastos: [...ev.gastos, { text: act, costo: parseFloat(price) }]});
                    setAct(''); setPrice('');
                  }
                }} className="bg-amber-500 text-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg shadow-amber-100 active:scale-90 transition-all">
                    <Plus size={24}/>
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsumoCard({ item, onDelete }) {
  // Simulación de lógica de vencimiento basada en días
  const daysLeft = 15; 
  const isVencido = daysLeft <= 0;
  
  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all border-b-4 border-b-slate-100">
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><Package size={28}/></div>
          <div>
            <h5 className="font-black text-slate-800 leading-tight text-lg">{item.nombre}</h5>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Stock Sucursal</p>
          </div>
        </div>
        <button onClick={() => { if(confirm('¿Eliminar insumo?')) onDelete() }} className="text-slate-100 hover:text-rose-500 transition-all"><X size={20}/></button>
      </div>
      
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span className="flex items-center gap-2"><Clock size={14}/> {item.sucursal}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span className="flex items-center gap-2"><Calendar size={14}/> PRÓXIMA RENOVACIÓN</span>
          <span className="text-slate-800">19 ABR 2026</span>
        </div>
      </div>

      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isVencido ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'}`}>
          {isVencido ? 'VENCIDO' : `${daysLeft} DÍAS RESTANTES`}
        </div>
        <div className="text-right">
            <span className="text-[9px] font-black text-slate-400 uppercase block">CICLO</span>
            <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">CADA {item.dias} DÍAS</span>
        </div>
      </div>
    </div>
  );
}

function ExpressTask({ task, onToggle, onDelete }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-blue-50/50 transition-all flex items-center justify-between group">
      <div className="flex items-center gap-5 flex-1">
        <button 
            className="hover:scale-110 transition-transform active:scale-90"
            onClick={onToggle}
        >
          {task.done ? (
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center"><CheckCircle2 size={24} /></div>
          ) : (
              <div className="w-10 h-10 bg-slate-50 text-slate-200 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200"><Circle size={24} /></div>
          )}
        </button>
        <div className="flex-1">
          <h5 className={`font-black text-lg transition-all ${task.done ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{task.text}</h5>
          <div className="flex gap-4 mt-2 items-center">
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${task.priority === 'Alta' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                PRIORIDAD {task.priority}
            </span>
            <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                <Clock size={12}/> ENTRADA: {task.entry}
            </span>
            {task.done && task.exit && (
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                   <Zap size={10}/> LISTO: {task.exit}
                </span>
            )}
          </div>
        </div>
      </div>
      <button 
        onClick={() => { if(confirm('¿Borrar esta tarea express?')) onDelete() }}
        className="opacity-0 group-hover:opacity-100 p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
      >
        <Trash2 size={20}/>
      </button>
    </div>
  );
}

// Icons
function UsersIcon({color}) { return <div className={`p-3 rounded-2xl shadow-sm ${color}`}><Users size={22}/></div> }
function TargetIcon({color}) { return <div className={`p-3 rounded-2xl shadow-sm ${color}`}><Zap size={22}/></div> }
function MoneyIcon({color}) { return <div className={`p-3 rounded-2xl shadow-sm ${color}`}><DollarSign size={22}/></div> }
function ChartIcon({color}) { return <div className={`p-3 rounded-2xl shadow-sm ${color}`}><TrendingUp size={22}/></div> }
