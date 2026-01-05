// src/components/Receipt.jsx - FORMATO REPORTE Z EXACTO (IMAGENES 05 y 06)
import React, { useEffect, useState } from 'react';
import { X, Printer, Loader2, CheckCircle } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose, printerType = 'thermal' }) => {
    const [status, setStatus] = useState('preview');

    if (!data) return null;

    const fmt = (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const isZReport = data.type === 'z-report';
    // Lógica: Si es Z-Report usa Carta (si printerType es carta), sino Térmico.
    // Pero para asegurar que el Z salga bien, forzamos el diseño carta si es Z-Report
    const useThermalFormat = !isZReport || printerType === 'thermal';

    const isCourtesySale = data.payments && data.payments.some(p => p.method === 'Cortesía');
    const staffName = data.staffName || 'General';
    const cashierName = data.cashierName || 'Caja';

    // Limpieza de códigos para comandas múltiples
    const displayCode = data.orderId
        ? data.orderId.replace(/ORD-/g, '').replace(/,/g, ' -')
        : '----';

    // COLORES: Negro puro para el Reporte Z (como la imagen), Gris oscuro para tickets (ahorro)
    const INK_COLOR = isZReport ? '#000000' : '#404040';
    const BORDER_COLOR = isZReport ? '#000000' : '#999999';

    // --- MODO 1: REPORTE CARTA (REPLICA EXACTA IMAGENES 05 y 06) ---
    const renderLetterReport = () => {
        const stats = data.stats || {};

        // Filas de productos para la Página 2
        const productRows = data.soldProducts ? data.soldProducts.map(p => {
            // Detectar si es regalo total para mostrar texto o 0.00
            const valCortesia = (p.qtyCourtesy * (p.totalCost / (p.qty || 1))) || 0; // Estimado visual

            return `
            <tr>
                <td style="text-align:left;padding:6px 4px;">${p.name}</td>
                <td style="text-align:center;padding:6px 4px;">${p.qtySold || 0}</td>
                <td style="text-align:center;padding:6px 4px;">${p.qtyCourtesy || 0}</td>
                <td style="text-align:right;padding:6px 4px;">${fmt(p.totalCost)}</td>
                <td style="text-align:right;padding:6px 4px; color:#666;">${p.qtyCourtesy > 0 ? (p.total === 0 ? '(Regalo)' : 'Mixto') : '-'}</td>
                <td style="text-align:right;padding:6px 4px; font-weight:bold;">${fmt(p.total)}</td>
            </tr>`;
        }).join('') : '';

        // Totales
        const totalQtySold = data.soldProducts ? data.soldProducts.reduce((a, b) => a + (b.qtySold || 0), 0) : 0;
        const totalQtyCort = data.soldProducts ? data.soldProducts.reduce((a, b) => a + (b.qtyCourtesy || 0), 0) : 0;

        const expensesRows = stats.expensesList && stats.expensesList.length > 0
            ? stats.expensesList.map(e => `<tr><td style="padding:5px 0;">• ${e.description}</td><td style="text-align:right;padding:5px 0;">${fmt(e.amount)}</td></tr>`).join('')
            : '<tr><td colspan="2" style="font-style:italic;padding:5px 0;">Sin gastos</td></tr>';

        return `
        <html>
        <head>
            <title>Reporte Cierre Z</title>
            <style>
                body { font-family: 'Arial', sans-serif; font-size: 12px; margin: 40px; color: #000; line-height: 1.4; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                
                /* HEADER PRINCIPAL */
                .main-header { text-align: center; margin-bottom: 30px; }
                .biz-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                .report-title { font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
                .meta-info { font-size: 11px; text-transform: uppercase; }

                /* LAYOUT DE CAJAS (PAGINA 1) */
                .container { display: flex; gap: 30px; align-items: flex-start; }
                .col { flex: 1; display: flex; flex-direction: column; gap: 20px; }
                
                .box { border: 2px solid #000; padding: 10px; }
                .box-header { font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; }
                
                .table-clean { width: 100%; border-collapse: collapse; }
                .table-clean td { padding: 5px 0; }
                .row-total td { border-top: 2px solid #000; font-weight: bold; padding-top: 8px; font-size: 13px; }

                /* CAJA CORTESIA (PUNTEADA) */
                .box-dashed { border: 2px dashed #444; padding: 10px; margin-top: 20px; }
                
                /* CAJA EFECTIVO REAL (GRUESA) */
                .box-thick { border: 3px solid #000; padding: 15px; margin-top: 20px; }
                .real-cash-title { font-weight: bold; font-size: 11px; text-transform: uppercase; }
                .real-cash-amount { font-size: 32px; font-weight: 900; text-align: right; margin-top: 5px; }

                /* PAGINA 2 */
                .page-break { page-break-before: always; }
                .table-products { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 20px; }
                .table-products th { text-align: left; border-bottom: 2px solid #000; padding: 5px; text-transform: uppercase; }
                .table-products td { border-bottom: 1px solid #ccc; }
                .footer-legend { font-size: 9px; text-align: center; margin-top: 20px; color: #555; }
            </style>
        </head>
        <body>
            
            <div class="main-header">
                <div class="biz-name">${data.businessName || 'LicoBar'}</div>
                <div class="report-title">REPORTE DE CIERRE DE CAJA (CORTE Z)</div>
                <div class="meta-info">
                    JORNADA: ${new Date(data.openedAt || Date.now()).toLocaleDateString()} al ${new Date(data.date).toLocaleDateString()}<br/>
                    RESPONSABLE: ${staffName.toUpperCase()} | CAJERO: ${cashierName.toUpperCase()}
                </div>
            </div>

            <div class="container">
                <div class="col">
                    <div class="box">
                        <div class="box-header">I. INGRESOS (DINERO ENTRANTE)</div>
                        <table class="table-clean">
                            <tr><td>FONDO INICIAL (BASE)</td><td class="text-right">${fmt(data.openingAmount)}</td></tr>
                            <tr><td>VENTAS EFECTIVO</td><td class="text-right">${fmt(stats.cashSales)}</td></tr>
                            <tr><td>VENTAS QR / TRANSF.</td><td class="text-right">${fmt(stats.qrSales)}</td></tr>
                            <tr><td>VENTAS TARJETA</td><td class="text-right">${fmt(stats.cardSales)}</td></tr>
                            <tr class="row-total"><td>TOTAL INGRESOS</td><td class="text-right">${fmt(data.openingAmount + stats.cashSales + stats.qrSales + stats.cardSales)}</td></tr>
                        </table>
                    </div>
                </div>

                <div class="col">
                    <div class="box">
                        <div class="box-header">II. EGRESOS (SALIDAS DE DINERO)</div>
                        <table class="table-clean">
                            ${expensesRows}
                            <tr class="row-total"><td>TOTAL GASTOS</td><td class="text-right">${fmt(stats.totalExpenses)}</td></tr>
                        </table>
                    </div>

                    <div class="box-dashed">
                        <div class="box-header" style="border-bottom: 1px dashed #444;">III. CONTROL DE CORTESÍAS</div>
                        <table class="table-clean">
                            <tr><td>• PRODUCTOS REGALADOS</td><td class="text-right">${fmt(stats.courtesyTotal)}</td></tr>
                            <tr><td colspan="2" style="font-size: 9px; color:#555;">* Este monto NO afecta el efectivo en caja.</td></tr>
                        </table>
                    </div>

                    <div class="box-thick">
                        <div class="real-cash-title">EFECTIVO REAL EN CAJA</div>
                        <div class="real-cash-amount">Bs. ${fmt(data.finalCash)}</div>
                        <div class="text-right" style="font-size:10px;">(Ingresos Efectivo - Gastos Efectivo)</div>
                    </div>
                </div>
            </div>

            <div class="page-break"></div>

            <div class="main-header" style="margin-bottom:10px;">
                <div class="report-title">ANEXO: DETALLE DE PRODUCTOS VENDIDOS</div>
                <div class="meta-info">${new Date(data.date).toLocaleDateString()} - ${staffName}</div>
            </div>

            <div style="font-weight:bold; font-size:12px; margin-bottom:5px; color:#666;">IV. INVENTARIO Y VENTAS</div>

            <table class="table-products">
                <thead>
                    <tr>
                        <th style="width:40%;">PRODUCTO</th>
                        <th class="text-center" style="width:10%;">CANT.V</th>
                        <th class="text-center" style="width:10%;">CANT.C</th>
                        <th class="text-right" style="width:13%;">T. COSTO</th>
                        <th class="text-right" style="width:13%;">VAL. CORT</th>
                        <th class="text-right" style="width:14%;">T. VENTA</th>
                    </tr>
                </thead>
                <tbody>
                    ${productRows}
                    <tr style="font-weight:900; background-color:#eee;">
                        <td class="text-right">TOTALES GENERALES</td>
                        <td class="text-center">${totalQtySold}</td>
                        <td class="text-center">${totalQtyCort}</td>
                        <td class="text-right">${fmt(stats.totalCostOfGoods)}</td>
                        <td class="text-right">${fmt(stats.courtesyTotal)}</td>
                        <td class="text-right">${fmt((stats.cashSales || 0) + (stats.digitalSales || 0))}</td>
                    </tr>
                </tbody>
            </table>

            <div class="footer-legend">
                CANT.V = Vendidos | CANT.C = Cortesías | T.COSTO = Costo Mercadería | VAL.CORT = Valor regalado | T.VENTA = Ingreso Real
            </div>

        </body>
        </html>
      `;
    };

    // --- MODO 2: TICKET TÉRMICO (Manteniendo optimización Eco) ---
    const renderThermalReport = () => {
        const stats = data.stats || {};
        let title = (data.businessName || 'LicoBar').toUpperCase();
        if (data.type === 'expense') title = 'VALE DE GASTO';
        if (isCourtesySale) title = 'RECIBO DE CORTESÍA';

        let itemsHtml = data.items ? data.items.map(item => `<div class="row" style="margin-bottom:2px;"><div class="col-qty">${item.qty}</div><div class="col-name">${item.name}</div><div class="col-price">${isCourtesySale ? '0.00' : fmt(item.price * item.qty)}</div></div>`).join('') : '';
        let zReportRows = data.soldProducts ? data.soldProducts.map(p => `<div class="row"><div class="col-qty">${p.qtySold + (p.qtyCourtesy || 0)}</div><div class="col-name">${p.name}</div><div class="col-price">${fmt(p.total)}</div></div>`).join('') : '';

        return `<html><head><style>
            * { box-sizing: border-box; }
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 5px 0; width: 72mm; font-size: 12px; color: ${INK_COLOR}; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: 600; } 
            .border-b { border-bottom: 1px dashed ${BORDER_COLOR}; padding-bottom: 5px; margin-bottom: 5px; }
            .flex-between { display: flex; justify-content: space-between; }
            .row { display: flex; width: 100%; font-size: 11px; }
            .col-qty { width: 10%; text-align: center; } 
            .col-name { width: 65%; padding-left: 5px; } 
            .col-price { width: 25%; text-align: right; }
            .code-box { font-size: 20px; font-weight: 600; text-align: center; margin: 5px 0; border: 1px solid ${BORDER_COLOR}; padding: 4px; color: ${INK_COLOR}; word-wrap: break-word; }
            .courtesy-box { border: 1px dashed ${BORDER_COLOR}; padding: 5px; margin: 10px 0; text-align: center; }
            </style></head><body>
            <div class="text-center border-b">
                <div class="bold" style="font-size:16px;">${data.type === 'z-report' ? 'CIERRE DE CAJA' : title}</div>
                <div style="font-size:10px;">${data.date}</div>
                <div style="font-size:10px;margin-top:2px;">Atiende: ${staffName.split(' ')[0]} | Caja: ${cashierName.split(' ')[0]}</div>
                ${(data.type === 'order' || data.type === 'quick_sale') ? `<div class="code-box">#${displayCode}</div>` : ''}
            </div>
            ${data.type === 'z-report' ? `<div class="flex-between"><span>Fondo Inicial:</span><span>${fmt(data.openingAmount)}</span></div><div class="flex-between bold"><span>(+) Ventas:</span><span>${fmt((stats.cashSales || 0) + (stats.digitalSales || 0))}</span></div><div class="flex-between"><span>(-) Gastos:</span><span>${fmt(stats.totalExpenses)}</span></div><div class="border-b" style="margin:5px 0;"></div><div class="flex-between bold" style="font-size:18px;"><span>CAJA:</span><span>Bs. ${fmt(data.finalCash)}</span></div><br/><div class="bold text-center border-b">PRODUCTOS</div>${zReportRows}` : data.type === 'expense' ? `<div style="margin-top:10px;"><span style="font-size:10px;">CONCEPTO:</span><br/><span class="bold uppercase" style="font-size:14px;">${data.description}</span><div class="border-b" style="margin:5px 0;"></div><div class="flex-between bold" style="font-size:18px;"><span>RETIRO:</span><span>Bs. ${fmt(data.amount)}</span></div><br/><br/><div class="text-center" style="font-size:10px;border-top:1px solid ${BORDER_COLOR};padding-top:5px;">FIRMA</div></div>` : `
                <div class="row bold" style="font-size:10px;border-bottom:1px solid ${BORDER_COLOR};margin-bottom:2px;"><div class="col-qty">C</div><div class="col-name">DESCRIPCION</div><div class="col-price">TOTAL</div></div>${itemsHtml}<div class="border-b" style="margin:5px 0;"></div>
                ${isCourtesySale ? `<div class="courtesy-box"><div class="bold" style="font-size:14px;">CORTESÍA AUTORIZADA</div><div style="font-size:10px;">Total Bonificado: Bs. ${fmt(data.total)}</div></div><div class="flex-between bold" style="font-size:16px;"><span>A PAGAR:</span><span>Bs. 0.00</span></div>` : `<div class="flex-between bold" style="font-size:18px;"><span>TOTAL:</span><span>Bs. ${fmt(data.total)}</span></div>${data.payments ? `<div style="margin-top:5px;font-size:10px;">${data.payments.map(p => `<div class="flex-between"><span>PAGO ${p.method.toUpperCase()}:</span><span>${fmt(p.amount)}</span></div>`).join('')}</div>` : ''}${data.changeGiven > 0 ? `<div class="text-right bold" style="margin-top:2px;">CAMBIO: ${fmt(data.changeGiven)}</div>` : ''}`}
            `}
            <div style="margin-top:15px;text-align:center;font-size:10px;">*** GRACIAS POR SU VISITA ***</div></body></html>`;
    };

    const handlePrintInNewWindow = () => {
        // Si NO es Z-Report, siempre es térmico
        const isThermal = useThermalFormat;

        // Dimensiones de ventana
        const width = isThermal ? 400 : 1000;
        const height = isThermal ? 600 : 800;

        const printWindow = window.open('', 'PRINT', `height=${height},width=${width}`);
        if (!printWindow) { alert("⚠️ Permite ventanas emergentes para imprimir."); setStatus('preview'); return; }

        const htmlContent = isThermal ? renderThermalReport() : renderLetterReport();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
            if (data.autoPrint) {
                setStatus('done');
                setTimeout(onClose, 2000);
            }
        }, 100);
    };

    useEffect(() => {
        if (data && data.autoPrint) {
            setStatus('printing');
            setTimeout(handlePrintInNewWindow, 300);
        }
    }, [data]);

    const previewAmount = data.type === 'expense' ? data.amount : (data.type === 'z-report' ? data.finalCash : data.total);

    return (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">

                {status === 'preview' && (
                    <div className="bg-gray-800 p-3 flex justify-between items-center">
                        <h3 className="text-white font-bold text-sm">{useThermalFormat ? 'TICKET' : 'REPORTE CARTA'}</h3>
                        <div className="flex gap-2">
                            <button onClick={handlePrintInNewWindow} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"><Printer size={18} /> IMPRIMIR</button>
                            <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><X size={18} /></button>
                        </div>
                    </div>
                )}

                <div className="p-8 flex flex-col items-center justify-center text-center bg-gray-50 min-h-[200px]">
                    {status === 'printing' ? (
                        <>
                            <Loader2 size={64} className="text-blue-600 animate-spin mb-4" />
                            <h3 className="text-xl font-bold text-gray-800">Imprimiendo...</h3>
                            <p className="text-sm text-gray-500">Espere un momento</p>
                        </>
                    ) : status === 'done' ? (
                        <>
                            <CheckCircle size={64} className="text-green-500 mb-4 animate-in zoom-in" />
                            <h3 className="text-xl font-bold text-gray-800">¡Listo!</h3>
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col overflow-hidden bg-white shadow-sm border border-gray-200">
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 scale-90 origin-top">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: useThermalFormat ? '(Vista previa térmica no disponible, imprima para ver)' : renderLetterReport()
                                    }}
                                    className="bg-white shadow p-4 min-h-[500px]"
                                />
                            </div>
                            <div className="p-3 border-t border-gray-100 bg-white grid grid-cols-2 gap-4 text-xs text-left">
                                <div><span className="block text-gray-400 font-bold uppercase">Formato</span><span className="font-bold text-gray-700">{useThermalFormat ? 'TÉRMICO (80mm)' : 'CARTA (A4)'}</span></div>
                                <div><span className="block text-gray-400 font-bold uppercase">Total</span><span className="font-bold text-gray-700 text-lg">Bs. {isCourtesySale ? '0.00' : fmt(previewAmount)}</span></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Receipt;