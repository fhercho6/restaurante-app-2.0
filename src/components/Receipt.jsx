// src/components/Receipt.jsx - VERSIÓN AUTO-IMPRESIÓN
import React, { useEffect } from 'react'; // <--- Importamos useEffect
import { ChefHat, Printer, ArrowLeft, CheckCircle, ClipboardList, XCircle, Lock } from 'lucide-react';

const Receipt = ({ data, onClose }) => {
  if (!data) return null;

  const isPreCheck = data.type === 'order';
  const isVoid = data.type === 'void';
  const isZReport = data.type === 'z-report';

  let borderClass = 'border-green-600'; 
  let icon = <CheckCircle size={32} className="text-gray-800"/>;
  let title = 'TICKET DE VENTA';
  let bgLabel = 'bg-green-600';

  if (isPreCheck) { borderClass = 'border-yellow-400'; icon = <ClipboardList size={32} className="text-gray-800"/>; title = 'COMANDA'; bgLabel = 'bg-black'; }
  if (isVoid) { borderClass = 'border-red-500'; icon = <XCircle size={32} className="text-red-600"/>; title = 'ANULACIÓN'; bgLabel = 'bg-red-600'; }
  if (isZReport) { borderClass = 'border-gray-800'; icon = <Lock size={32} className="text-gray-800"/>; title = 'CIERRE DE CAJA'; bgLabel = 'bg-gray-800'; }

  // --- FUNCIÓN DE IMPRESIÓN (Popup) ---
  const handlePrintPopup = () => {
    const ticketContent = document.getElementById('printable-ticket');
    if (!ticketContent) return;

    const win = window.open('', '', 'width=340,height=600');
    if (!win) {
        alert("⚠️ Habilita los pop-ups para imprimir automático");
        return;
    }

    win.document.write(`
      <html>
        <head>
          <title>Imprimiendo...</title>
          <style>
            body { font-family: monospace; margin: 0; padding: 5px; width: 100%; font-size: 12px; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .flex { display: flex; justify-content: space-between; }
            .font-bold { font-weight: bold; }
            .text-xs { font-size: 11px; }
            .border-b { border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px; }
            .uppercase { text-transform: uppercase; }
            img { max-width: 100px; height: auto; display: block; margin: 0 auto; }
            svg { display: none; } 
          </style>
        </head>
        <body>${ticketContent.innerHTML}</body>
      </html>
    `);
    
    win.document.close();
    win.focus();
    
    // Disparo automático
    setTimeout(() => {
        win.print();
        // Opcional: Cerrar ventana automáticamente tras imprimir
        // win.close(); 
    }, 500);
  };

  // --- EFECTO: IMPRIMIR AUTOMÁTICAMENTE AL CARGAR ---
  useEffect(() => {
      handlePrintPopup();
  }, []); // Se ejecuta una vez al montar el componente

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 animate-in zoom-in duration-300">
      
      <div className="flex gap-4 mb-6 sticky top-4 z-50">
        <button onClick={onClose} className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-full shadow-lg font-bold">
          <ArrowLeft size={20}/> {isZReport ? 'Finalizar' : 'Volver'}
        </button>
        {/* El botón manual sigue existiendo por si falla el automático */}
        <button onClick={handlePrintPopup} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg font-bold">
          <Printer size={20}/> RE-IMPRIMIR
        </button>
      </div>

      {/* --- TICKET (Oculto visualmente en el centro, lo importante es el Popup) --- */}
      <div id="printable-ticket" className={`bg-white p-4 shadow-2xl w-[300px] text-gray-900 font-mono text-sm leading-tight relative border-t-8 ${borderClass}`}>
        <div className="text-center border-b pb-4 mb-3">
          <div className="flex justify-center mb-2">{icon}</div>
          <h2 className="text-xl font-black uppercase tracking-widest mb-1">{data.businessName || 'RESTAURANTE'}</h2>
          <div className={`text-xs font-bold text-white px-2 py-1 inline-block rounded uppercase ${bgLabel}`}>{title}</div>
          <p className="text-[10px] text-gray-500 mt-2">{data.date}</p>
        </div>

        {isZReport ? (
            <div className="text-xs">
                <div className="mb-3 pb-3 border-b">
                    <div className="flex justify-between"><span className="text-gray-500">Cajero:</span><span className="font-bold uppercase">{data.staffName}</span></div>
                    <div className="flex justify-between mt-1"><span className="text-gray-500">ID:</span><span>#{data.registerId ? data.registerId.slice(-6) : '---'}</span></div>
                </div>
                <div className="mb-3 pb-3 border-b">
                    <p className="font-bold mb-2 uppercase border-b pb-1">Efectivo</p>
                    <div className="flex justify-between mb-1"><span>Fondo Inicial:</span><span>Bs. {(data.openingAmount || 0).toFixed(2)}</span></div>
                    <div className="flex justify-between mb-1"><span>(+) Ventas Efec.:</span><span>Bs. {(data.stats?.cashSales || 0).toFixed(2)}</span></div>
                    <div className="flex justify-between mb-1 text-red-500"><span>(-) Gastos:</span><span>- Bs. {(data.stats?.totalExpenses || 0).toFixed(2)}</span></div>
                    <div className="flex justify-between mt-2 pt-1 border-t font-black text-sm"><span>= EN CAJA:</span><span>Bs. {(data.finalCash || 0).toFixed(2)}</span></div>
                </div>
                <div className="mb-3 pb-3 border-b">
                    <p className="font-bold mb-2 uppercase border-b pb-1">Bancos</p>
                    <div className="flex justify-between mb-1"><span>QR:</span><span>Bs. {(data.stats?.qrSales || 0).toFixed(2)}</span></div>
                    <div className="flex justify-between mb-1"><span>Tarjeta:</span><span>Bs. {(data.stats?.cardSales || 0).toFixed(2)}</span></div>
                </div>
                {data.expensesList?.length > 0 && (
                    <div className="mb-3 pt-2">
                        <p className="font-bold mb-1 uppercase text-[10px]">Gastos:</p>
                        {data.expensesList.map((ex, i) => (<div key={i} className="flex justify-between text-[10px] text-gray-500"><span>{ex.description}</span><span>-{(Number(ex.amount)).toFixed(2)}</span></div>))}
                    </div>
                )}
                <div className="text-center mt-8 mb-4"><br/>_______________________<br/><span className="text-[10px] uppercase">Firma Cajero</span></div>
            </div>
        ) : (
            <>
                <div className="mb-3 pb-3 border-b text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">{isVoid ? 'Anulado:' : 'Atendido:'}</span><span className="font-bold uppercase">{data.staffName}</span></div>
                    {!isPreCheck && !isVoid && data.cashierName && (<div className="flex justify-between mt-1"><span className="text-gray-500">Cajero:</span><span className="font-bold uppercase">{data.cashierName}</span></div>)}
                    {data.orderId && (<div className="flex justify-between mt-1 text-[10px] text-gray-400"><span>Ref:</span><span>#{data.orderId.slice(-6).toUpperCase()}</span></div>)}
                </div>
                <div className="border-b pb-3 mb-3">
                <table style={{width: '100%'}}>
                    <thead><tr className="text-[10px] uppercase text-gray-400 border-b"><th className="text-left">Cant</th><th className="text-left">Prod</th><th className="text-right">Total</th></tr></thead>
                    <tbody className="text-xs font-medium">
                    {data.items.map((item, index) => (
                        <tr key={index}>
                        <td style={{paddingRight:'5px'}}>{item.qty}</td><td style={{paddingRight:'5px'}}>{item.name}</td><td className="text-right">{(item.price * item.qty).toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
                {!isPreCheck && !isVoid && (
                <div className="mb-3 pt-1 text-xs">
                    <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Pago:</div>
                    {data.payments && data.payments.length > 0 ? (data.payments.map((p, idx) => (<div key={idx} className="flex justify-between"><span>{p.method}</span><span>{p.amount.toFixed(2)}</span></div>))) : (<div className="flex justify-between"><span>Efectivo</span><span>{(data.received || data.total).toFixed(2)}</span></div>)}
                    {data.change > 0 && (<div className="flex justify-between mt-1 pt-1 border-t font-bold"><span>Cambio:</span><span>{data.change.toFixed(2)}</span></div>)}
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