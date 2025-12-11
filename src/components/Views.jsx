// src/components/Views.jsx - FINAL VERSION (Safe Mode: No Loader, Fixed Ticket Layout)
import React, { useState } from 'react';
// REMOVED 'Loader' to prevent crashes. Using standard icons only.
import { Lock, ArrowLeft, ChefHat, Edit2, Trash2, User, Printer, CheckCircle } from 'lucide-react';

// --- 1. MENU CARD ---
export const MenuCard = ({ item }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
    <div className="h-48 overflow-hidden relative group bg-gray-100 flex items-center justify-center flex-shrink-0">
      {item.image ? (
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
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

// --- 2. PIN LOGIN (CRASH-PROOF) ---
export const PinLoginView = ({ staffMembers, onLoginSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleNumClick = (num) => { if (pin.length < 4 && !isLoggingIn) { setPin(pin + num); setError(''); } };
  const handleDelete = () => { if(!isLoggingIn) { setPin(prev => prev.slice(0, -1)); setError(''); } };
  
  const handleLogin = async () => {
    if (isLoggingIn) return; 
    setIsLoggingIn(true);
    
    // Safety delay
    setTimeout(() => {
        const member = staffMembers.find(m => String(m.pin) === String(pin));
        if (member) { 
            onLoginSuccess(member); 
        } else { 
            setError('PIN incorrecto'); 
            setPin(''); 
            setIsLoggingIn(false); 
        }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-in zoom-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-8 pb-4 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32} className="text-blue-600" /></div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Ingreso Personal</h2>
          <p className="text-gray-500 text-sm">Introduce tu código</p>
        </div>
        <div className="flex justify-center gap-4 mb-8">{[0, 1, 2, 3].map(i => (<div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${i < pin.length ? 'bg-blue-600 border-blue-600 scale-110' : 'border-gray-300'}`} />))}</div>
        {error && <div className="text-red-500 text-center font-bold text-xs mb-4 animate-pulse bg-red-50 py-2 mx-8 rounded">{error}</div>}
        <div className="grid grid-cols-3 gap-4 px-8 pb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (<button key={num} onClick={() => handleNumClick(num.toString())} disabled={isLoggingIn} className="h-16 w-16 mx-auto rounded-full bg-gray-50 text-2xl font-bold text-gray-700 hover:bg-blue-100 disabled:opacity-50 active:scale-95 transition-all">{num}</button>))}
          <div className="flex items-center justify-center"><button onClick={onCancel} disabled={isLoggingIn} className="text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-50">Cancelar</button></div>
          <button onClick={() => handleNumClick('0')} disabled={isLoggingIn} className="h-16 w-16 mx-auto rounded-full bg-gray-50 text-2xl font-bold text-gray-700 hover:bg-blue-100 disabled:opacity-50 active:scale-95 transition-all">0</button>
          <button onClick={handleDelete} disabled={isLoggingIn} className="flex items-center justify-center h-16 w-16 mx-auto rounded-full text-red-400 hover:bg-red-50 disabled:opacity-50 active:scale-95 transition-all"><ArrowLeft size={28} /></button>
        </div>
        <div className="p-6 bg-gray-50 border-t">
            {/* REPLACED LOADER ICON WITH TEXT TO FIX CRASH */}
            <button onClick={handleLogin} disabled={pin.length < 4 || isLoggingIn} className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all ${pin.length === 4 && !isLoggingIn ? 'bg-blue-600 hover:bg-blue-700 hover:scale-105' : 'bg-gray-300 cursor-not-allowed'}`}>
                {isLoggingIn ? "⏳ VERIFICANDO..." : "INGRESAR"}
            </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. ATTENDANCE TICKET (MATCHING PHOTO LAYOUT) ---
export const AttendancePrintView = ({ data, onContinue }) => {
  // Safety check to prevent white screen if data is missing
  if (!data) return <div className="p-10 text-center font-bold text-gray-400">Cargando ticket...</div>;

  const safeName = data.name || '---';
  const safeDate = data.date || '---';
  const safeTime = data.time || '--:--';
  // ID Formatting: Last 3 digits or '001'
  const safeId = data.id ? String(data.id).slice(-3).toUpperCase() : '001';
  const safeApp = data.appName || 'LicoBar';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* THERMAL TICKET LAYOUT */}
      <div id="attendance-card" className="bg-white p-4 w-[300px] shadow-xl text-center border border-gray-300 relative" style={{ fontFamily: "'Courier New', Courier, monospace", color: '#000' }}>
        
        {/* Header Section */}
        <h2 className="font-bold text-base uppercase mb-1">CONTROL DE ASISTENCIA</h2>
        <p className="text-sm mb-2 border-b border-dashed border-black pb-2">Jornada: {safeDate}</p>
        
        {/* BIG ID */}
        <h1 className="text-5xl font-black my-2 tracking-tighter">{safeId}</h1>
        
        {/* Name Section */}
        <div className="text-left w-full mb-4 px-1">
            <p className="uppercase text-xs">Nombre:<br/><span className="font-bold text-base block">{safeName}</span></p>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-black w-full mb-4"></div>

        {/* GIANT TIME */}
        <div className="text-5xl font-black mb-2 tracking-widest leading-none whitespace-nowrap overflow-hidden">
            {safeTime}
        </div>
        <p className="text-xs italic mb-8">{safeDate}</p>

        {/* Footer */}
        <p className="text-[10px] uppercase text-left mb-10 font-bold border-b border-black pb-1">{safeApp}</p>

        {/* Signature */}
        <div className="border-t border-black pt-1 mx-6">
            <p className="text-xs uppercase">FIRMA</p>
        </div>
      </div>

      {/* Action Buttons (Hidden on Print) */}
      <div className="mt-8 flex flex-col gap-3 w-full max-w-[300px] no-print">
          <button onClick={() => window.print()} className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform"><Printer size={20}/> IMPRIMIR TICKET</button>
          {onContinue && (
            <button onClick={onContinue} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"><CheckCircle size={20}/> CONTINUAR</button>
          )}
      </div>
    </div>
  );
};

// --- 4. CREDENTIAL VIEW ---
export const CredentialPrintView = ({ member, appName }) => {
  if (!member) return <div className="text-center p-10 text-red-500 font-bold">Error: Sin datos.</div>;
  const safeName = member.name || "Sin Nombre";
  const safeRole = member.role || "Personal";
  const safePin = member.pin || "****";
  const safeId = member.id || "---";
  const initial = safeName.charAt(0).toUpperCase();
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
      <div id="credential-card" className="bg-white border-2 border-black w-[300px] p-6 text-center shadow-2xl rounded-xl">
        <div className="border-b-2 border-black pb-4 mb-4"><h1 className="font-black text-2xl uppercase tracking-widest">{appName || "EMPRESA"}</h1><p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Credencial Oficial</p></div>
        <div className="mx-auto w-32 h-32 bg-gray-100 border-4 border-gray-200 rounded-full flex items-center justify-center mb-4 border-black"><span className="text-6xl font-black text-gray-800">{initial}</span></div>
        <h2 className="text-2xl font-black text-gray-900 uppercase leading-tight mb-2 break-words">{safeName}</h2>
        <div className="inline-block bg-black text-white px-4 py-1 rounded-full font-bold uppercase text-sm mb-6 border border-black">{safeRole}</div>
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4"><p className="text-[10px] text-yellow-700 font-bold uppercase">PIN DE ACCESO</p><p className="text-xl font-mono font-bold text-gray-800 tracking-widest">{safePin}</p></div>
        <div className="text-[10px] font-mono text-gray-400 border-t pt-2 uppercase text-black">ID: {safeId.slice(0, 8)}</div>
      </div>
      <div className="mt-8 text-center no-print"><p className="text-gray-500 text-sm mb-4">Listo para imprimir.</p><button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 hover:scale-105 transition-all"><Printer size={20} /> IMPRIMIR AHORA</button></div>
    </div>
  );
};

// --- 5. PRINTABLE REPORT ---
export const PrintableView = ({ items }) => {
  const totalCost = items.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
  const totalPrice = items.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const globalMarginPercent = totalPrice > 0 ? (((totalPrice - totalCost) / totalPrice) * 100).toFixed(1) : 0;
  return (
    <div className="bg-white p-8 md:p-12 shadow-2xl mx-auto max-w-4xl min-h-[1100px] relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-t-lg no-print"></div>
      <div className="flex justify-between items-end mb-8 border-b-2 border-gray-800 pb-4"><div><h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Reporte de Menú</h1></div><div className="text-right"><div className="text-sm font-bold text-gray-900">FECHA</div><div className="text-gray-600">{new Date().toLocaleDateString()}</div></div></div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 border border-gray-200 rounded"><div className="text-xs text-gray-500 uppercase font-bold">Items</div><div className="text-2xl font-bold text-gray-900">{items.length}</div></div>
        <div className="p-4 border border-gray-200 rounded"><div className="text-xs text-gray-500 uppercase font-bold">Costo Total</div><div className="text-2xl font-bold text-gray-900">Bs. {totalCost.toFixed(2)}</div></div>
        <div className="p-4 border border-gray-200 rounded"><div className="text-xs text-gray-500 uppercase font-bold">Valor Venta</div><div className="text-2xl font-bold text-gray-900">Bs. {totalPrice.toFixed(2)}</div></div>
        <div className="p-4 border border-gray-200 rounded bg-gray-900 text-white"><div className="text-xs opacity-70 uppercase font-bold">Margen Global</div><div className="text-2xl font-bold">{globalMarginPercent}%</div></div>
      </div>
      <table className="w-full text-left border-collapse text-sm">
        <thead><tr className="border-b-2 border-gray-800 text-xs uppercase tracking-wider"><th className="py-3 font-bold text-gray-900">Producto</th><th className="py-3 font-bold text-center text-gray-900">Stock</th><th className="py-3 font-bold text-right text-gray-900">Costo</th><th className="py-3 font-bold text-right text-gray-900">Precio</th><th className="py-3 font-bold text-right text-gray-900">Margen</th></tr></thead>
        <tbody>{items.map((item) => { const price = Number(item.price) || 0; const cost = Number(item.cost) || 0; const margin = price - cost; const marginPercent = price > 0 ? ((margin / price) * 100).toFixed(1) : 0; return (<tr key={item.id} className="border-b border-gray-200"><td className="py-3 pr-4"><div className="font-bold text-gray-800">{item.name}</div><div className="text-xs text-gray-500">{item.category}</div></td><td className="py-3 text-center text-gray-600">{item.stock || '-'}</td><td className="py-3 text-right text-gray-600">Bs. {cost.toFixed(2)}</td><td className="py-3 text-right text-gray-800 font-medium">Bs. {price.toFixed(2)}</td><td className="py-3 text-right font-bold text-gray-900">{marginPercent}%</td></tr>); })}</tbody>
      </table>
    </div>
  );
};

// --- 6. ADMIN ROW ---
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
      <td className="p-4 text-right no-print"><div className="flex justify-end gap-2"><button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button><button onClick={() => { if (window.confirm('¿Eliminar?')) onDelete(item.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button></div></td>
    </tr>
  );
};