import React, { useState, useEffect } from 'react';
import { Printer, X, FileSpreadsheet, ShieldCheck, ShieldAlert, Clock, Info } from 'lucide-react';

const PrinterSettingsModal = ({ isOpen, onClose, currentType, onSelect }) => {
    // DEVICE AUTH STATE
    const [isAuthorized, setIsAuthorized] = useState(false);
    // MANDATORY ATTENDANCE STATE
    const [requireClockIn, setRequireClockIn] = useState(false);

    useEffect(() => {
        const storedAuth = localStorage.getItem('isAuthorizedTerminal');
        setIsAuthorized(storedAuth === 'true');

        const storedClockIn = localStorage.getItem('requireClockIn');
        setRequireClockIn(storedClockIn === 'true');
    }, [isOpen]);

    const toggleAuthorization = () => {
        const newState = !isAuthorized;
        setIsAuthorized(newState);
        if (newState) {
            localStorage.setItem('isAuthorizedTerminal', 'true');
        } else {
            localStorage.removeItem('isAuthorizedTerminal');
        }
    };

    const toggleClockInRequirement = () => {
        const newState = !requireClockIn;
        setRequireClockIn(newState);
        if (newState) {
            localStorage.setItem('requireClockIn', 'true');
        } else {
            localStorage.removeItem('requireClockIn');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="bg-gray-900 p-4 text-white flex justify-between items-center"><h3 className="font-bold flex items-center gap-2"><Printer size={20} /> Configuración de Terminal</h3><button onClick={onClose}><X size={20} /></button></div>
                <div className="p-6 text-center">
                    <p className="text-gray-500 mb-4 text-sm font-bold uppercase">Seleccione el formato de impresión</p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button onClick={() => onSelect('thermal')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${currentType === 'thermal' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}><Printer size={40} /><div className="text-center"><span className="block font-black text-sm">TÉRMICA (Ticket)</span><span className="text-[10px]">80mm / 58mm</span></div></button>
                        <button onClick={() => onSelect('letter')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${currentType === 'letter' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}><FileSpreadsheet size={40} /><div className="text-center"><span className="block font-black text-sm">CARTA / A4</span><span className="text-[10px]">Reporte Contable</span></div></button>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <p className="text-gray-500 mb-3 text-[10px] font-bold uppercase tracking-widest">Seguridad de Dispositivo</p>
                        <div onClick={toggleAuthorization} className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center gap-3 ${isAuthorized ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                            <div className={`p-2 rounded-full ${isAuthorized ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                                {isAuthorized ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                            </div>
                            <div className="text-left flex-1">
                                <span className="block font-bold text-xs">{isAuthorized ? 'TERMINAL AUTORIZADA' : 'NO AUTORIZADA'}</span>
                                <span className="text-[10px] opacity-80">{isAuthorized ? 'Permite acceso a Cajeros' : 'Bloquea acceso a Cajeros'}</span>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${isAuthorized ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isAuthorized ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </div>

                        {/* REQUIRE CLOCK-IN TOGGLE */}
                        <div onClick={toggleClockInRequirement} className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center gap-3 mt-3 ${requireClockIn ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                            <div className={`p-2 rounded-full ${requireClockIn ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                                <Clock size={20} />
                            </div>
                            <div className="text-left flex-1">
                                <span className="block font-bold text-xs">{requireClockIn ? 'ASISTENCIA OBLIGATORIA' : 'ASISTENCIA OPCIONAL'}</span>
                                <span className="text-[10px] opacity-80">{requireClockIn ? 'Exige entrada para vender' : 'Permite vender sin marcar'}</span>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${requireClockIn ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${requireClockIn ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default PrinterSettingsModal;
