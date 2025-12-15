import React from 'react';
import { X, Printer, DollarSign } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose }) => {
  if (!data) return null;

  // --- GENERADOR DE HTML PURO PARA LA VENTANA EMERGENTE ---
  const handlePrintInNewWindow = () => {
    // 1. Configurar dimensiones para papel de 80mm
    const printWindow = window.open('', 'PRINT', 'height=600,width=350');

    if (!printWindow) {
      alert("Por favor permite las ventanas emergentes para imprimir.");
      return;
    }

    // 2. Construir el HTML del recibo
    let itemsHtml = '';
    
    // Si es venta
    if (data.items) {
        itemsHtml = data.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${item.qty} x ${item.name} ${item.isCourtesy ? '(R)' : ''}
                </span>
                <span style="font-weight: bold;">
                    ${item.isCourtesy ? '0.00' : (item.price * item.qty).toFixed(2)}
                </span>
            </div>
        `).join('');
    }

    // Si es Reporte Z (Productos vendidos)
    let zReportProductsHtml = '';
    if (data.soldProducts) {
        zReportProductsHtml = `
            <div style="border-bottom: 1px solid black; margin: 5px 0; font-weight: bold; font-size: 10px; display: flex;">
                <span style="width: 30px;">CANT</span>
                <span style="flex: 1;">DESC</span>
                <span style="width: 50px; text-align: right;">TOTAL</span>
            </div>
            ${data.soldProducts.map(prod => `
                <div style="display: flex; font-size: 10px; margin-bottom: 2px;">
                    <span style="width: 30px; text-align: center;">${prod.qty}</span>
                    <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${prod.name}</span>
                    <span style="width: 50px; text-align: right;">${prod.total.toFixed(2)}</span>
                </div>
            `).join('')}
        `;
    }

    // 3. Escribir el documento
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket ${data.orderId || ''}</title>
          <style>
            body { 
                font-family: 'Courier New', Courier, monospace; 
                margin: 0; 
                padding: 5px; 
                font-size: 12px; 
                width: 76mm; /* Ajuste seguro para 80mm */
                color: black;
            }
            .header { text-align: center; margin-bottom: 10px; border-bottom: 1px solid black; padding-bottom: 5px; }
            .bold { font-weight: bold; }
            .big { font-size: 16px; font-weight: 900; }
            .flex-between { display: flex; justify-content: space-between; }
            .divider { border-top: 1px dashed black; margin: 5px 0; }
            .text-center { text-align: center; }
            .small { font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="big">${data.type === 'z-report' ? 'REPORTE CIERRE' : (data.businessName || 'LicoBar')}</div>
            ${data.type === 'expense' ? '<div>VALE DE CAJA</div>' : ''}
            <div class="small">${data.date}</div>
            <div class="small">Atiende: ${data.staffName}</div>
            ${data.orderId ? `<div class="small">Ticket: #${data.orderId.slice(-6)}</div>` : ''}
          </div>

          ${(data.type === 'order' || data.type === 'quick_sale') ? `
            <div class="small bold flex-between" style="border-bottom: 1px solid black;"><span>CANT/DESC</span><span>TOTAL</span></div>
            <div style="margin-top: 5px;">${itemsHtml}</div>
            <div class="divider"></div>
            <div class="flex-between big"><span>TOTAL:</span><span>Bs. ${data.total.toFixed(2)}</span></div>
            ${data.payments ? `<div class="small" style="margin-top: 5px;">${data.payments.map(p => `<div>Pago ${p.method}: ${p.amount.toFixed(2)}</div>`).join('')}</div>` : ''}
            ${data.changeGiven > 0 ? `<div class="small bold">Cambio: ${data.changeGiven.toFixed(2)}</div>` : ''}
          ` : ''}

          ${data.type === 'expense' ? `
            <div>
                <p class="small">CONCEPTO:</p>
                <p class="bold" style="font-size: 14px;">${data.description}</p>
                <p class="small">MONTO:</p>
                <p class="big">Bs. ${data.amount.toFixed(2)}</p>
                <br/><br/>
                <div class="text-center small" style="border-top: 1px solid black; padding-top: 5px;">FIRMA</div>
            </div>
          ` : ''}

          ${data.type === 'z-report' ? `
            <div class="small">
                <div class="flex-between"><span>Apertura:</span><span>${new Date(data.openedAt).toLocaleTimeString()}</span></div>
                <div class="flex-between"><span>Cierre:</span><span>${new Date().toLocaleTimeString()}</span></div>
            </div>
            <div class="divider"></div>
            <div class="small">
                <div class="flex-between"><span>Fondo Inicial:</span><span>${data.openingAmount.toFixed(2)}</span></div>
                <div class="flex-between bold"><span>(+) Ventas:</span><span>${(data.stats.cashSales + data.stats.digitalSales).toFixed(2)}</span></div>
                <div class="flex-between text-center" style="font-style: italic;"><span>Efvo: ${data.stats.cashSales.toFixed(2)}</span> <span>Dig: ${data.stats.digitalSales.toFixed(2)}</span></div>
                <div class="flex-between"><span>(-) Gastos:</span><span>${data.stats.totalExpenses.toFixed(2)}</span></div>
            </div>
            <div class="divider"></div>
            <div class="flex-between big"><span>EN CAJA:</span><span>Bs. ${data.finalCash.toFixed(2)}</span></div>
            
            <div class="divider"></div>
            <div class="small">
                <div class="flex-between"><span>Costo Mercadería:</span><span>${data.stats.totalCostOfGoods ? data.stats.totalCostOfGoods.toFixed(2) : '0.00'}</span></div>
                <div class="flex-between bold"><span>(=) GANANCIA:</span><span>${((data.stats.cashSales + data.stats.digitalSales) - (data.stats.totalCostOfGoods || 0)).toFixed(2)}</span></div>
            </div>
            ${data.stats.courtesyTotal > 0 ? `<div class="divider"></div><div class="text-center bold small">CORTESÍAS: ${data.stats.courtesyTotal.toFixed(2)}</div>` : ''}
            
            <br/>
            <div class="text-center bold small">PRODUCTOS VENDIDOS</div>
            ${zReportProductsHtml}
          ` : ''}

          <br/>
          <div class="text-center small">*** GRACIAS ***</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Esperar un momento para que cargue y lanzar imprimir
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Renderizar la modal en pantalla (solo visual)
  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* ENCABEZADO */}
        <div className="bg-gray-800 p-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">RECIBO GENERADO</h3>
          <div className="flex gap-2">
              <button 
                onClick={handlePrintInNewWindow} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg animate-pulse"
              >
                <Printer size={18}/> IMPRIMIR
              </button>
              <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><X size={18}/></button>
          </div>
        </div>

        {/* VISTA PREVIA (Solo visual para el usuario) */}
        <div className="p-6 overflow-y-auto bg-gray-100 flex justify-center">
            <div className="bg-white p-4 shadow w-full text-xs font-mono text-gray-800 border-t-4 border-gray-800">
                <div className="text-center font-bold mb-4 uppercase text-lg border-b pb-2">
                    {data.type === 'z-report' ? 'REPORTE Z' : (data.businessName || 'LicoBar')}
                </div>
                
                {/* Resumen simplificado en pantalla */}
                <div className="space-y-2">
                    <div className="flex justify-between"><span>Fecha:</span><span>{data.date}</span></div>
                    <div className="flex justify-between font-bold text-base border-t pt-2">
                        <span>TOTAL:</span>
                        <span>Bs. {data.type === 'expense' ? data.amount.toFixed(2) : (data.type === 'z-report' ? data.finalCash.toFixed(2) : data.total.toFixed(2))}</span>
                    </div>
                </div>

                <div className="mt-6 text-center text-gray-400 text-[10px]">
                    Presiona "IMPRIMIR" para generar el ticket físico.
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;