// src/components/SalesDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, DollarSign, Clock, User, 
  ShoppingBag, ChevronRight, AlertCircle 
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db, isPersonalProject, ROOT_COLLECTION } from '../config/firebase';

const SalesDashboard = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ todayTotal: 0, todayCount: 0, allTotal: 0 });

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const salesColName = isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`;
        // Traemos las últimas 100 ventas ordenadas por fecha
        const q = query(collection(db, salesColName), orderBy('date', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);
        
        const salesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSales(salesData);

        // --- CÁLCULOS MATEMÁTICOS ---
        const todayStr = new Date().toDateString(); // "Mon Dec 01 2025"
        
        let todaySum = 0;
        let todayCnt = 0;
        let totalSum = 0;

        salesData.forEach(sale => {
          const saleDate = new Date(sale.date).toDateString();
          totalSum += Number(sale.total);
          
          if (saleDate === todayStr) {
            todaySum += Number(sale.total);
            todayCnt += 1;
          }
        });

        setStats({
          todayTotal: todaySum,
          todayCount: todayCnt,
          allTotal: totalSum
        });

      } catch (error) {
        console.error("Error cargando ventas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Cargando reporte financiero...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- TARJETAS DE RESUMEN --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="mt-4 text-xs text-gray-400">Total registrado en sistema</div>
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

      {/* --- TABLA DE ÚLTIMAS VENTAS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Clock size={18} className="text-gray-400"/> Últimas Transacciones
          </h3>
          <span className="text-xs text-gray-400">Mostrando últimas 100</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b">
                <th className="p-4 font-medium">Hora</th>
                <th className="p-4 font-medium">Atendido por</th>
                <th className="p-4 font-medium">Detalle</th>
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
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                          {sale.staffName ? sale.staffName.charAt(0) : '?'}
                        </div>
                        <span className="font-medium text-gray-700">{sale.staffName || 'Anónimo'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {sale.items.map((item, idx) => (
                          <div key={idx} className="text-gray-600 text-xs">
                            <span className="font-bold">{item.qty}x</span> {item.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-gray-800">
                      Bs. {Number(sale.total).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingBag size={40} className="opacity-20"/>
                      <p>No hay ventas registradas aún.</p>
                    </div>
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