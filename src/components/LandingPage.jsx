// src/components/LandingPage.jsx
import React from 'react';
import { ChefHat, Utensils, Calculator, ShieldCheck } from 'lucide-react';

const LandingPage = ({ appName, logo, onSelectClient, onSelectStaff, onSelectAdmin }) => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
    <div className="text-center mb-12 transform transition-all hover:scale-105 duration-500">
      <div className="bg-white p-6 rounded-3xl shadow-xl inline-block mb-6 ring-4 ring-orange-100">
        {logo ? (
          <img src={logo} alt="Logo" className="w-24 h-24 object-contain" />
        ) : (
          <ChefHat size={80} className="text-orange-500" />
        )}
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight mb-2">
        {appName}
      </h1>
      <p className="text-gray-500 text-lg font-medium">Selecciona tu perfil de ingreso</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
      {/* Opción Cliente */}
      <button onClick={onSelectClient} className="group relative bg-white p-8 rounded-3xl shadow-lg border-2 border-transparent hover:border-orange-500 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center">
        <div className="bg-orange-100 p-4 rounded-2xl mb-4 group-hover:bg-orange-500 transition-colors duration-300">
          <Utensils size={40} className="text-orange-600 group-hover:text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Ver Menú</h2>
        <p className="text-gray-500 text-sm">Soy cliente, quiero ver la carta.</p>
      </button>

      {/* Opción Personal */}
      <button onClick={onSelectStaff} className="group relative bg-white p-8 rounded-3xl shadow-lg border-2 border-transparent hover:border-blue-500 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center">
        <div className="bg-blue-100 p-4 rounded-2xl mb-4 group-hover:bg-blue-500 transition-colors duration-300">
          <Calculator size={40} className="text-blue-600 group-hover:text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Personal / Ventas</h2>
        <p className="text-gray-500 text-sm">Soy mesero, quiero registrar pedidos.</p>
      </button>

      {/* Opción Admin */}
      <button onClick={onSelectAdmin} className="group relative bg-white p-8 rounded-3xl shadow-lg border-2 border-transparent hover:border-gray-800 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center">
        <div className="bg-gray-100 p-4 rounded-2xl mb-4 group-hover:bg-gray-800 transition-colors duration-300">
          <ShieldCheck size={40} className="text-gray-600 group-hover:text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Administración</h2>
        <p className="text-gray-500 text-sm">Gestión de inventario y precios.</p>
      </button>
    </div>

    <div className="mt-12 text-gray-400 text-sm">
      Sistema de Menú Digital Cloud v3.23 (Restored)
    </div>
  </div>
);

export default LandingPage;