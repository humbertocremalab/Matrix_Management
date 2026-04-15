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
  X
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
      <Loader2 className="animate-spin text-blue-600" size={40} />
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
            <p className="text-xs text-slate-400">Manager</p>
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
                  <p className="text-slate-500 mt-1">Gestiona tus campañas y leads de Meta Ads</p>
                </div>
                <button 
                  onClick={() => {
                    if (isEditingMetrics) saveData({ metaData });
                    setIsEditingMetrics(!isEditingMetrics);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 transition-all"
                >
                  {isEditingMetrics ? <><Save size={16}/> Guardar</> : <><Edit2 size={16}/> Editar</>}
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
                <h3 className="font-bold text-lg">Checklist del Embudo</h3>
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
                <h3 className="font-bold text-lg">Artes del Embudo</h3>
                <div className="space-y-6">
                  <DriveCarousel 
                    title="Awareness" 
                    folderId={metaData.drive.awareness} 
                    onLink={(id) => {
                      const newMeta = {...metaData, drive: {...metaData.drive, awareness: id}};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                  />
                  <DriveCarousel 
                    title="Prospección" 
                    folderId={metaData.drive.prospeccion} 
                    onLink={(id) => {
                      const newMeta = {...metaData, drive: {...metaData.drive, prospeccion: id}};
                      setMetaData(newMeta);
                      saveData({ metaData: newMeta });
                    }}
                  />
                  <DriveCarousel 
                    title="Retargeting" 
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
                  <h2 className="text-3xl font-bold tracking-tight">Eventos</h2>
                  <p className="text-slate-500 mt-1">Gestiona tareas y gastos de tus eventos</p>
                </div>
                <button 
                  onClick={() => {
                    const nombre = prompt('Nombre del evento:');
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
              </header>

              <div className="grid grid-cols-1 gap-8">
                {eventos.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 font-medium">No hay eventos creados. Selecciona o crea uno para comenzar.</div>
                ) : (
                  eventos.map(ev => (
                    <EventCard key={ev.id} ev={ev} onUpdate={(updated) => {
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
                  <h2 className="text-3xl font-bold tracking-tight">Insumos y Renovaciones</h2>
                  <p className="text-slate-500 mt-1">Control de materiales impresos en sucursal</p>
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  <Plus size={18}/> Agregar
                </button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insumos.map(ins => (
                  <InsumoCard key={ins.id} item={ins} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'express' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500 max-w-3xl">
              <header>
                <h2 className="text-3xl font-bold tracking-tight">Tareas Express</h2>
                <p className="text-slate-500 mt-1">Tareas no planificadas del día a día</p>
              </header>
              <div className="flex gap-2">
                <input 
                  id="newExpress"
                  type="text" 
                  placeholder="Nueva tarea express..." 
                  className="flex-1 p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                  onKeyDown={e => {
                    if(e.key === 'Enter') {
                      const input = e.currentTarget;
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
                }} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-100">Agregar</button>
              </div>

              <div className="space-y-3">
                {express.map(task => (
                  <ExpressTask key={task.id} task={task} onToggle={() => {
                    const newExp = express.map(t => t.id === task.id ? {...t, done: !t.done, exit: !t.done ? new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'short'}) : null} : t);
                    setExpress(newExp);
                    saveData({ express: newExp });
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

// --- COMPONENTS ---

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

function MobileIcon({ active, icon, onClick }) {
  return (
    <button onClick={onClick} className={`p-2 rounded-lg ${active ? 'text-blue-600' : 'text-slate-400'}`}>
      {React.cloneElement(icon, { size: 24 })}
    </button>
  );
}

function MetricCard({ label, value, subtext, icon, editing, onChange, isCurrency }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        {editing ? (
          <input 
            type="number" 
            className="w-full text-xl font-black text-slate-800 border-b-2 border-blue-500 outline-none" 
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
    <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm ${color}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-black text-sm text-slate-800">{title}</h4>
        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
          {items.filter(i => i.done).length}/{items.length}
        </span>
      </div>
      <div className="space-y-3 min-h-[100px]">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 group">
            <button onClick={() => onUpdate(items.map(i => i.id === item.id ? {...i, done: !i.done} : i))}>
              {item.done ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} className="text-slate-300" />}
            </button>
            <span className={`text-sm font-medium flex-1 ${item.done ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{item.text}</span>
          </div>
        ))}
        <div className="flex gap-2 mt-4">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Nuevo item..." 
            className="flex-1 text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none"
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
          }} className="text-slate-400 hover:text-blue-500"><Plus size={16}/></button>
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
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
      </div>
      <div className="flex gap-2">
        <input 
          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500" 
          placeholder="URL o ID de carpeta de Google Drive..."
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button 
          onClick={() => {
            const id = url.includes('folders/') ? url.split('folders/')[1].split('?')[0] : url;
            onLink(id);
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-50"
        >
          Conectar
        </button>
      </div>
      
      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
      ) : files.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {files.map(f => (
            <div key={f.id} className="min-w-[120px] aspect-square bg-slate-50 rounded-xl overflow-hidden relative group">
              {f.thumbnailLink ? <img src={f.thumbnailLink} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-slate-200"/></div>}
              <a href={f.webContentLink} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <ExternalLink className="text-white" size={20} />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300">
          <FolderOpen size={40} className="mb-2 opacity-10" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Ingresa la URL o ID de una carpeta de Drive</p>
        </div>
      )}
    </div>
  );
}

function EventCard({ ev, onUpdate }) {
  const [task, setTask] = useState('');
  const [act, setAct] = useState('');
  const [price, setPrice] = useState('');

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Calendar size={24}/></div>
          <div>
            <h4 className="text-2xl font-black text-slate-800">{ev.nombre}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{ev.fecha}</p>
          </div>
        </div>
        <button className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={20}/></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <h5 className="font-bold flex items-center gap-2"><CheckCircle2 size={18} className="text-blue-500"/> Tareas</h5>
            <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-slate-400 border border-slate-100">
              {ev.tareas.filter(t => t.done).length}/{ev.tareas.length}
            </span>
          </div>
          <div className="space-y-3">
             {ev.tareas.map((t, idx) => (
               <div key={idx} className="flex items-center gap-3">
                 <button onClick={() => onUpdate({...ev, tareas: ev.tareas.map((tt, i) => i === idx ? {...tt, done: !tt.done} : tt)})}>
                   {t.done ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} className="text-slate-300" />}
                 </button>
                 <span className={`text-sm font-semibold flex-1 ${t.done ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{t.text}</span>
               </div>
             ))}
             <div className="flex gap-2">
                <input className="flex-1 bg-white p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none" placeholder="Nueva tarea..." value={task} onChange={e => setTask(e.target.value)} onKeyDown={e => {
                  if(e.key === 'Enter' && task) {
                    onUpdate({...ev, tareas: [...ev.tareas, { text: task, done: false }]});
                    setTask('');
                  }
                }}/>
                <button onClick={() => { if(task) { onUpdate({...ev, tareas: [...ev.tareas, { text: task, done: false }]}); setTask(''); } }} className="bg-white p-3 border border-slate-200 rounded-xl"><Plus size={18}/></button>
             </div>
          </div>
        </div>

        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <h5 className="font-bold flex items-center gap-2"><DollarSign size={18} className="text-amber-500"/> Gastos / Actividades</h5>
            <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-slate-400 border border-slate-100">
              ${ev.gastos.reduce((a, b) => a + (parseFloat(b.costo) || 0), 0).toLocaleString()}
            </span>
          </div>
          <div className="space-y-3">
             {ev.gastos.map((g, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                 <span className="text-sm font-bold text-slate-600">{g.text}</span>
                 <span className="text-sm font-black text-slate-800">${g.costo.toLocaleString()}</span>
               </div>
             ))}
             <div className="flex gap-2">
                <input className="flex-1 bg-white p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none" placeholder="Actividad..." value={act} onChange={e => setAct(e.target.value)}/>
                <input className="w-24 bg-white p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none" placeholder="$" value={price} onChange={e => setPrice(e.target.value)}/>
                <button onClick={() => {
                  if(act && price) {
                    onUpdate({...ev, gastos: [...ev.gastos, { text: act, costo: parseFloat(price) }]});
                    setAct(''); setPrice('');
                  }
                }} className="bg-white p-3 border border-slate-200 rounded-xl"><Plus size={18}/></button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsumoCard({ item }) {
  const daysLeft = 15; // Mock logic
  const isVencido = daysLeft <= 0;
  
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center"><Package size={20}/></div>
          <div>
            <h5 className="font-bold text-slate-800 leading-tight">{item.nombre}</h5>
            <p className="text-[10px] font-bold text-slate-400">Tríptico</p>
          </div>
        </div>
        <button className="text-slate-200 hover:text-slate-400 transition-colors"><MoreHorizontal size={20}/></button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <Clock size={12}/> Sucursal Centro
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <Calendar size={12}/> Renueva: 19 abr 2026
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${isVencido ? 'bg-rose-100 text-rose-500' : 'bg-blue-100 text-blue-600'}`}>
          {isVencido ? 'Vencido' : `${daysLeft}d restantes`}
        </div>
        <span className="text-[10px] font-bold text-slate-400">Cada {item.dias}d</span>
      </div>
    </div>
  );
}

function ExpressTask({ task, onToggle }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <button onClick={onToggle}>
          {task.done ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Circle size={24} className="text-slate-200" />}
        </button>
        <div>
          <h5 className={`font-bold transition-all ${task.done ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{task.text}</h5>
          <div className="flex gap-4 mt-1">
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${task.priority === 'Alta' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>{task.priority}</span>
            <span className="text-[10px] font-bold text-slate-300">Entrada: {task.entry}</span>
            {task.exit && <span className="text-[10px] font-bold text-emerald-400">Completada: {task.exit}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function UsersIcon({color}) { return <div className={`p-2 rounded-xl ${color}`}><LayoutDashboard size={20}/></div> }
function TargetIcon({color}) { return <div className={`p-2 rounded-xl ${color}`}><Zap size={20}/></div> }
function MoneyIcon({color}) { return <div className={`p-2 rounded-xl ${color}`}><DollarSign size={20}/></div> }
function ChartIcon({color}) { return <div className={`p-2 rounded-xl ${color}`}><LayoutDashboard size={20}/></div> }
