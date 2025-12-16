// src/components/Receipt.jsx - REPORTE Z PERFECTO (VENTAS VS CORTESÍAS)
import React, { useEffect } from 'react';
import { X, Printer } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose, printerType = 'thermal' }) => {
  if (!data) return null;

  const fmt = (value) => { const num = parseFloat(value); return isNaN(num) ? '0.00' : num.toFixed(2); };
  const isCourtesySale = data.payments && data.payments.some(p => p.method === 'Cortesía');
  const useThermalFormat = data.type !== 'z-report' || printerType === 'thermal';
  const staffName = data.staffName || 'General';
  const cashierName = data.cashierName || 'Caja';

  // --- MODO 1: REPORTE CARTA (A4/OFICIO) ---
  const renderLetterReport = () => {
      const stats = data.stats || {};
      
      // 1. FILAS DE PRODUCTOS CON LÓGICA DE "VALOR ESPEJO"
      const productRows = data.soldProducts ? data.soldProducts.map(p => {
          // Calculamos valores separadas para que la suma cuadre
          // Si p.qtyCourtesy > 0, calculamos cuánto vale eso en dinero
          // Nota: p.total ya trae el precio * cantidad total, hay que separar
          
          const unitPrice = p.total / (p.qty || 1); // Precio unitario aproximado
          const valCourtesy = (p.qtyCourtesy || 0) * (p.qtyCourtesy > 0 ? (p.total / p.qty) : 0); // Valor de lo regalado
          // El 'total' que viene de la BD a veces suma todo, a veces no, dependiendo de la versión de App.jsx
          // Para asegurar, usamos lo que guardamos en App.jsx corrección anterior:
          // En App.jsx arreglado: soldProducts tiene 'total' (solo dinero real) y 'qtyCourtesy'
          
          // Ajuste visual:
          // T.VENTA = Dinero Real
          // V.CORT = Dinero Regalado (Calculado: Cant.Cort * PrecioUnitario)
          // Precio Unitario = p.totalCost / p.qty (aprox costo) o p.total/p.qtySold
          // Como App.jsx ya nos da los totales limpios, usamos lógica directa:
          
          // Recuperamos precio unitario del item si es posible, sino estimamos
          // En el nuevo App.jsx, p.total es SOLO dinero real. 
          // Necesitamos calcular el valor de la cortesía: 
          // Si es pura cortesía, p.total es 0. 
          // Usamos el costo para estimar o el precio si estuviera disponible. 
          // Para simplificar y no romper, si es cortesía pura, mostramos "-" en T.Venta.
          
          // TRUCO: Si T.Venta es 0 y hay Cortesía, es un regalo total.
          const isFullCourtesy = p.total === 0 && p.qtyCourtesy > 0;
          
          return `
            <tr>
                <td style="text-align:left;padding:5px;border-bottom:1px solid #eee;">${p.name}</td>
                <td style="text-align:center;padding:5px;border-bottom:1px solid #eee;">${p.qtySold || 0}</td>
                <td style="text-align:center;padding:5px;border-bottom:1px solid #eee; background-color:#fffbea;">${p.qtyCourtesy || 0}</td>
                <td style="text-align:right;padding:5px;border-bottom:1px solid #eee;">${fmt(p.totalCost)}</td>
                <td style="text-align:right;padding:5px;border-bottom:1px solid #eee; color:#d97706;">${isFullCourtesy ? '(Regalo)' : (p.qtyCourtesy > 0 ? 'Mixto' : '-')}</td>
                <td style="text-align:right;padding:5px;border-bottom:1px solid #eee;">${fmt(p.total)}</td>
            </tr>
          `;
      }).join('') : '';

      // Totales para el pie de tabla
      const totalQtySold = data.soldProducts ? data.soldProducts.reduce((a,b)=>a+(b.qtySold||0),0) : 0;
      const totalQtyCort = data.soldProducts ? data.soldProducts.reduce((a,b)=>a+(b.qtyCourtesy||0),0) : 0;

      const expensesRows = stats.expensesList && stats.expensesList.length > 0 ? stats.expensesList.map(e => `<tr><td style="padding:4px 0;color:#444;">• ${e.description || 'Gasto'}</td><td style="text-align:right;padding:4px 0;">${fmt(e.amount)}</td></tr>`).join('') : '<tr><td colspan="2" style="font-style:italic;color:#999;padding:4px 0;">Sin gastos operativos</td></tr>';

      return `<html><head><title>Reporte de Cierre</title><style>body{font-family:'Arial',sans-serif;font-size:11px;margin:30px;color:#000}.header-section{text-align:center;margin-bottom:20px}.report-title{font-size:18px;font-weight:bold;text-decoration:underline;margin-bottom:5px;text-transform:uppercase}.report-meta{font-size:12px;margin-bottom:20px}table{width:100%;border-collapse:collapse;margin-bottom:30px;font-size:11px}th{border-top:2px solid #000;border-bottom:2px solid #000;padding:6px;font-weight:bold;text-transform:uppercase;background-color:#f9f9f9}td{padding:6px;vertical-align:top}.financial-table td{border-bottom:1px dotted #ccc}.financial-table th{text-align:left}.product-table th.left{text-align:left}.product-table th.center{text-align:center}.product-table th.right{text-align:right}.product-table td{font-family:'Courier New',monospace;font-size:12px}.footer-total{font-size:14px;font-weight:bold;text-align:right;border-top:2px solid #000;padding-top:5px;margin-top:-20px}.text-right{text-align:right}.box{flex:1;border:1px solid #000;padding:15px}.main-container{display:flex;gap:40px;margin-bottom:30px}.clean-table{width:100%;border-collapse:collapse}.clean-table td{padding:5px 0;border-bottom:1px dashed #ddd}.section-header{background-color:#000;color:#fff;padding:5px 10px;font-weight:bold;margin-top:20px}</style></head><body>
            <div class="header-section"><div class="report-title">REPORTE POR JORNADA</div><div class="report-meta">JORNADA: ${new Date(data.openedAt || Date.now()).toLocaleDateString()} al ${new Date(data.date).toLocaleDateString()} <br/>RESPONSABLE: ${staffName.toUpperCase()} | CAJERO: ${cashierName.toUpperCase()}</div></div>
            
            <div class="main-container">
                <div class="box">
                    <div style="font-weight:900;border-bottom:2px solid #000;margin-bottom:10px;">I. INGRESOS (DINERO)</div>
                    <table class="clean-table">
                        <tr><td>FONDO INICIAL</td><td class="text-right">${fmt(data.openingAmount)}</td></tr>
                        <tr><td>EFECTIVO</td><td class="text-right">${fmt(stats.cashSales)}</td></tr>
                        <tr><td>QR/TRANSF</td><td class="text-right">${fmt(stats.qrSales)}</td></tr>
                        <tr><td>TARJETA</td><td class="text-right">${fmt(stats.cardSales)}</td></tr>
                        <tr style="font-weight:bold;border-top:2px solid #000;"><td>TOTAL INGRESOS</td><td class="text-right">${fmt(data.openingAmount+stats.cashSales+stats.qrSales+stats.cardSales)}</td></tr>
                    </table>
                </div>
                <div class="box">
                    <div style="font-weight:900;border-bottom:2px solid #000;margin-bottom:10px;">II. EGRESOS Y CORTESÍAS</div>
                    <table class="clean-table">
                        ${expensesRows}
                        ${stats.courtesyTotal > 0 ? `
                        <tr style="color:#d97706;">
                            <td style="padding:4px 0;">• VALOR EN CORTESÍAS (REGALOS)</td>
                            <td style="text-align:right;padding:4px 0;">(${fmt(stats.courtesyTotal)})</td>
                        </tr>` : ''}
                        
                        <tr style="font-weight:bold;border-top:2px solid #000;"><td>TOTAL GASTOS + CORTESÍAS</td><td class="text-right">${fmt(stats.totalExpenses + stats.courtesyTotal)}</td></tr>
                    </table>
                    <div style="margin-top:20px;border:2px solid #000;padding:10px;background:#f9f9f9;text-align:right;font-size:18px;font-weight:900;">
                        EFECTIVO REAL: Bs. ${fmt(data.finalCash)}
                    </div>
                </div>
            </div>

            <div class="section-header">III. DETALLE PRODUCTOS</div>
            <table class="product-table">
                <thead>
                    <tr>
                        <th class="left" style="width: 35%;">PRODUCTO</th>
                        <th class="center" style="width: 10%;">CANT.V</th>
                        <th class="center" style="width: 10%; background-color:#fffbea;">CANT.C</th>
                        <th class="right" style="width: 15%;">T. COSTO</th>
                        <th class="right" style="width: 15%; color:#d97706;">REF. CORT</th>
                        <th class="right" style="width: 15%;">T. VENTA</th>
                    </tr>
                </thead>
                <tbody>
                    ${productRows}
                    <tr style="background:#ddd;font-weight:900;">
                        <td class="right">TOTALES</td>
                        <td class="center">${totalQtySold}</td>
                        <td class="center">${totalQtyCort}</td>
                        <td class="right">${fmt(stats.totalCostOfGoods)}</td>
                        <td class="right" style="color:#d97706;">${fmt(stats.courtesyTotal)}</td>
                        <td class="right">${fmt((stats.cashSales||0)+(stats.digitalSales||0))}</td>
                    </tr>
                </tbody>
            </table>
            <div style="margin-top:5px;font-size:10px;text-align:center;color:#666;">
                CANT.V = Cantidad Vendida | CANT.C = Cantidad Cortesía | REF. CORT = Valor monetario de la cortesía (No suma a caja)
            </div>
      </body></html>`;
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

      return `<html><head><style>*{box-sizing:border-box}body{font-family:'Arial',sans-serif;margin:0;padding:10px 0;width:72mm;font-size:12px}.text-center{text-align:center}.text-right{text-align:right}.bold{font-weight:700}.border-b{border-bottom:1px solid #000;padding-bottom:5px;margin-bottom:5px}.flex-between{display:flex;justify-content:space-between}.row{display:flex;width:100%;font-size:11px}.col-qty{width:10%;text-align:center}.col-name{width:65%;padding-left:5px}.col-price{width:25%;text-align:right}.courtesy-box{border:2px dashed #000;padding:5px;margin:10px 0;text-align:center}</style></head><body>
            <div class="text-center border-b"><div class="bold" style="font-size:16px;">${data.type==='z-report'?'CIERRE DE CAJA':title}</div>${subtitle?`<div style="font-size:10px;font-weight:bold;">${subtitle}</div>`:''}<div style="font-size:10px;margin-top:2px;">${data.date}</div><div style="font-size:10px;margin-top:4px;display:flex;justify-content:space-between;"><span>Atiende: ${staffName.split(' ')[0]}</span><span>Cajero: ${cashierName.split(' ')[0]}</span></div>${data.orderId?`<div style="font-size:10px;margin-top:2px;">Folio: #${data.orderId.slice(-6)}</div>`:''}</div>
            ${data.type === 'z-report' ? `<div class="flex-between"><span>Fondo Inicial:</span><span>${fmt(data.openingAmount)}</span></div><div class="flex-between bold"><span>(+) Ventas:</span><span>${fmt((stats.cashSales||0)+(stats.digitalSales||0))}</span></div><div class="flex-between"><span>(-) Gastos:</span><span>${fmt(stats.totalExpenses)}</span></div><div class="border-b" style="margin:5px 0;"></div><div class="flex-between bold" style="font-size:18px;"><span>CAJA:</span><span>Bs. ${fmt(data.finalCash)}</span></div><br/><div class="bold text-center border-b">RESUMEN PRODUCTOS</div>${zReportRows}` : data.type === 'expense' ? `<div style="margin-top:10px;"><span style="font-size:10px;">CONCEPTO:</span><br/><span class="bold uppercase" style="font-size:14px;">${data.description}</span><div class="border-b" style="margin:5px 0;"></div><div class="flex-between bold" style="font-size:18px;"><span>MONTO:</span><span>Bs. ${fmt(data.amount)}</span></div><br/><br/><div class="text-center" style="font-size:10px;border-top:1px solid #000;padding-top:5px;">FIRMA</div></div>` : `<div class="row bold" style="font-size:10px;border-bottom:1px solid #000;margin-bottom:2px;"><div class="col-qty">C</div><div class="col-name">DESCRIPCION</div><div class="col-price">TOTAL</div></div>${itemsHtml}<div class="border-b" style="margin:5px 0;"></div>${isCourtesySale?`<div class="courtesy-box"><div class="bold" style="font-size:14px;">CORTESÍA AUTORIZADA</div><div style="font-size:10px;">Total Bonificado: Bs. ${fmt(data.total)}</div></div><div class="flex-between bold" style="font-size:16px;"><span>A PAGAR:</span><span>Bs. 0.00</span></div>`:`<div class="flex-between bold" style="font-size:18px;"><span>TOTAL:</span><span>Bs. ${fmt(data.total)}</span></div>${data.payments?`<div style="margin-top:5px;font-size:10px;">${data.payments.map(p=>`<div class="flex-between"><span>PAGO ${p.method.toUpperCase()}:</span><span>${fmt(p.amount)}</span></div>`).join('')}</div>`:''}${data.changeGiven>0?`<div class="text-right bold" style="margin-top:2px;">CAMBIO: ${fmt(data.changeGiven)}</div>`:''}`} `}
            <div style="margin-top:15px;text-align:center;font-size:10px;">*** GRACIAS POR SU VISITA ***</div></body></html>`;
  };

  const handlePrintInNewWindow = () => {
    const width = (useThermalFormat) ? 400 : 1000;
    const height = (useThermalFormat) ? 600 : 800;
    const printWindow = window.open('', 'PRINT', `height=${height},width=${width}`);
    if (!printWindow) { alert("Permite las ventanas emergentes."); return; }
    const htmlContent = (useThermalFormat) ? renderThermalReport() : renderLetterReport();
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