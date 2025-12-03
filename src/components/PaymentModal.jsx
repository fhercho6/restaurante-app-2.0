// src/components/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Banknote, CreditCard, QrCode, ArrowRight, Plus, Trash2 } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, total, onConfirm }) => {
  const [payments, setPayments] = useState([]); // Lista de pagos agregados
  const [currentMethod, setCurrentMethod] = useState('Efectivo');
  const [currentAmount, setCurrentAmount] = useState('');

  // Reiniciar cuando se abre
  useEffect(() => {
    if (isOpen) {
      setPayments([]);
      setCurrentAmount('');
      setCurrentMethod('Efectivo');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Cálculos matemáticos
  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const remaining = total - totalPaid;
  const change = remaining < 0 ? Math.abs(remaining) : 0;
  const isCovered = remaining <= 0;

  const handleAddPayment = () => {
    const val = parseFloat(currentAmount);
    if (!val || val <= 0) return;

    setPayments([...payments, { method: currentMethod, amount: val }]);
    setCurrentAmount(''); // Limpiar input para el siguiente pago
  };

  const removePayment = (index) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (!isCovered) {
      alert(`Faltan Bs. ${remaining.toFixed(2)} por pagar.`);
      return;
    }
    // Enviamos la lista completa de pagos
    onConfirm({
      paymentsList: payments,
      totalPaid: totalPaid,
      change: change
    });
  };

  // Autocompletar el monto restante al cambiar de método (para agilizar)
  const selectMethod = (method) => {
    setCurrentMethod(method);
    if (remaining > 0) {
      setCurrentAmount(remaining.toFixed(2));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Encabezado: Totales Dinámicos */}
        <div className="bg-gray-900 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Dividir Cuenta</h2>
            <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full"><X size={20} /></button>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-gray-400 text-xs uppercase font-bold">Total a Pagar</p>
              <div className="text-2xl font-bold">Bs. {total.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs uppercase font-bold">
                {isCovered ? 'Cambio' : 'Falta'}
              </p>
              <div className={`text-3xl font-black ${isCovered ? 'text-green-400' : 'text-red-400'}`}>
                Bs. {isCovered ? change.toFixed(2) : remaining.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* 1. Selector de Método para el siguiente pago */}
          {!isCovered && (
            <div className="mb-6 border-b pb-6 border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Agregar Pago</label>
              <div className="flex gap-2 mb-3">
                {['Efectivo', 'QR', 'Tarjeta'].map(m => (
                  <button 
                    key={m}
                    onClick={() => selectMethod(m)}
                    className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 ${currentMethod === m ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {m === 'Efectivo' && <Banknote size={16}/>}
                    {m === 'QR' && <QrCode size={16}/>}
                    {m === 'Tarjeta' && <CreditCard size={16}/>}
                    {m}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  autoFocus
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder={`Monto en ${currentMethod}...`}
                  className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPayment()}
                />
                <button 
                  onClick={handleAddPayment}
                  disabled={!currentAmount}
                  className="bg-gray-800 text-white p-3 rounded-xl hover:bg-black disabled:opacity-50"
                >
                  <Plus size={24}/>
                </button>
              </div>
            </div>
          )}

          {/* 2. Lista de Pagos Agregados */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pagos Registrados</p>
            {payments.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4 italic">Aún no hay pagos registrados</p>
            ) : (
              payments.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    {p.method === 'Efectivo' && <div className="p-1.5 bg-green-100 text-green-700 rounded"><Banknote size={16}/></div>}
                    {p.method === 'Tarjeta' && <div className="p-1.5 bg-purple-100 text-purple-700 rounded"><CreditCard size={16}/></div>}
                    {p.method === 'QR' && <div className="p-1.5 bg-blue-100 text-blue-700 rounded"><QrCode size={16}/></div>}
                    <span className="font-medium text-gray-700">{p.method}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">Bs. {p.amount.toFixed(2)}</span>
                    <button onClick={() => removePayment(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Botón Final */}
        <div className="p-4 border-t bg-gray-50">
          <button 
            onClick={handleConfirm}
            disabled={!isCovered}
            className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${isCovered ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {isCovered ? 'FINALIZAR VENTA' : `Faltan Bs. ${remaining.toFixed(2)}`} <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;