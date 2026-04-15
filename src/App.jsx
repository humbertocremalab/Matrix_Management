import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  ChevronRight, 
  Package, 
  Calendar, 
  Edit2, 
  Check, 
  X,
  Zap,
  LayoutGrid,
  ShoppingCart
} from 'lucide-react';

// --- Mock Data ---
const MOCK_INSUMOS = [
  { id: 1, nombre: 'Sillas Tiffany', categoria: 'Mobiliario', precio: 25 },
  { id: 2, nombre: 'Mesas Redondas', categoria: 'Mobiliario', precio: 150 },
  { id: 3, nombre: 'Mantelería Blanca', categoria: 'Textiles', precio: 45 },
  { id: 4, nombre: 'Cristalería de Lujo', categoria: 'Vajilla', precio: 120 },
  { id: 5, nombre: 'Sonido Profesional', categoria: 'Audio', precio: 1500 },
];

const MOCK_EXPRESS_PRODUCTS = [
  { id: 1, nombre: 'Refresco Cola 2L', precio: 35, stock: 45, img: '🥤' },
  { id: 2, nombre: 'Botana Mixta 500g', precio: 68, stock: 20, img: '🥨' },
  { id: 3, nombre: 'Hielo 5kg', precio: 25, stock: 15, img: '🧊' },
  { id: 4, nombre: 'Vaso Desechable 50pk', precio: 42, stock: 100, img: '🥤' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('eventos');
  
  // Eventos State
  const [insumosAgregados, setInsumosAgregados] = useState([]);
  const [editingInsumoId, setEditingInsumoId] = useState(null);
  const [editQty, setEditQty] = useState(0);

  // Express State
  const [cart, setCart] = useState({});

  // --- Handlers Eventos ---
  const handleAddInsumo = (insumo) => {
    const exists = insumosAgregados.find(i => i.id === insumo.id);
    if (exists) {
      setInsumosAgregados(insumosAgregados.map(i => 
        i.id === insumo.id ? { ...i, cantidad: i.cantidad + 1 } : i
      ));
    } else {
      setInsumosAgregados([...insumosAgregados, { ...insumo, cantidad: 1 }]);
    }
  };

  const startEdit = (insumo) => {
    setEditingInsumoId(insumo.id);
    setEditQty(insumo.cantidad);
  };

  const saveEdit = (id) => {
    setInsumosAgregados(insumosAgregados.map(i => 
      i.id === id ? { ...i, cantidad: parseInt(editQty) || 1 } : i
    ));
    setEditingInsumoId(null);
  };

  const removeInsumo = (id) => {
    setInsumosAgregados(insumosAgregados.filter(i => i.id !== id));
  };

  // --- Handlers Express ---
  const updateCart = (id, delta) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="text-blue-600" /> Sistema Operativo
        </h1>
        <nav className="flex gap-2">
          <button 
            onClick={() => setActiveTab('eventos')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'eventos' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100'}`}
          >
            <Calendar size={18} /> Eventos
          </button>
          <button 
            onClick={() => setActiveTab('express')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'express' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-slate-100'}`}
          >
            <Zap size={18} /> Express
          </button>
        </nav>
      </header>

      <main className="p-6">
        {activeTab === 'eventos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Buscador de Insumos */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Buscar insumos para el evento..." 
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_INSUMOS.map(insumo => (
                    <div key={insumo.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-300 transition-colors">
                      <div>
                        <p className="font-semibold text-slate-800">{insumo.nombre}</p>
                        <p className="text-sm text-slate-500">${insumo.precio} / unidad</p>
                      </div>
                      <button 
                        onClick={() => handleAddInsumo(insumo)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel de Resumen y Edición (Recuadros de Insumos Agregados) */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-slate-800 text-white p-4 font-semibold flex items-center gap-2">
                  <Package size={18} /> Insumos Seleccionados
                </div>
                <div className="p-4 space-y-3 min-h-[300px]">
                  {insumosAgregados.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 italic">
                      No hay insumos agregados aún
                    </div>
                  ) : (
                    insumosAgregados.map(item => (
                      <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center font-bold">
                            {editingInsumoId === item.id ? (
                              <input 
                                type="number" 
                                value={editQty}
                                onChange={(e) => setEditQty(e.target.value)}
                                className="w-full text-center bg-transparent border-b border-blue-600 outline-none"
                              />
                            ) : (
                              item.cantidad
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm leading-tight">{item.nombre}</p>
                            <p className="text-xs text-slate-500">${item.precio * item.cantidad} total</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          {editingInsumoId === item.id ? (
                            <button 
                              onClick={() => saveEdit(item.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Check size={16} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => startEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => removeInsumo(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {insumosAgregados.length > 0 && (
                  <div className="p-4 border-t bg-slate-50">
                    <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                      Confirmar Insumos
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'express' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Lista de Productos Express - Estilo Cuadrícula Imagen */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {MOCK_EXPRESS_PRODUCTS.map(product => (
                  <div key={product.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col items-center p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-bold text-slate-800 mb-2 text-center uppercase tracking-tight">
                      {product.nombre}
                    </h3>
                    
                    <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-5xl mb-4">
                      {product.img}
                    </div>

                    <div className="w-full flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                      <p className="text-lg font-black text-amber-600">
                        ${product.precio}
                      </p>
                      
                      <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
                        <button 
                          onClick={() => updateCart(product.id, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-slate-600 hover:text-red-500"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-sm">
                          {cart[product.id] || 0}
                        </span>
                        <button 
                          onClick={() => updateCart(product.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-slate-600 hover:text-green-500"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar de Pago Express */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border p-5 sticky top-24">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b">
                  <ShoppingCart size={20} className="text-amber-500" />
                  <h2 className="font-bold text-lg">Resumen Express</h2>
                </div>
                
                <div className="space-y-4 mb-6">
                  {Object.entries(cart).filter(([_, qty]) => qty > 0).map(([id, qty]) => {
                    const product = MOCK_EXPRESS_PRODUCTS.find(p => p.id === parseInt(id));
                    return (
                      <div key={id} className="flex justify-between text-sm">
                        <span className="text-slate-600">{qty}x {product.nombre}</span>
                        <span className="font-semibold">${product.precio * qty}</span>
                      </div>
                    );
                  })}
                  {Object.values(cart).every(v => v === 0) && (
                    <p className="text-slate-400 text-center text-sm italic py-4">Carrito vacío</p>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-lg font-black text-slate-900">
                    <span>TOTAL</span>
                    <span>
                      ${Object.entries(cart).reduce((acc, [id, qty]) => {
                        const product = MOCK_EXPRESS_PRODUCTS.find(p => p.id === parseInt(id));
                        return acc + (product.precio * qty);
                      }, 0)}
                    </span>
                  </div>
                  <button className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all mt-4">
                    Cobrar Ahora
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
