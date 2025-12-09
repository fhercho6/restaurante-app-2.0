// src/components/CashierView.jsx - CORREGIDO PARA IMPRIMIR ANULACIÓN
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, isPersonalProject, ROOT_COLLECTION } from '../config/firebase';
import { Clock, ChefHat, DollarSign, Trash2, User, TrendingUp, AlertTriangle, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

const CashierView = ({ onProcessPayment, onVoidOrder, onReprintOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersCol = isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`;
    const q = query(collection(db, ordersCol), orderBy('date', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pendingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(pendingData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- BOTÓN DE ANULAR CON CONFIRMACIÓN ---
  const handleVoidClick = (order) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-bold text-gray-800 text-sm">¿Anular e Imprimir?</span>
        <p className="text-xs text-gray-500">Mesa de: {order.staffName}</p>
        <div className="flex gap-2 mt-1">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              onVoidOrder(order); // <--- ESTA ES LA CLAVE: Llama a App.jsx para borrar e imprimir
            }}
            className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm flex-1"
          >
            SÍ, ANULAR
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-xs font-bold flex-1">
            CANCELAR
          </button>
        </div>
      </div>
    ), { duration: 5000, icon: <AlertTriangle className="text-red-500"/> });
  };

  // Estadísticas
  const getWaiterStats = () => {
    const stats = {};
    orders.forEach(order => {
        const name = order.staffName || 'Sin Asignar';
        if (!stats[name]) { stats[name] = { count: 0, total: 0 }; }
        stats[name].count += 1;
        stats[name].total += parseFloat(order.total);
    });
    return Object.entries(stats);
  };
  const waiterStats = getWaiterStats();

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-400">Cargando caja...</div>;

  return (
    <div className="animate-in fade-in pb-20">
      
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Caja Principal</h2>
            <p className="text-gray-500 text-sm">Control de mesas activas</p>
        </div>
        {orders.length > 0 && <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">{orders.length} pendientes</span>}
      </div>

      {waiterStats.length > 0 && (
        <div className="mb-6 overflow-x-auto pb-2 hide-scrollbar">
            <div className="flex gap-3 min-w-max">
                <div className="bg-gray-800 text-white p-3 rounded-xl shadow-md min-w-[140px]">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase mb-1"><TrendingUp size={12}/> Por Cobrar</div>
                    <div className="text-xl font-black text-green-400">Bs. {orders.reduce((acc, o) => acc + Number(o.total), 0).toFixed(2)}</div>
                </div>
                {waiterStats.map(([name, stat]) => (
                    <div key={name} className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm min-w-[140px] flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-1"><div className="bg-orange-100 p-1 rounded-full text-orange-600"><User size={12} /></div><span className="font-bold text-gray-700 text-xs truncate">{name}</span></div>
                        <div className="flex justify-between items-end border-t border-gray-100 pt-1"><span className="text-[10px] text-gray-500">{stat.count} mesas</span><span className="font-bold text-gray-900 text-sm">Bs. {stat.total.toFixed(2)}</span></div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <ChefHat size={48} className="mx-auto text-gray-300 mb-4 opacity-50"/>
            <h3 className="text-lg text-gray-400 font-medium">Todo limpio</h3>
            <p className="text-gray-300 text-xs">No hay comandas pendientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {orders.map(order => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                    <div className="bg-white p-3 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className="font-bold text-gray-800">#{order.orderId ? order.orderId.slice(-4) : '...'}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1"><User size={10}/> {order.staffName}</span>
                    </div>

                    <div className="p-3 flex-1 overflow-y-auto max-h-32 bg-gray-50/50">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs mb-1 last:mb-0">
                                <span className="text-gray-700"><strong className="text-black">{item.qty}</strong> {item.name}</span>
                                <span className="text-gray-400 tabular-nums">{(item.price * item.qty).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 border-t bg-white grid grid-cols-5 gap-2">
                        <div className="col-span-2 flex items-center"><span className="text-lg font-black text-gray-900">Bs. {Number(order.total).toFixed(2)}</span></div>
                        
                        {/* Botón ANULAR */}
                        <button onClick={() => handleVoidClick(order)} className="col-span-1 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors border border-red-200" title="Anular">
                            <Trash2 size={18}/>
                        </button>

                        {/* Botón REIMPRIMIR */}
                        <button onClick={() => onReprintOrder && onReprintOrder(order)} className="col-span-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg flex items-center justify-center transition-colors border border-yellow-200" title="Reimprimir Comanda">
                            <Printer size={18}/>
                        </button>

                        {/* Botón COBRAR */}
                        <button onClick={() => onProcessPayment(order)} className="col-span-1 bg-green-600 text-white hover:bg-green-700 rounded-lg flex items-center justify-center shadow-sm transition-transform active:scale-95" title="Cobrar">
                            <DollarSign size={20}/>
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default CashierView;