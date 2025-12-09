// src/components/Views.jsx
import React, { useState } from 'react';
import { Lock, Delete, ChefHat, Edit2, Trash2, AlertTriangle, Printer, Loader } from 'lucide-react';

// ... (MenuCard y PinLoginView se mantienen IGUALES que antes) ...

// --- 3. VISTA DE CREDENCIAL (Con Detector de Carga) ---
export const CredentialPrintView = ({ member, appName }) => {
  const [imageLoaded, setImageLoaded] = useState(false); // Estado para controlar la carga

  if (!member) return <div className="text-center p-10 text-red-500 font-bold">Error: Sin datos.</div>;

  const safeId = member.id || "ERROR";
  // Usamos QuickChart que es seguro (HTTPS) y rápido
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(safeId)}&size=300&ecLevel=H&margin=1&dark=000000&light=ffffff`;

  return (
    <div className="bg-white min-h-screen flex flex-col items-center pt-10 animate-in fade-in">
      
      {/* TARJETA DE CREDENCIAL */}
      <div id="credential-card" className="w-[320px] border border-gray-300 p-6 bg-white shadow-xl flex flex-col items-center text-center relative print:border-2 print:shadow-none">
        
        {/* Encabezado */}
        <div className="mb-6 border-b-2 border-black w-full pb-2">
            <h1 className="font-black text-xl uppercase tracking-wider">{appName || "SISTEMA"}</h1>
            <p className="text-[10px] font-bold uppercase text-gray-500">ACCESO PERSONAL</p>
        </div>
        
        {/* Caja del QR con Aviso de Carga */}
        <div className="mb-4 relative flex items-center justify-center w-48 h-48 border-4 border-black p-2 bg-white overflow-hidden rounded-xl">
           
           {/* Spinner de carga (visible mientras imageLoaded es false) */}
           {!imageLoaded && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 z-10">
               <Loader className="animate-spin mb-2" />
               <span className="text-xs font-bold">Generando QR...</span>
             </div>
           )}

           {/* La Imagen del QR */}
           <img 
             src={qrUrl} 
             alt="Código QR"
             className={`w-full h-full object-contain transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
             onLoad={() => setImageLoaded(true)} // ¡Aquí está el truco!
             onError={(e) => { e.target.style.display='none'; }}
           />
        </div>
        
        {/* Datos del Empleado */}
        <h2 className="text-2xl font-black uppercase leading-tight mb-2 w-full">{member.name}</h2>
        <div className="bg-black text-white px-6 py-2 rounded-full font-bold uppercase text-sm mb-4 print:border print:border-black print:text-black print:bg-transparent">
            {member.role}
        </div>
        
        <div className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded mb-4 text-xs font-mono print:hidden">
            PIN SECRETO: <strong>{member.pin}</strong>
        </div>

        <div className="text-[10px] font-mono text-gray-500 mt-2 w-full border-t border-gray-200 pt-2 break-all">ID: {member.id}</div>
      </div>
      
      {/* Botones de Acción (Solo aparecen si cargó la imagen) */}
      <div className="mt-8 flex gap-4 print:hidden">
          {imageLoaded ? (
            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
            >
              <Printer size={20} /> IMPRIMIR AHORA
            </button>
          ) : (
            <div className="text-gray-400 text-sm animate-pulse">Esperando al servidor de QR...</div>
          )}
      </div>
    </div>
  );
};

// ... (PrintableView y AdminRow siguen igual) ...