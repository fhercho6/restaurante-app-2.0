// src/components/Receipt.jsx - VERSIÓN ALTA DEFINICIÓN (LETRAS GRANDES Y NEGRAS)
import React from 'react';
import { X, Printer } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose }) => {
  if (!data) return null;

  const handlePrintInNewWindow = () => {
    const printWindow = window.open('', 'PRINT', 'height=600,width=400');

    if (!printWindow) {
      alert("Por favor permite las ventanas emergentes.");
      return;
    }

    // --- CONSTRUCCIÓN DEL HTML PARA IMPRESIÓN ---
    
    // 1. Filas de productos (Ventas)
    let itemsHtml = '';
    if (data.items) {
        itemsHtml = data.items.map(item => `
            <div class="row" style="margin-bottom: 4px;">
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

    // 3. Documento HTML Completo
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket</title>
          <style>
            /* RESET BÁSICO */
            * { box-sizing: border-box; }
            body { 
                font-family: Arial, Helvetica, sans-serif; /* Arial se imprime más nítido que Courier */
                margin: 0; 
                padding: 5px; 
                width: 72mm; /* Ancho seguro para papel de 80mm */
                color: #000000; /* Negro puro */
                background: #ffffff;
            }
            
            /* TIPOGRAFÍA */
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: 900; } /* Negrita extra fuerte */
            .uppercase { text-transform: uppercase; }
            
            /* TAMAÑOS */
            .text-sm { font-size: 12px; }
            .text-md { font-size: 14px; } /* Tamaño base aumentado */
            .text-lg { font-size: 18px; }
            .text-xl { font-size: 22px; }
            
            /* ESTRUCTURA */
            .header { margin-bottom: 10px; border-bottom: 2px solid black; padding-bottom: 5px; }
            .divider { border-top: 1px dashed black; margin: 8px 0; }
            .double-divider { border-top: 2px solid black; margin: 8px 0; }
            
            /* FLEXBOX PARA ALINEACIÓN */
            .flex-between { display: flex; justify-content: space-between; align-items: center; }
            
            /* TABLA DE PRODUCTOS (GRID SIMULADO) */
            .row { display: flex; width: 100%; font-size: 14px; font-weight: bold; }
            .col-qty { width: 10%; text-align: center; }
            .col-name { width: 65%; padding-left: 5px; overflow: hidden; white-space: nowrap; text-overflow: clip; }
            .col-price { width: 25%; text-align: right; }

          </style>
        </head>
        <body>
          
          <div class="header text-center">
            <div class="bold text-xl uppercase">${data.type === 'z-report' ? 'CIERRE DE CAJA' : (data.businessName || 'LicoBar')}</div>
            ${data.type === 'expense' ? '<div class="bold text-lg">VALE DE CAJA</div>' : ''}
            <div class="text-sm bold" style="margin-top: 5px;">${data.date}</div>
            <div class="text-sm">Atiende: ${data.staffName}</div>
            ${data.orderId ? `<div class="text-sm">Ticket: #${data.orderId.slice(-6)}</div>` : ''}
          </div>

          ${(data.type === 'order' || data.type === 'quick_sale') ? `
            <div class="row text-sm" style="border-bottom: 1px solid black; padding-bottom: 2px;">
                <div class="col-qty">C</div>
                <div class="col-name">DESCRIPCION</div>
                <div class="col-price">TOTAL</div>
            </div>
            
            <div style="margin-top: 5px;">${itemsHtml}</div>
            
            <div class="double-divider"></div>
            
            <div class="flex-between bold text-xl">
                <span>TOTAL:</span>
                <span>Bs. ${data.total.toFixed(2)}</span>
            </div>
            
            ${data.payments ? `
                <div class="divider"></div>
                <div class="text-md bold">
                    ${data.payments.map(p => `<div class="flex-between"><span>PAGO ${p.method.toUpperCase()}:</span><span>${p.amount.toFixed(2)}</span></div>`).join('')}
                </div>
            ` : ''}
            
            ${data.changeGiven > 0 ? `<div class="text-right text-md bold" style="margin-top:5px;">CAMBIO: ${data.changeGiven.toFixed(2)}</div>` : ''}
          ` : ''}

          ${data.type === 'expense' ? `
            <div style="margin-top: 10px;">
                <p class="text-sm bold">CONCEPTO:</p>
                <p class="text-lg bold uppercase">${data.description}</p>
                <div class="divider"></div>
                <div class="flex-between text-xl bold">
                    <span>RETIRO:</span>
                    <span>Bs. ${data.amount.toFixed(2)}</span>
                </div>
                <br/><br/><br/>
                <div class="text-center text-sm bold" style="border-top: 1px solid black; padding-top: 5px;">FIRMA RESPONSABLE</div>
            </div>
          ` : ''}

          ${data.type === 'z-report' ? `
            <div class="text-md bold">
                <div class="flex-between"><span>Apertura:</span><span>${new Date(data.openedAt).toLocaleTimeString()}</span></div>
                <div class="flex-between"><span>Cierre:</span><span>${new Date().toLocaleTimeString()}</span></div>
            </div>
            <div class="divider"></div>
            <div class="text-md bold">
                <div class="flex-between"><span>Fondo Inicial:</span><span>${data.openingAmount.toFixed(2)}</span></div>
                <div class="flex-between"><span>(+) Ventas Totales:</span><span>${(data.stats.cashSales + data.stats.digitalSales).toFixed(2)}</span></div>
                <div class="flex-between"><span>(-) Gastos:</span><span>${data.stats.totalExpenses.toFixed(2)}</span></div>
            </div>
            
            <div class="double-divider"></div>
            
            <div class="flex-between text-xl bold">
                <span>EN CAJA:</span>
                <span>Bs. ${data.finalCash.toFixed(2)}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="text-md bold">
                <div class="flex-between"><span>Efectivo:</span><span>${data.stats.cashSales.toFixed(2)}</span></div>
                <div class="flex-between"><span>QR / Tarjeta:</span><span>${(data.stats.digitalSales || 0).toFixed(2)}</span></div>
            </div>

            <div class="divider"></div>
            <div class="text-md bold">
                <div class="flex-between"><span>Ventas:</span><span>${(data.stats.cashSales + data.stats.digitalSales).toFixed(2)}</span></div>
                <div class="flex-between"><span>(-) Costo:</span><span>${data.stats.totalCostOfGoods ? data.stats.totalCostOfGoods.toFixed(2) : '0.00'}</span></div>
                <div class="flex-between text-lg" style="margin-top:5px;"><span>GANANCIA:</span><span>${((data.stats.cashSales + data.stats.digitalSales) - (data.stats.totalCostOfGoods || 0)).toFixed(2)}</span></div>
            </div>

            ${data.stats.courtesyTotal > 0 ? `
                <div class="divider"></div>
                <div class="text-center bold text-md">CORTESÍAS ENTREGADAS</div>
                <div class="flex-between bold text-md"><span>Valor:</span><span>${data.stats.courtesyTotal.toFixed(2)}</span></div>
            ` : ''}
            
            <div class="divider"></div>
            <div class="text-center bold text-md" style="margin-bottom:5px;">PRODUCTOS VENDIDOS</div>
            ${zReportProductsHtml}
          ` : ''}

          <div class="divider"></div>
          <div class="text-center text-sm bold">*** GRACIAS ***</div>
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

  // VISTA EN PANTALLA (NO AFECTA IMPRESIÓN)
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
            <div className="bg-white p-4 shadow text-center w-full">
                <p className="font-bold text-lg mb-2">{data.businessName || 'LicoBar'}</p>
                <p className="text-2xl font-black">Bs. {data.type === 'expense' ? data.amount.toFixed(2) : (data.type === 'z-report' ? data.finalCash.toFixed(2) : data.total.toFixed(2))}</p>
                <p className="text-xs text-gray-500 mt-4">Presiona IMPRIMIR para ticket físico</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;