// src/components/RegisterControlView.jsx
import React, { useState } from 'react';
import { Lock, Unlock, DollarSign, Clock, User, AlertTriangle, CheckCircle, Wallet, Users, TrendingDown, TrendingUp, Plus, Trash2, Printer } from 'lucide-react';

const RegisterControlView = ({ session, onOpen, onClose, staff, stats, onAddExpense, onDeleteExpense, onReprintExpense }) => {
    const [amount, setAmount] = useState('');

    // Estado para nuevo gasto
    const [expenseDesc, setExpenseDesc] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');

    const handleOpenSubmit = (e) => {
        e.preventDefault();
        if (!amount) return;
        // activeTeam removed as per user request
        onOpen(parseFloat(amount), []);
        setAmount('');
    };

    const handleExpenseSubmit = (e) => {
        e.preventDefault();
        if (!expenseDesc || !expenseAmount) return;
        onAddExpense(expenseDesc, parseFloat(expenseAmount));
        setExpenseDesc('');
        setExpenseAmount('');
    };

    // Cálculo final de caja esperada
    const cashExpected = session ? (session.openingAmount + stats.cashSales - stats.totalExpenses) : 0;

    return (
        <div className="animate-in fade-in max-w-6xl mx-auto pb-20">

            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 flex items-center gap-2">
                        <Wallet className="text-orange-600" size={32} /> Control de Caja
                    </h2>
                    <p className="text-gray-500 text-sm">Gestión de flujo de efectivo y arqueo.</p>
                </div>
                {session && (
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase">EFECTIVO ESPERADO</p>
                        <p className={`text-4xl font-black ${cashExpected >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Bs. {cashExpected.toFixed(2)}
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- COLUMNA 1: ESTADO DEL TURNO --- */}
                <div className="space-y-6">
                    <div className={`p-6 rounded-2xl shadow-lg text-white ${session ? 'bg-gray-900' : 'bg-gray-600'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/10 rounded-full">
                                    {session ? <Unlock size={24} /> : <Lock size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg uppercase tracking-wider">
                                        {session ? 'TURNO ABIERTO' : 'CAJA CERRADA'}
                                    </h3>
                                    <p className="text-xs opacity-70">{session ? 'Operativo' : 'Sin actividad'}</p>
                                </div>
                            </div>
                        </div>

                        {session ? (
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="opacity-70">Responsable</span>
                                    <span className="font-bold">{session.openedBy}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="opacity-70">Inicio</span>
                                    <span className="font-mono">{new Date(session.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {session.activeTeam && session.activeTeam.length > 0 && (
                                    <div className="pt-2">
                                        <p className="text-xs opacity-70 mb-1">Equipo en Turno:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {session.activeTeam?.map((s, i) => (
                                                <span key={i} className="text-[10px] bg-white/20 px-2 py-0.5 rounded">{s.name}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-center opacity-50 py-4 text-sm">Inicia turno para ver detalles.</p>
                        )}
                    </div>

                    {/* Resumen Financiero (Solo si abierto) */}
                    {session && (
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 space-y-3">
                            <h4 className="font-bold text-gray-800 text-sm uppercase border-b pb-2">Resumen en Vivo</h4>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 flex items-center gap-2"><DollarSign size={14} /> Fondo Inicial</span>
                                <span className="font-bold">Bs. {session.openingAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm text-green-600">
                                <span className="flex items-center gap-2"><TrendingUp size={14} /> Ventas (Efectivo)</span>
                                <span className="font-bold">+ Bs. {stats.cashSales.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm text-red-500">
                                <span className="flex items-center gap-2"><TrendingDown size={14} /> Gastos / Salidas</span>
                                <span className="font-bold">- Bs. {stats.totalExpenses.toFixed(2)}</span>
                            </div>

                            <div className="pt-2 border-t mt-2 flex justify-between items-center">
                                <span className="text-gray-400 text-xs">Ventas Digitales (QR/Tarjeta)</span>
                                <span className="font-bold text-gray-400 text-xs">Bs. {stats.digitalSales.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- COLUMNA 2: REGISTRO DE GASTOS --- */}
                <div className="lg:col-span-2 space-y-6">

                    {session ? (
                        <>
                            {/* Lista de Gastos */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between">
                                    <h3 className="font-bold text-gray-700 text-sm">Gastos del Turno</h3>
                                    <span className="text-xs text-gray-500">{stats.expensesList.length} registros</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {stats.expensesList.length === 0 ? (
                                        <p className="text-center py-8 text-gray-400 text-sm italic">No hay gastos registrados en este turno.</p>
                                    ) : (
                                        <table className="w-full text-sm text-left">
                                            <tbody>
                                                {stats.expensesList.map((ex) => (
                                                    <tr key={ex.id} className="border-b last:border-0 hover:bg-gray-50">
                                                        <td className="px-5 py-3 text-gray-600">{new Date(ex.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                        <td className="px-5 py-3 font-medium text-gray-800">{ex.description}</td>
                                                        <td className="px-5 py-3 text-right font-bold text-red-600">- Bs. {ex.amount.toFixed(2)}</td>
                                                        <td className="px-5 py-3 text-right w-24 flex items-center justify-end gap-2">
                                                            <button onClick={() => onReprintExpense && onReprintExpense(ex)} className="text-gray-400 hover:text-blue-500" title="Reimprimir"><Printer size={16} /></button>
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm('¿Estás seguro de eliminar este gasto?')) {
                                                                        onDeleteExpense(ex.id);
                                                                    }
                                                                }}
                                                                className="text-gray-400 hover:text-red-500"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                            {/* Botón de Cierre */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 text-lg"
                                >
                                    <Lock size={24} /> CERRAR CAJA Y GENERAR REPORTE
                                </button>
                                <p className="text-center text-xs text-gray-500 mt-2">Esto finalizará el turno y guardará el arqueo final.</p>
                            </div>
                        </>
                    ) : (
                        // FORMULARIO DE APERTURA (Si está cerrada)
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col justify-center">
                            <h3 className="text-2xl font-black text-gray-800 mb-6 text-center">Iniciar Nuevo Turno</h3>
                            <form onSubmit={handleOpenSubmit}>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Fondo de Caja (Cambio inicial)</label>
                                <div className="relative mb-6">
                                    <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="number"
                                        step="0.10"
                                        className="w-full pl-10 p-4 text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <button type="submit" disabled={!amount} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg disabled:bg-gray-300">
                                    ABRIR TURNO
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterControlView;