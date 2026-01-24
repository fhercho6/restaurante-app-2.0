// src/components/LandingPage.jsx - EDICIÓN CYBERPUNK NEON
import React, { useState } from 'react';
import { ChefHat, User, Settings, UtensilsCrossed, Sparkles, Clock, Calculator, Zap, Crown, Calendar, Plus, Maximize, Minimize } from 'lucide-react';
import ServiceCalculatorModal from './ServiceCalculatorModal';

export default function LandingPage({ appName, logo, onSelectClient, onSelectStaff, onSelectAdmin, onSelectReservations, isPublicMode = false }) {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsPinModalOpen(false);
      setPin('');
      onSelectReservations();
    } else {
      alert('Código incorrecto');
      setPin('');
    }
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden font-sans bg-[#020202] text-white">

      {/* 1. FONDO CYBERPUNK DINÁMICO */}
      <div className="absolute inset-0 z-0">
        {/* Rejilla futurista (Grid) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

        {/* Luces de Neón Ambientales */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[30%] h-[30%] bg-magenta-500/10 blur-[100px] animate-pulse delay-1000"></div>
      </div>

      {/* BARRA SUPERIOR (HEADER) */}
      <div className="absolute top-0 inset-x-0 h-20 z-20 flex items-center justify-between px-6 bg-gradient-to-b from-black/80 to-transparent">
        {/* Decoración minimalista */}
        <div className="flex gap-2 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] opacity-80">
          <Zap size={20} className="" />
        </div>

        {/* BOTONES DERECHA */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white transition-all hover:scale-110 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] border border-cyan-500/20"
            title="Cotizar Costo"
          >
            <Calculator size={22} />
          </button>

          <button
            onClick={() => setIsPinModalOpen(true)}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-indigo-400 hover:text-white transition-all hover:scale-110 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-500/20"
            title="Acceso Reservas"
          >
            <Calendar size={22} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:scale-110 border border-white/10"
            title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa (Ocultar Barras)"}
          >
            {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
          </button>

          {!isPublicMode && (
            <button
              onClick={onSelectAdmin}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-purple-400 hover:text-white transition-all hover:scale-110 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-500/20"
              title="Acceso Administrativo"
            >
              <Settings size={22} />
            </button>
          )}
        </div>
      </div>

      {/* 3. CONTENIDO CENTRAL */}
      <div className="relative z-30 flex flex-col items-center w-full max-w-md px-6 text-center animate-in fade-in zoom-in duration-700 mt-10">

        {/* LOGO GLOW EFFECT */}
        <div className="mb-8 relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition duration-1000"></div>
          <div className="relative w-36 h-36 bg-black border-2 border-white/10 rounded-full flex items-center justify-center p-6 shadow-2xl overflow-hidden ring-1 ring-white/20">
            {/* Efecto de brillo interior */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10"></div>

            {logo ? (
              <img src={logo} alt="Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
            ) : (
              <Crown size={64} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" strokeWidth={1} />
            )}
          </div>
        </div>

        {/* TÍTULO */}
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300 tracking-tighter drop-shadow-[0_0_20px_rgba(192,132,252,0.5)] mb-2">
          {appName || 'SISTEMA ZZIF'}
        </h1>

        <div className="flex items-center gap-3 mb-12">
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-cyan-500"></div>
          <p className="text-xs text-cyan-400/80 font-bold tracking-[0.4em] uppercase">
            NIGHTLIFE EXPERIENCE
          </p>
          <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-purple-500"></div>
        </div>

        {/* --- BOTONES DE ACCIÓN NEÓN --- */}
        <div className="w-full space-y-5">

          {/* BOTÓN 1: CLIENTES (CYAN NEON) */}
          <button
            onClick={onSelectClient}
            className="group w-full relative h-16 bg-black hover:bg-cyan-950/20 text-white rounded-xl font-bold text-lg tracking-widest uppercase 
              border border-cyan-500/50 hover:border-cyan-400 transition-all duration-300
              shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]
              hover:shadow-[0_0_30px_0px_rgba(6,182,212,0.6)]
              active:scale-95 flex items-center justify-between px-8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-cyan-400/10 to-cyan-600/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

            <span className="flex items-center gap-3">
              <UtensilsCrossed size={20} className="text-cyan-400" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-100 group-hover:to-white">VER MENÚ</span>
            </span>

            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-black transition-colors">
              <Sparkles size={16} />
            </div>
          </button>

          {/* BOTÓN 2: PERSONAL (PURPLE NEON) */}
          {!isPublicMode && (
            <button
              onClick={onSelectStaff}
              className="group w-full relative h-16 bg-black hover:bg-purple-950/20 text-white rounded-xl font-bold text-lg tracking-widest uppercase 
                border border-purple-500/50 hover:border-purple-400 transition-all duration-300
                shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]
                hover:shadow-[0_0_30px_0px_rgba(168,85,247,0.6)]
                active:scale-95 flex items-center justify-between px-8"
            >
              <span className="flex items-center gap-3">
                <User size={20} className="text-purple-400" />
                <span className="text-gray-300 group-hover:text-white transition-colors">PERSONAL</span>
              </span>

              <Clock size={18} className="text-purple-500/50 group-hover:text-purple-300 transition-colors" />
            </button>
          )}

        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-6 flex flex-col items-center gap-1 text-white/10 pointer-events-none">
        <div className="h-8 w-[1px] bg-gradient-to-b from-transparent to-white/20"></div>
        <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Designed for nightlife</p>
      </div>

      {/* MODAL */}
      <ServiceCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* RESERVATION PIN MODAL */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl relative">
            <button onClick={() => setIsPinModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><Zap size={20} /></button>
            <div className="mb-4 flex justify-center"><Calendar size={48} className="text-indigo-500" /></div>
            <h3 className="text-xl font-bold text-white mb-2">Acceso Reservas</h3>
            <p className="text-gray-400 text-sm mb-6">Ingresa el código de seguridad</p>

            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                autoFocus
                className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-center text-2xl tracking-[10px] text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all mb-4"
                value={pin}
                onChange={e => setPin(e.target.value)}
                maxLength={4}
                placeholder="••••"
              />
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
                ENTRAR
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}