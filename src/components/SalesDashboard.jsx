// src/components/SalesDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, DollarSign, Clock, User, 
  ShoppingBag, Wallet, RefreshCw, AlertCircle, Printer, History 
} from 'lucide-react';
import { collection, query, orderBy, where, onSnapshot, limit } from 'firebase/firestore';
import { db, isPersonalProject, ROOT_COLLECTION } from '../config/firebase';

// AHORA RECIBIMOS "onReprintZ" COMO PROPIEDAD
const SalesDashboard = ({ onReprintZ }) => {
  const [sales, setSales] = useState([]);
  const [shifts, setShifts] = useState([]); // Historial de Turnos/Cierres
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ todayTotal: 0, todayCount: 0 });
  const [waiterReport, setWaiterReport] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const salesColName = isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`;
    const registersColName = isPersonalProject ? 'cash_registers' : `${ROOT_COLLECTION}cash_registers`;
    
    // 1. RANGO DE HOY
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 2. CONSULTA VENTAS (HOY)
    const qSales = query(
        collection(db, salesColName), 
        where('date', '>=', startOfDay.toISOString()),
        where('date', '<=', endOfDay.toISOString()),
        orderBy('date', 'desc')
    );

    // 3. CONSULTA HISTORIAL DE CIERRES (Últimos 20 turnos cerrados)
    const qShifts = query(
        collection(db, registersColName),
        where('status', '==', 'closed'),
        orderBy('closedAt', 'desc'),
        limit(20)
    );

    // Escuchar Ventas
    const unsubSales = onSnapshot(qSales, (snapshot) => {
        const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSales(salesData);

        let todaySum = 0;
        let todayCnt = 0;
        const reportMap = {};

        salesData.forEach(sale => {
            const saleTotal = Number(sale.total) || 0;
            todaySum += saleTotal;
            todayCnt += 1;
            const waiter = sale.staffName || 'Caja General';
            if (!reportMap[waiter]) {
              reportMap[waiter] = { name: waiter, cash: 0, qr: 0, card: 0, total: 0, txCount: 0 };
            }
            reportMap[waiter].txCount += 1;
            reportMap[waiter].total += saleTotal;

            if (sale.payments && Array.isArray(sale.payments)) {
              sale.payments.forEach(p => {
                const amount = parseFloat(p.amount) || 0;
                if (p.method === 'Efectivo') reportMap[waiter].cash += amount;
                if (p.method === 'QR') reportMap[waiter].qr += amount;
                if (p.method === 'Tarjeta') reportMap[waiter].card += amount;
              });
              if (sale.changeGiven > 0) reportMap[waiter].cash -= parseFloat(sale.changeGiven);
            } else {
              const method = sale.paymentMethod || 'Efectivo';
              const amount = parseFloat(sale.total);
              if (method === 'Efectivo') reportMap[waiter].cash += amount;
              else if (method === 'QR') reportMap[waiter].qr += amount;
              else reportMap[waiter].card += amount;
            }
        });

        setStats({ todayTotal: todaySum, todayCount: todayCnt });
        setWaiterReport(Object.values(reportMap));
        setLoading(false);
    }, (err) => {
        console.error("Error ventas:", err);
        if (err.message.includes("indexes")) setErrorMsg("⚠️ FALTAN ÍNDICES EN FIREBASE");
        setLoading(false);
    });

    // Escuchar Cierres de Caja (Turnos)
    const unsubShifts = onSnapshot(qShifts, (snapshot) => {
        const shiftsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setShifts(shiftsData);
    });

    return () => { unsubSales(); unsubShifts(); };
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500 flex flex-col items-center"><RefreshCw className="animate-spin mb-2"/> Cargando datos...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {errorMsg && <div className="bg-red-100 text-red-800 p-4 rounded-lg border border-red-200 flex items-center gap-2"><AlertCircle /> {errorMsg}</div>}

      {/* --- TARJETAS RESUMEN (HOY) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-200">
          <div className="flex justify-between items-start">
            <div><p className="text-green-100 text-sm font-medium mb-1">Ventas de Hoy</p><h3 className="text-4xl font-black">Bs. {stats.todayTotal.toFixed(2)}</h3></div>
            <div className="bg-white/20 p-2 rounded-lg"><TrendingUp size={24} className="text-white"/></div>
          </div>
          <div className="mt-4 text-xs font-medium bg-white/20 inline-block px-2 py-1 rounded">{stats.todayCount} transacciones</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div><p className="text-gray-500 text-sm font-medium mb-1">Fecha del Reporte</p><h3 className="text-2xl font-bold text-gray-800 capitalize">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3></div>
            <div className="bg-orange-50 p-2 rounded-lg"><Calendar size={24} className="text-orange-600"/></div>
          </div>
          <div className="mt-4 text-xs text-orange-500 font-bold">Visualizando solo movimientos de hoy</div>
        </div>
      </div>

      {/* --- NUEVO: HISTORIAL DE CIERRES DE CAJA (TURNOS) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden no-print">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
             <h3 className="font-black text-xl text-gray-800 flex items-center gap-2"><History size={24} className="text-blue-600"/> HISTORIAL DE TURNOS CERRADOS</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-gray-100 text-gray-600 text-xs uppercase border-b">
                        <th className="p-4">Fecha Cierre</th>
                        <th className="p-4">Responsable / Cajero</th>
                        <th className="p-4 text-right">Apertura</th>
                        <th className="p-4 text-right">Efectivo Final</th>
                        <th className="p-4 text-right">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {shifts.length > 0 ? (
                        shifts.map(shift => (
                            <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-600">
                                    <div className="font-bold text-gray-800">{new Date(shift.closedAt).toLocaleDateString()}</div>
                                    <div className="text-xs">{new Date(shift.closedAt).toLocaleTimeString()}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-100 p-1.5 rounded text-blue-600"><User size={12}/></div>
                                        <span className="font-bold uppercase">{shift.closedBy || 'Admin'}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right font-mono text-gray-500">Bs. {shift.openingAmount.toFixed(2)}</td>
                                <td className="p-4 text-right font-mono font-black text-green-600">Bs. {shift.finalCashCalculated?.toFixed(2) || '0.00'}</td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => onReprintZ(shift)}
                                        className="bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ml-auto transition-transform active:scale-95"
                                    >
                                        <Printer size={14}/> REIMPRIMIR
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">No hay cierres de caja registrados aún.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- ARQUEO DE CAJA (HOY) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-2 print:border-black">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center print:bg-white print:border-b-2 print:border-black">
          <div><h3 className="font-black text-xl text-gray-800 flex items-center gap-2"><Wallet size={24} className="text-gray-600"/> ARQUEO (HOY)</h3><p className="text-xs text-gray-500 mt-1 print:hidden">Resumen de cobros realizados HOY</p></div>
          <div className="text-right hidden print:block"><p className="text-xs">Impreso el:</p><p className="font-bold">{new Date().toLocaleString()}</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase border-b print:bg-gray-200 print:text-black print:border-black">
                <th className="p-4 font-bold">Responsable</th>
                <th className="p-4 font-bold text-center">Tx</th>
                <th className="p-4 font-bold text-right bg-green-50 text-green-800 print:bg-transparent print:text-black">Efectivo</th>
                <th className="p-4 font-bold text-right text-blue-800">QR</th>
                <th className="p-4 font-bold text-right text-purple-800">Tarjeta</th>
                <th className="p-4 font-bold text-right bg-gray-200 text-black">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 print:divide-gray-400">
              {waiterReport.length > 0 ? (
                waiterReport.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-800 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs print:hidden">{r.name.charAt(0)}</div>{r.name}</td>
                    <td className="p-4 text-center text-gray-500">{r.txCount}</td>
                    <td className="p-4 text-right font-mono font-bold text-green-700 bg-green-50/50 print:bg-transparent print:text-black">{r.cash > 0 ? `Bs. ${r.cash.toFixed(2)}` : '-'}</td>
                    <td className="p-4 text-right font-mono text-blue-700">{r.qr > 0 ? `Bs. ${r.qr.toFixed(2)}` : '-'}</td>
                    <td className="p-4 text-right font-mono text-purple-700">{r.card > 0 ? `Bs. ${r.card.toFixed(2)}` : '-'}</td>
                    <td className="p-4 text-right font-black text-lg bg-gray-50 print:bg-transparent">Bs. {r.total.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No hay ventas hoy.</td></tr>
              )}
            </tbody>
            {waiterReport.length > 0 && (
                <tfoot className="bg-gray-900 text-white print:bg-gray-300 print:text-black border-t-4 border-double border-gray-300">
                    <tr>
                        <td className="p-4 font-bold uppercase">TOTAL DÍA</td>
                        <td className="p-4 text-center font-bold">{waiterReport.reduce((a,b)=>a+b.txCount,0)}</td>
                        <td className="p-4 text-right font-bold">Bs. {waiterReport.reduce((a,b)=>a+b.cash,0).toFixed(2)}</td>
                        <td className="p-4 text-right font-bold">Bs. {waiterReport.reduce((a,b)=>a+b.qr,0).toFixed(2)}</td>
                        <td className="p-4 text-right font-bold">Bs. {waiterReport.reduce((a,b)=>a+b.card,0).toFixed(2)}</td>
                        <td className="p-4 text-right font-black text-xl">Bs. {stats.todayTotal.toFixed(2)}</td>
                    </tr>
                </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;