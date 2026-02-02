import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import { Calendar, Plus, Search, MessageCircle, Trash2, Edit2, X, Clock, User, Phone, Tag, Printer, Home } from 'lucide-react';
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

    const handlePrint = (res) => {
        const printWindow = window.open('', 'PRINT', 'height=600,width=400');
        const html = `
            <html>
            <head>
                <title>Comprobante de Reserva</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; text-align: center; }
                    .header { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
                    .info { margin: 10px 0; font-size: 14px; text-align: left; }
                    .label { font-weight: bold; }
                    .divider { border-top: 1px dashed #000; margin: 15px 0; }
                    .footer { font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">RESERVA CONFIRMADA</div>
                <div class="divider"></div>
                
                <div class="info">
                    <div><span class="label">CLIENTE:</span> ${res.name}</div>
                    <div><span class="label">FECHA:</span> ${new Date(res.date).toLocaleDateString()}</div>
                    <div><span class="label">HORA:</span> ${res.time}</div>
                    <div><span class="label">TIPO:</span> ${res.type}</div>
                    <div><span class="label">TEL:</span> ${res.phone}</div>
                </div>

                ${res.notes ? `<div class="divider"></div><div class="info"><span class="label">NOTAS:</span><br/>${res.notes}</div>` : ''}

                <div class="divider"></div>
                <div class="footer">
                    Por favor presentar este ticket al llegar.<br/>
                    ¡Gracias por su preferencia!
                </div>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const filteredReservations = reservations.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.phone && r.phone.includes(searchTerm))
    );

    // Group by Date Logic
    const groupedReservations = filteredReservations.reduce((groups, res) => {
        const date = res.date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(res);
        return groups;
    }, {});

    // Sort groups by date
    const sortedDates = Object.keys(groupedReservations).sort((a, b) => a.localeCompare(b));

    const handlePrintDailyList = (date, list) => {
        const printWindow = window.open('', 'PRINT', 'height=800,width=600');
        const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        const html = `
            <html>
            <head>
                <title>Reservas - ${date}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    .title { font-weight: bold; font-size: 20px; text-transform: uppercase; }
                    .date { color: #555; margin-top: 5px; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #f0f0f0; text-align: left; padding: 10px; border-bottom: 2px solid #000; font-size: 12px; text-transform: uppercase; }
                    td { padding: 12px 10px; border-bottom: 1px solid #ddd; font-size: 14px; vertical-align: top; }
                    .time-col { font-weight: bold; width: 80px; }
                    .name-col { font-weight: bold; color: #000; }
                    .type-tag { font-size: 10px; background: #eee; padding: 2px 6px; rounded: 4px; display: inline-block; margin-top: 4px; text-transform: uppercase; }
                    .notes { font-style: italic; color: #666; font-size: 12px; margin-top: 4px; }
                    .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #888; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">LISTA DE RESERVAS</div>
                    <div class="date">${formattedDate}</div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Cliente / Evento</th>
                            <th>Teléfono</th>
                            <th>Notas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.sort((a, b) => a.time.localeCompare(b.time)).map(res => `
                            <tr>
                                <td class="time-col">${res.time}</td>
                                <td>
                                    <div class="name-col">${res.name}</div>
                                    <div class="type-tag">${res.type || 'Reserva'}</div>
                                </td>
                                <td>${res.phone || '-'}</td>
                                <td>
                                    ${res.notes ? `<div class="notes">"${res.notes}"</div>` : '-'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    Impreso el ${new Date().toLocaleString()}
                </div>
            </body>
            </html>
        `;

        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => window.location.reload()} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"><Home size={20} /></button>
                        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-2">
                            <Calendar className="text-indigo-600" size={32} /> Reservas
                        </h2>
                    </div>
                    <p className="text-gray-500 text-sm ml-12">Administra citas y contacta clientes.</p>
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
                <div className="space-y-8">
                    {filteredReservations.length === 0 && (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-400 mb-2">No hay reservas registradas.</p>
                            <button onClick={() => handleOpenModal()} className="text-indigo-600 font-bold hover:underline">Crear la primera</button>
                        </div>
                    )}

                    {sortedDates.map(date => {
                        const dayReservations = groupedReservations[date];
                        const dateObj = new Date(date + 'T12:00:00');
                        const isToday = new Date().toDateString() === dateObj.toDateString();

                        return (
                            <div key={date} className="animate-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-2">
                                    <div>
                                        <h3 className={`text-xl font-bold ${isToday ? 'text-green-600' : 'text-gray-800'} capitalize`}>
                                            {isToday && "Hoy, "} {dateObj.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{dayReservations.length} Reservas</p>
                                    </div>
                                    <button
                                        onClick={() => handlePrintDailyList(date, dayReservations)}
                                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors border border-gray-200 hover:border-indigo-200"
                                    >
                                        <Printer size={16} /> IMPRIMIR LISTA
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {dayReservations
                                        .sort((a, b) => a.time.localeCompare(b.time))
                                        .map(res => (
                                            <div key={res.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                                                <div className={`absolute top-0 left-0 w-1 h-full ${res.type === 'Cumpleaños' ? 'bg-pink-500' : 'bg-indigo-500'}`}></div>

                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-bold text-gray-800 text-lg">{res.name}</h3>
                                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">
                                                            <Tag size={12} /> {res.type}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handlePrint(res)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg hover:text-gray-800" title="Imprimir Ticket"><Printer size={16} /></button>
                                                        <button onClick={() => handleOpenModal(res)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg hover:text-blue-500"><Edit2 size={16} /></button>
                                                        <button onClick={() => handleDelete(res.id)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg hover:text-red-500"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                        <Clock size={16} className="text-indigo-400" />
                                                        <span className="font-bold text-lg">{res.time}</span>
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
                            </div>
                        );
                    })}
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
