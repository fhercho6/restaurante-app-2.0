// src/components/LandingPage.jsx - LIMPIO
import React from 'react';
import { ChefHat, User, Settings, ShoppingBag } from 'lucide-react';

export default function LandingPage({ appName, logo, onSelectClient, onSelectStaff, onSelectAdmin }) {
  return (
    <div className="min-h-screen bg-white flex flex-col animate-in fade-in">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        
        {/* LOGO ANIMADO */}
        <div className="mb-8 relative group cursor-default">
          <div className="absolute inset-0 bg-orange-200 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse"></div>
          <div className="w-40 h-40 bg-white rounded-full border-4 border-gray-100 shadow-2xl flex items-center justify-center relative overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
             {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
             ) : (
                <ChefHat size={80} className="text-gray-800" strokeWidth={1.5} />
             )}
          </div>
        </div>

        {/* TÍTULO */}
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight">
          {appName || "Bienvenido"}
        </h1>
        <p className="text-gray-400 font-medium mb-12 max-w-md mx-auto">Sistema de Gestión Gastronómica Inteligente</p>

        {/* BOTONES DE ACCESO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
           <button onClick={onSelectClient} className="group relative p-6 bg-black text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex flex-col items-center">
                 <ShoppingBag size={32} className="mb-3"/>
                 <span className="font-bold text-lg">VER MENÚ</span>
                 <span className="text-xs text-gray-400 mt-1">Para Clientes</span>
              </div>
           </button>

           <button onClick={onSelectStaff} className="group p-6 bg-white border-2 border-gray-100 text-gray-800 rounded-2xl shadow-sm hover:border-blue-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex flex-col items-center">
                 <User size={32} className="mb-3 text-blue-600"/>
                 <span className="font-bold text-lg">PERSONAL</span>
                 <span className="text-xs text-gray-400 mt-1">Meseros y Caja</span>
              </div>
           </button>

           <button onClick={onSelectAdmin} className="group p-6 bg-white border-2 border-gray-100 text-gray-800 rounded-2xl shadow-sm hover:border-orange-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex flex-col items-center">
                 <Settings size={32} className="mb-3 text-orange-500"/>
                 <span className="font-bold text-lg">ADMIN</span>
                 <span className="text-xs text-gray-400 mt-1">Configuración</span>
              </div>
           </button>
        </div>
      </div>

      <footer className="p-6 text-center text-gray-300 text-xs">
         <p>© 2024 Powered by ZZIF System</p>
      </footer>
    </div>
  );
}