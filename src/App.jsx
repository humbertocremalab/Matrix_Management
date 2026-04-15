import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { Layout, BarChart3, Users, Target, Link as LinkIcon, LogOut, Settings, Save, AlertCircle } from 'lucide-react';

// Configuración de Firebase (Asegúrate de que coincida con tu consola)
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'account-matrix-hub';

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    awareness: { views: 0, reach: 0, cost: 0 },
    prospecting: { clicks: 0, ctr: 0, cpc: 0 },
    retargeting: { conv: 0, roas: 0, sales: 0 }
  });

  // Autenticación
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Error auth:", err);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  // CARGA DE DATOS (CORREGIDA PARA EVITAR ERROR DE SEGMENTOS)
  useEffect(() => {
    if (!user) return;

    // RULE 1: La ruta debe terminar en un nombre de documento (par de segmentos)
    // Usamos 'global_metrics' como nombre de documento fijo
    const metricsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'marketing', 'global_metrics');

    const unsubscribe = onSnapshot(metricsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setMetrics(docSnap.data());
      }
    }, (error) => {
      console.error("Error Firestore:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = e.target.elements;
    if (username.value === 'admin' && password.value === 'admin123') {
      setRole('admin');
    } else if (username.value === 'user' && password.value === 'user123') {
      setRole('user');
    } else {
      alert("Credenciales incorrectas");
    }
  };

  const saveMetrics = async () => {
    if (role !== 'admin') return;
    try {
      const metricsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'marketing', 'global_metrics');
      await setDoc(metricsDocRef, metrics);
      alert("Métricas guardadas en la nube");
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-100 p-3 rounded-xl">
              <Target className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">AccountMatrix Hub</h1>
          <p className="text-slate-500 text-center mb-8">Gestión de Embudos de Marketing</p>
          <div className="space-y-4">
            <input name="username" type="text" placeholder="Usuario" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
            <input name="password" type="password" placeholder="Contraseña" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
            <button className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition">Entrar</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <Target className="text-indigo-400" />
          <span className="font-bold text-xl">AccountMatrix</span>
        </div>
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 bg-indigo-600 rounded-lg"><BarChart3 size={20}/> Dashboard</button>
          <button className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white transition"><Users size={20}/> Clientes</button>
          <button className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white transition"><Settings size={20}/> Configuración</button>
        </nav>
        <button onClick={() => setRole(null)} className="flex items-center gap-3 p-3 text-red-400 hover:text-red-300 transition">
          <LogOut size={20}/> Salir
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Panel de Control</h2>
            <p className="text-slate-500">Métricas en tiempo real (Firebase Cloud)</p>
          </div>
          {role === 'admin' && (
            <button onClick={saveMetrics} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition font-medium shadow-lg">
              <Save size={18} /> Guardar Cambios
            </button>
          )}
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 capitalize mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div> {key}
              </h3>
              <div className="space-y-4">
                {Object.entries(value).map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm uppercase">{label}</span>
                    {role === 'admin' ? (
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => setMetrics({
                          ...metrics,
                          [key]: { ...value, [label]: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-20 p-1 border rounded text-right bg-slate-50"
                      />
                    ) : (
                      <span className="font-bold text-slate-700">{val}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-indigo-500 mt-1" />
          <p className="text-indigo-800 text-sm">
            <b>Modo {role}:</b> {role === 'admin' ? 'Tienes permisos para editar y guardar métricas en la base de datos.' : 'Solo tienes permiso de lectura.'}
          </p>
        </div>
      </main>
    </div>
  );
}
