import React, { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Clock, LayoutGrid, Search, ArrowLeft, Trash2, Plus } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore'; // [UPDATED]
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import { useData } from '../context/DataContext';
import StaffManagerView from './StaffManagerView';
import toast from 'react-hot-toast';

// Simple Modal for Manual Attendance
const AddAttendanceModal = ({ isOpen, onClose, staff, onSave }) => {
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [type, setType] = useState('clock-in');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Agregar Asistencia Manual</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Empleado</label>
                        <select
                            className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50"
                            value={selectedStaffId}
                            onChange={(e) => setSelectedStaffId(e.target.value)}
                        >
                            <option value="">Seleccionar...</option>
                            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Evento</label>
                        <select
                            className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="clock-in">Entrada</option>
                            <option value="clock-out">Salida</option>
                        </select>
                    </div>
                    <button
                        disabled={!selectedStaffId}
                        onClick={() => {
                            const member = staff.find(s => s.id === selectedStaffId);
                            onSave(member, type);
                            onClose();
                        }}
                        className="w-full py-3 bg-black text-white font-bold rounded-lg hover:opacity-80 disabled:opacity-50"
                    >
                        GUARDAR REGISTRO
                    </button>
                    <button onClick={onClose} className="w-full py-2 text-gray-400 font-bold hover:text-gray-600">CANCELAR</button>
                </div>
            </div>
        </div>
    );
};

export default function HRDashboardView({
    staff,
    roles,
    onAddStaff,
    onUpdateStaff,
    onDeleteStaff,
    onManageRoles,
    onPrintCredential,
    onBack
}) {
    const { commissionTiers, handleSaveCommissionTiers } = useData();
    const [activeTab, setActiveTab] = useState('staff'); // 'staff', 'attendance', 'payroll'
    const [attendanceLog, setAttendanceLog] = useState([]);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Fetch attendance when tab is active
    useEffect(() => {
        if (activeTab === 'attendance') {
            loadAttendance();
        }
    }, [activeTab]);

    const loadAttendance = async () => {
        setLoadingAttendance(true);
        try {
            const collName = isPersonalProject ? 'attendance' : `${ROOT_COLLECTION}attendance`;
            const q = query(collection(db, collName), orderBy('timestamp', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setAttendanceLog(logs);
        } catch (error) {
            console.error("Error loading attendance:", error);
        } finally {
            setLoadingAttendance(false);
        }
    };

    const handleDeleteAttendance = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
        try {
            const collName = isPersonalProject ? 'attendance' : `${ROOT_COLLECTION}attendance`;
            await deleteDoc(doc(db, collName, id));
            toast.success("Registro eliminado");
            loadAttendance();
        } catch (error) {
            toast.error("Error al eliminar");
            console.error(error);
        }
    };

    const handleAddManual = async (member, type) => {
        try {
            const collName = isPersonalProject ? 'attendance' : `${ROOT_COLLECTION}attendance`;
            await addDoc(collection(db, collName), {
                staffId: member.id,
                staffName: member.name,
                registerId: 'MANUAL',
                role: member.role,
                timestamp: new Date().toISOString(),
                dailySalary: parseFloat(member.dailySalary || 0),
                type: type
            });
            toast.success("Registro agregado manualmente");
            loadAttendance();
        } catch (error) {
            toast.error("Error al crear registro");
            console.error(error);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleString('es-BO', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col animate-in fade-in">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Users className="text-blue-600" />
                            RECURSOS HUMANOS
                        </h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Gestión de Equipo y Asistencia</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'staff' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Users size={16} /> Personal
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'attendance' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Clock size={16} /> Asistencia
                    </button>
                    {/* Future: Payroll Tab */}
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
                {activeTab === 'staff' && (
                    <StaffManagerView
                        staff={staff}
                        roles={roles}
                        onAddStaff={onAddStaff}
                        onUpdateStaff={onUpdateStaff}
                        onDeleteStaff={onDeleteStaff}
                        onManageRoles={onManageRoles}
                        onPrintCredential={onPrintCredential}
                        commissionTiers={commissionTiers}
                        onSaveCommissionTiers={handleSaveCommissionTiers}
                    />
                )}

                {activeTab === 'attendance' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Historial de Asistencia</h2>
                            <div className="flex gap-2">
                                <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 flex items-center gap-2">
                                    <Plus size={16} /> Agregar Manual
                                </button>
                                <button onClick={loadAttendance} className="text-sm text-blue-600 font-bold hover:underline px-2">Actualizar</button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-100">
                                    <tr>
                                        <th className="p-4">Fecha y Hora</th>
                                        <th className="p-4">Empleado</th>
                                        <th className="p-4">Evento</th>
                                        <th className="p-4 text-right">Origen</th>
                                        <th className="p-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loadingAttendance ? (
                                        <tr><td colSpan="5" className="p-8 text-center text-gray-400">Cargando registros...</td></tr>
                                    ) : attendanceLog.length > 0 ? (
                                        attendanceLog.map(log => (
                                            <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="p-4 text-sm font-mono text-gray-600">{formatDate(log.timestamp)}</td>
                                                <td className="p-4 font-bold text-gray-800">{log.staffName}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${log.type === 'clock-in' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {log.type === 'clock-in' ? 'Entrada' : log.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right text-xs text-gray-400 font-mono">
                                                    {log.registerId === 'MANUAL' ? 'MANUAL' : (log.registerId ? `Turno #${log.registerId.slice(-4)}` : 'N/A')}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => handleDeleteAttendance(log.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-50 group-hover:opacity-100 transition-all"
                                                        title="Eliminar Registro"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="p-8 text-center text-gray-400">No hay registros de asistencia recientes.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            <AddAttendanceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                staff={staff}
                onSave={handleAddManual}
            />
        </div>
    );
}
