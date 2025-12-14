// src/components/LandingPage.jsx - DISEÑO "HERO" PARA CLIENTES Y STAFF
import React from 'react';
import { ChefHat, User, Shield, ArrowRight, UtensilsCrossed } from 'lucide-react';

export default function LandingPage({ appName, logo, onSelectClient, onSelectStaff, onSelectAdmin }) {
  
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* 1. FONDO CON IMAGEN Y FILTRO */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center scale-105"
        style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1920&auto=format&fit=crop')",
        }}
      ></div>
      {/* Capa oscura para que el texto resalte */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90 backdrop-blur-[2px]"></div>

      {/* 2. BOTÓN ADMIN DISCRETO (Esquina Superior Derecha) */}
      <button 
        onClick={onSelectAdmin}
        className="absolute top-6 right-6 z-20 p-3 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all"
        title="Acceso Administrativo"
      >
        <Shield size={24} />
      </button>

      {/* 3. CONTENIDO CENTRAL */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6 text-center animate-in fade-in zoom-in duration-700">
        
        {/* LOGO BRILLANTE */}
        <div className="mb-8 relative group">
            <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 rounded-full"></div>
            <div className="relative w-32 h-32 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center shadow-2xl p-4">
                {logo ? (
                    <img src={logo} alt="Logo" className="w-full h-full object-contain drop-shadow-lg" />
                ) : (
                    <ChefHat size={64} className="text-white" strokeWidth={1.5} />
                )}
            </div>
        </div>

        {/* TÍTULO */}
        <h1 className="text-5xl font-black text-white tracking-tight mb-2 drop-shadow-xl uppercase">
          {appName || 'LicoBar'}
        </h1>
        <p className="text-lg text-gray-300 font-medium tracking-widest uppercase mb-12">
          Est. 2025
        </p>

        {/* --- BOTONES DE ACCIÓN --- */}
        <div className="w-full space-y-4">
            
            {/* BOTÓN 1: CLIENTES (El más llamativo) */}
            <button 
                onClick={onSelectClient}
                className="group w-full relative overflow-hidden bg-white text-black py-5 rounded-2xl font-black text-lg tracking-wide shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-3"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <UtensilsCrossed size={20} className="text-orange-600"/>
                VER MENÚ DIGITAL
                <ArrowRight size={20} className="text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all"/>
            </button>

            {/* BOTÓN 2: PERSONAL (Elegante pero secundario) */}
            <button 
                onClick={onSelectStaff}
                className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white py-5 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all active:scale-95 flex items-center justify-center gap-3"
            >
                <User size={18} />
                Acceso Personal
            </button>

        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-6 text-white/20 text-[10px] uppercase font-bold tracking-[0.3em] z-10">
        Sistema ZZIF v2.0
      </div>
    </div>
  );
}