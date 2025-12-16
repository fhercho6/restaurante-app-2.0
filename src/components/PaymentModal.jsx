// src/components/PaymentModal.jsx - CON OPCIÓN DE CORTESÍA
import React, { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Grid, Gift, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentModal({ isOpen, onClose, total, onConfirm }) {
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState(0);
  const [method, setMethod] = useState('Efectivo'); // 'Efectivo', 'QR', 'Tarjeta', 'Cortesía'

  useEffect(() => {
    if (isOpen) {
        setAmountReceived('');
        setChange(0);
        setMethod('Efectivo');
    }
  }, [isOpen, total]);

  useEffect(() => {
    if (method === 'Efectivo') {
        const received = parseFloat(amountReceived) || 0;
        setChange(Math.max(0, received - total));
    } else {
        setChange(0);
    }
  }, [amountReceived, total, method]);

  const handleQuickAmount = (val) => {
      setAmountReceived((parseFloat(val)).toString());
  };

  const handleSubmit = () => {
      // Validaciones
      if (method === 'Efectivo') {
          const received = parseFloat(amountReceived) || 0;
          if (received < total) {
              toast.error('El monto recibido es menor al total');
              return;
          }
      }

      // Si es Cortesía, confirmamos por seguridad
      if (method === 'Cortesía') {
          if(!window.confirm('¿Seguro que deseas registrar esto como CORTESÍA? (No ingresará dinero)')) return;
      }

      // Preparamos el objeto de pago
      const paymentData = {
          paymentsList: [{
              method: method,
              amount: total // Asumimos pago total por simplicidad
          }],
          totalPaid: method === 'Cortesía' ? 0 : total,
          change: method === 'Efectivo' ? change : 0,
          amountReceived: parseFloat(amountReceived) || total
      };

      onConfirm(paymentData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* ENCABEZADO */}
        <div className="bg-gray-900 p-4 text-white flex justify-between items-center shrink-0">
            <div>
                <h3 className="font-black text-lg uppercase tracking-wider">Cobrar Orden</h3>
                <p className="text-xs text-gray-400">Selecciona método de pago</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
            
            {/* TOTAL A PAGAR */}
            <div className="text-center mb-8">
                <p className="text-sm font-bold text-gray-500 uppercase mb-1">Total a Pagar</p>
                <div className="text-5xl font-black text-gray-900 tracking-tighter">
                    Bs. {total.toFixed(2)}
                </div>
            </div>

            {/* SELECCIÓN DE MÉTODO */}
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Método de Pago</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                    onClick={() => setMethod('Efectivo')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'Efectivo' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                >
                    <DollarSign size={24}/>
                    <span className="font-bold text-xs">EFECTIVO</span>
                </button>

                <button 
                    onClick={() => setMethod('QR')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'QR' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                >
                    <Grid size={24}/>
                    <span className="font-bold text-xs">QR / TRANSF.</span>
                </button>

                <button 
                    onClick={() => setMethod('Tarjeta')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'Tarjeta' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                >
                    <CreditCard size={24}/>
                    <span className="font-bold text-xs">TARJETA</span>
                </button>

                {/* AQUÍ ESTÁ EL BOTÓN DE CORTESÍA QUE FALTABA */}
                <button 
                    onClick={() => setMethod('Cortesía')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'Cortesía' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                >
                    <Gift size={24}/>
                    <span className="font-bold text-xs">CORTESÍA</span>
                </button>
            </div>

            {/* INPUT EFECTIVO (Solo visible si es Efectivo) */}
            {method === 'Efectivo' && (
                <div className="animate-in slide-in-from-top-2 fade-in">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Monto Recibido</label>
                    <div className="relative mb-4">
                        <span className="absolute left-4 top-4 text-gray-400 font-bold">Bs.</span>
                        <input 
                            type="number" 
                            inputMode="decimal"
                            value={amountReceived}
                            onChange={(e) => setAmountReceived(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-xl font-bold focus:border-green-500 focus:bg-white outline-none transition-all"
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>

                    {/* Botones rápidos de billetes */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {[10, 20, 50, 100, 200].map(bill => (
                            bill >= total && (
                                <button 
                                    key={bill} 
                                    onClick={() => handleQuickAmount(bill)}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 hover:border-gray-300 whitespace-nowrap"
                                >
                                    Bs. {bill}
                                </button>
                            )
                        ))}
                        <button 
                            onClick={() => handleQuickAmount(total)}
                            className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-100 whitespace-nowrap"
                        >
                            Exacto
                        </button>
                    </div>

                    {/* CAMBIO */}
                    {change > 0 && (
                        <div className="bg-green-100 p-4 rounded-xl text-center border border-green-200 mb-4 animate-bounce">
                            <p className="text-green-600 text-xs font-bold uppercase mb-1">Entregar Cambio</p>
                            <p className="text-3xl font-black text-green-700">Bs. {change.toFixed(2)}</p>
                        </div>
                    )}
                </div>
            )}

            {/* MENSAJE CORTESÍA */}
            {method === 'Cortesía' && (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-4 text-center">
                    <p className="font-bold text-yellow-800 text-sm">⚠️ Este pedido no sumará efectivo a la caja.</p>
                    <p className="text-xs text-yellow-600 mt-1">Se registrará como gasto/promoción en el reporte.</p>
                </div>
            )}

        </div>

        {/* BOTÓN CONFIRMAR */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button 
                onClick={handleSubmit}
                className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg ${
                    method === 'Cortesía' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
                    method === 'Efectivo' && (parseFloat(amountReceived) < total) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                    'bg-green-600 hover:bg-green-700 text-white'
                }`}
                disabled={method === 'Efectivo' && (parseFloat(amountReceived) < total)}
            >
                {method === 'Cortesía' ? 'REGISTRAR CORTESÍA' : 'CONFIRMAR PAGO'} <ArrowRight size={24}/>
            </button>
        </div>

      </div>
    </div>
  );
}