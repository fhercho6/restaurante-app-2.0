// src/components/Receipt.jsx
import React from 'react';
import { ChefHat, Printer, ArrowLeft, CheckCircle, ClipboardList, XCircle, Lock } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose }) => {
  if (!data) return null;

  const isPreCheck = data.type === 'order';
  const isVoid = data.type === 'void';
  const isZReport = data.type === 'z-report'; // <--- NUEVO TIPO: CIERRE DE CAJA

  // Configuración Visual según el tipo
  let borderClass = 'border-green-600'; 
  let icon = <CheckCircle size={32} className="text-gray-800"/>;
  let title = 'TICKET DE VENTA';
  let bgLabel = 'bg-green-600';

  if (isPreCheck) {
      borderClass = 'border-yellow-400';
      icon = <ClipboardList size={32} className="text-gray-800"/>;
      title = 'COMANDA / PRE-CUENTA';
      bgLabel = 'bg-black';
  }
  if (isVoid) {
      borderClass = 'border-red-500';
      icon = <XCircle size={32} className="text-red-600"/>;
      title = 'COMPROBANTE DE ANULACIÓN';
      bgLabel = 'bg-red-600';
  }
  if (isZReport) {
      borderClass = 'border-gray-800';
      icon = <Lock size={32} className="text-gray-800"/>;
      title = 'CIERRE DE CAJA (ARQUEO)';
      bgLabel = 'bg-gray-800';
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 animate-in zoom-in duration-300">
      
      {/* Botones */}
      <div className="no-print flex gap-4 mb-6 sticky top-4 z-50">
        <button 
          onClick={onClose} 
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all font-bold"
        >
          <ArrowLeft size={20}/> {isZReport ? 'Finalizar y Salir' : (isVoid ? 'Volver' : 'Continuar')}
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
        <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-3">
          <div className="flex justify-center mb-2">{icon}</div>
          <h2 className="text-xl font-black uppercase tracking-widest mb-1">{data.businessName || 'RESTAURANTE'}</h2>
          <div className={`text-xs font-bold text-white px-2 py-1 inline-block rounded uppercase ${bgLabel}`}>
             {title}
          </div>
          <p className="text-[10px] text-gray-500 mt-2">{data.date}</p>
        </div>

        {/* --- CONTENIDO ESPECÍFICO: REPORTE Z (CIERRE) --- */}
        {isZReport ? (
            <div className="text-xs">
                <div className="mb-3 pb-3 border-b border-dashed border-gray-300">
                    <div className="flex justify-between"><span className="text-gray-500">Cajero:</span><span className="font-bold uppercase">{data.staffName}</span></div>
                    <div className="flex justify-between mt-1"><span className="text-gray-500">Turno ID:</span><span>#{data.registerId.slice(-6)}</span></div>
                    <div className="flex justify-between mt-1"><span className="text-gray-500">Apertura:</span><span>{new Date(data.openedAt).toLocaleTimeString()}</span></div>
                    <div className="flex justify-between mt-1"><span className="text-gray-500">Cierre:</span><span>{new Date().toLocaleTimeString()}</span></div>
                </div>

                <div className="mb-3 pb-3 border-b border-dashed border-gray-300">
                    <p className="font-bold mb-2 uppercase border-b border-gray-100 pb-1">Resumen de Movimientos</p>
                    
                    <div className="flex justify-between mb-1">
                        <span>(+) Fondo Inicial:</span>
                        <span>Bs. {data.openingAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>(+) Ventas Efectivo:</span>
                        <span>Bs. {data.stats.cashSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-1 text-red-500">
                        <span>(-) Gastos:</span>
                        <span>- Bs. {data.stats.totalExpenses.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between mt-2 pt-1 border-t border-dotted border-gray-400 font-black text-sm">
                        <span>= EFECTIVO EN CAJA:</span>
                        <span>Bs. {data.finalCash.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mb-3 pb-3 border-b border-dashed border-gray-300">
                    <p className="font-bold mb-2 uppercase border-b border-gray-100 pb-1">Otros Medios (Banco)</p>
                    <div className="flex justify-between mb-1">
                        <span>Ventas QR/Tarjeta:</span>
                        <span>Bs. {data.stats.digitalSales.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between font-bold mt-1">
                        <span>TOTAL VENDIDO:</span>
                        <span>Bs. {(data.stats.cashSales + data.stats.digitalSales).toFixed(2)}</span>
                    </div>
                </div>
                
                {/* Lista de Gastos si hay */}
                {data.expensesList && data.expensesList.length > 0 && (
                    <div className="mb-3">
                        <p className="font-bold mb-1 uppercase text-[10px]">Detalle de Gastos:</p>
                        {data.expensesList.map((ex, i) => (
                            <div key={i} className="flex justify-between text-[10px] text-gray-500">
                                <span>{ex.description}</span>
                                <span>-{ex.amount.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-center mt-8 mb-4">
                    <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
                    <span className="text-[10px] uppercase">Firma Cajero</span>
                </div>
            </div>
        ) : (
            /* --- CONTENIDO NORMAL (VENTA O COMANDA) --- */
            <>
                <div className="mb-3 pb-3 border-b border-dashed border-gray-300 text-xs">
                <div className="flex justify-between">
                    <span className="text-gray-500">{isVoid ? 'Anulado por:' : 'Atendido por:'}</span>
                    <span className="font-bold uppercase">{data.staffName}</span>
                </div>
                {!isPreCheck && !isVoid && data.cashierName && (
                    <div className="flex justify-between mt-1">
                    <span className="text-gray-500">Cajero:</span>
                    <span className="font-bold uppercase">{data.cashierName}</span>
                    </div>
                )}
                {data.orderId && (
                    <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                    <span>Ref:</span><span>#{data.orderId.slice(-6).toUpperCase()}</span>
                    </div>
                )}
                </div>

                <div className="border-b border-dashed border-gray-300 pb-3 mb-3">
                <table className="w-full text-left">
                    <thead><tr className="text-[10px] uppercase text-gray-400 border-b"><th className="pb-1">Cant.</th><th className="pb-1">Prod.</th><th className="pb-1 text-right">Total</th></tr></thead>
                    <tbody className="text-xs font-medium">
                    {data.items.map((item, index) => (
                        <tr key={index} className="align-top">
                        <td className="py-1 pr-2">{item.qty}</td><td className="py-1 pr-2">{item.name}</td><td className="py-1 text-right whitespace-nowrap">{(item.price * item.qty).toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

                {!isPreCheck && !isVoid && (
                <div className="mb-3 pt-1 text-xs">
                    <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Detalle de Pago:</div>
                    {data.payments && data.payments.length > 0 ? (
                    data.payments.map((p, idx) => (<div key={idx} className="flex justify-between"><span>{p.method}</span><span>{p.amount.toFixed(2)}</span></div>))
                    ) : (
                    <div className="flex justify-between"><span>Efectivo</span><span>{(data.received || data.total).toFixed(2)}</span></div>
                    )}
                    {data.change > 0 && (<div className="flex justify-between mt-1 pt-1 border-t border-dotted border-gray-200 font-bold"><span>Cambio:</span><span>{data.change.toFixed(2)}</span></div>)}
                </div>
                )}

                <div className="flex justify-between items-end mb-6 border-t-2 border-black pt-2">
                <span className="text-sm font-bold">TOTAL {isVoid ? 'CANCELADO' : ''}</span>
                <span className={`text-2xl font-black ${isVoid ? 'text-red-600 line-through' : 'text-black'}`}>Bs. {data.total.toFixed(2)}</span>
                </div>
            </>
        )}

        <div className="text-center text-[10px] text-gray-400 mt-4">
             {isZReport ? 'Cierre de turno.' : (isVoid ? 'OPERACIÓN SIN VALOR' : 'GRACIAS POR SU PREFERENCIA')}
             <div className="mt-1 text-[8px] opacity-50">Sistema Powered by ZZIF Cloud</div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;