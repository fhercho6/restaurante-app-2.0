// src/components/Views.jsx - ARREGLADO (Línea 88 corregida)
import React, { useState } from 'react';
import { Lock, ArrowLeft, ChefHat, Edit2, Trash2, User, Printer, AlertTriangle } from 'lucide-react';

// --- 1. MENÚ CARD ---
export const MenuCard = ({ item }) => {
  const stockNum = Number(item.stock);
  const hasStock = item.stock !== undefined && item.stock !== '';
  const isLowStock = hasStock && stockNum < 5;
  const isOut = hasStock && stockNum <= 0;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow ${isOut ? 'opacity-50 grayscale' : ''}`}>
      <div className="h-48 bg-gray-100 relative overflow-hidden group">
        {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" onError={(e) => {e.target.style.display='none'}} />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300"><ChefHat size={48}/></div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-black text-gray-900 shadow-sm">Bs. {item.price}</div>
        
        {isLowStock && !isOut && <div className="absolute bottom-0 w-full bg-red-600 text-white text-xs font-bold text-center py-1 animate-pulse">¡POCO STOCK: {stockNum}!</div>}
        {isOut && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="text-white font-black text-2xl uppercase tracking-widest border-4 border-white px-4 py-2 transform -rotate-12">Agotado</span></div>}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2"><span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-50 px-2 py-1 rounded-full">{item.category}</span></div>
        <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{item.name}</h3>
        {item.description && <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>}
      </div>
    </div>
  );
};

// --- 2. PIN LOGIN (AQUÍ ESTABA EL ERROR) ---
export const PinLoginView = ({ staffMembers, onLoginSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Estado para feedback visual

  const handlePinSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Pequeña pausa para simular proceso
    setTimeout(() => {
        const member = staffMembers.find(m => m.pin === pin);
        if (member) {
          onLoginSuccess(member);
        } else {
          setError('PIN Incorrecto');
          setPin('');
          setLoading(false);
          setTimeout(() => setError(''), 2000);
        }
    }, 500);
  };

  const handleNumClick = (num) => {
    if (pin.length < 4) setPin(prev => prev + num);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 animate-in zoom-in duration-300">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"><Lock className="text-white" size={32}/></div>
           <h2 className="text-2xl font-bold text-white mb-1">Acceso de Personal</h2>
           <p className="text-gray-400 text-sm">Ingresa tu código de 4 dígitos</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl">
           <div className="mb-8">
              <div className="flex justify-center gap-4 mb-2">
                 {[0,1,2,3].map(i => (<div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-orange-500 scale-110' : 'bg-gray-200'}`}></div>))}
              </div>
              {error && <p className="text-center text-red-500 text-sm font-bold animate-bounce">{error}</p>}
           </div>

            {/* SI ESTÁ CARGANDO, MOSTRAMOS TEXTO EN LUGAR DE TECLADO */}
            {loading ? (
                <div className="py-20 text-center">
                    <p className="text-orange-500 font-bold text-lg animate-pulse">VERIFICANDO...</p>
                </div>
            ) : (
               <>
                   <div className="grid grid-cols-3 gap-3 mb-6">
                      {[1,2,3,4,5,6,7,8,9].map(num => (
                         <button key={num} onClick={() => handleNumClick(String(num))} className="h-16 rounded-2xl bg-gray-50 text-2xl font-bold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all shadow-sm border border-gray-100">{num}</button>
                      ))}
                      <button onClick={() => setPin('')} className="h-16 rounded-2xl bg-red-50 text-red-500 font-bold hover:bg-red-100 flex items-center justify-center"><Trash2 size={24}/></button>
                      <button onClick={() => handleNumClick('0')} className="h-16 rounded-2xl bg-gray-50 text-2xl font-bold text-gray-700 hover:bg-gray-100 active:scale-95 border border-gray-100">0</button>
                      <button onClick={handlePinSubmit} className="h-16 rounded-2xl bg-green-500 text-white flex items-center justify-center hover:bg-green-600 shadow-lg shadow-green-200 active:scale-95"><ArrowLeft size={28} className="rotate-180"/></button>
                   </div>
                   <button onClick={onCancel} className="w-full py-4 text-gray-400 font-bold text-sm hover:text-gray-600 uppercase tracking-widest">Cancelar</button>
               </>
            )}
        </div>
      </div>
    </div>
  );
};

// --- 3. CREDENTIAL PRINT VIEW ---
export const CredentialPrintView = ({ member, appName }) => (
    <div className="w-[300px] border border-gray-200 bg-white p-6 text-center shadow-lg print:shadow-none print:border-none print:w-full mx-auto mt-8 rounded-xl">
        <div className="mb-4"><h1 className="text-xl font-black uppercase tracking-widest border-b-2 border-black pb-2 mb-2">{appName || 'STAFF'}</h1></div>
        <div className="w-32 h-32 bg-gray-100 mx-auto rounded-full mb-4 flex items-center justify-center border-4 border-gray-50"><User size={64} className="text-gray-300"/></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{member.name}</h2>
        <p className="text-sm font-bold text-gray-500 uppercase mb-6 bg-gray-100 inline-block px-3 py-1 rounded-full">{member.role}</p>
        <div className="bg-black text-white p-4 rounded-xl mb-4"><p className="text-xs uppercase text-gray-400 mb-1">Tu PIN de Acceso</p><p className="text-4xl font-mono font-bold tracking-[0.5em]">{member.pin}</p></div>
        <p className="text-[10px] text-gray-400 mt-4">Mantén este código seguro.</p>
    </div>
);

// --- 4. PRINTABLE VIEW (Reporte) ---
export const PrintableView = ({ items }) => (
    <div className="hidden print:block p-8 bg-white text-black">
        <h1 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2">Inventario General</h1>
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-black"><th className="text-left py-2">Producto</th><th className="text-right py-2">Precio</th><th className="text-right py-2">Stock</th><th className="text-right py-2">Valor Total</th></tr>
            </thead>
            <tbody>
                {items.map(item => (
                    <tr key={item.id} className="border-b border-gray-200">
                        <td className="py-2">{item.name}</td>
                        <td className="text-right py-2">{item.price}</td>
                        <td className="text-right py-2">{item.stock}</td>
                        <td className="text-right py-2">{(item.price * item.stock).toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// --- 5. ADMIN ROW (Fila de Tabla) ---
export const AdminRow = ({ item, onEdit, onDelete }) => {
  const price = Number(item.price) || 0; 
  const cost = Number(item.cost) || 0; 
  const margin = price - cost; 
  const marginPercent = price > 0 ? ((margin / price) * 100).toFixed(1) : 0;
  
  let marginColor = "text-red-500"; 
  if (marginPercent > 30) marginColor = "text-yellow-600"; 
  if (marginPercent > 50) marginColor = "text-green-600";
  
  const stockNum = Number(item.stock);
  const hasStock = item.stock !== undefined && item.stock !== '';
  const isLowStock = hasStock && stockNum < 5;
  const stockDisplay = hasStock ? String(item.stock) : '-';

  return (
    <tr className={`border-b border-gray-100 transition-colors ${isLowStock ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
      <td className="p-4">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 relative">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }}/> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ChefHat size={20}/></div>}
                {isLowStock && <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center"><AlertTriangle size={24} className="text-red-600 animate-pulse"/></div>}
            </div>
            <div>
                <div className="font-bold text-gray-800">{item.name}</div>
                <div className="text-xs text-gray-500">{item.category}</div>
            </div>
        </div>
      </td>
      <td className="p-4 text-center font-medium text-gray-600">
          <div className="flex flex-col items-center">
              <span className={`text-lg ${isLowStock ? 'font-black text-red-600' : ''}`}>{stockDisplay}</span>
              {isLowStock && <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase font-bold animate-pulse">¡Poco Stock!</span>}
          </div>
      </td>
      <td className="p-4 text-right font-medium text-gray-600">Bs. {cost.toFixed(2)}</td>
      <td className="p-4 text-right font-bold text-gray-800">Bs. {price.toFixed(2)}</td>
      <td className={`p-4 text-right font-bold ${marginColor}`}><div className="flex flex-col items-end"><span>{marginPercent}%</span><span className="text-xs opacity-75">(Bs. {margin.toFixed(2)})</span></div></td>
      <td className="p-4 text-right no-print"><div className="flex justify-end gap-2"><button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button><button onClick={() => { if (window.confirm('¿Eliminar?')) onDelete(item.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button></div></td>
    </tr>
  );
};