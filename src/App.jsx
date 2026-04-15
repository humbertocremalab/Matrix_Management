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
  Target,
  TrendingUp,
  Store,
  Layers
} from 'lucide-react';

// Firebase
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// --- CONFIG ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'account-matrix-hub-v1';

// --- MODAL COMPONENT (Custom Popup) ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="flex items-center justify-between p-8 border-b border-slate-50">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [branchTab, setBranchTab] = useState('matriz'); 
  const [loading, setLoading] = useState(true);
  
  // State for business data
  const [events, setEvents] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState({
    matriz: { leads: 120, sales: 45, conversion: 37.5 },
    sucursal1: { leads: 85, sales: 22, conversion: 25.8 },
    sucursal2: { leads: 94, sales: 31, conversion: 32.9 }
  });

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // New Item States
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '' });
  const [newItem, setNewItem] = useState({ name: '', stock: '' });

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'mainStore');
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.events) setEvents(data.events);
        if (data.inventory) setInventory(data.inventory);
        if (data.tasks) setTasks(data.tasks);
        if (data.metrics) setMetrics(data.metrics);
      }
    }, (err) => console.error("Error al obtener datos:", err));
    return () => unsub();
  }, [user]);

  const saveData = async (updates) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'mainStore');
    const newData = { events, inventory, tasks, metrics, ...updates };
    await setDoc(docRef, newData);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    const updated = [...events, { ...newEvent, id: Date.now() }];
    setEvents(updated);
    saveData({ events: updated });
    setNewEvent({ title: '', date: '', time: '' });
    setIsEventModalOpen(false);
  };

  const handleSaveInventory = () => {
    if (!newItem.name || !newItem.stock) return;
    let updated;
    if (editingItem) {
      updated = inventory.map(item => item.id === editingItem.id ? { ...newItem, id: item.id } : item);
    } else {
      updated = [...inventory, { ...newItem, id: Date.now() }];
    }
    setInventory(updated);
    saveData({ inventory: updated });
    setNewItem({ name: '', stock: '' });
    setEditingItem(null);
    setIsInventoryModalOpen(false);
  };

  const openEditInventory = (item) => {
    setEditingItem(item);
    setNewItem({ name: item.name, stock: item.stock });
    setIsInventoryModalOpen(true);
  };

  const toggleTask = (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done, exit: !t.done ? new Date().toLocaleTimeString() : null } : t);
    setTasks(updated);
    saveData({ tasks: updated });
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
        </div>
        <h2 className="mt-8 text-xl font-black text-slate-900 uppercase tracking-[0.3em]">Cargando Hub</h2>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      
      {/* Sidebar - Estilo Matrix Hub */}
      <nav className="w-24 md:w-80 bg-white border-r border-slate-100 flex flex-col items-center py-12 transition-all duration-500 z-10">
        <div className="mb-16 group flex flex-col items-center px-8 w-full">
          <div className="w-full aspect-square md:aspect-auto md:h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-slate-200 group-hover:scale-105 transition-all duration-500 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-transparent"></div>
            <Zap className="text-white fill-white relative z-10" size={32} />
          </div>
          <span className="mt-6 text-[10px] font-black tracking-[0.5em] text-slate-400 uppercase hidden md:block">Matrix Hub</span>
        </div>
        
        <div className="flex flex-col gap-4 w-full px-6">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={24}/>} label="Dashboard" />
          <NavItem active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<Calendar size={24}/>} label="Agenda" />
          <NavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={24}/>} label="Insumos" />
          <NavItem active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} icon={<Layers size={24}/>} label="Embudo Meta" />
        </div>

        <div className="mt-auto pb-8 w-full px-8">
          <div className="bg-slate-50 rounded-[2rem] p-5 flex items-center gap-4 border border-slate-100 group cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black shadow-lg">A</div>
            <div className="hidden md:block overflow-hidden">
              <p className="text-xs font-black text-slate-900 uppercase truncate tracking-tighter">Admin Account</p>
              <p className="text-[10px] font-bold text-slate-400">Ver Perfil</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-16 relative">
        
        {/* Modals Personalizados */}
        <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Agendar Evento">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nombre del Evento</label>
              <input 
                type="text" 
                placeholder="Sesión Fotográfica..." 
                className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-800"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Fecha</label>
                <input 
                  type="date" 
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-800"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Hora</label>
                <input 
                  type="time" 
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-800"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                />
              </div>
            </div>
            <button 
              onClick={handleAddEvent}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-200 transition-all uppercase tracking-widest text-sm"
            >
              Crear Evento
            </button>
          </div>
        </Modal>

        <Modal 
          isOpen={isInventoryModalOpen} 
          onClose={() => {setIsInventoryModalOpen(false); setEditingItem(null);}} 
          title={editingItem ? "Editar Insumo" : "Nuevo Insumo"}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Descripción</label>
              <input 
                type="text" 
                placeholder="Nombre del insumo..." 
                className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-800"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Stock Disponible</label>
              <input 
                type="number" 
                placeholder="0" 
                className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-800"
                value={newItem.stock}
                onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
              />
            </div>
            <button 
              onClick={handleSaveInventory}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest text-sm"
            >
              {editingItem ? "Actualizar Insumo" : "Añadir a Inventario"}
            </button>
          </div>
        </Modal>

        {/* Header Estilo Premium */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-12 bg-indigo-600"></span>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">AccountMatrix Hub</p>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
              {activeTab === 'dashboard' && "CENTRAL"}
              {activeTab === 'calendar' && "AGENDA"}
              {activeTab === 'inventory' && "INSUMOS"}
              {activeTab === 'marketing' && "META ADS"}
            </h1>
          </div>
          
          <div className="flex gap-4">
            <button className="h-16 px-8 bg-white border border-slate-100 rounded-[1.5rem] font-black text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all flex items-center gap-3 uppercase text-xs tracking-widest shadow-sm">
              <FolderOpen size={20} />
              Drive
            </button>
            <button 
              onClick={() => {
                if (activeTab === 'calendar') setIsEventModalOpen(true);
                else if (activeTab === 'inventory') setIsInventoryModalOpen(true);
              }}
              className="h-16 px-10 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-black transition-all shadow-2xl shadow-slate-200 flex items-center gap-3 uppercase text-xs tracking-widest"
            >
              <Plus size={24} strokeWidth={3} />
              Agregar
            </button>
          </div>
        </header>

        {/* Tab Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DashCard title="Agenda Hoy" accent="indigo">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">{events[0]?.title || "Nada agendado"}</h4>
                      <p className="text-sm font-bold text-slate-400 mt-2">{events[0]?.date || "Revisa tu calendario"}</p>
                    </div>
                    <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-900">
                      <Clock size={32} />
                    </div>
                  </div>
                </DashCard>
                <DashCard title="Inventario" accent="amber">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">{inventory.length} Insumos</h4>
                      <p className="text-sm font-bold text-amber-500 mt-2">Control de Stock</p>
                    </div>
                    <div className="w-16 h-16 bg-amber-50 rounded-[1.5rem] flex items-center justify-center text-amber-500">
                      <Package size={32} />
                    </div>
                  </div>
                </DashCard>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Checklist de Operación</h3>
                  <button className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"><MoreHorizontal /></button>
                </div>
                <div className="space-y-5">
                  {tasks.length > 0 ? tasks.map(task => (
                    <TaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
                  )) : <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 font-black uppercase tracking-widest">Sin tareas activas</div>}
                </div>
              </div>
            </div>

            {/* Sidebar Dash */}
            <div className="space-y-10">
              <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-600/30 rounded-full blur-3xl"></div>
                <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] mb-6">Ingresos / Mes</h3>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-5xl font-black tracking-tighter">$45.2k</span>
                  <span className="text-emerald-400 text-sm font-black">+12%</span>
                </div>
                <p className="text-slate-400 text-xs font-bold leading-relaxed max-w-[200px]">Rendimiento actual basado en sucursales matriz.</p>
                <button className="mt-12 w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3">
                  Reporte <ExternalLink size={14} />
                </button>
              </div>

              <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-8">Actividad</h3>
                <div className="space-y-8">
                  <ActivityItem label="Stock Actualizado" time="Hace 2h" color="bg-indigo-600" />
                  <ActivityItem label="Nueva Venta Matriz" time="Hace 5h" color="bg-emerald-500" />
                  <ActivityItem label="Agenda Modificada" time="Ayer" color="bg-amber-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Calendario */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-6">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Abril 2026</h3>
                <div className="flex gap-2">
                  <button className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all flex items-center justify-center"><ChevronLeft size={20}/></button>
                  <button className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all flex items-center justify-center"><ChevronRight size={20}/></button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-6 mb-6">
              {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(d => (
                <div key={d} className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-6">
               {Array.from({length: 30}).map((_, i) => (
                 <div key={i} className="aspect-square border border-slate-50 rounded-[1.5rem] p-4 hover:bg-slate-50 transition-all cursor-pointer group relative">
                    <span className="text-lg font-black text-slate-300 group-hover:text-slate-900">{i+1}</span>
                    {events.some(e => e.date.includes(`-${String(i+1).padStart(2, '0')}`)) && (
                      <div className="absolute bottom-4 right-4 w-2 h-2 bg-indigo-600 rounded-full"></div>
                    )}
                 </div>
               ))}
            </div>
            <div className="mt-16 space-y-4">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Eventos Próximos</h4>
               {events.map(event => (
                 <div key={event.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-slate-100 transition-all">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Calendar size={24}/></div>
                       <div>
                          <p className="font-black text-slate-900 uppercase tracking-tighter text-lg">{event.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.date} • {event.time || 'Horario pendiente'}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => {
                        const updated = events.filter(e => e.id !== event.id);
                        setEvents(updated);
                        saveData({ events: updated });
                      }}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={20}/>
                    </button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Tab Inventario */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
               <div className="space-y-1">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Listado de Insumos</h3>
                  <p className="text-sm font-bold text-slate-400">Control de activos y materiales.</p>
               </div>
               <div className="relative w-full md:w-96">
                  <input type="text" placeholder="Buscar..." className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-3xl border-none focus:ring-2 focus:ring-indigo-600 font-bold text-sm" />
                  <Package className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-slate-50">
                        <th className="pb-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-left">Ref</th>
                        <th className="pb-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-left">Insumo</th>
                        <th className="pb-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-left">Status</th>
                        <th className="pb-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-left">Stock</th>
                        <th className="pb-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-right">Acción</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {inventory.map((item, idx) => (
                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                           <td className="py-8 font-black text-slate-400 text-[10px]">#00{idx+1}</td>
                           <td className="py-8">
                              <span className="font-black text-slate-900 uppercase tracking-tighter text-lg">{item.name}</span>
                           </td>
                           <td className="py-8">
                              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${parseInt(item.stock) > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                 {parseInt(item.stock) > 5 ? 'Disponible' : 'Crítico'}
                              </span>
                           </td>
                           <td className="py-8">
                              <div className="flex items-center gap-3">
                                 <span className="text-2xl font-black text-slate-900 leading-none">{item.stock}</span>
                                 <span className="text-[10px] font-black text-slate-300 uppercase">Unid.</span>
                              </div>
                           </td>
                           <td className="py-8 text-right">
                              <button 
                                onClick={() => openEditInventory(item)}
                                className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 transition-all ml-auto"
                              >
                                <MoreHorizontal size={24} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* Tab Marketing / Embudo Meta */}
        {activeTab === 'marketing' && (
          <div className="space-y-12">
            {/* Branch Selection Tabs */}
            <div className="flex gap-3 p-2 bg-white border border-slate-100 rounded-[2rem] w-fit shadow-sm">
              {['matriz', 'sucursal1', 'sucursal2'].map((branch) => (
                <button 
                  key={branch}
                  onClick={() => setBranchTab(branch)}
                  className={`px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all ${branchTab === branch ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  {branch === 'matriz' ? 'Sede Central' : branch.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <MarketingMetric 
                label="Leads Meta" 
                value={metrics[branchTab].leads} 
                sub="Adquisición"
                icon={<Target size={28} />}
                color="text-indigo-600"
                bg="bg-indigo-50"
              />
              <MarketingMetric 
                label="Conversiones" 
                value={metrics[branchTab].sales} 
                sub="Ventas"
                icon={<TrendingUp size={28} />}
                color="text-emerald-600"
                bg="bg-emerald-50"
              />
              <MarketingMetric 
                label="ROI Ratio" 
                value={`${metrics[branchTab].conversion}%`} 
                sub="Eficiencia"
                icon={<Zap size={28} />}
                color="text-amber-600"
                bg="bg-amber-50"
              />
            </div>

            <div className="bg-white rounded-[3.5rem] p-16 border border-slate-100 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-16 relative z-10">Performance Funnel: {branchTab}</h3>
              <div className="space-y-8 max-w-3xl mx-auto relative z-10">
                <FunnelLayer label="Alcance Facebook/Insta" value="15.4k" width="w-full" color="bg-slate-900" />
                <FunnelLayer label="Click-through" value="2,100" width="w-[85%]" color="bg-indigo-600" />
                <FunnelLayer label="Contactos" value={metrics[branchTab].leads} width="w-[60%]" color="bg-indigo-500" />
                <FunnelLayer label="Conversión Final" value={metrics[branchTab].sales} width="w-[30%]" color="bg-emerald-500" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-components estilizados Matrix Hub
function NavItem({ active, icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-6 px-8 py-5 rounded-[1.75rem] transition-all duration-500 w-full group ${active ? 'bg-slate-900 text-white shadow-2xl translate-x-3 scale-105' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
    >
      <div className={`transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
      <span className="font-black text-[10px] uppercase tracking-[0.2em] hidden md:block whitespace-nowrap">{label}</span>
    </button>
  );
}

function DashCard({ title, children, accent }) {
  return (
    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">{title}</p>
      {children}
    </div>
  );
}

function TaskItem({ task, onToggle }) {
  return (
    <div className={`p-6 rounded-[2rem] border transition-all duration-300 flex items-center justify-between group cursor-pointer ${task.done ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/20'}`} onClick={onToggle}>
      <div className="flex items-center gap-6">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${task.done ? 'bg-indigo-600 text-white scale-90' : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400'}`}>
          {task.done ? <CheckCircle2 size={24} strokeWidth={3} /> : <Circle size={24} strokeWidth={2} />}
        </div>
        <div>
          <h5 className={`text-lg font-black tracking-tighter uppercase transition-all ${task.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.text}</h5>
          <div className="flex gap-4 mt-2">
            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${task.priority === 'Alta' ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400'}`}>{task.priority}</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase">Ref: {task.entry}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ label, time, color }) {
  return (
    <div className="flex items-center gap-5 group">
      <div className={`w-3 h-3 rounded-full ${color} shadow-lg ring-4 ring-transparent group-hover:ring-slate-50 transition-all`}></div>
      <div className="flex-1 border-b border-slate-50 pb-4 group-last:border-none">
        <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{label}</p>
        <p className="text-[10px] font-bold text-slate-300 uppercase">{time}</p>
      </div>
    </div>
  );
}

function MarketingMetric({ label, value, icon, sub, color, bg }) {
  return (
    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm group hover:scale-105 transition-all duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className={`w-16 h-16 ${bg} ${color} rounded-[1.5rem] flex items-center justify-center shadow-sm`}>{icon}</div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{sub}</span>
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <h4 className="text-5xl font-black text-slate-900 tracking-tighter">{value}</h4>
    </div>
  );
}

function FunnelLayer({ label, value, width, color }) {
  return (
    <div className="group">
      <div className="flex justify-between items-end mb-3">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-900 transition-colors">{label}</span>
        <span className="text-xl font-black text-slate-900 leading-none">{value}</span>
      </div>
      <div className="h-6 bg-slate-50 rounded-2xl overflow-hidden shadow-inner border border-slate-100">
        <div className={`h-full ${color} ${width} rounded-r-2xl transition-all duration-1000 ease-out group-hover:brightness-110 shadow-lg`}></div>
      </div>
    </div>
  );
}
