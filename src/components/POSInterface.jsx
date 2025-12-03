// src/components/POSInterface.jsx
import React, { useState } from 'react';
import { ShoppingBag, User, ArrowLeft, Plus, Minus, CreditCard, ChefHat, Printer, X, ChevronUp } from 'lucide-react';

const POSInterface = ({ items, categories, onCheckout, onPrintOrder, onExit, staffMember }) => {
  const [cart, setCart] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // ESTADO NUEVO: Controla si el carrito está abierto en el celular
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesCategory = filter === 'Todos' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item) => {
    if (item.stock !== undefined && item.stock !== '' && parseInt(item.stock) <= 0) {
      alert("¡Producto agotado!");
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (item.stock !== undefined && item.stock !== '' && existing.qty + 1 > parseInt(item.stock)) {
           alert("No hay suficiente stock.");
           return prev;
        }
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.reduce((acc, item) => {
      if (item.id === itemId) {
        if (item.qty > 1) return [...acc, { ...item, qty: item.qty - 1 }];
        return acc;
      }
      return [...acc, item];
    }, []));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalItems = cart.reduce((acc, i) => acc + i.qty, 0);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div>
             <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 leading-none">
               PV
             </h2>
             {staffMember && (
               <div className="text-[10px] text-gray-500 font-medium truncate max-w-[120px]">
                  {staffMember.name}
               </div>
             )}
          </div>
        </div>
        {/* Buscador Rápido */}
        <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ml-2 w-32 md:w-64 bg-gray-100 border-none rounded-full px-4 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
        />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* --- COLUMNA IZQUIERDA: PRODUCTOS --- */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          
          {/* Categorías (Scroll Horizontal) */}
          <div className="p-2 bg-white shadow-sm z-10">
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                <button onClick={() => setFilter('Todos')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'Todos' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>Todos</button>
                {categories.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === cat ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>{cat}</button>
                ))}
            </div>
          </div>

          {/* Grid de Productos (Adaptable) */}
          <div className="flex-1 overflow-y-auto p-3 pb-24 md:pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredItems.map(item => {
                const hasStock = item.stock === undefined || item.stock === '' || parseInt(item.stock) > 0;
                return (
                    <div key={item.id} onClick={() => hasStock && addToCart(item)} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden active:scale-95 transition-transform duration-100 ${!hasStock ? 'opacity-60 grayscale' : ''}`}>
                    <div className="h-28 bg-gray-200 relative">
                        {item.image ? <img src={item.image} className="w-full h-full object-cover" alt={item.name} loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ChefHat size={20}/></div>}
                        {hasStock && item.stock && <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1.5 rounded text-[10px] font-bold">{item.stock}</div>}
                    </div>
                    <div className="p-2">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-800 text-xs leading-tight line-clamp-2 h-8">{item.name}</h4>
                        </div>
                        <div className="text-orange-600 font-black text-sm">Bs. {Number(item.price).toFixed(2)}</div>
                    </div>
                    </div>
                );
                })}
            </div>
          </div>
        </div>

        {/* --- BOTÓN FLOTANTE MÓVIL (Solo visible en pantallas chicas cuando hay items) --- */}
        {cart.length > 0 && (
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
                <button 
                    onClick={() => setIsMobileCartOpen(true)}
                    className="w-full bg-gray-900 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center animate-in slide-in-from-bottom-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                            {totalItems}
                        </div>
                        <span className="font-medium text-sm">Ver Pedido</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-lg">
                        Bs. {total.toFixed(2)} <ChevronUp size={20}/>
                    </div>
                </button>
            </div>
        )}

        {/* --- COLUMNA DERECHA: CARRITO (Slide-over en móvil / Fijo en PC) --- */}
        <div className={`
            fixed inset-0 z-50 bg-black/50 transition-opacity md:static md:bg-transparent md:w-96 md:flex md:flex-col md:border-l md:shadow-xl
            ${isMobileCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible md:opacity-100 md:visible'}
        `}>
            {/* Contenedor Blanco del Carrito */}
            <div className={`
                absolute bottom-0 left-0 right-0 top-20 bg-white rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300
                md:static md:h-full md:rounded-none md:translate-y-0
                ${isMobileCartOpen ? 'translate-y-0' : 'translate-y-full'}
            `}>
                
                {/* Header del Carrito (Solo Móvil) */}
                <div className="md:hidden flex justify-center pt-3 pb-1" onClick={() => setIsMobileCartOpen(false)}>
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2"></div>
                </div>
                <div className="px-4 pb-2 flex justify-between items-center border-b md:p-4 md:bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><ShoppingBag size={20}/> Pedido Actual</h3>
                    <button onClick={() => setIsMobileCartOpen(false)} className="md:hidden p-2 bg-gray-100 rounded-full"><X size={20}/></button>
                </div>

                {/* Lista de Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <ShoppingBag size={64} className="mb-4 opacity-20"/>
                            <p>Tu carrito está vacío</p>
                            <button onClick={() => setIsMobileCartOpen(false)} className="mt-4 text-orange-500 font-medium md:hidden">Volver al menú</button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex-1 min-w-0 mr-3">
                                    <div className="font-bold text-sm text-gray-800 leading-tight">{item.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">Bs. {item.price.toFixed(2)}</div>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                    <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center bg-white border rounded-md shadow-sm active:scale-90 text-red-500"><Minus size={16}/></button>
                                    <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                                    <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center bg-white border rounded-md shadow-sm active:scale-90 text-green-600"><Plus size={16}/></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer de Acciones */}
                <div className="p-4 bg-gray-50 border-t space-y-3 pb-8 md:pb-4">
                    <div className="flex justify-between items-center text-xl font-black text-gray-900">
                        <span>Total</span>
                        <span>Bs. {total.toFixed(2)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => onPrintOrder(cart, setCart)} 
                            disabled={cart.length === 0} 
                            className="py-3.5 rounded-xl font-bold text-gray-800 bg-yellow-400 active:bg-yellow-500 shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
                        >
                            <Printer size={18} /> Comanda
                        </button>

                        <button 
                            onClick={() => onCheckout(cart, setCart)} 
                            disabled={cart.length === 0} 
                            className="py-3.5 rounded-xl font-bold text-white bg-gray-900 active:bg-black shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            <CreditCard size={18} /> Cobrar
                        </button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default POSInterface;