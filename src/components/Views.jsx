// src/components/Views.jsx - EDICIÓN RÁPIDA TOTAL (Stock, Costo, Precio)
import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft, ChefHat, Edit2, Trash2, User, Printer, AlertTriangle, Loader2 } from 'lucide-react';

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

// --- 2. PIN LOGIN ---
// BUSCA ESTE COMPONENTE EN src/components/Views.jsx Y REEMPLÁZALO

export const PinLoginView = ({ staffMembers, onLoginSuccess, onCancel }) => {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [pin, setPin] = useState('');
  
  // Estado para los números desordenados
  const [shuffledKeys, setShuffledKeys] = useState(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']);

  // Función para desordenar array (Algoritmo Fisher-Yates)
  const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  // Cada vez que seleccionamos un usuario, mezclamos el teclado
  const handleSelectStaff = (member) => {
    setSelectedStaff(member);
    setPin('');
    setShuffledKeys(shuffleArray(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']));
  };

  const handleNumClick = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === selectedStaff.pin) {
          onLoginSuccess(selectedStaff);
        } else {
          toast.error('PIN Incorrecto');
          setPin('');
          // Opcional: Mezclar de nuevo tras error para más seguridad
          setShuffledKeys(shuffleArray(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']));
        }
      }
    }
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in zoom-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* ENCABEZADO */}
        <div className="bg-gray-900 p-6 text-center relative">
            <button onClick={selectedStaff ? () => setSelectedStaff(null) : onCancel} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2">
                <ArrowLeft size={24}/>
            </button>
            <h2 className="text-xl font-black text-white uppercase tracking-widest">
                {selectedStaff ? `HOLA, ${selectedStaff.name.split(' ')[0]}` : 'IDENTIFÍCATE'}
            </h2>
            {selectedStaff && <p className="text-xs text-gray-400 mt-1">Ingresa tu PIN de seguridad</p>}
        </div>

        {/* CUERPO */}
        <div className="flex-1 bg-gray-50 flex flex-col p-6">
            {!selectedStaff ? (
                // LISTA DE PERSONAL
                <div className="grid grid-cols-2 gap-4 overflow-y-auto">
                    {staffMembers.map(member => (
                        <button 
                            key={member.id} 
                            onClick={() => handleSelectStaff(member)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-orange-500 hover:shadow-md transition-all flex flex-col items-center gap-2 group"
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                <User size={24}/>
                            </div>
                            <span className="font-bold text-gray-700 text-sm">{member.name}</span>
                            <span className="text-[10px] text-gray-400 uppercase">{member.role}</span>
                        </button>
                    ))}
                </div>
            ) : (
                // TECLADO NUMÉRICO ALEATORIO
                <div className="flex flex-col items-center justify-center h-full">
                    {/* Visualizador de Puntos (Oculto) */}
                    <div className="flex gap-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-orange-500 scale-110' : 'bg-gray-300'}`}></div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                        {shuffledKeys.map((num) => (
                            <button 
                                key={num} 
                                onClick={() => handleNumClick(num)}
                                className="h-16 rounded-2xl bg-white border border-gray-200 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[4px] transition-all font-black text-2xl text-gray-800 hover:bg-gray-50"
                            >
                                {num}
                            </button>
                        ))}
                        
                        {/* Botón vacío o de cancelar */}
                        <div className="h-16"></div>
                        
                        {/* Botón Borrar */}
                        <button 
                            onClick={handleDelete}
                            className="h-16 rounded-2xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center shadow-[0_4px_0_0_rgba(220,38,38,0.1)] active:shadow-none active:translate-y-[4px] transition-all"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    </div>
                    
                    <p className="mt-6 text-[10px] text-gray-400 flex items-center gap-1">
                        <Lock size={10}/> Teclado aleatorio por seguridad
                    </p>
                </div>
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

// --- 4. PRINTABLE VIEW ---
export const PrintableView = ({ items }) => (
    <div className="hidden print:block p-8 bg-white text-black">
        <h1 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2">Inventario General</h1>
        <table className="w-full text-sm">
            <thead><tr className="border-b border-black"><th className="text-left py-2">Producto</th><th className="text-right py-2">Precio</th><th className="text-right py-2">Stock</th><th className="text-right py-2">Valor Total</th></tr></thead>
            <tbody>
                {items.map(item => (<tr key={item.id} className="border-b border-gray-200"><td className="py-2">{item.name}</td><td className="text-right py-2">{item.price}</td><td className="text-right py-2">{item.stock}</td><td className="text-right py-2">{(item.price * item.stock).toFixed(2)}</td></tr>))}
            </tbody>
        </table>
    </div>
);

// --- 5. ADMIN ROW (EDICIÓN TOTAL) ---
export const AdminRow = ({ item, onEdit, onDelete, isQuickEdit, onQuickUpdate }) => {
  const [localStock, setLocalStock] = useState(item.stock);
  const [localPrice, setLocalPrice] = useState(item.price);
  const [localCost, setLocalCost] = useState(item.cost);

  // Sincronizar estado local si cambia la BD (y no estamos editando)
  useEffect(() => { setLocalStock(item.stock); }, [item.stock]);
  useEffect(() => { setLocalPrice(item.price); }, [item.price]);
  useEffect(() => { setLocalCost(item.cost); }, [item.cost]);

  // Cálculos dinámicos (Usan los valores locales si estamos editando para ver el margen en tiempo real)
  const priceDisplay = isQuickEdit ? Number(localPrice) : Number(item.price) || 0;
  const costDisplay = isQuickEdit ? Number(localCost) : Number(item.cost) || 0;
  const stockDisplay = isQuickEdit ? localStock : (item.stock !== undefined && item.stock !== '' ? String(item.stock) : '-');
  
  const margin = priceDisplay - costDisplay; 
  const marginPercent = priceDisplay > 0 ? ((margin / priceDisplay) * 100).toFixed(1) : 0;
  
  let marginColor = "text-red-500"; 
  if (marginPercent > 30) marginColor = "text-yellow-600"; 
  if (marginPercent > 50) marginColor = "text-green-600";
  
  const stockNum = Number(localStock);
  const isLowStock = stockNum < 5;

  // Funciones genéricas de guardado
  const handleBlur = (field, val) => {
      // Solo guardamos si cambió el valor original
      if (String(val) !== String(item[field])) {
          onQuickUpdate(item.id, field, val);
      }
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter') { e.target.blur(); }
  };

  return (
    <tr className={`border-b border-gray-100 transition-colors ${isLowStock && !isQuickEdit ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
      <td className="p-4">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 relative group">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }}/> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ChefHat size={20}/></div>}
                {isLowStock && !isQuickEdit && <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center"><AlertTriangle size={24} className="text-red-600 animate-pulse"/></div>}
            </div>
            <div><div className="font-bold text-gray-800">{item.name}</div><div className="text-xs text-gray-500">{item.category}</div></div>
        </div>
      </td>
      
      {/* STOCK */}
      <td className="p-4 text-center font-medium text-gray-600">
          {isQuickEdit ? (
              <input type="number" className="w-16 p-2 text-center border-2 border-blue-400 rounded-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" value={localStock} onChange={(e) => setLocalStock(e.target.value)} onBlur={() => handleBlur('stock', localStock)} onKeyDown={handleKeyDown} />
          ) : (
              <div className="flex flex-col items-center"><span className={`text-lg ${isLowStock ? 'font-black text-red-600' : ''}`}>{stockDisplay}</span>{isLowStock && <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase font-bold animate-pulse">¡Poco Stock!</span>}</div>
          )}
      </td>
      
      {/* COSTO */}
      <td className="p-4 text-right font-medium text-gray-600">
          {isQuickEdit ? (
               <div className="flex justify-end items-center gap-1">
                 <span className="text-xs text-gray-400">Bs.</span>
                 <input type="number" step="0.5" className="w-20 p-2 text-right border-2 border-orange-300 rounded-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm" value={localCost} onChange={(e) => setLocalCost(e.target.value)} onBlur={() => handleBlur('cost', localCost)} onKeyDown={handleKeyDown} />
               </div>
          ) : (
               <span>Bs. {costDisplay.toFixed(2)}</span>
          )}
      </td>

      {/* PRECIO */}
      <td className="p-4 text-right font-bold text-gray-800">
          {isQuickEdit ? (
               <div className="flex justify-end items-center gap-1">
                 <span className="text-xs text-gray-400">Bs.</span>
                 <input type="number" step="0.5" className="w-20 p-2 text-right border-2 border-green-400 rounded-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm" value={localPrice} onChange={(e) => setLocalPrice(e.target.value)} onBlur={() => handleBlur('price', localPrice)} onKeyDown={handleKeyDown} />
               </div>
          ) : (
               <span>Bs. {priceDisplay.toFixed(2)}</span>
          )}
      </td>

      {/* MARGEN (Automático) */}
      <td className={`p-4 text-right font-bold ${marginColor}`}>
          <div className="flex flex-col items-end">
              <span>{marginPercent}%</span>
              <span className="text-xs opacity-75">(Bs. {margin.toFixed(2)})</span>
          </div>
      </td>

      <td className="p-4 text-right no-print">
          {!isQuickEdit && (
            <div className="flex justify-end gap-2"><button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button><button onClick={() => { if (window.confirm('¿Eliminar?')) onDelete(item.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button></div>
          )}
      </td>
    </tr>
  );
};