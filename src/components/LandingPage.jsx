// src/components/LandingPage.jsx - EDICIÓN NAVIDAD NEÓN
import React from 'react';
import { ChefHat, User, Settings, ArrowRight, UtensilsCrossed, Gift, Trees } from 'lucide-react';

// Componente simple para la nieve de fondo
const Snowfall = () => {
  const flakes = Array.from({ length: 20 }); // 20 copos de nieve
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {flakes.map((_, i) => {
        const left = `${Math.random() * 100}%`;
        const duration = `${Math.random() * 5 + 5}s`;
        const delay = `${Math.random() * 5}s`;
        const size = `${Math.random() * 4 + 2}px`;
        return (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-80 animate-[snowfall_linear_infinite]"
            style={{
              left,
              top: '-10px',
              width: size,
              height: size,
              animationDuration: duration,
              animationDelay: delay,
              '--tw-translate-y': '110vh',
              '--tw-translate-x': `${Math.random() * 20 - 10}px`
            }}
          ></div>
        );
      })}
      <style jsx>{`
        @keyframes snowfall {
          to {
            transform: translateY(var(--tw-translate-y)) translateX(var(--tw-translate-x));
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};


export default function LandingPage({ appName, logo, onSelectClient, onSelectStaff, onSelectAdmin }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden font-sans bg-[#0a0a0a]">
      
      {/* 1. FONDO NEÓN + NIEVE */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Rayos de luz neón estilo navideño */}
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-orange-600/30 blur-[100px] rotate-45 animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-purple-600/30 blur-[100px] rotate-[-45] animate-pulse"></div>
        <div className="absolute top-[10%] right-[20%] w-[30%] h-[30%] bg-red-600/20 blur-[80px] animate-pulse delay-700"></div>
         <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] bg-green-600/20 blur-[80px] animate-pulse delay-1000"></div>
      </div>
      <Snowfall />
      
      {/* Barra superior tipo Guirnalda */}
      <div className="absolute top-0 inset-x-0 h-16 z-20 flex items-center justify-between px-6 bg-gradient-to-b from-black/80 to-transparent border-b border-red-500/50 shadow-[0_5px_15px_-5px_rgba(220,38,38,0.5)]">
          {/* Decoración izquierda */}
          <div className="flex gap-2 text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]">
              <Trees size={20} /><Trees size={16} className="mt-1" />
          </div>

          {/* BOTÓN ADMIN CON GORRO */}
          <button 
            onClick={onSelectAdmin}
            className="relative group p-2 text-gray-400 hover:text-white transition-all"
            title="Acceso Administrativo"
          >
            <div className="absolute -top-1 -right-1 transform rotate-12 text-red-600 drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C12 2 10 5 9 7C8 9 4 12 4 15C4 18 6 21 12 21C18 21 20 18 20 15C20 12 16 9 15 7C14 5 12 2 12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="2" r="2" fill="white"/></svg>
            </div>
            <Settings size={24} className="group-hover:rotate-90 transition-transform duration-500 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"/>
          </button>
      </div>

      {/* 3. CONTENIDO CENTRAL */}
      <div className="relative z-30 flex flex-col items-center w-full max-w-md px-6 text-center animate-in fade-in zoom-in duration-700 mt-16">
        
        {/* LOGO CENTRAL */}
        <div className="mb-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-purple-600 blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-1000 rounded-full"></div>
            <div className="relative w-32 h-32 bg-black/50 backdrop-blur-md border-2 border-orange-500/50 rounded-full flex items-center justify-center shadow-[0_0_30px_-5px_rgba(249,115,22,0.6)] p-4">
                {logo ? (
                    <img src={logo} alt="Logo" className="w-full h-full object-contain drop-shadow-lg" />
                ) : (
                    <ChefHat size={64} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" strokeWidth={1.5} />
                )}
            </div>
        </div>

        {/* TÍTULO CON DECORACIÓN NAVIDEÑA */}
        <div className="flex items-center justify-center gap-2 mb-2">
            <Trees size={24} className="text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-purple-400 tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] uppercase relative">
            {appName || 'LicoBar'}
            </h1>
            <Trees size={24} className="text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)] scale-x-[-1]" />
        </div>
        <p className="text-sm text-orange-300/80 font-bold tracking-[0.3em] uppercase mb-10 flex items-center gap-2 before:h-px before:w-4 before:bg-orange-500 after:h-px after:w-4 after:bg-orange-500">
          Sistema de Gestión Inteligente
        </p>

        {/* --- BOTONES DE ACCIÓN (Estilo Luces de Navidad) --- */}
        <div className="w-full space-y-6">
            
            {/* BOTÓN 1: CLIENTES (Naranja/Rojo) */}
            <button 
                onClick={onSelectClient}
                className="group w-full relative bg-black/40 text-white py-5 rounded-2xl font-black text-lg tracking-wide 
                border-2 border-dashed border-orange-500/70 hover:border-red-500/80 transition-all duration-500
                shadow-[0_0_20px_-5px_rgba(249,115,22,0.5),inset_0_0_15px_-5px_rgba(220,38,38,0.3)]
                hover:shadow-[0_0_30px_-5px_rgba(220,38,38,0.7),inset_0_0_20px_-5px_rgba(249,115,22,0.5)]
                active:scale-95 flex items-center justify-center gap-4 overflowing-hidden"
            >
                {/* Gorro en el botón */}
                <div className="absolute top-[-8px] left-4 transform -rotate-12 text-red-600 drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C12 2 10 5 9 7C8 9 4 12 4 15C4 18 6 21 12 21C18 21 20 18 20 15C20 12 16 9 15 7C14 5 12 2 12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="2" r="2" fill="white"/></svg>
                </div>

                <UtensilsCrossed size={24} className="text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]"/>
                <span>VER MENÚ</span>
                <Gift size={24} className="text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.8)] group-hover:rotate-12 transition-transform"/>
            </button>

            {/* BOTÓN 2: PERSONAL (Morado/Verde) */}
            <button 
                onClick={onSelectStaff}
                className="group w-full relative bg-black/40 text-white py-5 rounded-2xl font-bold text-lg tracking-widest uppercase 
                border-2 border-dashed border-purple-500/70 hover:border-green-500/80 transition-all duration-500
                shadow-[0_0_20px_-5px_rgba(168,85,247,0.5),inset_0_0_15px_-5px_rgba(34,197,94,0.3)]
                hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.7),inset_0_0_20px_-5px_rgba(168,85,247,0.5)]
                active:scale-95 flex items-center justify-center gap-4"
            >
                 {/* Gorro en el botón */}
                 <div className="absolute top-[-8px] right-4 transform rotate-12 text-green-600 drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C12 2 10 5 9 7C8 9 4 12 4 15C4 18 6 21 12 21C18 21 20 18 20 15C20 12 16 9 15 7C14 5 12 2 12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="2" r="2" fill="white"/></svg>
                </div>
                <User size={24} className="text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]" />
                <span>PERSONAL</span>
                <Gift size={24} className="text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)] group-hover:-rotate-12 transition-transform"/>
            </button>

        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-6 text-white/30 text-[10px] uppercase font-bold tracking-[0.3em] z-30 flex items-center gap-2">
        <Trees size={12} className="text-green-900" /> 2025 POWERED BY ZZIF SYSTEM <Trees size={12} className="text-green-900" />
      </div>
    </div>
  );
}