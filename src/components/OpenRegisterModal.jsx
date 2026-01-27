// src/components/OpenRegisterModal.jsx - CORREGIDO (Sin error de DialogTitle)
import React, { useState } from 'react';
import { DollarSign, X, ArrowRight, Lock } from 'lucide-react';

export default function OpenRegisterModal({ isOpen, onClose, onOpenRegister }) {
    const [amount, setAmount] = useState('');
    const [activeTeam, setActiveTeam] = useState('');
    const [note, setNote] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount) return;
        // Enviamos el monto, el equipo y la nota
        onOpenRegister(parseFloat(amount), activeTeam ? activeTeam.split(',').map(s => s.trim()) : [], note);
        setAmount('');
        setActiveTeam('');
        setNote('');
    };

    return (
        // 1. role="dialog" y aria-modal="true" para accesibilidad
        // 2. aria-labelledby="modal-title" conecta con el h3
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="modal-title">

            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden transform transition-all scale-100">

                {/* ENCABEZADO */}
                <div className="bg-green-600 p-6 text-center relative">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                        <Lock className="text-white" size={32} />
                    </div>
                    {/* ID "modal-title" vinculado al aria-labelledby */}
                    <h3 id="modal-title" className="text-2xl font-black text-white tracking-tight">APERTURA DE CAJA</h3>
                    <p className="text-green-100 text-xs uppercase font-medium tracking-widest mt-1">Inicia tu turno de ventas</p>

                    <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors" aria-label="Cerrar">
                        <X size={24} />
                    </button>
                </div>

                {/* FORMULARIO */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Monto Inicial (Base)</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-green-600 transition-colors">Bs.</span>
                                <input
                                    type="number"
                                    step="0.50"
                                    placeholder="0.00"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-800 text-lg outline-none focus:border-green-500 focus:bg-white transition-all"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Equipo de Turno (Opcional)</label>
                            <input
                                type="text"
                                placeholder="Ej: Juan, Maria..."
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-medium text-gray-700 outline-none focus:border-green-500 focus:bg-white transition-all"
                                value={activeTeam}
                                onChange={(e) => setActiveTeam(e.target.value)}
                            />
                            <p className="text-[10px] text-gray-400 mt-1 ml-1">Separa los nombres con comas.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Glosa / Detalle (Opcional)</label>
                            <textarea
                                placeholder="Ej: Turno Tarde, Lluvia, Festival..."
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-medium text-gray-700 outline-none focus:border-green-500 focus:bg-white transition-all resize-none"
                                rows="2"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!amount}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ABRIR CAJA <ArrowRight size={20} />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}