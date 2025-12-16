// src/components/Receipt.jsx - FINAL CON FOLIO/CÓDIGO GIGANTE
import React, { useEffect } from 'react';
import { X, Printer } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose, printerType = 'thermal' }) => {
  if (!data) return null;

  const fmt = (value) => { const num = parseFloat(value); return isNaN(num) ? '0.00' : num.toFixed(2); };
  const isCourtesySale = data.payments && data.payments.some(p => p.method === 'Cortesía');
  const useThermalFormat = data.type !== 'z-report' || printerType === 'thermal';
  const staffName = data.staffName || 'General';
  const cashierName = data.cashierName || 'Caja';
  
  // EXTRAER EL CÓDIGO VISIBLE PARA MATCHING
  // Usamos data.orderId que ahora trae el código original (ej: ORD-1234)
  const displayCode = data.orderId ? data.orderId.replace('ORD-', '') : '---';

  // --- MODO 1: REPORTE CARTA (A4) ---
  const renderLetterReport = () => {
      const stats = data.stats || {};
      const productRows = data.soldProducts ? data.soldProducts.map(p => `<tr><td style="text-align:left;padding:5px;border-bottom:1px solid #eee;">${p.name}</td><td style="text-align:center;padding:5px;border-bottom:1px solid #eee;">${p.qtySold || 0}</td><td style="text-align:center;padding:5px;border-bottom:1px solid #eee; background-color:#fffbea;">${p.qtyCourtesy || 0}</td><td style="text-align:right;padding:5px;border-bottom:1px solid #eee;">${fmt(p.totalCost)}</td><td style="text-align:right;padding:5px;border-bottom:1px solid #eee; color:#d97706;">${(p.qtyCourtesy > 0 && p.total === 0) ? '(Regalo)' : (p.qtyCourtesy > 0 ? 'Mixto' : '-')}</td><td style="text-align:right;padding:5px;border-bottom:1px solid #eee;">${fmt(p.total)}</td></tr>`).join('') : '';
      const totalQtySold = data.soldProducts ? data.soldProducts.reduce((a,b)=>a+(b.qtySold||0),0) : 0;
      const totalQtyCort = data.soldProducts ? data.soldProducts.reduce((a,b)=>a+(b.qtyCourtesy||0),0) : 0;
      const expensesRows = stats.expensesList && stats.expensesList.length > 0 ? stats.expensesList.map(e => `<tr><td style="padding:4px 0;color:#444;">• ${e.description || 'Gasto'}</td><td style="text-align:right;padding:4px 0;">${fmt(e.amount)}</td></tr>`).join('') : '<tr><td colspan="2" style="font-style:italic;color:#999;padding:4px 0;">Sin gastos operativos</td></tr>';

      return `<html><head><title>Reporte de Cierre</title><style>body{font-family:'Helvetica','Arial',sans-serif;font-size:12px;margin:40px;color:#333;line-height:1.3}.header{text-align:center;margin-bottom:20px;border-bottom:3px solid #000;padding-bottom:15px}.main-container{display:flex;gap:30px;margin-bottom:10px;align-items:flex-start}.col-left{flex:1}.col-right{flex:1;display:flex;flex-direction:column;gap:20px}.box{border:1px solid #000;padding:15px}.box-title{font-weight:900;text-transform:uppercase;border-bottom:2px solid #000;margin-bottom:10px;padding-bottom:5px;font-size:13px}.clean-table{width:100%;border-collapse:collapse}.clean-table td{padding:5px 0;border-bottom:1px dashed #ddd}.clean-table .total-row td{border-top:2px solid #000;border-bottom:none;font-weight:900;font-size:14px;padding-top:10px}.page-break{page-break-before:always}.product-table{width:100%;border-collapse:collapse;margin-top:10px;font-size:11px}.product-table th{background-color:#eee;text-align:left;padding:8px;border:1px solid #ccc;font-weight:bold}.product-table td{border:1px solid #ccc}.text-right{text-align:right}.text-center{text-align:center}.text-red{color:#cc0000}.text-green{color:#008800}.text-orange{color:#d97706}.section-header{background-color:#000;color:#fff;padding:8px 10px;font-weight:bold;margin-bottom:10px;text-transform:uppercase}</style></head><body><div class="header"><div style="font-size:24px;font-weight:900;margin-bottom:5px;">${data.businessName||'LicoBar'}</div><div style="font-size:16px;font-weight:bold;">REPORTE DE CIERRE DE CAJA (CORTE Z)</div><div style="margin-top:10px;font-size:11px;">JORNADA: ${new Date(data.openedAt||Date.now()).toLocaleDateString()} al ${new Date(data.date).toLocaleDateString()} <br/>RESPONSABLE: ${staffName.toUpperCase()} | CAJERO: ${cashierName.toUpperCase()}</div></div>${data.type==='z-report'?`<div class="main-container"><div class="col-left box"><div class="box-title">I. INGRESOS (DINERO ENTRANTE)</div><table class="clean-table"><tr><td>FONDO INICIAL (BASE)</td><td class="text-right">${fmt(data.openingAmount)}</td></tr><tr><td>VENTAS EFECTIVO</td><td class="text-right">${fmt(stats.cashSales)}</td></tr><tr><td>VENTAS QR / TRANSF.</td><td class="text-right">${fmt(stats.qrSales)}</td></tr><tr><td>VENTAS TARJETA</td><td class="text-right">${fmt(stats.cardSales)}</td></tr><tr class="total-row"><td>TOTAL INGRESOS</td><td class="text-right text-green">${fmt(data.openingAmount+stats.cashSales+stats.qrSales+stats.cardSales)}</td></tr></table></div><div class="col-right"><div class="box"><div class="box-title">II. EGRESOS (SALIDAS DE DINERO)</div><table class="clean-table">${expensesRows}<tr class="total-row"><td>TOTAL GASTOS</td><td class="text-right text-red">${fmt(stats.totalExpenses)}</td></tr></table></div><div class="box" style="border:2px dashed #d97706;background-color:#fffaf0;"><div class="box-title text-orange" style="border-bottom-color:#d97706;">III. CONTROL DE CORTESÍAS</div><table class="clean-table"><tr><td style="color:#d97706;">• PRODUCTOS REGALADOS</td><td class="text-right text-orange">${fmt(stats.courtesyTotal)}</td></tr><tr style="font-size:10px;color:#666;"><td colspan="2">* Este monto NO afecta el efectivo en caja.</td></tr></table></div><div style="border:2px solid #000;padding:15px;background:#f0f0f0;"><div style="font-weight:bold;font-size:11px;text-transform:uppercase;">EFECTIVO REAL EN CAJA</div><div style="font-weight:900;font-size:28px;text-align:right;">Bs. ${fmt(data.finalCash)}</div><div style="font-size:10px;text-align:right;margin-top:5px;">(Ingresos Efectivo - Gastos Efectivo)</div></div></div></div><div class="page-break"></div><div class="header" style="border-bottom:1px solid #ccc;margin-bottom:15px;padding-bottom:5px;"><div style="font-size:14px;font-weight:bold;">ANEXO: DETALLE DE PRODUCTOS VENDIDOS</div><div style="font-size:10px;">${new Date(data.date).toLocaleDateString()} - ${staffName}</div></div><div class="section-header">IV. INVENTARIO Y VENTAS</div><table class="product-table"><thead><tr><th style="width:35%;">PRODUCTO</th><th class="text-center" style="width:10%;">CANT.V</th><th class="text-center" style="width:10%;background-color:#fffbea;">CANT.C</th><th class="text-right" style="width:15%;">T. COSTO</th><th class="text-right" style="width:15%;color:#d97706;">VAL. CORT</th><th class="text-right" style="width:15%;">T. VENTA</th></tr></thead><tbody>${productRows}<tr style="background:#ddd;font-weight:900;"><td class="text-right">TOTALES GENERALES</td><td class="text-center">${totalQtySold}</td><td class="text-center">${totalQtyCort}</td><td class="text-right">${fmt(stats.totalCostOfGoods)}</td><td class="text-right text-orange">${fmt(stats.courtesyTotal)}</td><td class="text-right">${fmt((stats.cashSales||0)+(stats.digitalSales||0))}</td></tr></tbody></table><div style="margin-top:10px;font-size:10px;text-align:center;color:#666;">CANT.V = Vendidos | CANT.C = Cortesías | T.COSTO = Costo Mercadería | VAL.CORT = Valor regalado | T.VENTA = Ingreso Real</div>`:`<div style="border:1px solid #000;padding:20px;"><h2 style="text-align:center;">DETALLE VENTA</h2><table class="product-table"><thead><tr><th>CANT</th><th>DESCRIPCION</th><th class="text-right">TOTAL</th></tr></thead><tbody>${data.items?data.items.map(i=>`<tr><td class="text-center">${i.qty}</td><td>${i.name}</td><td class="text-right">${fmt(i.price*i.qty)}</td></tr>`).join(''):''}</tbody></table><h1 class="text-right" style="margin-top:20px;">TOTAL: Bs. ${fmt(data.total)}</h1></div>`}</body></html>`;
  };

  // --- MODO 2: TICKET TÉRMICO ---
  const renderThermalReport = () => {
      const stats = data.stats || {};
      let title = (data.businessName || 'LicoBar').toUpperCase();
      if (data.type === 'expense') title = 'VALE DE GASTO';
      if (isCourtesySale) title = 'RECIBO DE CORTESÍA';
      let subtitle = isCourtesySale ? '(SIN VALOR COMERCIAL)' : (!data.payments && data.type === 'order' ? '(PRE-CUENTA / COMANDA)' : '');
      let itemsHtml = data.items ? data.items.map(item => `<div class="row" style="margin-bottom:2px;"><div class="col-qty">${item.qty}</div><div class="col-name">${item.name}</div><div class="col-price">${isCourtesySale ? '0.00' : fmt(item.price * item.qty)}</div></div>`).join('') : '';
      let zReportRows = data.soldProducts ? data.soldProducts.map(p => `<div class="row"><div class="col-qty">${p.qtySold + (p.qtyCourtesy||0)}</div><div class="col-name">${p.name}</div><div class="col-price">${fmt(p.total)}</div></div>`).join('') : '';

      return `<html><head><style>*{box-sizing:border-box}body{font-family:'Arial',sans-serif;margin:0;padding:10px 0;width:72mm;font-size:12px}.text-center{text-align:center}.text-right{text-align:right}.bold{font-weight:700}.border-b{border-bottom:1px solid #000;padding-bottom:5px;margin-bottom:5px}.flex-between{display:flex;justify-content:space-between}.row{display:flex;width:100%;font-size:11px}.col-qty{width:10%;text-align:center}.col-name{width:65%;padding-left:5px}.col-price{width:25%;text-align:right}.courtesy-box{border:2px dashed #000;padding:5px;margin:10px 0;text-align:center}.code-box{background:#000;color:#fff;font-size:18px;font-weight:900;text-align:center;padding:5px;margin:10px 0;border-radius:4px;}</style></head><body>
            <div class="text-center border-b">
                <div class="bold" style="font-size:16px;">${data.type==='z-report'?'CIERRE DE CAJA':title}</div>
                ${subtitle?`<div style="font-size:10px;font-weight:bold;">${subtitle}</div>`:''}
                
                <div style="font-size:10px;margin-top:2px;">${data.date}</div>
                
                <div style="font-size:10px;margin-top:4px;display:flex;justify-content:space-between;"><span>Atiende: ${staffName.split(' ')[0]}</span><span>Cajero: ${cashierName.split(' ')[0]}</span></div>
                
                ${(data.type === 'order' || data.type === 'quick_sale') ? `<div class="code-box">#${displayCode}</div>` : ''}
            </div>
            
            ${data.type === 'z-report' ? `<div class="flex-between"><span>Fondo Inicial:</span><span>${fmt(data.openingAmount)}</span></div><div class="flex-between bold"><span>(+) Ventas:</span><span>${fmt((stats.cashSales||0)+(stats.digitalSales||0))}</span></div><div class="flex-between"><span>(-) Gastos:</span><span>${fmt(stats.totalExpenses)}</span></div><div class="border-b" style="margin:5px 0;"></div><div class="flex-between bold" style="font-size:18px;"><span>CAJA:</span><span>Bs. ${fmt(data.finalCash)}</span></div><br/><div class="bold text-center border-b">RESUMEN PRODUCTOS</div>${zReportRows}` : data.type === 'expense' ? `<div style="margin-top:10px;"><span style="font-size:10px;">CONCEPTO:</span><br/><span class="bold uppercase" style="font-size:14px;">${data.description}</span><div class="border-b" style="margin:5px 0;"></div><div class="flex-between bold" style="font-size:18px;"><span>MONTO:</span><span>Bs. ${fmt(data.amount)}</span></div><br/><br/><div class="text-center" style="font-size:10px;border-top:1px solid #000;padding-top:5px;">FIRMA</div></div>` : `<div class="row bold" style="font-size:10px;border-bottom:1px solid #000;margin-bottom:2px;"><div class="col-qty">C</div><div class="col-name">DESCRIPCION</div><div class="col-price">TOTAL</div></div>${itemsHtml}<div class="border-b" style="margin:5px 0;"></div>${isCourtesySale?`<div class="courtesy-box"><div class="bold" style="font-size:14px;">CORTESÍA AUTORIZADA</div><div style="font-size:10px;">Total Bonificado: Bs. ${fmt(data.total)}</div></div><div class="flex-between bold" style="font-size:16px;"><span>A PAGAR:</span><span>Bs. 0.00</span></div>`:`<div class="flex-between bold" style="font-size:18px;"><span>TOTAL:</span><span>Bs. ${fmt(data.total)}</span></div>${data.payments?`<div style="margin-top:5px;font-size:10px;">${data.payments.map(p=>`<div class="flex-between"><span>PAGO ${p.method.toUpperCase()}:</span><span>${fmt(p.amount)}</span></div>`).join('')}</div>`:''}${data.changeGiven>0?`<div class="text-right bold" style="margin-top:2px;">CAMBIO: ${fmt(data.changeGiven)}</div>`:''}`} `}
            <div style="margin-top:15px;text-align:center;font-size:10px;">*** GRACIAS POR SU VISITA ***</div></body></html>`;
  };

  const handlePrintInNewWindow = () => {
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
        <div className="bg-gray-800 p-3 flex justify-between items-center"><h3 className="text-white font-bold text-sm">{useThermalFormat?'TICKET':'REPORTE CARTA'}</h3><div className="flex gap-2"><button onClick={handlePrintInNewWindow} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"><Printer size={18}/> IMPRIMIR</button><button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><X size={18}/></button></div></div>
        <div className="p-6 bg-gray-100 flex justify-center"><div className={`bg-white p-4 shadow text-center w-full border-t-4 ${isCourtesySale?'border-yellow-500':'border-blue-500'}`}><p className="font-bold text-lg mb-2">{isCourtesySale?'RECIBO CORTESÍA':(data.businessName||'LicoBar')}</p><p className="text-3xl font-black text-gray-800">Bs. {isCourtesySale?'0.00':fmt(previewAmount)}</p><p className="text-xs text-gray-400 mt-4 uppercase font-bold border-t pt-2">Formato: {useThermalFormat?'TÉRMICO (80mm)':'CARTA (A4)'}</p></div></div>
      </div>
    </div>
  );
};

export default Receipt;