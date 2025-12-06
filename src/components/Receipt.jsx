// src/components/Receipt.jsx
import React from 'react';
import { ChefHat, Printer, ArrowLeft, CheckCircle, ClipboardList, XCircle, Lock } from 'lucide-react';

const Receipt = ({ data, onClose }) => {
  if (!data) return null;

  const isPreCheck = data.type === 'order';
  const isVoid = data.type === 'void';
  const isZReport = data.type === 'z-report';

  // Configuración Visual
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

  // --- FUNCIÓN MAESTRA DE IMPRESIÓN (TÉCNICA IFRAME) ---
  const handlePrint = () => {
    // 1. Obtener el contenido HTML del ticket
    const ticketElement = document.getElementById('printable-ticket');
    if (!ticketElement) return;

    // 2. Crear un iframe invisible (El túnel de impresión)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // 3. Escribir el ticket dentro del iframe con estilos forzados
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Imprimir Ticket</title>
          <style>
            body { margin: 0; padding: 0; font-family: monospace; }
            #ticket { width: 100%; max-width: 300px; margin: 0; }
            /* Copia de estilos visuales básicos para que salga bonito */
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .flex { display: flex; justify-content: space-between; }
            .border-b { border-bottom: 1px dashed black; padding-bottom: 5px; margin-bottom: 5px; }
            .border-t { border-top: 1px dashed black; padding-top: 5px; margin-top: 5px; }
            .text-xs { font-size: 12px; }
            .text-sm { font-size: 14px; }
            .text-xl { font-size: 18px; }
            .uppercase { text-transform: uppercase; }
            img { max-width: 100%; }
          </style>
        </head>
        <body>
          <div id="ticket">
            ${ticketElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // 4. Esperar a que cargue (imágenes/qr) y mandar a imprimir
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      // 5. Eliminar el iframe después de imprimir
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
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
        
        <button 
          onClick={handlePrint} 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all font-bold animate-pulse"
        >
          <Printer size={20}/> IMPRIMIR AHORA
        </button>
      </div>

      {/* --- EL TICKET (Visible en pantalla para revisar) --- */}
      <div 
        id="printable-ticket" 
        className={`bg-white p-4 shadow-2xl w-[300px] text-gray-900 font-mono text-sm leading-tight relative border-t-8 ${borderClass}`}
      >
        {/* Encabezado */}
        <div className="text-center border-b pb-4 mb-3">
          <h2 className="text-xl font-bold uppercase tracking-widest mb-1">{data.businessName || 'RESTAURANTE'}</h2>
          <div className="text-xs font-bold uppercase mb-1">
             {title}
          </div>
          <p className="text-[10px] text-gray-500">{data.date}</p>
        </div>

        {/* --- CONTENIDO REPORTE Z --- */}
        {isZReport ? (
            <div className="text-xs">
                <div className="mb-3 pb-3 border-b">
                    <div className="flex"><span className="text-gray-500">Cajero:</span><span className="font-bold uppercase">{data.staffName}</span></div>
                    <div className="flex mt-1"><span className="text-gray-500">ID:</span><span>#{data.registerId.slice(-6)}</span></div>
                </div>
                <div className="mb-3 pb-3 border-b">
                    <p className="font-bold mb-2 uppercase pb-1">Resumen</p>
                    <div className="flex mb-1"><span>Fondo Inicial:</span><span>Bs. {data.openingAmount.toFixed(2)}</span></div>
                    <div className="flex mb-1"><span>(+) Ventas Efec.:</span><span>Bs. {data.stats.cashSales.toFixed(2)}</span></div>
                    <div className="flex mb-1 text-red-500"><span>(-) Gastos:</span><span>- Bs. {data.stats.totalExpenses.toFixed(2)}</span></div>
                    <div className="flex mt-2 pt-1 border-t font-black text-sm"><span>= EFECTIVO CAJA:</span><span>Bs. {data.finalCash.toFixed(2)}</span></div>
                </div>
                {data.expensesList && data.expensesList.length > 0 && (
                    <div className="mb-3 pt-2 border-t">
                        <p className="font-bold mb-1 uppercase text-[10px]">Gastos:</p>
                        {data.expensesList.map((ex, i) => (
                            <div key={i} className="flex text-[10px] text-gray-500"><span>{ex.description}</span><span>-{ex.amount.toFixed(2)}</span></div>
                        ))}
                    </div>
                )}
                <div className="text-center mt-8 mb-4"><div className="border-b w-3/4 mx-auto mb-1" style={{borderBottom:'1px solid black'}}></div><span className="text-[10px] uppercase">Firma Cajero</span></div>
            </div>
        ) : (
            /* --- CONTENIDO VENTA/COMANDA --- */
            <>
                <div className="mb-3 pb-3 border-b text-xs">
                    <div className="flex"><span className="text-gray-500">{isVoid ? 'Anulado:' : 'Atendido:'}</span><span className="font-bold uppercase">{data.staffName}</span></div>
                    {!isPreCheck && !isVoid && data.cashierName && (<div className="flex mt-1"><span className="text-gray-500">Cajero:</span><span className="font-bold uppercase">{data.cashierName}</span></div>)}
                    {data.orderId && (<div className="flex mt-1 text-[10px] text-gray-400"><span>Ref:</span><span>#{data.orderId.slice(-6).toUpperCase()}</span></div>)}
                </div>

                <div className="border-b pb-3 mb-3">
                <table style={{width: '100%'}}>
                    <thead><tr className="text-[10px] uppercase text-gray-400 border-b"><th className="text-left">Cant.</th><th className="text-left">Prod.</th><th className="text-right">Total</th></tr></thead>
                    <tbody className="text-xs font-medium">
                    {data.items.map((item, index) => (
                        <tr key={index}>
                        <td className="pr-2">{item.qty}</td><td className="pr-2">{item.name}</td><td className="text-right">{(item.price * item.qty).toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

                {!isPreCheck && !isVoid && (
                <div className="mb-3 pt-1 text-xs">
                    <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Pago:</div>
                    {data.payments && data.payments.length > 0 ? (data.payments.map((p, idx) => (<div key={idx} className="flex"><span>{p.method}</span><span>{p.amount.toFixed(2)}</span></div>))) : (<div className="flex"><span>Efectivo</span><span>{(data.received || data.total).toFixed(2)}</span></div>)}
                    {data.change > 0 && (<div className="flex mt-1 pt-1 border-t font-bold"><span>Cambio:</span><span>{data.change.toFixed(2)}</span></div>)}
                </div>
                )}

                <div className="flex items-end mb-6 border-t pt-2" style={{borderTop:'2px solid black'}}>
                <span className="text-sm font-bold">TOTAL {isVoid ? 'CANCELADO' : ''}</span>
                <span className={`text-2xl font-black ${isVoid ? 'text-red-600 line-through' : 'text-black'}`}>Bs. {data.total.toFixed(2)}</span>
                </div>
                <div className="text-center text-[10px] text-gray-400 mt-4">{isVoid ? 'OPERACIÓN ANULADA' : 'GRACIAS POR SU VISITA'}</div>
            </>
        )}
      </div>
      <p className="no-print mt-4 text-gray-400 text-xs text-center">Vista previa (80mm/58mm)</p>
    </div>
  );
};

export default Receipt;