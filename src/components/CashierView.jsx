// src/components/CashierView.jsx - BLOQUEO DE MESAS DUPLICADAS EN SERVICIOS
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import { 
  Clock, CheckCircle, XCircle, Printer, Coffee, DollarSign, 
  Search, Grid, List, ShoppingCart, Trash2, ChevronRight, Plus, Minus, Tag, ChevronDown, ChevronUp, X, MapPin, CheckSquare, CreditCard, Loader2, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

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

// --- MODAL CÁLCULO DE SERVICIO (CON BLOQUEO DE MESAS OCUPADAS) ---
const ServiceTimeModal = ({ item, onClose, onConfirm, tables, occupiedTables }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    
    // Determinar mesa inicial (primera que no esté ocupada)
    const getInitialTable = () => {
        if (!tables) return 'Barra';
        const freeTable = tables.find(t => !occupiedTables.includes(t));
        return freeTable || tables[0];
    };

    const [location, setLocation] = useState(getInitialTable);
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
        if (occupiedTables.includes(location)) {
            toast.error(`La ${location} ya tiene un servicio en esta venta.`);
            return;
        }
        if(totalCost > 0) {
            onConfirm(item, totalCost, `${startTime} - ${endTime}`, duration, location);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl">
                <div className="bg-purple-600 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><Clock size={18}/> Calcular Servicio</h3>
                    <button onClick={onClose}><X size={18}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="text-center mb-2">
                        <p className="text-xs text-gray-500 uppercase font-bold">Servicio</p>
                        <h4 className="text-lg font-black text-gray-800">{item.name}</h4>
                        <p className="text-purple-600 font-bold text-sm">Bs. {item.price} / hora</p>
                    </div>
                    
                    {/* SELECTOR DE MESA INTELIGENTE */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Ubicación / Mesa</label>
                        <div className="relative">
                            <MapPin size={14} className="absolute left-3 top-3 text-purple-500"/>
                            <select 
                                className={`w-full pl-9 p-2 border rounded-lg font-bold outline-none appearance-none uppercase transition-colors ${occupiedTables.includes(location) ? 'border-red-300 bg-red-50 text-red-600' : 'text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500'}`}
                                value={location} 
                                onChange={e => setLocation(e.target.value)}
                            >
                                {tables && tables.map(loc => {
                                    const isOccupied = occupiedTables.includes(loc);
                                    return (
                                        <option key={loc} value={loc} disabled={isOccupied} className={isOccupied ? 'text-gray-300' : ''}>
                                            {loc} {isOccupied ? '(En Carrito)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none"/>
                        </div>
                        {occupiedTables.includes(location) && (
                            <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> Mesa ocupada en esta orden</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Inicio</label><input type="time" className="w-full p-2 border rounded-lg font-bold text-gray-800 text-center bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Fin</label><input type="time" className="w-full p-2 border rounded-lg font-bold text-gray-800 text-center bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
                    </div>
                    
                    <div className="bg-gray-100 p-3 rounded-xl flex justify-between items-center border border-gray-200">
                        <div><p className="text-xs text-gray-500">Tiempo Total</p><p className="font-bold text-gray-800">{Math.floor(duration)}h {Math.round((duration % 1) * 60)}min</p></div>
                        <div className="text-right"><p className="text-xs text-gray-500">A Cobrar</p><p className="font-black text-xl text-purple-600">Bs. {totalCost.toFixed(2)}</p></div>
                    </div>
                    <button 
                        onClick={handleConfirm} 
                        disabled={occupiedTables.includes(location)}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                    >
                        <Plus size={18}/> {occupiedTables.includes(location) ? 'MESA OCUPADA' : 'AGREGAR'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function CashierView({ items, categories, tables, onProcessPayment, onVoidOrder, onReprintOrder, onStopService, onOpenExpense }) {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [orders, setOrders] = useState([]);
  
  // Estados Venta Rápida
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('Todos');
  const [expandCategories, setExpandCategories] = useState(false); 
  const [serviceModalItem, setServiceModalItem] = useState(null);
  const [quickTable, setQuickTable] = useState('LICOBAR'); 

  // Estados Cobro Masivo
  const [selectedOrders, setSelectedOrders] = useState([]); 
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Lógica de prioridad "LICOBAR"
  useEffect(() => {
      if (tables && tables.length > 0) {
          if (tables.includes('LICOBAR')) {
              if (quickTable !== 'LICOBAR' && !tables.includes(quickTable)) setQuickTable('LICOBAR');
          } 
          else if (!tables.includes(quickTable)) setQuickTable(tables[0]);
      }
  }, [tables, quickTable]);

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
      if (locationName) finalName += ` - ${locationName}`;

      const serviceItem = {
          ...item,
          id: item.id + '-' + Date.now(), 
          price: calculatedPrice,
          name: finalName, 
          location: locationName, // GUARDAMOS LA MESA PARA VALIDAR DUPLICADOS
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
    
    if (tables && tables.includes('LICOBAR')) {
        setQuickTable('LICOBAR');
    }
  };

  // --- LÓGICA COBRO MASIVO (Toast) ---
  const toggleOrderSelection = (orderId) => {
      setSelectedOrders(prev => {
          if (prev.includes(orderId)) return prev.filter(id => id !== orderId);
          return [...prev, orderId];
      });
  };

  const requestBulkPay = (paymentMethod) => {
      if(selectedOrders.length === 0) return;
      const ordersToPay = orders.filter(o => selectedOrders.includes(o.id));
      const totalAmount = ordersToPay.reduce((sum, o) => sum + o.total, 0);

      toast((t) => (
          <div className="flex flex-col gap-3 min-w-[240px] bg-white p-1">
              <div>
                  <p className="font-bold text-gray-800 text-sm">¿Confirmar Cobro?</p>
                  <p className="text-xs text-gray-500">{selectedOrders.length} comandas por <b>{paymentMethod}</b></p>
                  <p className="text-lg font-black text-gray-900 mt-1">Total: Bs. {totalAmount.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                  <button onClick={() => { toast.dismiss(t.id); executeBulkPay(paymentMethod, ordersToPay); }} className="bg-green-600 text-white py-2 rounded-lg text-xs font-bold flex-1 hover:bg-green-700 transition-colors">CONFIRMAR</button>
                  <button onClick={() => toast.dismiss(t.id)} className="bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-bold flex-1 hover:bg-gray-200 transition-colors">CANCELAR</button>
              </div>
          </div>
      ), { duration: 8000, position: 'bottom-center', style: { borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)' } });
  };

  const executeBulkPay = async (paymentMethod, ordersToPay) => {
      setIsPaying(true); 
      setTimeout(async () => {
          try {
              const batch = writeBatch(db);
              const salesCol = isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`;
              const ordersCol = isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`;
              
              ordersToPay.forEach(order => {
                  const saleData = {
                      date: new Date().toISOString(),
                      total: order.total,
                      items: order.items,
                      staffId: order.staffId || 'anon',
                      staffName: order.staffName,
                      cashier: 'Caja (Masivo)',
                      registerId: 'active-session', 
                      payments: [{ method: paymentMethod, amount: order.total }],
                      totalPaid: order.total,
                      changeGiven: 0,
                      isBulk: true
                  };
                  const saleRef = doc(collection(db, salesCol)); 
                  batch.set(saleRef, saleData);
                  const orderRef = doc(db, ordersCol, order.id);
                  batch.delete(orderRef);
              });

              await batch.commit();
              toast.success(`¡Cobro exitoso!`, { icon: '✅' });
              setSelectedOrders([]);
              setIsSelectionMode(false); 
          } catch (error) {
              console.error(error);
              toast.error('Error al procesar', { icon: '❌' });
          } finally {
              setIsPaying(false); 
          }
      }, 100);
  };

  const filteredItems = items ? items.filter(i => {
      const matchCat = catFilter === 'Todos' ? true : i.category === catFilter;
      const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
  }) : [];

  const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const totalSelected = orders.filter(o => selectedOrders.includes(o.id)).reduce((acc, o) => acc + o.total, 0);

  // --- CALCULAR MESAS YA OCUPADAS EN EL CARRITO ---
  const occupiedTablesInCart = cart
      .filter(i => i.isServiceItem && i.location) // Solo items de servicio con mesa asignada
      .map(i => i.location);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in relative">
      {isPaying && (<div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[60] flex items-center justify-center rounded-2xl animate-in fade-in duration-200"><div className="bg-white p-4 rounded-2xl shadow-2xl flex flex-col items-center gap-3 border border-gray-100"><Loader2 className="animate-spin text-blue-600" size={32}/><span className="font-bold text-gray-700 text-sm">Procesando pagos...</span></div></div>)}
      
      {/* PASAMOS occupiedTables AL MODAL */}
      {serviceModalItem && (
          <ServiceTimeModal 
            item={serviceModalItem} 
            onClose={() => setServiceModalItem(null)} 
            onConfirm={addServiceToCart} 
            tables={tables} 
            occupiedTables={occupiedTablesInCart} // NUEVA PROP
          />
      )}

      <div className="flex justify-between items-center mb-3 px-1 flex-wrap gap-2">
         <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
             <button onClick={() => {setActiveTab('orders'); setIsSelectionMode(false); setSelectedOrders([]);}} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'orders' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><List size={16}/> COMANDAS <span className="bg-white/20 px-1.5 rounded-full text-[10px]">{orders.filter(o => o.status === 'pending').length}</span></button>
             <button onClick={() => {setActiveTab('quick'); setIsSelectionMode(false);}} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'quick' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><Grid size={16}/> VENTA RÁPIDA</button>
         </div>
         <div className="flex gap-2">
            {activeTab === 'orders' && orders.length > 0 && (<button onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedOrders([]); }} className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 border transition-colors ${isSelectionMode ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>{isSelectionMode ? <X size={14}/> : <CheckSquare size={14}/>} {isSelectionMode ? 'Cancelar Selección' : 'Seleccionar Varios'}</button>)}
            <button onClick={onOpenExpense} className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors flex items-center gap-2"><DollarSign size={14}/> GASTO</button>
         </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
         {activeTab === 'orders' && (
            <div className="absolute inset-0 overflow-y-auto p-4 bg-gray-50/50 pb-24">
                {orders.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-gray-300"><Clock size={64} className="mb-4 opacity-20"/><p className="font-bold text-lg">Sin comandas pendientes</p></div>) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {orders.map((order) => {
                            const isSelected = selectedOrders.includes(order.id);
                            return (
                                <div key={order.id} onClick={() => isSelectionMode && toggleOrderSelection(order.id)} className={`rounded-xl border flex flex-col shadow-sm transition-all ${isSelectionMode ? (isSelected ? 'ring-4 ring-green-500 border-green-500 bg-green-50 cursor-pointer transform scale-[1.02]' : 'cursor-pointer hover:border-gray-400 opacity-60 hover:opacity-100') : 'hover:shadow-md'} ${order.status === 'pending' ? 'bg-white' : 'bg-gray-50 opacity-75'}`}>
                                    <div className="p-3 flex justify-between items-start border-b border-gray-100">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                {isSelectionMode && (<div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 bg-white'}`}>{isSelected && <CheckSquare size={14}/>}</div>)}
                                                <span className="font-black text-gray-800 text-base">#{order.orderId || '---'}</span>
                                                <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-500">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><CheckCircle size={10} className="text-green-500"/> {order.staffName}</p>
                                        </div>
                                        <div className="text-right"><p className="font-black text-lg text-gray-800">Bs. {order.total?.toFixed(2)}</p></div>
                                    </div>
                                    <div className="p-3 flex-1 overflow-y-auto max-h-32 space-y-1">{order.items?.map((item, idx) => (<div key={idx} className="flex justify-between text-xs items-center border-b border-gray-50 pb-1 last:border-0"><div className="flex gap-2 items-center"><span className="font-bold text-gray-800 w-5 text-center bg-gray-100 rounded text-[10px]">{item.qty}</span><span className="text-gray-600 truncate max-w-[120px]">{item.name}</span></div><span className="font-mono text-gray-400">{(item.price * item.qty).toFixed(2)}</span></div>))}</div>
                                    {!isSelectionMode && (<div className="p-2 bg-gray-50 border-t border-gray-100 grid grid-cols-3 gap-2"><button onClick={(e) => {e.stopPropagation(); onReprintOrder(order)}} className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg flex items-center justify-center border border-transparent hover:border-gray-200"><Printer size={16}/></button><button onClick={(e) => {e.stopPropagation(); if(window.confirm('¿Anular?')) onVoidOrder(order)}} className="p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-lg flex items-center justify-center border border-transparent hover:border-gray-200"><XCircle size={16}/></button><button onClick={(e) => {e.stopPropagation(); onProcessPayment(order)}} className="bg-green-600 text-white rounded-lg font-bold text-xs hover:bg-green-700 shadow-md flex items-center justify-center">COBRAR</button></div>)}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
         )}

         {isSelectionMode && selectedOrders.length > 0 && (
             <div className="absolute bottom-4 left-2 right-2 bg-gray-900 text-white p-3 rounded-2xl shadow-2xl flex flex-col sm:flex-row justify-between items-center animate-in slide-in-from-bottom duration-300 z-50 gap-3">
                 <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4"><span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{selectedOrders.length} SELECCIONADOS</span><p className="text-xl font-black text-white">Total: Bs. {totalSelected.toFixed(2)}</p></div>
                 <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 justify-center">
                     <button onClick={() => requestBulkPay('Efectivo')} disabled={isPaying} className="flex-1 sm:flex-none bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap"><DollarSign size={16}/> EFECTIVO</button>
                     <button onClick={() => requestBulkPay('QR')} disabled={isPaying} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap"><Grid size={16}/> QR</button>
                     <button onClick={() => requestBulkPay('Tarjeta')} disabled={isPaying} className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap"><CreditCard size={16}/> TARJETA</button>
                 </div>
             </div>
         )}

         {activeTab === 'quick' && (
             <div className="absolute inset-0 flex">
                 <div className="flex-1 bg-gray-50 flex flex-col border-r border-gray-200 min-w-0">
                     <div className="p-3 bg-white border-b border-gray-200 space-y-3 z-10 shadow-sm">
                         <div className="relative"><Search className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="text" placeholder="Buscar producto..." className="w-full pl-9 p-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                         <div className="relative">
                            <div className={`flex flex-wrap gap-2 overflow-y-auto pr-1 transition-all ${expandCategories ? 'max-h-60' : 'max-h-24'} scrollbar-thin`}><button onClick={() => setCatFilter('Todos')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${catFilter === 'Todos' ? 'bg-black text-white border-black ring-2 ring-gray-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>Todos</button>{categories?.map(cat => (<button key={cat} onClick={() => setCatFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${catFilter === cat ? 'bg-black text-white border-black ring-2 ring-gray-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>{cat}</button>))}</div>
                            <button onClick={() => setExpandCategories(!expandCategories)} className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-white via-white to-transparent pl-4 flex items-start pt-1 md:hidden">{expandCategories ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}</button>
                         </div>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4"><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-20">{filteredItems.map(item => (<CashierProductCard key={item.id} item={item} onClick={() => handleItemClick(item)} />))}{filteredItems.length === 0 && <div className="col-span-full text-center py-10 text-gray-400"><p>No se encontraron items.</p></div>}</div></div>
                 </div>
                 <div className="w-80 bg-white flex flex-col shadow-2xl z-20 border-l border-gray-200">
                     <div className="p-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center"><h3 className="font-black text-blue-900 flex items-center gap-2 text-sm"><ShoppingCart size={16}/> Venta Directa</h3>{cart.length > 0 && <button onClick={() => setCart([])} className="text-[10px] text-red-500 font-bold hover:underline bg-white px-2 py-1 rounded border border-red-100">LIMPIAR</button>}</div>
                     <div className="flex-1 overflow-y-auto p-3 space-y-2">{cart.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2 select-none"><ShoppingCart size={40} className="opacity-20"/><p className="text-xs font-medium">Escanea o selecciona</p></div>) : (cart.map(item => (<div key={item.id} className="flex justify-between items-center bg-white border border-gray-100 p-2 rounded-lg shadow-sm animate-in slide-in-from-right duration-200"><div className="flex-1 min-w-0 mr-2"><div className="text-xs font-bold text-gray-800 truncate">{item.name}</div><div className="text-[10px] text-gray-500">{item.isServiceItem ? 'Servicio calculado' : `unitario: Bs. ${item.price}`}</div></div>{item.isServiceItem ? (<div className="font-bold text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">Bs. {item.price.toFixed(2)}</div>) : (<div className="flex items-center gap-2 bg-gray-50 rounded px-1"><button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-200 rounded transition-colors"><Minus size={12}/></button><span className="text-xs font-bold w-4 text-center">{item.qty}</span><button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"><Plus size={12}/></button></div>)}<button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-400 hover:text-red-600"><Trash2 size={14}/></button></div>)))}</div>
                     <div className="p-4 bg-gray-50 border-t border-gray-200">
                         <div className="mb-3 relative"><MapPin size={16} className="absolute left-3 top-3 text-gray-400"/><select className="w-full pl-9 p-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white appearance-none uppercase" value={quickTable} onChange={e => setQuickTable(e.target.value)}>{tables && tables.map(loc => (<option key={loc} value={loc}>{loc}</option>))}</select><ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none"/></div>
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