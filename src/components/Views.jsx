// src/components/Views.jsx - VERSIÓN ESTABLE Y SEGURA
import React, { useState } from 'react';
import { Lock, Delete, ChefHat, Edit2, Trash2, User, Printer, ArrowLeft } from 'lucide-react';

// --- 1. TARJETA DE MENÚ (Cliente) ---
export const MenuCard = ({ item }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
    <div className="h-48 overflow-hidden relative group bg-gray-100 flex items-center justify-center flex-shrink-0">
      {item.image ? (
        <img src={item.image} alt={item.name || 'Producto'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.target.style.display = 'none'; }} />
      ) : <div className="text-gray-300 flex flex-col items-center"><ChefHat size={40} /><span className="text-xs mt-2">Sin imagen</span></div>}
      <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full font-bold shadow-md">Bs. {(Number(item.price) || 0).toFixed(2)}</div>
      {item.stock !== undefined && item.stock !== '' && <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-bold shadow-sm ${Number(item.stock) > 0 ? 'bg-white text-gray-700' : 'bg-red-500 text-white'}`}>{Number(item.stock) > 0 ? `${item.stock} disp.` : 'AGOTADO'}</div>}
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">{item.category}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
      <p className="text-gray-600 text-sm leading-relaxed flex-grow">{item.description}</p>
    </div>
  </div>
);

// --- 2. LOGIN CON PIN ---
export const PinLoginView = ({ staffMembers, onLoginSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handleNumClick = (num) => { if (pin.length < 4) { setPin(pin + num); setError(''); } };
  const handleDelete = () => { setPin(prev => prev.slice(0, -1)); setError(''); };
  const handleLogin = () => {
    const member = staffMembers.find(m => String(m.pin) === String(pin));
    if (member) onLoginSuccess(member);
    else { setError('PIN incorrecto'); setPin(''); }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-in zoom-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-8 pb-4 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32} className="text-blue-600" /></div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Ingreso Personal</h2>
          <p className="text-gray-500 text-sm">Introduce tu código de 4 dígitos</p>
        </div>
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map(i => (<div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${i < pin.length ? 'bg-blue-600 border-blue-600 scale-110' : 'border-gray-300 bg-transparent'}`} />))}
        </div>
        {error && <div className="text-red-500 text-center font-bold text-xs mb-4 animate-pulse bg-red-50 py-2 mx-8 rounded-lg px-2">{error}</div>}
        <div className="grid grid-cols-3 gap-4 px-8 pb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (<button key={num} onClick={() => handleNumClick(num.toString())} className="h-16 w-16 mx-auto rounded-full bg-gray-50 text-2xl font-bold text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all shadow-sm flex items-center justify-center active:scale-95">{num}</button>))}
          <div className="flex items-center justify-center"><button onClick={onCancel} className="text-sm font-medium text-gray-500 hover:text-gray-800 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button></div>
          <button onClick={() => handleNumClick('0')} className="h-16 w-16 mx-auto rounded-full bg-gray-50 text-2xl font-bold text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all shadow-sm flex items-center justify-center active:scale-95">0</button>
          <button onClick={handleDelete} className="flex items-center justify-center h-16 w-16 mx-auto rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"><Delete size={28} /></button>
        </div>
        <div className="p-6 bg-gray-50 border-t">
          <button onClick={handleLogin} disabled={pin.length < 4} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all text-lg ${pin.length === 4 ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200' : 'bg-gray-300 cursor-not-allowed'}`}>INGRESAR AL POS</button>
        </div>
      </div>
    </div>
  );
};

// --- 3. VISTA DE CREDENCIAL (A PRUEBA DE FALLOS) ---
export const CredentialPrintView = ({ member, appName }) => {
  // 1. Verificación de Seguridad: Si no hay miembro, mostramos aviso en vez de romper la app
  if (!member) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="bg-red-100 text-red-700 p-6 rounded-xl border border-red-300">
                <h3 className="font-bold text-lg mb-2">⚠️ Error de Datos</h3>
                <p>No se pudo cargar la información del empleado.</p>
                <button onClick={() => window.location.reload()} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Recargar Sistema</button>
            </div>
        </div>
    );
  }

  // 2. Extracción Segura de Datos (Evita "undefined" error)
  const safeName = member.name || "Sin Nombre";
  const safeRole = member.role || "Personal";
  const safePin = member.pin || "****";
  const safeId = member.id ? member.id.slice(0, 8) : "---";
  
  // Inicial segura
  const initial = safeName && safeName.length > 0 ? safeName.charAt(0).toUpperCase() : "?";

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4 animate-in zoom-in duration-300 print:bg-white print:p-0 print:block">
      
      {/* TARJETA DE CREDENCIAL (DISEÑO VISUAL) */}
      <div className="bg-white border-2 border-black w-[320px] p-6 text-center shadow-2xl rounded-xl print:shadow-none print:border-2 print:w-[300px] print:rounded-none print:mx-auto print:mt-10">
        
        {/* Cabecera */}
        <div className="border-b-2 border-black pb-4 mb-4">
            <h1 className="font-black text-2xl uppercase tracking-widest">{appName || "EMPRESA"}</h1>
            <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Credencial Oficial</p>
        </div>

        {/* Foto/Icono (Solo CSS, sin imágenes externas que puedan fallar) */}
        <div className="mx-auto w-32 h-32 bg-gray-100 border-4 border-gray-200 rounded-full flex items-center justify-center mb-4 print:border-black">
            <span className="text-6xl font-black text-gray-400 print:text-black">{initial}</span>
        </div>

        {/* Nombre y Cargo */}
        <h2 className="text-2xl font-black text-gray-900 uppercase leading-tight mb-2 break-words">{safeName}</h2>
        <div className="inline-block bg-black text-white px-4 py-1 rounded-full font-bold uppercase text-sm mb-6 print:border print:border-black print:text-black print:bg-transparent">
            {safeRole}
        </div>

        {/* Datos Sensibles (PIN) - Se oculta al imprimir por seguridad, o se deja si prefieres */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4 print:block print:border-black print:bg-transparent">
            <p className="text-[10px] text-yellow-700 font-bold uppercase print:text-black">PIN DE ACCESO</p>
            <p className="text-xl font-mono font-bold text-gray-800 tracking-widest print:text-black">{safePin}</p>
        </div>

        {/* Pie de página (ID) */}
        <div className="text-[10px] font-mono text-gray-400 border-t pt-2 uppercase print:text-black">
            ID: {safeId}
        </div>
      </div>

      {/* INSTRUCCIONES Y BOTÓN (Ocultos al imprimir) */}
      <div className="mt-8 text-center print:hidden">
          <p className="text-gray-500 text-sm mb-4">Verifica los datos antes de imprimir.</p>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 hover:scale-105 transition-all"
          >
            <Printer size={20} /> IMPRIMIR AHORA
          </button>
      </div>

      {/* ESTILOS DE IMPRESIÓN (La magia que limpia la hoja) */}
      <style>{`
        @media print {
          body * { visibility: hidden; } /* Oculta todo */
          #root { display: block !important; }
          .bg-white, .bg-white * { visibility: visible; } /* Muestra solo la tarjeta */
          .min-h-screen { height: auto !important; background: white !important; display: block !important; }
          .fixed, header, footer, .no-print, button { display: none !important; }
        }
      `}</style>
    </div>
  );
};

// --- 4. REPORTE IMPRIMIBLE ---
export const PrintableView = ({ items }) => {
  const totalCost = items.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
  const totalPrice = items.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const globalMarginPercent = totalPrice > 0 ? (((totalPrice - totalCost) / totalPrice) * 100).toFixed(1) : 0;
  return (
    <div className="bg-white p-8 md:p-12 shadow-2xl mx-auto max-w-4xl min-h-[1100px] relative print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600 print:hidden rounded-t-lg"></div>
      <div className="flex justify-between items-end mb-8 border-b-2 border-gray-800 pb-4">
        <div><h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Reporte de Menú</h1></div>
        <div className="text-right"><div className="text-sm font-bold text-gray-900">FECHA</div><div className="text-gray-600">{new Date().toLocaleDateString()}</div></div>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 border border-gray-200 rounded bg-gray-50"><div className="text-xs text-gray-500 uppercase font-bold">Items</div><div className="text-2xl font-bold text-gray-900">{items.length}</div></div>
        <div className="p-4 border border-gray-200 rounded"><div className="text-xs text-gray-500 uppercase font-bold">Costo Total</div><div className="text-2xl font-bold text-gray-900">Bs. {totalCost.toFixed(2)}</div></div>
        <div className="p-4 border border-gray-200 rounded"><div className="text-xs text-gray-500 uppercase font-bold">Valor Venta</div><div className="text-2xl font-bold text-gray-900">Bs. {totalPrice.toFixed(2)}</div></div>
        <div className="p-4 border border-gray-200 rounded bg-gray-900 text-white print:bg-gray-200 print:text-black print:border-black"><div className="text-xs opacity-70 uppercase font-bold print:text-gray-600">Margen Global</div><div className="text-2xl font-bold">{globalMarginPercent}%</div></div>
      </div>
      <table className="w-full text-left border-collapse text-sm">
        <thead><tr className="border-b-2 border-gray-800 text-xs uppercase tracking-wider"><th className="py-3 font-bold text-gray-900">Producto</th><th className="py-3 font-bold text-center text-gray-900">Stock</th><th className="py-3 font-bold text-right text-gray-900">Costo</th><th className="py-3 font-bold text-right text-gray-900">Precio</th><th className="py-3 font-bold text-right text-gray-900">Margen</th></tr></thead>
        <tbody>{items.map((item) => { const price = Number(item.price) || 0; const cost = Number(item.cost) || 0; const margin = price - cost; const marginPercent = price > 0 ? ((margin / price) * 100).toFixed(1) : 0; return (<tr key={item.id} className="border-b border-gray-200"><td className="py-3 pr-4"><div className="font-bold text-gray-800">{item.name}</div><div className="text-xs text-gray-500">{item.category}</div></td><td className="py-3 text-center text-gray-600">{item.stock || '-'}</td><td className="py-3 text-right text-gray-600">Bs. {cost.toFixed(2)}</td><td className="py-3 text-right text-gray-800 font-medium">Bs. {price.toFixed(2)}</td><td className="py-3 text-right font-bold text-gray-900">{marginPercent}%</td></tr>); })}</tbody>
      </table>
    </div>
  );
};

// --- 5. FILA DE ADMIN (Tabla) ---
export const AdminRow = ({ item, onEdit, onDelete }) => {
  const price = Number(item.price) || 0; const cost = Number(item.cost) || 0; const margin = price - cost; const marginPercent = price > 0 ? ((margin / price) * 100).toFixed(1) : 0;
  let marginColor = "text-red-500"; if (marginPercent > 30) marginColor = "text-yellow-600"; if (marginPercent > 50) marginColor = "text-green-600";
  const stock = item.stock !== undefined && item.stock !== '' ? String(item.stock) : '-';
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">{item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }}/> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ChefHat size={20}/></div>}</div><div><div className="font-bold text-gray-800">{item.name}</div><div className="text-xs text-gray-500">{item.category}</div></div></div></td>
      <td className="p-4 text-center font-medium text-gray-600">{stock}</td>
      <td className="p-4 text-right font-medium text-gray-600">Bs. {cost.toFixed(2)}</td>
      <td className="p-4 text-right font-bold text-gray-800">Bs. {price.toFixed(2)}</td>
      <td className={`p-4 text-right font-bold ${marginColor}`}><div className="flex flex-col items-end"><span>{marginPercent}%</span><span className="text-xs opacity-75">(Bs. {margin.toFixed(2)})</span></div></td>
      <td className="p-4 text-right print:hidden"><div className="flex justify-end gap-2"><button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button><button onClick={() => { if (window.confirm('¿Eliminar?')) onDelete(item.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button></div></td>
    </tr>
  );
};