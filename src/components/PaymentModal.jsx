// src/components/PaymentModal.jsx - SOPORTE MULTI-PAGO Y CORTESÍA CORRECTA
import React, { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Grid, Gift, Check, Trash2, Calendar, User, ChevronDown, Lock, Unlock } from 'lucide-react'; // [UPDATED] Added Lock/Unlock
import toast from 'react-hot-toast';

export default function PaymentModal({ isOpen, onClose, total, onConfirm, staff = [], initialWaiter = null }) {
    const [currentAmount, setCurrentAmount] = useState(''); // Lo que se escribe en el input
    const [payments, setPayments] = useState([]); // Lista de pagos acumulados
    const [selectedWaiterId, setSelectedWaiterId] = useState(''); // [NEW] Selected Waiter

    // [NEW] PIN Protection States
    const [isLocked, setIsLocked] = useState(false);
    const [showUnlockInput, setShowUnlockInput] = useState(false);
    const [unlockPin, setUnlockPin] = useState('');

    // [NEW] Reference Input State
    const [isReferencePromptOpen, setIsReferencePromptOpen] = useState(false);
    const [pendingMethod, setPendingMethod] = useState(null);
    const [paymentReference, setPaymentReference] = useState('');


    // Reiniciar al abrir
    useEffect(() => {
        if (isOpen) {
            setCurrentAmount(total.toFixed(2));
            setPayments([]);
            // Default waiter logic: Use initialWaiter (ID passed from AppContent)
            if (initialWaiter) {
                setSelectedWaiterId(initialWaiter);
                setIsLocked(true); // [NEW] Lock if auto-assigned
            } else {
                setSelectedWaiterId('');
                setIsLocked(false);
            }
            setShowUnlockInput(false);
            setUnlockPin('');
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

        // Validación tarjeta/qr exacto
        if ((method === 'Tarjeta' || method === 'QR') && amountToAdd > remaining && remaining > 0) {
            // Permitir sobrepago en tarjeta? Usualmente no se da cambio de tarjeta.
            // Asumimos que si pagan mas, es propina o error, pero el sistema calcula cambio.
            // Advertencia opcional.
        }

        // Si es pago digital (QR o Tarjeta), pedimos la referencia primero
        if (method === 'QR' || method === 'Tarjeta') {
            setPendingMethod(method);
            setPaymentReference('');
            setIsReferencePromptOpen(true);
            return; // Detenemos aquí, la confirmación ocurre en handleConfirmReference
        }

        executeAddPayment(method, '');
    };

    const handleConfirmReference = () => {
        executeAddPayment(pendingMethod, paymentReference);
        setIsReferencePromptOpen(false);
        setPendingMethod(null);
        setPaymentReference('');
    };

    const handleCancelReference = () => {
        setIsReferencePromptOpen(false);
        setPendingMethod(null);
        setPaymentReference('');
    };

    const executeAddPayment = (method, reference) => {
        const amountToAdd = parseFloat(currentAmount);

        // Agregar a la lista
        const newPayment = {
            id: Date.now(),
            method,
            amount: amountToAdd,
            reference: reference // [NEW] Save the reference/time
        };
        setPayments([...payments, newPayment]);

        // Calcular lo que falta para el próximo pago
        const newTotalPaid = totalPaid + amountToAdd;
        const newRemaining = Math.max(0, total - newTotalPaid);
        setCurrentAmount(newRemaining > 0 ? newRemaining.toFixed(2) : ''); // Limpiar o poner restante
    };

    const removePayment = (id) => {
        const newPayments = payments.filter(p => p.id !== id);
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

    // [NEW] PIN Verification Logic
    const handleVerifyPin = () => {
        // Find staff with this PIN
        const validStaff = staff.find(s => s.pin === unlockPin);
        if (validStaff) {
            setIsLocked(false);
            setShowUnlockInput(false);
            setUnlockPin('');
            toast.success("Desbloqueado");
        } else {
            toast.error("PIN Incorrecto");
            setUnlockPin('');
        }
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
                            {showUnlockInput ? (
                                <div className="flex gap-2 animate-in slide-in-from-right">
                                    <input
                                        type="password"
                                        placeholder="PIN Supervisor"
                                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-center tracking-widest"
                                        autoFocus
                                        value={unlockPin}
                                        onChange={e => setUnlockPin(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleVerifyPin()}
                                    />
                                    <button onClick={handleVerifyPin} className="bg-orange-600 text-white p-2 rounded-lg font-bold text-xs">OK</button>
                                    <button onClick={() => setShowUnlockInput(false)} className="text-gray-400 p-2"><X size={16} /></button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <select
                                            value={selectedWaiterId}
                                            onChange={(e) => setSelectedWaiterId(e.target.value)}
                                            disabled={isLocked}
                                            className={`w-full p-2.5 bg-gray-50 border ${isLocked ? 'border-gray-200 text-gray-500 bg-gray-100' : 'border-gray-200 text-gray-800'} rounded-lg text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                                        >
                                            <option value="">-- Caja / Barra --</option>
                                            {availableStaff.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name} ({s.role})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (isLocked) setShowUnlockInput(true);
                                            else setIsLocked(true);
                                        }}
                                        className={`p-2 rounded-lg transition-colors ${isLocked ? 'bg-gray-200 text-gray-500 hover:bg-gray-300' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                                        title={isLocked ? "Desbloquear (Requiere PIN)" : "Bloquear selección"}
                                    >
                                        {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                                    </button>
                                </div>
                            )}
                            <p className="text-[10px] text-gray-400 mt-1 pl-1">
                                {isLocked ? "🔒 Selección bloqueada por seguridad" : "🔓 Selección habilitada"}
                            </p>
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
                                <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 shadow-sm animate-in slide-in-from-left-2">
                                    <span className="font-bold text-xs text-gray-700 uppercase flex flex-col justify-center">
                                        <div className="flex items-center gap-2">
                                            {p.method === 'Cortesía' ? <Gift size={14} className="text-yellow-500" /> : <Check size={14} className="text-green-500" />}
                                            {p.method}
                                        </div>
                                        {p.reference && <span className="text-[9px] text-gray-400 mt-0.5 ml-5">Ref: {p.reference}</span>}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold">Bs. {p.amount.toFixed(2)}</span>
                                        <button onClick={() => removePayment(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
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

                {/* MODAL PARA PEDIR REFERENCIA / HORA (SOBREPUESTO) */}
                {isReferencePromptOpen && (
                    <div className="absolute inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-6 backdrop-blur-[2px] animate-in fade-in zoom-in-95">
                        <div className="bg-white p-6 rounded-xl shadow-2xl w-full text-center">
                            <h4 className="font-bold text-lg mb-2 text-gray-800">Referencia de Pago {pendingMethod}</h4>
                            <p className="text-xs text-gray-500 mb-4">Ingresa la **Hora del Comprobante** (Ej. 14:35) o los últimos dígitos para facilitar la revisión del Cajero.</p>

                            <input
                                type="text"
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmReference(); }}
                                placeholder="Ej: 14:35, Ref: 1234, o dejar vacío"
                                className="w-full text-center p-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 outline-none mb-6 font-bold text-gray-700 placeholder:font-normal placeholder:text-gray-300"
                                autoFocus
                            />

                            <div className="flex gap-2 w-full">
                                <button onClick={handleCancelReference} className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200">
                                    CANCELAR
                                </button>
                                <button onClick={handleConfirmReference} className="flex-1 py-3 text-sm font-bold text-white bg-orange-600 rounded-lg hover:bg-orange-700">
                                    AGREGAR PAGO
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}