// src/components/CashierView.jsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, isPersonalProject, ROOT_COLLECTION } from '../config/firebase';
import { Clock, ChefHat, DollarSign, Trash2, User, Users, TrendingUp } from 'lucide-react';

const CashierView = ({ onProcessPayment }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Escuchar pedidos pendientes en tiempo real
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

  const handleVoidOrder = async (order) => {
    const reason = window.prompt("¿Por qué anulas esta comanda? (Escribe el motivo)");
    if (reason) {
        const ordersCol = isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`;
        await deleteDoc(doc(db, ordersCol, order.id));
        alert("Comanda anulada correctamente.");
    }
  };

  // --- LÓGICA NUEVA: AGRUPAR POR GARZÓN ---
  const getWaiterStats = () => {
    const stats = {};
    
    orders.forEach(order => {
        const name = order.staffName || 'Sin Asignar';
        if (!stats[name]) {
            stats[name] = { count: 0, total: 0 };
        }
        stats[name].count += 1;
        stats[name].total += parseFloat(order.total);
    });

    // Convertimos el objeto en un array para poder dibujarlo
    return Object.entries(stats);
  };

  const waiterStats = getWaiterStats();
  // -----------------------------------------

  if (loading) return <div className="p-10 text-center animate-pulse">Cargando caja...</div>;

  return (
    <div className="animate-in fade-in">
      
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Caja Principal</h2>
            <p className="text-gray-500 text-sm">Control de mesas y cobros</p>
        </div>
      </div>

      {/* --- SECCIÓN NUEVA: RESUMEN POR GARZÓN --- */}
      {waiterStats.length > 0 && (
        <div className="mb-8 overflow-x-auto pb-2">
            <div className="flex gap-4 min-w-max">
                {/* Tarjeta de Total General */}
                <div className="bg-gray-900 text-white p-4 rounded-xl shadow-lg min-w-[160px]">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase mb-1">
                        <TrendingUp size={14}/> Total Pendiente
                    </div>
                    <div className="text-2xl font-black text-green-400">
                        Bs. {orders.reduce((acc, o) => acc + Number(o.total), 0).toFixed(2)}
                    </div>
                    <div className="text-xs mt-1">{orders.length} mesas activas</div>
                </div>

                {/* Tarjetas por Garzón */}
                {waiterStats.map(([name, stat]) => (
                    <div key={name} className="bg-white border border-blue-100 p-4 rounded-xl shadow-sm min-w-[180px] flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-100 p-1.5 rounded-full text-blue-600">
                                <User size={16} />
                            </div>
                            <span className="font-bold text-gray-700 truncate">{name}</span>
                        </div>
                        <div className="flex justify-between items-end border-t border-gray-100 pt-2">
                            <div className="text-xs text-gray-500">
                                <strong className="text-gray-800 text-lg">{stat.count}</strong> ped.
                            </div>
                            <div className="font-black text-gray-900 text-lg">
                                Bs. {stat.total.toFixed(2)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
      {/* ------------------------------------------ */}

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <ChefHat size={48} className="mx-auto text-gray-300 mb-4"/>
            <h3 className="text-xl text-gray-400 font-medium">Sin comandas pendientes</h3>
            <p className="text-gray-400 text-sm">La caja está limpia. Esperando pedidos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map(order => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden flex flex-col relative">
                    
                    <div className="bg-gray-800 text-white p-4 flex justify-between items-start">
                        <div>
                            <span className="font-bold text-lg">#{order.orderId || 'MESA'}</span>
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                <Clock size={12}/> {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-bold text-green-400">Bs. {Number(order.total).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="bg-gray-100 px-4 py-2 text-xs text-gray-600 flex items-center gap-2 border-b">
                        <User size={12} /> Mesero: <strong>{order.staffName}</strong>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto max-h-48 bg-white">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm mb-2 border-b border-dotted border-gray-100 pb-1 last:border-0">
                                <span><span className="font-bold text-gray-800">{item.qty}</span> x {item.name}</span>
                                <span className="text-gray-500 font-mono">{(item.price * item.qty).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 bg-gray-50 border-t grid grid-cols-4 gap-2">
                        <button 
                            onClick={() => handleVoidOrder(order)}
                            className="col-span-1 bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded-lg flex flex-col items-center justify-center py-2 transition-colors"
                            title="Anular / Cancelar"
                        >
                            <Trash2 size={18}/>
                            <span className="text-[10px] font-bold">ANULAR</span>
                        </button>

                        <button 
                            onClick={() => onProcessPayment(order)}
                            className="col-span-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
                        >
                            <DollarSign size={20}/> COBRAR MESA
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