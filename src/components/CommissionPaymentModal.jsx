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
    const [bonuses, setBonuses] = useState({});

    useEffect(() => {
        calculateCommissions();
    }, [registerSession, staff, sessionStats]);

    const calculateCommissions = async () => {
        setLoading(true);
        if (!registerSession) {
            setLoading(false);
            return;
        }

        try {
            // 0. Calculate Already Paid Commissions from Expenses
            const paidSoFar = {}; // { staffName: amount }
            const paymentHistory = {}; // { staffName: [expenseObjects] }

            if (sessionStats && sessionStats.expensesList) {
                sessionStats.expensesList.forEach(e => {
                    // Description format: "Pago Comisión: Name (5%)"
                    if (!e.description || typeof e.description !== 'string') return;

                    const match = e.description.match(/Pago Comisión: (.+) \(\d+%\)/);
                    if (match) {
                        const name = match[1];
                        paidSoFar[name] = (paidSoFar[name] || 0) + parseFloat(e.amount);

                        if (!paymentHistory[name]) paymentHistory[name] = [];
                        paymentHistory[name].push(e);
                    }
                });
            }

            // 1. Fetch Sales for this session
            const salesColl = isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`;
            const qSales = query(collection(db, salesColl), where('registerId', '==', registerSession.id));
            const snapSales = await getDocs(qSales);

            const staffStandardUtility = {};
            const staffComboUtility = {};
            const staffStandardSales = {};
            const staffComboSales = {};

            // 2. Identify Commissioned Staff
            const commissionedStaff = staff.filter(s => s.commissionEnabled);

            // 3. Process Sales
            snapSales.forEach(doc => {
                const sale = doc.data();
                const waiterName = sale.staffName;

                if (waiterName && commissionedStaff.some(s => s.name === waiterName)) {
                    if (!staffStandardUtility[waiterName]) {
                        staffStandardUtility[waiterName] = 0;
                        staffComboUtility[waiterName] = 0;
                        staffStandardSales[waiterName] = 0;
                        staffComboSales[waiterName] = 0;
                    }

                    // Calculate Utility (Profit)
                    if (sale.items) {
                        sale.items.forEach(item => {
                            const price = parseFloat(item.price) || 0;
                            const cost = parseFloat(item.cost) || 0;
                            const qty = parseInt(item.qty) || 1;
                            const utility = (price - cost) * qty;
                            const total = price * qty;

                            // Check for Combos (Case insensitive check, defaulting to standard if no category)
                            const isCombo = item.category && item.category.toLowerCase() === 'combos';

                            if (isCombo) {
                                staffComboUtility[waiterName] += utility;
                                staffComboSales[waiterName] += total;
                            } else {
                                staffStandardUtility[waiterName] += utility;
                                staffStandardSales[waiterName] += total;
                            }
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

            const details = Object.entries(staffStandardUtility).map(([name, stdUtility]) => {
                // Standard Tier Calculation
                const sortedTiers = [...tiers].sort((a, b) => a.max - b.max);
                const tier = sortedTiers.find(t => stdUtility <= t.max);
                const stdRate = tier ? tier.rate : sortedTiers[sortedTiers.length - 1].rate;
                const stdSales = staffStandardSales[name] || 0;

                // Combo Fixed 8% Calculation
                const cmbUtility = staffComboUtility[name] || 0;
                const cmbSales = staffComboSales[name] || 0;
                const cmbRate = 0.08;

                // Totals
                const stdCommission = stdUtility * stdRate;
                const cmbCommission = cmbUtility * cmbRate;
                const totalCommission = stdCommission + cmbCommission;

                const grandTotalSales = stdSales + cmbSales;
                const grandTotalUtility = stdUtility + cmbUtility;

                const paid = paidSoFar[name] || 0;
                const pending = totalCommission - paid;

                return {
                    name,
                    salesTotal: grandTotalSales,
                    utility: grandTotalUtility,
                    rateDisplay: cmbUtility > 0
                        ? `${(stdRate * 100).toFixed(0)}% + Combos(8%)`
                        : `${(stdRate * 100).toFixed(0)}%`,
                    rate: stdRate, // Keep base rate for reference

                    // Breakdown for receipt
                    stdCommission,
                    cmbCommission,
                    stdUtility,
                    cmbUtility,
                    stdRate,

                    totalCommission, // Total earned
                    paid,            // Already paid
                    pending,         // Raw pending (can be negative)
                    history: paymentHistory[name] || [], // List of past payments
                    commissionAmount: pending > 0.01 ? pending : 0 // Payable now
                };
            }).filter(d => d.totalCommission > 0 || d.paid > 0); // Show if they earned OR were paid

            setCommissionData(details);

        } catch (error) {
            console.error("Error calculating commissions:", error);
            toast.error("Error calculando comisiones");
        } finally {
            setLoading(false);
        }
    };

    const handleBonusChange = (staffName, value) => {
        setBonuses(prev => ({
            ...prev,
            [staffName]: parseFloat(value)
        }));
    };

    const handlePayCommission = async (data) => {
        if (data.commissionAmount <= 0) return;

        const bonus = bonuses[data.name] || 0;
        const totalPay = data.commissionAmount + bonus;

        if (confirm(`¿Pagar Bs. ${totalPay.toFixed(2)} a ${data.name}? \n(Comisión: Bs. ${data.commissionAmount.toFixed(2)} + Pasaje: Bs. ${bonus.toFixed(2)})`)) {

            let descText = `Pago Comisión: ${data.name}`;
            if (data.cmbCommission > 0) descText += ` (Mix)`;
            else descText += ` (${(data.stdRate * 100).toFixed(0)}%)`;

            if (bonus > 0) descText += ` + Pasaje (Bs. ${bonus})`;

            const success = await addExpense(descText, totalPay);

            if (success) {
                // Prepare detailed lines for receipt
                let breakdownHtml = '';
                if (data.cmbCommission > 0) {
                    breakdownHtml += `VENTAS REGULARES: Bs. ${data.salesTotal.toFixed(2)}<br/>`;
                    breakdownHtml += `COMISIÓN REGULAR (${(data.stdRate * 100).toFixed(0)}%): Bs. ${data.stdCommission.toFixed(2)}<br/>`;
                    breakdownHtml += `COMISIÓN COMBOS (8%): Bs. ${data.cmbCommission.toFixed(2)}<br/>`;
                } else {
                    breakdownHtml += `VENTAS: Bs. ${data.salesTotal.toFixed(2)}<br/>`;
                    breakdownHtml += `TASA: ${(data.stdRate * 100).toFixed(0)}%<br/>`;
                }

                // Print Receipt for signature
                onPrintReceipt({
                    type: 'expense',
                    amount: totalPay,
                    description: `PAGO DE COMISIÓN<br/><br/>GARZÓN: ${data.name.toUpperCase()}<br/>${breakdownHtml}----------------<br/>SUBTOTAL COMISIÓN: Bs. ${data.commissionAmount.toFixed(2)}<br/>PASAJE / BONO: Bs. ${bonus.toFixed(2)}`,
                    staffName: data.name,
                    cashierName: registerSession.openedBy || 'Cajero',
                    date: new Date().toLocaleString(),
                    businessName: 'LicoBar',
                    autoPrint: true
                });
                // Reset bonus for this user after pay
                handleBonusChange(data.name, 0);
                setTimeout(calculateCommissions, 500); // Refresh list
            }
        }
    };

    const handleReprint = (expense, staffName) => {
        const date = new Date(expense.date || expense.timestamp || Date.now());
        onPrintReceipt({
            type: 'expense',
            amount: parseFloat(expense.amount),
            description: `*** REIMPRESIÓN ***<br/><br/>FECHA ORIGINAL: ${date.toLocaleString()}<br/>----------------------<br/>${expense.description}`,
            staffName: staffName,
            cashierName: registerSession.openedBy || 'Cajero',
            date: new Date().toLocaleString(),
            businessName: 'LicoBar',
            autoPrint: true
        });
        toast.success("Enviando reimpresión...");
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* ... Header ... */}
                <div className="bg-purple-600 p-4 flex justify-between items-center text-white">
                    <h2 className="font-bold flex items-center gap-2"><DollarSign /> Pago de Comisiones (Turno Actual)</h2>
                    <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"><X size={20} /></button>
                </div>

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

                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Garzón</th>
                                            <th className="px-4 py-3 text-center">Ventas</th>
                                            <th className="px-4 py-3 text-center hidden md:table-cell">Utilidad</th>
                                            <th className="px-4 py-3 text-center">%</th>
                                            <th className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">Total</th>
                                            <th className="px-4 py-3 text-right text-green-600 hidden sm:table-cell">Pagado</th>
                                            <th className="px-4 py-3 text-right font-black">Pendiente</th>
                                            <th className="px-4 py-3 text-center bg-orange-50 text-orange-800 border-l border-orange-100">Pasaje (Bs)</th>
                                            <th className="px-4 py-3 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {commissionData.map((d, i) => (
                                            <React.Fragment key={i}>
                                                <tr className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 font-bold text-gray-800">{d.name}</td>
                                                    <td className="px-4 py-3 text-center text-gray-500">Bs. {d.salesTotal.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-center text-gray-500 hidden md:table-cell">Bs. {d.utility.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">{d.rateDisplay}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">Bs. {d.totalCommission.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-right text-green-600 font-medium hidden sm:table-cell">Bs. {d.paid.toFixed(2)}</td>
                                                    <td className={`px-4 py-3 text-right font-black text-lg ${d.pending < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                                        {d.pending < 0 ? `(${Math.abs(d.pending).toFixed(2)})` : `Bs. ${d.pending.toFixed(2)}`}
                                                    </td>
                                                    <td className="px-4 py-3 text-center bg-orange-50/50 border-l border-orange-100">
                                                        {d.commissionAmount > 0 ? (
                                                            <select
                                                                className="p-1 border border-orange-200 rounded text-sm font-bold text-orange-800 focus:outline-none focus:border-orange-500 bg-white"
                                                                value={bonuses[d.name] || 0}
                                                                onChange={(e) => handleBonusChange(d.name, e.target.value)}
                                                            >
                                                                <option value="0">0</option>
                                                                <option value="10">10</option>
                                                                <option value="20">20</option>
                                                                <option value="30">30</option>
                                                                <option value="40">40</option>
                                                                <option value="50">50</option>
                                                            </select>
                                                        ) : <span className="text-gray-300">-</span>}
                                                    </td>
                                                    <td className="px-4 py-3 flex justify-center items-center gap-2">
                                                        {d.commissionAmount > 0 ? (
                                                            <button
                                                                onClick={() => handlePayCommission(d)}
                                                                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
                                                            >
                                                                <DollarSign size={14} /> PAGAR {bonuses[d.name] > 0 && `+${bonuses[d.name]}`}
                                                            </button>
                                                        ) : d.pending < -0.01 ? (
                                                            <span className="flex items-center gap-1 text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full text-xs border border-red-200" title="Se pagó más de lo generado">
                                                                <AlertCircle size={14} /> ADELANTO
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-xs border border-green-200">
                                                                <CheckCircle size={14} /> AL DÍA
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                                {/* History Sub-Row */}
                                                {d.history.length > 0 && (
                                                    <tr>
                                                        <td colSpan="9" className="bg-gray-50/50 px-4 py-2">
                                                            <div className="flex flex-wrap gap-2 items-center text-xs">
                                                                <span className="font-bold text-gray-400 uppercase text-[10px]">Historial de Pagos:</span>
                                                                {d.history.map((h, k) => (
                                                                    <div key={k} className="flex items-center gap-2 bg-white border border-gray-200 rounded px-2 py-1 shadow-sm">
                                                                        <span className="text-gray-500">{new Date(h.date || h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                        <span className="font-bold text-gray-700">Bs. {parseFloat(h.amount).toFixed(2)}</span>
                                                                        <button onClick={() => handleReprint(h, d.name)} className="text-blue-600 hover:text-blue-800 p-0.5 rounded hover:bg-blue-50" title="Reimprimir">
                                                                            <Printer size={12} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
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
