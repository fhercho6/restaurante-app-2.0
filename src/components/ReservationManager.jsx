import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import { Calendar, Plus, Search, MessageCircle, Trash2, Edit2, X, Clock, User, Phone, Tag, Printer, Home, DollarSign, Bell, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ReservationManager = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [currentRes, setCurrentRes] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: '',
        time: '',
        type: 'Cena',
        location: '',
        deposit: '',
        notes: ''
    });

    const RESERVATION_TYPES = ['Cena', 'Cumpleaños', 'Aniversario', 'Reunión', 'Evento', 'Graduación', 'Despedida', 'Baby Shower', 'Otro'];

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
        setFormData({ name: '', phone: '', date: new Date().toISOString().split('T')[0], time: '20:00', type: 'Cena', location: '', deposit: '', notes: '' });
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
                location: res.location || '',
                deposit: res.deposit || '',
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
                    <div><span class="label">LUGAR:</span> ${res.location || 'No asignado'}</div>
                    ${res.deposit ? `<div><span class="label">A CUENTA:</span> Bs. ${parseFloat(res.deposit).toFixed(2)}</div>` : ''}
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

    // Sort groups by date (DESCENDING: Newest/Future first)
    const sortedDates = Object.keys(groupedReservations).sort((a, b) => b.localeCompare(a));

    // Print Sort State
    const [isPrintSortModalOpen, setIsPrintSortModalOpen] = useState(false);
    const [printListDate, setPrintListDate] = useState(null);
    const [printListItems, setPrintListItems] = useState([]);

    const openPrintSortModal = (date, list) => {
        setPrintListDate(date);
        // Default sort by time
        setPrintListItems([...list].sort((a, b) => a.time.localeCompare(b.time)));
        setIsPrintSortModalOpen(true);
    };

    const moveItem = (index, direction) => {
        const newItems = [...printListItems];
        if (direction === 'up' && index > 0) {
            [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
        } else if (direction === 'down' && index < newItems.length - 1) {
            [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        }
        setPrintListItems(newItems);
    };

    const handlePrintDailyList = () => {
        const date = printListDate;
        const list = printListItems;

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
                    .time-col { font-weight: bold; width: 60px; }
                    .loc-col { font-weight: bold; width: 100px; color: #444; }
                    .money-col { font-weight: bold; width: 80px; color: #166534; text-align: right; }
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
                            <th style="width: 30px; text-align: center;">#</th>
                            <th>Hora</th>
                            <th>Ubicación</th>
                            <th>Cliente / Evento</th>
                            <th>A Cuenta</th>
                            <th>Teléfono</th>
                            <th>Notas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map((res, index) => `
                            <tr>
                                <td style="text-align: center; font-weight: bold; color: #888;">${index + 1}</td>
                                <td class="time-col">${res.time}</td>
                                <td class="loc-col">${res.location || '---'}</td>
                                <td>
                                    <div class="name-col">${res.name}</div>
                                    <div class="type-tag">${res.type || 'Reserva'}</div>
                                </td>
                                <td class="money-col">${res.deposit ? 'Bs. ' + parseFloat(res.deposit).toFixed(2) : '-'}</td>
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
                    <p className="text-gray-500 text-sm ml-12">Administra citas y contacte clientes.</p>
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
                    <button onClick={() => setIsContactModalOpen(true)} className="px-4 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow border border-indigo-100 hover:bg-indigo-50 flex items-center gap-2">
                        <Bell size={20} /> CONTACTOS
                    </button>
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
                                        onClick={() => openPrintSortModal(date, dayReservations)}
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
                                                        {res.deposit && (
                                                            <div className="mt-1 flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-md border border-green-100">
                                                                <DollarSign size={12} /> A cuenta: Bs. {parseFloat(res.deposit).toFixed(2)}
                                                            </div>
                                                        )}
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
                                                        {res.location && (
                                                            <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded border border-yellow-200 uppercase">
                                                                {res.location}
                                                            </span>
                                                        )}
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

            {/* PRINT SORT MODAL */}
            {isPrintSortModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-gray-800 p-4 flex justify-between items-center text-white shrink-0">
                            <h3 className="font-bold text-lg">Ordenar para Impresión</h3>
                            <button onClick={() => setIsPrintSortModalOpen(false)}><X /></button>
                        </div>
                        <div className="p-4 bg-gray-50 border-b shrink-0">
                            <p className="text-sm text-gray-500">Usa las flechas para ordenar la lista de reservas antes de imprimir.</p>
                        </div>
                        <div className="overflow-y-auto p-2 flex-1 space-y-2">
                            {printListItems.map((res, index) => (
                                <div key={res.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-400 w-6">{index + 1}.</span>
                                        <div>
                                            <div className="font-bold text-sm text-gray-800">{res.name}</div>
                                            <div className="text-xs text-gray-500">{res.time} - {res.location || 'S/U'}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => moveItem(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                                        </button>
                                        <button
                                            onClick={() => moveItem(index, 'down')}
                                            disabled={index === printListItems.length - 1}
                                            className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t bg-gray-50 shrink-0 flex justify-end gap-2">
                            <button onClick={() => setIsPrintSortModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">Cancelar</button>
                            <button onClick={handlePrintDailyList} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                <Printer size={16} /> IMPRIMIR AHORA
                            </button>
                        </div>
                    </div>
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

                            {/* LOCATION FIELD */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ubicación / Mesa (Importante)</label>
                                <div className="relative">
                                    <Home className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input type="text" className="w-full pl-10 p-3 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500" placeholder="Ej: Mesa 5, Terraza, Vip..." value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">A cuenta / Adelanto (Bs.)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input type="number" step="0.01" className="w-full pl-10 p-3 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500" placeholder="0.00" value={formData.deposit} onChange={e => setFormData({ ...formData, deposit: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Evento</label>
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500"
                                        placeholder="Escribe o selecciona..."
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {RESERVATION_TYPES.map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${formData.type === type ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
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

            {/* CONTACT LIST / REMINDERS MODAL */}
            {isContactModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden h-[80vh] flex flex-col">
                        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <Bell size={24} />
                                <div>
                                    <h3 className="font-bold text-lg">Centro de Notificaciones</h3>
                                    <p className="text-xs text-indigo-200">Envíe recordatorios o contacte a sus clientes</p>
                                </div>
                            </div>
                            <button onClick={() => setIsContactModalOpen(false)}><X /></button>
                        </div>

                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center shrink-0">
                            <div className="text-sm text-gray-500 font-medium">Mostrando {filteredReservations.length} contactos</div>
                            <button
                                onClick={() => {
                                    const text = filteredReservations.map(r => `${r.name}\t${r.phone}\t${r.date}`).join('\n');
                                    navigator.clipboard.writeText(text);
                                    toast.success("Lista copiada al portapapeles");
                                }}
                                className="flex items-center gap-2 text-xs font-bold bg-white border px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                            >
                                <Copy size={14} /> COPIAR LISTA
                            </button>
                        </div>

                        <div className="overflow-auto p-4 flex-1">
                            {filteredReservations.length === 0 ? (
                                <p className="text-center text-gray-400 py-10">No se encontraron reservas con los filtros actuales.</p>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs font-bold text-gray-500 uppercase border-b">
                                            <th className="p-3">Cliente</th>
                                            <th className="p-3">Teléfono</th>
                                            <th className="p-3">Reserva Para</th>
                                            <th className="p-3 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-700">
                                        {filteredReservations
                                            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort descending date for list view
                                            .map(res => (
                                                <tr key={res.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3 font-bold">{res.name}</td>
                                                    <td className="p-3 font-mono text-gray-500">{res.phone || '-'}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${new Date(res.date + 'T12:00:00').toDateString() === new Date().toDateString() ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                                                            {new Date(res.date + 'T12:00:00').toLocaleDateString()}
                                                        </span>
                                                        <span className="ml-2 text-gray-500">{res.time}</span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <button
                                                            onClick={() => sendWhatsApp(res)}
                                                            className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 border border-green-200"
                                                        >
                                                            <MessageCircle size={14} /> WhatsApp
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationManager;
