import React from 'react';
import { Printer, X, FileSpreadsheet } from 'lucide-react';

const PrinterSettingsModal = ({ isOpen, onClose, currentType, onSelect }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="bg-gray-900 p-4 text-white flex justify-between items-center"><h3 className="font-bold flex items-center gap-2"><Printer size={20} /> Configurar Impresora</h3><button onClick={onClose}><X size={20} /></button></div>
                <div className="p-6 text-center">
                    <p className="text-gray-500 mb-4 text-sm font-bold uppercase">Seleccione el formato de impresión</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => onSelect('thermal')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${currentType === 'thermal' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}><Printer size={40} /><div className="text-center"><span className="block font-black text-sm">TÉRMICA (Ticket)</span><span className="text-[10px]">80mm / 58mm</span></div></button>
                        <button onClick={() => onSelect('letter')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${currentType === 'letter' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}><FileSpreadsheet size={40} /><div className="text-center"><span className="block font-black text-sm">CARTA / A4</span><span className="text-[10px]">Reporte Contable</span></div></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrinterSettingsModal;
