import React, { useState, useMemo } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'; // [UPDATED]
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useRegister } from '../context/RegisterContext';
import { Wifi, WifiOff, Home, LogOut, ClipboardList, Users, FileText, Printer, Settings, Plus, Edit2, Search, ChefHat, DollarSign, ArrowLeft, Lock, Unlock, Wallet, Loader2, LayoutGrid, Gift, Trees, TrendingUp, Package, Filter, X, Zap, Wrench, Calendar, PieChart, Calculator, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import LandingPage from './LandingPage';
import POSInterface from './POSInterface';
import StaffManagerView from './StaffManagerView';
import SalesDashboard from './SalesDashboard';
import Receipt from './Receipt';
import PaymentModal from './PaymentModal';
import HRDashboardView from './HRDashboardView'; // [NEW]
import CashierView from './CashierView';
import OpenRegisterModal from './OpenRegisterModal';
import RegisterControlView from './RegisterControlView';
import EquipmentManager from './EquipmentManager';
import PublicReportView from './PublicReportView';
import ShiftHistory from './ShiftHistory';
import PrinterSettingsModal from './PrinterSettingsModal';
import { AuthModal, BrandingModal, ProductModal, CategoryManager, RoleManager, TableManager, ExpenseTypeManager, ServiceStartModal, ExpenseModal } from './Modals';
import ServiceCalculatorModal from './ServiceCalculatorModal';
import { MenuCard, PinLoginView, CredentialPrintView, PrintableView, AdminRow, AttendanceTicket } from './Views';

// Hooks & Contexts

import { useSales } from '../hooks/useSales';

export default function AppContent() {
    // 1. Context Consumption
    const { currentUser, staffMember, setStaffMember, isAuthModalOpen, setIsAuthModalOpen, login, logout, staffLogin, prepareCredentialPrint, credentialToPrint } = useAuth();
    const {
        items, staff, categories, roles, tables, expenseTypes, activeServices,
        logo, appName, autoLockTime, printerType, commissionTiers,
        isLoadingData, dbStatus,
        handleQuickUpdate, handleSaveItem, handleDeleteItem,
        handleAddStaff, handleUpdateStaff, handleDeleteStaff,
        handleAddCategory, handleRenameCategory, handleDeleteCategory,
        handleAddRole, handleRenameRole, handleDeleteRole,
        handleAddTable, handleRenameTable, handleDeleteTable,
        handleAddExpenseType, handleRenameExpenseType, handleDeleteExpenseType,
        handleSaveBranding, handleSavePrinterType
    } = useData();
    const {
        registerSession, sessionStats,
        isOpenRegisterModalOpen, setIsOpenRegisterModalOpen,
        checkRegisterStatus, openRegister, confirmCloseRegister,
        addExpense, deleteExpense, getCalculatedCash
    } = useRegister();
    const { processSale, voidOrder, createOrder } = useSales();

    // 2. Local UI State
    const [view, setView] = useState('landing');
    const [isPrinterSettingsOpen, setIsPrinterSettingsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [isExpenseTypeModalOpen, setIsExpenseTypeModalOpen] = useState(false);
    const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [filter, setFilter] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [pendingSale, setPendingSale] = useState(null);
    const [orderToPay, setOrderToPay] = useState(null);
    const [lastSale, setLastSale] = useState(null);
    const [isQuickEditMode, setIsQuickEditMode] = useState(false);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [reportId, setReportId] = useState(null);

    // 3. Computed Helpers
    const inventoryStats = useMemo(() => {
        let totalCost = 0;
        let totalRetail = 0;
        let totalItems = 0;
        const categoryCosts = {};

        items.forEach(item => {
            if (item.category === 'Servicios') return;
            // EXCLUIR COMBOS DEL CÁLCULO DE INVERSIÓN (Su costo es la suma de ingredientes, ya contados)
            if (item.category.toLowerCase() === 'combos') return;

            const stock = parseFloat(item.stock) || 0;
            const cost = parseFloat(item.cost) || 0;
            const price = parseFloat(item.price) || 0;

            if (stock > 0) {
                const itemTotalCost = stock * cost;
                totalCost += itemTotalCost;
                totalRetail += (stock * price);
                totalItems += stock;

                const cat = item.category || 'Otros';
                if (!categoryCosts[cat]) categoryCosts[cat] = 0;
                categoryCosts[cat] += itemTotalCost;
            }
        });

        const sortedCategories = Object.entries(categoryCosts)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total);

        return { totalCost, totalRetail, totalItems, sortedCategories };
    }, [items]);

    const [isStatsExpanded, setIsStatsExpanded] = useState(true);

    const filterCategories = ['Todos', ...categories];
    // v2.3 FIXED: Improved filtering logic with fresh variable names
    const itemsToDisplay = useMemo(() => {
        let result = items;
        if (filter !== 'Todos') {
            const cleanFilter = String(filter).trim().toUpperCase();
            result = result.filter(i => String(i.category || '').trim().toUpperCase() === cleanFilter);
        }
        if (searchTerm) {
            const cleanSearch = searchTerm.toLowerCase();
            result = result.filter(i => i.name.toLowerCase().includes(cleanSearch));
        }
        return result;
    }, [items, filter, searchTerm]);
    const isAdminMode = ['admin', 'report', 'staff_admin', 'cashier', 'register_control', 'maintenance', 'shift_history'].includes(view);
    const isCashierOnly = staffMember && staffMember.role === 'Cajero';

    // 4. Handler Adaptations
    const onLogin = (u) => { login(u); setTimeout(() => setView('admin'), 10); };
    const onLogout = () => logout();
    const handleEnterMenu = () => { setFilter('Todos'); setView('menu'); };
    const handleEnterStaff = () => setView('pin_login');
    const handleEnterAdmin = () => { if (currentUser && !currentUser.isAnonymous) setView('admin'); else setIsAuthModalOpen(true); };

    // Auth & Staff Logic
    const onStaffPinLogin = async (member) => {
        const result = await staffLogin(member);
        if (result) setView(result);
    };

    const handleClockAction = async (member, type) => {
        // Enforce Register Open Constraint
        if (!registerSession || registerSession.status !== 'open') {
            toast.error("⚠️ La caja debe estar ABIERTA para marcar asistencia.");
            return;
        }

        const success = await markAttendance(member, registerSession.id);
        if (success) {
            // Optional: Auto-login after clock-in if desired, or just stay on pin screen
            // For now, staying on pin screen is safer so others can clock in
        }
    };

    const onPrintCredential = (member) => {
        prepareCredentialPrint(member);
        setView('credential_print');
    };

    // Sales & Register Logic
    const handleOpenRegister = async (amount, activeTeam) => {
        const success = await openRegister(amount, activeTeam);
        if (success) setIsOpenRegisterModalOpen(false);
    };

    const handleAddExpenseWithReceipt = async (description, amount) => {
        const tId = toast.loading('Procesando gasto...');
        try {
            const success = await addExpense(description, amount);
            if (success) {
                toast.dismiss(tId);
                const expenseReceipt = {
                    type: 'expense',
                    businessName: appName,
                    date: new Date().toLocaleString(),
                    staffName: staffMember ? staffMember.name : 'Admin',
                    description: description,
                    amount: amount,
                    autoPrint: true
                };
                setLastSale(expenseReceipt);
                setView('receipt_view');
            } else {
                toast.dismiss(tId);
                // Error already shown by addExpense
            }
        } catch (err) {
            toast.dismiss(tId);
            console.error(err);
            toast.error("Error procesando recibo");
        }
    };


    const handleCloseRegisterAction = async () => {
        if (!registerSession) return;

        // 1. Calculate Expected Cash
        let cashFinal = (registerSession.openingAmount || 0) + sessionStats.cashSales - sessionStats.totalExpenses;
        let totalSalaries = 0;
        let totalCommissions = 0;
        let attendanceList = [];
        let commissionDetails = [];

        // 2. Fetch Attendance
        try {
            const attColl = isPersonalProject ? 'attendance' : `${ROOT_COLLECTION}attendance`;
            const qAtt = query(collection(db, attColl), where('registerId', '==', registerSession.id));
            const snapAtt = await getDocs(qAtt);
            attendanceList = snapAtt.docs.map(d => d.data());
        } catch (err) { console.error("Error fetching attendance:", err); }

        // 3. Calculate Commissions (Tiered Logic)
        try {
            // Find staff with commissions enabled
            const commissionedStaff = staff.filter(s => s.commissionEnabled);

            if (commissionedStaff.length > 0) {
                const salesColl = isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`;
                const qSales = query(collection(db, salesColl), where('registerId', '==', registerSession.id));
                const snapSales = await getDocs(qSales);

                const staffUtility = {}; // { staffName: utilityAmount }

                snapSales.forEach(doc => {
                    const sale = doc.data();
                    // Identify waiter. Priority: sale.staffName -> sale.waiterName -> 'Barra'
                    // We need to match precise names or IDs. Best to use staffName from sale which usually matches staff.name
                    const waiterName = sale.staffName;
                    if (waiterName && commissionedStaff.some(s => s.name === waiterName)) {
                        if (!staffUtility[waiterName]) staffUtility[waiterName] = 0;

                        // Calculate Utility for this sale
                        if (sale.items) {
                            sale.items.forEach(item => {
                                const price = parseFloat(item.price) || 0;
                                const cost = parseFloat(item.cost) || 0;
                                const qty = parseInt(item.qty) || 1;
                                // Only count profit if price > cost, else 0 or negative? usually profit is net
                                staffUtility[waiterName] += (price - cost) * qty;
                            });
                        }
                    }
                });

                // Apply Dynamic Tiers
                const tiers = commissionTiers || [
                    { max: 5000, rate: 0.05 },
                    { max: 5500, rate: 0.06 },
                    { max: 6000, rate: 0.07 },
                    { max: 999999, rate: 0.08 }
                ];

                Object.entries(staffUtility).forEach(([name, utility]) => {
                    // Find applicable tier
                    // Tiers should be sorted by max ASC. e.g. 5000, 5500, 6000.
                    // If utility is 5200:
                    // 5000 < 5200? yes, but we want the bracket it falls into?
                    // The rule is: 0-5000 (5%), 5001-5500 (6%).
                    // So we find the first tier where utility <= max.

                    const sortedTiers = [...tiers].sort((a, b) => a.max - b.max);
                    const tier = sortedTiers.find(t => utility <= t.max);
                    const rate = tier ? tier.rate : sortedTiers[sortedTiers.length - 1].rate;

                    const comm = utility * rate;
                    if (comm > 0) {
                        commissionDetails.push({ name, utility, rate, amount: comm });
                        totalCommissions += comm;
                    }
                });

            }
        } catch (err) { console.error("Error calculating Commissions:", err); }

        // 4. Sum Totals
        const baseSalaries = attendanceList.reduce((acc, curr) => acc + (parseFloat(curr.dailySalary) || 0), 0);
        totalSalaries = baseSalaries + totalCommissions;

        toast((t) => (
            <div className="flex flex-col gap-3 min-w-[300px]">
                <div className="border-b pb-3">
                    <p className="font-bold text-gray-800 text-lg mb-2">Resumen de Cierre</p>

                    {/* Salary Section */}
                    {totalSalaries > 0 && (
                        <div className="bg-yellow-50 p-3 rounded-lg mb-2 border border-yellow-100 text-xs">
                            <p className="text-yellow-800 font-bold uppercase mb-2 flex items-center gap-1"><Users size={12} /> Nómina & Comisiones</p>

                            {/* Breakdown */}
                            <div className="space-y-1 mb-2 border-b border-yellow-200 pb-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Salarios Fijos ({attendanceList.length}):</span>
                                    <span>Bs. {baseSalaries.toFixed(2)}</span>
                                </div>
                                {commissionDetails.map(c => (
                                    <div key={c.name} className="flex justify-between text-yellow-700 bg-yellow-100/50 px-1 rounded">
                                        <span>{c.name} ({(c.rate * 100).toFixed(0)}% de {c.utility.toFixed(0)}):</span>
                                        <span className="font-bold">Bs. {c.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-end pt-1">
                                <span className="font-bold text-gray-700">TOTAL A PAGAR:</span>
                                <span className="font-black text-yellow-600 text-lg">Bs. {totalSalaries.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-50 p-2 rounded mb-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded border border-gray-100"><span className="text-gray-500 block uppercase text-[10px]">Total QR</span><span className="font-bold text-blue-600 text-sm">Bs. {sessionStats.qrSales.toFixed(2)}</span></div>
                        <div className="bg-white p-2 rounded border border-gray-100"><span className="text-gray-500 block uppercase text-[10px]">Total Tarjeta</span><span className="font-bold text-purple-600 text-sm">Bs. {sessionStats.cardSales.toFixed(2)}</span></div>
                    </div>

                    <div className="px-2">
                        <p className="text-xs text-gray-500 uppercase font-bold">Efectivo en Caja (Antes de pagos):</p>
                        <p className="text-xl font-black text-gray-400">Bs. {cashFinal.toFixed(2)}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {totalSalaries > 0 && (
                        <button onClick={async () => {
                            toast.dismiss(t.id);
                            const toastId = toast.loading("Registrando pagos...");

                            // 1. Create Expense
                            try {
                                const expColl = isPersonalProject ? 'expenses' : `${ROOT_COLLECTION}expenses`;
                                await addDoc(collection(db, expColl), {
                                    amount: totalSalaries,
                                    reason: `Nómina Turno (Inc. Comisiones)`,
                                    type: 'Adelanto Sueldo',
                                    registerId: registerSession.id,
                                    timestamp: new Date().toISOString(),
                                    staffNames: attendanceList.map(a => a.staffName).join(', '),
                                    details: { base: baseSalaries, commissions: commissionDetails }
                                });

                                await new Promise(r => setTimeout(r, 1500));

                                const newCashFinal = cashFinal - totalSalaries;

                                const zReport = await confirmCloseRegister(newCashFinal);
                                if (zReport) {
                                    setLastSale(zReport);
                                    setView('receipt_view');
                                }
                                toast.dismiss(toastId);
                            } catch (error) {
                                toast.error("Error al procesar pago");
                                console.error(error);
                            }
                        }} className="bg-green-600 text-white px-4 py-3 rounded-lg text-xs font-bold shadow-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                            <DollarSign size={16} /> PAGAR Y CERRAR (Bs. {totalSalaries.toFixed(0)})
                        </button>
                    )}

                    <div className="flex gap-2">
                        <button onClick={async () => {
                            const zReport = await confirmCloseRegister(cashFinal);
                            if (zReport) {
                                setLastSale(zReport);
                                setView('receipt_view');
                            }
                            toast.dismiss(t.id);
                        }} className={`${totalSalaries > 0 ? 'bg-gray-100 text-gray-600' : 'bg-red-600 text-white'} px-4 py-3 rounded-lg text-xs font-bold shadow-sm flex-1 hover:opacity-80 transition-colors`}>
                            {totalSalaries > 0 ? 'Cerrar SIN Pagar' : 'CERRAR TURNO'}
                        </button>
                        <button onClick={() => toast.dismiss(t.id)} className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg text-xs font-bold flex-1 hover:bg-gray-300 transition-colors">CANCELAR</button>
                    </div>
                </div>
            </div>
        ), { duration: null, position: 'top-center', icon: null });
    };

    // Transaction Handlers
    const handleStartPaymentFromCashier = (order, clearCartCallback) => {
        if (!checkRegisterStatus(true)) return;
        setOrderToPay(order);
        setPendingSale({ cart: order.items, clearCart: clearCartCallback || (() => { }) });
        setIsPaymentModalOpen(true);
    };

    const handlePOSCheckout = (cart, clearCart) => {
        if (!checkRegisterStatus(true)) return;
        setOrderToPay(null);
        setPendingSale({ cart, clearCart });
        setIsPaymentModalOpen(true);
    };

    const handleFinalizeSale = async (paymentResult) => {
        const receipt = await processSale(paymentResult, orderToPay, pendingSale);
        if (receipt) {
            setLastSale(receipt);
            if (pendingSale && pendingSale.clearCart) pendingSale.clearCart([]);
            setPendingSale(null);
            setOrderToPay(null);
            setIsPaymentModalOpen(false);
            setView('receipt_view');
        }
    };

    const handleVoidAndPrint = async (order) => {
        const result = await voidOrder(order);
        if (result) {
            setLastSale(result);
            setView('receipt_view');
        }
    };

    // Generic Handlers
    const handleReceiptClose = () => {
        if (lastSale && lastSale.type === 'z-report') { setView('landing'); return; }
        const isCashier = (staffMember && (staffMember.role === 'Cajero' || staffMember.role === 'Administrador')) || (currentUser && !currentUser.isAnonymous);
        if (isCashier) { setView('cashier'); } else { setStaffMember(null); setView('landing'); }
    };

    // Printer
    const onSavePrinterFormat = (type) => {
        handleSavePrinterType(type);
        setIsPrinterSettingsOpen(false);
    }

    // Render Loading
    if (isLoadingData) return (<div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center animate-in fade-in duration-700"><Loader2 size={32} className="text-orange-500 animate-spin mb-4" /><h2 className="text-white font-bold text-xl tracking-widest uppercase mb-1">ZZIF System</h2></div>);
    if (view === 'public_report' && reportId) return <PublicReportView equipmentId={reportId} onExit={() => { window.history.pushState({}, '', '/'); setView('landing'); }} />;

    // Cleanup Function: NUKE CATEGORY (Nuclear Option)
    const handlePurgeDuplicates = async () => {
        if (filter === 'Todos') {
            toast.error("Para limpiar, selecciona primero una categoría específica.");
            return;
        }

        if (!window.confirm(`⚠️ PELIGRO EXTREMO ⚠️\n\n¿Estás SEGURO de que quieres eliminar TODOS los productos de la categoría "${filter}"?\n\nSe borrarán permanentemente y no se pueden recuperar.\n\nEsto es útil si la categoría tiene datos corruptos.`)) return;

        const confirmText = prompt(`Para confirmar, escribe: BORRAR ${filter.toUpperCase()}`);
        if (confirmText !== `BORRAR ${filter.toUpperCase()}`) {
            toast.error("Confirmación incorrecta. Cancelado.");
            return;
        }

        const itemsToDelete = itemsToDisplay.map(i => i.id);

        if (itemsToDelete.length === 0) {
            toast("La categoría ya está vacía.", { icon: '👻' });
            return;
        }

        toast.loading(`ELIMINANDO ${itemsToDelete.length} ITEMS (NO CIERRES)...`);

        let count = 0;
        let errors = 0;

        // Force sequential deletion with delay to ensure backend processes it
        for (const id of itemsToDelete) {
            try {
                await handleDeleteItem(id);
                count++;
            } catch (e) {
                console.error("Error deleting:", id, e);
                errors++;
            }
            // Tiny delay to breathe
            await new Promise(r => setTimeout(r, 50));
        }

        toast.dismiss();

        if (errors > 0) {
            alert(`Se eliminaron ${count} items, pero hubo ${errors} errores. Recomendamos reintentar.`);
        } else {
            alert(`✅ ÉXITO: Se eliminaron ${count} productos. \n\nEl sistema se reiniciará ahora para limpiar la memoria.`);
            window.location.reload(); // NUCLEAR RELOAD
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
            <Toaster position="top-center" reverseOrder={false} />

            {/* STATUS BAR */}
            {view !== 'landing' && (
                <div className={`w-full p-1 text-[10px] text-center font-bold text-white flex justify-center items-center gap-2 shadow-md sticky top-0 z-50 ${registerSession ? 'bg-green-600' : 'bg-red-600'}`}>
                    {registerSession ? (
                        <>
                            <Unlock size={12} /> <span className="uppercase">TURNO: {registerSession.openedBy} | Bs. {registerSession.openingAmount}</span>
                            {((staffMember && registerSession.openedBy === staffMember.name) || (currentUser && !currentUser.isAnonymous)) && (
                                <button onClick={handleCloseRegisterAction} className="ml-4 bg-black/20 hover:bg-black/40 px-3 py-0.5 rounded-full text-white flex items-center gap-1 transition-colors border border-white/30">
                                    <Lock size={10} /> Cerrar
                                </button>
                            )}
                        </>
                    ) : (
                        <><Lock size={12} /> CAJA CERRADA</>
                    )}
                </div>
            )}

            {view === 'landing' ? (
                <LandingPage appName={appName || 'Cargando...'} logo={logo} onSelectClient={handleEnterMenu} onSelectStaff={handleEnterStaff} onSelectAdmin={handleEnterAdmin} />
            ) : (
                <>
                    {/* HEADER */}
                    <header className="bg-white shadow-sm border-b border-gray-100 no-print">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                            <div className="flex items-center gap-3" onClick={() => isAdminMode && !isCashierOnly && setIsBrandingModalOpen(true)}>
                                <div className={`rounded-lg overflow-hidden flex items-center justify-center ${logo ? 'bg-white' : 'bg-orange-500 p-2 text-white'}`} style={{ width: '40px', height: '40px' }}>
                                    {logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain" /> : <ChefHat size={24} />}
                                </div>
                                <div><h1 className="text-lg font-bold text-gray-800 leading-none">{appName}</h1><span className="text-[10px] text-gray-500 font-medium uppercase">Cloud Menu</span></div>
                            </div>
                            <div className="flex items-center gap-2 header-buttons">
                                {isAdminMode && !isCashierOnly && <button onClick={handlePurgeDuplicates} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors" title="Limpiar Duplicados"><Trash2 size={20} /></button>}
                                <button onClick={() => setIsCalculatorOpen(true)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors" title="Cotizar Servicio"><Calculator size={20} /></button>
                                {!isAdminMode && <button aria-label="Ir al inicio" onClick={() => setView('landing')} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><Home size={20} /></button>}
                                {isAdminMode && <button aria-label="Cerrar sesión" onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-red-50 text-red-600"><LogOut size={16} />Salir</button>}
                            </div>
                        </div>
                    </header>

                    {/* MAIN CONTENT */}
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        {isAdminMode && (
                            <>
                                {/* ADMIN NAV */}
                                <div className="mb-6 no-print overflow-x-auto">
                                    <div className="flex border-b border-gray-200 min-w-max items-center">
                                        {!isCashierOnly && <button onClick={() => setView('admin')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'admin' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><ClipboardList size={18} /> Inventario</button>}
                                        <button onClick={() => setView('cashier')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'cashier' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><DollarSign size={18} /> Caja</button>
                                        <button onClick={() => { if (!registerSession) { toast.error("Abre la caja primero"); return; } setView('pos'); }} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 border-transparent text-green-600 hover:bg-green-50`}><Zap size={18} /> Venta Rápida</button>
                                        <button onClick={() => setView('register_control')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'register_control' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><Wallet size={18} /> Control Caja</button>

                                        <button onClick={() => setView('report')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'report' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><FileText size={18} /> Reporte</button>
                                        {!isCashierOnly && <button onClick={() => setView('maintenance')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'maintenance' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><Wrench size={18} /> Mantenimiento</button>}
                                        {!isCashierOnly && <button onClick={() => setView('shift_history')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'shift_history' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><Calendar size={18} /> Historial</button>}
                                    </div>
                                </div>

                                {/* DASHBOARD VIEW */}
                                {view === 'report' && <div className="animate-in fade-in"><SalesDashboard onReprintZ={(data) => { setLastSale(data); setView('receipt_view'); }} onConfigurePrinter={() => setIsPrinterSettingsOpen(true)} currentPrinterType={printerType} /><div className="hidden print:block mt-8"><PrintableView items={items} /></div></div>}

                                {/* CASHIER VIEW */}
                                {view === 'cashier' && (
                                    <CashierView
                                        activeServices={activeServices}
                                        onOpenServiceModal={() => setIsServiceModalOpen(true)}
                                        onProcessPayment={handleStartPaymentFromCashier}
                                        onVoidOrder={handleVoidAndPrint}
                                        onReprintOrder={(order) => { setLastSale({ ...order, type: 'order', businessName: appName }); setView('receipt_view'); }}
                                        onStopService={() => { /* Service logic is specific, leaving it to specialized components or context if refined */ }}
                                        onOpenExpense={() => setIsExpenseModalOpen(true)}
                                        onPrintReceipt={(doc) => {
                                            let reportData = { ...doc, businessName: appName };
                                            if (doc.type === 'z-report-preview') {
                                                reportData = {
                                                    type: 'z-report', // Use z-report type for Receipt component
                                                    businessName: appName,
                                                    date: new Date().toLocaleString(),
                                                    openedAt: registerSession?.openedAt,
                                                    openingAmount: registerSession?.openingAmount || 0,
                                                    finalCash: getCalculatedCash(),
                                                    stats: sessionStats,
                                                    soldProducts: sessionStats.soldProducts,
                                                    staffName: staffMember?.name || 'Cajero',
                                                    cashierName: staffMember?.name || 'Cajero',
                                                    status: 'preview'
                                                };
                                            }
                                            setLastSale(reportData);
                                            setView('receipt_view');
                                        }}
                                    />
                                )}

                                {/* OTHER ADMIN VIEWS */}
                                {/* OTHER ADMIN VIEWS */}
                                {view === 'register_control' && <RegisterControlView
                                    session={registerSession}
                                    onOpen={handleOpenRegister}
                                    onClose={handleCloseRegisterAction}
                                    staff={staff}
                                    stats={sessionStats}
                                    onAddExpense={handleAddExpenseWithReceipt}
                                    onDeleteExpense={deleteExpense}
                                    onReprintExpense={(ex) => {
                                        const expenseReceipt = {
                                            type: 'expense',
                                            businessName: appName,
                                            date: new Date(ex.date).toLocaleString(),
                                            staffName: ex.createdBy || 'Admin',
                                            description: ex.description,
                                            amount: ex.amount,
                                            autoPrint: true
                                        };
                                        setLastSale(expenseReceipt);
                                        setView('receipt_view');
                                    }}
                                />}
                                {view === 'maintenance' && <EquipmentManager staff={staff} registerSession={registerSession} />}
                                {view === 'shift_history' && !isCashierOnly && <ShiftHistory onReprint={(shift) => { setLastSale({ ...shift, type: 'z-report', finalCash: shift.finalCashCalculated, stats: shift.finalSalesStats, businessName: appName, date: new Date(shift.closedAt).toLocaleString() }); setView('receipt_view'); }} />}



                                {/* INVENTORY/ADMIN HOME */}
                                {view === 'admin' && !isCashierOnly && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between"><div><p className="text-xs text-gray-500 uppercase font-bold">Inversión (Costo)</p><p className="text-2xl font-black text-blue-600">Bs. {inventoryStats.totalCost.toFixed(2)}</p></div><div className="p-3 bg-blue-50 rounded-full text-blue-600"><DollarSign size={24} /></div></div>
                                            <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center justify-between"><div><p className="text-xs text-gray-500 uppercase font-bold">Venta Potencial</p><p className="text-2xl font-black text-green-600">Bs. {inventoryStats.totalRetail.toFixed(2)}</p></div><div className="p-3 bg-green-50 rounded-full text-green-600"><TrendingUp size={24} /></div></div>
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"><div><p className="text-xs text-gray-500 uppercase font-bold">Total Unidades</p><p className="text-2xl font-black text-gray-800">{inventoryStats.totalItems}</p></div><div className="p-3 bg-gray-100 rounded-full text-gray-600"><Package size={24} /></div></div>
                                        </div>

                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-all">
                                            <div
                                                className="flex justify-between items-center cursor-pointer select-none"
                                                onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                                            >
                                                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><PieChart size={14} /> Desglose de Inversión por Categoría</h3>
                                                {isStatsExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                            </div>

                                            {isStatsExpanded && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                                                    {inventoryStats.sortedCategories.map(cat => (
                                                        <div key={cat.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                            <span className="font-bold text-gray-600 text-sm truncate pr-2">{cat.name}</span>
                                                            <span className="font-mono font-bold text-blue-600 text-sm whitespace-nowrap">Bs. {cat.total.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                                            <div className="flex gap-2">
                                                <button onClick={() => setView('hr_dashboard')} className="px-4 py-2.5 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-gray-200" title="Recursos Humanos"><Users size={18} /> RR.HH.</button>
                                                <div className="w-px h-8 bg-gray-200 mx-1"></div>
                                                <button onClick={() => setIsBrandingModalOpen(true)} className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="Configuración Global"><Settings size={20} /></button>
                                                <button onClick={() => setIsPrinterSettingsOpen(true)} className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100 transition-colors" title="Configurar Impresora"><Printer size={20} /></button>
                                                <button onClick={() => setIsTableModalOpen(true)} className="p-2.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 border border-purple-100 transition-colors" title="Gestionar Mesas"><LayoutGrid size={20} /></button>
                                                <button onClick={() => setIsExpenseTypeModalOpen(true)} className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 transition-colors" title="Tipos de Gasto"><DollarSign size={20} /></button>
                                                <button onClick={() => setIsCategoryModalOpen(true)} className="p-2.5 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 border border-yellow-100 transition-colors" title="Gestionar Categorías"><Filter size={20} /></button>
                                                <button onClick={() => setIsQuickEditMode(!isQuickEditMode)} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${isQuickEditMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{isQuickEditMode ? '⚡ EDICIÓN ACTIVA' : '⚡ Edición Rápida'}</button>
                                            </div>
                                            <div className="relative w-full md:w-64">
                                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                                <input type="text" placeholder="Buscar producto..." className="w-full pl-10 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-black"><X size={16} /></button>}
                                            </div>

                                            <button onClick={() => { setCurrentItem(null); setIsModalOpen(true); }} className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold shadow hover:bg-green-700 transition-colors flex items-center gap-2"><Plus size={20} /> NUEVO</button>
                                        </div>
                                        <div className="relative group">
                                            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide snap-x">
                                                {filterCategories.map(cat => (
                                                    <button key={cat} onClick={() => setFilter(cat)} className={`flex-none snap-start px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm border ${filter === cat ? 'bg-black text-white border-black ring-2 ring-offset-2 ring-gray-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>{cat}</button>
                                                ))}
                                            </div>
                                            <div className="absolute top-0 right-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none md:hidden"></div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow border overflow-hidden" key={filter}>
                                            <table className="w-full text-left">
                                                <thead><tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200"><th className="p-4 text-center">Imagen</th><th className="p-4">Producto</th><th className="p-4 text-center">Stock</th><th className="p-4 text-right">Costo</th><th className="p-4 text-right">Precio</th><th className="p-4 text-right">Margen</th><th className="p-4 text-right">Acciones</th></tr></thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {itemsToDisplay.length > 0 ? (
                                                        itemsToDisplay.map(item => (<AdminRow key={item.id} item={item} allItems={items} onEdit={(i) => { setCurrentItem(i); setIsModalOpen(true); }} onDelete={handleDeleteItem} isQuickEdit={isQuickEditMode} onQuickUpdate={handleQuickUpdate} />))
                                                    ) : (
                                                        <tr><td colSpan="6" className="p-8 text-center text-gray-400">No se encontraron productos en "{filter}".</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* CREDENTIAL PRINT VIEW (Global Access) */}
                        {view === 'credential_print' && (
                            <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 animate-in fade-in">
                                {credentialToPrint ? (
                                    <>
                                        <div className="w-full p-4 flex justify-center gap-4 no-print fixed top-0 left-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
                                            <button onClick={() => setView('hr_dashboard')} className="flex items-center gap-2 px-6 py-2 bg-white text-gray-700 rounded-full border border-gray-300 shadow-sm hover:bg-gray-50 font-bold transition-all hover:scale-105">
                                                <ArrowLeft size={18} /> Volver
                                            </button>
                                            <button onClick={() => window.print()} className="flex items-center gap-2 px-8 py-2 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 font-bold transition-all hover:scale-105 hover:shadow-xl">
                                                <Printer size={18} /> IMPRIMIR
                                            </button>
                                        </div>
                                        <div className="pt-24 scale-[1.3] transform origin-top"> {/* Scale up for better visibility */}
                                            <CredentialPrintView member={credentialToPrint} appName={appName} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-8">
                                        <p className="text-gray-500 mb-4">No se ha seleccionado empleado.</p>
                                        <button onClick={() => setView('hr_dashboard')} className="text-blue-600 underline font-bold">Volver</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ATTENDANCE TICKET VIEW */}
                        {view === 'attendance_print' && lastSale && ( // Reusing lastSale to store attendance data temporarily
                            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 animate-in fade-in">
                                <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center gap-6">
                                    <h2 className="text-2xl font-bold text-green-600 flex items-center gap-2"><Check size={32} /> ¡Asistencia Registrada!</h2>
                                    <div className="scale-100 border border-gray-200 shadow-sm">
                                        <AttendanceTicket data={lastSale} />
                                    </div>
                                    <div className="flex gap-4 w-full">
                                        <button onClick={() => { setView('landing'); setLastSale(null); }} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200">
                                            Volver
                                        </button>
                                        <button onClick={() => window.print()} className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 flex items-center justify-center gap-2">
                                            <Printer size={20} /> Imprimir Ticket
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400">Imprimiendo ticket de control...</p>
                                </div>
                            </div>
                        )}

                        {/* PIN LOGIN VIEW */}
                        {view === 'pin_login' && (
                            <PinLoginView
                                staffMembers={staff}
                                onLoginSuccess={onStaffPinLogin}
                                onClockAction={handleClockAction}
                                onCancel={() => setView('landing')}
                                onScan={async (member) => {
                                    // GLOBAL AUTO-SCAN LOGIC
                                    // 1. If Register Open -> Check Attendance
                                    if (registerSession && registerSession.status === 'open') {
                                        try {
                                            const attColl = isPersonalProject ? 'attendance' : `${ROOT_COLLECTION}attendance`;
                                            const q = query(collection(db, attColl), where('registerId', '==', registerSession.id), where('staffId', '==', member.id));
                                            const snap = await getDocs(q);

                                            if (snap.empty) {
                                                // FIRST TIME TODAY -> CLOCK IN AND PRINT
                                                toast.success(`¡Bienvenido, ${member.name}! Imprimiendo ticket...`);

                                                // Create record directly here or via context
                                                const record = {
                                                    staffId: member.id,
                                                    staffName: member.name,
                                                    registerId: registerSession.id,
                                                    role: member.role,
                                                    timestamp: new Date().toISOString(),
                                                    dailySalary: parseFloat(member.dailySalary || 0),
                                                    type: 'clock-in'
                                                };

                                                await addDoc(collection(db, attColl), record);

                                                // Show Ticket View
                                                setLastSale(record); // Using lastSale slot for convenience
                                                setView('attendance_print');

                                                // Auto Print after delay
                                                setTimeout(() => window.print(), 500);
                                                return;
                                            }
                                        } catch (e) {
                                            console.error("Auto Checkin Error", e);
                                        }
                                    }

                                    // 2. YA REGISTRADO -> Comportamiento según Rol
                                    // Si es Mesero/Cajero/Admin -> Entrar al sistema (POS/Caja)
                                    // Si es Cocina/Otro -> Solo mostrar mensaje "Ya registrado"
                                    const operationalRoles = ['Mesero', 'Garzon', 'Garzón', 'Cajero', 'Administrador'];

                                    if (operationalRoles.includes(member.role)) {
                                        onStaffPinLogin(member);
                                    } else {
                                        toast("📅 Ya registraste tu asistencia hoy.", {
                                            icon: '✅',
                                            style: { borderRadius: '10px', background: '#333', color: '#fff' }
                                        });
                                    }
                                }}
                            />
                        )}

                        {/* POS VIEW */}
                        {view === 'pos' && (
                            <POSInterface
                                items={items} categories={categories} staffMember={staffMember}
                                onCheckout={handlePOSCheckout}
                                onPrintOrder={async (cart, clearCart) => {
                                    const receipt = await createOrder(cart, clearCart);
                                    if (receipt) {
                                        setLastSale(receipt);
                                        setView('receipt_view');
                                    }
                                }}
                                onExit={() => {
                                    const isCashier = (staffMember && (staffMember.role === 'Cajero' || staffMember.role === 'Administrador')) || (currentUser && !currentUser.isAnonymous);
                                    if (isCashier) setView('cashier'); else setView('landing');
                                }}
                                onPrintReceipt={(order) => { setLastSale(order); setView('receipt_view'); }}
                                onOpenServiceModal={() => setIsServiceModalOpen(true)}
                                autoLockTime={autoLockTime}
                            />
                        )}

                        {/* RECEIPT VIEW */}
                        {view === 'receipt_view' && <Receipt data={lastSale} onPrint={() => window.print()} onClose={handleReceiptClose} printerType={printerType} />}

                        {/* HR DASHBOARD */}
                        {view === 'hr_dashboard' && (
                            <HRDashboardView
                                staff={staff}
                                roles={roles}
                                onAddStaff={handleAddStaff}
                                onUpdateStaff={handleUpdateStaff}
                                onDeleteStaff={handleDeleteStaff}
                                onManageRoles={() => setIsRoleModalOpen(true)}
                                onPrintCredential={onPrintCredential}
                                onBack={() => setView('admin')}
                            />
                        )}

                        {/* MENU VIEW */}
                        {view === 'menu' && (
                            <>{/* ... MENÚ CLIENTES ... */}<div className="fixed inset-0 z-0 pointer-events-none bg-[#0a0a0a]"><div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-red-600/20 blur-[100px] rotate-45 animate-pulse"></div><div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-green-600/20 blur-[100px] rotate-[-45] animate-pulse delay-500"></div><div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px', animation: 'snowfallNative 10s linear infinite', opacity: 0.3 }}></div><style jsx>{`@keyframes snowfallNative { from {background-position: 0 0;} to {background-position: 20px 100vh;} }`}</style></div>{filter === 'Todos' ? (<div className="animate-in fade-in pb-20 relative z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-6"><button onClick={() => setView('landing')} className="absolute top-4 left-4 z-50 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition-all" title="Salir del Menú"><Home size={24} /></button><div className="text-center mb-10 mt-4"><div className="flex items-center justify-center gap-3 mb-2"><Trees size={28} className="text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" /><h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-white to-green-400 tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] uppercase">NUESTRO MENÚ</h2><Trees size={28} className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] scale-x-[-1]" /></div><p className="text-gray-400 font-bold uppercase tracking-widest text-sm flex justify-center items-center gap-2 before:h-px before:w-6 before:bg-red-500 after:h-px after:w-6 after:bg-green-500 opacity-80"><Gift size={14} className="text-red-400" /> Selecciona una categoría <Gift size={14} className="text-green-400" /></p></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2 max-w-5xl mx-auto">{categories.map((cat, index) => { const borderColors = ['border-red-500/60 shadow-[0_0_15px_-3px_rgba(220,38,38,0.5)] text-red-100', 'border-green-500/60 shadow-[0_0_15px_-3px_rgba(34,197,94,0.5)] text-green-100', 'border-yellow-500/60 shadow-[0_0_15px_-3px_rgba(234,179,8,0.5)] text-yellow-100', 'border-purple-500/60 shadow-[0_0_15px_-3px_rgba(168,85,247,0.5)] text-purple-100']; const currentStyle = borderColors[index % borderColors.length]; return (<button key={cat} onClick={() => setFilter(cat)} className={`relative h-40 rounded-3xl overflow-hidden bg-black/60 backdrop-blur-md group border-2 border-dashed transition-all duration-500 hover:scale-[1.03] active:scale-95 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] ${currentStyle}`}><div className={`absolute top-2 left-2 w-2 h-2 rounded-full animate-pulse ${index % 2 ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-green-500 shadow-[0_0_5px_green]'}`}></div><div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full animate-pulse delay-500 ${index % 3 ? 'bg-blue-500 shadow-[0_0_5px_blue]' : 'bg-yellow-500 shadow-[0_0_5px_yellow]'}`}></div><div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4"><Gift size={20} className={`mb-2 opacity-50 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_5px_currentColor] ${index % 2 ? 'text-green-400' : 'text-red-400'}`} /><span className="font-black text-2xl uppercase tracking-wider drop-shadow-md text-center">{cat}</span></div></button>) })}</div></div>) : (<div className="animate-in slide-in-from-right duration-300 relative z-10 min-h-screen -mx-4 sm:-mx-6 lg:-mx-8"><div className="sticky top-16 z-20 bg-black/70 backdrop-blur-xl py-4 mb-6 border-b border-white/10 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)] px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-4 max-w-7xl mx-auto"><button aria-label="Volver al menú" onClick={() => setFilter('Todos')} className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 border border-white/10 shadow-lg transition-transform active:scale-90 group backdrop-blur-md"><ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" /></button><div><h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 uppercase tracking-wide leading-none drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]">{filter}</h2><p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1"><Trees size={10} className="text-green-500" /> Explora nuestros productos</p></div></div></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">{filteredItems.length > 0 ? (filteredItems.map(item => (<div key={item.id} className="rounded-2xl overflow-hidden p-1 bg-gradient-to-br from-white/10 to-transparent border border-white/5 shadow-lg"><MenuCard item={item} /></div>))) : (<div className="col-span-full text-center py-20 text-gray-500 flex flex-col items-center"><Search size={48} className="mb-2 opacity-20 text-white" /><p className="text-gray-400">No hay productos en esta categoría.</p></div>)}</div></div>)}</>
                        )}
                    </main>

                    {/* FOOTER */}
                    <div className={`fixed bottom-0 w-full p-1 text-[10px] text-center text-white ${dbStatus === 'connected' ? 'bg-green-600' : 'bg-red-600'}`}> {dbStatus === 'connected' ? 'Sistema Online' : 'Desconectado'} </div>
                </>
            )}

            {/* SHARED MODALS */}
            <OpenRegisterModal isOpen={isOpenRegisterModalOpen} onClose={() => { }} onOpenRegister={handleOpenRegister} />
            <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} total={orderToPay ? orderToPay.total : (pendingSale ? pendingSale.cart.reduce((acc, i) => acc + (i.price * i.qty), 0) : 0)} onConfirm={handleFinalizeSale} />
            <PrinterSettingsModal isOpen={isPrinterSettingsOpen} onClose={() => setIsPrinterSettingsOpen(false)} currentType={printerType} onSelect={onSavePrinterFormat} />

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setCurrentItem(null); }}
                onSave={async (data) => {
                    const idToUpdate = currentItem ? currentItem.id : null;
                    await handleSaveItem(data, idToUpdate);
                    setIsModalOpen(false);
                    setCurrentItem(null);
                }}
                item={currentItem}
                categories={categories}
                items={items}
            />

            <CategoryManager isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={categories} onAdd={handleAddCategory} onRename={handleRenameCategory} onDelete={handleDeleteCategory} />
            <RoleManager isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} roles={roles} onAdd={handleAddRole} onRename={handleRenameRole} onDelete={handleDeleteRole} />
            <TableManager isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} tables={tables} onAdd={handleAddTable} onRename={handleRenameTable} onDelete={handleDeleteTable} />
            <ExpenseTypeManager isOpen={isExpenseTypeModalOpen} onClose={() => setIsExpenseTypeModalOpen(false)} expenseTypes={expenseTypes} onAdd={handleAddExpenseType} onRename={handleRenameExpenseType} onDelete={handleDeleteExpenseType} />
            <BrandingModal isOpen={isBrandingModalOpen} onClose={() => setIsBrandingModalOpen(false)} onSave={handleSaveBranding} currentLogo={logo} currentName={appName} currentAutoLock={autoLockTime} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={onLogin} />
            <ServiceStartModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} services={items.filter(i => i.category === 'Servicios')} onStart={() => { /* Service start logic */ }} occupiedLocations={activeServices.map(s => s.note)} />
            <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSave={handleAddExpenseWithReceipt} expenseTypes={expenseTypes} />

            <ServiceCalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
        </div >
    );
}
