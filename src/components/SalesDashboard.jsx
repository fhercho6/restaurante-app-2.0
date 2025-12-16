// src/components/SalesDashboard.jsx - CORRECCIÓN (LIMIT IMPORTADO)
import React, { useState, useEffect } from 'react';
// CORRECCIÓN AQUÍ: Se agregó 'limit' a la importación
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import { Calendar, DollarSign, CreditCard, TrendingUp, FileText, Printer, Search, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SalesDashboard({ onReprintZ, onConfigurePrinter, currentPrinterType }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
      setLoading(true);
      try {
          const colName = isPersonalProject ? 'cash_registers' : `${ROOT_COLLECTION}cash_registers`;
          const salesRef = collection(db, colName);
          // Ahora 'limit' funcionará correctamente
          let q = query(salesRef, where('status', '==', 'closed'), orderBy('closedAt', 'desc'), limit(20)); 
          
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setHistory(data);
      } catch (error) {
          console.error("Error cargando historial:", error);
          toast.error("Error al cargar historial");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchHistory();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in">
        
        {/* ENCABEZADO CON CONFIGURACIÓN DE IMPRESORA */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200 gap-4">
            <div>
                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                    <FileText className="text-orange-500"/> REPORTES Y CIERRES
                </h2>
                <p className="text-xs text-gray-500 font-medium">Historial de turnos cerrados</p>
            </div>
            
            <button 
                onClick={onConfigurePrinter}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-2 shadow-sm"
            >
                <Printer size={18}/>
                <div className="text-left">
                    <span className="block leading-none">CONFIG. IMPRESORA</span>
                    <span className="text-[9px] opacity-70 uppercase">{currentPrinterType === 'letter' ? 'Formato Carta' : 'Formato Ticket'}</span>
                </div>
            </button>
        </div>

        {/* LISTA DE CIERRES ANTERIORES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-sm">Historial de Cierres (Z)</h3>
                <button onClick={fetchHistory} className="text-xs text-blue-600 font-bold hover:underline">Refrescar</button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50/50">
                            <th className="p-3 font-bold">FECHA CIERRE</th>
                            <th className="p-3 font-bold">RESPONSABLE</th>
                            <th className="p-3 text-right font-bold">TOTAL VENDIDO</th>
                            <th className="p-3 text-right font-bold">EFECTIVO REAL</th>
                            <th className="p-3 text-center font-bold">ACCIÓN</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-400">Cargando historial...</td></tr>
                        ) : history.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-400">No hay registros cerrados aún.</td></tr>
                        ) : (
                            history.map((shift) => (
                                <tr key={shift.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-3">
                                        <div className="font-bold text-gray-700 text-xs">{new Date(shift.closedAt).toLocaleDateString()}</div>
                                        <div className="text-[10px] text-gray-400">{new Date(shift.closedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                    </td>
                                    <td className="p-3">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase">{shift.closedBy || 'Admin'}</span>
                                    </td>
                                    <td className="p-3 text-right font-mono text-xs text-gray-600">
                                        Bs. {((shift.finalSalesStats?.cashSales || 0) + (shift.finalSalesStats?.digitalSales || 0)).toFixed(2)}
                                    </td>
                                    <td className="p-3 text-right font-mono font-bold text-green-600 text-sm">
                                        Bs. {shift.finalCashCalculated?.toFixed(2)}
                                    </td>
                                    <td className="p-3 text-center">
                                        <button 
                                            onClick={() => onReprintZ(shift)}
                                            className="p-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm" 
                                            title="Reimprimir Reporte Z"
                                        >
                                            <Printer size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}