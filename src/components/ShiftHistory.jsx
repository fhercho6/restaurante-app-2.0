// src/components/ShiftHistory.jsx - HISTORIAL AVANZADO CON FILTROS Y REIMPRESIÓN
import React, { useState, useEffect } from 'react';
import { Calendar, Search, Printer, ArrowDownCircle, ArrowUpCircle, DollarSign, FileText } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import toast from 'react-hot-toast';

export default function ShiftHistory({ onReprint }) {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // Hoy
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);   // Hoy

    // Cargar Historial
    const fetchHistory = async () => {
        setLoading(true);
        try {
            // Ajustar fechas para cubrir todo el día
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const collName = isPersonalProject ? 'cash_registers' : `${ROOT_COLLECTION}cash_registers`;
            
            // Traer solo cajas CERRADAS
            const q = query(
                collection(db, collName), 
                where('status', '==', 'closed'),
                where('openedAt', '>=', start.toISOString()),
                where('openedAt', '<=', end.toISOString()),
                orderBy('openedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setShifts(data);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando historial");
        } finally {
            setLoading(false);
        }
    };

    // Cargar al inicio y cuando cambian las fechas
    useEffect(() => {
        fetchHistory();
    }, [startDate, endDate]);

    // Calcular Totales del Periodo
    const totals = shifts.reduce((acc, shift) => {
        const stats = shift.finalSalesStats || {};
        return {
            sales: acc.sales + (stats.cashSales || 0) + (stats.digitalSales || 0),
            expenses: acc.expenses + (stats.totalExpenses || 0),
            cash: acc.cash + (stats.cashSales || 0)
        };
    }, { sales: 0, expenses: 0, cash: 0 });

    return (
        <div className="space-y-6 animate-in fade-in">
            
            {/* --- FILTROS Y TOTALES --- */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative group">
                        <Calendar size={16} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-600"/>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            className="pl-10 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" 
                        />
                    </div>
                    <span className="text-gray-400 font-bold">-</span>
                    <div className="relative group">
                        <Calendar size={16} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-600"/>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            className="pl-10 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" 
                        />
                    </div>
                </div>

                <div className="flex gap-4 text-sm w-full md:w-auto justify-end">
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-bold uppercase">Total Ventas</p>
                        <p className="font-black text-lg text-indigo-600">Bs. {totals.sales.toFixed(2)}</p>
                    </div>
                    <div className="text-right border-l pl-4 border-gray-200">
                        <p className="text-xs text-gray-500 font-bold uppercase">Total Gastos</p>
                        <p className="font-black text-lg text-red-500">Bs. {totals.expenses.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* --- LISTA DE TURNOS --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2"><FileText size={18}/> Registros de Cierre ({shifts.length})</h3>
                    <button onClick={fetchHistory} className="text-xs text-indigo-600 font-bold hover:underline">Actualizar</button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">Fecha Cierre</th>
                                <th className="p-4">Responsable</th>
                                <th className="p-4 text-right">Venta Total</th>
                                <th className="p-4 text-right">Gastos</th>
                                <th className="p-4 text-right">Efectivo Final</th>
                                <th className="p-4 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Cargando datos...</td></tr>
                            ) : shifts.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No hay cierres en este rango de fechas.</td></tr>
                            ) : (
                                shifts.map((shift) => {
                                    const stats = shift.finalSalesStats || {};
                                    const totalSale = (stats.cashSales || 0) + (stats.digitalSales || 0);
                                    
                                    return (
                                        <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <span className="font-bold text-gray-800 block">
                                                    {new Date(shift.closedAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(shift.closedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                        {shift.openedBy?.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-gray-700">{shift.openedBy}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-bold text-green-600">
                                                Bs. {totalSale.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-right font-bold text-red-400">
                                                Bs. {(stats.totalExpenses || 0).toFixed(2)}
                                            </td>
                                            <td className="p-4 text-right font-mono text-gray-600">
                                                Bs. {parseFloat(shift.finalCashCalculated || 0).toFixed(2)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => onReprint(shift)}
                                                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                                                    title="Reimprimir Reporte Z"
                                                >
                                                    <Printer size={16}/>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}