// src/components/LandingPage.jsx - EDICIÓN NAVIDAD LIMPIA + CALCULADORA PEQUEÑA
import React, { useState } from 'react';
import { ChefHat, User, Settings, UtensilsCrossed, PartyPopper, Sparkles, Clock, Wine, Star, Calculator } from 'lucide-react';
import ServiceCalculatorModal from './ServiceCalculatorModal';

// Componente simple para la nieve de fondo
// Componente de Confeti para Año Nuevo
const Confetti = () => {
  const particles = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((_, i) => {
        const left = `${Math.random() * 100}%`;
        const duration = `${Math.random() * 3 + 3}s`;
        const delay = `${Math.random() * 2}s`;
        const size = `${Math.random() * 6 + 4}px`;
        const color = ['bg-yellow-400', 'bg-blue-400', 'bg-white', 'bg-purple-400'][Math.floor(Math.random() * 4)];
        return (
          <div
            key={i}
            className={`absolute rounded-xs opacity-80 animate-[snowfall_linear_infinite] ${color}`}
            style={{
              left,
              top: '-10px',
              width: size,
              height: size,
              animationDuration: duration,
              animationDelay: delay,
              '--tw-translate-y': '110vh',
              '--tw-translate-x': `${Math.random() * 40 - 20}px`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          ></div>
        );
      })}
      <style jsx>{`
        @keyframes snowfall {
          to {
            transform: translateY(var(--tw-translate-y)) translateX(var(--tw-translate-x)) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};


export default function LandingPage({ appName, logo, onSelectClient, onSelectStaff, onSelectAdmin }) {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden font-sans bg-[#050505]">

      {/* 1. FONDO ELEGANTE AÑO NUEVO */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-yellow-600/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-blue-900/40 blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-900/30 blur-[100px] animate-pulse delay-500"></div>
      </div>
      <Confetti />

      {/* BARRA SUPERIOR (HEADER) */}
      <div className="absolute top-0 inset-x-0 h-16 z-20 flex items-center justify-between px-6 bg-gradient-to-b from-black/90 to-transparent border-b border-yellow-500/30 shadow-[0_5px_15px_-5px_rgba(234,179,8,0.2)]">
        {/* Decoración izquierda */}
        <div className="flex gap-2 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">
          <Sparkles size={20} className="animate-pulse" /><Star size={16} className="mt-1 animate-spin-slow" />
        </div>

        {/* BOTONES DERECHA */}
        <div className="flex items-center gap-4">

          {/* --- BOTÓN CALCULADORA (PEQUEÑO) --- */}
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="group relative p-2 text-yellow-200 hover:text-white transition-all hover:scale-110"
            title="Cotizar Costo"
          >
            <Calculator size={24} className="drop-shadow-[0_0_5px_rgba(253,224,71,0.8)]" />
          </button>

          {/* BOTÓN ADMIN */}
          <button
            onClick={onSelectAdmin}
            className="relative group p-2 text-gray-400 hover:text-white transition-all hover:scale-110"
            title="Acceso Administrativo"
          >
            <div className="absolute -top-1 -right-1 transform rotate-12 text-yellow-500 drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]">
              <Clock size={16} />
            </div>
            <Settings size={24} className="group-hover:rotate-90 transition-transform duration-500 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
          </button>
        </div>
      </div>

      {/* 3. CONTENIDO CENTRAL */}
      <div className="relative z-30 flex flex-col items-center w-full max-w-md px-6 text-center animate-in fade-in zoom-in duration-700 mt-16">

        {/* LOGO CENTRAL */}
        <div className="mb-6 relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500 to-amber-700 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-1000 rounded-full"></div>
          <div className="relative w-32 h-32 bg-black/80 backdrop-blur-md border border-yellow-500/50 rounded-full flex items-center justify-center shadow-[0_0_40px_-5px_rgba(234,179,8,0.4)] p-4 ring-1 ring-yellow-400/30">
            {logo ? (
              <img src={logo} alt="Logo" className="w-full h-full object-contain drop-shadow-lg" />
            ) : (
              <ChefHat size={64} className="text-yellow-100 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" strokeWidth={1.5} />
            )}
          </div>
        </div>

        {/* TÍTULO */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <PartyPopper size={28} className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] -rotate-12" />
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-amber-200 tracking-tight drop-shadow-[0_0_15px_rgba(234,179,8,0.3)] uppercase relative">
            {appName || 'LicoBar'}
          </h1>
          <Wine size={28} className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] rotate-12" />
        </div>
        <p className="text-sm text-yellow-600/80 font-bold tracking-[0.3em] uppercase mb-10 flex items-center gap-2 before:h-[1px] before:w-6 before:bg-yellow-700 after:h-[1px] after:w-6 after:bg-yellow-700">
          Happy New Year 2026
        </p>

        {/* --- BOTONES DE ACCIÓN PRINCIPALES --- */}
        <div className="w-full space-y-4">

          {/* BOTÓN 1: CLIENTES */}
          <button
            onClick={onSelectClient}
            className="group w-full relative bg-black/60 text-white py-5 rounded-xl font-black text-lg tracking-wide 
                border border-yellow-500/40 hover:border-yellow-400 transition-all duration-500
                shadow-[0_0_20px_-5px_rgba(234,179,8,0.3)]
                hover:shadow-[0_0_30px_-5px_rgba(234,179,8,0.6)]
                active:scale-95 flex items-center justify-center gap-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <UtensilsCrossed size={24} className="text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">VER MENÚ</span>
            <Sparkles size={24} className="text-yellow-200 drop-shadow-[0_0_5px_rgba(253,224,71,0.8)] group-hover:rotate-180 transition-transform duration-700" />
          </button>

          {/* BOTÓN 2: PERSONAL */}
          <button
            onClick={onSelectStaff}
            className="group w-full relative bg-black/60 text-white py-5 rounded-xl font-bold text-lg tracking-widest uppercase 
                border border-blue-500/40 hover:border-blue-400 transition-all duration-500
                shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]
                hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)]
                active:scale-95 flex items-center justify-center gap-4"
          >
            <div className="absolute top-[-8px] right-4 transform rotate-12 text-blue-500 drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]">
              <Clock size={16} />
            </div>
            <User size={24} className="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]" />
            <span className="text-gray-200">PERSONAL</span>
            <Star size={24} className="text-blue-300 drop-shadow-[0_0_5px_rgba(147,197,253,0.8)] group-hover:scale-125 transition-transform" />
          </button>

        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-6 text-white/20 text-[10px] uppercase font-bold tracking-[0.3em] z-30 flex items-center gap-2">
        <Star size={10} className="text-yellow-600" /> 2025 FESTIVE EDITION <Star size={10} className="text-yellow-600" />
      </div>

      {/* MODAL */}
      <ServiceCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
}