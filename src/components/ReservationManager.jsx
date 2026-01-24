import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import { Calendar, Plus, Search, MessageCircle, Trash2, Edit2, X, Clock, User, Phone, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const ReservationManager = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRes, setCurrentRes] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: '',
        time: '',
        type: 'Cena',
        notes: ''
    });

    const RESERVATION_TYPES = ['Cena', 'Cumpleaños', 'Aniversario', 'Reunión', 'Evento', 'Otro'];

    useEffect(() => {
        const collName = isPersonalProject ? 'reservations' : `${ROOT_COLLECTION}reservations`;
        const q = query(collection(db, collName), orderBy('date', 'desc')); // Most recent first

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReservations(data);
            setLoading(false);
        }, (error) => {
            console.error(error);
            toast.error("Error al cargar reservas");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', phone: '', date: new Date().toISOString().split('T')[0], time: '20:00', type: 'Cena', notes: '' });
        setCurrentRes(null);
    };

    const handleOpenModal = (res = null) => {
        if (res) {
            setCurrentRes(res);
            setFormData({
                name: res.name,
                phone: res.phone,
                date: res.date,
                time: res.time,
                type: res.type || 'Cena',
                notes: res.notes || ''
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const collName = isPersonalProject ? 'reservations' : `${ROOT_COLLECTION}reservations`;

        try {
            if (currentRes) {
                await updateDoc(doc(db, collName, currentRes.id), formData);
                toast.success("Reserva actualizada");
            } else {
                await addDoc(collection(db, collName), { ...formData, status: 'pending', createdAt: new Date().toISOString() });
                toast.success("Reserva creada");
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar reserva?")) return;
        const collName = isPersonalProject ? 'reservations' : `${ROOT_COLLECTION}reservations`;
        try {
            await deleteDoc(doc(db, collName, id));
            toast.success("Eliminada");
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const sendWhatsApp = (res) => {
        if (!res.phone) return toast.error("Sin teléfono");
        const msg = `Hola ${res.name}, le escribimos de ${document.title} para confirmar su reserva de ${res.type} para el ${res.date} a las ${res.time}.`;
        const url = `https://wa.me/${res.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    const filteredReservations = reservations.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.phone && r.phone.includes(searchTerm))
    );

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 flex items-center gap-2">
                        <Calendar className="text-indigo-600" size={32} /> Gestión de Reservas
                    </h2>
                    <p className="text-gray-500 text-sm">Administra citas y contacta clientes por WhatsApp.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre/teléfono..."
                            className="pl-10 p-3 bg-white border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => handleOpenModal()} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 flex items-center gap-2">
                        <Plus size={20} /> NUEVA
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Cargando reservas...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReservations.length === 0 ? (
                        <div className="col-span-full text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-400 mb-2">No hay reservas registradas.</p>
                            <button onClick={() => handleOpenModal()} className="text-indigo-600 font-bold hover:underline">Crear la primera</button>
                        </div>
                    ) : filteredReservations.map(res => (
                        <div key={res.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${res.type === 'Cumpleaños' ? 'bg-pink-500' : 'bg-indigo-500'}`}></div>

                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{res.name}</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">
                                        <Tag size={12} /> {res.type}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleOpenModal(res)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg hover:text-blue-500"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(res.id)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <Clock size={16} className="text-indigo-400" />
                                    <span className="font-bold">{new Date(res.date + 'T' + res.time).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <Phone size={16} className="text-green-500" />
                                    <span>{res.phone || 'Sin teléfono'}</span>
                                </div>
                                {res.notes && (
                                    <div className="text-xs bg-gray-50 p-2 rounded-lg text-gray-500 italic">
                                        "{res.notes}"
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => sendWhatsApp(res)}
                                className="w-full py-2 bg-green-50 text-green-600 font-bold rounded-lg border border-green-200 hover:bg-green-100 flex items-center justify-center gap-2 transition-colors"
                            >
                                <MessageCircle size={18} /> CONTACTAR
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">{currentRes ? 'Editar Reserva' : 'Nueva Reserva'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Cliente</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input required type="text" className="w-full pl-10 p-3 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500" placeholder="Ej: Juan Pérez" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono (WhatsApp)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input required type="tel" className="w-full pl-10 p-3 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500" placeholder="Ej: 591 70012345" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha</label>
                                    <input required type="date" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora</label>
                                    <input required type="time" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Evento</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {RESERVATION_TYPES.map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`px-2 py-2 rounded-lg text-xs font-bold border ${formData.type === type ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notas / Pedidos Especiales</label>
                                <textarea className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500 resize-none h-20" placeholder="Opcional..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}></textarea>
                            </div>

                            <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg mt-4">
                                {currentRes ? 'GUARDAR CAMBIOS' : 'REGISTRAR RESERVA'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationManager;
