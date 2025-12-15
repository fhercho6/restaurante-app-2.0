// src/components/Receipt.jsx - AUTO IMPRESIÓN HABILITADA
import React, { useEffect } from 'react';
import { X, Printer } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose }) => {
  if (!data) return null;

  // --- FUNCIÓN DE IMPRESIÓN ---
  const handlePrintInNewWindow = () => {
    const printWindow = window.open('', 'PRINT', 'height=600,width=400');

    if (!printWindow) {
      alert("Por favor permite las ventanas emergentes.");
      return;
    }

    // LÓGICA INTELIGENTE DE TÍTULOS
    let title = data.businessName || 'LicoBar';
    let subTitle = '';

    if (data.type === 'z-report') {
        title = 'CIERRE DE CAJA';
    } else if (data.type === 'expense') {
        title = 'VALE DE CAJA';
    } else if (data.type === 'order' || data.type === 'quick_sale') {
        if (data.payments && data.payments.length > 0) {
            title = data.businessName || 'LicoBar'; // Venta oficial
        } else {
            title = 'COMANDA / PRE-CUENTA'; // Pedido de garzón
            subTitle = '(NO VÁLIDO COMO FACTURA)';
        }
    }

    // CONSTRUCCIÓN DEL HTML
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

    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket</title>
          <style>
            * { box-sizing: border-box; }
            body { 
                font-family: 'Arial', sans-serif;
                margin: 0; 
                padding: 10px 5px; 
                width: 72mm; 
                color: #000000;
                font-size: 12px;
                line-height: 1.2;
                font-weight: 400;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: 700; } 
            .extra-bold { font-weight: 800; font-size: 14px; }
            .uppercase { text-transform: uppercase; }
            .text-xs { font-size: 10px; }
            .text-lg { font-size: 16px; }
            .text-xl { font-size: 20px; }
            .border-b { border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px; }
            .divider { border-top: 1px dashed #444; margin: 5px 0; }
            .double-divider { border-top: 1px double #000; margin: 5px 0; }
            .flex-between { display: flex; justify-content: space-between; align-items: center; }
            .row { display: flex; width: 100%; font-size: 11px; }
            .col-qty { width: 10%; text-align: center; }
            .col-name { width: 65%; padding-left: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
            .col-price { width: 25%; text-align: right; }
          </style>
        </head>
        <body>
          <div class="text-center border-b">
            <div class="bold text-lg uppercase">${title}</div>
            ${subTitle ? `<div class="text-xs bold">${subTitle}</div>` : ''}
            <div class="text-xs" style="margin-top: 2px;">${data.date}</div>
            <div class="text-xs uppercase">Atiende: ${data.staffName}</div>
            ${data.orderId ? `<div class="text-xs">Orden: #${data.orderId.slice(-6)}</div>` : ''}
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
            <div class="double-divider"></div>
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
            ${data.stats.courtesyTotal > 0 ? `<div class="divider"></div><div class="flex-between bold text-xs"><span>CORTESÍAS (Valor):</span><span>${data.stats.courtesyTotal.toFixed(2)}</span></div>` : ''}
            <br/><div class="text-center bold text-xs" style="border-bottom: 1px solid #000;">PRODUCTOS VENDIDOS</div>
            ${zReportProductsHtml}
          ` : ''}

          <div style="margin-top: 15px; text-align: center; font-size: 10px;">
             ${data.payments ? '*** GRACIAS POR SU PREFERENCIA ***' : '--- CONTROL INTERNO ---'}
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

  // --- EFECTO DE AUTO-IMPRESIÓN ---
  useEffect(() => {
      if (data && data.autoPrint) {
          handlePrintInNewWindow();
      }
  }, [data]); // Se ejecuta cada vez que cambia la 'data' (nuevo recibo)

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gray-800 p-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">
            {data.payments ? 'TICKET DE VENTA' : 'COMANDA (GARZÓN)'}
          </h3>
          <div className="flex gap-2">
              <button onClick={handlePrintInNewWindow} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"><Printer size={18}/> IMPRIMIR</button>
              <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><X size={18}/></button>
          </div>
        </div>
        <div className="p-6 bg-gray-100 flex justify-center">
            <div className="bg-white p-4 shadow text-center w-full border-t-4 border-blue-500">
                <p className="font-bold text-lg mb-2">{data.businessName || 'LicoBar'}</p>
                <p className="text-sm font-bold text-gray-500 uppercase mb-2">
                    {data.payments ? 'Venta Finalizada' : 'Pedido a Cocina / Barra'}
                </p>
                <p className="text-3xl font-black text-gray-800">Bs. {data.type === 'expense' ? data.amount.toFixed(2) : (data.type === 'z-report' ? data.finalCash.toFixed(2) : data.total.toFixed(2))}</p>
                <p className="text-xs text-gray-500 mt-4">Listo para imprimir</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;