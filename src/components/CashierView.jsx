```javascript
// src/components/CashierView.jsx - CORREGIDO (IMPORTACIÓN DE USER AGREGADA)
import React, { useState, useEffect } from 'react';
// CORRECCIÓN AQUÍ: Se agregó 'User' a la lista de iconos importados
import { Search, ShoppingCart, Clock, Filter, Trash2, Printer, CheckSquare, Square, DollarSign, X, User, Users, Percent } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import CommissionPaymentModal from './CommissionPaymentModal';

export default function CashierView({ items, categories, tables, onProcessPayment, onVoidOrder, onReprintOrder, onStopService, onOpenExpense, onPrintReceipt }) {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [activeServices, setActiveServices] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]); // IDs de órdenes seleccionadas
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'orders', 'services'

    // CONTROL DE ASISTENCIA
    const [showAttendanceList, setShowAttendanceList] = useState(false);
    const [attendanceList, setAttendanceList] = useState([]);
    const [showCommissionModal, setShowCommissionModal] = useState(false);

    // CARGAR PEDIDOS PENDIENTES, SERVICIOS Y ASISTENCIA
    useEffect(() => {
        const ordersCol = isPersonalProject ? 'pending_orders' : `${ ROOT_COLLECTION } pending_orders`;
        const servicesCol = isPersonalProject ? 'active_services' : `${ ROOT_COLLECTION } active_services`;
        const attCol = isPersonalProject ? 'attendance' : `${ ROOT_COLLECTION } attendance`; // [NEW]

        const qOrders = query(collection(db, ordersCol), orderBy('date', 'desc'));
        const qServices = query(collection(db, servicesCol), orderBy('startTime', 'desc'));
        // Asistencia: Solo del turno actual (si tuviéramos registerID global aquí, sería mejor, pero por ahora mostramos últimos 20)
        // Lo ideal es filtrar por registerId, pero CashierView no lo recibe como prop directo siempre.
        // Asumimos mostrar las ultimas de hoy.
        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
        const qAttendance = query(collection(db, attCol), orderBy('timestamp', 'desc'), where('timestamp', '>=', startOfDay.toISOString()));

        const unsubOrders = onSnapshot(qOrders, (snap) => {
            setPendingOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubServices = onSnapshot(qServices, (snap) => {
            setActiveServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubAttendance = onSnapshot(qAttendance, (snap) => {
            setAttendanceList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => { unsubOrders(); unsubServices(); unsubAttendance(); };
    }, []);

    // --- LÓGICA DE SELECCIÓN MÚLTIPLE ---
    const toggleSelectOrder = (orderId) => {
        setSelectedOrders(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const handleSelectAll = () => {
        if (selectedOrders.length === pendingOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(pendingOrders.map(o => o.id));
        }
    };

    // --- COBRAR (INDIVIDUAL O MÚLTIPLE) ---
    const handleProcessSelection = () => {
        if (selectedOrders.length === 0) return;

        // Filtrar las órdenes completas seleccionadas
        const ordersToPay = pendingOrders.filter(o => selectedOrders.includes(o.id));

        if (ordersToPay.length === 1) {
            // COBRO INDIVIDUAL (Normal)
            onProcessPayment(ordersToPay[0], () => setSelectedOrders([]));
        } else {
            // COBRO MASIVO (Fusión)

            // 1. Fusionar Items
            const mergedItems = [];
            ordersToPay.forEach(order => {
                if (order.items) {
                    order.items.forEach(item => {
                        const existing = mergedItems.find(i => i.name === item.name);
                        if (existing) {
                            existing.qty += item.qty;
                        } else {
                            // Clonar para no mutar
                            mergedItems.push({ ...item });
                        }
                    });
                }
            });

            // 2. Sumar Totales
            const totalAmount = ordersToPay.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

            // 3. RECOLECTAR CÓDIGOS
            const allOrderIds = ordersToPay.map(o => o.orderId || '???');

            // 4. Crear "Super Orden"
            const superOrder = {
                id: 'BULK_PAYMENT', // ID temporal para UI
                ids: selectedOrders, // Lista de IDs de firestore para borrar luego en App.jsx
                orderIds: allOrderIds, // Lista de códigos visuales (ej: ORD-1, ORD-2)
                type: 'bulk_sale',
                items: mergedItems,
                total: totalAmount,
                staffName: 'Varios',
                staffId: 'anon'
            };

            onProcessPayment(superOrder, () => setSelectedOrders([]));
        }
    };

    // FILTRADO VISUAL
    const filteredOrders = pendingOrders.filter(order => {
        if (filterType === 'services') return false;
        const searchMatch = order.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.items && order.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())));
        return searchMatch;
    });

    const filteredServices = activeServices.filter(service => {
        if (filterType === 'orders') return false;
        return service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.note?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="flex flex-col h-full animate-in fade-in">

            {/* BARRA SUPERIOR */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">

                {/* BUSCADOR */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por mozo, producto o código..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* ACCIONES GLOBALES */}
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setShowAttendanceList(!showAttendanceList)}
                        className={`flex - 1 md: flex - none px - 4 py - 2.5 font - bold rounded - lg border transition - colors flex items - center justify - center gap - 2 ${ showAttendanceList ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50' } `}
                    >
                        <Users size={18} /> Asistencia
                    </button>
                    <button
                        onClick={() => setShowCommissionModal(true)}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-purple-50 text-purple-600 font-bold rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <Percent size={18} /> Comisiones
                    </button>
                    <button
                        onClick={onOpenExpense}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-red-50 text-red-600 font-bold rounded-lg border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <DollarSign size={18} /> Gastos/Retiros
                    </button>
                    <button
                        onClick={() => onPrintReceipt({ type: 'z-report-preview' })}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <Printer size={18} /> Ver Reporte X
                    </button>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6">

                {/* MODULO DE ASISTENCIA (EXPANDIBLE) */}
                {showAttendanceList && (
                    <div className="w-full md:w-1/4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="p-3 border-b border-gray-100 bg-orange-50 flex justify-between items-center">
                            <h3 className="font-bold text-orange-800 flex items-center gap-2"><Users size={16} /> Asistencia Turno</h3>
                            <button onClick={() => setShowAttendanceList(false)} className="text-orange-600 hover:bg-orange-100 rounded p-1"><X size={16} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {attendanceList.length === 0 ? (
                                <p className="text-center text-xs text-gray-400 py-4">Sin registros hoy</p>
                            ) : (
                                attendanceList.map(rec => (
                                    <div key={rec.id} className="p-2 border border-gray-100 rounded-lg bg-gray-50 flex justify-between items-center group hover:border-orange-200 hover:bg-white transition-colors">
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{rec.staffName}</p>
                                            <p className="text-[10px] text-gray-500">{new Date(rec.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                        <button
                                            onClick={() => onPrintReceipt({ ...rec, type: 'attendance-reprint', returnTo: 'cashier' })} // Usamos el prop existente para pasar la data
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Reimprimir Ticket"
                                        >
                                            <Printer size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL DE COMISIONES */}
                {showCommissionModal && (
                    <CommissionPaymentModal
                        onClose={() => setShowCommissionModal(false)}
                        onPrintReceipt={onPrintReceipt}
                    />
                )}

                {/* COLUMNA IZQUIERDA: SERVICIOS ACTIVOS */}
                {activeServices.length > 0 && (
                    <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto pb-20">
                        <h3 className="font-bold text-gray-500 uppercase text-xs flex items-center gap-2 px-1"><Clock size={14} /> Servicios en Curso ({activeServices.length})</h3>
                        {filteredServices.map(srv => {
                            const start = new Date(srv.startTime);
                            const now = new Date();
                            const diffMs = now - start;
                            const diffMins = Math.floor(diffMs / 60000);
                            const cost = (diffMins / 60) * srv.pricePerHour;

                            return (
                                <div key={srv.id} className="bg-white p-4 rounded-xl border-l-4 border-purple-500 shadow-sm relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-gray-800">{srv.serviceName}</h4>
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">{srv.note}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-gray-900">Bs. {cost.toFixed(2)}</div>
                                            <div className="text-xs text-gray-400">{diffMins} min</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onStopService(srv, cost, `${ diffMins } min`)}
                                        className="w-full py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                                    >
                                        DETENER Y COBRAR
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* COLUMNA DERECHA: PEDIDOS PENDIENTES */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200">

                    {/* HEADER TABLA */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <button onClick={handleSelectAll} className="text-gray-500 hover:text-orange-600">
                                {selectedOrders.length > 0 && selectedOrders.length === pendingOrders.length ? <CheckSquare size={20} /> : <Square size={20} />}
                            </button>
                            <h3 className="font-bold text-gray-700">Comandas Pendientes ({filteredOrders.length})</h3>
                        </div>

                        {selectedOrders.length > 0 && (
                            <div className="flex items-center gap-2 animate-in slide-in-from-right fade-in">
                                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">{selectedOrders.length} Seleccionados</span>
                                <button
                                    onClick={handleProcessSelection}
                                    className="px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg shadow hover:bg-green-700 flex items-center gap-1"
                                >
                                    <DollarSign size={14} /> COBRAR TODO
                                </button>
                            </div>
                        )}
                    </div>

                    {/* LISTA DE PEDIDOS */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {filteredOrders.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <ShoppingCart size={48} className="mb-2 opacity-20" />
                                <p>No hay comandas pendientes.</p>
                            </div>
                        ) : (
                            filteredOrders.map(order => (
                                <div
                                    key={order.id}
                                    className={`p - 3 rounded - xl border transition - all hover: shadow - md cursor - pointer flex flex - col sm: flex - row gap - 4 items - center ${ selectedOrders.includes(order.id) ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200' : 'bg-white border-gray-100' } `}
                                    onClick={() => toggleSelectOrder(order.id)}
                                >
                                    {/* CHECKBOX */}
                                    <div className="shrink-0 text-orange-500">
                                        {selectedOrders.includes(order.id) ? <CheckSquare size={24} /> : <Square size={24} className="text-gray-300" />}
                                    </div>

                                    {/* INFO PRINCIPAL */}
                                    <div className="flex-1 w-full">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-black text-gray-800 text-lg">#{order.orderId ? order.orderId.replace(/[^0-9]/g, '').slice(-4) : '----'}</span>
                                            <span className="text-xs font-bold text-gray-400 uppercase">{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                            <User size={12} /> {order.staffName}
                                        </div>

                                        {/* RESUMEN ITEMS */}
                                        <div className="text-xs text-gray-600 line-clamp-1">
                                            {order.items?.map(i => `${ i.qty } ${ i.name } `).join(', ')}
                                        </div>
                                    </div>

                                    {/* TOTAL Y BOTONES */}
                                    <div className="flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 pt-2 sm:pt-0 sm:pl-4 mt-2 sm:mt-0">
                                        <div className="text-right">
                                            <div className="text-xl font-black text-gray-900">Bs. {parseFloat(order.total).toFixed(2)}</div>
                                        </div>

                                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => onProcessPayment(order)}
                                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                                title="Cobrar este pedido"
                                            >
                                                <DollarSign size={16} />
                                            </button>
                                            <button
                                                onClick={() => onReprintOrder(order)}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                                title="Reimprimir comanda"
                                            >
                                                <Printer size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`¿Anular pedido #${ order.orderId }?`)) onVoidOrder(order);
                                                }}
                                                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                                                title="Anular pedido"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}