// src/components/Receipt.jsx - REPORTE Z MEJORADO (CENTRADO Y DETALLADO)
import React, { useEffect } from 'react';
import { X, Printer } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose }) => {
  if (!data) return null;

  const handlePrintInNewWindow = () => {
    const printWindow = window.open('', 'PRINT', 'height=600,width=400');

    if (!printWindow) {
      alert("Por favor permite las ventanas emergentes.");
      return;
    }

    // --- 1. PREPARACIÓN DE DATOS ---
    let title = data.businessName || 'LicoBar';
    let subTitle = '';

    if (data.type === 'z-report') {
        title = 'REPORTE DE CIERRE (Z)';
    } else if (data.type === 'expense') {
        title = 'VALE DE CAJA';
    } else if (data.type === 'order' || data.type === 'quick_sale') {
        if (data.payments && data.payments.length > 0) {
            title = data.businessName || 'LicoBar';
        } else {
            title = 'COMANDA / PRE-CUENTA';
            subTitle = '(NO VÁLIDO COMO FACTURA)';
        }
    }

    // --- 2. GENERACIÓN DE HTML (ITEMS VENTA) ---
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

    // --- 3. GENERACIÓN DE HTML (PRODUCTOS Z-REPORT CON COSTOS) ---
    let zReportProductsHtml = '';
    if (data.soldProducts) {
        zReportProductsHtml = data.soldProducts.map(prod => `
            <div style="margin-bottom: 4px; border-bottom: 1px dotted #ccc; padding-bottom: 2px;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11px;">
                    <span style="width: 10%; text-align: center;">${prod.qty}</span>
                    <span style="width: 60%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${prod.name}</span>
                    <span style="width: 30%; text-align: right;">${prod.total.toFixed(2)}</span>
                </div>
                
                <div style="display: flex; justify-content: flex-end; font-size: 9px; color: #444; margin-top: 1px;">
                    <span style="margin-right: 10px;">Costo: ${prod.totalCost ? prod.totalCost.toFixed(2) : '0.00'}</span>
                    <span>Ganancia: ${(prod.total - (prod.totalCost || 0)).toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    }

    // --- 4. DOCUMENTO HTML FINAL ---
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket</title>
          <style>
            * { box-sizing: border-box; }
            body { 
                font-family: 'Arial', sans-serif;
                margin: 0 auto; /* CENTRADO AUTOMÁTICO */
                padding: 5px 0; 
                width: 72mm; /* Ancho ajustado para margen seguro */
                color: #000000;
                font-size: 12px;
                line-height: 1.2;
                font-weight: 400;
                text-align: center; /* CENTRA TODO POR DEFECTO */
            }
            
            /* ALINEACIONES */
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            
            /* ESTILOS DE TEXTO */
            .bold { font-weight: 700; } 
            .extra-bold { font-weight: 900; font-size: 14px; }
            .uppercase { text-transform: uppercase; }
            .text-xs { font-size: 10px; }
            .text-lg { font-size: 16px; }
            .text-xl { font-size: 20px; }
            
            /* DIVISORES */
            .border-b { border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 5px; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .double-divider { border-top: 2px double #000; margin: 6px 0; }
            
            /* FLEX UTILS (Para alinear izq/der en la misma línea) */
            .flex-between { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                text-align: left; /* Resetea el text-align center del body */
            }
            
            /* TABLA VENTA NORMAL */
            .row { display: flex; width: 100%; font-size: 11px; text-align: left; }
            .col-qty { width: 10%; text-align: center; }
            .col-name { width: 65%; padding-left: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
            .col-price { width: 25%; text-align: right; }
          </style>
        </head>
        <body>
          
          <div class="border-b">
            <div class="bold text-xl uppercase">${title}</div>
            ${subTitle ? `<div class="text-xs bold">${subTitle}</div>` : ''}
            <div class="text-xs" style="margin-top: 2px;">${data.date}</div>
            <div class="text-xs uppercase">Resp: ${data.staffName}</div>
            ${data.orderId ? `<div class="text-xs">Ref: #${data.orderId.slice(-6)}</div>` : ''}
          </div>

          ${(data.type === 'order' || data.type === 'quick_sale') ? `
            <div class="row bold" style="margin-bottom: 4px; font-size: 10px; border-bottom: 1px solid black;">
                <div class="col-qty">#</div>
                <div class="col-name">DESCRIPCION</div>
                <div class="col-price">TOTAL</div>
            </div>
            
            <div class="text-left">${itemsHtml}</div>
            
            <div class="divider"></div>
            
            <div class="flex-between extra-bold">
                <span>TOTAL A PAGAR:</span>
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
            <div style="margin-top: 10px;" class="text-left">
                <p class="text-xs bold">CONCEPTO:</p>
                <p class="text-lg uppercase">${data.description}</p>
                <div class="divider"></div>
                <div class="flex-between text-xl bold">
                    <span>MONTO:</span>
                    <span>Bs. ${data.amount.toFixed(2)}</span>
                </div>
                <br/><br/>
                <div class="text-center text-xs" style="border-top: 1px solid #000; padding-top: 5px; width: 80%; margin: 0 auto;">FIRMA DE CONFORMIDAD</div>
            </div>
          ` : ''}

          ${data.type === 'z-report' ? `
            <div class="text-xs text-left">
                <div class="flex-between"><span>Apertura:</span><span>${new Date(data.openedAt).toLocaleTimeString()}</span></div>
                <div class="flex-between"><span>Cierre:</span><span>${new Date().toLocaleTimeString()}</span></div>
            </div>
            
            <div class="divider"></div>
            
            <div class="text-xs text-left">
                <p class="bold text-center uppercase" style="margin: 2px 0;">Resumen Financiero</p>
                <div class="flex-between"><span>(+) Fondo Inicial:</span><span>${data.openingAmount.toFixed(2)}</span></div>
                <div class="flex-between bold"><span>(+) Ventas Totales:</span><span>${(data.stats.cashSales + data.stats.digitalSales).toFixed(2)}</span></div>
                <div class="divider"></div>
                
                <div class="flex-between"><span>• Efectivo:</span><span>${data.stats.cashSales.toFixed(2)}</span></div>
                <div class="flex-between"><span>• QR / Transf:</span><span>${data.stats.qrSales.toFixed(2)}</span></div>
                <div class="flex-between"><span>• Tarjeta:</span><span>${data.stats.cardSales.toFixed(2)}</span></div>
                
                <div class="divider"></div>
                <div class="flex-between text-left"><span>(-) Gastos Caja:</span><span>${data.stats.totalExpenses.toFixed(2)}</span></div>
            </div>
            
            <div class="double-divider"></div>
            
            <div class="flex-between text-xl bold">
                <span>EFECTIVO REAL:</span>
                <span>Bs. ${data.finalCash.toFixed(2)}</span>
            </div>
            
            <div class="divider"></div>
            <div class="text-xs text-left">
                <div class="flex-between"><span>Ventas Totales:</span><span>${(data.stats.cashSales + data.stats.digitalSales).toFixed(2)}</span></div>
                <div class="flex-between"><span>(-) Costo Mercadería:</span><span>${data.stats.totalCostOfGoods ? data.stats.totalCostOfGoods.toFixed(2) : '0.00'}</span></div>
                <div class="divider"></div>
                <div class="flex-between bold text-lg"><span>GANANCIA BRUTA:</span><span>${((data.stats.cashSales + data.stats.digitalSales) - (data.stats.totalCostOfGoods || 0)).toFixed(2)}</span></div>
            </div>

            ${data.stats.courtesyTotal > 0 ? `
                <div class="divider"></div>
                <div class="flex-between bold text-xs"><span>CORTESÍAS (Regalado):</span><span>${data.stats.courtesyTotal.toFixed(2)}</span></div>
            ` : ''}
            
            <br/>
            <div class="text-center bold text-xs" style="border-bottom: 2px solid #000; margin-bottom: 5px;">DETALLE PRODUCTOS VENDIDOS</div>
            <div class="flex-between text-xs bold" style="margin-bottom: 2px;">
                <span style="width:10%">#</span>
                <span style="width:60%">Producto</span>
                <span style="width:30%; text-align:right">Venta</span>
            </div>
            ${zReportProductsHtml}
          ` : ''}

          <div style="margin-top: 15px; text-align: center; font-size: 10px;">
             ${data.payments ? '*** GRACIAS POR SU VISITA ***' : '--- DOCUMENTO INTERNO ---'}
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

  // EFECTO DE AUTO-IMPRESIÓN
  useEffect(() => {
      if (data && data.autoPrint) {
          handlePrintInNewWindow();
      }
  }, [data]);

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gray-800 p-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">
            {data.payments ? 'TICKET DE VENTA' : 'COMANDA'}
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
                    {data.type === 'z-report' ? 'Reporte Generado' : (data.payments ? 'Venta Finalizada' : 'Pedido Generado')}
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