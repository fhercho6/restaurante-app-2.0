// src/components/Receipt.jsx - VERSIÓN SEGURA (Sin errores de Constructor)
import React from 'react';
// Usamos solo iconos seguros. NO IMPORTAR 'Image' AQUÍ.
import { Printer, X, ChefHat } from 'lucide-react';

const Receipt = ({ data, onPrint, onClose }) => {
  if (!data) return null;

  // Calculamos totales de forma segura
  const total = data.total || 0;
  const items = data.items || [];
  
  // Fecha y Hora seguras
  const dateStr = data.date ? new Date(data.date).toLocaleDateString() : new Date().toLocaleDateString();
  const timeStr = data.date ? new Date(data.date).toLocaleTimeString() : new Date().toLocaleTimeString();

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* CABECERA (No se imprime) */}
        <div className="p-4 bg-gray-900 text-white flex justify-between items-center no-print">
          <h3 className="font-bold">Vista Previa</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
        </div>

        {/* TICKET (Lo que se imprime) */}
        <div id="receipt-content" className="p-6 bg-white overflow-y-auto font-mono text-xs text-black">
          
          {/* Logo y Encabezado */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center border-2 border-black">
               {/* Usamos ChefHat si no hay logo, es seguro */}
               <ChefHat size={32} className="text-black"/>
            </div>
            <h2 className="text-xl font-black uppercase tracking-wider">{data.businessName || 'LicoBar'}</h2>
            <p className="mt-1">Recibo de Venta</p>
            <p>{dateStr} - {timeStr}</p>
          </div>

          <div className="border-b-2 border-black mb-4 border-dashed"></div>

          {/* Detalles */}
          <div className="mb-4 space-y-1">
             <div className="flex justify-between"><span>Orden:</span><span className="font-bold">#{String(data.orderId || '000').slice(-4)}</span></div>
             <div className="flex justify-between"><span>Atendido por:</span><span className="font-bold">{data.staffName || 'Staff'}</span></div>
             {data.cashierName && <div className="flex justify-between"><span>Cajero:</span><span>{data.cashierName}</span></div>}
          </div>

          <div className="border-b-2 border-black mb-4 border-dashed"></div>

          {/* Lista de Items */}
          <div className="space-y-2 mb-4">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <span className="font-bold w-6">{item.qty}</span>
                <span className="flex-1 uppercase">{item.name}</span>
                <span className="text-right font-bold">{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-b-2 border-black mb-4 border-dashed"></div>

          {/* Totales */}
          <div className="text-right text-base space-y-1">
            <div className="flex justify-between font-bold text-xl">
                <span>TOTAL</span>
                <span>Bs. {Number(total).toFixed(2)}</span>
            </div>
            {/* Si hay cambio/vuelto */}
            {data.totalPaid > 0 && (
                <>
                    <div className="flex justify-between text-xs mt-2">
                        <span>Efectivo/Pago:</span>
                        <span>Bs. {Number(data.totalPaid).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span>Cambio:</span>
                        <span>Bs. {Number(data.change || 0).toFixed(2)}</span>
                    </div>
                </>
            )}
          </div>

          <div className="mt-8 text-center text-[10px]">
            <p>¡GRACIAS POR SU PREFERENCIA!</p>
            <p className="mt-1">*** COPIA CLIENTE ***</p>
          </div>

        </div>

        {/* PIE DE PÁGINA (Botón Imprimir) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 no-print">
          <button 
            onClick={onPrint} 
            className="w-full bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
          >
            <Printer size={20}/> IMPRIMIR TICKET
          </button>
        </div>

      </div>
    </div>
  );
};

export default Receipt;