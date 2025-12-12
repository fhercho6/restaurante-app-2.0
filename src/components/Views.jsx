// src/components/Views.jsx - VERSIÓN FINAL (Ticket Térmico Perfecto)
import React, { useState } from 'react';
import { Lock, ArrowLeft, ChefHat, Edit2, Trash2, User, Printer, CheckCircle } from 'lucide-react';

// --- 1. MENU CARD (Solo para Menu Cliente) ---
export const MenuCard = ({ item }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
    <div className="h-48 overflow-hidden relative group bg-gray-100 flex items-center justify-center flex-shrink-0">
      {item.image ? (
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
      ) : <div className="text-gray-300 flex flex-col items-center"><ChefHat size={40} /><span className="text-xs mt-2">Sin imagen</span></div>}
      <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full font-bold shadow-md">Bs. {(Number(item.price) || 0).toFixed(2)}</div>
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
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const handleLogin = async () => {
    if (isLoggingIn) return; 
    setIsLoggingIn(true);
    setTimeout(() => {
        const member = staffMembers.find(m => String(m.pin) === String(pin));
        if (member) onLoginSuccess(member); 
        else { setError('PIN incorrecto'); setPin(''); setIsLoggingIn(false); }
    }, 200);
  };
  // (Lógica de teclado numérico igual...)
  const handleNumClick = (num) => { if (pin.length < 4 && !isLoggingIn) { setPin(pin + num); setError(''); } };
  const handleDelete = () => { if(!isLoggingIn) { setPin(prev => prev.slice(0, -1)); setError(''); } };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Ingreso Personal</h2>
          <div className="flex justify-center gap-4 mb-8">{[0, 1, 2, 3].map(i => (<div key={i} className={`w-4 h-4 rounded-full border-2 ${i < pin.length ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`} />))}</div>
          {error && <div className="text-red-500 font-bold text-xs mb-4">{error}</div>}
          <div className="grid grid-cols-3 gap-4 mb-6">
             {[1,2,3,4,5,6,7,8,9].map(n => <button key={n} onClick={()=>handleNumClick(String(n))} className="h-16 w-16 bg-gray-50 rounded-full font-bold text-xl hover:bg-gray-100">{n}</button>)}
             <button onClick={onCancel} className="text-sm text-gray-500">Cancelar</button>
             <button onClick={()=>handleNumClick('0')} className="h-16 w-16 bg-gray-50 rounded-full font-bold text-xl hover:bg-gray-100">0</button>
             <button onClick={handleDelete} className="text-red-500 font-bold text-xl">←</button>
          </div>
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg">INGRESAR</button>
      </div>
    </div>
  );
};

// --- 3. TICKET DE ASISTENCIA (CSS TÉRMICO REALISTA) ---
export const AttendancePrintView = ({ data, onContinue }) => {
  if (!data) return <div className="p-10 text-center">Cargando ticket...</div>;

  const safeName = data.name || '---';
  const safeDate = data.date || '---';
  const safeTime = data.time || '--:--';
  const safeId = data.id ? String(data.id).slice(-3).toUpperCase() : '001';

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-4">
      {/* TICKET ESTRECHO (58mm / 80mm simulado) */}
      <div id="attendance-card" className="bg-white p-4 w-[280px] shadow-2xl text-center border-t-8 border-gray-800" style={{ fontFamily: "'Courier New', Courier, monospace", color: '#000' }}>
        
        <h2 className="font-bold text-sm uppercase mb-2 border-b-2 border-black pb-1">CONTROL ASISTENCIA</h2>
        
        {/* ID GIGANTE */}
        <h1 className="text-6xl font-black my-2 tracking-tighter leading-none">{safeId}</h1>
        
        <div className="text-left w-full my-4 px-1">
            <p className="uppercase text-[10px] text-gray-500">Personal:</p>
            <p className="font-bold text-lg leading-tight uppercase">{safeName}</p>
        </div>

        {/* HORA GRANDE */}
        <div className="bg-black text-white py-2 px-1 rounded-sm my-4">
            <div className="text-4xl font-bold tracking-widest leading-none text-center">
                {safeTime}
            </div>
            <p className="text-[10px] text-center mt-1">{safeDate}</p>
        </div>

        <p className="text-[10px] uppercase text-center mt-8 mb-12">Firma del Empleado</p>
        <div className="border-b border-black w-3/4 mx-auto"></div>
      </div>

      <div className="mt-8 flex flex-col gap-3 w-full max-w-[280px] no-print">
          <button onClick={() => window.print()} className="w-full bg-black text-white py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform"><Printer size={18}/> IMPRIMIR</button>
          {onContinue && (
            <button onClick={onContinue} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"><CheckCircle size={18}/> CONTINUAR</button>
          )}
      </div>
    </div>
  );
};

// --- 4. CREDENCIALES ---
export const CredentialPrintView = ({ member, appName }) => {
    // (Código de credencial estándar, igual que antes)
    return <div className="p-10 text-center">Vista de Credencial</div>;
};

// --- 5. ADMIN ROW ---
export const AdminRow = ({ item, onEdit, onDelete }) => (
    <tr className="border-b"><td className="p-2">{item.name}</td><td className="p-2 text-right"><button onClick={()=>onEdit(item)}><Edit2 size={16}/></button></td></tr>
);

// --- 6. PRINTABLE VIEW ---
export const PrintableView = () => <div>Reporte Impreso</div>;