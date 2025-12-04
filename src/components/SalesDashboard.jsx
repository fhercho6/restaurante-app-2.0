// src/components/SalesDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, DollarSign, Clock, User, 
  ShoppingBag, Wallet, RefreshCw 
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'; // <--- Usamos onSnapshot en vez de getDocs
import { db, isPersonalProject, ROOT_COLLECTION } from '../config/firebase';

const SalesDashboard = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ todayTotal: 0, todayCount: 0, allTotal: 0 });
  const [waiterReport, setWaiterReport] = useState([]);

  useEffect(() => {
    // Definir la colección correcta
    const salesColName = isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`;
    
    // Traemos las últimas 100 ventas (Escucha en VIVO)
    const q = query(collection(db, salesColName), orderBy('date', 'desc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSales(salesData);

        // --- CÁLCULOS EN VIVO ---
        const todayObj = new Date();
        const todayStr = todayObj.toDateString(); 
        
        let todaySum = 0;
        let todayCnt = 0;
        let totalSum = 0;

        const reportMap = {};

        salesData.forEach(sale => {
          // Convertir fecha de venta a local
          const saleDateObj = new Date(sale.date);
          const saleDateStr = saleDateObj.toDateString();
          
          const saleTotal = Number(sale.total) || 0;
          totalSum += saleTotal; // Suma histórica total
          
          // FILTRO: ¿Es venta de HOY?
          if (saleDateStr === todayStr) {
            todaySum += saleTotal;
            todayCnt += 1;

            const waiter = sale.staffName || 'Caja General';
            
            // Inicializar garzón en el reporte si no existe
            if (!reportMap[waiter]) {
              reportMap[waiter] = { 
                name: waiter, 
                cash: 0, 
                qr: 0, 
                card: 0, 
                total: 0,
                txCount: 0
              };
            }

            reportMap[waiter].txCount += 1;
            reportMap[waiter].total += saleTotal;

            // Desglosar pagos (Soporte para Multi-Pago y Legacy)
            if (sale.payments && Array.isArray(sale.payments)) {
              sale.payments.forEach(p => {
                const amount = parseFloat(p.amount) || 0;
                if (p.method === 'Efectivo') reportMap[waiter].cash += amount;
                if (p.method === 'QR') reportMap[waiter].qr += amount;
                if (p.method === 'Tarjeta') reportMap[waiter].card += amount;
              });
              
              // Restar el cambio entregado del efectivo para cuadrar caja
              if (sale.changeGiven > 0) {
                reportMap[waiter].cash -= parseFloat(sale.changeGiven);
              }

            } else {
              // Soporte para ventas antiguas
              const method = sale.paymentMethod || 'Efectivo';
              const received = parseFloat(sale.amountReceived) || saleTotal;
              const change = parseFloat(sale.changeGiven) || 0;
              
              if (method === 'Efectivo') reportMap[waiter].cash += (received - change);
              else if (method === 'QR') reportMap[waiter].qr += saleTotal;
              else reportMap[waiter].card += saleTotal;
            }
          }
        });

        setStats({
          todayTotal: todaySum,
          todayCount: todayCnt,
          allTotal: totalSum
        });

        setWaiterReport(Object.values(reportMap));
        setLoading(false);
    });

    return () => unsubscribe(); // Limpiar suscripción al salir
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500 flex flex-col items-center"><RefreshCw className="animate-spin mb-2"/> Cargando movimientos...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* --- TARJETAS DE RESUMEN GENERAL --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        {/* Tarjeta 1: Ventas HOY */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Ventas de Hoy</p>
              <h3 className="text-3xl font-bold">Bs. {stats.todayTotal.toFixed(2)}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg"><TrendingUp size={24} className="text-white"/></div>
          </div>
          <div className="mt-4 text-xs font-medium bg-white/20 inline-block px-2 py-1 rounded">
            {stats.todayCount} transacciones hoy
          </div>
        </div>

        {/* Tarjeta 2: Histórico */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Acumulado Histórico</p>
              <h3 className="text-3xl font-bold text-gray-800">Bs. {stats.allTotal.toFixed(2)}</h3>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg"><DollarSign size={24} className="text-blue-600"/></div>
          </div>
          <div className="mt-4 text-xs text-gray-400">Últimas 100 ventas</div>
        </div>

        {/* Tarjeta 3: Fecha */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Fecha Actual</p>
              <h3 className="text-xl font-bold text-gray-800 capitalize">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg"><Calendar size={24} className="text-orange-600"/></div>
          </div>
          <div className="mt-4 text-xs text-orange-500 font-bold">Corte al momento</div>
        </div>
      </div>

      {/* --- ARQUEO DE CAJA (Solo Ventas de HOY) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-2 print:border-black">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center print:bg-white print:border-b-2 print:border-black">
          <div>
             <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
               <Wallet size={24} className="text-gray-600"/> ARQUEO DE CAJA
             </h3>
             <p className="text-xs text-gray-500 mt-1 print:hidden">Resumen de cobros realizados HOY</p>
          </div>
          <div className="text-right hidden print:block">
             <p className="text-xs">Impreso el:</p>
             <p className="font-bold">{new Date().toLocaleString()}</p>
          </div>
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
                    <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs print:hidden">
                            {r.name.charAt(0)}
                        </div>
                        {r.name}
                    </td>
                    <td className="p-4 text-center text-gray-500">{r.txCount}</td>
                    <td className="p-4 text-right font-mono font-bold text-green-700 bg-green-50/50 print:bg-transparent print:text-black">
                        {r.cash > 0 ? `Bs. ${r.cash.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-4 text-right font-mono text-blue-700">
                        {r.qr > 0 ? `Bs. ${r.qr.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-4 text-right font-mono text-purple-700">
                        {r.card > 0 ? `Bs. ${r.card.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-4 text-right font-black text-lg bg-gray-50 print:bg-transparent">
                        Bs. {r.total.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No hay ventas registradas con fecha de hoy.</td></tr>
              )}
            </tbody>
            {waiterReport.length > 0 && (
                <tfoot className="bg-gray-900 text-white print:bg-gray-300 print:text-black border-t-4 border-double border-gray-300">
                    <tr>
                        <td className="p-4 font-bold uppercase">TOTALES</td>
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

      {/* --- HISTORIAL COMPLETO (Muestra todo para verificar) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Clock size={18} className="text-gray-400"/> Historial de Movimientos
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b">
                <th className="p-4 font-medium">Fecha/Hora</th>
                <th className="p-4 font-medium">Garzón / Cajero</th>
                <th className="p-4 font-medium">Detalle</th>
                <th className="p-4 font-medium text-right">Pago</th>
                <th className="p-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500 whitespace-nowrap">
                      {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <div className="text-[10px] text-gray-300">{new Date(sale.date).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                         <span className="font-bold text-gray-700">{sale.staffName || 'Anónimo'}</span>
                         {sale.cashier && <span className="text-[10px] text-gray-400">Cobró: {sale.cashier}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                       <div className="text-xs text-gray-500 max-w-[200px] truncate">
                          {sale.items.map(i => `${i.qty} ${i.name}`).join(', ')}
                       </div>
                    </td>
                    <td className="p-4 text-right">
                        {sale.payments ? (
                            <div className="flex flex-col items-end gap-1">
                                {sale.payments.map((p, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                                        {p.method}: {Number(p.amount).toFixed(0)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{sale.paymentMethod || 'Efectivo'}</span>
                        )}
                    </td>
                    <td className="p-4 text-right font-bold text-gray-800">
                      Bs. {Number(sale.total).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400">
                    No hay datos de ventas en la base de datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;