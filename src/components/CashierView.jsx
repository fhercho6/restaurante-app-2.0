// src/components/CashierView.jsx - VERSIÓN FINAL LIMPIA
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db, isPersonalProject, ROOT_COLLECTION } from '../config/firebase';
import { ChefHat, DollarSign, Trash2, User, AlertTriangle, Printer, Clock, StopCircle, UserX, Info, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const CashierView = ({ onProcessPayment, onVoidOrder, onReprintOrder, onStopService }) => {
  const [orders, setOrders] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [activeServices, setActiveServices] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const ordersCol = isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`;
    const qOrders = query(collection(db, ordersCol), orderBy('date', 'asc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const staffCol = isPersonalProject ? 'staffMembers' : `${ROOT_COLLECTION}staffMembers`;
    const unsubStaff = onSnapshot(collection(db, staffCol), (s) => setStaffList(s.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.role === 'Garzón' || m.role === 'Cajero')));

    const servicesCol = isPersonalProject ? 'active_services' : `${ROOT_COLLECTION}active_services`;
    const unsubServices = onSnapshot(collection(db, servicesCol), (s) => {
        setActiveServices(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);

    return () => { unsubOrders(); unsubStaff(); unsubServices(); clearInterval(timer); };
  }, []);

  const handleKickStaff = async (member) => {
      if (!member.activeSessionId) return;
      if (!window.confirm(`¿Desconectar a ${member.name}?`)) return;
      try {
          const staffColName = isPersonalProject ? 'staffMembers' : `${ROOT_COLLECTION}staffMembers`;
          await updateDoc(doc(db, staffColName, member.id), { activeSessionId: null });
          toast.success(`${member.name} desconectado.`);
      } catch (error) { toast.error("Error al desconectar."); }
  };

  const calculateServiceCost = (service) => {
    const start = new Date(service.startTime).getTime();
    const now = currentTime;
    const diffMs = now - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    const pricePerHour = parseFloat(service.pricePerHour);
    const cost = diffHours * pricePerHour;
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const minsLeft = minutes % 60;
    const startTimeFormatted = new Date(service.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const halfHourPrice = pricePerHour / 2;
    return { cost, label: `${hours}h ${minsLeft}m`, startTimeFormatted, pricePerHour, halfHourPrice };
  };

  const handleVoidClick = (order) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-bold text-gray-800 text-sm">¿Anular Pedido?</span>
        <div className="flex gap-2 mt-1">
          <button onClick={() => { toast.dismiss(t.id); onVoidOrder(order); }} className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex-1">SÍ, BORRAR</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-xs font-bold flex-1">CANCELAR</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-400">Cargando caja...</div>;

  return (
    <div className="animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div><h2 className="text-2xl font-bold text-gray-800">Caja Principal</h2><p className="text-gray-500 text-sm">Control de mesas y servicios</p></div>
        <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 hide-scrollbar">
            {staffList.map(member => {
                const isOnline = member.activeSessionId && member.activeSessionId.length > 5;
                return (
                    <button key={member.id} onClick={() => handleKickStaff(member)} disabled={!isOnline} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all group relative ${isOnline ? 'bg-white border-green-200 shadow-sm hover:border-red-300 hover:bg-red-50 cursor-pointer' : 'bg-gray-50 border-transparent opacity-60 grayscale cursor-default'}`} title={isOnline ? "Clic para desconectar" : "Desconectado"}>
                        <div className="relative">{isOnline ? (<><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse group-hover:hidden"></div><UserX size={12} className="text-red-500 hidden group-hover:block" /></>) : (<div className="w-2 h-2 rounded-full bg-gray-300"></div>)}</div>
                        <span className={`text-xs font-bold ${isOnline ? 'text-gray-800 group-hover:text-red-600' : 'text-gray-400'}`}>{member.name.split(' ')[0]}</span>
                    </button>
                );
            })}
        </div>
      </div>

      {activeServices.length > 0 && (
          <div className="mb-8">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Clock className="text-purple-600"/> Servicios en Curso</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeServices.map(srv => {
                      const { cost, label, startTimeFormatted, pricePerHour, halfHourPrice } = calculateServiceCost(srv);
                      const isHighRate = pricePerHour >= 90; 
                      return (
                          <div key={srv.id} className={`bg-white border-l-4 p-4 rounded-r-xl shadow-sm flex justify-between items-center relative overflow-hidden ${isHighRate ? 'border-red-500' : 'border-purple-500'}`}>
                              <div className={`absolute top-0 right-0 p-1 rounded-bl-lg text-[9px] font-bold uppercase tracking-wider ${isHighRate ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>{isHighRate ? 'TARIFA ALTA' : 'ESTÁNDAR'}</div>
                              <div>
                                  <div className="font-black text-xl text-gray-800 leading-none mb-1">{srv.note}</div>
                                  <div className="text-xs text-gray-500 font-medium flex items-center gap-1 mb-2"><Clock size={12} className="text-gray-400"/> Inicio: {startTimeFormatted}</div>
                                  <div className="text-[10px] text-gray-500 bg-gray-50 p-1 rounded mb-2 border border-gray-100"><div className="flex items-center gap-1 font-bold"><Info size={10}/> Tarifa: Bs. {pricePerHour}/h</div><div className="pl-4 text-gray-400">(30 min = Bs. {halfHourPrice})</div></div>
                                  <div className="flex items-center gap-2"><div className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded"><User size={10}/> {srv.staffName}</div><div className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${isHighRate ? 'text-red-600 bg-red-50' : 'text-purple-600 bg-purple-50'}`}>{label}</div></div>
                              </div>
                              <div className="text-right">
                                  <div className="text-xl font-black text-gray-900 mb-2">Bs. {cost.toFixed(2)}</div>
                                  <button onClick={() => onStopService(srv, cost, label)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow hover:bg-red-700 flex items-center gap-1"><StopCircle size={14}/> COBRAR</button>
                              </div>
                          </div>
                      )
                  })}
              </div>
          </div>
      )}

      {orders.length > 0 && (<div className="mb-4 flex items-center gap-2"><span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1"><AlertTriangle size={12}/> {orders.length} pendientes</span><span className="text-xs text-gray-400">Total: <strong>Bs. {orders.reduce((acc, o) => acc + Number(o.total), 0).toFixed(2)}</strong></span></div>)}

      {orders.length === 0 && activeServices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200"><ChefHat size={48} className="mx-auto text-gray-300 mb-4 opacity-50"/><h3 className="text-lg text-gray-400 font-medium">Todo limpio</h3></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {orders.map(order => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative">
                    <div className="p-3 border-b flex justify-between items-center bg-white/50">
                        <div className="flex items-center gap-2"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span><span className="font-bold text-gray-800">#{order.orderId ? order.orderId.slice(-4) : '...'}</span></div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1"><User size={10}/> {order.staffName}</span>
                    </div>
                    <div className="p-3 flex-1 overflow-y-auto max-h-32 bg-gray-50/50">{order.items.map((item, idx) => (<div key={idx} className="flex justify-between text-xs mb-1 last:mb-0"><span className="text-gray-700 font-medium">{item.qty} x {item.name}</span><span className="text-gray-400 tabular-nums">{(item.price * item.qty).toFixed(2)}</span></div>))}</div>
                    <div className="p-3 border-t bg-white grid grid-cols-5 gap-2">
                        <div className="col-span-2 flex items-center"><span className="text-lg font-black text-gray-900">Bs. {Number(order.total).toFixed(2)}</span></div>
                        <button onClick={() => handleVoidClick(order)} className="col-span-1 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg flex items-center justify-center border border-red-200"><Trash2 size={18}/></button>
                        <button onClick={() => onReprintOrder && onReprintOrder(order)} className="col-span-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg flex items-center justify-center border border-yellow-200"><Printer size={18}/></button>
                        <button onClick={() => onProcessPayment(order)} className="col-span-1 bg-green-600 text-white hover:bg-green-700 rounded-lg flex items-center justify-center shadow-sm"><DollarSign size={20}/></button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};
export default CashierView;