// src/components/Receipt.jsx - VELOCIDAD, AUTO-CIERRE Y FORMATO CORRECTO
import React, { useEffect, useState } from 'react';
import { X, Printer, Loader2, CheckCircle } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose, printerType = 'thermal' }) => {
  const [status, setStatus] = useState('preview'); // Estados: 'preview', 'printing', 'done'

  if (!data) return null;

  const fmt = (value) => { 
      const num = parseFloat(value); 
      return isNaN(num) ? '0.00' : num.toFixed(2); 
  };

  // --- LÓGICA DE FORMATO INTELIGENTE ---
  // 1. ¿Es un reporte Z? Solo el reporte Z respeta la configuración 'Carta'.
  // 2. ¿Es cualquier otra cosa (Venta, Gasto, Cortesía)? SIEMPRE es Térmico.
  const isZReport = data.type === 'z-report';
  const useThermalFormat = !isZReport || printerType === 'thermal';

  // Datos auxiliares
  const isCourtesySale = data.payments && data.payments.some(p => p.method === 'Cortesía');
  const staffName = data.staffName || 'General';
  const cashierName = data.cashierName || 'Caja';
  // Solo números para el código grande
  const displayCode = data.orderId ? data.orderId.replace(/[^0-9]/g, '').slice(-4) : '----';

  // --- PLANTILLA CARTA (SOLO PARA CIERRES DE CAJA) ---
  const renderLetterReport = () => {
      const stats = data.stats || {};
      const productRows = data.soldProducts ? data.soldProducts.map(p => `<tr><td style="text-align:left;padding:5px;border-bottom:1px solid #eee;">${p.name}</td><td style="text-align:center;padding:5px;border-bottom:1px solid #eee;">${p.qtySold || 0}</td><td style="text-align:center;padding:5px;border-bottom:1px solid #eee; background-color:#fffbea;">${p.qtyCourtesy || 0}</td><td style="text-align:right;padding:5px;border-bottom:1px solid #eee;">${fmt(p.totalCost)}</td><td style="text-align:right;padding:5px;border-bottom:1px solid #eee; color:#d97706;">${(p.qtyCourtesy > 0 && p.total === 0) ? '(Regalo)' : (p.qtyCourtesy > 0 ? 'Mixto' : '-')}</td><td style="text-align:right;padding:5px;border-bottom:1px solid #eee;">${fmt(p.total)}</td></tr>`).join('') : '';
      const expensesRows = stats.expensesList && stats.expensesList.length > 0 ? stats.expensesList.map(e => `<tr><td style="padding:4px 0;color:#444;">• ${e.description || 'Gasto'}</td><td style="text-align:right;padding:4px 0;">${fmt(e.amount)}</td></tr>`).join('') : '<tr><td colspan="2" style="font-style:italic;color:#999;padding:4px 0;">Sin gastos operativos</td></tr>';

      return `<html><head><title>Reporte Z</title><style>body{font-family:'Arial',sans-serif;font-size:11px;margin:30px;color:#000}.header{text-align:center;margin-bottom:20px;border-bottom:3px solid #000;padding-bottom:15px}.box{border:1px solid #000;padding:15px;margin-bottom:10px}.clean-table{width:100%;border-collapse:collapse}.clean-table td{padding:5px 0;border-bottom:1px dashed #ddd}.clean-table .total-row td{border-top:2px solid #000;border-bottom:none;font-weight:900;font-size:14px;padding-top:10px}.product-table{width:100%;border-collapse:collapse;margin-top:10px;font-size:11px}.product-table th{background-color:#eee;text-align:left;padding:8px;border:1px solid #ccc;font-weight:bold}.product-table td{border:1px solid #ccc}.text-right{text-align:right}.text-center{text-align:center}.page-break{page-break-before:always}</style></head><body>
            <div class="header"><div style="font-size:24px;font-weight:900;">${data.businessName||'LicoBar'}</div><div style="font-size:16px;font-weight:bold;">REPORTE DE CIERRE DE CAJA (CORTE Z)</div><div style="font-size:11px;margin-top:5px;">${new Date(data.date).toLocaleDateString()} | Resp: ${staffName}</div></div>
            <div style="display:flex;gap:20px;"><div style="flex:1" class="box"><div style="font-weight:900;border-bottom:2px solid #000;">I. INGRESOS</div><table class="clean-table"><tr><td>FONDO INICIAL</td><td class="text-right">${fmt(data.openingAmount)}</td></tr><tr><td>EFECTIVO</td><td class="text-right">${fmt(stats.cashSales)}</td></tr><tr><td>QR/TRANSF</td><td class="text-right">${fmt(stats.qrSales)}</td></tr><tr><td>TARJETA</td><td class="text-right">${fmt(stats.cardSales)}</td></tr><tr class="total-row"><td>TOTAL INGRESOS</td><td class="text-right">${fmt(data.openingAmount+stats.cashSales+stats.qrSales+stats.cardSales)}</td></tr></table></div><div style="flex:1" class="box"><div style="font-weight:900;border-bottom:2px solid #000;">II. EGRESOS</div><table class="clean-table">${expensesRows}<tr class="total-row"><td>TOTAL GASTOS</td><td class="text-right" style="color:red">${fmt(stats.totalExpenses)}</td></tr></table><div style="margin-top:15px;padding:10px;background:#eee;text-align:right;font-weight:900;font-size:16px;">CAJA REAL: Bs. ${fmt(data.finalCash)}</div></div></div>
            <div class="page-break"></div><div style="font-weight:900;font-size:14px;margin-bottom:10px;border-bottom:1px solid #000;">III. DETALLE PRODUCTOS</div><table class="product-table"><thead><tr><th>PRODUCTO</th><th class="text-center">VEND</th><th class="text-center">CORT</th><th class="text-right">T.COSTO</th><th class="text-right">T.VENTA</th></tr></thead><tbody>${productRows}</tbody></table></body></html>`;
  };

  // --- MODO 2: TICKET TÉRMICO (VENTAS, CORTESÍAS, GASTOS) ---
  const renderThermalReport = () => {
      const stats = data.stats || {};
      let title = (data.businessName || 'LicoBar').toUpperCase();
      if (data.type === 'expense') title = 'VALE DE GASTO';
      if (isCourtesySale) title = 'RECIBO DE CORTESÍA';
      
      let itemsHtml = data.items ? data.items.map(item => `<div class="row" style="margin-bottom:2px;"><div class="col-qty">${item.qty}</div><div class="col-name">${item.name}</div><div class="col-price">${isCourtesySale ? '0.00' : fmt(item.price * item.qty)}</div></div>`).join('') : '';
      let zReportRows = data.soldProducts ? data.soldProducts.map(p => `<div class="row"><div class="col-qty">${p.qtySold + (p.qtyCourtesy||0)}</div><div class="col-name">${p.name}</div><div class="col-price">${fmt(p.total)}</div></div>`).join('') : '';

      return `<html><head><style>*{box-sizing:border-box}body{font-family:'Arial',sans-serif;margin:0;padding:5px 0;width:72mm;font-size:12px}.text-center{text-align:center}.text-right{text-align:right}.bold{font-weight:700}.border-b{border-bottom:1px solid #000;padding-bottom:5px;margin-bottom:5px}.flex-between{display:flex;justify-content:space-between}.row{display:flex;width:100%;font-size:11px}.col-qty{width:10%;text-align:center}.col-name{width:65%;padding-left:5px}.col-price{width:25%;text-align:right}.code-box{font-size:24px;font-weight:900;text-align:center;margin:5px 0;border:2px solid #000;padding:2px;}.courtesy-box{border:2px dashed #000;padding:5px;margin:10px 0;text-align:center}</style></head><body>
            <div class="text-center border-b">
                <div class="bold" style="font-size:16px;">${data.type==='z-report'?'CIERRE DE CAJA':title}</div>
                <div style="font-size:10px;">${data.date}</div>
                <div style="font-size:10px;margin-top:2px;">Atiende: ${staffName.split(' ')[0]} | Caja: ${cashierName.split(' ')[0]}</div>
                ${(data.type === 'order' || data.type === 'quick_sale') ? `<div class="code-box">#${displayCode}</div>` : ''}
            </div>
            ${data.type === 'z-report' ? `<div class="flex-between"><span>Fondo Inicial:</span><span>${fmt(data.openingAmount)}</span></div><div class="flex-between bold"><span>(+) Ventas:</span><span>${fmt((stats.cashSales||0)+(stats.digitalSales||0))}</span></div><div class="flex-between"><span>(-) Gastos:</span><span>${fmt(stats.totalExpenses)}</span></div><div class="border-b" style="margin:5px 0;"></div><div class="flex-between bold" style="font-size:18px;"><span>CAJA:</span><span>Bs. ${fmt(data.finalCash)}</span></div><br/><div class="bold text-center border-b">PRODUCTOS</div>${zReportRows}` : data.type === 'expense' ? `<div style="margin-top:10px;"><span style="font-size:10px;">CONCEPTO:</span><br/><span class="bold uppercase" style="font-size:14px;">${data.description}</span><div class="border-b" style="margin:5px 0;"></div><div class="flex-between bold" style="font-size:18px;"><span>RETIRO:</span><span>Bs. ${fmt(data.amount)}</span></div><br/><br/><div class="text-center" style="font-size:10px;border-top:1px solid #000;padding-top:5px;">FIRMA</div></div>` : `
                <div class="row bold" style="font-size:10px;border-bottom:1px solid #000;margin-bottom:2px;"><div class="col-qty">C</div><div class="col-name">DESCRIPCION</div><div class="col-price">TOTAL</div></div>${itemsHtml}<div class="border-b" style="margin:5px 0;"></div>
                ${isCourtesySale?`<div class="courtesy-box"><div class="bold" style="font-size:14px;">CORTESÍA AUTORIZADA</div><div style="font-size:10px;">Total Bonificado: Bs. ${fmt(data.total)}</div></div><div class="flex-between bold" style="font-size:16px;"><span>A PAGAR:</span><span>Bs. 0.00</span></div>`:`<div class="flex-between bold" style="font-size:18px;"><span>TOTAL:</span><span>Bs. ${fmt(data.total)}</span></div>${data.payments?`<div style="margin-top:5px;font-size:10px;">${data.payments.map(p=>`<div class="flex-between"><span>PAGO ${p.method.toUpperCase()}:</span><span>${fmt(p.amount)}</span></div>`).join('')}</div>`:''}${data.changeGiven>0?`<div class="text-right bold" style="margin-top:2px;">CAMBIO: ${fmt(data.changeGiven)}</div>`:''}`}
            `}
            <div style="margin-top:15px;text-align:center;font-size:10px;">*** GRACIAS POR SU VISITA ***</div></body></html>`;
  };

  const handlePrintInNewWindow = () => {
    // Definir tamaño de ventana
    const isThermal = useThermalFormat;
    const width = isThermal ? 400 : 1000;
    const height = isThermal ? 600 : 800;
    
    // Abrir ventana (puede ser bloqueada por el navegador la primera vez)
    const printWindow = window.open('', 'PRINT', `height=${height},width=${width}`);
    
    if (!printWindow) { 
        alert("⚠️ Por favor permite las ventanas emergentes para imprimir."); 
        setStatus('preview'); // Regresar a modo manual si falló
        return; 
    }
    
    const htmlContent = isThermal ? renderThermalReport() : renderLetterReport();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // EJECUCIÓN RÁPIDA DE IMPRESIÓN
    setTimeout(() => { 
        printWindow.print(); 
        printWindow.close(); 
        
        // Si es automático, cerramos el modal azul después de un momento
        if (data.autoPrint) {
            setStatus('done');
            setTimeout(onClose, 2000); // 2 segundos para ver el check verde
        }
    }, 100); 
  };

  // INICIO AUTOMÁTICO
  useEffect(() => { 
      if (data && data.autoPrint) {
          setStatus('printing');
          // Pequeño delay para asegurar que el DOM cargó
          setTimeout(handlePrintInNewWindow, 300);
      }
  }, [data]);

  const previewAmount = data.type === 'expense' ? data.amount : (data.type === 'z-report' ? data.finalCash : data.total);

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* CABECERA (Oculta si está imprimiendo solo) */}
        {status === 'preview' && (
            <div className="bg-gray-800 p-3 flex justify-between items-center">
                <h3 className="text-white font-bold text-sm">{useThermalFormat ? 'TICKET' : 'REPORTE CARTA'}</h3>
                <div className="flex gap-2">
                    <button onClick={handlePrintInNewWindow} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"><Printer size={18}/> IMPRIMIR</button>
                    <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><X size={18}/></button>
                </div>
            </div>
        )}

        {/* CUERPO DEL MODAL */}
        <div className="p-8 flex flex-col items-center justify-center text-center bg-gray-50 min-h-[200px]">
            
            {status === 'printing' ? (
                <>
                    <Loader2 size={64} className="text-blue-600 animate-spin mb-4"/>
                    <h3 className="text-xl font-bold text-gray-800">Imprimiendo...</h3>
                    <p className="text-sm text-gray-500">Por favor espere, no cierre la ventana.</p>
                </>
            ) : status === 'done' ? (
                <>
                    <CheckCircle size={64} className="text-green-500 mb-4 animate-in zoom-in"/>
                    <h3 className="text-xl font-bold text-gray-800">¡Listo!</h3>
                    <p className="text-sm text-gray-500">Impresión enviada correctamente.</p>
                </>
            ) : (
                /* MODO VISTA PREVIA (MANUAL) */
                <div className={`w-full p-4 border-t-4 bg-white shadow-sm ${isCourtesySale ? 'border-yellow-500' : 'border-blue-500'}`}>
                    <p className="font-bold text-lg mb-2">{isCourtesySale ? 'RECIBO CORTESÍA' : (data.businessName || 'LicoBar')}</p>
                    <p className="text-4xl font-black text-gray-800">Bs. {isCourtesySale ? '0.00' : fmt(previewAmount)}</p>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs text-left">
                        <div>
                            <span className="block text-gray-400 font-bold uppercase">Formato</span>
                            <span className="font-bold text-gray-700">{useThermalFormat ? 'TÉRMICO (80mm)' : 'CARTA (A4)'}</span>
                        </div>
                        <div>
                            <span className="block text-gray-400 font-bold uppercase">Tipo</span>
                            <span className="font-bold text-gray-700 uppercase">{data.type === 'z-report' ? 'Cierre Caja' : (isCourtesySale ? 'Cortesía' : 'Venta')}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Receipt;