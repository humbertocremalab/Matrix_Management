import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { BarChart3, Users, Target, LogOut, Settings, Save, AlertCircle } from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE ACTUALIZADA ---
const firebaseConfig = {
  apiKey: "AIzaSyCi3nxC2c8Sp4JAs9ylU4uxVagVXToP8HM",
  authDomain: "accountmatrixhub.firebaseapp.com",
  projectId: "accountmatrixhub",
  storageBucket: "accountmatrixhub.firebasestorage.app",
  messagingSenderId: "912278749399",
  appId: "1:912278749399:web:f6c4f8f575b01243d2b092",
  measurementId: "G-TLQ1WDTS38"
};

// Inicialización de servicios
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Verificación de Analytics (solo en navegador)
if (typeof window !== "undefined") {
  getAnalytics(app);
}

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    awareness: { views: 0, reach: 0, cost: 0 },
    prospecting: { clicks: 0, ctr: 0, cpc: 0 },
    retargeting: { conv: 0, roas: 0, sales: 0 }
  });

  // Autenticación Anónima para permitir acceso a la DB
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Error en auth:", err);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Escuchar cambios en tiempo real desde Firestore
  useEffect(() => {
    if (!user) return;

    // Usamos una ruta de documento fija (marketing_data/global_metrics)
    const metricsDocRef = doc(db, 'marketing_data', 'global_metrics');

    const unsubscribe = onSnapshot(metricsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setMetrics(docSnap.data());
      } else {
        console.log("El documento no existe, se usarán valores por defecto.");
      }
    }, (error) => {
      console.error("Error Firestore (posible falta de reglas de seguridad):", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = e.target.elements;
    // Login simulado para control de roles
    if (username.value === 'admin' && password.value === 'admin123') {
      setRole('admin');
    } else if (username.value === 'user' && password.value === 'user123') {
      setRole('user');
    } else {
      alert("Credenciales incorrectas.\nAdmin: admin / admin123\nUser: user / user123");
    }
  };

  const saveMetrics = async () => {
    if (role !== 'admin' || !user) return;
    try {
      const metricsDocRef = doc(db, 'marketing_data', 'global_metrics');
      await setDoc(metricsDocRef, metrics);
      alert("✅ Datos guardados y sincronizados en la nube.");
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("❌ Error de permisos. Asegúrate de que las reglas de Firestore permitan escritura.");
    }
  };

  if (loading) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center text-white font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold tracking-widest text-indigo-400">CONNECTING TO CLOUD...</p>
      </div>
    </div>
  );

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
          <div className="flex justify-center mb-8">
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-center text-slate-900 mb-2">Matrix Hub</h1>
          <p className="text-slate-500 text-center mb-10 font-medium">Control de Embudos de Marketing</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input name="username" type="text" placeholder="Usuario" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
            </div>
            <div>
              <input name="password" type="password" placeholder="Contraseña" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
            </div>
            <button className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all">
              Entrar al Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 text-white p-8 flex flex-col shadow-2xl">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Target size={24} />
          </div>
          <span className="font-black text-2xl tracking-tighter">MATRIX</span>
        </div>
        
        <nav className="flex-1 space-y-3">
          <button className="w-full flex items-center gap-4 p-4 bg-white/10 rounded-2xl font-bold text-indigo-400">
            <BarChart3 size={20}/> Dashboard
          </button>
          <button className="w-full flex items-center gap-4 p-4 text-slate-400 hover:bg-white/5 rounded-2xl transition-all font-medium">
            <Users size={20}/> Clientes
          </button>
          <button className="w-full flex items-center gap-4 p-4 text-slate-400 hover:bg-white/5 rounded-2xl transition-all font-medium">
            <Settings size={20}/> Ajustes
          </button>
        </nav>

        <button onClick={() => setRole(null)} className="mt-auto flex items-center gap-4 p-4 text-rose-400 font-bold hover:bg-rose-500/10 rounded-2xl transition-all">
          <LogOut size={20}/> Cerrar Sesión
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 md:p-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Métricas en Tiempo Real</h2>
            <p className="text-slate-500 font-medium mt-1">Conectado a accountmatrixhub.firebaseapp.com</p>
          </div>
          {role === 'admin' && (
            <button onClick={saveMetrics} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-xl shadow-emerald-100 transition-all active:scale-95">
              <Save size={20} /> Guardar Cambios
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-black text-slate-800 capitalize mb-8 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                {key}
              </h3>
              <div className="space-y-6">
                {Object.entries(value).map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center group">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</span>
                    {role === 'admin' ? (
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => setMetrics({
                          ...metrics,
                          [key]: { ...value, [label]: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-24 p-2 bg-slate-50 border-b-2 border-transparent focus:border-indigo-500 outline-none text-right font-bold text-slate-800 rounded-lg transition-all"
                      />
                    ) : (
                      <span className="font-black text-slate-700 text-lg tabular-nums">{val.toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-white border border-slate-200 rounded-[2rem] flex items-center gap-5">
          <div className={`p-4 rounded-2xl ${role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="font-black text-slate-800 uppercase text-sm tracking-tighter">Estado de Acceso: {role}</h4>
            <p className="text-slate-500 text-sm font-medium">
              {role === 'admin' ? 'Tienes permisos totales para editar la nube.' : 'Vista de solo lectura.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
