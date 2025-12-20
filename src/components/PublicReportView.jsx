// src/components/PublicReportView.jsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import { Wrench, Calendar, CheckCircle, AlertTriangle, XCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PublicReportView({ equipmentId, onExit }) {
    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const colName = isPersonalProject ? 'equipment' : `${ROOT_COLLECTION}equipment`;
                const docRef = doc(db, colName, equipmentId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setEquipment({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError("Equipo no encontrado o código inválido.");
                }
            } catch (err) {
                console.error(err);
                setError("Error al conectar con la base de datos.");
            } finally {
                setLoading(false);
            }
        };

        if (equipmentId) fetchEquipment();
    }, [equipmentId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !equipment) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
                    <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <XCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-500 mb-6">{error || "No se pudo cargar la información."}</p>
                    <button onClick={onExit} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold">Volver al Inicio</button>
                </div>
            </div>
        );
    }

    const getStatusColor = (s) => {
        switch(s) {
            case 'active': return 'text-green-600 bg-green-50 border-green-200';
            case 'maintenance': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'retired': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusLabel = (s) => {
        switch(s) {
            case 'active': return 'OPERATIVO';
            case 'maintenance': return 'EN MANTENIMIENTO';
            case 'retired': return 'DE BAJA';
            default: return s;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 font-sans">
            <div className="max-w-md mx-auto space-y-4">
                
                {/* Header Público */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="bg-gray-900 p-6 text-white text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <Wrench className="mx-auto mb-2 opacity-80" size={32} />
                            <h1 className="text-2xl font-black tracking-tight uppercase">{equipment.name}</h1>
                            <p className="text-xs text-gray-400 font-mono mt-1">S/N: {equipment.serial || '---'}</p>
                        </div>
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-white/5 rotate-12 pointer-events-none"></div>
                    </div>
                    
                    <div className="p-6">
                        <div className={`p-4 rounded-xl border-2 text-center mb-6 ${getStatusColor(equipment.status)}`}>
                            <p className="text-xs font-bold opacity-70 uppercase mb-1">Estado Actual</p>
                            <p className="text-xl font-black flex justify-center items-center gap-2">
                                {equipment.status === 'active' && <CheckCircle size={20}/>}
                                {equipment.status === 'maintenance' && <AlertTriangle size={20}/>}
                                {getStatusLabel(equipment.status)}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100 pb-2 mb-2 flex items-center gap-2">
                                <Calendar size={12}/> Historial de Mantenimiento
                            </h3>

                            {!equipment.maintenanceHistory || equipment.maintenanceHistory.length === 0 ? (
                                <p className="text-center text-gray-400 text-sm py-4 italic">No hay registros de mantenimiento.</p>
                            ) : (
                                <div className="space-y-3">
                                    {equipment.maintenanceHistory.map((log, index) => (
                                        <div key={index} className="flex gap-3 relative pb-4 last:pb-0">
                                            {/* Línea de tiempo */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                                {index !== equipment.maintenanceHistory.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>}
                                            </div>
                                            
                                            <div className="flex-1 pb-2">
                                                <p className="text-sm font-bold text-gray-800">{log.description}</p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">
                                                        {new Date(log.date).toLocaleDateString()}
                                                    </span>
                                                    {log.technician && <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1"><ShieldCheck size={10}/> {log.technician}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <button onClick={onExit} className="text-gray-500 text-sm font-bold hover:text-gray-800 flex items-center justify-center gap-2 mx-auto py-2 px-4 rounded-full hover:bg-white transition-colors">
                        <ArrowLeft size={16}/> Volver al Sistema
                    </button>
                    <p className="text-[10px] text-gray-400 mt-4">Reporte de Transparencia de Activos • ZZIF System</p>
                </div>

            </div>
        </div>
    );
}