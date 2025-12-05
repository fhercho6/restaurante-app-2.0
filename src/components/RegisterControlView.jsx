// src/components/RegisterControlView.jsx
import React, { useState } from 'react';
import { Lock, Unlock, DollarSign, Clock, User, AlertTriangle, CheckCircle, Wallet, Users } from 'lucide-react';

// AHORA RECIBIMOS "staff" COMO PROPIEDAD
const RegisterControlView = ({ session, onOpen, onClose, currentUser, staff }) => {
  const [amount, setAmount] = useState('');
  const [selectedStaff, setSelectedStaff] = useState([]);

  // Manejar selección de personal
  const toggleStaff = (memberId) => {
    if (selectedStaff.includes(memberId)) {
      setSelectedStaff(selectedStaff.filter(id => id !== memberId));
    } else {
      setSelectedStaff([...selectedStaff, memberId]);
    }
  };

  const handleOpenSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    
    // Filtramos los objetos completos del personal seleccionado para guardarlos en la sesión
    const activeTeam = staff.filter(m => selectedStaff.includes(m.id)).map(m => ({
        id: m.id,
        name: m.name,
        role: m.role
    }));

    onOpen(parseFloat(amount), activeTeam);
    setAmount('');
    setSelectedStaff([]);
  };

  return (
    <div className="animate-in fade-in max-w-4xl mx-auto pb-20">
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="text-orange-600"/> Control de Caja Chica
        </h2>
        <p className="text-gray-500 text-sm">Gestión de apertura, cierre y asistencia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- ESTADO ACTUAL --- */}
        <div className={`p-6 rounded-2xl shadow-lg text-white ${session ? 'bg-green-600' : 'bg-gray-800'}`}>
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full">
                   {session ? <Unlock size={32}/> : <Lock size={32}/>}
                </div>
                <div>
                   <h3 className="font-black text-xl uppercase tracking-wider">
                     {session ? 'CAJA ABIERTA' : 'CAJA CERRADA'}
                   </h3>
                   <p className="text-sm opacity-80">Estado del sistema</p>
                </div>
             </div>
             {session && <CheckCircle size={40} className="text-green-200 opacity-50"/>}
          </div>

          {session ? (
            <div className="space-y-4 bg-white/10 p-4 rounded-xl">
               <div className="flex justify-between border-b border-white/20 pb-2">
                  <span className="flex items-center gap-2 text-sm"><User size={14}/> Responsable:</span>
                  <span className="font-bold">{session.openedBy}</span>
               </div>
               <div className="flex justify-between border-b border-white/20 pb-2">
                  <span className="flex items-center gap-2 text-sm"><Clock size={14}/> Apertura:</span>
                  <span className="font-mono">{new Date(session.openedAt).toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center pt-2">
                  <span className="flex items-center gap-2 text-sm"><DollarSign size={14}/> Monto Inicial:</span>
                  <span className="text-2xl font-black bg-white text-green-700 px-3 py-1 rounded-lg">
                    Bs. {session.openingAmount}
                  </span>
               </div>
               
               {/* MOSTRAR EQUIPO ACTIVO */}
               {session.activeTeam && session.activeTeam.length > 0 && (
                   <div className="pt-2 border-t border-white/20">
                       <span className="flex items-center gap-2 text-sm mb-2"><Users size={14}/> Equipo en Turno:</span>
                       <div className="flex flex-wrap gap-1">
                           {session.activeTeam.map((s, idx) => (
                               <span key={idx} className="text-[10px] bg-black/20 px-2 py-1 rounded border border-white/10">
                                   {s.name}
                               </span>
                           ))}
                       </div>
                   </div>
               )}
            </div>
          ) : (
            <div className="text-center py-8 opacity-60">
               <p>No hay turno activo actualmente.</p>
               <p className="text-xs mt-2">Inicia apertura para comenzar a vender.</p>
            </div>
          )}
        </div>

        {/* --- ACCIONES (ABRIR / CERRAR) --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
           {session ? (
             <div className="h-full flex flex-col justify-center text-center">
                <AlertTriangle size={48} className="mx-auto text-orange-500 mb-4"/>
                <h3 className="text-xl font-bold text-gray-800 mb-2">¿Finalizar Turno?</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Al cerrar caja, se registrará la hora y el equipo. 
                  Asegúrate de haber realizado el arqueo físico.
                </p>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Lock size={20}/> CERRAR CAJA AHORA
                </button>
             </div>
           ) : (
             <form onSubmit={handleOpenSubmit} className="h-full flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Unlock size={20} className="text-blue-600"/> Nueva Apertura
                </h3>
                
                <label className="block text-sm font-medium text-gray-600 mb-2">Monto en Efectivo (Cambio)</label>
                <div className="relative mb-4">
                   <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={20}/>
                   <input 
                     type="number" 
                     step="0.10"
                     className="w-full pl-10 p-3 text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                     placeholder="0.00"
                     value={amount}
                     onChange={e => setAmount(e.target.value)}
                     required
                   />
                </div>

                {/* LISTA DE ASISTENCIA */}
                <div className="mb-6 flex-1 overflow-y-auto max-h-48 border rounded-xl p-3 bg-gray-50">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 sticky top-0 bg-gray-50 pb-1">
                        Registrar Personal Presente:
                    </label>
                    <div className="space-y-2">
                        {staff.map(member => (
                            <div key={member.id} className="flex items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer" onClick={() => toggleStaff(member.id)}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${selectedStaff.includes(member.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                    {selectedStaff.includes(member.id) && <CheckCircle size={14} className="text-white"/>}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-800">{member.name}</p>
                                    <p className="text-[10px] text-gray-500">{member.role}</p>
                                </div>
                            </div>
                        ))}
                        {staff.length === 0 && <p className="text-xs text-gray-400 italic text-center">No hay personal registrado.</p>}
                    </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  ABRIR TURNO ({selectedStaff.length} Personal)
                </button>
             </form>
           )}
        </div>

      </div>
    </div>
  );
};

export default RegisterControlView;