import React, { useEffect, useState } from 'react';
import { X, DollarSign, Printer, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import { useData } from '../context/DataContext';
import { useRegister } from '../context/RegisterContext';
import toast from 'react-hot-toast';

const CommissionPaymentModal = ({ onClose, onPrintReceipt }) => {
    const { staff, commissionTiers } = useData();
    const { registerSession, sessionStats, addExpense } = useRegister();
    const [loading, setLoading] = useState(true);
    const [commissionData, setCommissionData] = useState([]);

    useEffect(() => {
        calculateCommissions();
    }, [registerSession, staff, sessionStats.expensesList]);

    const calculateCommissions = async () => {
        if (!registerSession) return;
        setLoading(true);

        try {
            // 0. Calculate Already Paid Commissions from Expenses
            const paidSoFar = {};
            if (sessionStats.expensesList) {
                sessionStats.expensesList.forEach(e => {
                    // Description format: "Pago Comisión: Name (5%)"
                    const match = e.description.match(/Pago Comisión: (.+) \(\d+%\)/);
                    if (match) {
                        const name = match[1];
                        paidSoFar[name] = (paidSoFar[name] || 0) + parseFloat(e.amount);
                    }
                });
            }

            // 1. Fetch Sales for this session
            const salesColl = isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`;
            const qSales = query(collection(db, salesColl), where('registerId', '==', registerSession.id));
            const snapSales = await getDocs(qSales);

            const staffUtility = {}; // { staffName: utilityAmount }
            const staffSalesTotal = {}; // { staffName: salesTotal }

            // 2. Identify Commissioned Staff
            const commissionedStaff = staff.filter(s => s.commissionEnabled);

            // 3. Process Sales
            snapSales.forEach(doc => {
                const sale = doc.data();
                const waiterName = sale.staffName;

                if (waiterName && commissionedStaff.some(s => s.name === waiterName)) {
                    if (!staffUtility[waiterName]) {
                        staffUtility[waiterName] = 0;
                        staffSalesTotal[waiterName] = 0;
                    }

                    // Calculate Utility (Profit)
                    if (sale.items) {
                        sale.items.forEach(item => {
                            const price = parseFloat(item.price) || 0;
                            const cost = parseFloat(item.cost) || 0;
                            const qty = parseInt(item.qty) || 1;
                            staffUtility[waiterName] += (price - cost) * qty;
                            staffSalesTotal[waiterName] += price * qty;
                        });
                    }
                }
            });

            // 4. Calculate Commission Amount based on Tiers
            const tiers = commissionTiers || [
                { max: 5000, rate: 0.05 },
                { max: 5500, rate: 0.06 },
                { max: 6000, rate: 0.07 },
                { max: 999999, rate: 0.08 }
            ];

            const details = Object.entries(staffUtility).map(([name, utility]) => {
                const sortedTiers = [...tiers].sort((a, b) => a.max - b.max);
                const tier = sortedTiers.find(t => utility <= t.max);
                const rate = tier ? tier.rate : sortedTiers[sortedTiers.length - 1].rate;
                const grandTotalSales = staffSalesTotal[name] || 0;

                const totalCommission = utility * rate;
                const paid = paidSoFar[name] || 0;
                const pending = totalCommission - paid;

                return {
                    name,
                    salesTotal: grandTotalSales,
                    utility,
                    rate,
                    totalCommission, // Total earned
                    paid,            // Already paid
                    commissionAmount: pending > 0.01 ? pending : 0 // Payable now (previene float dust)
                };
            }).filter(d => d.totalCommission > 0); // Show if they have earned anything, even if fully paid

            setCommissionData(details);

        } catch (error) {
            console.error("Error calculating commissions:", error);
            toast.error("Error calculando comisiones");
        } finally {
            setLoading(false);
        }
    };

    const handlePayCommission = async (data) => {
        if (data.commissionAmount <= 0) return;

        if (confirm(`¿Pagar Bs. ${data.commissionAmount.toFixed(2)} a ${data.name}? \nEsto se registrará como un GASTO en caja.`)) {
            const description = `Pago Comisión: ${data.name} (${(data.rate * 100).toFixed(0)}%)`;
            const success = await addExpense(description, data.commissionAmount);

            if (success) {
                // Print Receipt for signature
                onPrintReceipt({
                    type: 'expense',
                    amount: data.commissionAmount,
                    description: `PAGO DE COMISIÓN<br/><br/>GARZÓN: ${data.name.toUpperCase()}<br/>VENTAS: Bs. ${data.salesTotal.toFixed(2)}<br/>UTILIDAD BASE: Bs. ${data.utility.toFixed(2)}<br/>TASA: ${(data.rate * 100).toFixed(0)}%`,
                    staffName: data.name, // "Atiende" (Garzón)
                    cashierName: registerSession.openedBy || 'Cajero', // "Caja"
                    date: new Date().toLocaleString(),
                    businessName: 'LicoBar',
                    autoPrint: true
                });
            }
        }
    };


    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* HEAD */}
                <div className="bg-purple-600 p-4 flex justify-between items-center text-white">
                    <h2 className="font-bold flex items-center gap-2"><DollarSign /> Pago de Comisiones (Turno Actual)</h2>
                    <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"><X size={20} /></button>
                </div>

                {/* BODY */}
                <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center py-10 text-gray-400">
                            <span className="loading loading-spinner loading-lg"></span>
                            <p>Calculando...</p>
                        </div>
                    ) : commissionData.length === 0 ? (
                        <div className="flex flex-col items-center py-10 text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">
                            <AlertCircle size={48} className="mb-2 opacity-50" />
                            <p className="font-bold">No hay comisiones pendientes</p>
                            <p className="text-sm">Nadie ha generado ventas comisionables en este turno aún.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-700 mb-4">
                                <p className="font-bold flex items-center gap-1"><AlertCircle size={14} /> Nota:</p>
                                <p>El cálculo descuenta automáticamente lo ya pagado en este turno.</p>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Garzón</th>
                                            <th className="px-4 py-3 text-center">Ventas</th>
                                            <th className="px-4 py-3 text-center">Utilidad</th>
                                            <th className="px-4 py-3 text-center">%</th>
                                            <th className="px-4 py-3 text-right text-gray-400">Total</th>
                                            <th className="px-4 py-3 text-right text-green-600">Pagado</th>
                                            <th className="px-4 py-3 text-right font-black">Pendiente</th>
                                            <th className="px-4 py-3 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {commissionData.map((d, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-bold text-gray-800">{d.name}</td>
                                                <td className="px-4 py-3 text-center text-gray-500">Bs. {d.salesTotal.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center text-gray-500">Bs. {d.utility.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">{(d.rate * 100).toFixed(0)}%</span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-400">Bs. {d.totalCommission.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right text-green-600 font-medium">Bs. {d.paid.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-black text-gray-900 text-lg">Bs. {d.commissionAmount.toFixed(2)}</td>
                                                <td className="px-4 py-3 flex justify-center">
                                                    {d.commissionAmount <= 0 ? (
                                                        <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-xs border border-green-200">
                                                            <CheckCircle size={14} /> AL DÍA
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handlePayCommission(d)}
                                                            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
                                                        >
                                                            <DollarSign size={14} /> PAGAR
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-100 p-4 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommissionPaymentModal;
