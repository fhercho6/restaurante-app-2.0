// src/components/ServiceCalculatorModal.jsx - FORMATO DE TIEMPO CLARO (h m)
import React, { useState } from 'react';
import { X, Calculator, Zap, Coffee, ArrowRight, Hourglass } from 'lucide-react';

export default function ServiceCalculatorModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    // Horas por defecto: Inicio (Ahora), Fin (Ahora + 1 hora)
    const now = new Date();
    const nowStr = now.toTimeString().slice(0, 5); // "HH:MM"
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5);

    const [startTime, setStartTime] = useState(nowStr);
    const [endTime, setEndTime] = useState(nextHour);
    const [mode, setMode] = useState('consumption'); // 'consumption' (70) | 'normal' (100)

    // TARIFAS
    const RATE_WITH_CONSUMPTION = 70;
    const RATE_NORMAL = 100;

    const currentRate = mode === 'consumption' ? RATE_WITH_CONSUMPTION : RATE_NORMAL;
    
    // --- LÓGICA DE CÁLCULO ---
    const calculateDiff = () => {
        if (!startTime || !endTime) return { hours: 0, minutes: 0, totalHours: 0 };

        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        let startMinutes = startH * 60 + startM;
        let endMinutes = endH * 60 + endM;

        // Si la hora fin es menor a la inicio (ej: 23:00 a 01:00), sumamos 24h
        if (endMinutes < startMinutes) {
            endMinutes += 1440;
        }

        const diffMinutes = endMinutes - startMinutes;
        const diffH = Math.floor(diffMinutes / 60);
        const diffM = diffMinutes % 60;
        
        return { 
            hours: diffH, 
            minutes: diffM, 
            totalHours: diffMinutes / 60 
        };
    };

    const { hours, minutes, totalHours } = calculateDiff();
    const totalCost = totalHours * currentRate;

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
                    
                    {/* Selector de Modo */}
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

                    {/* Panel de Tiempo */}
                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                        {/* Inputs de Hora */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase block mb-1">Inicio</label>
                                <input 
                                    type="time" 
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full bg-black border border-gray-600 text-white text-center text-xl font-bold rounded-xl p-3 focus:border-pink-500 outline-none transition-colors"
                                />
                            </div>
                            <div className="text-gray-600 pt-6"><ArrowRight size={20}/></div>
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase block mb-1">Fin</label>
                                <input 
                                    type="time" 
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full bg-black border border-gray-600 text-white text-center text-xl font-bold rounded-xl p-3 focus:border-pink-500 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* --- TIEMPO TOTAL CON FORMATO h / m --- */}
                        <div className="pt-4 border-t border-gray-700 text-center">
                            <p className="text-[10px] text-pink-400 font-bold uppercase mb-2 flex justify-center items-center gap-1">
                                <Hourglass size={10}/> Tiempo Total
                            </p>
                            
                            {/* Aquí está el cambio visual importante */}
                            <div className="flex justify-center items-baseline gap-3 text-white">
                                <div>
                                    <span className="text-5xl font-black tracking-tighter">{hours}</span>
                                    <span className="text-2xl font-bold text-gray-500 ml-1">h</span>
                                </div>
                                <div>
                                    <span className="text-5xl font-black tracking-tighter">{minutes}</span>
                                    <span className="text-2xl font-bold text-gray-500 ml-1">m</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Resultado Costo */}
                    <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 p-5 rounded-2xl border border-pink-500/30 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
                        <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">Total a Pagar</span>
                        <div className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(236,72,153,0.5)] my-1">
                            Bs. {totalCost.toFixed(2)}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}