// src/components/AttendanceView.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, isPersonalProject, ROOT_COLLECTION } from '../config/firebase';
import { Calendar, Clock, DollarSign, User, Trash2, AlertCircle } from 'lucide-react';

export default function AttendanceView() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('Todos'); // 'Todos', 'Por Hora', 'Fijo'

  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true);
      try {
        const shiftsCol = isPersonalProject ? 'work_shifts' : `${ROOT_COLLECTION}work_shifts`;
        // Traemos los últimos 100 turnos ordenados por fecha
        const q = query(collection(db, shiftsCol), orderBy('startTime', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setShifts(data);
      } catch (error) {
        console.error("Error cargando asistencias:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShifts();
  }, []);

  const handleDeleteShift = async (id) => {
      if(!window.confirm("¿Borrar este registro de asistencia?")) return;
      try {
          const shiftsCol = isPersonalProject ? 'work_shifts' : `${ROOT_COLLECTION}work_shifts`;
          await deleteDoc(doc(db, shiftsCol, id));
          setShifts(prev => prev.filter(s => s.id !== id));
      } catch (e) { alert("Error al borrar"); }
  };

  const calculateDuration = (start, end) => {
      if (!end) return "En curso...";
      const diff = new Date(end) - new Date(start);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
  };

  const calculatePay = (start, end, rate) => {
      if (!end || !rate) return 0;
      const diffHours = (new Date(end) - new Date(start)) / (1000 * 60 * 60);
      return (diffHours * rate).toFixed(2);
  };

  const filteredShifts = filterType === 'Todos' ? shifts : shifts.filter(s => s.contractType === filterType);

  return (
    <div className="animate-in fade-in pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Calendar className="text-blue-600"/> Control de Asistencia</h2>
            <p className="text-gray-500 text-sm">Registro automático de entradas y salidas</p>
        </div>
        <div className="flex bg-white rounded-lg border p-1">
            {['Todos', 'Por Hora', 'Fijo'].map(type => (
                <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-1 rounded-md text-sm font-bold transition-colors ${filterType === type ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>{type}</button>
            ))}
        </div>
      </div>

      {loading ? (
          <div className="text-center py-10 text-gray-400">Cargando registros...</div>
      ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                <tr>
                  <th className="p-4">Personal</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Entrada</th>
                  <th className="p-4">Salida</th>
                  <th className="p-4">Duración</th>
                  <th className="p-4 text-right">Pago Est.</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredShifts.map(shift => (
                  <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">{shift.staffName.charAt(0)}</div>
                        {shift.staffName}
                    </td>
                    <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${shift.contractType === 'Por Hora' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {shift.contractType || 'Fijo'}
                        </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{new Date(shift.startTime).toLocaleString()}</td>
                    <td className="p-4 text-sm text-gray-600">
                        {shift.endTime ? new Date(shift.endTime).toLocaleString() : <span className="text-green-600 font-bold animate-pulse">● Activo</span>}
                    </td>
                    <td className="p-4 font-mono text-sm font-bold text-blue-600">
                        {calculateDuration(shift.startTime, shift.endTime)}
                    </td>
                    <td className="p-4 text-right font-bold text-gray-800">
                        {shift.contractType === 'Por Hora' && shift.endTime ? (
                            <span className="text-green-600">Bs. {calculatePay(shift.startTime, shift.endTime, shift.hourlyRate)}</span>
                        ) : (
                            <span className="text-gray-300">-</span>
                        )}
                    </td>
                    <td className="p-4 text-right">
                        <button onClick={() => handleDeleteShift(shift.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
                {filteredShifts.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-400">No hay registros recientes.</td></tr>}
              </tbody>
            </table>
          </div>
      )}
    </div>
  );
}