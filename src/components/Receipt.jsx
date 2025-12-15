// src/components/Receipt.jsx - VERSIÓN FINAL AJUSTADA (ESTILOS AGRESIVOS)
import React from 'react';
import { X, Printer, DollarSign } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose }) => {
  if (!data) return null;

  // ESTILOS AGRESIVOS PARA IMPRESORA TÉRMICA
  const printStyles = `
    @page {
      size: 80mm auto; /* Fuerza al navegador a reconocer el ancho */
      margin: 0mm; /* Elimina márgenes del sistema */
    }
    @media print {
      body, html {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: auto !important;
      }
      /* Ocultar todo lo que no sea el ticket */
      .no-print, nav, header, footer { 
        display: none !important; 
      }
      
      /* Contenedor principal del ticket */
      .printable-area {
        display: block !important;
        position: relative !important;
        width: 100% !important; /* Ocupa todo el ancho del papel configurado */
        max-width: 80mm; /* Límite para seguridad */
        margin: 0 !important;
        padding: 5px !important; /* Pequeño respiro interno */
        font-family: 'Courier New', Courier, monospace !important; 
        font-size: 12px !important; /* Tamaño legible estándar */
        color: black !important;
        background: white !important;
        overflow: hidden;
      }

      /* Ajustes para textos largos */
      .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      /* Asegurar que las líneas divisoras se vean */
      .border-b {
        border-bottom: 1px dashed black !important;
      }
      
      /* Espacio final para que el corte de papel no rompa el texto */
      .cut-space {
        height: 10mm; 
        width: 100%;
      }
    }
  `;

  // CONTENIDO DEL TICKET
  const ReceiptContent = () => (
    <div className="printable-area p-4 bg-white w-full max-w-sm mx-auto font-mono text-xs leading-tight text-gray-900">
      
      {/* CABECERA */}
      <div className="text-center mb-2 pb-2 border-b border-black">
        <h2 className="text-lg font-black uppercase mb-1">{data.type === 'z-report' ? 'REPORTE Z' : (data.businessName || 'LicoBar')}</h2>
        {data.type === 'expense' && <h3 className="text-base font-bold">VALE DE CAJA</h3>}
        
        <div className="text-[10px] mt-1">
            <p>{data.date}</p>
            {data.orderId && <p>Ticket: #{data.orderId.slice(-6)}</p>}
            <p>Atiende: {data.staffName}</p>
        </div>
      </div>

      {/* CUERPO: VENTAS */}
      {(data.type === 'order' || data.type === 'quick_sale') && (
        <>
          <div className="border-b border-black py-1 mb-1">
            <div className="flex justify-between font-bold text-[10px] uppercase mb-1"><span>Cant/Prod</span><span>Total</span></div>
            {data.items.map((item, index) => (
              <div key={index} className="flex justify-between py-0.5 text-[11px]">
                <span className="w-[70%] truncate text-left">{item.qty} {item.name}</span>
                <span className="w-[30%] text-right">{((item.price * item.qty) || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-sm font-black mt-2 mb-1"><span>TOTAL A PAGAR</span><span className="text-lg">Bs. {data.total.toFixed(2)}</span></div>
          
          {/* MÉTODOS DE PAGO */}
          {data.payments && (
            <div className="mt-1 text-[10px] border-t border-dotted border-black pt-1">
                {data.payments.map((p, i) => (<div key={i} className="flex justify-between"><span>Pagado ({p.method}):</span><span>{p.amount.toFixed(2)}</span></div>))}
                {data.changeGiven > 0 && (<div className="flex justify-between font-bold mt-1"><span>Cambio:</span><span>{data.changeGiven.toFixed(2)}</span></div>)}
            </div>
          )}
        </>
      )}

      {/* CUERPO: GASTOS */}
      {data.type === 'expense' && (
        <div className="space-y-2 mb-4 mt-2">
          <div className="flex justify-between text-xs"><span>Concepto:</span><span className="font-bold text-right">{data.description}</span></div>
          <div className="flex justify-between text-sm font-bold border-t border-black pt-2 mt-2"><span>MONTO RETIRADO:</span><span>Bs. {data.amount.toFixed(2)}</span></div>
          <div className="mt-8 pt-8 border-t border-black text-center"><p className="text-[10px] uppercase">Firma Responsable</p></div>
        </div>
      )}

      {/* CUERPO: REPORTE Z */}
      {data.type === 'z-report' && (
        <>
          <div className="space-y-1 mb-2 text-[10px]">
            <div className="flex justify-between"><span>Apertura:</span><span>{new Date(data.openedAt).toLocaleTimeString()}</span></div>
            <div className="flex justify-between"><span>Cierre:</span><span>{new Date().toLocaleTimeString()}</span></div>
          </div>
          <div className="border-b border-black pb-2 mb-2">
            <p className="font-bold text-[10px] uppercase border-b border-dotted border-black mb-1">Finanzas</p>
            <div className="flex justify-between text-[11px]"><span>Fondo Inicial:</span><span>{data.openingAmount.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-[11px] mt-1"><span>(+) Ventas Totales:</span><span>{(data.stats.cashSales + data.stats.digitalSales).toFixed(2)}</span></div>
            <div className="pl-1 text-[9px] italic mb-1">
                <div className="flex justify-between"><span>Efvo: {data.stats.cashSales.toFixed(2)}</span> <span>Dig: {data.stats.digitalSales.toFixed(2)}</span></div>
            </div>
            <div className="flex justify-between text-[11px]"><span>(-) Gastos:</span><span>{data.stats.totalExpenses.toFixed(2)}</span></div>
          </div>
          <div className="flex justify-between items-center text-sm font-black border-b border-black pb-2 mb-2">
            <span>EFECTIVO EN CAJA</span>
            <span>Bs. {data.finalCash.toFixed(2)}</span>
          </div>
          
          {/* RENTABILIDAD */}
          <div className="mb-2 text-[10px] border-b border-dotted border-black pb-2">
             <div className="flex justify-between"><span>Ventas Totales:</span><span>{(data.stats.cashSales + data.stats.digitalSales).toFixed(2)}</span></div>
             <div className="flex justify-between"><span>(-) Costo Mercadería:</span><span>{data.stats.totalCostOfGoods ? data.stats.totalCostOfGoods.toFixed(2) : '0.00'}</span></div>
             <div className="flex justify-between font-bold mt-1"><span>(=) GANANCIA:</span><span>{((data.stats.cashSales + data.stats.digitalSales) - (data.stats.totalCostOfGoods || 0)).toFixed(2)}</span></div>
          </div>

          {data.stats.courtesyTotal > 0 && (
             <div className="mb-2 text-[10px] border-b border-dotted border-black pb-2">
                 <p className="font-bold text-center">CORTESÍAS</p>
                 <div className="flex justify-between"><span>Valor Regalado:</span><span>{data.stats.courtesyTotal.toFixed(2)}</span></div>
             </div>
          )}

          {data.soldProducts && data.soldProducts.length > 0 && (
            <div className="mt-2">
                <p className="font-bold text-center border-b border-black text-[10px] mb-1">PRODUCTOS VENDIDOS</p>
                <div className="flex justify-between text-[9px] font-bold border-b border-dotted border-black mb-1">
                    <span className="w-6">CANT</span><span className="flex-1">DESC</span><span className="w-10 text-right">TOTAL</span>
                </div>
                {data.soldProducts.map((prod, i) => (
                    <div key={i} className="flex justify-between py-0.5 text-[10px]">
                        <span className="w-6 text-center">{prod.qty}</span>
                        <span className="flex-1 truncate pr-1">{prod.name} {prod.isCourtesy && '(R)'}</span>
                        <span className="w-10 text-right">{prod.isCourtesy ? '0.00' : prod.total.toFixed(2)}</span>
                    </div>
                ))}
            </div>
          )}
        </>
      )}

      <div className="text-center mt-4 text-[10px]">
          <p>*** GRACIAS ***</p>
          <div className="cut-space"></div> {/* ESPACIO PARA CORTE */}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <style>{printStyles}</style>
      <div className="bg-white w-full max-w-sm shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gray-800 p-3 flex justify-between items-center no-print">
          <h3 className="text-white font-bold text-sm">VISTA PREVIA</h3>
          <div className="flex gap-2">
              <button onClick={onPrint} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"><Printer size={18}/></button>
              <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><X size={18}/></button>
          </div>
        </div>
        <div className="overflow-y-auto bg-gray-200 flex justify-center p-4">
            {/* El contenedor que se verá en pantalla */}
            <div className="bg-white shadow-lg w-[80mm] min-h-[100mm]">
                <ReceiptContent />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;