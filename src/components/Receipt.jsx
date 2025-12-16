// src/components/Receipt.jsx - REPORTE ORDENADO (ESTILO CONTABLE LIMPIO)
import React, { useEffect } from 'react';
import { X, Printer } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose, printerType = 'thermal' }) => {
  if (!data) return null;

  // --- FUNCIÓN DE SEGURIDAD (FORMATEADOR) ---
  const fmt = (value) => {
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // --- MODO 1: REPORTE CARTA (A4/OFICIO) - DISEÑO MEJORADO ---
  const renderLetterReport = () => {
      const stats = data.stats || {};
      
      // 1. FILAS DE PRODUCTOS
      const productRows = data.soldProducts ? data.soldProducts.map(p => `
        <tr>
            <td style="text-align: left; padding: 6px; border-bottom: 1px solid #eee;">${p.name}</td>
            <td style="text-align: center; padding: 6px; border-bottom: 1px solid #eee;">${p.qty}</td>
            <td style="text-align: center; padding: 6px; border-bottom: 1px solid #eee;">0</td>
            <td style="text-align: right; padding: 6px; border-bottom: 1px solid #eee;">${fmt(p.totalCost)}</td>
            <td style="text-align: right; padding: 6px; border-bottom: 1px solid #eee;">${fmt(p.total)}</td>
        </tr>
      `).join('') : '';

      // 2. FILAS DE GASTOS (Para la sección de Egresos)
      const expensesRows = stats.expensesList && stats.expensesList.length > 0 
        ? stats.expensesList.map(e => `
            <tr>
                <td style="padding: 4px 0; color: #444;">• ${e.description || 'Gasto General'}</td>
                <td style="text-align: right; padding: 4px 0;">${fmt(e.amount)}</td>
            </tr>
          `).join('') 
        : '<tr><td colspan="2" style="font-style: italic; color: #999; padding: 4px 0;">Sin gastos registrados</td></tr>';

      return `
        <html>
        <head>
            <title>Reporte de Cierre</title>
            <style>
                body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; margin: 40px; color: #333; line-height: 1.4; }
                
                /* ENCABEZADO */
                .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #000; padding-bottom: 15px; }
                .company-name { font-size: 24px; font-weight: 900; letter-spacing: 1px; margin-bottom: 5px; text-transform: uppercase; }
                .report-title { font-size: 16px; font-weight: bold; text-transform: uppercase; color: #555; }
                .meta-info { margin-top: 10px; font-size: 11px; color: #666; }
                
                /* CONTENEDOR PRINCIPAL - DOS COLUMNAS */
                .main-container { display: flex; gap: 40px; margin-bottom: 30px; }
                .box { flex: 1; border: 1px solid #000; padding: 15px; }
                .box-title { font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000; margin-bottom: 10px; padding-bottom: 5px; font-size: 13px; }
                
                /* TABLAS DENTRO DE LAS CAJAS */
                .clean-table { width: 100%; border-collapse: collapse; }
                .clean-table td { padding: 5px 0; border-bottom: 1px dashed #ddd; }
                .clean-table tr:last-child td { border-bottom: none; }
                .clean-table .total-row td { border-top: 2px solid #000; border-bottom: none; font-weight: 900; font-size: 14px; padding-top: 10px; }
                
                /* TABLA DE PRODUCTOS (ABAJO) */
                .product-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
                .product-table th { background-color: #eee; text-align: left; padding: 8px; border: 1px solid #ccc; font-weight: bold; }
                .product-table td { border: 1px solid #ccc; }
                .product-table .right { text-align: right; }
                .product-table .center { text-align: center; }

                /* UTILIDADES */
                .text-right { text-align: right; }
                .text-red { color: #cc0000; }
                .text-green { color: #008800; }
                .section-header { background-color: #000; color: #fff; padding: 5px 10px; font-weight: bold; margin-top: 20px; }
            </style>
        </head>
        <body>
            
            <div class="header">
                <div class="company-name">${data.businessName || 'LicoBar'}</div>
                <div class="report-title">REPORTE DE CIERRE DE CAJA (CORTE Z)</div>
                <div class="meta-info">
                    FECHA: ${new Date(data.date).toLocaleDateString()} &nbsp;|&nbsp; 
                    HORA CIERRE: ${new Date(data.date).toLocaleTimeString()} &nbsp;|&nbsp; 
                    RESPONSABLE: ${(data.staffName || 'Admin').toUpperCase()}
                </div>
            </div>

            ${data.type === 'z-report' ? `
            
            <div class="main-container">
                
                <div class="box">
                    <div class="box-title">I. INGRESOS Y VENTAS</div>
                    <table class="clean-table">
                        <tr>
                            <td>FONDO INICIAL (APERTURA)</td>
                            <td class="text-right">${fmt(data.openingAmount)}</td>
                        </tr>
                        <tr>
                            <td>VENTAS EFECTIVO</td>
                            <td class="text-right">${fmt(stats.cashSales)}</td>
                        </tr>
                        <tr>
                            <td>VENTAS QR / TRANSFERENCIA</td>
                            <td class="text-right">${fmt(stats.qrSales)}</td>
                        </tr>
                        <tr>
                            <td>VENTAS TARJETA</td>
                            <td class="text-right">${fmt(stats.cardSales)}</td>
                        </tr>
                        <tr class="total-row">
                            <td>TOTAL INGRESOS</td>
                            <td class="text-right text-green">${fmt(data.openingAmount + stats.cashSales + stats.qrSales + stats.cardSales)}</td>
                        </tr>
                    </table>
                </div>

                <div class="box">
                    <div class="box-title">II. EGRESOS (GASTOS)</div>
                    <table class="clean-table">
                        ${expensesRows}
                        <tr class="total-row">
                            <td>TOTAL GASTOS</td>
                            <td class="text-right text-red">${fmt(stats.totalExpenses)}</td>
                        </tr>
                    </table>

                    <div style="margin-top: 20px; border: 2px solid #000; padding: 10px; background: #f9f9f9;">
                        <div style="font-weight: bold; font-size: 11px; color: #555; text-transform: uppercase;">EFECTIVO REAL EN CAJA</div>
                        <div style="font-weight: 900; font-size: 24px; text-align: right;">Bs. ${fmt(data.finalCash)}</div>
                    </div>
                </div>
            </div>

            <div class="section-header">III. DETALLE DE PRODUCTOS VENDIDOS</div>
            <table class="product-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">PRODUCTO</th>
                        <th class="center" style="width: 10%;">CANT</th>
                        <th class="center" style="width: 10%;">COMBO</th>
                        <th class="right" style="width: 20%;">COSTO TOTAL</th>
                        <th class="right" style="width: 20%;">VENTA TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${productRows}
                    <tr style="background-color: #ddd; font-weight: 900;">
                        <td colspan="3" class="right">TOTALES GENERALES</td>
                        <td class="right">${fmt(stats.totalCostOfGoods)}</td>
                        <td class="right">${fmt((stats.cashSales || 0) + (stats.digitalSales || 0))}</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 10px; font-size: 10px; color: #666;">
                * La columna COSTO TOTAL es interna. | GANANCIA BRUTA ESTIMADA: <b>Bs. ${fmt(((stats.cashSales || 0) + (stats.digitalSales || 0)) - (stats.totalCostOfGoods || 0))}</b>
            </div>

            ` : `
                <div style="border: 1px solid #000; padding: 20px;">
                    <h2 style="text-align:center; margin-top:0;">DETALLE DE VENTA</h2>
                    <table class="product-table">
                        <thead><tr><th>CANT</th><th>DESCRIPCION</th><th class="right">PRECIO UNIT</th><th class="right">TOTAL</th></tr></thead>
                        <tbody>
                            ${data.items ? data.items.map(i => `
                                <tr>
                                    <td class="center">${i.qty}</td>
                                    <td>${i.name}</td>
                                    <td class="right">${fmt(i.price)}</td>
                                    <td class="right">${fmt(i.price * i.qty)}</td>
                                </tr>`).join('') : ''}
                        </tbody>
                    </table>
                    <h1 class="text-right" style="margin-top: 20px;">TOTAL: Bs. ${fmt(data.total)}</h1>
                </div>
            `}
        </body>
        </html>
      `;
  };

  // --- MODO 2: TICKET TÉRMICO (80mm) ---
  const renderThermalReport = () => {
      // CORRECCIÓN: Asegurar que el título del gasto salga en el ticket térmico individual
      let title = data.businessName || 'LicoBar';
      if (data.type === 'expense') title = 'VALE DE GASTO';
      
      let itemsHtml = data.items ? data.items.map(item => `<div class="row" style="margin-bottom:2px;"><div class="col-qty">${item.qty}</div><div class="col-name">${item.name}</div><div class="col-price">${fmt(item.price * item.qty)}</div></div>`).join('') : '';
      let zReportRows = data.soldProducts ? data.soldProducts.map(p => `<div class="row"><div class="col-qty">${p.qty}</div><div class="col-name">${p.name}</div><div class="col-price">${fmt(p.total)}</div></div>`).join('') : '';
      
      const stats = data.stats || {};

      return `
        <html>
        <head>
            <style>
                * { box-sizing: border-box; }
                body { font-family: 'Arial', sans-serif; margin: 0; padding: 10px 5px; width: 72mm; font-size: 12px; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: 700; }
                .border-b { border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px; }
                .flex-between { display: flex; justify-content: space-between; }
                .row { display: flex; width: 100%; font-size: 11px; }
                .col-qty { width: 10%; } .col-name { width: 65%; } .col-price { width: 25%; text-align: right; }
                .expense-title { font-size: 14px; font-weight: bold; text-transform: uppercase; margin: 5px 0; display: block; }
            </style>
        </head>
        <body>
            <div class="text-center border-b">
                <div class="bold" style="font-size:16px;">${data.type==='z-report'?'CIERRE DE CAJA': title}</div>
                <div>${data.date}</div>
            </div>

            ${data.type === 'expense' ? `
                <div style="margin-top:10px;">
                    <span style="font-size:10px;">CONCEPTO:</span><br/>
                    <span class="expense-title">${data.description || 'Sin descripción'}</span>
                    <div class="border-b" style="margin:5px 0;"></div>
                    <div class="flex-between bold" style="font-size:18px;">
                        <span>MONTO:</span>
                        <span>Bs. ${fmt(data.amount)}</span>
                    </div>
                    <br/><br/>
                    <div class="text-center" style="font-size:10px; border-top:1px solid #000; padding-top:5px;">FIRMA</div>
                </div>
            ` : data.type === 'z-report' ? `
                <div class="flex-between"><span>Fondo Inicial:</span><span>${fmt(data.openingAmount)}</span></div>
                <div class="flex-between bold"><span>(+) Ventas:</span><span>${fmt((stats.cashSales||0)+(stats.digitalSales||0))}</span></div>
                <div style="font-size:10px;margin-left:10px;">
                    <div class="flex-between"><span>Efvo: ${fmt(stats.cashSales)}</span><span>Dig: ${fmt(stats.digitalSales)}</span></div>
                </div>
                <div class="flex-between"><span>(-) Gastos:</span><span>${fmt(stats.totalExpenses)}</span></div>
                <div class="border-b" style="margin:5px 0;"></div>
                <div class="flex-between bold" style="font-size:18px;"><span>CAJA:</span><span>Bs. ${fmt(data.finalCash)}</span></div>
                <br/><div>DETALLE PRODUCTOS</div>${zReportRows}
            ` : `
                ${itemsHtml}
                <div class="border-b" style="margin:5px 0;"></div>
                <div class="flex-between bold" style="font-size:18px;"><span>TOTAL:</span><span>Bs. ${fmt(data.total)}</span></div>
            `}
        </body>
        </html>
      `;
  };

  const handlePrintInNewWindow = () => {
    const width = printerType === 'letter' ? 1000 : 400;
    const height = printerType === 'letter' ? 800 : 600;
    const printWindow = window.open('', 'PRINT', `height=${height},width=${width}`);
    if (!printWindow) { alert("Permite las ventanas emergentes."); return; }
    
    // Si es GASTO, siempre usa formato térmico pequeño, a menos que se fuerce carta
    let htmlContent = '';
    if (data.type === 'expense' && printerType !== 'letter') {
        htmlContent = renderThermalReport();
    } else {
        htmlContent = printerType === 'letter' ? renderLetterReport() : renderThermalReport();
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  useEffect(() => { if (data && data.autoPrint) handlePrintInNewWindow(); }, [data]);

  // VALOR A MOSTRAR EN PANTALLA (PREVIEW)
  const previewAmount = data.type === 'expense' ? data.amount : (data.type === 'z-report' ? data.finalCash : data.total);

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gray-800 p-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">VISTA PREVIA</h3>
          <div className="flex gap-2">
              <button onClick={handlePrintInNewWindow} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"><Printer size={18}/> IMPRIMIR</button>
              <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><X size={18}/></button>
          </div>
        </div>
        <div className="p-6 bg-gray-100 flex justify-center">
            <div className={`bg-white p-4 shadow text-center w-full border-t-4 ${printerType === 'letter' && data.type === 'z-report' ? 'border-green-500' : 'border-blue-500'}`}>
                <p className="font-bold text-lg mb-2">{data.businessName || 'LicoBar'}</p>
                <p className="text-3xl font-black text-gray-800">Bs. {fmt(previewAmount)}</p>
                <p className="text-xs text-gray-500 mt-4 uppercase font-bold">
                    {data.type === 'z-report' && printerType === 'letter' ? 'Formato: CARTA (A4)' : 'Formato: TICKET'}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;