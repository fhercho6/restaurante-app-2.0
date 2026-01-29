// src/components/ClosingWizardModal.jsx
import React, { useState, useMemo } from 'react';
import { X, Check, ShieldCheck, DollarSign, MessageCircle, AlertTriangle, Lock } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function ClosingWizardModal({ isOpen, onClose, registerSession, sessionStats, onConfirmClose, cashExpected, totalSalaries, attendanceList, commissionDetails }) {
    if (!isOpen) return null;

    const { closingChecklist, ownerPhone, appName } = useData();
    const [step, setStep] = useState(1); // 1: Checklist, 2: Financials, 3: Success (Handled outside or here?) -> actually 2 is financials, 3 is result
    const [checkedItems, setCheckedItems] = useState({});

    // Checklist Logic
    const toggleItem = (item) => {
        setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
    };

    const allChecked = closingChecklist.every(item => checkedItems[item]);

    // Whatsapp Generator
    const generateWhatsappLink = () => {
        if (!registerSession) return '';

        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();
        const cashObj = sessionStats.cashSales.toFixed(2);
        const qrObj = sessionStats.qrSales.toFixed(2);
        const cardObj = sessionStats.cardSales.toFixed(2);
        const expObj = sessionStats.totalExpenses.toFixed(2);
        const finalCash = cashExpected.toFixed(2);
        const resp = registerSession.openedBy;

        let msg = `🔒 *REPORTE DE CIERRE - ${appName}*\n`;
        msg += `📅 ${date} - 🕒 ${time}\n`;
        msg += `👤 Responsable: *${resp}*\n\n`;

        msg += `💰 *RESUMEN DE VENTAS*\n`;
        msg += `💵 Efectivo: Bs. ${cashObj}\n`;
        msg += `📱 QR: Bs. ${qrObj}\n`;
        msg += `💳 Tarjeta: Bs. ${cardObj}\n`;
        msg += `------------------------\n`;
        msg += `📉 Gastos Turno: Bs. ${expObj}\n`;
        if (totalSalaries > 0) msg += `💸 Nómina/Comis: Bs. ${totalSalaries.toFixed(2)}\n`;
        msg += `------------------------\n`;
        msg += `🟢 *EFECTIVO EN CAJA: Bs. ${finalCash}*\n`;
        msg += `(Dinero real a entregar)\n\n`;

        if (closingChecklist.length > 0) {
            msg += `✅ *Checklist Verificado*\n`;
            closingChecklist.forEach(i => msg += `✓ ${i}\n`);
        }

        const encodedMsg = encodeURIComponent(msg);
        return `https://wa.me/${ownerPhone}?text=${encodedMsg}`;
    };

    // Render Steps
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">

                {/* HEADERS */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {step === 1 && <ShieldCheck className="text-orange-500" />}
                        {step === 2 && <DollarSign className="text-green-500" />}
                        <h2 className="font-bold text-lg">
                            {step === 1 ? 'PROTOCOLO DE CIERRE' : 'CIERRE FINANCIERO'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10 text-white/50 hover:text-white transition-colors"><X size={20} /></button>
                </div>

                <div className="p-0">
                    {/* STEP 1: CHECKLIST */}
                    {step === 1 && (
                        <div className="p-6">
                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-4 flex gap-3">
                                <AlertTriangle className="text-orange-600 shrink-0" size={24} />
                                <p className="text-orange-800 text-sm">
                                    Por seguridad, verifica cada punto antes de proceder al cierre de caja.
                                </p>
                            </div>

                            <div className="space-y-3 mb-6">
                                {closingChecklist.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => toggleItem(item)}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${checkedItems[item] ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${checkedItems[item] ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'}`}>
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                        <span className={`font-medium ${checkedItems[item] ? 'text-gray-800' : 'text-gray-500'}`}>{item}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!allChecked}
                                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm tracking-wide uppercase transition-all shadow-lg bg-gray-900 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {allChecked ? 'CONTINUAR AL CIERRE' : `VERIFICA (${Object.keys(checkedItems).length}/${closingChecklist.length})`}
                            </button>
                        </div>
                    )}

                    {/* STEP 2: ACCOUNTING (THE OLD CONFIRM) */}
                    {step === 2 && (
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-1">EFECTIVO FINAL EN CAJA</p>
                                <div className="text-5xl font-black text-gray-800">
                                    Bs. {cashExpected.toFixed(2)}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    (Ventas Efectivo + Apertura) - Gastos - Pagos
                                </p>
                            </div>

                            {/* NOMINA SUMMARY */}
                            {totalSalaries > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                                    <div className="flex justify-between items-center mb-2 border-b border-yellow-200 pb-2">
                                        <span className="font-bold text-yellow-800 text-xs uppercase flex items-center gap-1"><DollarSign size={12} /> Nómina & Comisiones</span>
                                        <span className="font-black text-yellow-900">Bs. {totalSalaries.toFixed(2)}</span>
                                    </div>
                                    <div className="space-y-1">
                                        {/* Simple list of people being paid */}
                                        {commissionDetails.map(c => (
                                            <div key={c.name} className="flex justify-between text-[10px] text-yellow-700">
                                                <span>{c.name} ({Math.round(c.rate * 100)}%):</span>
                                                <span className="font-mono">Bs. {c.amount.toFixed(2)}</span>
                                            </div>
                                        ))}
                                        {attendanceList.map(a => (
                                            <div key={a.id} className="flex justify-between text-[10px] text-yellow-700">
                                                <span>Sueldo: {a.staffName}</span>
                                                <span className="font-mono">Bs. {Number(a.dailySalary || 0).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {/* ACTION BUTTONS */}
                                <button
                                    onClick={() => onConfirmClose(true)} // Pay & Close
                                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-green-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    <Lock size={18} />
                                    {totalSalaries > 0 ? `PAGAR (${totalSalaries.toFixed(0)}) Y CERRAR` : 'CONFIRMAR CIERRE'}
                                </button>

                                {totalSalaries > 0 && (
                                    <button
                                        onClick={() => onConfirmClose(false)} // Close WITHOUT Paying
                                        className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors"
                                    >
                                        CERRAR SIN PAGAR SUELDOS
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
