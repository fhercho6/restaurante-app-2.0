// src/components/Receipt.jsx
import React from 'react';
import { ChefHat, Printer, ArrowLeft, CheckCircle, ClipboardList, XCircle } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose }) => {
  if (!data) return null;

  const isPreCheck = data.type === 'order';
  const isVoid = data.type === 'void'; // Nuevo tipo para anulaciones

  // Colores y Borde según el tipo de documento
  let borderClass = 'border-green-500'; // Venta Normal
  if (isPreCheck) borderClass = 'border-yellow-400'; // Comanda
  if (isVoid) borderClass = 'border-red-500'; // Anulación

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 animate-in zoom-in duration-300">
      
      {/* Botones de Acción */}
      <div className="no-print flex gap-4 mb-6 sticky top-4 z-50">
        <button 
          onClick={onClose} 
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all font-bold"
        >
          <ArrowLeft size={20}/> {isVoid ? 'Volver a Caja' : 'Continuar'}
        </button>
        <button 
          onClick={onPrint} 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all font-bold animate-pulse"
        >
          <Printer size={20}/> IMPRIMIR
        </button>
      </div>

      {/* --- EL TICKET --- */}
      <div 
        id="printable-ticket" 
        className={`bg-white p-4 shadow-2xl w-[300px] text-gray-900 font-mono text-sm leading-tight relative print:shadow-none print:w-full print:m-0 border-t-8 ${borderClass}`}
      >
        {/* Encabezado */}
        <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
          <div className="flex justify-center mb-2">
            {isVoid ? <XCircle size={32} className="text-red-600"/> : (isPreCheck ? <ClipboardList size={32} className="text-gray-800"/> : <ChefHat size={32} className="text-gray-800"/>)}
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest">{data.businessName || 'RESTAURANTE'}</h2>
          
          {/* TÍTULO DINÁMICO */}
          <p className={`text-sm font-bold mt-1 inline-block px-2 py-0.5 rounded text-white ${isVoid ? 'bg-red-600' : 'bg-black'}`}>
            {isVoid ? 'COMPROBANTE DE ANULACIÓN' : (isPreCheck ? 'COMANDA / PRE-CUENTA' : 'TICKET DE VENTA')}
          </p>
          
          <p className="text-xs text-gray-400 mt-1">{data.date}</p>
        </div>

        {/* Info */}
        <div className="mb-4 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">{isVoid ? 'Anulado por:' : 'Atendido por:'}</span>
            <span className="font-bold uppercase">{data.staffName}</span>
          </div>
          {data.orderId && (
             <div className="flex justify-between mt-1">
               <span className="text-gray-500">Ref:</span>
               <span>#{data.orderId.slice(-6).toUpperCase()}</span>
             </div>
          )}
        </div>

        {/* Lista de Items */}
        <div className="border-b-2 border-dashed border-gray-300 pb-4 mb-4">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-gray-400 border-b">
                <th className="pb-1">Cant.</th>
                <th className="pb-1">Prod.</th>
                <th className="pb-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {data.items.map((item, index) => (
                <tr key={index} className="align-top">
                  <td className="py-1 font-bold pr-2">{item.qty}</td>
                  <td className="py-1 pr-2">{item.name}</td>
                  <td className="py-1 text-right whitespace-nowrap">{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- TOTALES (Ocultar pagos si es anulación) --- */}
        {!isPreCheck && !isVoid && (
          <div className="mb-4 pt-2 border-t border-dashed border-gray-300">
             <div className="text-[10px] font-bold uppercase text-gray-500 mb-1">Pagos Recibidos:</div>
             {data.payments && data.payments.length > 0 ? (
               data.payments.map((p, idx) => (
                 <div key={idx} className="flex justify-between text-xs">
                    <span>{p.method}</span>
                    <span>Bs. {p.amount.toFixed(2)}</span>
                 </div>
               ))
             ) : (
               <div className="flex justify-between text-xs">
                  <span>{data.paymentMethod || 'Efectivo'}</span>
                  <span>Bs. {(data.received || data.total).toFixed(2)}</span>
               </div>
             )}
             {data.change > 0 && (
               <div className="flex justify-between text-xs mt-2 pt-1 border-t border-dotted border-gray-200 font-bold">
                  <span>Cambio entregado:</span>
                  <span>Bs. {data.change.toFixed(2)}</span>
               </div>
             )}
          </div>
        )}

        {/* Total Final */}
        <div className="flex justify-between items-end mb-6 border-t-2 border-black pt-2">
          <span className="text-sm font-bold">TOTAL {isVoid ? 'CANCELADO' : ''}</span>
          <span className={`text-2xl font-black ${isVoid ? 'text-red-600 line-through' : 'text-black'}`}>Bs. {data.total.toFixed(2)}</span>
        </div>

        {/* Pie de página */}
        <div className="text-center text-[10px] text-gray-400 mt-4 pt-4 border-t border-gray-200">
          {isVoid ? (
             <p className="font-bold text-red-600 uppercase">OPERACIÓN ANULADA - SIN VALOR</p>
          ) : (
             <>
               <p className="mb-1">¡GRACIAS POR SU PREFERENCIA!</p>
               <div className="mt-2 text-[8px] opacity-50">Sistema Powered by ZZIF Cloud</div>
             </>
          )}
        </div>

        {/* Marca visual en pantalla */}
        <div className={`no-print absolute -top-3 -right-3 text-white rounded-full p-2 shadow-lg ${isVoid ? 'bg-red-600' : (isPreCheck ? 'bg-yellow-500' : 'bg-green-500')}`}>
          {isVoid ? <XCircle size={24}/> : (isPreCheck ? <ClipboardList size={24}/> : <CheckCircle size={24}/>)}
        </div>
      </div>

      <p className="no-print mt-4 text-gray-400 text-xs text-center max-w-xs">
        {isVoid ? 'Imprima este comprobante para control de caja.' : 'Recibo oficial.'}
      </p>
    </div>
  );
};

export default Receipt;