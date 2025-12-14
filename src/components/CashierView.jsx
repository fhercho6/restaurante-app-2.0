// src/components/CashierView.jsx - CON PESTAÑA DE VENTA RÁPIDA
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import { 
  Clock, CheckCircle, AlertCircle, XCircle, Printer, Coffee, DollarSign, 
  Search, Grid, List, ShoppingCart, Trash2, ChevronRight, Plus, Minus
} from 'lucide-react';

// --- SUB-COMPONENTE: TARJETA DE PRODUCTO (Mini POS) ---
const CashierProductCard = ({ item, onClick }) => {
    const stockNum = Number(item.stock);
    const hasStock = item.stock !== undefined && item.stock !== '';
    const isLowStock = hasStock && stockNum < 5;
    const isOut = hasStock && stockNum <= 0;
  
    return (
      <div 
        onClick={!isOut ? onClick : undefined} 
        className={`bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all flex flex-col h-32 relative group ${isOut ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
      >
        <div className="h-20 bg-gray-50 flex items-center justify-center overflow-hidden relative">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e)=>e.target.style.display='none'}/>
          ) : (
            <Coffee className="text-gray-300" size={24}/>
          )}
          <div className="absolute top-1 right-1 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
             Bs. {item.price}
          </div>
          {isLowStock && !isOut && <div className="absolute bottom-0 w-full bg-red-500 text-white text-[9px] font-black text-center uppercase animate-pulse">Stock: {stockNum}</div>}
        </div>
        <div className="p-2 flex-1 flex flex-col justify-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase truncate">{item.category}</p>
            <h4 className="text-xs font-bold text-gray-800 leading-tight line-clamp-2">{item.name}</h4>
        </div>
      </div>
    );
};

export default function CashierView({ items, categories, onProcessPayment, onVoidOrder, onReprintOrder, onStopService, onOpenExpense }) {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'quick'
  const [orders, setOrders] = useState([]);
  
  // Estados para Venta Rápida
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('Todos');

  // --- ESCUCHA DE PEDIDOS PENDIENTES ---
  useEffect(() => {
    const ordersCol = isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`;
    const q = query(collection(db, ordersCol), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, []);

  // --- LÓGICA VENTA RÁPIDA ---
  const addToCart = (item) => {
    setCart(prev => {
        const exist = prev.find(i => i.id === item.id);
        if(exist) return prev.map(i => i.id === item.id ? {...i, qty: i.qty + 1} : i);
        return [...prev, {...item, qty: 1}];
    });
  };
  
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? {...i, qty: Math.max(1, i.qty + delta)} : i));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const handleQuickCheckout = () => {
    if (cart.length === 0) return;
    const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    // Creamos un objeto de orden temporal para pasarle al Modal de Pago
    const quickOrder = {
        id: 'QUICK-' + Date.now(),
        items: cart,
        total: total,
        staffName: 'Caja Directa',
        staffId: 'cashier',
        type: 'quick_sale'
    };
    onProcessPayment(quickOrder); // Reusamos la lógica de pago de App.jsx
    setCart([]); // Limpiamos carrito (si se cancela el pago, se pierde, pero es venta rápida)
  };

  // Filtros de Productos
  const filteredItems = items ? items.filter(i => {
      const matchCat = catFilter === 'Todos' ? true : i.category === catFilter;
      const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch && i.category !== 'Servicios';
  }) : [];

  const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in">
      
      {/* --- ENCABEZADO Y TABS --- */}
      <div className="flex justify-between items-center mb-4 px-1">
         <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
             <button 
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'orders' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
             >
                <List size={18}/> COMANDAS <span className="bg-white/20 px-1.5 rounded-full text-xs">{orders.filter(o => o.status === 'pending').length}</span>
             </button>
             <button 
                onClick={() => setActiveTab('quick')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'quick' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
             >
                <Grid size={18}/> VENTA RÁPIDA
             </button>
         </div>

         <button onClick={onOpenExpense} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors flex items-center gap-2">
            <DollarSign size={16}/> Registrar Gasto
         </button>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
         
         {/* --- PESTAÑA 1: COMANDAS (Lógica Original) --- */}
         {activeTab === 'orders' && (
            <div className="absolute inset-0 overflow-y-auto p-4">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                        <Clock size={64} className="mb-4 opacity-20"/>
                        <p className="font-bold text-lg">No hay pedidos pendientes</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {orders.map((order) => (
                            <div key={order.id} className={`rounded-xl border-2 overflow-hidden flex flex-col shadow-sm transition-all hover:shadow-md ${order.status === 'pending' ? 'border-orange-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-75'}`}>
                                {/* Cabecera Ticket */}
                                <div className={`p-3 flex justify-between items-start ${order.status === 'pending' ? 'bg-orange-50' : 'bg-gray-100'}`}>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black text-gray-800 text-lg">#{order.orderId || '---'}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded-full text-gray-500 border border-gray-200">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><CheckCircle size={10} className="text-green-500"/> {order.staffName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-xl text-gray-800">Bs. {order.total?.toFixed(2)}</p>
                                        <p className="text-[10px] text-orange-600 font-bold uppercase">{order.status === 'pending' ? 'Pendiente' : 'Pagado'}</p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="p-3 flex-1 overflow-y-auto max-h-40 space-y-2">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm items-center border-b border-gray-50 pb-1 last:border-0">
                                            <div className="flex gap-2">
                                                <span className="font-bold text-gray-800 w-5 text-center bg-gray-100 rounded">{item.qty}</span>
                                                <span className="text-gray-600 leading-tight">{item.name}</span>
                                            </div>
                                            <span className="font-mono font-medium text-gray-400 text-xs">{(item.price * item.qty).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Acciones */}
                                <div className="p-2 bg-white border-t border-gray-100 grid grid-cols-3 gap-2">
                                    <button onClick={() => onReprintOrder(order)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors" title="Reimprimir Comanda"><Printer size={18}/></button>
                                    <button onClick={() => {if(window.confirm('¿Anular pedido?')) onVoidOrder(order)}} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors" title="Anular"><XCircle size={18}/></button>
                                    <button onClick={() => onProcessPayment(order)} className="bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 shadow-md flex items-center justify-center gap-1 active:scale-95 transition-transform">COBRAR</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
         )}

         {/* --- PESTAÑA 2: VENTA RÁPIDA (Nuevo) --- */}
         {activeTab === 'quick' && (
             <div className="absolute inset-0 flex">
                 {/* IZQUIERDA: PRODUCTOS */}
                 <div className="flex-1 bg-gray-50 flex flex-col border-r border-gray-200">
                     <div className="p-3 bg-white border-b border-gray-200 space-y-2">
                         <div className="relative">
                             <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                             <input type="text" placeholder="Buscar producto..." className="w-full pl-9 p-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                         </div>
                         <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                             <button onClick={() => setCatFilter('Todos')} className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${catFilter === 'Todos' ? 'bg-black text-white' : 'bg-white text-gray-600'}`}>Todos</button>
                             {categories?.filter(c => c !== 'Servicios').map(cat => (
                                 <button key={cat} onClick={() => setCatFilter(cat)} className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${catFilter === cat ? 'bg-black text-white' : 'bg-white text-gray-600'}`}>{cat}</button>
                             ))}
                         </div>
                     </div>
                     <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
                         {filteredItems.map(item => (
                             <CashierProductCard key={item.id} item={item} onClick={() => addToCart(item)} />
                         ))}
                     </div>
                 </div>

                 {/* DERECHA: CARRITO RÁPIDO */}
                 <div className="w-80 bg-white flex flex-col shadow-xl z-10">
                     <div className="p-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                         <h3 className="font-black text-blue-900 flex items-center gap-2"><ShoppingCart size={18}/> Venta Directa</h3>
                         <button onClick={() => setCart([])} className="text-xs text-red-500 font-bold hover:underline">Limpiar</button>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto p-3 space-y-2">
                         {cart.length === 0 ? (
                             <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2">
                                 <ShoppingCart size={40} className="opacity-20"/>
                                 <p className="text-xs font-medium">Carrito vacío</p>
                             </div>
                         ) : (
                             cart.map(item => (
                                 <div key={item.id} className="flex justify-between items-center bg-white border border-gray-100 p-2 rounded-lg shadow-sm">
                                     <div className="flex-1 min-w-0">
                                         <div className="text-xs font-bold text-gray-800 truncate">{item.name}</div>
                                         <div className="text-[10px] text-gray-500">Bs. {item.price}</div>
                                     </div>
                                     <div className="flex items-center gap-2 bg-gray-50 rounded px-1 mx-2">
                                         <button onClick={() => updateQty(item.id, -1)} className="text-gray-500 hover:text-black"><Minus size={14}/></button>
                                         <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                                         <button onClick={() => updateQty(item.id, 1)} className="text-blue-600 hover:text-blue-800"><Plus size={14}/></button>
                                     </div>
                                     <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                                 </div>
                             ))
                         )}
                     </div>

                     <div className="p-4 bg-gray-50 border-t border-gray-200">
                         <div className="flex justify-between items-end mb-3">
                             <span className="text-gray-500 text-xs font-bold uppercase">Total a Cobrar</span>
                             <span className="text-2xl font-black text-gray-900">Bs. {cartTotal.toFixed(2)}</span>
                         </div>
                         <button 
                             onClick={handleQuickCheckout}
                             disabled={cart.length === 0}
                             className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-transform active:scale-95"
                         >
                             COBRAR AHORA <ChevronRight size={18}/>
                         </button>
                     </div>
                 </div>
             </div>
         )}

      </div>
    </div>
  );
}