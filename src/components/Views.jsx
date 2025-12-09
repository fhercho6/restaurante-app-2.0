// src/components/Views.jsx - VERSIÓN FINAL BLINDADA (Impresión Iframe Invisible)
import React, { useState } from 'react';
import { Lock, Delete, ChefHat, Edit2, Trash2, User, Printer, AlertTriangle } from 'lucide-react';

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

// --- 3. VISTA DE CREDENCIAL (IMPRESIÓN INVISIBLE / NO POPUP) ---
export const CredentialPrintView = ({ member, appName }) => {
  if (!member) return <div className="text-center p-10 text-red-500 font-bold">Error: Sin datos.</div>;

  // Función de impresión invisible (Nunca falla)
  const handleIframePrint = () => {
    // 1. Crear un iframe invisible
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    // 2. Escribir el contenido
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Credencial - ${member.name}</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; padding: 20px; }
            .card { width: 300px; border: 2px solid black; padding: 20px; text-align: center; border-radius: 10px; page-break-inside: avoid; }
            .header { border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; }
            .title { font-size: 18px; font-weight: 900; text-transform: uppercase; margin: 0; }
            .subtitle { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #555; }
            .role-badge { background: black; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 15px; border: 1px solid black; }
            .name { font-size: 22px; font-weight: 900; text-transform: uppercase; margin-bottom: 10px; line-height: 1.1; }
            .pin-box { border: 1px dashed black; padding: 5px; font-family: monospace; font-size: 12px; margin-bottom: 10px; border-radius: 4px; }
            .id-text { font-size: 10px; color: #555; font-family: monospace; border-top: 1px solid #ccc; padding-top: 10px; word-break: break-all; }
            .icon-box { width: 80px; height: 80px; border: 3px solid black; border-radius: 50%; margin: 0 auto 15px auto; display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: bold; background: #eee; }
          </style>
        </head>
        <body>
          <div class="card">
             <div class="header">
                <h1 class="title">${appName || "SISTEMA"}</h1>
                <div class="subtitle">Acceso Personal</div>
             </div>
             
             <div class="icon-box">
                ${member.name.charAt(0)}
             </div>

             <div class="name">${member.name}</div>
             <div class="role-badge">${member.role}</div>
             
             <div class="pin-box">PIN: ${member.pin}</div>
             <div class="id-text">ID: ${member.id}</div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    // 3. Imprimir y borrar iframe
    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    }, 500);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center pt-10 animate-in fade-in">
      
      {/* TARJETA VISUAL EN PANTALLA */}
      <div className="w-[300px] border border-gray-300 p-6 bg-white shadow-xl flex flex-col items-center text-center">
        <div className="mb-6 border-b-2 border-black w-full pb-2">
            <h1 className="font-black text-xl uppercase tracking-wider">{appName || "SISTEMA"}</h1>
            <p className="text-[10px] font-bold uppercase text-gray-500">ACCESO PERSONAL</p>
        </div>
        
        <div className="mb-6 flex items-center justify-center w-32 h-32 bg-gray-100 rounded-full border-4 border-white shadow-sm">
           <User size={64} className="text-gray-400" />
        </div>
        
        <h2 className="text-2xl font-black uppercase leading-tight mb-2 w-full">{member.name}</h2>
        <div className="bg-black text-white px-6 py-2 rounded-full font-bold uppercase text-sm mb-6">
            {member.role}
        </div>
        
        <div className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded mb-4 text-xs font-mono">
            PIN SECRETO: <strong>{member.pin}</strong>
        </div>

        <div className="text-[10px] font-mono text-gray-500 mt-2 w-full border-t border-gray-200 pt-2 break-all">ID: {member.id}</div>
      </div>
      
      {/* BOTÓN SEGURO */}
      <div className="mt-8">
          <button 
            onClick={handleIframePrint} 
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
          >
            <Printer size={20} /> IMPRIMIR AHORA
          </button>
      </div>
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