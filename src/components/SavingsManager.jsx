import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import { PiggyBank, Plus, Trash2, TrendingUp, TrendingDown, DollarSign, X, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // [NEW]
import toast from 'react-hot-toast';

const SavingsManager = () => {
    const { currentUser, staffMember } = useAuth(); // [NEW] Auth Check
    const [savings, setSavings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    // Form State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        const collName = isPersonalProject ? 'savings' : `${ROOT_COLLECTION}savings`;
        // Order by date desc
        const q = query(collection(db, collName), orderBy('date', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSavings(data);
            setLoading(false);
        }, (error) => {
            console.error(error);
            toast.error("Error cargando ahorros");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const totalSaved = savings.reduce((acc, curr) => {
        const val = parseFloat(curr.amount) || 0;
        return curr.type === 'deposit' ? acc + val : acc - val;
    }, 0);

    const formatCurrency = (value) => {
        if (value >= 1000) {
            return (value / 1000).toFixed(1).replace('.0', '') + ' k';
        }
        return value.toFixed(2);
    };

    const handleTransaction = async (type) => {
        // [DEBUG] Temporarily disabled strict check to debug Admin role issue
        // const isOwner = currentUser && !currentUser.isAnonymous;
        // const isAdmin = staffMember && staffMember.role === 'Administrador';

        // if (!isOwner && !isAdmin) {
        //     console.error("Access Denied", { isOwner, isAdmin, currentUser, staffMember });
        //     toast.error(`⛔ Acceso Denegado (Rol: ${staffMember?.role || 'Ninguno'})`);
        //     return;
        // }

        if (!amount || parseFloat(amount) <= 0) return toast.error("Monto inválido");
        if (!description) return toast.error("Falta descripción");

        const collName = isPersonalProject ? 'savings' : `${ROOT_COLLECTION}savings`;
        try {
            await addDoc(collection(db, collName), {
                date: new Date().toISOString(),
                amount: parseFloat(amount),
                description,
                type: type, // 'deposit' or 'withdrawal'
                createdBy: 'Admin'
            });
            toast.success(type === 'deposit' ? '¡Ahorro Guardado!' : 'Retiro Registrado');
            setIsAddModalOpen(false);
            setIsWithdrawModalOpen(false);
            setAmount('');
            setDescription('');
        } catch (error) {
            console.error("Transaction Error:", error);
            toast.error("Error al guardar: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        const isOwner = currentUser && !currentUser.isAnonymous;
        const isAdmin = staffMember && staffMember.role === 'Administrador';

        if (!isOwner && !isAdmin) {
            toast.error("⛔ Solo Administradores");
            return;
        }

        if (!window.confirm("¿Borrar este registro? (Afectará el total)")) return;
        const collName = isPersonalProject ? 'savings' : `${ROOT_COLLECTION}savings`;
        try {
            await deleteDoc(doc(db, collName, id));
            toast.success("Registro eliminado");
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in">
            {/* PIGGY BANK HEADER */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-8 text-white shadow-2xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                    <PiggyBank size={300} />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="bg-white/20 p-4 rounded-full mb-4 backdrop-blur-sm shadow-inner ring-4 ring-white/10">
                        <PiggyBank size={64} className="text-white drop-shadow-md animate-bounce-slow" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-widest text-pink-100 mb-2">Mi Alcancía</h2>
                    <div className="text-6xl font-black mb-2 tracking-tighter drop-shadow-lg flex items-start justify-center">
                        <span className="text-3xl mt-2 opacity-80 mr-1">Bs.</span>
                        {formatCurrency(totalSaved)}
                    </div>
                    <p className="text-pink-100 font-medium bg-pink-700/30 px-4 py-1 rounded-full text-sm">
                        {savings.length} movimientos registrados
                    </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="relative z-10 flex justify-center gap-4 mt-8">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-white text-pink-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-pink-50 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95"
                    >
                        <Plus size={24} /> ALIMENTAR AL CHANCHO
                    </button>
                    <button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        className="bg-black/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-black/30 transition-all flex items-center gap-2 border border-white/20"
                    >
                        <TrendingDown size={24} /> RETIRAR / GASTAR
                    </button>
                </div>
            </div>

            {/* HISTORY LIST */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex items-center gap-2 text-gray-500 font-bold uppercase text-xs tracking-wider">
                    <History size={16} /> Historial de Movimientos
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-400">Cargando la alcancía...</div>
                ) : savings.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 italic">
                        El chanchito está vacío. ¡Empieza a ahorrar! 🐖
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {savings.map(item => (
                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${item.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {item.type === 'deposit' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{item.description}</p>
                                        <p className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`font-black text-lg ${item.type === 'deposit' ? 'text-green-600' : 'text-red-500'}`}>
                                        {item.type === 'deposit' ? '+' : '-'} Bs. {parseFloat(item.amount).toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Eliminar registro"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ADD MONEY MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden transform transition-all scale-100">
                        <div className="bg-pink-500 p-6 text-center text-white relative">
                            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/30 p-1 rounded-full transition-colors"><X size={20} /></button>
                            <PiggyBank size={48} className="mx-auto mb-2 animate-bounce" />
                            <h3 className="font-bold text-xl uppercase">Nuevo Ahorro</h3>
                            <p className="text-pink-100 text-sm">¡Guardemos dinero!</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Motivo / Descripción</label>
                                <input autoFocus type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pink-500" placeholder="Ej: Venta de Botellas, Sobrante..." value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Monto a Guardar (Bs.)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input type="number" step="0.50" className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pink-500 font-bold text-lg" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTransaction('deposit')} />
                                </div>
                            </div>
                            <button onClick={() => handleTransaction('deposit')} className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-200 transition-all transform active:scale-95">
                                ¡GUARDAR EN EL CHANCHO! 🐷
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* WITHDRAW MODAL */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
                        <div className="bg-gray-800 p-6 text-center text-white relative">
                            <button onClick={() => setIsWithdrawModalOpen(false)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-1 rounded-full transition-colors"><X size={20} /></button>
                            <TrendingDown size={48} className="mx-auto mb-2 text-red-400" />
                            <h3 className="font-bold text-xl uppercase">Retirar Fondos</h3>
                            <p className="text-gray-400 text-sm">Usar ahorros para gastos/compras</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Motivo del Retiro</label>
                                <input autoFocus type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gray-500" placeholder="Ej: Compra de Insumos, Alquiler..." value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Monto a Retirar (Bs.)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input type="number" step="0.50" className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gray-500 font-bold text-lg" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTransaction('withdrawal')} />
                                </div>
                            </div>
                            <button onClick={() => handleTransaction('withdrawal')} className="w-full py-4 bg-gray-800 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95">
                                CONFIRMAR RETIRO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavingsManager;
