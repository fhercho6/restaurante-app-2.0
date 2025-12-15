// src/components/Receipt.jsx - CON VALE DE GASTOS
import React from 'react';
import { X, Printer, DollarSign } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose }) => {
  if (!data) return null;

  // --- 1. TICKET DE VENTA (Normal) ---
  if (data.type === 'order' || data.type === 'quick_sale') {
    return (
      <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white w-full max-w-sm shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
          <div className="bg-gray-800 p-3 flex justify-between items-center no-print">
            <h3 className="text-white font-bold text-sm">VISTA PREVIA TICKET</h3>
            <div className="flex gap-2">
                <button onClick={onPrint} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"><Printer size={18}/></button>
                <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"><X size={18}/></button>
            </div>
          </div>
          <div className="p-6 overflow-y-auto font-mono text-sm leading-relaxed text-gray-900 print:p-0 print:overflow-visible print:w-full print:text-black">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-black uppercase mb-1">{data.businessName || 'LicoBar'}</h2>
              <p className="text-xs">Ticket #{data.orderId ? data.orderId.slice(-6) : '---'}</p>
              <p className="text-xs">{data.date}</p>
              <p className="text-xs mt-1">Atendido por: {data.staffName}</p>
            </div>
            <div className="border-t border-b border-dashed border-gray-400 py-2 my-2">
              <div className="flex justify-between font-bold text-xs uppercase mb-1"><span>Cant. Producto</span><span>Total</span></div>
              {data.items.map((item, index) => (
                <div key={index} className="flex justify-between text-xs py-0.5"><span className="truncate w-3/4">{item.qty} x {item.name}</span><span>{((item.price * item.qty) || 0).toFixed(2)}</span></div>
              ))}
            </div>
            <div className="flex justify-between items-center text-lg font-black mt-2"><span>TOTAL</span><span>Bs. {data.total.toFixed(2)}</span></div>
            {data.payments && (<div className="mt-2 text-xs border-t border-dashed pt-2">{data.payments.map((p, i) => (<div key={i} className="flex justify-between"><span>{p.method}</span><span>{p.amount.toFixed(2)}</span></div>))}{data.changeGiven > 0 && (<div className="flex justify-between mt-1 font-bold"><span>Cambio:</span><span>{data.changeGiven.toFixed(2)}</span></div>)}</div>)}
            <div className="text-center mt-6 text-[10px]"><p>¡GRACIAS POR SU PREFERENCIA!</p><p className="mt-1">*** COPIA CLIENTE ***</p></div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. VALE DE GASTO (NUEVO) ---
  if (data.type === 'expense') {
    return (
      <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white w-full max-w-sm shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
          <div className="bg-red-900 p-3 flex justify-between items-center no-print">
            <h3 className="text-white font-bold text-sm flex items-center gap-2"><DollarSign size={16}/> VALE DE SALIDA</h3>
            <div className="flex gap-2">
                <button onClick={onPrint} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg"><Printer size={18}/></button>
                <button onClick={onClose} className="bg-red-800 hover:bg-red-700 text-white p-2 rounded-lg"><X size={18}/></button>
            </div>
          </div>

          <div className="p-8 font-mono text-gray-900 print:p-0 print:w-full print:text-black">
            <div className="text-center border-b-2 border-black pb-4 mb-4">
              <h2 className="text-2xl font-black uppercase tracking-widest">VALE DE CAJA</h2>
              <p className="text-xs uppercase mt-1">{data.businessName}</p>
              <p className="text-xs mt-1">{data.date}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500">Motivo / Concepto:</p>
                <p className="text-lg font-bold leading-tight">{data.description}</p>
              </div>
              
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500">Monto Retirado:</p>
                <p className="text-3xl font-black">Bs. {data.amount.toFixed(2)}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500">Autorizado por:</p>
                <p className="text-sm">{data.staffName}</p>
              </div>
            </div>

            {/* Línea de Firma */}
            <div className="mt-12 pt-2 border-t border-black text-center">
              <p className="text-xs font-bold uppercase">Firma de Recibido</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. REPORTE Z (Cierre) ---
  if (data.type === 'z-report') {
    return (
      <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white w-full max-w-sm shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
          <div className="bg-gray-800 p-3 flex justify-between items-center no-print">
            <h3 className="text-white font-bold text-sm">REPORTE Z (CIERRE)</h3>
            <div className="flex gap-2">
                <button onClick={onPrint} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"><Printer size={18}/></button>
                <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><X size={18}/></button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto font-mono text-xs leading-relaxed text-gray-900 print:p-0 print:w-full print:text-black">
            <div className="text-center mb-4 border-b-2 border-black pb-2">
              <h2 className="text-xl font-black uppercase">REPORTE DE CIERRE</h2>
              <p className="text-sm font-bold">{data.businessName}</p>
              <p className="mt-1">{data.date}</p>
              <p>Cajero: {data.staffName}</p>
            </div>

            <div className="space-y-1 mb-4">
              <div className="flex justify-between"><span>Apertura:</span><span>{new Date(data.openedAt).toLocaleTimeString()}</span></div>
              <div className="flex justify-between"><span>Cierre:</span><span>{new Date().toLocaleTimeString()}</span></div>
            </div>

            <div className="border-b border-black pb-2 mb-2">
              <p className="font-bold uppercase mb-1">Resumen Financiero</p>
              <div className="flex justify-between"><span>Fondo Inicial:</span><span>{data.openingAmount.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold mt-1"><span>(+) VENTAS TOTALES:</span><span>{(data.stats.cashSales + data.stats.digitalSales).toFixed(2)}</span></div>
              <div className="pl-2 text-gray-600 print:text-black text-[10px]">
                  <div className="flex justify-between"><span>• Efectivo:</span><span>{data.stats.cashSales.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>• QR / Transf:</span><span>{data.stats.qrSales.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>• Tarjeta:</span><span>{data.stats.cardSales.toFixed(2)}</span></div>
              </div>
              <div className="flex justify-between mt-1 text-red-600 print:text-black"><span>(-) GASTOS:</span><span>{data.stats.totalExpenses.toFixed(2)}</span></div>
            </div>

            <div className="flex justify-between items-center text-lg font-black border-b-2 border-black pb-2 mb-4">
              <span>EFECTIVO EN CAJA</span>
              <span>Bs. {data.finalCash.toFixed(2)}</span>
            </div>

            {data.expensesList && data.expensesList.length > 0 && (
                <div className="mb-4">
                    <p className="font-bold uppercase border-b border-dashed border-gray-400 mb-1">Detalle de Gastos</p>
                    {data.expensesList.map((exp, i) => (
                        <div key={i} className="flex justify-between py-0.5"><span className="truncate w-2/3">{exp.description}</span><span>{exp.amount.toFixed(2)}</span></div>
                    ))}
                </div>
            )}

            {data.soldProducts && data.soldProducts.length > 0 ? (
                <div className="mt-4">
                    <p className="font-black uppercase border-b-2 border-black mb-2 text-center">PRODUCTOS VENDIDOS</p>
                    <div className="flex justify-between font-bold text-[10px] uppercase border-b border-gray-400 pb-1 mb-1"><span className="w-8 text-center">CANT</span><span className="flex-1 pl-2">DESCRIPCIÓN</span><span className="w-12 text-right">TOTAL</span></div>
                    {data.soldProducts.map((prod, i) => (
                        <div key={i} className="flex justify-between py-0.5 border-b border-dotted border-gray-300"><span className="w-8 text-center font-bold">{prod.qty}</span><span className="flex-1 pl-2 truncate">{prod.name}</span><span className="w-12 text-right">{prod.total.toFixed(2)}</span></div>
                    ))}
                </div>
            ) : (<div className="text-center mt-4 italic text-gray-500">No hubo ventas de productos.</div>)}

            <div className="text-center mt-8 text-[10px] opacity-50"><p>--- FIN DEL REPORTE ---</p></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Receipt;