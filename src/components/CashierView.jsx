// src/components/CashierView.jsx - CORRECCIÓN DEFINITIVA: LISTA EN MODAL DE SERVICIO
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import { 
  Clock, CheckCircle, XCircle, Printer, Coffee, DollarSign, 
  Search, Grid, List, ShoppingCart, Trash2, ChevronRight, Plus, Minus, Tag, ChevronDown, ChevronUp, X, MapPin
} from 'lucide-react';

// --- LISTA DE MESAS PREDEFINIDA ---
const PREDEFINED_LOCATIONS = [
    "Barra", 
    "Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Mesa 5", 
    "Mesa 6", "Mesa 7", "Mesa 8", "Mesa 9", "Mesa 10",
    "Mesa 11", "Mesa 12", "Mesa 13", "Mesa 14", "Mesa 15",
    "VIP 1", "VIP 2", "Terraza 1", "Terraza 2"
];

// --- SUB-COMPONENTE: TARJETA DE PRODUCTO ---
const CashierProductCard = ({ item, onClick }) => {
    const stockNum = Number(item.stock);
    const hasStock = item.stock !== undefined && item.stock !== '';
    const isLowStock = hasStock && stockNum < 5;
    const isOut = hasStock && stockNum <= 0;
    const isService = item.category === 'Servicios';
  
    return (
      <button 
        onClick={!isOut || isService ? onClick : undefined} 
        disabled={isOut && !isService}
        className={`relative w-full text-left bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col h-36 group ${isOut && !isService ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="h-20 w-full bg-gray-50 flex items-center justify-center overflow-hidden p-2 relative">
          {item.image ? (
            <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-contain mix-blend-multiply" 
                loading="lazy"
                onError={(e)=>e.target.style.display='none'}
            />
          ) : (
            isService ? <Clock className="text-purple-400" size={32}/> : <Coffee className="text-gray-300" size={24}/>
          )}
          
          <div className={`absolute top-1 right-1 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10 ${isService ? 'bg-purple-600 text-white' : 'bg-black/80 text-white'}`}>
             Bs. {item.price}{isService ? '/hr' : ''}
          </div>

          {isLowStock && !isOut && !isService && <div className="absolute bottom-0 inset-x-0 bg-red-500 text-white text-[9px] font-black text-center uppercase tracking-wide">Quedan: {stockNum}</div>}
        </div>
        <div className="p-2 flex-1 flex flex-col justify-between bg-white">
            <p className="text-[9px] text-gray-500 font-bold uppercase truncate flex items-center gap-1">
                <Tag size={8}/> {item.category}
            </p>
            <h4 className="text-xs font-bold text-gray-800 leading-tight line-clamp-2">{item.name}</h4>
        </div>
        {isOut && !isService && <div className="absolute inset-0 bg-white/60 flex items-center justify-center font-black text-gray-400 text-xs uppercase tracking-widest rotate-[-12deg] border-2 border-gray-200 m-4 rounded-lg">Agotado</div>}
      </button>
    );
};

// --- MODAL CÁLCULO DE SERVICIO (CON LISTA DESPLEGABLE) ---
const ServiceTimeModal = ({ item, onClose, onConfirm }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('Barra'); // Default a Barra
    const [duration, setDuration] = useState(0); 
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => {
        const now = new Date();
        const nowStr = now.toTimeString().slice(0, 5);
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const startStr = oneHourAgo.toTimeString().slice(0, 5);
        setEndTime(nowStr);
        setStartTime(startStr);
    }, []);

    useEffect(() => {
        if(startTime && endTime) {
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            let startMinutes = startH * 60 + startM;
            let endMinutes = endH * 60 + endM;
            if (endMinutes < startMinutes) endMinutes += 24 * 60;
            const diffMinutes = endMinutes - startMinutes;
            const diffHours = diffMinutes / 60;
            setDuration(diffHours);
            setTotalCost(diffHours * item.price);
        }
    }, [startTime, endTime, item.price]);

    const handleConfirm = () => {
        if(totalCost > 0) {
            onConfirm(item, totalCost, `${startTime} - ${endTime}`, duration, location);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden">
                <div className="bg-purple-600 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><Clock size={18}/> Calcular Servicio</h3>
                    <button onClick={onClose} className="hover:bg-purple-700 p-1 rounded-full"><X size={18}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="text-center mb-2">
                        <p className="text-xs text-gray-500 uppercase font-bold">Servicio</p>
                        <h4 className="text-lg font-black text-gray-800">{item.name}</h4>
                        <p className="text-purple-600 font-bold text-sm">Bs. {item.price} / hora</p>
                    </div>
                    
                    {/* --- AQUÍ ESTÁ EL CAMBIO: SELECTOR EN LUGAR DE INPUT --- */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Ubicación / Mesa</label>
                        <div className="relative">
                            <MapPin size={14} className="absolute left-3 top-3 text-purple-500"/>
                            <select 
                                className="w-full pl-9 p-2 border rounded-lg font-bold text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
                                value={location} 
                                onChange={e => setLocation(e.target.value)}
                            >
                                {PREDEFINED_LOCATIONS.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Inicio</label><input type="time" className="w-full p-2 border rounded-lg font-bold text-gray-800 text-center bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Fin</label><input type="time" className="w-full p-2 border rounded-lg font-bold text-gray-800 text-center bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
                    </div>
                    
                    <div className="bg-gray-100 p-3 rounded-xl flex justify-between items-center border border-gray-200">
                        <div><p className="text-xs text-gray-500">Tiempo Total</p><p className="font-bold text-gray-800">{Math.floor(duration)}h {Math.round((duration % 1) * 60)}min</p></div>
                        <div className="text-right"><p className="text-xs text-gray-500">A Cobrar</p><p className="font-black text-xl text-purple-600">Bs. {totalCost.toFixed(2)}</p></div>
                    </div>
                    <button onClick={handleConfirm} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"><Plus size={18}/> AGREGAR</button>
                </div>
            </div>
        </div>
    );
};

export default function CashierView({ items, categories, onProcessPayment, onVoidOrder, onReprintOrder, onStopService, onOpenExpense }) {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [orders, setOrders] = useState([]);
  
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('Todos');
  const [expandCategories, setExpandCategories] = useState(false); 
  const [serviceModalItem, setServiceModalItem] = useState(null);
  const [quickTable, setQuickTable] = useState('Barra'); 

  useEffect(() => {
    const ordersCol = isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`;
    const q = query(collection(db, ordersCol), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleItemClick = (item) => {
      if (item.category === 'Servicios') {
          setServiceModalItem(item);
      } else {
          addToCart(item);
      }
  };

  const addToCart = (item) => {
    if (navigator.vibrate) navigator.vibrate(50);
    setCart(prev => {
        const exist = prev.find(i => i.id === item.id);
        if(exist) return prev.map(i => i.id === item.id ? {...i, qty: i.qty + 1} : i);
        return [...prev, {...item, qty: 1}];
    });
  };

  const addServiceToCart = (item, calculatedPrice, timeRange, durationHours, locationName) => {
      setServiceModalItem(null); 
      let finalName = `${item.name} (${timeRange})`;
      if (locationName && locationName !== 'Barra') {
          finalName += ` - ${locationName}`;
      }

      const serviceItem = {
          ...item,
          id: item.id + '-' + Date.now(), 
          price: calculatedPrice,
          name: finalName, 
          qty: 1,
          isServiceItem: true 
      };
      setCart(prev => [...prev, serviceItem]);
  };
  
  const updateQty = (id, delta, isServiceItem) => {
      if (isServiceItem) return; 
      setCart(prev => prev.map(i => i.id === id ? {...i, qty: Math.max(1, i.qty + delta)} : i));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const handleQuickCheckout = () => {
    if (cart.length === 0) return;
    const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    
    // Usamos la mesa seleccionada en el dropdown global
    const locationName = quickTable;

    const quickOrder = {
        id: 'QUICK-' + Date.now(),
        items: cart,
        total: total,
        staffName: `Caja - ${locationName}`, 
        staffId: 'cashier',
        type: 'quick_sale',
        table: locationName 
    };
    onProcessPayment(quickOrder); 
    setCart([]); 
    setQuickTable('Barra'); // Reset a Barra
  };

  const filteredItems = items ? items.filter(i => {
      const matchCat = catFilter === 'Todos' ? true : i.category === catFilter;
      const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
  }) : [];

  const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in">
      
      {serviceModalItem && (
          <ServiceTimeModal item={serviceModalItem} onClose={() => setServiceModalItem(null)} onConfirm={addServiceToCart} />
      )}

      {/* --- ENCABEZADO --- */}
      <div className="flex justify-between items-center mb-3 px-1 flex-wrap gap-2">
         <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
             <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'orders' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                <List size={16}/> COMANDAS <span className="bg-white/20 px-1.5 rounded-full text-[10px]">{orders.filter(o => o.status === 'pending').length}</span>
             </button>
             <button onClick={() => setActiveTab('quick')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'quick' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Grid size={16}/> VENTA RÁPIDA
             </button>
         </div>
         <button onClick={onOpenExpense} className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors flex items-center gap-2">
            <DollarSign size={14}/> GASTO
         </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
         
         {/* --- PESTAÑA COMANDAS --- */}
         {activeTab === 'orders' && (
            <div className="absolute inset-0 overflow-y-auto p-4 bg-gray-50/50">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300"><Clock size={64} className="mb-4 opacity-20"/><p className="font-bold text-lg">Sin comandas pendientes</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {orders.map((order) => (
                            <div key={order.id} className={`rounded-xl border flex flex-col shadow-sm transition-all hover:shadow-md ${order.status === 'pending' ? 'border-orange-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-75'}`}>
                                <div className={`p-3 flex justify-between items-start ${order.status === 'pending' ? 'bg-orange-50' : 'bg-gray-100'}`}>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1"><span className="font-black text-gray-800 text-base">#{order.orderId || '---'}</span><span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded text-gray-500 border border-gray-200">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><CheckCircle size={10} className="text-green-500"/> {order.staffName}</p>
                                    </div>
                                    <div className="text-right"><p className="font-black text-lg text-gray-800">Bs. {order.total?.toFixed(2)}</p></div>
                                </div>
                                <div className="p-3 flex-1 overflow-y-auto max-h-32 space-y-1">
                                    {order.items?.map((item, idx) => (<div key={idx} className="flex justify-between text-xs items-center border-b border-gray-50 pb-1 last:border-0"><div className="flex gap-2 items-center"><span className="font-bold text-gray-800 w-5 text-center bg-gray-100 rounded text-[10px]">{item.qty}</span><span className="text-gray-600 truncate max-w-[120px]">{item.name}</span></div><span className="font-mono text-gray-400">{(item.price * item.qty).toFixed(2)}</span></div>))}
                                </div>
                                <div className="p-2 bg-white border-t border-gray-100 grid grid-cols-3 gap-2">
                                    <button onClick={() => onReprintOrder(order)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg flex items-center justify-center"><Printer size={16}/></button>
                                    <button onClick={() => {if(window.confirm('¿Anular pedido?')) onVoidOrder(order)}} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center"><XCircle size={16}/></button>
                                    <button onClick={() => onProcessPayment(order)} className="bg-green-600 text-white rounded-lg font-bold text-xs hover:bg-green-700 shadow-md flex items-center justify-center">COBRAR</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
         )}

         {/* --- PESTAÑA VENTA RÁPIDA --- */}
         {activeTab === 'quick' && (
             <div className="absolute inset-0 flex">
                 <div className="flex-1 bg-gray-50 flex flex-col border-r border-gray-200 min-w-0">
                     <div className="p-3 bg-white border-b border-gray-200 space-y-3 z-10 shadow-sm">
                         <div className="relative">
                             <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                             <input type="text" placeholder="Buscar producto o servicio..." className="w-full pl-9 p-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                         </div>
                         <div className="relative">
                            <div className={`flex flex-wrap gap-2 overflow-y-auto pr-1 transition-all ${expandCategories ? 'max-h-60' : 'max-h-24'} scrollbar-thin`}>
                                <button onClick={() => setCatFilter('Todos')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${catFilter === 'Todos' ? 'bg-black text-white border-black ring-2 ring-gray-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>Todos</button>
                                {categories?.map(cat => (
                                    <button key={cat} onClick={() => setCatFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${catFilter === cat ? 'bg-black text-white border-black ring-2 ring-gray-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setExpandCategories(!expandCategories)} className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-white via-white to-transparent pl-4 flex items-start pt-1 md:hidden">
                                {expandCategories ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
                            </button>
                         </div>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4">
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-20">
                             {filteredItems.map(item => (<CashierProductCard key={item.id} item={item} onClick={() => handleItemClick(item)} />))}
                             {filteredItems.length === 0 && <div className="col-span-full text-center py-10 text-gray-400"><p>No se encontraron items.</p></div>}
                         </div>
                     </div>
                 </div>

                 <div className="w-80 bg-white flex flex-col shadow-2xl z-20 border-l border-gray-200">
                     <div className="p-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center"><h3 className="font-black text-blue-900 flex items-center gap-2 text-sm"><ShoppingCart size={16}/> Venta Directa</h3>{cart.length > 0 && <button onClick={() => setCart([])} className="text-[10px] text-red-500 font-bold hover:underline bg-white px-2 py-1 rounded border border-red-100">LIMPIAR</button>}</div>
                     <div className="flex-1 overflow-y-auto p-3 space-y-2">
                         {cart.length === 0 ? (
                             <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2 select-none"><ShoppingCart size={40} className="opacity-20"/><p className="text-xs font-medium">Escanea o selecciona</p></div>
                         ) : (
                             cart.map(item => (
                                 <div key={item.id} className="flex justify-between items-center bg-white border border-gray-100 p-2 rounded-lg shadow-sm animate-in slide-in-from-right duration-200">
                                     <div className="flex-1 min-w-0 mr-2">
                                         <div className="text-xs font-bold text-gray-800 truncate">{item.name}</div>
                                         <div className="text-[10px] text-gray-500">{item.isServiceItem ? 'Servicio calculado' : `unitario: Bs. ${item.price}`}</div>
                                     </div>
                                     {item.isServiceItem ? (
                                         <div className="font-bold text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">Bs. {item.price.toFixed(2)}</div>
                                     ) : (
                                         <div className="flex items-center gap-2 bg-gray-50 rounded px-1">
                                             <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-200 rounded transition-colors"><Minus size={12}/></button>
                                             <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                                             <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"><Plus size={12}/></button>
                                         </div>
                                     )}
                                     <button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                                 </div>
                             ))
                         )}
                     </div>
                     
                     <div className="p-4 bg-gray-50 border-t border-gray-200">
                         {/* SELECTOR GLOBAL DE MESA (Venta Normal) */}
                         <div className="mb-3 relative">
                             <MapPin size={16} className="absolute left-3 top-3 text-gray-400"/>
                             <select 
                                className="w-full pl-9 p-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white appearance-none"
                                value={quickTable}
                                onChange={e => setQuickTable(e.target.value)}
                             >
                                {PREDEFINED_LOCATIONS.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                             </select>
                             <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none"/>
                         </div>

                         <div className="flex justify-between items-end mb-3"><span className="text-gray-500 text-xs font-bold uppercase">Total a Cobrar</span><span className="text-2xl font-black text-gray-900">Bs. {cartTotal.toFixed(2)}</span></div>
                         <button onClick={handleQuickCheckout} disabled={cart.length === 0} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-transform active:scale-95">COBRAR AHORA <ChevronRight size={18}/></button>
                     </div>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
}