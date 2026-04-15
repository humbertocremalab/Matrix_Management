import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Package, Zap, LogOut, Plus, MoreHorizontal, 
  CheckCircle2, Circle, Clock, DollarSign, Link as LinkIcon, Menu, X, 
  Target, Users, Pencil, FolderOpen, Lock, Eye, EyeOff, Loader2
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  signOut 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  collection 
} from "firebase/firestore";

// --- CONFIGURACIÓN ---
const DRIVE_API_KEY = "AIzaSyBH8-5rLNM_--UWRMIywOb-m5-UOuzUYUw";

const firebaseConfig = {
  apiKey: "AIzaSyCi3nxC2c8Sp4JAs9ylU4uxVagVXToP8HM",
  authDomain: "accountmatrixhub.firebaseapp.com",
  projectId: "accountmatrixhub",
  storageBucket: "accountmatrixhub.firebasestorage.app",
  messagingSenderId: "912278749399",
  appId: "1:912278749399:web:f6c4f8f575b01243d2b092",
  measurementId: "G-TLQ1WDTS38"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'account-matrix-hub';

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('embudo');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Estado de datos (ahora sincronizado con Firebase)
  const [metaData, setMetaData] = useState({
    leadsMeta: 0,
    leadsGenerated: 0,
    budget: 0,
    spent: 0,
    driveLinks: { awareness: '', prospeccion: '', retargeting: '' }
  });

  // 1. Inicializar Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        }
      } catch (err) {
        console.error("Auth Error:", err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Aquí podrías lógica de roles persistente, 
      // por ahora el rol se define en el login manual
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sincronizar Datos de Firestore (Públicos)
  useEffect(() => {
    if (!user) return;

    // Ruta obligatoria: /artifacts/{appId}/public/data/metas
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'marketing');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMetaData(docSnap.data());
      } else {
        // Inicializar si no existe
        setDoc(docRef, metaData);
      }
    }, (error) => console.error("Firestore Error:", error));

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setUserRole(null);
  };

  const handleUpdateData = async (newData) => {
    if (userRole !== 'admin') return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'marketing');
    await setDoc(docRef, newData, { merge: true });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!user || !userRole) {
    return <LoginView onLogin={(role) => setUserRole(role)} />;
  }

  return (
    <div className="flex h-screen bg-[#F8F9FD] font-sans text-slate-700 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-100 transition-all duration-300 flex flex-col z-20`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 flex-shrink-0">
            <LayoutDashboard size={24} />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-slate-900 leading-tight truncate">Account</h1>
              <p className="text-xs text-slate-400">Manager</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavItem active={activeTab === 'embudo'} onClick={() => setActiveTab('embudo')} icon={<Target size={20}/>} label="Embudo Meta" collapsed={!isSidebarOpen} />
          <NavItem active={activeTab === 'eventos'} onClick={() => setActiveTab('eventos')} icon={<Calendar size={20}/>} label="Eventos" collapsed={!isSidebarOpen} />
          <NavItem active={activeTab === 'insumos'} onClick={() => setActiveTab('insumos')} icon={<Package size={20}/>} label="Insumos" collapsed={!isSidebarOpen} />
          <NavItem active={activeTab === 'express'} onClick={() => setActiveTab('express')} icon={<Zap size={20}/>} label="Express" collapsed={!isSidebarOpen} />
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-10 bg-[#F8F9FD]/80 backdrop-blur-md px-8 py-6 flex justify-between items-center">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{userRole === 'admin' ? 'Administrador' : 'Colaborador'}</p>
                <p className="text-xs text-slate-400">En línea</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-indigo-600 uppercase">
               {userRole?.charAt(0)}
             </div>
          </div>
        </header>

        <div className="px-8 pb-12 max-w-7xl mx-auto">
          {activeTab === 'embudo' && <EmbudoView data={metaData} onUpdate={handleUpdateData} userRole={userRole} />}
          {activeTab === 'eventos' && <PlaceholderView title="Eventos" />}
          {activeTab === 'insumos' && <PlaceholderView title="Insumos" />}
          {activeTab === 'express' && <PlaceholderView title="Express" />}
        </div>
      </main>
    </div>
  );
}

// --- LOGIN CON FIREBASE AUTH ---
function LoginView({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Simulación de roles para este flujo con Anonymous Sign-in de Firebase
      if ((user === 'admin' && pass === 'admin123') || (user === 'user' && pass === 'user123')) {
        await signInAnonymously(auth);
        onLogin(user);
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión con Firebase');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-10 rounded-[32px] shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">AccountMatrix Hub</h2>
          <p className="text-slate-400 text-sm text-center mt-1">Acceso seguro al panel de gestión</p>
        </div>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Usuario</label>
            <input 
              type="text" 
              required
              value={user} 
              onChange={e => setUser(e.target.value)} 
              className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none transition-all" 
              placeholder="admin / user" 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Contraseña</label>
            <input 
              type="password" 
              required
              value={pass} 
              onChange={e => setPass(e.target.value)} 
              className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>
          {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-xl">{error}</p>}
          <button 
            disabled={isSubmitting}
            type="submit" 
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- VISTA EMBUDO ---
function EmbudoView({ data, onUpdate, userRole }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...data });

  // Sincronizar form con data cuando cambia externamente
  useEffect(() => { setEditForm({ ...data }); }, [data]);

  const handleSaveMetrics = () => {
    onUpdate(editForm);
    setIsEditModalOpen(false);
  };

  const leadsPerc = data.leadsMeta > 0 ? Math.round((data.leadsGenerated / data.leadsMeta) * 100) : 0;
  const budgetPerc = data.budget > 0 ? Math.round((data.spent / data.budget) * 100) : 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <section>
        <h2 className="text-2xl font-bold text-slate-900">Embudo Meta</h2>
        <p className="text-slate-400 text-sm">Información en tiempo real desde Firebase</p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Métricas Meta Ads</h3>
          {userRole === 'admin' && (
            <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Pencil size={14} /> Editar
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard label="Leads Generados" value={data.leadsGenerated} icon={<Users size={18} className="text-indigo-600"/>} />
          <MetricCard label="Meta de Leads" value={data.leadsMeta} subtext={`${leadsPerc}% alcanzado`} icon={<Target size={18} className="text-emerald-500"/>} />
          <MetricCard label="Presupuesto" value={`$${data.budget.toLocaleString()}`} icon={<DollarSign size={18} className="text-indigo-400"/>} />
          <MetricCard label="Gasto" value={`$${data.spent.toLocaleString()}`} subtext={`${budgetPerc}% usado`} icon={<Zap size={18} className="text-amber-500"/>} />
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-lg font-bold text-slate-800">Artes del Embudo</h3>
        <div className="grid grid-cols-1 gap-6">
          <DriveSection 
            title="Awareness" 
            folderId={data.driveLinks?.awareness} 
            onUpdate={(id) => onUpdate({...data, driveLinks: {...data.driveLinks, awareness: id}})} 
            canEdit={userRole === 'admin'}
          />
          <DriveSection 
            title="Prospección" 
            folderId={data.driveLinks?.prospeccion} 
            onUpdate={(id) => onUpdate({...data, driveLinks: {...data.driveLinks, prospeccion: id}})} 
            canEdit={userRole === 'admin'}
          />
          <DriveSection 
            title="Retargeting" 
            folderId={data.driveLinks?.retargeting} 
            onUpdate={(id) => onUpdate({...data, driveLinks: {...data.driveLinks, retargeting: id}})} 
            canEdit={userRole === 'admin'}
          />
        </div>
      </section>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
               <h3 className="font-bold text-lg">Editar Métricas</h3>
               <button onClick={() => setIsEditModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <EditField label="Leads Gen" value={editForm.leadsGenerated} onChange={v => setEditForm({...editForm, leadsGenerated: Number(v)})} />
                <EditField label="Meta Leads" value={editForm.leadsMeta} onChange={v => setEditForm({...editForm, leadsMeta: Number(v)})} />
                <EditField label="Presupuesto" value={editForm.budget} onChange={v => setEditForm({...editForm, budget: Number(v)})} />
                <EditField label="Gasto" value={editForm.spent} onChange={v => setEditForm({...editForm, spent: Number(v)})} />
              </div>
              <button onClick={handleSaveMetrics} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold mt-4 shadow-lg shadow-indigo-100">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- DRIVE SECTION ---
function DriveSection({ title, folderId, onUpdate, canEdit }) {
  const [input, setInput] = useState(folderId || '');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDriveFiles = async (id) => {
    if (!id) { setFiles([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${id}'+in+parents&fields=files(id,name,thumbnailLink,webContentLink)&key=${DRIVE_API_KEY}`);
      const d = await res.json();
      if (d.files) setFiles(d.files);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDriveFiles(folderId); setInput(folderId || ''); }, [folderId]);

  const handleConnect = () => {
    const extractedId = input.includes('folders/') ? input.split('folders/')[1].split('?')[0] : input;
    onUpdate(extractedId);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <h4 className="text-sm font-bold text-slate-900">{title}</h4>
      {canEdit && (
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Pega el ID o URL de la carpeta..." 
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={handleConnect} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all">Conectar</button>
        </div>
      )}
      
      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-indigo-400" /></div>
      ) : files.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
           {files.map(file => (
             <a key={file.id} href={file.webContentLink} target="_blank" rel="noreferrer" className="group relative aspect-square bg-slate-50 rounded-xl overflow-hidden shadow-sm hover:ring-2 hover:ring-indigo-500 transition-all">
                {file.thumbnailLink ? (
                  <img src={file.thumbnailLink} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2 text-[9px] text-slate-400 text-center break-all font-bold">{file.name}</div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Eye className="text-white" size={18} />
                </div>
             </a>
           ))}
        </div>
      ) : (
        <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
          <FolderOpen size={32} className="mb-2 opacity-50" />
          <p className="text-[10px] font-bold uppercase tracking-widest">Sin artes vinculados</p>
        </div>
      )}
    </div>
  );
}

// --- AUX ---
function MetricCard({ label, value, subtext, icon }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">{icon}</div>
      </div>
      <h4 className="text-2xl font-black text-slate-900">{value}</h4>
      {subtext && <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">{subtext}</p>}
    </div>
  );
}

function NavItem({ active, icon, label, onClick, collapsed }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all ${
      active ? 'bg-indigo-600 text-white shadow-lg font-bold' : 'text-slate-400 hover:bg-slate-50 font-medium'
    }`}>
      <div className="flex-shrink-0">{icon}</div>
      {!collapsed && <span className="text-sm truncate">{label}</span>}
    </button>
  );
}

function EditField({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold text-slate-700" />
    </div>
  );
}

function PlaceholderView({ title }) {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-300 space-y-4">
      <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
        <Loader2 className="animate-spin text-indigo-200" size={48} />
      </div>
      <p className="font-bold uppercase tracking-widest text-xs">Módulo {title} en sincronización...</p>
    </div>
  );
}