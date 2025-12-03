// src/components/POSInterface.jsx
import React, { useState } from 'react';
import { ShoppingBag, User, ArrowLeft, Plus, Minus, CreditCard, ChefHat, Printer } from 'lucide-react';

const POSInterface = ({ items, categories, onCheckout, onPrintOrder, onExit, staffMember }) => {
  const [cart, setCart] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div>
             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <ShoppingBag className="text-blue-600" /> Punto de Venta
             </h2>
             {staffMember && (
               <div className="text-xs text-gray-500 flex items-center gap-1">
                  <User size={12} /> Atiende: <strong>{staffMember.name}</strong> ({staffMember.role})
               </div>
             )}
          </div>
        </div>
        <div className="font-mono text-lg font-bold bg-blue-50 text-blue-700 px-4 py-1 rounded-lg">
          Total: Bs. {total.toFixed(2)}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 shrink-0 hide-scrollbar">
             <button onClick={() => setFilter('Todos')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'Todos' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}>Todos</button>
             {categories.map(cat => (
               <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}>{cat}</button>
             ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-20">
            {filteredItems.map(item => {
               const hasStock = item.stock === undefined || item.stock === '' || parseInt(item.stock) > 0;
               return (
                 <div key={item.id} onClick={() => hasStock && addToCart(item)} className={`bg-white p-3 rounded-xl border hover:shadow-md transition-all cursor-pointer flex flex-col gap-2 ${!hasStock ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-blue-400'}`}>
                   <div className="h-24 bg-gray-100 rounded-lg overflow-hidden relative">
                     {item.image ? <img src={item.image} className="w-full h-full object-cover" alt={item.name} /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ChefHat size={24}/></div>}
                     {!hasStock && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold text-xs">AGOTADO</div>}
                     {hasStock && item.stock && <div className="absolute bottom-1 right-1 bg-white/90 px-1.5 rounded text-[10px] font-bold">{item.stock} u.</div>}
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">{item.name}</h4>
                     <div className="text-blue-600 font-bold text-sm">Bs. {Number(item.price).toFixed(2)}</div>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>

        <div className="w-80 bg-white border-l flex flex-col shadow-xl z-20">
          <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex justify-between items-center">
            <span>Pedido Actual</span>
            <span className="text-xs font-normal text-gray-500">{cart.reduce((acc, i) => acc + i.qty, 0)} items</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 mt-10 flex flex-col items-center">
                <ShoppingBag size={48} className="mb-2 opacity-20"/>
                <p>El carrito está vacío</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="font-medium text-sm truncate">{item.name}</div>
                    <div className="text-xs text-gray-500">Bs. {item.price} x {item.qty}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center bg-white border rounded hover:bg-red-50 text-red-500"><Minus size={12}/></button>
                    <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center bg-white border rounded hover:bg-blue-50 text-blue-500"><Plus size={12}/></button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t bg-gray-50 space-y-3">
            <div className="flex justify-between items-center mb-2 text-lg font-bold text-gray-800">
              <span>Total</span>
              <span>Bs. {total.toFixed(2)}</span>
            </div>
            
            {/* BOTÓN CORREGIDO: Ahora envía (cart, setCart) */}
            <button 
              onClick={() => onPrintOrder(cart, setCart)} // <--- ¡AQUÍ ESTABA EL ERROR!
              disabled={cart.length === 0} 
              className="w-full py-3 rounded-xl font-bold text-gray-800 bg-yellow-400 hover:bg-yellow-500 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer size={20} /> Imprimir Comanda
            </button>

            <button 
              onClick={() => onCheckout(cart, setCart)} 
              disabled={cart.length === 0} 
              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${cart.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
            >
              <CreditCard size={20} /> Confirmar Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSInterface;