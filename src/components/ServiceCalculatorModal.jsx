// src/components/ServiceCalculatorModal.jsx
import React, { useState } from 'react';
import { X, Calculator, Zap, Coffee, Clock } from 'lucide-react';

export default function ServiceCalculatorModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [hours, setHours] = useState(1);
    const [minutes, setMinutes] = useState(0);
    const [mode, setMode] = useState('consumption'); // 'consumption' (70) | 'normal' (100)

    // TARIFAS
    const RATE_WITH_CONSUMPTION = 70;
    const RATE_NORMAL = 100;

    const currentRate = mode === 'consumption' ? RATE_WITH_CONSUMPTION : RATE_NORMAL;
    
    // Cálculo: Horas + (Minutos / 60)
    const totalTime = parseFloat(hours || 0) + (parseFloat(minutes || 0) / 60);
    const totalCost = totalTime * currentRate;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-900 w-full max-w-md rounded-3xl border border-gray-800 shadow-2xl overflow-hidden relative">
                
                {/* Header */}
                <div className="bg-black/50 p-4 flex justify-between items-center border-b border-gray-800">
                    <h2 className="text-white font-black text-xl flex items-center gap-2 tracking-wider">
                        <Calculator className="text-pink-500" /> COTIZADOR
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    
                    {/* Selector de Modo (Tarifas) */}
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setMode('consumption')}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'consumption' ? 'border-green-500 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-gray-700 bg-gray-800 text-gray-500 hover:border-gray-600'}`}
                        >
                            <Coffee size={24} />
                            <div className="text-center">
                                <span className="block font-bold text-sm">CON CONSUMO</span>
                                <span className="text-xs opacity-70">Bs. {RATE_WITH_CONSUMPTION} / hora</span>
                            </div>
                        </button>

                        <button 
                            onClick={() => setMode('normal')}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'normal' ? 'border-orange-500 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border-gray-700 bg-gray-800 text-gray-500 hover:border-gray-600'}`}
                        >
                            <Zap size={24} />
                            <div className="text-center">
                                <span className="block font-bold text-sm">SIN CONSUMO</span>
                                <span className="text-xs opacity-70">Bs. {RATE_NORMAL} / hora</span>
                            </div>
                        </button>
                    </div>

                    {/* Inputs de Tiempo */}
                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                        <div className="flex items-end gap-2 mb-2">
                            <Clock size={16} className="text-pink-500 mb-1"/>
                            <span className="text-xs font-bold text-gray-400 uppercase">Tiempo de uso</span>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-500 font-bold ml-1">HORAS</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    value={hours}
                                    onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full bg-black border border-gray-600 text-white text-center text-2xl font-black rounded-xl p-3 focus:border-pink-500 outline-none"
                                />
                            </div>
                            <div className="flex items-center text-gray-600 font-black text-xl mt-4">:</div>
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-500 font-bold ml-1">MINUTOS</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="59"
                                    step="15"
                                    value={minutes}
                                    onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full bg-black border border-gray-600 text-white text-center text-2xl font-black rounded-xl p-3 focus:border-pink-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resultado Total */}
                    <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 p-6 rounded-2xl border border-pink-500/30 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
                        <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">Costo Estimado</span>
                        <div className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(236,72,153,0.5)] my-2">
                            Bs. {totalCost.toFixed(2)}
                        </div>
                        <p className="text-[10px] text-gray-400">
                            {hours}h {minutes}m @ Bs.{currentRate}/h
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}