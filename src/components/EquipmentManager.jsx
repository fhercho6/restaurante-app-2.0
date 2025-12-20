// src/components/EquipmentManager.jsx
import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Trash2, Save, AlertTriangle, CheckCircle, XCircle, History, QrCode } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import toast from 'react-hot-toast';

export default function EquipmentManager({ staff, registerSession }) {
    const [equipment, setEquipment] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    
    // Estados para nuevo equipo
    const [newName, setNewName] = useState('');
    const [newSerial, setNewSerial] = useState('');
    const [newType, setNewType] = useState('Refrigerador');

    // Estados para nuevo log de mantenimiento
    const [logDesc, setLogDesc] = useState('');
    const [logCost, setLogCost] = useState('');

    useEffect(() => {
        const colName = isPersonalProject ? 'equipment' : `${ROOT_COLLECTION}equipment`;
        const q = query(collection(db, colName), orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEquipment(data);
        });
        return () => unsubscribe();
    }, []);

    const handleAddEquipment = async (e) => {
        e.preventDefault();
        try {
            const colName = isPersonalProject ? 'equipment' : `${ROOT_COLLECTION}equipment`;
            await addDoc(collection(db, colName), {
                name: newName,
                serial: newSerial,
                type: newType,
                status: 'active', // active, maintenance, retired
                maintenanceHistory: [],
                createdAt: new Date().toISOString()
            });
            toast.success("Equipo registrado");
            setNewName(''); setNewSerial(''); setIsModalOpen(false);
        } catch (error) {
            toast.error("Error al registrar");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const colName = isPersonalProject ? 'equipment' : `${ROOT_COLLECTION}equipment`;
            await updateDoc(doc(db, colName, id), { status: newStatus });
            toast.success(`Estado actualizado: ${newStatus}`);
        } catch (error) {
            toast.error("Error al actualizar");
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("¿Estás seguro de eliminar este equipo?")) return;
        try {
            const colName = isPersonalProject ? 'equipment' : `${ROOT_COLLECTION}equipment`;
            await deleteDoc(doc(db, colName, id));
            toast.success("Equipo eliminado");
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const handleAddLog = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;
        
        try {
            const newLog = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                description: logDesc,
                cost: parseFloat(logCost) || 0,
                technician: 'Interno' // Podrías agregar campo para nombre del técnico
            };

            const updatedHistory = [newLog, ...(selectedItem.maintenanceHistory || [])];
            
            const colName = isPersonalProject ? 'equipment' : `${ROOT_COLLECTION}equipment`;
            await updateDoc(doc(db, colName, selectedItem.id), { 
                maintenanceHistory: updatedHistory,
                lastMaintenance: new Date().toISOString()
            });

            // Opcional: Registrar el gasto en la caja si hay costo y caja abierta
            if (newLog.cost > 0 && registerSession) {
                // Aquí podrías llamar a una función para agregar el gasto a la caja
                // Por ahora solo notificamos
                toast(`Gasto de Bs. ${newLog.cost} registrado en historial del equipo (Recuerda agregarlo a Caja si salió dinero)`, { icon: '💰', duration: 4000 });
            }

            toast.success("Mantenimiento registrado");
            setLogDesc(''); setLogCost(''); setIsLogModalOpen(false);
        } catch (error) {
            toast.error("Error al guardar log");
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'active': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Activo</span>;
            case 'maintenance': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Wrench size={12}/> En Mantenimiento</span>;
            case 'retired': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12}/> De Baja</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Wrench className="text-orange-500" /> Gestión de Activos y Mantenimiento
                    </h2>
                    <p className="text-xs text-gray-500">Control de refrigeradores, cocinas, muebles y equipos.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-orange-700">
                    <Plus size={18} /> Nuevo Equipo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment.map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-800">{item.name}</h3>
                                <p className="text-xs text-gray-500 uppercase font-bold">{item.type} • {item.serial || 'S/N'}</p>
                            </div>
                            {getStatusBadge(item.status)}
                        </div>
                        
                        <div className="p-4 space-y-3">
                            <div className="flex gap-2">
                                <button onClick={() => handleStatusChange(item.id, 'active')} className={`flex-1 py-1 text-xs font-bold rounded border ${item.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}>Activo</button>
                                <button onClick={() => handleStatusChange(item.id, 'maintenance')} className={`flex-1 py-1 text-xs font-bold rounded border ${item.status === 'maintenance' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-gray-200 text-gray-500'}`}>Mant.</button>
                                <button onClick={() => handleStatusChange(item.id, 'retired')} className={`flex-1 py-1 text-xs font-bold rounded border ${item.status === 'retired' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-500'}`}>Baja</button>
                            </div>

                            <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                                <p className="font-bold mb-1 flex items-center gap-1"><History size={10}/> Últimos Eventos:</p>
                                {item.maintenanceHistory && item.maintenanceHistory.length > 0 ? (
                                    item.maintenanceHistory.slice(0, 2).map((log, i) => (
                                        <div key={i} className="flex justify-between border-b border-gray-200 pb-1 last:border-0 mb-1">
                                            <span className="truncate flex-1">{log.description}</span>
                                            <span className="font-mono text-gray-400">{new Date(log.date).toLocaleDateString()}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 italic">Sin registros</p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button onClick={() => { setSelectedItem(item); setIsLogModalOpen(true); }} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 flex items-center justify-center gap-2">
                                    <History size={14}/> Reportar
                                </button>
                                {/* Botón para ver QR Público (placeholder) */}
                                <button 
                                    onClick={() => window.open(`/?report=${item.id}`, '_blank')}
                                    className="px-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200" 
                                    title="Ver Reporte Público"
                                >
                                    <QrCode size={16}/>
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="px-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL NUEVO EQUIPO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                        <div className="bg-gray-900 p-4 text-white flex justify-between items-center"><h3 className="font-bold">Registrar Activo</h3><button onClick={() => setIsModalOpen(false)}><XCircle/></button></div>
                        <form onSubmit={handleAddEquipment} className="p-6 space-y-4">
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Nombre</label><input required className="w-full p-3 border rounded-lg" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: Freezer CocaCola"/></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                                <select className="w-full p-3 border rounded-lg" value={newType} onChange={e => setNewType(e.target.value)}>
                                    <option>Refrigerador</option><option>Cocina</option><option>Mobiliario</option><option>Electrónico</option><option>Otro</option>
                                </select>
                            </div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Serial / Código</label><input className="w-full p-3 border rounded-lg" value={newSerial} onChange={e => setNewSerial(e.target.value)} placeholder="Opcional"/></div>
                            <button className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold">Guardar</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL LOG MANTENIMIENTO */}
            {isLogModalOpen && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                        <div className="bg-blue-600 p-4 text-white flex justify-between items-center"><h3 className="font-bold">Reportar Mantenimiento</h3><button onClick={() => setIsLogModalOpen(false)}><XCircle/></button></div>
                        <div className="p-4 bg-blue-50 border-b border-blue-100"><p className="text-sm font-bold text-blue-800">{selectedItem.name}</p></div>
                        <form onSubmit={handleAddLog} className="p-6 space-y-4">
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Descripción del Trabajo</label><textarea required className="w-full p-3 border rounded-lg" rows="3" value={logDesc} onChange={e => setLogDesc(e.target.value)} placeholder="Ej: Cambio de gas, limpieza de filtro..."/></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Costo (Bs)</label><input type="number" step="0.5" className="w-full p-3 border rounded-lg font-bold" value={logCost} onChange={e => setLogCost(e.target.value)} placeholder="0.00"/></div>
                            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Registrar Evento</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}