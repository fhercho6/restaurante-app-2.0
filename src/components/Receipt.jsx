// src/components/Receipt.jsx - CORRECCIÓN DEFINITIVA (TICKET VS REPORTE)
import React, { useEffect } from 'react';
import { X, Printer } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose, printerType = 'thermal' }) => {
  if (!data) return null;

  const fmt = (value) => { 
      const num = parseFloat(value); 
      return isNaN(num) ? '0.00' : num.toFixed(2); 
  };

  // DETECTAR SI ES CORTESÍA
  const isCourtesySale = data.payments && data.payments.some(p => p.method === 'Cortesía');

  // DETERMINAR QUÉ FORMATO USAR
  // Regla de Oro: Solo el 'z-report' obedece a la configuración de impresora (Carta/Térmica).
  // Todo lo demás (Ventas, Gastos, Pedidos) SIEMPRE es Térmico.
  const useThermalFormat = data.type !== 'z-report' || printerType === 'thermal';

  // --- MODO 1: REPORTE CARTA (SOLO PARA CIERRE Z SI ESTÁ CONFIGURADO) ---
  const renderLetterReport = () => {
      const stats = data.stats || {};
      const productRows = data.soldProducts ? data.soldProducts.map(p => `<tr><td style="text-align:left;padding:6px;border-bottom:1px solid #eee;">${p.name}</td><td style="text-align:center;padding:6px;border-bottom:1px solid #eee;">${p.qty}</td><td style="text-align:center;padding:6px;border-bottom:1px solid #eee;">0</td><td style="text-align:right;padding:6px;border-bottom:1px solid #eee;">${fmt(p.totalCost)}</td><td style="text-align:right;padding:6px;border-bottom:1px solid #eee;">${fmt(p.total)}</td></tr>`).join('') : '';
      const expensesRows = stats.expensesList && stats.expensesList.length > 0 ? stats.expensesList.map(e => `<tr><td style="padding:4px 0;color:#444;">• ${e.description || 'Gasto'}</td><td style="text-align:right;padding:4px 0;">${fmt(e.amount)}</td></tr>`).join('') : '<tr><td colspan="2" style="font-style:italic;color:#999;padding:4px 0;">Sin gastos</td></tr>';

      return `<html><head><title>Reporte de Cierre</title><style>body{font-family:'Arial',sans-serif;font-size:11px;margin:30px;color:#000}.header-section{text-align:center;margin-bottom:20px}.report-title{font-size:18px;font-weight:bold;text-decoration:underline;margin-bottom:5px;text-transform:uppercase}.report-meta{font-size:12px;margin-bottom:20px}table{width:100%;border-collapse:collapse;margin-bottom:30px;font-size:11px}th{border-top:2px solid #000;border-bottom:2px solid #000;padding:6px;font-weight:bold;text-transform:uppercase;background-color:#f9f9f9}td{padding:6px;vertical-align:top}.financial-table td{border-bottom:1px dotted #ccc}.financial-table th{text-align:left}.product-table th.left{text-align:left}.product-table th.center{text-align:center}.product-table th.right{text-align:right}.product-table td{font-family:'Courier New',monospace;font-size:12px}.footer-total{font-size:14px;font-weight:bold;text-align:right;border-top:2px solid #000;padding-top:5px;margin-top:-20px}.text-right{text-align:right}.box{flex:1;border:1px solid #000;padding:15px}.main-container{display:flex;gap:40px;margin-bottom:30px}.clean-table{width:100%;border-collapse:collapse}.clean-table td{padding:5px 0;border-bottom:1px dashed #ddd}.section-header{background-color:#000;color:#fff;padding:5px 10px;font-weight:bold;margin-top:20px}</style></head><body>
            <div class="header-section"><div class="report-title">REPORTE POR JORNADA</div><div class="report-meta">JORNADA: ${new Date(data.openedAt || Date.now()).toLocaleDateString()} al ${new Date(data.date).toLocaleDateString()} <br/>RESPONSABLE: ${(data.staffName || 'Admin').toUpperCase()}</div></div>
            <div class="main-container"><div class="box"><div style="font-weight:900;border-bottom:2px solid #000;margin-bottom:10px;">I. INGRESOS</div><table class="clean-table"><tr><td>FONDO INICIAL</td><td class="text-right">${fmt(data.openingAmount)}</td></tr><tr><td>EFECTIVO</td><td class="text-right">${fmt(stats.cashSales)}</td></tr><tr><td>QR/TRANSF</td><td class="text-right">${fmt(stats.qrSales)}</td></tr><tr><td>TARJETA</td><td class="text-right">${fmt(stats.cardSales)}</td></tr><tr style="font-weight:bold;border-top:2px solid #000;"><td>TOTAL INGRESOS</td><td class="text-right">${fmt(data.openingAmount+stats.cashSales+stats.qrSales+stats.cardSales)}</td></tr></table></div>
            <div class="box"><div style="font-weight:900;border-bottom:2px solid #000;margin-bottom:10px;">II. EGRESOS</div><table class="clean-table">${expensesRows}<tr style="font-weight:bold;border-top:2px solid #000;"><td>TOTAL GASTOS</td><td class="text-right">${fmt(stats.totalExpenses)}</td></tr></table><div style="margin-top:20px;border:2px solid #000;padding:10px;background:#f9f9f9;text-align:right;font-size:18px;font-weight:900;">EFECTIVO REAL: Bs. ${fmt(data.finalCash)}</div></div></div>
            <div class="section-header">III. DETALLE PRODUCTOS</div><table class="product-table"><thead><tr><th class="left">PRODUCTO</th><th class="center">CANT</th><th class="center">COMBO</th><th class="right">COSTO</th><th class="right">VENTA</th></tr></thead><tbody>${productRows}<tr style="background:#ddd;font-weight:900;"><td colspan="3" class="right">TOTALES</td><td class="right">${fmt(stats.totalCostOfGoods)}</td><td class="right">${fmt((stats.cashSales||0)+(stats.digitalSales||0))}</td></tr></tbody></table>
      </body></html>`;
  };

  // --- MODO 2: TICKET TÉRMICO (VENTAS, PEDIDOS Y CORTESÍAS) ---
  const renderThermalReport = () => {
      const stats = data.stats || {};
      
      // TÍTULO DEL TICKET
      let title = (data.businessName || 'LicoBar').toUpperCase();
      if (data.type === 'expense') title = 'VALE DE GASTO';
      if (isCourtesySale) title = 'RECIBO DE CORTESÍA';

      // SUBTÍTULO
      let subtitle = '';
      if (isCourtesySale) subtitle = '(SIN VALOR COMERCIAL)';
      else if (!data.payments && data.type === 'order') subtitle = '(PRE-CUENTA / COMANDA)';

      // Filas de productos (Venta/Cortesía)
      let itemsHtml = '';
      if (data.items) {
          itemsHtml = data.items.map(item => `
            <div class="row" style="margin-bottom: 2px;">
                <div class="col-qty">${item.qty}</div>
                <div class="col-name">${item.name}</div>
                <div class="col-price">${isCourtesySale ? '0.00' : fmt(item.price * item.qty)}</div>
            </div>
          `).join('');
      }

      // Filas de productos (Reporte Z en térmico)
      let zReportRows = '';
      if (data.soldProducts) {
          zReportRows = data.soldProducts.map(p => `
            <div class="row"><div class="col-qty">${p.qty}</div><div class="col-name">${p.name}</div><div class="col-price">${fmt(p.total)}</div></div>
          `).join('');
      }

      return `
        <html>
        <head>
            <style>
                * { box-sizing: border-box; }
                body { font-family: 'Arial', sans-serif; margin: 0; padding: 10px 0; width: 72mm; font-size: 12px; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: 700; }
                .border-b { border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px; }
                .flex-between { display: flex; justify-content: space-between; }
                .row { display: flex; width: 100%; font-size: 11px; }
                .col-qty { width: 10%; text-align: center; } 
                .col-name { width: 65%; padding-left: 5px; } 
                .col-price { width: 25%; text-align: right; }
                .courtesy-box { border: 2px dashed #000; padding: 5px; margin: 10px 0; text-align: center; }
            </style>
        </head>
        <body>
            
            <div class="text-center border-b">
                <div class="bold" style="font-size:16px;">${data.type === 'z-report' ? 'CIERRE DE CAJA' : title}</div>
                ${subtitle ? `<div style="font-size:10px; font-weight:bold;">${subtitle}</div>` : ''}
                <div style="font-size:10px; margin-top:2px;">${data.date}</div>
                <div style="font-size:10px;">Atiende: ${data.staffName}</div>
                ${data.orderId ? `<div style="font-size:10px;">Folio: #${data.orderId.slice(-6)}</div>` : ''}
            </div>

            ${data.type === 'z-report' ? `
                <div class="flex-between"><span>Fondo Inicial:</span><span>${fmt(data.openingAmount)}</span></div>
                <div class="flex-between bold"><span>(+) Ventas:</span><span>${fmt((stats.cashSales||0)+(stats.digitalSales||0))}</span></div>
                <div class="flex-between"><span>(-) Gastos:</span><span>${fmt(stats.totalExpenses)}</span></div>
                <div class="border-b" style="margin:5px 0;"></div>
                <div class="flex-between bold" style="font-size:18px;"><span>CAJA:</span><span>Bs. ${fmt(data.finalCash)}</span></div>
                <br/><div class="bold text-center border-b">RESUMEN PRODUCTOS</div>${zReportRows}
            
            ` : data.type === 'expense' ? `
                <div style="margin-top:10px;">
                    <span style="font-size:10px;">CONCEPTO:</span><br/>
                    <span class="bold uppercase" style="font-size:14px;">${data.description}</span>
                    <div class="border-b" style="margin:5px 0;"></div>
                    <div class="flex-between bold" style="font-size:18px;"><span>MONTO:</span><span>Bs. ${fmt(data.amount)}</span></div>
                    <br/><br/><div class="text-center" style="font-size:10px;border-top:1px solid #000;padding-top:5px;">FIRMA</div>
                </div>

            ` : `
                <div class="row bold" style="font-size:10px; border-bottom:1px solid #000; margin-bottom:2px;">
                    <div class="col-qty">C</div>
                    <div class="col-name">DESCRIPCION</div>
                    <div class="col-price">TOTAL</div>
                </div>

                ${itemsHtml}
                
                <div class="border-b" style="margin:5px 0;"></div>
                
                ${isCourtesySale ? `
                    <div class="courtesy-box">
                        <div class="bold" style="font-size:14px;">CORTESÍA AUTORIZADA</div>
                        <div style="font-size:10px;">Total Bonificado: Bs. ${fmt(data.total)}</div>
                    </div>
                    <div class="flex-between bold" style="font-size:16px;"><span>A PAGAR:</span><span>Bs. 0.00</span></div>
                ` : `
                    <div class="flex-between bold" style="font-size:18px;"><span>TOTAL:</span><span>Bs. ${fmt(data.total)}</span></div>
                    
                    ${data.payments ? `
                        <div style="margin-top:5px; font-size:10px;">
                            ${data.payments.map(p => `<div class="flex-between"><span>PAGO ${p.method.toUpperCase()}:</span><span>${fmt(p.amount)}</span></div>`).join('')}
                        </div>
                    ` : ''}
                    
                    ${data.changeGiven > 0 ? `<div class="text-right bold" style="margin-top:2px;">CAMBIO: ${fmt(data.changeGiven)}</div>` : ''}
                `}
            `}

            <div style="margin-top:15px; text-align:center; font-size:10px;">*** GRACIAS POR SU VISITA ***</div>
        </body>
        </html>
      `;
  };

  const handlePrintInNewWindow = () => {
    // Si NO es Z-Report, forzamos dimensiones de ticket térmico
    const isThermal = useThermalFormat;
    
    const width = isThermal ? 400 : 1000;
    const height = isThermal ? 600 : 800;
    
    const printWindow = window.open('', 'PRINT', `height=${height},width=${width}`);
    if (!printWindow) { alert("Permite las ventanas emergentes."); return; }
    
    const htmlContent = isThermal ? renderThermalReport() : renderLetterReport();
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  useEffect(() => { if (data && data.autoPrint) handlePrintInNewWindow(); }, [data]);

  const previewAmount = data.type === 'expense' ? data.amount : (data.type === 'z-report' ? data.finalCash : data.total);

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gray-800 p-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">
             {useThermalFormat ? 'TICKET DE VENTA' : 'REPORTE CARTA'}
          </h3>
          <div className="flex gap-2">
              <button onClick={handlePrintInNewWindow} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"><Printer size={18}/> IMPRIMIR</button>
              <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><X size={18}/></button>
          </div>
        </div>
        <div className="p-6 bg-gray-100 flex justify-center">
            <div className={`bg-white p-4 shadow text-center w-full border-t-4 ${isCourtesySale ? 'border-yellow-500' : 'border-blue-500'}`}>
                <p className="font-bold text-lg mb-2">{isCourtesySale ? 'RECIBO CORTESÍA' : (data.businessName || 'LicoBar')}</p>
                <p className="text-3xl font-black text-gray-800">Bs. {isCourtesySale ? '0.00' : fmt(previewAmount)}</p>
                
                {/* INDICADOR DE FORMATO */}
                <p className="text-xs text-gray-400 mt-4 uppercase font-bold border-t pt-2">
                    Formato: {useThermalFormat ? 'TÉRMICO (80mm)' : 'CARTA (A4)'}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;