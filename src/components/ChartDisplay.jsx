import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, X } from 'lucide-react';

// COMPONENTE HELPER: Barra Animada Individual
const AnimatedBar = ({ prod, percent, index }) => {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        // Pequeño delay escalonado para efecto cascada
        const timer = setTimeout(() => {
            setWidth(percent);
        }, index * 100 + 100);
        return () => clearTimeout(timer);
    }, [percent, index]);

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 truncate w-[60%]">{prod.name}</span>
                <span className="font-bold text-gray-900">{prod.qty} un.</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{ width: `${width}%` }}
                ></div>
            </div>
            <div className="text-[10px] text-right text-gray-400">
                Gen: Bs. {(prod.total || 0).toFixed(2)}
            </div>
        </div>
    );
};

// COMPONENTE HELPER: Gráfico de Torta SVG
const DonutChart = ({ data }) => {
    const total = data.reduce((acc, curr) => acc + curr.qty, 0);
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#14b8a6', '#f43f5e', '#84cc16', '#a855f7'];

    let currentAngle = 0;

    return (
        <div className="flex flex-col items-center animate-in zoom-in duration-500">
            <div className="relative w-64 h-64 drop-shadow-xl">
                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                    {data.map((item, i) => {
                        const sliceAngle = (item.qty / total) * 360;
                        if (sliceAngle === 0) return null;

                        // Cálculo de coordenadas trigonométricas
                        const x1 = 50 + 50 * Math.cos(Math.PI * currentAngle / 180);
                        const y1 = 50 + 50 * Math.sin(Math.PI * currentAngle / 180);
                        const x2 = 50 + 50 * Math.cos(Math.PI * (currentAngle + sliceAngle) / 180);
                        const y2 = 50 + 50 * Math.sin(Math.PI * (currentAngle + sliceAngle) / 180);

                        // Determinar si es un arco grande (> 180 grados)
                        const largeArcFlag = sliceAngle > 180 ? 1 : 0;

                        // Construir path SVG
                        const pathData = total === item.qty
                            ? `M 50 50 L 50 0 A 50 50 0 1 1 49.99 0 Z` // Círculo casi completo
                            : `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                        const element = (
                            <path
                                key={i}
                                d={pathData}
                                fill={colors[i % colors.length]}
                                stroke="white"
                                strokeWidth="2"
                                className="hover:opacity-80 transition-opacity cursor-pointer"
                            >
                                <title>{item.name}: {item.qty} ({((item.qty / total) * 100).toFixed(1)}%)</title>
                            </path>
                        );

                        currentAngle += sliceAngle;
                        return element;
                    })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-lg border border-gray-100">
                        <span className="text-3xl font-black text-gray-800">{total}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Productos</span>
                    </div>
                </div>
            </div>

            {/* Leyenda */}
            <div className="grid grid-cols-2 gap-3 w-full mt-8">
                {data.map((prod, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: colors[i % colors.length] }}></div>
                        <span className="truncate flex-1 font-medium text-gray-600">{prod.name}</span>
                        <span className="font-bold text-gray-900">{prod.qty}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function ChartDisplay({ data, type, onClose, onToggleType, shiftInfo }) {
    if (!data || data.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-2xl w-full max-w-lg p-10 text-center shadow-2xl">
                    <p className="text-gray-400">No hay datos para mostrar.</p>
                    <button onClick={onClose} className="mt-4 text-indigo-600 font-bold hover:underline">Cerrar</button>
                </div>
            </div>
        );
    }

    const sortedData = [...data].sort((a, b) => b.qty - a.qty).slice(0, 10);
    const maxQty = Math.max(...sortedData.map(p => p.qty));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] scale-100 animate-in zoom-in-95 duration-200">
                <div className="bg-gray-900 p-4 text-white flex justify-between items-center shrink-0 shadow-lg z-10">
                    <div>
                        <h3 className="font-bold flex items-center gap-2">
                            {type === 'bar' ? <BarChart3 size={20} /> : <PieChart size={20} />}
                            Top 10 Productos
                        </h3>
                        {shiftInfo && <p className="text-xs text-gray-400">Turno: {shiftInfo}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        {onToggleType && (
                            <button
                                onClick={onToggleType}
                                className="hover:bg-gray-700 p-2 rounded-full transition-colors text-xs font-bold bg-gray-800 border border-gray-600 flex items-center gap-1"
                                title="Cambiar tipo de gráfico"
                            >
                                {type === 'bar' ? <PieChart size={16} /> : <BarChart3 size={16} />}
                                {type === 'bar' ? 'Torta' : 'Barras'}
                            </button>
                        )}
                        <button onClick={onClose} className="hover:bg-gray-700 p-2 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {type === 'pie' ? (
                        <DonutChart data={sortedData} />
                    ) : (
                        <div className="space-y-5">
                            {sortedData.map((prod, index) => (
                                <AnimatedBar
                                    key={index}
                                    prod={prod}
                                    percent={(prod.qty / maxQty) * 100}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-200 text-center text-[10px] text-gray-400 shrink-0">
                    Generado por Sistema Restaurante
                </div>
            </div>
        </div>
    );
}
