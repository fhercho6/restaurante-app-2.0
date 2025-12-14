// src/components/POSInterface.jsx - SIN BOTÓN DE SERVICIO
import React, { useState } from 'react';
import { Search, ShoppingCart, Trash2, ChevronLeft, Send, ChefHat, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';

export default function POSInterface({ items, categories, staffMember, onCheckout, onPrintOrder, onExit }) {
  const [cart, setCart] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandCategories, setExpandCategories] = useState(false); 

  const canCharge = staffMember?.role === 'Cajero' || staffMember?.role === 'Administrador';

  // --- TARJETA DE PRODUCTO ---
  const POSCard = ({ item, onClick }) => {
    const stockNum = Number(item.stock);
    const hasStock = item.stock !== undefined && item.stock !== '';
    const isLowStock = hasStock && stockNum < 5;
    const isOut = hasStock && stockNum <= 0;

    return (
      <div 
        onClick={!isOut ? onClick : undefined} 
        className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col h-40 relative group active:scale-95 ${isOut ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
      >
        <div className="h-24 bg-gray-50 flex items-center justify-center overflow-hidden relative p-2">
          {item.image ? (
            <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-contain mix-blend-multiply" 
                loading="lazy"
                onError={(e) => e.target.style.display='none'} 
            />
          ) : (
            <ChefHat className="text-gray-300" size={32} />
          )}
          <div className="absolute top-1 right-1 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
             Bs. {Number(item.price).toFixed(2)}
          </div>
          {isLowStock && !isOut && (<div className="absolute bottom-0 w-full bg-red-600 text-white text-[9px] font-black text-center py-0.5 uppercase tracking-wider animate-pulse">¡SOLO {stockNum}!</div>)}
          {isOut && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-black uppercase tracking-widest text-sm transform -rotate-12 backdrop-blur-[1px]">AGOTADO</div>)}
        </div>
        <div className="p-2 flex flex-col flex-1 justify-between bg-white">
            <div>
                <p className="text-[9px] text-orange-600 font-bold uppercase truncate leading-none mb-1">{item.category}</p>
                <h4 className="font-bold text-gray-800 text-xs leading-tight line-clamp-2">{item.name}</h4>
            </div>
        </div>
      </div>
    );
  };

  // --- CARRITO ---
  const addToCart = (item) => { 
      if (navigator.vibrate) navigator.vibrate(30); 
      setCart(prev => { const existing = prev.find(i => i.id === item.id); if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i); return [...prev, { ...item, qty: 1 }]; }); 
  };
  const updateQty = (id, delta) => { setCart(prev => prev.map(item => { if (item.id === id) return { ...item, qty: Math.max(1, item.qty + delta) }; return item; })); };
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  
  const handleSendOrderSafe = async () => { if (isProcessing) return; setIsProcessing(true); try { await onPrintOrder(cart, setCart); } finally { setIsProcessing(false); } };
  const handleCheckoutSafe = async () => { if (isProcessing) return; setIsProcessing(true); try { await onCheckout(cart, setCart); } finally { setIsProcessing(false); } };

  const filteredItems = items.filter(i => { const matchesCat = categoryFilter === 'Todos' ? true : i.category === categoryFilter; const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()); return matchesCat && matchesSearch && i.category !== 'Servicios'; });
  const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  return (
    <div className="flex h-[85vh] bg-gray-100 rounded-xl overflow-hidden border border-gray-300 animate-in fade-in">
      
      {/* --- IZQUIERDA: CATÁLOGO --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        <div className="bg-white p-3 shadow-sm z-10 space-y-3">
          
          {/* Header Garzón (SIN BOTÓN DE SERVICIO) */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <button onClick={onExit} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"><ChevronLeft size={20}/></button>
                <div>
                    <h2 className="font-bold text-lg leading-none text-gray-800">{staffMember?.name?.split(' ')[0]}</h2>
                    <span className="text-[10px] text-green-600 font-bold uppercase">{staffMember?.role || 'Personal'}</span>
                </div>
            </div>
            {/* El botón de servicio ha sido eliminado de aquí */}
          </div>

          {/* Buscador */}
          <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
              <input type="text" placeholder="Buscar..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-orange-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>

          {/* Categorías (Grilla Expandible) */}
          <div className="relative">
             <div className={`flex flex-wrap gap-2 overflow-y-auto pr-6 transition-all ${expandCategories ? 'max-h-48' : 'max-h-12'} scrollbar-hide`}>
                <button onClick={() => setCategoryFilter('Todos')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${categoryFilter === 'Todos' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}>Todos</button>
                {categories.filter(c => c !== 'Servicios').map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${categoryFilter === cat ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}>{cat}</button>
                ))}
             </div>
             <button onClick={() => setExpandCategories(!expandCategories)} className="absolute right-0 top-0 bottom-0 bg-white/80 backdrop-blur-sm pl-2 flex items-start pt-1">
                {expandCategories ? <ChevronUp size={20} className="text-gray-500"/> : <ChevronDown size={20} className="text-gray-500"/>}
             </button>
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
            {filteredItems.map(item => (<POSCard key={item.id} item={item} onClick={() => addToCart(item)} />))}
        </div>
      </div>

      {/* --- DERECHA: COMANDA --- */}
      <div className="w-80 bg-white shadow-xl flex flex-col border-l border-gray-200 z-20">
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center"><h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm"><ShoppingCart size={16}/> Comanda</h3><button onClick={() => setCart([])} className="text-[10px] text-red-500 hover:underline font-bold" disabled={isProcessing}>LIMPIAR</button></div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300"><ShoppingCart size={32} className="mb-2 opacity-20"/><p className="text-xs">Vacío</p></div>
            ) : (
                cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex-1 min-w-0 mr-2">
                            <div className="font-bold text-gray-800 text-sm truncate">{item.name}</div>
                            <div className="text-[10px] text-gray-500">Bs. {item.price}</div>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 rounded px-1">
                            <button onClick={(e) => {e.stopPropagation(); updateQty(item.id, -1)}} disabled={isProcessing} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-white rounded transition-colors"><Minus size={12}/></button>
                            <span className="font-bold w-4 text-center text-xs">{item.qty}</span>
                            <button onClick={(e) => {e.stopPropagation(); updateQty(item.id, 1)}} disabled={isProcessing} className="w-6 h-6 flex items-center justify-center text-blue-600 hover:bg-white rounded transition-colors"><Plus size={12}/></button>
                        </div>
                        <button onClick={(e) => {e.stopPropagation(); removeFromCart(item.id)}} disabled={isProcessing} className="ml-2 text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                    </div>
                ))
            )}
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-2">
          <div className="flex justify-between items-end mb-1"><span className="text-gray-500 font-medium text-sm">Total</span><span className="text-2xl font-black text-gray-900">Bs. {cartTotal.toFixed(2)}</span></div>
          <div className={`grid ${canCharge ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
             <button onClick={handleSendOrderSafe} disabled={cart.length === 0 || isProcessing} className="bg-gray-800 text-white py-3 rounded-lg font-bold shadow hover:bg-gray-900 disabled:opacity-50 text-xs flex flex-col items-center justify-center">
                {isProcessing ? 'Enviando...' : <><Send size={16} className="mb-1"/> ENVIAR A CAJA</>}
             </button>
             {canCharge && (<button onClick={handleCheckoutSafe} disabled={cart.length === 0 || isProcessing} className="bg-green-600 text-white py-3 rounded-lg font-bold shadow hover:bg-green-700 disabled:opacity-50 text-xs flex flex-col items-center justify-center">{isProcessing ? 'Cobrando...' : <><div className="text-sm">COBRAR</div><span className="text-[9px] opacity-80">Directo</span></>}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}