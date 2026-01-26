// src/components/PaymentModal.jsx - SOPORTE MULTI-PAGO Y CORTESÍA CORRECTA
import React, { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Grid, Gift, Check, Trash2, Calendar, User, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentModal({ isOpen, onClose, total, onConfirm, staff = [], initialWaiter = null }) {
    const [currentAmount, setCurrentAmount] = useState(''); // Lo que se escribe en el input
    const [payments, setPayments] = useState([]); // Lista de pagos acumulados
    const [selectedWaiterId, setSelectedWaiterId] = useState(''); // [NEW] Selected Waiter

    // Reiniciar al abrir
    useEffect(() => {
        if (isOpen) {
            setCurrentAmount(total.toFixed(2));
            setPayments([]);
            // Default waiter logic: Use initialWaiter (the one who created the order)
            // If strictly 'Cajero' created it (or null), we might want to leave it empty or default to 'Barra' check? 
            // Better: default to initialWaiter (e.g. 'Yoly') if present.
            if (initialWaiter && initialWaiter.id) {
                setSelectedWaiterId(initialWaiter.id);
            } else {
                // If checking out as generic or quick sale, maybe default to "Barra" or empty?
                // Let's default to empty to force selection? No, that slows down "Quick Sale".
                // Default to empty string -> "Sin Asignar" (Barra/Caja will take it implicitly)
                setSelectedWaiterId('');
            }
        }
    }, [isOpen, total, initialWaiter]);

    // Cálculos dinámicos
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const remaining = Math.max(0, total - totalPaid);
    const change = Math.max(0, totalPaid - total);

    // Detectar si hay cortesía en la lista
    const hasCourtesy = payments.some(p => p.method === 'Cortesía');

    // Función para agregar un pago a la lista
    const handleAddPayment = (method) => {
        const amountToAdd = parseFloat(currentAmount);

        if (!amountToAdd || amountToAdd <= 0) {
            toast.error('Ingresa un monto válido');
            return;
        }

        // Validación especial para Cortesía
        if (method === 'Cortesía') {
            if (payments.length > 0) {
                toast.error('La cortesía debe ser el único método de pago o borra los otros.');
                return;
            }
            if (amountToAdd < total) {
                if (!window.confirm('¿Registrar cortesía parcial?')) return;
            }
        }

        // Si ya existe cortesía, no dejar pagar con otra cosa (a menos que se borre)
        if (hasCourtesy) {
            toast.error('Ya hay una cortesía registrada. Elimínala para agregar otros pagos.');
            return;
        }

        // Agregar a la lista
        const newPayment = { method, amount: amountToAdd };
        setPayments([...payments, newPayment]);

        // Calcular lo que falta para el próximo pago
        const newTotalPaid = totalPaid + amountToAdd;
        const newRemaining = Math.max(0, total - newTotalPaid);
        setCurrentAmount(newRemaining > 0 ? newRemaining.toFixed(2) : ''); // Limpiar o poner restante
    };

    const removePayment = (index) => {
        const newPayments = [...payments];
        newPayments.splice(index, 1);
        setPayments(newPayments);
        // Al borrar, sugerimos el monto faltante nuevamente
        const currentPaid = newPayments.reduce((acc, p) => acc + p.amount, 0);
        setCurrentAmount((total - currentPaid).toFixed(2));
    };

    const handleSubmit = () => {
        if (totalPaid < total && !hasCourtesy) {
            toast.error(`Faltan Bs. ${remaining.toFixed(2)} para completar el pago.`);
            return;
        }

        // Find the selected staff object
        const assignedWaiter = selectedWaiterId ? staff.find(s => s.id === selectedWaiterId) : null;

        const finalData = {
            paymentsList: payments,
            totalPaid: hasCourtesy ? 0 : totalPaid, // Si es cortesía, el dinero real es 0
            change: change,
            amountReceived: totalPaid,
            isCourtesy: hasCourtesy,
            assignedWaiter: assignedWaiter // [NEW] Pass assigned waiter
        };

        onConfirm(finalData);
    };

    if (!isOpen) return null;

    // Filter staff for dropdown (exclude admins/checkers maybe? no, allow all just in case)
    const availableStaff = staff.filter(s => s.role !== 'Cocina');

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="bg-gray-900 p-4 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-wider">Procesar Pago</h3>
                        <p className="text-xs text-gray-400">Total Orden: Bs. {total.toFixed(2)}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">

                    {/* SELECTOR DE GARZÓN (NUEVO) */}
                    <div className="mb-6 bg-orange-50 p-2 rounded-lg border border-orange-100 mb-4">
                        <label className="text-[10px] font-bold text-orange-800 uppercase mb-1 block flex items-center gap-1">
                            <User size={12} /> Atendido Por (Comisión):
                        </label>
                        <div className="relative">
                            <select
                                value={selectedWaiterId}
                                onChange={(e) => setSelectedWaiterId(e.target.value)}
                                className="w-full p-2 bg-white border border-orange-200 rounded font-bold text-gray-800 text-sm focus:outline-none focus:border-orange-500 appearance-none"
                            >
                                <option value="">-- Caja / Barra --</option>
                                {availableStaff.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.role})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-2.5 text-orange-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* VISOR DE ESTADO */}
                    <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                        <div className="text-left">
                            <p className="text-xs text-gray-500 font-bold uppercase">Pagado</p>
                            <p className="text-xl font-bold text-blue-600">Bs. {totalPaid.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-bold uppercase">
                                {remaining > 0 ? 'Falta' : 'Cambio'}
                            </p>
                            <p className={`text-3xl font-black ${remaining > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                Bs. {remaining > 0 ? remaining.toFixed(2) : change.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* INPUT DE MONTO */}
                    <div className="mb-4">
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Monto a agregar</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-gray-400 font-bold">Bs.</span>
                            <input
                                type="number"
                                value={currentAmount}
                                onChange={(e) => setCurrentAmount(e.target.value)}
                                onFocus={(e) => e.target.select()}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-2xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all text-center"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* BOTONES DE MÉTODO (AGREGAR) */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        <button onClick={() => handleAddPayment('Efectivo')} className="p-3 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg flex items-center justify-center gap-2 font-bold text-xs transition-transform active:scale-95"><DollarSign size={18} /> + EFECTIVO</button>
                        <button onClick={() => handleAddPayment('QR')} className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg flex items-center justify-center gap-2 font-bold text-xs transition-transform active:scale-95"><Grid size={18} /> + QR</button>
                        <button onClick={() => handleAddPayment('Tarjeta')} className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg flex items-center justify-center gap-2 font-bold text-xs transition-transform active:scale-95"><CreditCard size={18} /> + TARJETA</button>
                        <button onClick={() => handleAddPayment('Reserva')} className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg flex items-center justify-center gap-2 font-bold text-xs transition-transform active:scale-95"><Calendar size={18} /> + RESERVA</button>
                        <button onClick={() => handleAddPayment('Cortesía')} className="col-span-2 p-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg flex items-center justify-center gap-2 font-bold text-xs transition-transform active:scale-95"><Gift size={18} /> CORTESÍA</button>
                    </div>

                    {/* LISTA DE PAGOS AGREGADOS */}
                    {payments.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2 max-h-40 overflow-y-auto">
                            {payments.map((p, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 shadow-sm animate-in slide-in-from-left-2">
                                    <span className="font-bold text-xs text-gray-700 uppercase flex items-center gap-2">
                                        {p.method === 'Cortesía' ? <Gift size={14} className="text-yellow-500" /> : <Check size={14} className="text-green-500" />}
                                        {p.method}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold">Bs. {p.amount.toFixed(2)}</span>
                                        <button onClick={() => removePayment(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* FOOTER CONFIRMAR */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={handleSubmit}
                        disabled={totalPaid < total && !hasCourtesy}
                        className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${(totalPaid >= total || hasCourtesy)
                            ? (hasCourtesy ? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'bg-blue-600 text-white hover:bg-blue-700')
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {hasCourtesy ? 'CONFIRMAR CORTESÍA' : 'FINALIZAR VENTA'}
                    </button>
                </div>

            </div>
        </div>
    );
}