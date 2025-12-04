// src/components/OpenRegisterModal.jsx
import React, { useState } from 'react';
import { Lock, Unlock, DollarSign } from 'lucide-react';

const OpenRegisterModal = ({ isOpen, onClose, onOpenRegister }) => {
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const initialAmount = parseFloat(amount);
    if (isNaN(initialAmount)) {
        alert("Ingresa un monto válido");
        return;
    }
    onOpenRegister(initialAmount);
    setAmount('');
  };

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        
        <div className="bg-orange-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                <Lock size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">CAJA CERRADA</h2>
            <p className="text-orange-100 text-sm mt-1">Debes realizar la apertura para vender</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">
                Monto Inicial (Caja Chica / Cambio)
            </label>
            
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="text-gray-400" size={20}/>
                </div>
                <input 
                    type="number" 
                    autoFocus
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-xl font-bold text-gray-900 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none transition-colors"
                    placeholder="0.00"
                    min="0"
                    step="0.10"
                    required
                />
            </div>

            <div className="flex gap-3">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    className="flex-1 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    <Unlock size={18}/> ABRIR CAJA
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default OpenRegisterModal;