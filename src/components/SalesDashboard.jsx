// src/components/SalesDashboard.jsx - VERSIÓN OPTIMIZADA (Sin saltos de números)
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, isPersonalProject, ROOT_COLLECTION } from '../config/firebase';
import { TrendingUp, Calendar, CreditCard, DollarSign, Smartphone, Clock, Printer, Search } from 'lucide-react';

export default function SalesDashboard({ onReprintZ }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    cash: 0,
    digital: 0, // QR + Tarjeta
    count: 0
  });
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. DEFINIR EL INICIO DEL DÍA (00:00:00)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const startOfDayISO = startOfDay.toISOString();

        // 2. CONSULTA OPTIMIZADA: Solo traer ventas desde hoy a las 00:00
        const salesCol = isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`;
        // Nota: Firebase requiere que 'date' sea un string ISO comparable
        const qSales = query(
            collection(db, salesCol), 
            where('date', '>=', startOfDayISO),
            orderBy('date', 'desc')
        );

        const salesSnap = await getDocs(qSales);
        
        let total = 0;
        let cash = 0;
        let digital = 0;
        let count = 0;

        salesSnap.forEach(doc => {
          const sale = doc.data();
          const saleTotal = parseFloat(sale.total) || 0;
          total += saleTotal;
          count++;

          // Lógica de desglose de pagos
          if (sale.payments && Array.isArray(sale.payments)) {
             sale.payments.forEach(p => {
                const amount = parseFloat(p.amount) || 0;
                const method = (p.method || '').toLowerCase();
                if (method.includes('efectivo')) cash += amount;
                else digital += amount; // QR o Tarjeta
             });
             // Restar cambio si hubo
             if(sale.changeGiven) cash -= parseFloat(sale.changeGiven);
          } else {
             // Compatibilidad antigua
             const method = (sale.paymentMethod || 'efectivo').toLowerCase();
             if (method.includes('efectivo')) cash += saleTotal;
             else digital += saleTotal;
          }
        });

        setStats({ total, cash, digital, count });

        // 3. TRAER TURNOS CERRADOS (HISTORIAL)
        const registersCol = isPersonalProject ? 'cash_registers' : `${ROOT_COLLECTION}cash_registers`;
        const qShifts = query(
            collection(db, registersCol),
            where('status', '==', 'closed'),
            where('closedAt', '>=', startOfDayISO), // Solo turnos cerrados hoy
            orderBy('closedAt', 'desc')
        );
        const shiftsSnap = await getDocs(qShifts);
        setShifts(shiftsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (error) {
        console.error("Error calculando reporte:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 animate-pulse">
            <TrendingUp size={48} className="mb-4 text-orange-200"/>
            <p>Calculando ventas del día...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* TARJETA PRINCIPAL VERDE */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-green-100 text-sm font-bold uppercase tracking-wider mb-1">Ventas de Hoy</p>
                <h2 className="text-5xl font-black tracking-tight">Bs. {stats.total.toFixed(2)}</h2>
            </div>
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <TrendingUp size={32} className="text-white"/>
            </div>
        </div>
        <div className="flex gap-4 mt-4 pt-4 border-t border-white/20">
            <div className="px-3 py-1 bg-white/10 rounded-lg flex items-center gap-2">
                <div className="bg-white p-1 rounded-full text-green-600"><DollarSign size={12} strokeWidth={4}/></div>
                <div>
                    <p className="text-[10px] text-green-100 uppercase">Efectivo</p>
                    <p className="font-bold text-sm">Bs. {stats.cash.toFixed(2)}</p>
                </div>
            </div>
            <div className="px-3 py-1 bg-white/10 rounded-lg flex items-center gap-2">
                <div className="bg-white p-1 rounded-full text-green-600"><Smartphone size={12} strokeWidth={4}/></div>
                <div>
                    <p className="text-[10px] text-green-100 uppercase">QR / Tarjeta</p>
                    <p className="font-bold text-sm">Bs. {stats.digital.toFixed(2)}</p>
                </div>
            </div>
            <div className="ml-auto flex items-end">
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">{stats.count} Transacciones</span>
            </div>
        </div>
      </div>

      {/* HISTORIAL DE TURNOS CERRADOS */}
      <div>
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-lg">
              <Clock className="text-orange-500"/> Historial de Turnos Cerrados (Hoy)
          </h3>
          
          {shifts.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                  <p>No se han cerrado cajas hoy todavía.</p>
              </div>
          ) : (
              <div className="grid gap-3">
                  {shifts.map(shift => (
                      <div key={shift.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                          <div>
                              <div className="flex items-center gap-2 mb-1">
                                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded uppercase">{new Date(shift.closedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  <span className="font-bold text-gray-800">{shift.closedBy}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                  Apertura: Bs. {shift.openingAmount} | Ventas: Bs. {(shift.finalSalesStats?.cashSales + shift.finalSalesStats?.digitalSales || 0).toFixed(2)}
                              </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                              <div>
                                  <p className="text-[10px] text-gray-400 uppercase font-bold">Cierre Total</p>
                                  <p className="text-lg font-black text-green-600">Bs. {Number(shift.finalCashCalculated).toFixed(2)}</p>
                              </div>
                              {onReprintZ && (
                                  <button 
                                    onClick={() => onReprintZ(shift)}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    title="Reimprimir Reporte Z"
                                  >
                                      <Printer size={20}/>
                                  </button>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
}