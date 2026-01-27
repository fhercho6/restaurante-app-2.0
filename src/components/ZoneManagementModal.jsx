import React from 'react';
import { X, Users, MapPin, Check, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ZoneManagementModal({
    isOpen,
    onClose,
    staffMembers,
    activeZones,
    onUpdateZone
}) {
    if (!isOpen) return null;

    // Filter only waiters
    const waiters = staffMembers.filter(m =>
        ['Mesero', 'Garzon', 'Garzón'].includes(m.role)
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <MapPin size={24} className="text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Gestión de Zonas</h2>
                            <p className="text-xs text-gray-400">Asigna zonas de trabajo a los meseros</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {waiters.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <Users size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No hay meseros registrados.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {waiters.map(staff => {
                                const currentZone = activeZones[staff.id] || 'Sin Asignar';
                                const isSalon = currentZone === 'Salón';
                                const isLico = currentZone === 'Licobar';

                                return (
                                    <div key={staff.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                {staff.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{staff.name}</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">{currentZone}</p>
                                            </div>
                                        </div>

                                        {/* ZONE TOGGLES */}
                                        <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                                            <button
                                                onClick={() => onUpdateZone(staff.id, 'Salón')}
                                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isSalon ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                SALÓN
                                            </button>
                                            <button
                                                onClick={() => onUpdateZone(staff.id, 'Licobar')}
                                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isLico ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                LICOBAR
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 flex justify-end">
                    <button onClick={onClose} className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform flex items-center gap-2">
                        <Check size={18} />
                        LISTO
                    </button>
                </div>
            </div>
        </div>
    );
}
