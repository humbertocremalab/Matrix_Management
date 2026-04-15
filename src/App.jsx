import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Target, LogOut, Settings, Save, AlertCircle, 
  Menu, X, Zap, DollarSign, LayoutDashboard, Calendar, Package, 
  FolderOpen, Eye, Loader2, Pencil
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
  onSnapshot 
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
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estado de métricas original
  const [metrics, setMetrics] = useState({
    awareness: { views: 0, reach: 0, cost: 0 },
    prospecting: { clicks: 0, ctr: 0, cpc: 0 },
    retargeting: { conv: 0, roas: 0, sales: 0 },
    driveLinks: { awareness: '', prospecting: '', retargeting: '' }
  });

  // Auth logic
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
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
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sincronización Firestore con la estructura de Matrix original
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'marketing_metrics');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMetrics(docSnap.data());
      } else {
        setDoc(docRef, metrics);
      }
    }, (error) => console.error("Firestore Error:", error));

    return () => unsubscribe();
  }, [user]);

  const handleUpdateMetrics = async (newMetrics) => {
    if (userRole !== 'admin') return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'marketing_metrics');
    await setDoc(docRef, newMetrics, { merge: true });
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUserRole(null);
  };

  if (loading) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center text-white">
      <Loader2 className="animate-spin text-indigo-500 mr-3" size={32} />
      <span className="font-bold tracking-widest">CARGANDO MATRIX...</span>
    </div>
  );

  if (!user || !userRole) {
    return <LoginView onLogin={(role) => setUserRole(role)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar - Diseño Matrix Original */}
      <aside className="w-full md:w-72 bg-slate-900 text-white p-8 flex flex-col shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Target size={24} className="text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight uppercase">Matrix</span>
        </div>
        
        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${activeTab === 'dashboard' ? 'bg-white/10 text-indigo-400 border border-white/5' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <BarChart3 size={20}/> Dashboard
          </button>
          <button className="w-full flex items-center gap-4 p-4 text-slate-400 hover:bg-white/5 rounded-2xl transition-all font-medium">
            <Users size={20}/> Audience
          </button>
          <button className="w-full flex items-center gap-4 p-4 text-slate-400 hover:bg-white/5 rounded-2xl transition-all font-medium">
            <Settings size={20}/> Workflows
          </button>
        </nav>

        <div className="pt-8 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all font-bold"
          >
            <LogOut size={20}/> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Analytics Dashboard</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">Live Cloud Sync Active</p>
            </div>
          </div>
          
          {userRole === 'admin' && (
            <button 
              onClick={() => handleUpdateMetrics(metrics)} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all font-bold shadow-xl shadow-indigo-200 active:scale-95"
            >
              <Save size={20} /> Deploy Updates
            </button>
          )}
        </header>

        {/* Tarjetas de Métricas Dinámicas - Estilo Matrix Original */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {Object.entries(metrics).filter(([k]) => k !== 'driveLinks').map(([key, value]) => (
            <div key={key} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 capitalize tracking-tight">{key}</h3>
                <div className="bg-slate-50 p-2 rounded-lg text-slate-400">
                  <BarChart3 size={18} />
                </div>
              </div>
              
              <div className="space-y-6">
                {Object.entries(value).map(([label, val]) => (
                  <div key={label} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</span>
                      <span className="text-[10px] text-emerald-500 font-bold">+0.0%</span>
                    </div>
                    
                    {userRole === 'admin' ? (
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => {
                          const newMetrics = {
                            ...metrics,
                            [key]: { ...value, [label]: parseFloat(e.target.value) || 0 }
                          };
                          setMetrics(newMetrics);
                        }}
                        className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-lg font-bold text-slate-800 outline-none transition-all"
                      />
                    ) : (
                      <div className="text-2xl font-black text-slate-800 tabular-nums p-2">
                        {val.toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sección de Artes / Drive */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Artes del Embudo</h3>
          <div className="grid grid-cols-1 gap-6">
             <DriveSection 
                title="Awareness" 
                folderId={metrics.driveLinks?.awareness} 
                onUpdate={(id) => handleUpdateMetrics({...metrics, driveLinks: {...metrics.driveLinks, awareness: id}})}
                canEdit={userRole === 'admin'}
             />
             <DriveSection 
                title="Prospección" 
                folderId={metrics.driveLinks?.prospecting} 
                onUpdate={(id) => handleUpdateMetrics({...metrics, driveLinks: {...metrics.driveLinks, prospecting: id}})}
                canEdit={userRole === 'admin'}
             />
             <DriveSection 
                title="Retargeting" 
                folderId={metrics.driveLinks?.retargeting} 
                onUpdate={(id) => handleUpdateMetrics({...metrics, driveLinks: {...metrics.driveLinks, retargeting: id}})}
                canEdit={userRole === 'admin'}
             />
          </div>
        </div>

        {/* Footer Status */}
        <div className="mt-12 bg-white border border-slate-200 p-6 rounded-3xl flex items-center gap-5">
          <div className={`p-4 rounded-2xl ${userRole === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Status: {userRole === 'admin' ? 'Administrator' : 'Viewer'}</h4>
            <p className="text-slate-500 text-sm font-medium">
              {userRole === 'admin' ? 'Cloud sync is active. Your changes will persist across sessions.' : 'Read-only access mode.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function DriveSection({ title, folderId, onUpdate, canEdit }) {
  const [input, setInput] = React.useState(folderId || '');
  const [files, setFiles] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchFiles = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${id}'+in+parents&fields=files(id,name,thumbnailLink,webContentLink)&key=${DRIVE_API_KEY}`);
      const data = await res.json();
      if (data.files) setFiles(data.files);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  React.useEffect(() => { fetchFiles(folderId); setInput(folderId || ''); }, [folderId]);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h4 className="text-lg font-black text-slate-800">{title}</h4>
        {canEdit && (
          <div className="flex gap-2 flex-1 max-w-md">
            <input 
              type="text" 
              placeholder="Folder ID o URL"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button 
              onClick={() => {
                const id = input.includes('folders/') ? input.split('folders/')[1].split('?')[0] : input;
                onUpdate(id);
              }}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-black transition-all"
            >
              Link
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
      ) : files.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map(file => (
            <a key={file.id} href={file.webContentLink} target="_blank" rel="noreferrer" className="group relative aspect-square bg-slate-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100">
              {file.thumbnailLink ? (
                <img src={file.thumbnailLink} alt={file.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4 text-[10px] font-bold text-slate-400 text-center uppercase tracking-tighter">{file.name}</div>
              )}
              <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <Eye className="text-white" size={24} />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="py-16 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300">
          <FolderOpen size={40} className="mb-3 opacity-20" />
          <p className="text-xs font-black uppercase tracking-widest opacity-40">No assets linked to this stage</p>
        </div>
      )}
    </div>
  );
}

function LoginView({ onLogin }) {
  const [u, setU] = React.useState('');
  const [p, setP] = React.useState('');
  const [err, setErr] = React.useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if ((u === 'admin' && p === 'admin123') || (u === 'user' && p === 'user123')) {
      onLogin(u);
    } else {
      setErr('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-100">
        <div className="flex justify-center mb-8">
          <div className="bg-indigo-600 p-5 rounded-[1.5rem] shadow-xl shadow-indigo-200">
            <Target className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-center text-slate-900 mb-2">Matrix Hub</h1>
        <p className="text-slate-400 text-center mb-10 font-bold uppercase text-xs tracking-widest">Management Suite</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Username</label>
            <input type="text" value={u} onChange={e => setU(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all" placeholder="admin" required />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Password</label>
            <input type="password" value={p} onChange={e => setP(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all" placeholder="••••••••" required />
          </div>
          {err && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 py-3 rounded-xl">{err}</p>}
          <button className="w-full bg-indigo-600 text-white p-5 rounded-[1.25rem] font-black text-lg hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-100 uppercase tracking-tight">
            Authorize Access
          </button>
        </form>
      </div>
    </div>
  );
}
