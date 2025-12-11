// src/components/POSInterface.jsx - VERSIÓN MODO SEGURO (Sin Loader)
import React, { useState } from 'react';
// Quitamos 'Loader' para evitar conflictos. Usamos solo lo básico.
import { Search, ShoppingCart, Trash2, ChevronLeft, Send, Clock } from 'lucide-react';
import { MenuCard } from './Views';

export default function POSInterface({ items, categories, staffMember, onCheckout, onPrintOrder, onExit, onOpenServiceModal }) {
  const [cart, setCart] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- ESTADO DE CARGA ---
  const [isProcessing, setIsProcessing] = useState(false);

  const canCharge = staffMember?.role === 'Cajero' || staffMember?.role === 'Administrador';

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, qty: Math.max(1, item.qty + delta) };
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  
  const handleSendOrderSafe = async () => {
      if (isProcessing) return; 
      setIsProcessing(true);
      try {
          await onPrintOrder(cart, setCart);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleCheckoutSafe = async () => {
      if (isProcessing) return;
      setIsProcessing(true);
      try {
          await onCheckout(cart, setCart);
      } finally {
          setIsProcessing(false);
      }
  };

  const filteredItems = items.filter(i => {
    const matchesCat = categoryFilter === 'Todos' ? true : i.category === categoryFilter;
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isNotService = i.category !== 'Servicios';
    return matchesCat && matchesSearch && isNotService;
  });

  const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden animate-in fade-in">
      {/* IZQUIERDA */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white p-4 shadow-sm z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
               <button onClick={onExit} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"><ChevronLeft/></button>
               <div>
                 <h2 className="font-black text-xl leading-none text-gray-800">Hola, {staffMember?.name.split(' ')[0]}</h2>
                 <span className="text-xs text-green-600 font-bold uppercase">{staffMember?.role || 'Personal'}</span>
               </div>
            </div>
            
            <button 
              onClick={onOpenServiceModal}
              className="bg-purple-600 text-white px-4 py-2 rounded-full font-bold shadow-md hover:bg-purple-700 transition-all flex items-center gap-2"
            >
              <Clock size={18} /> <span className="hidden sm:inline">Servicio Hora</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pb-2 max-h-32 overflow-y-auto">
            <button onClick={() => setCategoryFilter('Todos')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors border ${categoryFilter === 'Todos' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}>Todos</button>
            {categories.filter(c => c !== 'Servicios').map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors border ${categoryFilter === cat ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}>{cat}</button>
            ))}
          </div>
          
          <div className="mt-2 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20}/>
            <input type="text" placeholder="Buscar producto..." className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
          {filteredItems.map(item => (
            <div key={item.id} onClick={() => addToCart(item)} className="cursor-pointer h-full">
               <MenuCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* DERECHA */}
      <div className="w-96 bg-white shadow-2xl flex flex-col border-l border-gray-200 z-20">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 flex items-center gap-2"><ShoppingCart size={20}/> Comanda</h3>
          <button onClick={() => setCart([])} className="text-xs text-red-500 hover:underline font-bold" disabled={isProcessing}>Limpiar</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              <ShoppingCart size={48} className="mb-2 opacity-20"/>
              <p>Selecciona productos</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex-1">
                  <div className="font-bold text-gray-800 leading-tight">{item.name}</div>
                  <div className="text-xs text-gray-500">Bs. {item.price}</div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                  <button onClick={(e) => {e.stopPropagation(); updateQty(item.id, -1)}} disabled={isProcessing} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow text-gray-600 font-bold hover:bg-gray-100">-</button>
                  <span className="font-bold w-4 text-center">{item.qty}</span>
                  <button onClick={(e) => {e.stopPropagation(); updateQty(item.id, 1)}} disabled={isProcessing} className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded shadow text-white font-bold hover:bg-blue-700">+</button>
                </div>
                <button onClick={(e) => {e.stopPropagation(); removeFromCart(item.id)}} disabled={isProcessing} className="ml-3 text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
          <div className="flex justify-between items-end mb-2">
            <span className="text-gray-500 font-medium">Total</span>
            <span className="text-3xl font-black text-gray-900">Bs. {cartTotal.toFixed(2)}</span>
          </div>
          
          <div className={`grid ${canCharge ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
             {/* BOTÓN ENVIAR A CAJA */}
             <button 
                onClick={handleSendOrderSafe} 
                disabled={cart.length === 0 || isProcessing} 
                className={`text-white py-4 rounded-xl font-bold shadow-lg flex flex-col items-center justify-center gap-1 transition-all ${isProcessing ? 'bg-gray-400 cursor-wait' : 'bg-gray-800 hover:bg-gray-900'} disabled:opacity-50 disabled:cursor-not-allowed`}
             >
                {isProcessing ? (
                    <span className="text-xs uppercase animate-pulse">Enviando...</span>
                ) : (
                    <>
                        <Send size={20} />
                        <span className="text-xs uppercase">Enviar a Caja</span>
                    </>
                )}
             </button>

             {canCharge && (
               <button 
                  onClick={handleCheckoutSafe} 
                  disabled={cart.length === 0 || isProcessing} 
                  className={`text-white py-4 rounded-xl font-bold shadow-lg flex flex-col items-center justify-center gap-1 transition-all ${isProcessing ? 'bg-gray-400 cursor-wait' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
               >
                  {isProcessing ? (
                      <span className="text-xs font-bold animate-pulse">COBRANDO...</span>
                  ) : (
                      <>
                        <div className="font-bold">COBRAR</div>
                        <span className="text-[10px] opacity-80 uppercase">Directo</span>
                      </>
                  )}
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}