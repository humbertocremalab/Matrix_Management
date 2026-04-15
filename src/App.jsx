import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  LayoutDashboard, 
  Calendar, 
  RefreshCcw, 
  Zap, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  DollarSign, 
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCi3nxC2c8Sp4JAs9ylU4uxVagVXToP8HM",
  authDomain: "accountmatrixhub.firebaseapp.com",
  projectId: "accountmatrixhub",
  storageBucket: "accountmatrixhub.firebasestorage.app",
  messagingSenderId: "912278749399",
  appId: "1:912278749399:web:f6c4f8f575b01243d2b092",
  measurementId: "G-TLQ1WDTS38"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'account-manager-hub';
const DRIVE_API_KEY = "AIzaSyBH8-5rLNM_--UWRMIywOb-m5-UOuzUYUw";

// --- COMPONENTES AUXILIARES ---

const Card = ({ children, title, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 ${className}`}>
    {title && <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">{title}</h3>}
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "" }) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    danger: "bg-red-50 hover:bg-red-100 text-red-600",
    ghost: "hover:bg-slate-50 text-slate-500"
  };
  return (
    <button 
      onClick={onClick} 
      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// --- VISTAS PRINCIPALES ---

const MetaFunnelView = ({ data, onUpdate }) => {
  const [newFolderId, setNewFolderId] = useState("");

  const updateField = (field, value) => {
    onUpdate({ ...data, [field]: value });
  };

  const toggleCheck = (section, index) => {
    const newList = [...(data[section] || [])];
    newList[index].checked = !newList[index].checked;
    onUpdate({ ...data, [section]: newList });
  };

  const leadProgress = data.leadsMeta > 0 ? (data.leadsGenerados / data.leadsMeta) * 100 : 0;
  const budgetProgress = data.presupuestoTotal > 0 ? (data.presupuestoGastado / data.presupuestoTotal) * 100 : 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="KPIs de Leads">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Meta</label>
                <input 
                  type="number" 
                  className="w-full text-2xl font-bold bg-transparent border-b border-slate-200 focus:outline-none focus:border-blue-500"
                  value={data.leadsMeta || 0}
                  onChange={(e) => updateField('leadsMeta', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Generados</label>
                <input 
                  type="number" 
                  className="w-full text-2xl font-bold bg-transparent border-b border-slate-200 focus:outline-none focus:border-blue-500"
                  value={data.leadsGenerados || 0}
                  onChange={(e) => updateField('leadsGenerados', Number(e.target.value))}
                />
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all" 
                style={{ width: `${Math.min(leadProgress, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-600 text-right font-medium">{leadProgress.toFixed(1)}% Alcanzado</p>
          </div>
        </Card>

        <Card title="Presupuesto">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Total</label>
                <div className="flex items-center">
                  <span className="text-slate-400">$</span>
                  <input 
                    type="number" 
                    className="w-full text-2xl font-bold bg-transparent border-b border-slate-200 focus:outline-none focus:border-green-500"
                    value={data.presupuestoTotal || 0}
                    onChange={(e) => updateField('presupuestoTotal', Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Gastado</label>
                <div className="flex items-center text-red-600">
                  <span className="text-red-400">$</span>
                  <input 
                    type="number" 
                    className="w-full text-2xl font-bold bg-transparent border-b border-slate-200 focus:outline-none focus:border-red-500"
                    value={data.presupuestoGastado || 0}
                    onChange={(e) => updateField('presupuestoGastado', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all" 
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-600 text-right font-medium">{budgetProgress.toFixed(1)}% Consumido</p>
          </div>
        </Card>
      </div>

      {/* Checklists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['awareness', 'prospeccion', 'retargeting'].map((section) => (
          <Card key={section} title={section.charAt(0).toUpperCase() + section.slice(1)}>
            <div className="space-y-2">
              {(data[section] || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <input 
                    type="checkbox" 
                    checked={item.checked} 
                    onChange={() => toggleCheck(section, idx)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Artes Drive Carousel */}
      <Card title="Artes del Embudo (Drive)">
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              placeholder="Pegar ID de Carpeta de Drive" 
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={newFolderId}
              onChange={(e) => setNewFolderId(e.target.value)}
            />
            <Button onClick={() => { updateField('driveFolderId', newFolderId); setNewFolderId(""); }}>
              Conectar
            </Button>
            {data.driveFolderId && (
              <Button variant="danger" onClick={() => updateField('driveFolderId', "")}>
                Quitar
              </Button>
            )}
          </div>

          <div className="relative bg-slate-50 dark:bg-slate-900 rounded-xl p-4 min-h-[400px] flex items-center justify-center border-2 border-dashed border-slate-200">
            {data.driveFolderId ? (
              <div className="w-full flex flex-col items-center">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
                  {/* Mockup de visualización de Drive - 9:16 format */}
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-[9/16] bg-slate-200 rounded-lg shadow animate-pulse flex items-center justify-center text-slate-400 text-xs text-center p-2">
                      Vista previa de Arte {i}<br/>Folder: {data.driveFolderId.substring(0,6)}...
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-500 italic">Conectado vía Drive API Key: {DRIVE_API_KEY.substring(0,10)}...</p>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <FolderOpen className="mx-auto mb-2 opacity-20" size={48} />
                <p>Ingresa un ID de carpeta para visualizar los artes en formato 9:16</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const EventsView = ({ items, onAdd, onToggle, onDelete }) => {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'costs'
  const [input, setInput] = useState("");
  const [cost, setCost] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!input) return;
    onAdd({
      type: activeTab,
      label: input,
      amount: activeTab === 'costs' ? Number(cost) : 0,
      completed: false,
      timestamp: Date.now()
    });
    setInput("");
    setCost("");
  };

  const totalCost = items.filter(i => i.type === 'costs').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-4 pb-20">
      <Card>
        <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
          <button 
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${activeTab === 'tasks' ? 'bg-white shadow' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >Tareas</button>
          <button 
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${activeTab === 'costs' ? 'bg-white shadow' : ''}`}
            onClick={() => setActiveTab('costs')}
          >Gastos/Contratación</button>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input 
            placeholder={activeTab === 'tasks' ? "Nueva tarea..." : "Actividad/Insumo..."}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {activeTab === 'costs' && (
            <input 
              type="number"
              placeholder="$"
              className="w-24 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          )}
          <Button onClick={handleAdd} className="h-[42px]"><Plus size={20} /></Button>
        </form>

        <div className="space-y-3">
          {items.filter(i => i.type === activeTab).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                {item.type === 'tasks' ? (
                  <input 
                    type="checkbox" 
                    checked={item.completed} 
                    onChange={() => onToggle(item.id, item.completed)}
                    className="w-5 h-5 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                ) : (
                  <DollarSign size={18} className="text-green-600" />
                )}
                <div className="flex flex-col">
                  <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                    {item.label}
                  </span>
                  {item.amount > 0 && <span className="text-xs text-green-700 font-bold">${item.amount.toLocaleString()}</span>}
                </div>
              </div>
              <button onClick={() => onDelete(item.id)} className="text-slate-300 hover:text-red-500 p-1">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {activeTab === 'costs' && (
          <div className="mt-6 pt-4 border-t flex justify-between items-center">
            <span className="text-slate-500 font-bold">Inversión Total del Evento:</span>
            <span className="text-xl font-black text-blue-600">${totalCost.toLocaleString()}</span>
          </div>
        )}
      </Card>
    </div>
  );
};

const RenewalView = ({ items, onAdd, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", quantity: "", nextDate: "" });

  const handleAdd = () => {
    if (!form.name || !form.nextDate) return;
    onAdd({ ...form, id: Date.now() });
    setForm({ name: "", quantity: "", nextDate: "" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Insumos y Renovaciones</h2>
        <Button onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cerrar' : <><Plus size={18} /> Nuevo Insumo</>}
        </Button>
      </div>

      {showAdd && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input 
              placeholder="Material (ej. Banner, Tríptico)"
              className="px-3 py-2 border rounded-lg text-sm"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
            />
            <input 
              type="number"
              placeholder="Cantidad"
              className="px-3 py-2 border rounded-lg text-sm"
              value={form.quantity}
              onChange={(e) => setForm({...form, quantity: e.target.value})}
            />
            <input 
              type="date"
              className="px-3 py-2 border rounded-lg text-sm text-slate-500"
              value={form.nextDate}
              onChange={(e) => setForm({...form, nextDate: e.target.value})}
            />
            <Button onClick={handleAdd} className="md:col-span-3 justify-center">Guardar Registro</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-800">{item.name}</h4>
                <p className="text-xs text-slate-500">Cantidad: {item.quantity}</p>
              </div>
              <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 transition text-red-300 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <RefreshCcw size={14} className="text-orange-500" />
              <span className="text-slate-600">Próxima renovación:</span>
              <span className="font-bold text-slate-900">{item.nextDate}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ExpressTasksView = ({ items, onAdd, onToggle, onDelete }) => {
  const [text, setText] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text) return;
    onAdd({
      label: text,
      createdAt: new Date().toLocaleDateString(),
      finishedAt: null,
      completed: false,
      id: Date.now()
    });
    setText("");
  };

  return (
    <div className="space-y-4 pb-20">
      <Card title="Tareas Express (Día a Día)">
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input 
            placeholder="Nueva tarea no proyectada..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button onClick={handleAdd} className="bg-purple-600 hover:bg-purple-700">
            <Plus size={20} />
          </Button>
        </form>

        <div className="overflow-hidden bg-white border rounded-xl">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tarea</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Entrada</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Terminada</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {items.map((item) => (
                <tr key={item.id} className={item.completed ? 'bg-slate-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={item.completed} 
                        onChange={() => onToggle(item.id, !item.completed)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                        {item.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{item.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                    {item.completed ? (item.finishedAt || new Date().toLocaleDateString()) : '---'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => onDelete(item.id)} className="text-slate-300 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="p-8 text-center text-slate-400 italic">No hay tareas pendientes.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

// --- APP PRINCIPAL ---

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('funnel');
  const [funnelData, setFunnelData] = useState({
    leadsMeta: 100,
    leadsGenerados: 45,
    presupuestoTotal: 5000,
    presupuestoGastado: 2100,
    awareness: [
      { label: 'Pixel Configurado', checked: true },
      { label: 'Campaña de Alcance', checked: false },
    ],
    prospeccion: [
      { label: 'Formularios Listos', checked: true },
      { label: 'AB Test de Audiencias', checked: false },
    ],
    retargeting: [
      { label: 'Públicos Personalizados', checked: false },
    ],
    driveFolderId: ""
  });
  const [events, setEvents] = useState([]);
  const [renewals, setRenewals] = useState([]);
  const [expressTasks, setExpressTasks] = useState([]);

  // Auth & Sync
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  // Listeners Firestore
  useEffect(() => {
    if (!user) return;

    // Public Data (Funnel)
    const funnelRef = doc(db, 'artifacts', appId, 'public', 'data', 'funnel');
    const unsubFunnel = onSnapshot(funnelRef, (doc) => {
      if (doc.exists()) setFunnelData(doc.data());
    }, (err) => console.log("Funnel sync err", err));

    // Collections
    const createCollectionListener = (name, setter) => {
      const q = collection(db, 'artifacts', appId, 'public', 'data', name);
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setter(items);
      }, (err) => console.log(`${name} sync err`, err));
    };

    const unsubEvents = createCollectionListener('events', setEvents);
    const unsubRenewals = createCollectionListener('renewals', setRenewals);
    const unsubExpress = createCollectionListener('express', setExpressTasks);

    return () => {
      unsubFunnel();
      unsubEvents();
      unsubRenewals();
      unsubExpress();
    };
  }, [user]);

  // Actions
  const updateFunnel = async (newData) => {
    if (!user) return;
    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'funnel');
    await setDoc(ref, newData);
  };

  const addItem = async (colName, item) => {
    if (!user) return;
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', colName);
    await addDoc(colRef, item);
  };

  const toggleItem = async (colName, id, status) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', colName, id);
    const updateData = colName === 'express' 
      ? { completed: status, finishedAt: status ? new Date().toLocaleDateString() : null }
      : { completed: !status };
    await updateDoc(docRef, updateData);
  };

  const deleteItem = async (colName, id) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', colName, id);
    await deleteDoc(docRef);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'funnel': return <MetaFunnelView data={funnelData} onUpdate={updateFunnel} />;
      case 'events': return <EventsView items={events} onAdd={(item) => addItem('events', item)} onToggle={(id, status) => toggleItem('events', id, status)} onDelete={(id) => deleteItem('events', id)} />;
      case 'renewals': return <RenewalView items={renewals} onAdd={(item) => addItem('renewals', item)} onDelete={(id) => deleteItem('renewals', id)} />;
      case 'express': return <ExpressTasksView items={expressTasks} onAdd={(item) => addItem('express', item)} onToggle={(id, status) => toggleItem('express', id, status)} onDelete={(id) => deleteItem('express', id)} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <h1 className="text-xl font-black tracking-tight hidden sm:block">AccountMatrix Hub</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400">
              <User size={14} />
              {user?.uid ? 'Administrador' : 'Conectando...'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pt-6">
        {renderContent()}
      </main>

      {/* Navigation (Mobile Friendly Bottom Bar) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="max-w-2xl mx-auto px-6 h-16 flex justify-between items-center">
          <NavItem 
            icon={<LayoutDashboard />} 
            label="Embudo" 
            active={activeTab === 'funnel'} 
            onClick={() => setActiveTab('funnel')} 
          />
          <NavItem 
            icon={<Calendar />} 
            label="Eventos" 
            active={activeTab === 'events'} 
            onClick={() => setActiveTab('events')} 
          />
          <NavItem 
            icon={<RefreshCcw />} 
            label="Renovación" 
            active={activeTab === 'renewals'} 
            onClick={() => setActiveTab('renewals')} 
          />
          <NavItem 
            icon={<Zap />} 
            label="Express" 
            active={activeTab === 'express'} 
            onClick={() => setActiveTab('express')} 
          />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 transition-all ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <span className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>
        {React.cloneElement(icon, { size: 22 })}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      {active && <div className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />}
    </button>
  );
}
