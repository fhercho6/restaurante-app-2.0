// src/components/CashierView.jsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, isPersonalProject, ROOT_COLLECTION } from '../config/firebase';
import { Clock, ChefHat, DollarSign, Trash2, User } from 'lucide-react';

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

  // Función para ANULAR (Borrar pedido)
  const handleVoidOrder = async (order) => {
    const reason = window.prompt("¿Por qué anulas esta comanda? (Escribe el motivo)");
    if (reason) {
        const ordersCol = isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`;
        await deleteDoc(doc(db, ordersCol, order.id));
        // Aquí podrías guardar un log de "Anulaciones" si quisieras auditoría
        alert("Comanda anulada correctamente.");
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Cargando comandas...</div>;

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Caja Principal</h2>
            <p className="text-gray-500 text-sm">Gestiona las comandas impresas por los meseros</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold text-sm">
            {orders.length} {orders.length === 1 ? 'Mesa Abierta' : 'Mesas Abiertas'}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <ChefHat size={48} className="mx-auto text-gray-300 mb-4"/>
            <h3 className="text-xl text-gray-400 font-medium">Sin comandas pendientes</h3>
            <p className="text-gray-400 text-sm">Cuando un mesero imprima una comanda, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map(order => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden flex flex-col relative">
                    
                    {/* Header: Mesa y Hora */}
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

                    {/* Info Mesero */}
                    <div className="bg-gray-100 px-4 py-2 text-xs text-gray-600 flex items-center gap-2 border-b">
                        <User size={12} /> Mesero: <strong>{order.staffName}</strong>
                    </div>

                    {/* Lista Items */}
                    <div className="p-4 flex-1 overflow-y-auto max-h-48 bg-white">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm mb-2 border-b border-dotted border-gray-100 pb-1 last:border-0">
                                <span><span className="font-bold text-gray-800">{item.qty}</span> x {item.name}</span>
                                <span className="text-gray-500 font-mono">{(item.price * item.qty).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Botones de Acción (Footer) */}
                    <div className="p-3 bg-gray-50 border-t grid grid-cols-4 gap-2">
                        {/* Botón ANULAR (Rojo, pequeño) */}
                        <button 
                            onClick={() => handleVoidOrder(order)}
                            className="col-span-1 bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded-lg flex flex-col items-center justify-center py-2 transition-colors"
                            title="Anular / Cancelar"
                        >
                            <Trash2 size={18}/>
                            <span className="text-[10px] font-bold">ANULAR</span>
                        </button>

                        {/* Botón COBRAR (Verde, grande) */}
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