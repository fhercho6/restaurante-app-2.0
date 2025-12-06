// src/components/Receipt.jsx - VERSIÓN VENTANA POPUP (INFALIBLE)
import React from 'react';
import { ChefHat, Printer, ArrowLeft, CheckCircle, ClipboardList, XCircle, Lock } from 'lucide-react';

const Receipt = ({ data, onClose }) => {
  if (!data) return null;

  const isPreCheck = data.type === 'order';
  const isVoid = data.type === 'void';
  const isZReport = data.type === 'z-report';

  // Configuración Visual en Pantalla
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

  // --- FUNCIÓN MAESTRA DE IMPRESIÓN (VENTANA NUEVA) ---
  const handlePrintPopup = () => {
    // 1. Obtenemos el HTML del ticket tal cual se ve
    const ticketContent = document.getElementById('printable-ticket').innerHTML;
    
    // 2. Abrimos una ventana nueva en blanco
    const win = window.open('', '', 'width=350,height=600');
    
    // 3. Escribimos el documento HTML limpio para la impresora
    win.document.write('<html><head><title>Imprimir</title>');
    
    // 4. Estilos CSS forzados (Para que salga bonito en térmica)
    win.document.write(`
      <style>
        body { font-family: 'Courier New', monospace; margin: 0; padding: 0; width: 100%; }
        /* Ocultar iconos svg que a veces fallan al clonar, usamos texto */
        svg { display: none !important; } 
        
        .ticket-container { width: 100%; padding: 5px; box-sizing: border-box; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .flex { display: flex; justify-content: space-between; }
        .font-bold { font-weight: bold; }
        .text-xl { font-size: 18px; font-weight: bold; }
        .text-sm { font-size: 14px; }
        .text-xs { font-size: 12px; }
        .mb-1 { margin-bottom: 4px; }
        .mt-2 { margin-top: 8px; }
        .border-b { border-bottom: 1px dashed black; padding-bottom: 5px; margin-bottom: 5px; }
        .border-t { border-top: 1px dashed black; padding-top: 5px; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; }
        td { vertical-align: top; font-size: 12px; }
      </style>
    `);
    
    win.document.write('</head><body><div class="ticket-container">');
    win.document.write(ticketContent); // Pegamos el contenido
    win.document.write('</div></body></html>');
    
    win.document.close(); // Cerramos escritura
    win.focus(); // Enfocamos la ventana
    
    // 5. Mandar a imprimir y cerrar
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 animate-in zoom-in duration-300">
      
      {/* Botones de Acción */}
      <div className="flex gap-4 mb-6 sticky top-4 z-50">
        <button 
          onClick={onClose} 
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all font-bold"
        >
          <ArrowLeft size={20}/> {isZReport ? 'Finalizar' : 'Volver'}
        </button>
        
        {/* BOTÓN NUEVO (Popup) */}
        <button 
          onClick={handlePrintPopup} 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all font-bold animate-pulse"
        >
          <Printer size={20}/> IMPRIMIR AHORA
        </button>
      </div>

      {/* --- TICKET VISUAL EN PANTALLA --- */}
      <div 
        id="printable-ticket" 
        className={`bg-white p-4 shadow-2xl w-[300px] text-gray-900 font-mono text-sm leading-tight relative border-t-8 ${borderClass}`}
      >
        {/* Encabezado */}
        <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-3">
          {/* El icono solo es para pantalla, en papel se oculta por CSS del popup */}
          <div className="flex justify-center mb-2">{icon}</div>
          <h2 className="text-xl font-black uppercase tracking-widest mb-1">{data.businessName || 'RESTAURANTE'}</h2>
          <div className="text-center font-bold uppercase text-xs mb-1">
             {title}
          </div>
          <p className="text-[10px] text-gray-500 mt-2">{data.date}</p>
        </div>

        {/* --- CONTENIDO REPORTE Z --- */}
        {isZReport ? (
            <div className="text-xs">
                <div className="mb-3 pb-3 border-b border-dashed border-gray-300">
                    <div className="flex justify-between"><span className="text-gray-500">Cajero:</span><span className="font-bold uppercase">{data.staffName}</span></div>
                    <div className="flex justify-between mt-1"><span className="text-gray-500">Turno ID:</span><span>#{data.registerId.slice(-6)}</span></div>
                </div>
                <div className="mb-3 pb-3 border-b border-dashed border-gray-300">
                    <p className="font-bold mb-2 uppercase border-b border-gray-100 pb-1">Resumen</p>
                    <div className="flex justify-between mb-1"><span>Fondo Inicial:</span><span>Bs. {data.openingAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between mb-1"><span>(+) Ventas Efec.:</span><span>Bs. {data.stats.cashSales.toFixed(2)}</span></div>
                    <div className="flex justify-between mb-1 text-red-500"><span>(-) Gastos:</span><span>- Bs. {data.stats.totalExpenses.toFixed(2)}</span></div>
                    <div className="flex justify-between mt-2 pt-1 border-t border-dotted border-gray-400 font-black text-sm"><span>= EFECTIVO CAJA:</span><span>Bs. {data.finalCash.toFixed(2)}</span></div>
                </div>
                <div className="mb-3 pb-3 border-b border-dashed border-gray-300">
                    <p className="font-bold mb-2 uppercase border-b border-gray-100 pb-1">Digital</p>
                    <div className="flex justify-between mb-1"><span>QR:</span><span>Bs. {data.stats.qrSales.toFixed(2)}</span></div>
                    <div className="flex justify-between mb-1"><span>Tarjeta:</span><span>Bs. {data.stats.cardSales.toFixed(2)}</span></div>
                </div>
                {data.expensesList && data.expensesList.length > 0 && (
                    <div className="mb-3 pt-2 border-t border-dashed border-gray-300">
                        <p className="font-bold mb-1 uppercase text-[10px]">Gastos:</p>
                        {data.expensesList.map((ex, i) => (
                            <div key={i} className="flex justify-between text-[10px] text-gray-500"><span>{ex.description}</span><span>-{ex.amount.toFixed(2)}</span></div>
                        ))}
                    </div>
                )}
                <div className="text-center mt-8 mb-4"><br/>_______________________<br/><span className="text-[10px] uppercase">Firma Cajero</span></div>
            </div>
        ) : (
            /* --- CONTENIDO VENTA/COMANDA --- */
            <>
                <div className="mb-3 pb-3 border-b border-dashed border-gray-300 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">{isVoid ? 'Anulado por:' : 'Atendido por:'}</span><span className="font-bold uppercase">{data.staffName}</span></div>
                {!isPreCheck && !isVoid && data.cashierName && (<div className="flex justify-between mt-1"><span className="text-gray-500">Cajero:</span><span className="font-bold uppercase">{data.cashierName}</span></div>)}
                {data.orderId && (<div className="flex justify-between mt-1 text-[10px] text-gray-400"><span>Ref:</span><span>#{data.orderId.slice(-6).toUpperCase()}</span></div>)}
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
                    <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Pago:</div>
                    {data.payments && data.payments.length > 0 ? (data.payments.map((p, idx) => (<div key={idx} className="flex justify-between"><span>{p.method}</span><span>{p.amount.toFixed(2)}</span></div>))) : (<div className="flex justify-between"><span>Efectivo</span><span>{(data.received || data.total).toFixed(2)}</span></div>)}
                    {data.change > 0 && (<div className="flex justify-between mt-1 pt-1 border-t border-dotted border-gray-200 font-bold"><span>Cambio:</span><span>{data.change.toFixed(2)}</span></div>)}
                </div>
                )}

                <div className="flex justify-between items-end mb-6 border-t-2 border-black pt-2">
                <span className="text-sm font-bold">TOTAL {isVoid ? 'CANCELADO' : ''}</span>
                <span className={`text-2xl font-black ${isVoid ? 'text-red-600 line-through' : 'text-black'}`}>Bs. {data.total.toFixed(2)}</span>
                </div>
                <div className="text-center text-[10px] text-gray-400 mt-4">{isVoid ? 'OPERACIÓN ANULADA' : 'GRACIAS POR SU VISITA'}</div>
            </>
        )}
      </div>
      <p className="no-print mt-4 text-gray-400 text-xs text-center">Vista previa</p>
    </div>
  );
};

export default Receipt;