// src/components/RegisterControlView.jsx
import React, { useState } from 'react';
import { Lock, Unlock, DollarSign, Clock, User, AlertTriangle, CheckCircle, Wallet } from 'lucide-react';

const RegisterControlView = ({ session, onOpen, onClose, currentUser }) => {
  const [amount, setAmount] = useState('');

  const handleOpenSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    onOpen(parseFloat(amount));
  };

  return (
    <div className="animate-in fade-in max-w-4xl mx-auto">
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="text-orange-600"/> Control de Caja Chica
        </h2>
        <p className="text-gray-500 text-sm">Gestión de apertura y cierre de turnos.</p>
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
                  Al cerrar caja, se registrará la hora y el usuario responsable. 
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
             <form onSubmit={handleOpenSubmit} className="h-full flex flex-col justify-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Unlock size={20} className="text-blue-600"/> Nueva Apertura
                </h3>
                
                <label className="block text-sm font-medium text-gray-600 mb-2">Monto en Efectivo (Cambio)</label>
                <div className="relative mb-6">
                   <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={20}/>
                   <input 
                     type="number" 
                     step="0.10"
                     className="w-full pl-10 p-3 text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                     placeholder="0.00"
                     value={amount}
                     onChange={e => setAmount(e.target.value)}
                     autoFocus
                   />
                </div>

                <button 
                  type="submit"
                  disabled={!amount}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  ABRIR TURNO
                </button>
             </form>
           )}
        </div>

      </div>
    </div>
  );
};

export default RegisterControlView;