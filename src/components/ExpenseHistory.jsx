import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db, isPersonalProject, ROOT_COLLECTION } from '../config/firebase';
import { Search, Calendar, DollarSign, FileText, Printer, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExpenseHistory({ onBack }) {
    // State
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setHours(23, 59, 59, 999);
        return d.toISOString().split('T')[0];
    });

    // Fetch Data
    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const collName = isPersonalProject ? 'expenses' : `${ROOT_COLLECTION}expenses`;
            // Note: Firestore requires an index for range filters on different fields than order.
            // We will fetch by date range (client side filtering might be safer if index is missing, but let's try direct query first)
            // Ideally: where('date', '>=', start.toISOString()), where('date', '<=', end.toISOString())

            const q = query(
                collection(db, collName),
                where('date', '>=', start.toISOString()),
                where('date', '<=', end.toISOString())
            );

            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort client-side to avoid complex index requirements for now
            data.sort((a, b) => new Date(b.date) - new Date(a.date));

            setExpenses(data);
            if (data.length === 0) toast("No se encontraron gastos en este rango", { icon: 'ℹ️' });

        } catch (error) {
            console.error("Error fetching expenses:", error);
            toast.error("Error al cargar historial de gastos");
        } finally {
            setLoading(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchExpenses();
    }, []); // Run once on mount, then user triggers via search button

    // Stats
    const totalAmount = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const totalCount = expenses.length;

    // Print Handler
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 no-print">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FileText className="text-orange-500" />
                            Historial de Gastos
                        </h2>
                        <p className="text-sm text-gray-500">Consulta y reporte de egresos registrados</p>
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Desde</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hasta</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={fetchExpenses}
                            disabled={loading}
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 h-[38px]"
                        >
                            {loading ? 'Cargando...' : <><Search size={16} /> Buscar</>}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="bg-orange-50 text-orange-600 border border-orange-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-100 transition-colors flex items-center gap-2 h-[38px]"
                        >
                            <Printer size={16} /> Imprimir
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
                <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Total Gastos</p>
                        <p className="text-2xl font-black text-red-600">Bs. {totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-full text-red-500"><DollarSign size={24} /></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Cantidad Movimientos</p>
                        <p className="text-2xl font-black text-gray-800">{totalCount}</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-full text-gray-500"><FileText size={24} /></div>
                </div>
            </div>

            {/* Printable Report Header (Hidden on screen) */}
            <div className="hidden print:block mb-8 text-center">
                <h1 className="text-2xl font-bold uppercase">Reporte de Gastos</h1>
                <p className="text-gray-600">Del {startDate} Al {endDate}</p>
                <div className="mt-4 flex justify-center gap-8 border-b border-gray-300 pb-4">
                    <div className="text-center">
                        <span className="block text-xs uppercase text-gray-500">Total Monto</span>
                        <span className="block text-xl font-bold">Bs. {totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-xs uppercase text-gray-500">Registros</span>
                        <span className="block text-xl font-bold">{totalCount}</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3">Fecha y Hora</th>
                                <th className="px-4 py-3">Descripción / Razón</th>
                                <th className="px-4 py-3">Responsable</th>
                                <th className="px-4 py-3 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {expenses.length > 0 ? (
                                expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                            {new Date(expense.date).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {expense.description || expense.reason || 'Sin descripción'}
                                            {expense.type && <span className="ml-2 text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">{expense.type}</span>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {expense.createdBy || expense.staffNames || 'Sistema'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-red-600">
                                            Bs. {parseFloat(expense.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-400">
                                        {loading ? 'Cargando datos...' : 'No hay gastos registrados en este periodo.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t border-gray-200 font-bold">
                            <tr>
                                <td colSpan="3" className="px-4 py-3 text-right text-gray-600 uppercase">Total Periodo:</td>
                                <td className="px-4 py-3 text-right text-red-700 text-base">Bs. {totalAmount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="text-center text-xs text-gray-400 mt-8 print:mt-16">
                <p>Generado por Sistema Restaurante - {new Date().toLocaleString()}</p>
            </div>
        </div>
    );
}
