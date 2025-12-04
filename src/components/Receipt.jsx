// src/components/Receipt.jsx
import React from 'react';
import { ChefHat, Printer, ArrowLeft, CheckCircle, ClipboardList, XCircle } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose }) => {
  if (!data) return null;

  const isPreCheck = data.type === 'order';
  const isVoid = data.type === 'void';

  let borderClass = 'border-green-600'; 
  if (isPreCheck) borderClass = 'border-yellow-400'; 
  if (isVoid) borderClass = 'border-red-500';

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 animate-in zoom-in duration-300">
      
      {/* Botones */}
      <div className="no-print flex gap-4 mb-6 sticky top-4 z-50">
        <button 
          onClick={onClose} 
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all font-bold"
        >
          <ArrowLeft size={20}/> {isVoid || !isPreCheck ? 'Volver a Caja' : 'Seguir Vendiendo'}
        </button>
        <button 
          onClick={onPrint} 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all font-bold animate-pulse"
        >
          <Printer size={20}/> IMPRIMIR
        </button>
      </div>

      {/* --- TICKET --- */}
      <div 
        id="printable-ticket" 
        className={`bg-white p-4 shadow-2xl w-[300px] text-gray-900 font-mono text-sm leading-tight relative print:shadow-none print:w-full print:m-0 border-t-8 ${borderClass}`}
      >
        {/* Encabezado */}
        <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-3">
          <div className="flex justify-center mb-2">
            {isVoid ? <XCircle size={32} className="text-red-600"/> : (isPreCheck ? <ClipboardList size={32} className="text-gray-800"/> : <ChefHat size={32} className="text-gray-800"/>)}
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest mb-1">{data.businessName || 'RESTAURANTE'}</h2>
          
          {/* Etiqueta de Estado */}
          <div className={`text-xs font-bold text-white px-2 py-1 inline-block rounded uppercase ${isVoid ? 'bg-red-600' : (isPreCheck ? 'bg-black' : 'bg-green-600')}`}>
             {isVoid ? 'ANULADO' : (isPreCheck ? 'COMANDA' : 'PAGADO')}
          </div>
          
          <p className="text-[10px] text-gray-500 mt-2">{data.date}</p>
        </div>

        {/* --- SECCIÓN DE RESPONSABLES (NUEVO) --- */}
        <div className="mb-3 pb-3 border-b border-dashed border-gray-300 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Garzón:</span>
            <span className="font-bold uppercase">{data.staffName}</span>
          </div>
          
          {/* Solo mostramos Cajero si es una venta final cobrada */}
          {!isPreCheck && !isVoid && data.cashierName && (
             <div className="flex justify-between mt-1">
               <span className="text-gray-500">Cajero:</span>
               <span className="font-bold uppercase">{data.cashierName}</span>
             </div>
          )}

          {data.orderId && (
             <div className="flex justify-between mt-1 text-[10px] text-gray-400">
               <span>Ref:</span>
               <span>#{data.orderId.slice(-6).toUpperCase()}</span>
             </div>
          )}
        </div>

        {/* Items */}
        <div className="border-b border-dashed border-gray-300 pb-3 mb-3">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-gray-400 border-b">
                <th className="pb-1">Cant.</th>
                <th className="pb-1">Prod.</th>
                <th className="pb-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-xs font-medium">
              {data.items.map((item, index) => (
                <tr key={index} className="align-top">
                  <td className="py-1 pr-2">{item.qty}</td>
                  <td className="py-1 pr-2">{item.name}</td>
                  <td className="py-1 text-right whitespace-nowrap">{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales y Pagos */}
        {!isPreCheck && !isVoid && (
          <div className="mb-3 pt-1 text-xs">
             <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Detalle de Pago:</div>
             {data.payments && data.payments.length > 0 ? (
               data.payments.map((p, idx) => (
                 <div key={idx} className="flex justify-between">
                    <span>{p.method}</span>
                    <span>{p.amount.toFixed(2)}</span>
                 </div>
               ))
             ) : (
               <div className="flex justify-between">
                  <span>Efectivo</span>
                  <span>{(data.received || data.total).toFixed(2)}</span>
               </div>
             )}
             
             {data.change > 0 && (
               <div className="flex justify-between mt-1 pt-1 border-t border-dotted border-gray-200 font-bold">
                  <span>Cambio:</span>
                  <span>{data.change.toFixed(2)}</span>
               </div>
             )}
          </div>
        )}

        {/* Gran Total */}
        <div className="flex justify-between items-end mb-6 border-t-2 border-black pt-2">
          <span className="text-sm font-bold">TOTAL</span>
          <span className={`text-2xl font-black ${isVoid ? 'text-red-500 line-through' : 'text-black'}`}>
             Bs. {data.total.toFixed(2)}
          </span>
        </div>

        {/* Pie */}
        <div className="text-center text-[10px] text-gray-400">
          {isVoid ? (
             <p className="font-bold text-red-600 uppercase border border-red-200 p-1">OPERACIÓN INVALIDADA</p>
          ) : (
             <>
               <p>¡GRACIAS POR SU PREFERENCIA!</p>
               {/* Espacio extra para corte de papel */}
               <div className="h-4"></div>
             </>
          )}
        </div>
      </div>

      <p className="no-print mt-4 text-gray-400 text-xs text-center">
        Vista previa de impresión (80mm/58mm)
      </p>
    </div>
  );
};

export default Receipt;