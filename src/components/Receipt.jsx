// src/components/Receipt.jsx - AJUSTADO PARA IMPRESORAS TÉRMICAS (80mm)
import React from 'react';
import { X, Printer, DollarSign } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose }) => {
  if (!data) return null;

  // ESTILOS PARA FORZAR TAMAÑO TICKET
  const printStyles = `
    @page {
      size: auto;
      margin: 0mm;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      /* Ocultamos todo lo que no sea el ticket */
      .no-print { display: none !important; }
      
      /* Configuramos el contenedor del ticket */
      .printable-area {
        position: absolute;
        top: 0;
        left: 0;
        width: 80mm !important; /* ANCHO ESTÁNDAR DE IMPRESORA */
        padding: 5mm;
        margin: 0;
        font-family: 'Courier New', Courier, monospace; /* Fuente tipo ticket */
        background: white;
        color: black;
      }
    }
  `;

  // CONTENIDO COMÚN DEL TICKET
  const ReceiptContent = () => (
    <div className="printable-area p-6 bg-white w-full max-w-sm mx-auto font-mono text-xs leading-relaxed text-gray-900 print:text-black print:max-w-none print:w-[80mm] print:p-2">
      
      {/* CABECERA */}
      <div className="text-center mb-4 border-b-2 border-black pb-2">
        <h2 className="text-xl font-black uppercase">{data.type === 'z-report' ? 'REPORTE DE CIERRE' : (data.businessName || 'LicoBar')}</h2>
        {data.type === 'expense' && <h3 className="text-lg font-bold">VALE DE SALIDA</h3>}
        
        <p className="text-xs font-bold mt-1">{data.date}</p>
        <p className="text-[10px]">Atendido por: {data.staffName}</p>
        {data.orderId && <p className="text-[10px]">Ticket #{data.orderId.slice(-6)}</p>}
      </div>

      {/* CUERPO SEGÚN TIPO */}
      
      {/* 1. VENTAS */}
      {(data.type === 'order' || data.type === 'quick_sale') && (
        <>
          <div className="border-b border-dashed border-black py-2 mb-2">
            <div className="flex justify-between font-bold text-[10px] uppercase mb-1"><span>Cant. Producto</span><span>Total</span></div>
            {data.items.map((item, index) => (
              <div key={index} className="flex justify-between py-0.5 text-[11px]">
                <span className="truncate w-3/4">{item.qty} x {item.name}</span>
                <span>{((item.price * item.qty) || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-base font-black mt-2"><span>TOTAL</span><span>Bs. {data.total.toFixed(2)}</span></div>
          {data.payments && (
            <div className="mt-2 text-[10px] border-t border-dashed border-black pt-2">
                {data.payments.map((p, i) => (<div key={i} className="flex justify-between"><span>{p.method}</span><span>{p.amount.toFixed(2)}</span></div>))}
                {data.changeGiven > 0 && (<div className="flex justify-between mt-1 font-bold"><span>Cambio:</span><span>{data.changeGiven.toFixed(2)}</span></div>)}
            </div>
          )}
        </>
      )}

      {/* 2. GASTOS */}
      {data.type === 'expense' && (
        <div className="space-y-4 mb-8">
          <div><p className="text-[10px] uppercase font-bold text-gray-500">Motivo:</p><p className="text-base font-bold">{data.description}</p></div>
          <div><p className="text-[10px] uppercase font-bold text-gray-500">Monto:</p><p className="text-2xl font-black">Bs. {data.amount.toFixed(2)}</p></div>
          <div className="mt-8 pt-8 border-t border-black text-center"><p className="text-xs font-bold uppercase">Firma Recibido</p></div>
        </div>
      )}

      {/* 3. REPORTE Z */}
      {data.type === 'z-report' && (
        <>
          <div className="space-y-1 mb-2 text-[10px]">
            <div className="flex justify-between"><span>Apertura:</span><span>{new Date(data.openedAt).toLocaleTimeString()}</span></div>
            <div className="flex justify-between"><span>Cierre:</span><span>{new Date().toLocaleTimeString()}</span></div>
          </div>
          <div className="border-b border-black pb-2 mb-2">
            <p className="font-bold uppercase mb-1">Resumen</p>
            <div className="flex justify-between"><span>Fondo Inicial:</span><span>{data.openingAmount.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold"><span>(+) Ventas Totales:</span><span>{(data.stats.cashSales + data.stats.digitalSales).toFixed(2)}</span></div>
            <div className="pl-2 text-[10px] italic">
                <div className="flex justify-between"><span>Efectivo:</span><span>{data.stats.cashSales.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Digital:</span><span>{data.stats.digitalSales.toFixed(2)}</span></div>
            </div>
            <div className="flex justify-between text-red-600 font-bold print:text-black"><span>(-) Gastos:</span><span>{data.stats.totalExpenses.toFixed(2)}</span></div>
          </div>
          <div className="flex justify-between items-center text-lg font-black border-b-2 border-black pb-2 mb-4">
            <span>EFECTIVO EN CAJA</span>
            <span>Bs. {data.finalCash.toFixed(2)}</span>
          </div>
          {data.stats.courtesyTotal > 0 && (
             <div className="mb-2 text-[10px] border-b border-dashed border-black pb-2">
                 <div className="flex justify-between"><span>Cortesías (Valor):</span><span>{data.stats.courtesyTotal.toFixed(2)}</span></div>
             </div>
          )}
          {data.soldProducts && data.soldProducts.length > 0 && (
            <div className="mt-2">
                <p className="font-bold uppercase text-center border-b border-black text-[10px]">Productos</p>
                {data.soldProducts.map((prod, i) => (
                    <div key={i} className="flex justify-between py-0.5 text-[10px]">
                        <span>{prod.qty} x {prod.name} {prod.isCourtesy && '(R)'}</span>
                        <span>{prod.isCourtesy ? '0.00' : prod.total.toFixed(2)}</span>
                    </div>
                ))}
            </div>
          )}
        </>
      )}

      <div className="text-center mt-6 text-[10px] opacity-50"><p>--- GRACIAS ---</p></div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <style>{printStyles}</style> {/* ESTILOS INYECTADOS */}
      
      <div className="bg-white w-full max-w-sm shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gray-800 p-3 flex justify-between items-center no-print">
          <h3 className="text-white font-bold text-sm">VISTA PREVIA</h3>
          <div className="flex gap-2">
              <button onClick={onPrint} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"><Printer size={18}/></button>
              <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"><X size={18}/></button>
          </div>
        </div>
        
        {/* Contenedor con scroll para ver en pantalla */}
        <div className="overflow-y-auto bg-gray-100 flex justify-center p-4">
            <ReceiptContent />
        </div>
      </div>
    </div>
  );
};

export default Receipt;