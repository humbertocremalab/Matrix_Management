import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  Zap, 
  Plus, 
  Trash2, 
  Search, 
  ChevronDown, 
  LogOut, 
  X,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Edit2,
  Folder
} from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'account-manager-hub';

// --- COMPONENTES ATÓMICOS ---

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div className="space-y-1.5 mb-4">
    {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
    <input 
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-600 placeholder:text-slate-400" 
      {...props} 
    />
  </div>
);

// --- VISTAS PRINCIPALES ---

const MetaFunnelView = ({ data, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState(data);

  useEffect(() => { setTempData(data); }, [data]);

  const handleSave = () => {
    onUpdate(tempData);
    setIsEditing(false);
  };

  const addItem = (section) => {
    const label = prompt("Nombre del nuevo item:");
    if (!label) return;
    const newList = [...(data[section] || []), { label, checked: false }];
    onUpdate({ ...data, [section]: newList });
  };

  const toggleItem = (section, index) => {
    const newList = [...(data[section] || [])];
    newList[index].checked = !newList[index].checked;
    onUpdate({ ...data, [section]: newList });
  };

  const MetricCard = ({ icon: Icon, label, value, subtext, colorClass }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <h4 className="text-2xl font-black text-slate-800">{value}</h4>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </div>
      <div className={`p-2 rounded-xl ${colorClass}`}>
        <Icon size={20} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Embudo Meta</h2>
          <p className="text-slate-500">Gestiona tus campañas y leads de Meta Ads</p>
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Edit2 size={16} /> Editar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={Users} label="Leads Generados" value={data.leadsGenerados || 0} colorClass="bg-blue-50 text-blue-600" />
        <MetricCard 
          icon={Target} label="Meta de Leads" value={data.leadsMeta || 0} 
          subtext={`${data.leadsMeta > 0 ? Math.round((data.leadsGenerados/data.leadsMeta)*100) : 0}% alcanzado`}
          colorClass="bg-emerald-50 text-emerald-600" 
        />
        <MetricCard icon={DollarSign} label="Presupuesto" value={`$${(data.presupuestoTotal || 0).toLocaleString()}`} colorClass="bg-indigo-50 text-indigo-600" />
        <MetricCard 
          icon={TrendingUp} label="Gasto" value={`$${(data.presupuestoGastado || 0).toLocaleString()}`} 
          subtext={`${data.presupuestoTotal > 0 ? Math.round((data.presupuestoGastado/data.presupuestoTotal)*100) : 0}% usado`}
          colorClass="bg-orange-50 text-orange-600" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['awareness', 'prospeccion', 'retargeting'].map((s, idx) => (
          <div key={s} className={`bg-white rounded-2xl border-l-4 p-6 shadow-sm ${idx === 0 ? 'border-l-indigo-500' : idx === 1 ? 'border-l-emerald-500' : 'border-l-purple-500'}`}>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-slate-800 capitalize">{s}</h4>
              <span className="text-xs font-bold text-slate-400">
                {(data[s] || []).filter(i => i.checked).length}/{(data[s] || []).length}
              </span>
            </div>
            <div className="space-y-3 mb-6">
              {(data[s] || []).map((item, i) => (
                <div key={i} className="flex items-center gap-3 group cursor-pointer" onClick={() => toggleItem(s, i)}>
                  <div className={`${item.checked ? 'text-indigo-600' : 'text-slate-300'}`}>
                    {item.checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>
                  <span className={`text-sm font-medium ${item.checked ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{item.label}</span>
                </div>
              ))}
            </div>
            <button onClick={() => addItem(s)} className="w-full py-2 border border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2 text-sm font-bold">
              <Plus size={16} /> Nuevo item...
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
        <h4 className="font-black text-slate-800 mb-6">Artes del Embudo</h4>
        {['awareness', 'prospeccion', 'retargeting'].map(s => (
          <div key={s} className="mb-6 last:mb-0">
            <label className="text-sm font-bold text-slate-700 capitalize mb-2 block">{s}</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Folder className="absolute left-4 top-3 text-slate-300" size={18} />
                <input 
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" 
                  placeholder="URL o ID de carpeta de Google Drive..." 
                  value={data[`drive_${s}`] || ""}
                  onChange={(e) => onUpdate({...data, [`drive_${s}`]: e.target.value})}
                />
              </div>
              <button className="px-6 py-2.5 bg-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-200 transition-all text-sm">Conectar</button>
            </div>
            <div className="mt-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 h-40 flex flex-col items-center justify-center text-slate-400">
               <Folder size={32} className="mb-2 opacity-20" />
               <p className="text-xs font-medium">Ingresa la URL o ID de una carpeta de Drive</p>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Editar Métricas Meta">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Leads Generados" type="number" value={tempData.leadsGenerados || 0} onChange={e => setTempData({...tempData, leadsGenerados: Number(e.target.value)})} />
          <Input label="Meta de Leads" type="number" value={tempData.leadsMeta || 0} onChange={e => setTempData({...tempData, leadsMeta: Number(e.target.value)})} />
          <Input label="Presupuesto Total" type="number" value={tempData.presupuestoTotal || 0} onChange={e => setTempData({...tempData, presupuestoTotal: Number(e.target.value)})} />
          <Input label="Presupuesto Gastado" type="number" value={tempData.presupuestoGastado || 0} onChange={e => setTempData({...tempData, presupuestoGastado: Number(e.target.value)})} />
        </div>
        <button onClick={handleSave} className="w-full mt-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">Actualizar</button>
      </Modal>
    </div>
  );
};

const InsumosView = ({ items, onAdd, onDelete, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Tríptico', location: '', date: '', frequency: 30, notes: '' });

  const handleCreate = () => {
    if (!form.name || !form.date) return;
    onAdd(form);
    setIsModalOpen(false);
    setForm({ name: '', type: 'Tríptico', location: '', date: '', frequency: 30, notes: '' });
  };

  const handleUpdate = () => {
    onUpdate(editingItem.id, form);
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Insumos y Renovaciones</h2>
          <p className="text-slate-500">Control de materiales impresos en sucursal</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} /> Agregar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map(item => {
          const diff = Math.ceil((new Date(item.date) - new Date()) / (1000 * 60 * 60 * 24));
          const isVencido = diff < 0;
          
          return (
            <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative group cursor-pointer hover:shadow-md transition-all" onClick={() => openEdit(item)}>
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                  <Package size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{item.name}</h4>
                  <p className="text-xs text-slate-400">{item.type}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin size={14} /> {item.location || 'Sin ubicación'}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={14} /> Renueva: {new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isVencido ? 'bg-red-100 text-red-600' : diff < 7 ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {isVencido ? 'Vencido' : `${diff}d restantes`}
                </span>
                <span className="text-[10px] text-slate-400 font-bold tracking-tight">Cada {item.frequency}d</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="absolute top-4 right-4 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Editar Material" : "Nuevo Material"}>
        <Input label="Nombre" placeholder="Ej: Tríptico promocional" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 mb-4">
            <label className="text-sm font-semibold text-slate-700">Tipo</label>
            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-600" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option>Tríptico</option>
              <option>Banner</option>
              <option>Volante</option>
              <option>Lona</option>
            </select>
          </div>
          <Input label="Sucursal" placeholder="Ej: Sucursal Centro" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Fecha de Renovación" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          <Input label="Frecuencia (días)" type="number" value={form.frequency} onChange={e => setForm({...form, frequency: Number(e.target.value)})} />
        </div>
        <Input label="Notas" placeholder="Notas adicionales..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
        <button 
          onClick={editingItem ? handleUpdate : handleCreate} 
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg"
        >
          {editingItem ? 'Actualizar' : 'Crear'}
        </button>
      </Modal>
    </div>
  );
};

const ExpressView = ({ items, onAdd, onToggle, onDelete }) => {
  const [filter, setFilter] = useState('Todas');
  const [newLabel, setNewLabel] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newLabel) return;
    onAdd({ label: newLabel, status: 'Pendiente', priority: 'Media', date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) });
    setNewLabel("");
  };

  const filtered = items.filter(i => {
    if (filter === 'Todas') return true;
    if (filter === 'Pendiente') return !i.completed;
    if (filter === 'Completada') return i.completed;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-800">Tareas Express</h2>
        <p className="text-slate-500">Tareas no planificadas del día a día</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <input 
          className="flex-1 px-4 py-2 outline-none text-slate-600 font-medium" 
          placeholder="Nueva tarea express..." 
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
        />
        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
          <Plus size={18} /> Agregar
        </button>
      </form>

      <div className="flex gap-2 justify-center">
        {['Todas', 'Pendiente', 'En progreso', 'Completada'].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <button onClick={() => onToggle(item.id, item.completed)} className={item.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-400 transition-colors'}>
                {item.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              <div>
                <h5 className={`font-bold transition-all ${item.completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{item.label}</h5>
                <div className="flex gap-3 mt-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${item.priority === 'Alta' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>Media</span>
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Clock size={10} /> Entrada: {item.date}</span>
                </div>
              </div>
            </div>
            <button onClick={() => onDelete(item.id)} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- ESTRUCTURA DE LA APP ---

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('funnel');
  const [funnel, setFunnel] = useState({ 
    leadsMeta: 0, leadsGenerados: 0, presupuestoTotal: 0, presupuestoGastado: 0,
    awareness: [], prospeccion: [], retargeting: []
  });
  const [events, setEvents] = useState([]);
  const [renewals, setRenewals] = useState([]);
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
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Sincronizar Embudo (Doc único con ruta corregida)
    const funnelRef = doc(db, 'artifacts', appId, 'public', 'data', 'funnel', 'main');
    const unsubFunnel = onSnapshot(funnelRef, (d) => d.exists() && setFunnel(d.data()), (e) => console.error(e));

    // Sincronizar Colecciones
    const syncCol = (name, setter) => {
      const q = collection(db, 'artifacts', appId, 'public', 'data', name);
      return onSnapshot(q, (s) => setter(s.docs.map(d => ({ ...d.data(), id: d.id }))), (e) => console.error(e));
    };

    const u1 = syncCol('events', setEvents);
    const u2 = syncCol('renewals', setRenewals);
    const u3 = syncCol('express', setExpress);

    return () => { unsubFunnel(); u1(); u2(); u3(); };
  }, [user]);

  const saveFunnel = async (data) => {
    if (!user) return;
    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'funnel', 'main');
    await setDoc(ref, data);
  };

  const add = (col, data) => { if(!user) return; addDoc(collection(db, 'artifacts', appId, 'public', 'data', col), data); };
  const del = (col, id) => { if(!user) return; deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id)); };
  const toggle = (col, id, current) => { if(!user) return; updateDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id), { completed: !current }); };
  const update = (col, id, data) => { if(!user) return; updateDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id), data); };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 h-screen sticky top-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Account</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Manager</p>
            </div>
          </div>

          <nav className="space-y-2">
            <SidebarBtn icon={<LayoutDashboard />} label="Embudo Meta" active={activeTab === 'funnel'} onClick={() => setActiveTab('funnel')} />
            <SidebarBtn icon={<Calendar />} label="Eventos" active={activeTab === 'events'} onClick={() => setActiveTab('events')} />
            <SidebarBtn icon={<Package />} label="Insumos" active={activeTab === 'renewals'} onClick={() => setActiveTab('renewals')} />
            <SidebarBtn icon={<Zap />} label="Express" active={activeTab === 'express'} onClick={() => setActiveTab('express')} />
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-50">
          <button className="flex items-center gap-3 text-slate-400 font-bold text-sm hover:text-red-500 transition-colors">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="h-20 flex items-center justify-between px-8 bg-white/50 backdrop-blur-md sticky top-0 z-40 lg:hidden">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><LayoutDashboard size={18} /></div>
              <span className="font-black text-slate-800">AccountManager</span>
           </div>
           <button className="p-2 text-slate-400"><ChevronDown /></button>
        </header>

        <div className="p-4 lg:p-12 max-w-7xl mx-auto">
          {activeTab === 'funnel' && <MetaFunnelView data={funnel} onUpdate={saveFunnel} />}
          {activeTab === 'renewals' && <InsumosView items={renewals} onAdd={d => add('renewals', d)} onDelete={id => del('renewals', id)} onUpdate={(id, d) => update('renewals', id, d)} />}
          {activeTab === 'express' && <ExpressView items={express} onAdd={d => add('express', d)} onToggle={(id, s) => toggle('express', id, s)} onDelete={id => del('express', id)} />}
          {activeTab === 'events' && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
               <Calendar size={64} className="mb-4 opacity-10" />
               <p className="font-bold">Módulo de Eventos en desarrollo</p>
            </div>
          )}
        </div>
      </main>

      {/* Navigation Mobile */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-white border-t border-slate-100 flex justify-around p-3 z-50">
        <MobileNavBtn icon={<LayoutDashboard />} active={activeTab === 'funnel'} onClick={() => setActiveTab('funnel')} />
        <MobileNavBtn icon={<Calendar />} active={activeTab === 'events'} onClick={() => setActiveTab('events')} />
        <MobileNavBtn icon={<Package />} active={activeTab === 'renewals'} onClick={() => setActiveTab('renewals')} />
        <MobileNavBtn icon={<Zap />} active={activeTab === 'express'} onClick={() => setActiveTab('express')} />
      </nav>
    </div>
  );
}

function SidebarBtn({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
    >
      {React.cloneElement(icon, { size: 18 })}
      {label}
    </button>
  );
}

function MobileNavBtn({ icon, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300'}`}
    >
      {React.cloneElement(icon, { size: 22 })}
    </button>
  );
}
