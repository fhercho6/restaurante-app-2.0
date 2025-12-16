// src/components/Receipt.jsx - FINAL CON TOTALES DE COSTOS
import React, { useEffect } from 'react';
import { X, Printer } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose, printerType = 'thermal' }) => {
  if (!data) return null;

  // --- MODO 1: REPORTE CARTA (A4/OFICIO) ---
  const renderLetterReport = () => {
      // FILAS DE PRODUCTOS
      const productRows = data.soldProducts ? data.soldProducts.map(p => `
        <tr>
            <td style="text-align: left; padding: 5px; border-bottom: 1px solid #ddd;">${p.name}</td>
            <td style="text-align: center; padding: 5px; border-bottom: 1px solid #ddd;">${p.qty}</td>
            <td style="text-align: center; padding: 5px; border-bottom: 1px solid #ddd;">0</td>
            <td style="text-align: right; padding: 5px; border-bottom: 1px solid #ddd;">${(p.totalCost || 0).toFixed(2)}</td>
            <td style="text-align: right; padding: 5px; border-bottom: 1px solid #ddd;">${p.total.toFixed(2)}</td>
        </tr>
      `).join('') : '';

      // FILAS DE GASTOS
      const expensesRows = data.stats && data.stats.expensesList ? data.stats.expensesList.map(e => `
        <tr>
            <td style="padding:4px;">GASTOS OPERATIVOS</td>
            <td style="padding:4px;">${e.description}</td>
            <td style="padding:4px; text-align:right;">${parseFloat(e.amount).toFixed(2)}</td>
        </tr>
      `).join('') : '';

      return `
        <html>
        <head>
            <title>Reporte de Cierre</title>
            <style>
                body { font-family: 'Arial', sans-serif; font-size: 11px; margin: 30px; color: #000; }
                .header-section { text-align: center; margin-bottom: 20px; }
                .report-title { font-size: 18px; font-weight: bold; text-decoration: underline; margin-bottom: 5px; text-transform: uppercase; }
                .report-meta { font-size: 12px; margin-bottom: 20px; }
                
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 11px; }
                th { border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 6px; font-weight: bold; text-transform: uppercase; background-color: #f9f9f9; }
                td { padding: 6px; vertical-align: top; }
                
                .financial-table td { border-bottom: 1px dotted #ccc; }
                .financial-table th { text-align: left; }
                
                .product-table th.left { text-align: left; }
                .product-table th.center { text-align: center; }
                .product-table th.right { text-align: right; }
                .product-table td { font-family: 'Courier New', monospace; font-size: 12px; }

                .footer-total { font-size: 14px; font-weight: bold; text-align: right; border-top: 2px solid #000; padding-top: 5px; margin-top: -20px; }
                .text-right { text-align: right; }
            </style>
        </head>
        <body>
            <div class="header-section">
                <div class="report-title">REPORTE POR JORNADA</div>
                <div class="report-meta">
                    JORNADA: ${new Date(data.openedAt).toLocaleDateString()} al ${new Date(data.date).toLocaleDateString()} <br/>
                    RESPONSABLE: ${data.staffName.toUpperCase()}
                </div>
            </div>

            <div style="font-weight:bold; margin-bottom:5px;">I. MOVIMIENTO DE CAJA</div>
            <table class="financial-table">
                <thead><tr><th style="width: 25%;">TIPO CUENTA</th><th style="width: 55%;">DETALLE / SUB-CUENTA</th><th style="width: 20%; text-align: right;">MONTO (Bs)</th></tr></thead>
                <tbody>
                    <tr><td>INGRESOS</td><td>FONDO INICIAL (APERTURA)</td><td class="text-right">${data.openingAmount.toFixed(2)}</td></tr>
                    <tr><td>INGRESOS</td><td>VENTAS EFECTIVO</td><td class="text-right">${data.stats.cashSales.toFixed(2)}</td></tr>
                    <tr><td>INGRESOS</td><td>VENTAS QR / TRANSFERENCIA</td><td class="text-right">${data.stats.qrSales.toFixed(2)}</td></tr>
                    <tr><td>INGRESOS</td><td>VENTAS TARJETA</td><td class="text-right">${data.stats.cardSales.toFixed(2)}</td></tr>
                    ${expensesRows}
                    ${data.stats.courtesyTotal > 0 ? `<tr><td style="color:red;">CONTROL</td><td>CORTESÍAS ENTREGADAS</td><td class="text-right">(${data.stats.courtesyTotal.toFixed(2)})</td></tr>` : ''}
                </tbody>
            </table>

            <div class="footer-total">SALDO FINAL EN CAJA (EFECTIVO) = Bs. ${data.finalCash.toFixed(2)}</div>

            <br/><br/>

            <div class="report-title" style="font-size: 14px; margin-bottom: 2px; text-align: center;">PRODUCTOS VENDIDOS</div>
            <div style="text-align: center; font-size: 11px; margin-bottom: 10px;">Jornada del ${data.date}</div>

            <table class="product-table">
                <thead>
                    <tr>
                        <th class="left" style="width: 40%;">Producto</th>
                        <th class="center" style="width: 10%;">VxUnid</th>
                        <th class="center" style="width: 10%;">VxCombo</th>
                        <th class="right" style="width: 20%;">T.Costo</th>
                        <th class="right" style="width: 20%;">T.Venta</th>
                    </tr>
                </thead>
                <tbody>
                    ${productRows}
                    <tr style="font-weight:bold; background-color:#eee; border-top: 2px solid black;">
                        <td>TOTAL GENERAL</td>
                        <td style="text-align:center;">${data.soldProducts ? data.soldProducts.reduce((a,b)=>a+b.qty,0) : 0}</td>
                        <td style="text-align:center;">0</td>
                        <td style="text-align:right;">${data.stats.totalCostOfGoods ? data.stats.totalCostOfGoods.toFixed(2) : '0.00'}</td>
                        <td style="text-align:right;">${((data.stats.cashSales + data.stats.digitalSales)).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </body>
        </html>
      `;
  };

  const renderThermalReport = () => { /* ... Lógica Térmica (sin cambios) ... */
      let itemsHtml = data.items ? data.items.map(item => `<div class="row" style="margin-bottom:2px;"><div class="col-qty">${item.qty}</div><div class="col-name">${item.name}</div><div class="col-price">${(item.price * item.qty).toFixed(2)}</div></div>`).join('') : '';
      let zReportRows = data.soldProducts ? data.soldProducts.map(p => `<div class="row"><div class="col-qty">${p.qty}</div><div class="col-name">${p.name}</div><div class="col-price">${p.total.toFixed(2)}</div></div>`).join('') : '';
      return `<html><head><style>*{box-sizing:border-box}body{font-family:'Arial',sans-serif;margin:0;padding:10px 5px;width:72mm;font-size:12px}.text-center{text-align:center}.text-right{text-align:right}.bold{font-weight:700}.border-b{border-bottom:1px solid #000;padding-bottom:5px;margin-bottom:5px}.flex-between{display:flex;justify-content:space-between}.row{display:flex;width:100%;font-size:11px}.col-qty{width:10%}.col-name{width:65%}.col-price{width:25%;text-align:right}</style></head><body><div class="text-center border-b"><div class="bold" style="font-size:16px;">${data.type==='z-report'?'CIERRE DE CAJA':(data.businessName||'LicoBar')}</div><div>${data.date}</div></div>${data.type==='z-report'?`<div class="flex-between"><span>Fondo Inicial:</span><span>${data.openingAmount.toFixed(2)}</span></div><div class="flex-between bold"><span>(+) Ventas:</span><span>${(data.stats.cashSales+data.stats.digitalSales).toFixed(2)}</span></div><div style="font-size:10px;margin-left:10px;"><div class="flex-between"><span>Efvo: ${data.stats.cashSales.toFixed(2)}</span><span>Dig: ${data.stats.digitalSales.toFixed(2)}</span></div></div><div class="flex-between"><span>(-) Gastos:</span><span>${data.stats.totalExpenses.toFixed(2)}</span></div><div class="border-b" style="margin:5px 0;"></div><div class="flex-between bold" style="font-size:18px;"><span>CAJA:</span><span>Bs. ${data.finalCash.toFixed(2)}</span></div><br/><div>DETALLE PRODUCTOS</div>${zReportRows}`:`${itemsHtml}<div class="border-b" style="margin:5px 0;"></div><div class="flex-between bold" style="font-size:18px;"><span>TOTAL:</span><span>Bs. ${data.total.toFixed(2)}</span></div>`}</body></html>`;
  };

  const handlePrintInNewWindow = () => {
    const width = printerType === 'letter' ? 1000 : 400;
    const height = printerType === 'letter' ? 800 : 600;
    const printWindow = window.open('', 'PRINT', `height=${height},width=${width}`);
    if (!printWindow) { alert("Permite las ventanas emergentes."); return; }
    const htmlContent = printerType === 'letter' ? renderLetterReport() : renderThermalReport();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  useEffect(() => { if (data && data.autoPrint) handlePrintInNewWindow(); }, [data]);

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gray-800 p-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">VISTA PREVIA ({printerType === 'letter' ? 'CARTA' : 'TICKET'})</h3>
          <div className="flex gap-2">
              <button onClick={handlePrintInNewWindow} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"><Printer size={18}/> IMPRIMIR</button>
              <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><X size={18}/></button>
          </div>
        </div>
        <div className="p-6 bg-gray-100 flex justify-center">
            <div className={`bg-white p-4 shadow text-center w-full border-t-4 ${printerType === 'letter' ? 'border-green-500' : 'border-blue-500'}`}>
                <p className="font-bold text-lg mb-2">{data.businessName || 'LicoBar'}</p>
                <p className="text-3xl font-black text-gray-800">Bs. {data.type === 'expense' ? data.amount.toFixed(2) : (data.type === 'z-report' ? data.finalCash.toFixed(2) : data.total.toFixed(2))}</p>
                <p className="text-xs text-gray-500 mt-4 uppercase font-bold">Formato: {printerType}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;