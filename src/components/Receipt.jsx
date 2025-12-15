// src/components/Receipt.jsx - VERSIÓN TINTA SUAVE (CLEAN & LITE)
import React from 'react';
import { X, Printer } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose }) => {
  if (!data) return null;

  const handlePrintInNewWindow = () => {
    // Dimensiones ajustadas para ticket
    const printWindow = window.open('', 'PRINT', 'height=600,width=400');

    if (!printWindow) {
      alert("Por favor permite las ventanas emergentes.");
      return;
    }

    // --- CONSTRUCCIÓN DEL HTML ---
    
    // 1. Filas de productos (Ventas) - AHORA CON TEXTO NORMAL (NO NEGRITA)
    let itemsHtml = '';
    if (data.items) {
        itemsHtml = data.items.map(item => `
            <div class="row" style="margin-bottom: 2px;">
                <div class="col-qty">${item.qty}</div>
                <div class="col-name">${item.name} ${item.isCourtesy ? '(R)' : ''}</div>
                <div class="col-price">${item.isCourtesy ? '0.00' : (item.price * item.qty).toFixed(2)}</div>
            </div>
        `).join('');
    }

    // 2. Filas de productos (Reporte Z)
    let zReportProductsHtml = '';
    if (data.soldProducts) {
        zReportProductsHtml = data.soldProducts.map(prod => `
            <div class="row" style="margin-bottom: 2px;">
                <div class="col-qty">${prod.qty}</div>
                <div class="col-name">${prod.name}</div>
                <div class="col-price">${prod.total.toFixed(2)}</div>
            </div>
        `).join('');
    }

    // 3. Documento HTML (ESTILOS LIGEROS)
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket</title>
          <style>
            /* RESET */
            * { box-sizing: border-box; }
            body { 
                font-family: 'Arial', sans-serif; /* Arial es limpia */
                margin: 0; 
                padding: 10px 5px; /* Un poco de margen lateral */
                width: 72mm; 
                color: #000000;
                font-size: 12px; /* Tamaño estándar legible */
                line-height: 1.2; /* Espaciado para que no se peguen las líneas */
                font-weight: 400; /* PESO NORMAL (NO NEGRITA POR DEFECTO) */
            }
            
            /* UTILIDADES */
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            
            /* SOLO LO IMPORTANTE VA EN NEGRITA */
            .bold { font-weight: 700; } 
            .extra-bold { font-weight: 800; font-size: 14px; }
            
            .uppercase { text-transform: uppercase; }
            
            /* TAMAÑOS */
            .text-xs { font-size: 10px; }
            .text-lg { font-size: 16px; }
            .text-xl { font-size: 20px; }
            
            /* LÍNEAS MÁS FINAS */
            .border-b { border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px; }
            .divider { border-top: 1px dashed #444; margin: 5px 0; }
            .double-divider { border-top: 1px double #000; margin: 5px 0; }
            
            /* GRID FLEX */
            .flex-between { display: flex; justify-content: space-between; align-items: center; }
            
            /* TABLA LIMPIA */
            .row { display: flex; width: 100%; font-size: 11px; } /* Letra un poco más chica para ítems */
            .col-qty { width: 10%; text-align: center; }
            .col-name { width: 65%; padding-left: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
            .col-price { width: 25%; text-align: right; }

          </style>
        </head>
        <body>
          
          <div class="text-center border-b">
            <div class="bold text-lg uppercase">${data.type === 'z-report' ? 'CIERRE DE CAJA' : (data.businessName || 'LicoBar')}</div>
            ${data.type === 'expense' ? '<div class="bold">VALE DE CAJA</div>' : ''}
            <div class="text-xs" style="margin-top: 2px;">${data.date}</div>
            <div class="text-xs">Atiende: ${data.staffName}</div>
            ${data.orderId ? `<div class="text-xs">Ticket: #${data.orderId.slice(-6)}</div>` : ''}
          </div>

          ${(data.type === 'order' || data.type === 'quick_sale') ? `
            
            <div class="row bold" style="margin-bottom: 4px; font-size: 10px;">
                <div class="col-qty">C</div>
                <div class="col-name">DESCRIPCION</div>
                <div class="col-price">TOTAL</div>
            </div>
            
            <div>${itemsHtml}</div>
            
            <div class="divider"></div>
            
            <div class="flex-between extra-bold">
                <span>TOTAL:</span>
                <span>Bs. ${data.total.toFixed(2)}</span>
            </div>
            
            ${data.payments ? `
                <div class="text-xs" style="margin-top: 4px;">
                    ${data.payments.map(p => `<div class="flex-between"><span>Pago ${p.method}:</span><span>${p.amount.toFixed(2)}</span></div>`).join('')}
                </div>
            ` : ''}
            
            ${data.changeGiven > 0 ? `<div class="text-right bold text-xs" style="margin-top:4px;">CAMBIO: ${data.changeGiven.toFixed(2)}</div>` : ''}
          ` : ''}

          ${data.type === 'expense' ? `
            <div style="margin-top: 10px;">
                <p class="text-xs bold">CONCEPTO:</p>
                <p class="text-lg uppercase" style="font-weight: 400;">${data.description}</p>
                <div class="divider"></div>
                <div class="flex-between text-xl bold">
                    <span>RETIRO:</span>
                    <span>Bs. ${data.amount.toFixed(2)}</span>
                </div>
                <br/><br/>
                <div class="text-center text-xs" style="border-top: 1px solid #000; padding-top: 5px; width: 80%; margin: 0 auto;">FIRMA RESPONSABLE</div>
            </div>
          ` : ''}

          ${data.type === 'z-report' ? `
            <div class="text-xs">
                <div class="flex-between"><span>Apertura:</span><span>${new Date(data.openedAt).toLocaleTimeString()}</span></div>
                <div class="flex-between"><span>Cierre:</span><span>${new Date().toLocaleTimeString()}</span></div>
            </div>
            <div class="divider"></div>
            <div class="text-xs">
                <div class="flex-between"><span>Fondo Inicial:</span><span>${data.openingAmount.toFixed(2)}</span></div>
                <div class="flex-between bold" style="margin-top:2px;"><span>(+) Ventas Totales:</span><span>${(data.stats.cashSales + data.stats.digitalSales).toFixed(2)}</span></div>
                <div class="flex-between"><span>(-) Gastos:</span><span>${data.stats.totalExpenses.toFixed(2)}</span></div>
            </div>
            
            <div class="divider"></div>
            
            <div class="flex-between text-xl bold">
                <span>EN CAJA:</span>
                <span>Bs. ${data.finalCash.toFixed(2)}</span>
            </div>
            
            <div class="divider"></div>
            <div class="text-xs">
                <div class="flex-between"><span>Efectivo:</span><span>${data.stats.cashSales.toFixed(2)}</span></div>
                <div class="flex-between"><span>Digital:</span><span>${(data.stats.digitalSales || 0).toFixed(2)}</span></div>
            </div>

            <div class="divider"></div>
            <div class="text-xs">
                <div class="flex-between"><span>Costo Mercadería:</span><span>${data.stats.totalCostOfGoods ? data.stats.totalCostOfGoods.toFixed(2) : '0.00'}</span></div>
                <div class="flex-between bold"><span>(=) GANANCIA:</span><span>${((data.stats.cashSales + data.stats.digitalSales) - (data.stats.totalCostOfGoods || 0)).toFixed(2)}</span></div>
            </div>

            ${data.stats.courtesyTotal > 0 ? `
                <div class="divider"></div>
                <div class="flex-between bold text-xs"><span>CORTESÍAS (Valor):</span><span>${data.stats.courtesyTotal.toFixed(2)}</span></div>
            ` : ''}
            
            <br/>
            <div class="text-center bold text-xs" style="border-bottom: 1px solid #000;">PRODUCTOS VENDIDOS</div>
            ${zReportProductsHtml}
          ` : ''}

          <div style="margin-top: 15px; text-align: center; font-size: 10px;">
             *** GRACIAS POR SU VISITA ***
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // VISTA EN PANTALLA
  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gray-800 p-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">VISTA PREVIA TICKET</h3>
          <div className="flex gap-2">
              <button onClick={handlePrintInNewWindow} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"><Printer size={18}/> IMPRIMIR</button>
              <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><X size={18}/></button>
          </div>
        </div>
        <div className="p-6 bg-gray-100 flex justify-center">
            <div className="bg-white p-4 shadow text-center w-full border-t-4 border-blue-500">
                <p className="font-bold text-lg mb-2">{data.businessName || 'LicoBar'}</p>
                <p className="text-3xl font-black text-gray-800">Bs. {data.type === 'expense' ? data.amount.toFixed(2) : (data.type === 'z-report' ? data.finalCash.toFixed(2) : data.total.toFixed(2))}</p>
                <p className="text-xs text-gray-500 mt-4">Listo para imprimir (Modo Ahorro Tinta)</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;