// src/components/LandingPage.jsx - DISEÑO DARK PREMIUM (ESTILO LICO-BAR)
import React from 'react';
import { ChefHat, User, Settings, ShoppingBag, Sparkles } from 'lucide-react';

export default function LandingPage({ appName, logo, onSelectClient, onSelectStaff, onSelectAdmin }) {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden font-sans selection:bg-orange-500 selection:text-white animate-in fade-in duration-700">
      
      {/* --- FONDO AMBIENTAL (Luces y Patrones) --- */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Luz Superior Central (Dorado/Naranja) */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] opacity-40 mix-blend-screen"></div>
        
        {/* Luz Inferior Izquierda (Azul) */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] opacity-30"></div>
        
        {/* Patrón de Rejilla Sutil */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80"></div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* LOGO CON EFECTO DE RESPLANDOR */}
        <div className="mb-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
          <div className="w-44 h-44 bg-[#0a0a0a] rounded-full border border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden backdrop-blur-3xl ring-1 ring-white/5 group-hover:scale-105 transition-transform duration-500">
             {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-contain p-4 drop-shadow-2xl" />
             ) : (
                <ChefHat size={80} className="text-white drop-shadow-[0_0_15px_rgba(255,165,0,0.5)]" strokeWidth={1} />
             )}
          </div>
        </div>

        {/* TÍTULO Y SLOGAN */}
        <div className="text-center mb-16 space-y-2">
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-tight drop-shadow-sm">
              {appName || "LicoBar"}
            </h1>
            <p className="text-gray-400 text-sm md:text-base font-medium tracking-widest uppercase opacity-80 flex items-center justify-center gap-2">
               <Sparkles size={12} className="text-orange-400"/> Sistema de Gestión Inteligente <Sparkles size={12} className="text-orange-400"/>
            </p>
        </div>

        {/* --- GRID DE BOTONES (CARDS DE CRISTAL) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
           
           {/* 1. MENÚ (ESTILO GOLD) */}
           <button onClick={onSelectClient} className="group relative p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl group-hover:bg-amber-500/30 transition-all"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/20 mb-4 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                    <ShoppingBag size={32} className="text-amber-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">VER MENÚ</h3>
                 <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Para Clientes</p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
           </button>

           {/* 2. PERSONAL (ESTILO BLUE) */}
           <button onClick={onSelectStaff} className="group relative p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/20 mb-4 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                    <User size={32} className="text-blue-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">PERSONAL</h3>
                 <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Meseros y Caja</p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
           </button>

           {/* 3. ADMIN (ESTILO ORANGE/RED) */}
           <button onClick={onSelectAdmin} className="group relative p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-all"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-transparent border border-orange-500/20 mb-4 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                    <Settings size={32} className="text-orange-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">ADMIN</h3>
                 <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Configuración</p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
           </button>

        </div>
      </div>

      {/* FOOTER DISCRETO */}
      <footer className="p-6 text-center relative z-10">
         <p className="text-white/20 text-[10px] uppercase tracking-[0.2em] hover:text-white/40 transition-colors">
            © 2025 Powered by ZZIF System
         </p>
      </footer>
    </div>
  );
}