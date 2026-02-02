// src/components/ClosingWizardModal.jsx
import React, { useState, useMemo } from 'react';
import { X, Check, ShieldCheck, DollarSign, MessageCircle, AlertTriangle, Lock, Printer } from 'lucide-react';
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
                        {/* PRINT CHECKLIST BUTTON (STEP 1 ONLY) */}
                        {step === 1 && (
                            <button
                                onClick={() => {
                                    const content = `
                                        <html>
                                            <head>
                                                <title>Protocolo de Cierre</title>
                                                <style>
                                                    body { font-family: 'Arial', sans-serif; font-size: 12px; width: 72mm; margin: 0; padding: 10px; }
                                                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                                                    .title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
                                                    .item { margin-bottom: 8px; font-size: 14px; display: flex; align-items: center; gap: 5px; }
                                                    .box { width: 15px; height: 15px; border: 1px solid #000; display: inline-block; margin-right: 5px; }
                                                    .footer { margin-top: 30px; text-align: center; font-size: 10px; border-top: 1px dashed #000; padding-top: 5px; }
                                                </style>
                                            </head>
                                            <body>
                                                <div class="header">
                                                    <div class="title">PROTOCOLO DE CIERRE</div>
                                                    <div>${new Date().toLocaleDateString()}</div>
                                                    <div>Resp: ${registerSession?.openedBy || 'Cajero'}</div>
                                                </div>
                                                
                                                ${closingChecklist.map(item => `
                                                    <div class="item">
                                                        <span class="box"></span> ${item}
                                                    </div>
                                                `).join('')}

                                                <div class="footer">
                                                    Firma Responsable<br/><br/><br/>
                                                    _____________________
                                                </div>
                                            </body>
                                        </html>
                                    `;
                                    const win = window.open('', 'PRINT', 'height=600,width=400');
                                    if (win) {
                                        win.document.write(content);
                                        win.document.close();
                                        win.focus();
                                        setTimeout(() => { win.print(); win.close(); }, 500);
                                    }
                                }}
                                className="ml-2 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors text-white/80 hover:text-white"
                                title="Imprimir Checklist"
                            >
                                <Printer size={16} />
                            </button>
                        )}
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
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-yellow-900">Bs. {totalSalaries.toFixed(2)}</span>
                                            <button
                                                onClick={() => {
                                                    const content = `
                                                        <html>
                                                            <head>
                                                                <title>Nómina Pendiente</title>
                                                                <style>
                                                                    body { font-family: 'Arial', sans-serif; font-size: 12px; width: 72mm; margin: 0; padding: 10px; }
                                                                    .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
                                                                    .title { font-weight: bold; font-size: 14px; }
                                                                    .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
                                                                    .total { font-weight: bold; border-top: 1px dashed #000; margin-top: 5px; padding-top: 5px; font-size: 14px; }
                                                                </style>
                                                            </head>
                                                            <body>
                                                                <div class="header">
                                                                    <div class="title">NÓMINA PENDIENTE</div>
                                                                    <div>${new Date().toLocaleString()}</div>
                                                                    <div>Resp: ${registerSession?.openedBy || 'Cajero'}</div>
                                                                </div>
                                                                
                                                                <div style="font-weight:bold; margin-bottom:5px;">COMISIONES:</div>
                                                                ${commissionDetails.map(c => `
                                                                    <div class="row">
                                                                        <span>${c.name.substring(0, 15)} (${Math.round(c.rate * 100)}%)</span>
                                                                        <span>${c.amount.toFixed(2)}</span>
                                                                    </div>
                                                                `).join('')}
                                                                
                                                                <div style="font-weight:bold; margin-top:10px; margin-bottom:5px;">SUELDOS BASE:</div>
                                                                ${attendanceList.map(a => `
                                                                    <div class="row">
                                                                        <span>${a.staffName.substring(0, 15)}</span>
                                                                        <span>${Number(a.dailySalary || 0).toFixed(2)}</span>
                                                                    </div>
                                                                `).join('')}

                                                                <div class="row total">
                                                                    <span>TOTAL A PAGAR:</span>
                                                                    <span>Bs. ${totalSalaries.toFixed(2)}</span>
                                                                </div>
                                                                <center style="margin-top:15px; font-size:10px;">-- DOCUMENTO INTERNO --</center>
                                                            </body>
                                                        </html>
                                                    `;
                                                    const win = window.open('', 'PRINT', 'height=600,width=400');
                                                    if (win) {
                                                        win.document.write(content);
                                                        win.document.close();
                                                        win.focus();
                                                        setTimeout(() => { win.print(); win.close(); }, 500);
                                                    }
                                                }}
                                                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-1.5 rounded transition-colors"
                                                title="Imprimir Lista"
                                            >
                                                <Printer size={14} />
                                            </button>
                                        </div>
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
