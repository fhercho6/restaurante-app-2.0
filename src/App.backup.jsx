// src/App.jsx - VERSIÓN COMPLETA (Historial + Calculadora + Combos listos)
import React, { useState, useEffect, useMemo } from 'react';
import { Wifi, WifiOff, Home, LogOut, User, ClipboardList, Users, FileText, Printer, Settings, Plus, Edit2, Search, ChefHat, DollarSign, ArrowLeft, Lock, Unlock, Wallet, Loader2, LayoutGrid, Gift, Trees, TrendingUp, Package, AlertCircle, Filter, X, FileSpreadsheet, Zap, Wrench, Calendar, PieChart, Calculator } from 'lucide-react';
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { collection, doc, setDoc, addDoc, deleteDoc, onSnapshot, updateDoc, query, where, limit, getDocs } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

import { auth, db, ROOT_COLLECTION, isPersonalProject } from './config/firebase';
import LandingPage from './components/LandingPage';
import POSInterface from './components/POSInterface';
import StaffManagerView from './components/StaffManagerView';
import SalesDashboard from './components/SalesDashboard';
import Receipt from './components/Receipt';
import PaymentModal from './components/PaymentModal';
import CashierView from './components/CashierView';
import OpenRegisterModal from './components/OpenRegisterModal';
import RegisterControlView from './components/RegisterControlView';
import EquipmentManager from './components/EquipmentManager';
import PublicReportView from './components/PublicReportView';
import ShiftHistory from './components/ShiftHistory'; // <--- 1. HISTORIAL

import { AuthModal, BrandingModal, ProductModal, CategoryManager, RoleManager, TableManager, ExpenseTypeManager, ServiceStartModal, ExpenseModal } from './components/Modals';

import ServiceCalculatorModal from './components/ServiceCalculatorModal'; // <--- 2. CALCULADORA

import { MenuCard, PinLoginView, CredentialPrintView, PrintableView, AdminRow } from './components/Views';

const INITIAL_CATEGORIES = ['Bebidas', 'Comidas', 'Servicios', 'Combos'];
const INITIAL_ROLES = ['Garzón', 'Cajero', 'Cocinero', 'Administrador'];
const INITIAL_TABLES = ['Barra', 'Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'VIP 1'];
const INITIAL_EXPENSE_TYPES = ['Hielo', 'Taxi', 'Insumos', 'Limpieza', 'Adelanto Sueldo', 'Proveedores'];

const PrinterSettingsModal = ({ isOpen, onClose, currentType, onSelect }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-gray-900 p-4 text-white flex justify-between items-center"><h3 className="font-bold flex items-center gap-2"><Printer size={20} /> Configurar Impresora</h3><button onClick={onClose}><X size={20} /></button></div>
        <div className="p-6 text-center">
          <p className="text-gray-500 mb-4 text-sm font-bold uppercase">Seleccione el formato de impresión</p>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onSelect('thermal')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${currentType === 'thermal' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}><Printer size={40} /><div className="text-center"><span className="block font-black text-sm">TÉRMICA (Ticket)</span><span className="text-[10px]">80mm / 58mm</span></div></button>
            <button onClick={() => onSelect('letter')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${currentType === 'letter' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}><FileSpreadsheet size={40} /><div className="text-center"><span className="block font-black text-sm">CARTA / A4</span><span className="text-[10px]">Reporte Contable</span></div></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [expenseTypes, setExpenseTypes] = useState(INITIAL_EXPENSE_TYPES);
  const [autoLockTime, setAutoLockTime] = useState(45);
  const [printerType, setPrinterType] = useState('thermal');
  const [isPrinterSettingsOpen, setIsPrinterSettingsOpen] = useState(false);
  const [activeServices, setActiveServices] = useState([]);
  const [dbStatus, setDbStatus] = useState('connecting');
  const [logo, setLogo] = useState(null);
  const [appName, setAppName] = useState("");
  const [registerSession, setRegisterSession] = useState(null);
  const [isOpenRegisterModalOpen, setIsOpenRegisterModalOpen] = useState(false);
  const [sessionStats, setSessionStats] = useState({ cashSales: 0, qrSales: 0, cardSales: 0, digitalSales: 0, totalExpenses: 0, totalCostOfGoods: 0, courtesyTotal: 0, courtesyCost: 0, expensesList: [], soldProducts: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isExpenseTypeModalOpen, setIsExpenseTypeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [filter, setFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [credentialToPrint, setCredentialToPrint] = useState(null);
  const [staffMember, setStaffMember] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingSale, setPendingSale] = useState(null);
  const [orderToPay, setOrderToPay] = useState(null);
  const [lastSale, setLastSale] = useState(null);
  const [isQuickEditMode, setIsQuickEditMode] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const [reportId, setReportId] = useState(null);

  const inventoryStats = useMemo(() => {
    let totalCost = 0;
    let totalRetail = 0;
    let totalItems = 0;
    const categoryCosts = {};

    items.forEach(item => {
      if (item.category === 'Servicios') return;

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

  const getCollName = (type) => { if (type === 'items') return isPersonalProject ? 'menuItems' : `${ROOT_COLLECTION}menuItems`; if (type === 'staff') return isPersonalProject ? 'staffMembers' : `${ROOT_COLLECTION}staffMembers`; return isPersonalProject ? 'settings' : `${ROOT_COLLECTION}settings`; };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reportParam = params.get('report');
    if (reportParam) {
      setReportId(reportParam);
      setView('public_report');
    }
  }, []);

  const handleLogin = (userApp) => { setIsAuthModalOpen(false); toast.success(`Bienvenido`); setTimeout(() => setView('admin'), 10); };
  const handleLogout = async () => { await signOut(auth); window.location.reload(); };
  const handleEnterMenu = () => { setFilter('Todos'); setView('menu'); };
  const handleEnterStaff = () => setView('pin_login');
  const handleEnterAdmin = () => { if (currentUser && !currentUser.isAnonymous) setView('admin'); else setIsAuthModalOpen(true); };
  const handlePrintCredential = (member) => { if (!member) { toast.error("Error: Empleado no válido"); return; } setCredentialToPrint(member); setView('credential_print'); };
  const handlePrint = () => window.print();
  const handleStaffPinLogin = async (member) => { const newSessionId = Date.now().toString() + Math.floor(Math.random() * 1000); try { await updateDoc(doc(db, getCollName('staff'), member.id), { activeSessionId: newSessionId }); const memberWithSession = { ...member, activeSessionId: newSessionId }; setStaffMember(memberWithSession); if (member.role === 'Cajero' || member.role === 'Administrador') { setView('cashier'); toast.success(`Caja abierta: ${member.name}`); } else { setView('pos'); toast.success(`Turno iniciado: ${member.name}`); } } catch (error) { toast.error("Error de conexión al iniciar sesión"); } };
  const handleClockAction = async (member, type) => { try { const timestamp = new Date(); const logData = { staffId: member.id, staffName: member.name, type: type, timestamp: timestamp.toISOString(), dateStr: timestamp.toLocaleDateString() }; await addDoc(collection(db, isPersonalProject ? 'attendance_logs' : `${ROOT_COLLECTION}attendance_logs`), logData); toast.success(type === 'entry' ? 'Bienvenido' : 'Hasta luego', { icon: type === 'entry' ? '⏰' : '👋' }); if (type === 'exit') setView('landing'); } catch (error) { toast.error("Error al registrar"); } };
  const handleQuickUpdate = async (id, field, value) => { try { let valToSave = value; if (field === 'price' || field === 'cost') { valToSave = parseFloat(value); if (isNaN(valToSave)) valToSave = 0; } if (field === 'stock') { valToSave = parseInt(value); if (isNaN(valToSave)) valToSave = 0; } await updateDoc(doc(db, getCollName('items'), id), { [field]: valToSave }); toast.success('Actualizado', { icon: '💾', duration: 1000 }); } catch (error) { toast.error('Error al actualizar'); } };
  const handleSavePrinterType = (type) => { setPrinterType(type); setDoc(doc(db, getCollName('settings'), 'branding'), { printerType: type }, { merge: true }); setIsPrinterSettingsOpen(false); toast.success(`Formato: ${type === 'thermal' ? 'Ticket' : 'Carta'}`); };
  const handleSaveBranding = (l, n, t) => { setPrinterType(printerType); setDoc(doc(db, getCollName('settings'), 'branding'), { logo: l, appName: n, autoLockTime: t, printerType: printerType }, { merge: true }); setLogo(l); setAppName(n); setAutoLockTime(t); toast.success('Marca y Configuración actualizadas'); };

  useEffect(() => { const initAuth = async () => { if (!auth.currentUser) await signInAnonymously(auth); }; initAuth(); return onAuthStateChanged(auth, (u) => { setCurrentUser(u); if (u) setDbStatus('connected'); }); }, []);
  useEffect(() => { if (!db || !currentUser) return; const q = query(collection(db, isPersonalProject ? 'cash_registers' : `${ROOT_COLLECTION}cash_registers`), where('status', '==', 'open'), limit(1)); getDocs(q).then(s => { if (!s.empty) setRegisterSession({ id: s.docs[0].id, ...s.docs[0].data() }); }); }, [db, currentUser]);
  useEffect(() => { if (!db || !currentUser) return; const unsub1 = onSnapshot(collection(db, getCollName('items')), (s) => setItems(s.docs.map(d => ({ id: d.id, ...d.data() })))); const unsub2 = onSnapshot(collection(db, getCollName('staff')), (s) => setStaff(s.docs.map(d => ({ id: d.id, ...d.data() })))); const unsub3 = onSnapshot(collection(db, getCollName('settings')), (s) => { s.docs.forEach(d => { const dt = d.data(); if (d.id === 'categories') setCategories(dt.list); if (d.id === 'roles') setRoles(dt.list); if (d.id === 'tables') setTables(dt.list); if (d.id === 'expenses') setExpenseTypes(dt.list); if (d.id === 'branding') { setLogo(dt.logo); setAppName(dt.appName); setAutoLockTime(dt.autoLockTime); if (dt.printerType) setPrinterType(dt.printerType); } }); setIsLoadingApp(false); }); const unsub4 = onSnapshot(collection(db, isPersonalProject ? 'active_services' : `${ROOT_COLLECTION}active_services`), (s) => setActiveServices(s.docs.map(d => ({ id: d.id, ...d.data() })))); return () => { unsub1(); unsub2(); unsub3(); unsub4(); }; }, [currentUser]);
  useEffect(() => { if (!db || !registerSession) return; const qS = query(collection(db, salesCol = isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`), where('registerId', '==', registerSession.id)); const qE = query(collection(db, isPersonalProject ? 'expenses' : `${ROOT_COLLECTION}expenses`), where('registerId', '==', registerSession.id)); const uS = onSnapshot(qS, (s) => { let c = 0, q = 0, k = 0, d = 0, ct = 0, cc = 0, cg = 0; const pm = {}; s.forEach(d => { const v = d.data(); const ic = v.payments?.some(p => p.method === 'Cortesía'); if (!ic) { if (v.payments) { v.payments.forEach(p => { const a = parseFloat(p.amount); const m = (p.method || '').toLowerCase(); if (m.includes('efectivo')) c += a; else if (m.includes('qr')) q += a; else k += a; }); if (v.changeGiven) c -= parseFloat(v.changeGiven); } else { const t = parseFloat(v.total); const m = (v.paymentMethod || '').toLowerCase(); if (m.includes('efectivo')) c += t; else if (m.includes('qr')) q += t; else k += t; } } if (v.items) v.items.forEach(i => { const kn = i.name; const qt = i.qty; const pr = parseFloat(i.price); const co = parseFloat(i.cost) || 0; if (ic) { ct += (pr * qt); cc += (co * qt); } else { cg += (co * qt); } if (!pm[kn]) pm[kn] = { name: kn, qty: 0, qtyCourtesy: 0, total: 0, totalCost: 0 }; if (ic) { pm[kn].qtyCourtesy += qt; } else { pm[kn].qty += qt; pm[kn].total += (pr * qt); } pm[kn].totalCost += (co * qt); }); }); setSessionStats(prev => ({ ...prev, cashSales: c, qrSales: q, cardSales: k, digitalSales: q + k, totalCostOfGoods: cg, courtesyTotal: ct, courtesyCost: cc, soldProducts: Object.values(pm).sort((a, b) => b.qty - a.qty) })); }); const uE = onSnapshot(qE, (s) => { let te = 0; const el = []; s.forEach(d => { const e = d.data(); te += parseFloat(e.amount); el.push(e); }); setSessionStats(prev => ({ ...prev, totalExpenses: te, expensesList: el })); }); return () => { uS(); uE(); }; }, [registerSession]);
  var salesCol;

  const checkRegisterStatus = (requireOwnership = false) => { if (registerSession) { const isAdmin = currentUser && !currentUser.isAnonymous; const isOwner = staffMember && registerSession.openedBy === staffMember.name; if (requireOwnership && !isAdmin && !isOwner) { toast.error(`⛔ ACCESO DENEGADO\nTurno de: ${registerSession.openedBy}`, { duration: 5000 }); return false; } return true; } const canOpenRegister = (currentUser && !currentUser.isAnonymous) || (staffMember && (staffMember.role === 'Cajero' || staffMember.role === 'Administrador')); if (canOpenRegister) setIsOpenRegisterModalOpen(true); else toast.error("⚠️ LA CAJA ESTÁ CERRADA.", { icon: '🔒' }); return false; };
  const handleOpenRegister = async (amount, activeTeam = []) => { try { const sessionData = { status: 'open', openedBy: staffMember ? staffMember.name : (currentUser?.email || 'Admin'), openedAt: new Date().toISOString(), openingAmount: amount, activeTeam: activeTeam, salesTotal: 0 }; const docRef = await addDoc(collection(db, isPersonalProject ? 'cash_registers' : `${ROOT_COLLECTION}cash_registers`), sessionData); setRegisterSession({ id: docRef.id, ...sessionData }); setIsOpenRegisterModalOpen(false); toast.success(`Turno Abierto`); } catch (error) { toast.error("Error al abrir caja"); } };
  const handleStartService = async (service, note) => { if (!checkRegisterStatus(false)) return; try { await addDoc(collection(db, isPersonalProject ? 'active_services' : `${ROOT_COLLECTION}active_services`), { serviceName: service.name, pricePerHour: service.price, startTime: new Date().toISOString(), note: note, staffName: staffMember ? staffMember.name : 'Admin', registerId: registerSession.id }); setIsServiceModalOpen(false); const infoTicket = { type: 'order', businessName: appName, date: new Date().toLocaleString(), staffName: staffMember ? staffMember.name : 'Mesero', orderId: 'INI-SRV', items: [{ id: 'srv-start', name: `⏱️ INICIO: ${service.name} (${note})`, price: 0, qty: 1 }], total: 0, autoPrint: true }; setLastSale(infoTicket); setView('receipt_view'); toast.success("Servicio iniciado"); } catch (e) { toast.error("Error al iniciar servicio"); } };
  const handleStopService = async (service, cost, timeLabel) => { if (!checkRegisterStatus(true)) return; if (!window.confirm(`¿Detener ${service.serviceName}?\nCosto: Bs. ${cost.toFixed(2)}`)) return; try { await deleteDoc(doc(db, isPersonalProject ? 'active_services' : `${ROOT_COLLECTION}active_services`, service.id)); await addDoc(collection(db, isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`), { date: new Date().toISOString(), staffId: staffMember ? staffMember.id : 'anon', staffName: service.staffName || 'Sistema', orderId: 'SRV-' + Math.floor(Math.random() * 1000), items: [{ id: 'srv-' + Date.now(), name: `${service.serviceName} (${timeLabel})`, price: cost, qty: 1, category: 'Servicios' }], total: cost, status: 'pending' }); toast.success("Servicio detenido."); } catch (e) { toast.error("Error al detener servicio"); } };
  const handleAddExpense = async (description, amount) => { if (!registerSession) return; try { const expenseData = { registerId: registerSession.id, description, amount, date: new Date().toISOString(), createdBy: staffMember ? staffMember.name : 'Admin' }; await addDoc(collection(db, isPersonalProject ? 'expenses' : `${ROOT_COLLECTION}expenses`), expenseData); const expenseReceipt = { type: 'expense', businessName: appName, date: new Date().toLocaleString(), staffName: staffMember ? staffMember.name : 'Admin', description: description, amount: amount, autoPrint: true }; setLastSale(expenseReceipt); setView('receipt_view'); toast.success("Gasto registrado"); } catch (e) { toast.error("Error guardando gasto"); } };
  const handleDeleteExpense = async (id) => { if (!window.confirm("¿Eliminar?")) return; try { await deleteDoc(doc(db, isPersonalProject ? 'expenses' : `${ROOT_COLLECTION}expenses`, id)); toast.success("Eliminado"); } catch (e) { toast.error("Error"); } };
  const handleCloseRegister = () => { if (!registerSession) return; const cashFinal = registerSession.openingAmount + sessionStats.cashSales - sessionStats.totalExpenses; toast((t) => (<div className="flex flex-col gap-3 min-w-[240px]"> <div className="border-b pb-3"> <p className="font-bold text-gray-800 text-lg mb-2">Resumen de Cierre</p> <div className="bg-gray-50 p-2 rounded mb-3 grid grid-cols-2 gap-2 text-xs"> <div className="bg-white p-2 rounded border border-gray-100"><span className="text-gray-500 block uppercase text-[10px]">Total QR</span><span className="font-bold text-blue-600 text-sm">Bs. {sessionStats.qrSales.toFixed(2)}</span></div> <div className="bg-white p-2 rounded border border-gray-100"><span className="text-gray-500 block uppercase text-[10px]">Total Tarjeta</span><span className="font-bold text-purple-600 text-sm">Bs. {sessionStats.cardSales.toFixed(2)}</span></div> </div> <div className="px-2"><p className="text-xs text-gray-500 uppercase font-bold">Efectivo en Caja:</p><p className="text-2xl font-black text-green-600">Bs. {cashFinal.toFixed(2)}</p></div> </div> <div className="flex gap-2"><button onClick={() => { confirmCloseRegister(cashFinal); toast.dismiss(t.id); }} className="bg-red-600 text-white px-4 py-3 rounded-lg text-xs font-bold shadow-sm flex-1 hover:bg-red-700 transition-colors">CERRAR TURNO</button><button onClick={() => toast.dismiss(t.id)} className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg text-xs font-bold flex-1 hover:bg-gray-300 transition-colors">CANCELAR</button></div> </div>), { duration: 10000, position: 'top-center', icon: null }); };
  const confirmCloseRegister = async (finalCash) => { try { await updateDoc(doc(db, isPersonalProject ? 'cash_registers' : `${ROOT_COLLECTION}cash_registers`, registerSession.id), { status: 'closed', closedAt: new Date().toISOString(), closedBy: staffMember ? staffMember.name : 'Admin', finalCashCalculated: finalCash, finalSalesStats: sessionStats }); const zReportData = { type: 'z-report', businessName: appName, date: new Date().toLocaleString(), staffName: staffMember ? staffMember.name : 'Admin', registerId: registerSession.id, openedAt: registerSession.openedAt, openingAmount: registerSession.openingAmount, finalCash: finalCash, stats: sessionStats, expensesList: sessionStats.expensesList, soldProducts: sessionStats.soldProducts, autoPrint: true }; setRegisterSession(null); setSessionStats({ cashSales: 0, qrSales: 0, cardSales: 0, digitalSales: 0, totalExpenses: 0, totalCostOfGoods: 0, courtesyTotal: 0, courtesyCost: 0, expensesList: [], soldProducts: [] }); setLastSale(zReportData); setView('receipt_view'); toast.success("Cierre exitoso"); } catch (error) { toast.error("Error cerrando"); } };
  const handleBulkReceipt = (receiptData) => { const finalReceipt = { ...receiptData, businessName: appName || 'LicoBar' }; setLastSale(finalReceipt); setView('receipt_view'); };

  const handleReprintZReport = (shiftData) => { const zReportData = { type: 'z-report', businessName: appName, date: new Date(shiftData.closedAt).toLocaleString(), staffName: shiftData.closedBy || 'Admin', registerId: shiftData.id, openedAt: shiftData.openedAt, openingAmount: shiftData.openingAmount, finalCash: shiftData.finalCashCalculated, stats: shiftData.finalSalesStats, expensesList: shiftData.finalSalesStats?.expensesList || [], soldProducts: shiftData.finalSalesStats?.soldProducts || [] }; setLastSale(zReportData); setView('receipt_view'); };

  const handleStartPaymentFromCashier = (order, clearCartCallback) => { if (!checkRegisterStatus(true)) return; setOrderToPay(order); setPendingSale({ cart: order.items, clearCart: clearCartCallback || (() => { }) }); setIsPaymentModalOpen(true); };
  const handlePOSCheckout = (cart, clearCart) => { if (!checkRegisterStatus(true)) return; setOrderToPay(null); setPendingSale({ cart, clearCart }); setIsPaymentModalOpen(true); };
  const handleSendToKitchen = async (cart, clearCart) => { if (!checkRegisterStatus(false)) return; if (cart.length === 0) return; const toastId = toast.loading('Procesando comanda...'); try { const totalOrder = cart.reduce((acc, item) => acc + (item.price * item.qty), 0); const orderData = { date: new Date().toISOString(), staffId: staffMember ? staffMember.id : 'anon', staffName: staffMember ? staffMember.name : 'Mesero', orderId: 'ORD-' + Math.floor(Math.random() * 10000), items: cart, total: totalOrder, status: 'pending' }; await addDoc(collection(db, isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`), orderData); const preCheckData = { ...orderData, type: 'order', date: new Date().toLocaleString(), autoPrint: true }; clearCart([]); setLastSale(preCheckData); toast.success('Pedido enviado a caja', { id: toastId }); setView('receipt_view'); } catch (error) { toast.error('Error al enviar pedido', { id: toastId }); } };
  const handleVoidAndPrint = async (order) => { try { await deleteDoc(doc(db, isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`, order.id)); setLastSale({ ...order, type: 'void', businessName: appName, date: new Date().toLocaleString() }); toast.success("Pedido anulado"); setView('receipt_view'); } catch (error) { toast.error("Error al anular"); } };
  const handleReprintOrder = (order) => { const preCheckData = { ...order, type: 'order', businessName: appName, date: new Date().toLocaleString() }; setLastSale(preCheckData); setView('receipt_view'); toast.success("Reimprimiendo comanda..."); };

  // --- COBRO INTELIGENTE (COMBOS E INGREDIENTES) ---
  const handleFinalizeSale = async (paymentResult) => {
    if (!db) return;
    if (staffMember && staffMember.role !== 'Cajero' && staffMember.role !== 'Administrador') { toast.error("Solo Cajeros pueden cobrar."); setIsPaymentModalOpen(false); return; }
    if (!registerSession) { toast.error("La caja está cerrada"); return; }

    const toastId = toast.loading('Procesando pago...');
    setIsPaymentModalOpen(false);

    const itemsToProcess = orderToPay ? orderToPay.items : pendingSale.cart;
    const { paymentsList, totalPaid, change } = paymentResult;
    const totalToProcess = totalPaid - change;

    try {
      const batchPromises = [];
      const timestamp = new Date();
      let cashierName = staffMember ? staffMember.name : 'Administrador';
      const waiterName = orderToPay ? (orderToPay.staffName || 'Barra') : (staffMember ? staffMember.name : 'Barra');
      const waiterId = orderToPay ? (orderToPay.staffId || 'anon') : (staffMember ? staffMember.id : 'anon');
      let originalOrderId = 'ORD-' + Math.floor(Math.random() * 10000);
      if (orderToPay) { if (orderToPay.orderIds && Array.isArray(orderToPay.orderIds)) { originalOrderId = orderToPay.orderIds.join(', '); } else if (orderToPay.orderId) { originalOrderId = orderToPay.orderId; } }

      // Limpiar items para guardar en historial
      const cleanItems = itemsToProcess.map(item => ({ id: item.id || 'unknown', name: item.name || 'Sin nombre', price: parseFloat(item.price) || 0, cost: parseFloat(item.cost) || 0, qty: parseInt(item.qty) || 1, category: item.category || 'General', stock: item.stock !== undefined ? item.stock : null, image: item.image || null, isServiceItem: !!item.isServiceItem, location: item.location || null, isCombo: !!item.isCombo, recipe: item.recipe || [] }));

      const saleData = { date: timestamp.toISOString(), total: parseFloat(totalToProcess) || 0, items: cleanItems, staffId: waiterId, staffName: waiterName, cashier: cashierName, registerId: registerSession.id, payments: paymentsList || [], totalPaid: parseFloat(totalPaid) || 0, changeGiven: parseFloat(change) || 0, orderId: originalOrderId };

      const docRef = await addDoc(collection(db, isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`), saleData);

      // --- LOGICA MAESTRA DE DESCUENTO DE STOCK ---
      cleanItems.forEach(item => {
        if (item.isServiceItem) return; // Servicios no tienen stock

        if (item.isCombo && item.recipe && item.recipe.length > 0) {
          // ES UN COMBO: Descontar ingredientes
          item.recipe.forEach(ingredient => {
            const ingredientInDb = items.find(i => i.id === ingredient.itemId);
            if (ingredientInDb && ingredientInDb.stock !== undefined) {
              const quantityToReduce = ingredient.qty * item.qty;
              const newStock = parseInt(ingredientInDb.stock) - quantityToReduce;
              batchPromises.push(updateDoc(doc(db, getCollName('items'), ingredientInDb.id), { stock: newStock }));
            }
          });
        } else if (item.stock !== null && item.stock !== '' && !isNaN(item.stock)) {
          // PRODUCTO NORMAL: Descontar stock directo
          const newStock = parseInt(item.stock) - item.qty;
          batchPromises.push(updateDoc(doc(db, getCollName('items'), item.id), { stock: newStock }));
        }
      });

      if (orderToPay && orderToPay.type !== 'quick_sale') { if (orderToPay.ids && Array.isArray(orderToPay.ids) && orderToPay.ids.length > 0) { orderToPay.ids.forEach(id => { batchPromises.push(deleteDoc(doc(db, isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`, id))); }); } else if (orderToPay.id && orderToPay.id !== 'BULK_PAYMENT') { batchPromises.push(deleteDoc(doc(db, isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`, orderToPay.id))); } }

      await Promise.all(batchPromises);

      // --- ACTUALIZAR ESTADÍSTICAS DE SESIÓN (CRÍTICO PARA REPORTES) ---
      setSessionStats(prev => {
        const newStats = { ...prev };

        // 1. Sumar Pagos
        if (paymentsList && Array.isArray(paymentsList)) {
          paymentsList.forEach(p => {
            const amount = parseFloat(p.amount) || 0;
            if (p.method === 'Efectivo') newStats.cashSales = (newStats.cashSales || 0) + amount;
            else if (p.method === 'QR') newStats.qrSales = (newStats.qrSales || 0) + amount;
            else if (p.method === 'Tarjeta') newStats.cardSales = (newStats.cardSales || 0) + amount;
            else newStats.digitalSales = (newStats.digitalSales || 0) + amount;
          });
          // Restar cambio del efectivo si hubo
          if (change > 0) newStats.cashSales = (newStats.cashSales || 0) - change;
        }

        // 2. Sumar Costos y Productos
        cleanItems.forEach(item => {
          const itemTotal = (parseFloat(item.price) || 0) * (parseInt(item.qty) || 1);
          const itemCost = (parseFloat(item.cost) || 0) * (parseInt(item.qty) || 1);

          newStats.totalCostOfGoods = (newStats.totalCostOfGoods || 0) + itemCost;

          // Actualizar lista de productos vendidos
          const existingProdIndex = newStats.soldProducts.findIndex(p => p.id === item.id);
          if (existingProdIndex >= 0) {
            newStats.soldProducts[existingProdIndex].qty += (parseInt(item.qty) || 1);
            newStats.soldProducts[existingProdIndex].total += itemTotal;
          } else {
            newStats.soldProducts.push({
              id: item.id,
              name: item.name,
              qty: parseInt(item.qty) || 1,
              total: itemTotal
            });
          }
        });

        return newStats;
      });

      const receiptData = { type: 'order', businessName: appName, date: timestamp.toLocaleString(), staffName: waiterName, cashierName: cashierName, orderId: originalOrderId, items: cleanItems, total: totalToProcess, payments: paymentsList, change: change, autoPrint: true };
      setLastSale(receiptData);
      if (pendingSale && pendingSale.clearCart) pendingSale.clearCart([]);
      setPendingSale(null); setOrderToPay(null);
      toast.success('Cobro exitoso', { id: toastId });
      setView('receipt_view');
    } catch (e) { console.error(e); toast.error('Error al cobrar', { id: toastId }); }
  };

  const handleReceiptClose = () => { if (lastSale && lastSale.type === 'z-report') { setView('landing'); return; } const isCashier = (staffMember && (staffMember.role === 'Cajero' || staffMember.role === 'Administrador')) || (currentUser && !currentUser.isAnonymous); if (isCashier) { setView('cashier'); } else { setStaffMember(null); setView('landing'); } };
  const handleSave = async (d) => { try { if (currentItem) await setDoc(doc(db, getCollName('items'), currentItem.id), d); else await addDoc(collection(db, getCollName('items')), d); toast.success('Guardado'); setIsModalOpen(false); } catch { toast.error('Error'); } };
  const handleDelete = async (id) => { try { await deleteDoc(doc(db, getCollName('items'), id)); toast.success('Eliminado'); } catch { toast.error('Error'); } };
  const handleAddStaff = async (d) => { await addDoc(collection(db, getCollName('staff')), d); toast.success('Personal creado'); };
  const handleUpdateStaff = async (id, d) => { await updateDoc(doc(db, getCollName('staff'), id), d); toast.success('Personal actualizado'); };
  const handleDeleteStaff = async (id) => { if (window.confirm("¿Eliminar?")) { await deleteDoc(doc(db, getCollName('staff'), id)); toast.success('Borrado'); } };
  const handleAddCategory = (n) => setDoc(doc(db, getCollName('settings'), 'categories'), { list: [...categories, n] });
  const handleRenameCategory = (i, n) => { const l = [...categories]; l[i] = n; setDoc(doc(db, getCollName('settings'), 'categories'), { list: l }); };
  const handleDeleteCategory = (i) => { const l = categories.filter((_, x) => x !== i); setDoc(doc(db, getCollName('settings'), 'categories'), { list: l }); };
  const handleAddRole = (n) => setDoc(doc(db, getCollName('settings'), 'roles'), { list: [...roles, n] });
  const handleRenameRole = (i, n) => { const l = [...roles]; l[i] = n; setDoc(doc(db, getCollName('settings'), 'roles'), { list: l }); };
  const handleDeleteRole = (i) => { const l = roles.filter((_, x) => x !== i); setDoc(doc(db, getCollName('settings'), 'roles'), { list: l }); };
  const handleAddTable = (n) => setDoc(doc(db, getCollName('settings'), 'tables'), { list: [...tables, n] });
  const handleRenameTable = (i, n) => { const l = [...tables]; l[i] = n; setDoc(doc(db, getCollName('settings'), 'tables'), { list: l }); };
  const handleDeleteTable = (i) => { const l = tables.filter((_, x) => x !== i); setDoc(doc(db, getCollName('settings'), 'tables'), { list: l }); };
  const handleAddExpenseType = (n) => setDoc(doc(db, getCollName('settings'), 'expenses'), { list: [...expenseTypes, n] });
  const handleRenameExpenseType = (i, n) => { const l = [...expenseTypes]; l[i] = n; setDoc(doc(db, getCollName('settings'), 'expenses'), { list: l }); };
  const handleDeleteExpenseType = (i) => { const l = expenseTypes.filter((_, x) => x !== i); setDoc(doc(db, getCollName('settings'), 'expenses'), { list: l }); };

  const filterCategories = ['Todos', ...categories];
  const filteredItems = filter === 'Todos' ? items : items.filter(i => i.category === filter);
  const finalFilteredItems = filteredItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const isAdminMode = view === 'admin' || view === 'report' || view === 'staff_admin' || view === 'cashier' || view === 'register_control' || view === 'maintenance' || view === 'shift_history';
  const isCashierOnly = staffMember && staffMember.role === 'Cajero';

  if (isLoadingApp) return (<div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center animate-in fade-in duration-700"><Loader2 size={32} className="text-orange-500 animate-spin mb-4" /><h2 className="text-white font-bold text-xl tracking-widest uppercase mb-1">ZZIF System</h2></div>);
  if (view === 'public_report' && reportId) return <PublicReportView equipmentId={reportId} onExit={() => { window.history.pushState({}, '', '/'); setView('landing'); }} />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <Toaster position="top-center" reverseOrder={false} />
      {view !== 'landing' && (<div className={`w-full p-1 text-[10px] text-center font-bold text-white flex justify-center items-center gap-2 shadow-md sticky top-0 z-50 ${registerSession ? 'bg-green-600' : 'bg-red-600'}`}>{registerSession ? (<><Unlock size={12} /> <span className="uppercase">TURNO: {registerSession.openedBy} | Bs. {registerSession.openingAmount}</span>{((staffMember && registerSession.openedBy === staffMember.name) || (currentUser && !currentUser.isAnonymous)) && (<button onClick={handleCloseRegister} className="ml-4 bg-black/20 hover:bg-black/40 px-3 py-0.5 rounded-full text-white flex items-center gap-1 transition-colors border border-white/30"><Lock size={10} /> Cerrar</button>)}</>) : (<><Lock size={12} /> CAJA CERRADA</>)}</div>)}
      {view === 'landing' ? (
        <LandingPage appName={appName || 'Cargando...'} logo={logo} onSelectClient={handleEnterMenu} onSelectStaff={handleEnterStaff} onSelectAdmin={handleEnterAdmin} />
      ) : (
        <>
          <header className="bg-white shadow-sm border-b border-gray-100 no-print">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3" onClick={() => isAdminMode && !isCashierOnly && setIsBrandingModalOpen(true)}>
                <div className={`rounded-lg overflow-hidden flex items-center justify-center ${logo ? 'bg-white' : 'bg-orange-500 p-2 text-white'}`} style={{ width: '40px', height: '40px' }}>{logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain" /> : <ChefHat size={24} />}</div>
                <div><h1 className="text-lg font-bold text-gray-800 leading-none">{appName}</h1><span className="text-[10px] text-gray-500 font-medium uppercase">Cloud Menu</span></div>
              </div>
              <div className="flex items-center gap-2 header-buttons">
                {/* BOTÓN CALCULADORA DISCRETO */}
                <button onClick={() => setIsCalculatorOpen(true)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors" title="Cotizar Servicio"><Calculator size={20} /></button>

                {!isAdminMode && <button aria-label="Ir al inicio" onClick={() => setView('landing')} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><Home size={20} /></button>}
                {isAdminMode && <button aria-label="Cerrar sesión" onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-red-50 text-red-600"><LogOut size={16} />Salir</button>}
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {isAdminMode && (
              <>
                <div className="mb-6 no-print overflow-x-auto">
                  <div className="flex border-b border-gray-200 min-w-max items-center">
                    {!isCashierOnly && <button onClick={() => setView('admin')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'admin' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><ClipboardList size={18} /> Inventario</button>}
                    <button onClick={() => setView('cashier')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'cashier' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><DollarSign size={18} /> Caja</button>
                    <button onClick={() => { if (!registerSession) { toast.error("Abre la caja primero"); return; } setView('pos'); }} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 border-transparent text-green-600 hover:bg-green-50`}><Zap size={18} /> Venta Rápida</button>
                    <button onClick={() => setView('register_control')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'register_control' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><Wallet size={18} /> Control Caja</button>
                    {!isCashierOnly && <button onClick={() => setView('staff_admin')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'staff_admin' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><Users size={18} /> Personal</button>}
                    <button onClick={() => setView('report')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'report' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><FileText size={18} /> Reporte</button>
                    {!isCashierOnly && <button onClick={() => setView('maintenance')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'maintenance' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><Wrench size={18} /> Mantenimiento</button>}

                    {/* BOTÓN HISTORIAL AGREGADO */}
                    {!isCashierOnly && <button onClick={() => setView('shift_history')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'shift_history' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><Calendar size={18} /> Historial</button>}
                  </div>
                </div>
                {view === 'report' && <div className="animate-in fade-in"><SalesDashboard onReprintZ={handleReprintZReport} onConfigurePrinter={() => setIsPrinterSettingsOpen(true)} currentPrinterType={printerType} /><div className="hidden print:block mt-8"><PrintableView items={items} /></div></div>}

                {view === 'cashier' && (
                  <CashierView
                    activeServices={activeServices}
                    onOpenServiceModal={() => setIsServiceModalOpen(true)}
                    onProcessPayment={handleStartPaymentFromCashier}
                    onVoidOrder={handleVoidAndPrint}
                    onReprintOrder={handleReprintOrder}
                    onStopService={handleStopService}
                    onOpenExpense={() => setIsExpenseModalOpen(true)}
                    onPrintReceipt={handleBulkReceipt}
                  />
                )}

                {view === 'register_control' && <RegisterControlView session={registerSession} onOpen={handleOpenRegister} onClose={handleCloseRegister} staff={staff} stats={sessionStats} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} />}
                {view === 'staff_admin' && !isCashierOnly && <StaffManagerView staff={staff} roles={roles} onAddStaff={handleAddStaff} onUpdateStaff={handleUpdateStaff} onDeleteStaff={handleDeleteStaff} onManageRoles={() => setIsRoleModalOpen(true)} onPrintCredential={handlePrintCredential} />}
                {view === 'credential_print' && credentialToPrint && (<div className="flex flex-col items-center w-full min-h-screen bg-gray-100"><div className="w-full max-w-md p-4 flex justify-start no-print"><button onClick={() => setView('staff_admin')} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 font-bold"><ArrowLeft size={20} /> Volver a la Lista</button></div><CredentialPrintView member={credentialToPrint} appName={appName} /></div>)}
                {view === 'maintenance' && <EquipmentManager staff={staff} registerSession={registerSession} />}

                {/* VISTA HISTORIAL RENDERIZADA */}
                {view === 'shift_history' && !isCashierOnly && <ShiftHistory onReprint={handleReprintZReport} />}

                {view === 'admin' && !isCashierOnly && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between"><div><p className="text-xs text-gray-500 uppercase font-bold">Inversión (Costo)</p><p className="text-2xl font-black text-blue-600">Bs. {inventoryStats.totalCost.toFixed(2)}</p></div><div className="p-3 bg-blue-50 rounded-full text-blue-600"><DollarSign size={24} /></div></div>
                      <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center justify-between"><div><p className="text-xs text-gray-500 uppercase font-bold">Venta Potencial</p><p className="text-2xl font-black text-green-600">Bs. {inventoryStats.totalRetail.toFixed(2)}</p></div><div className="p-3 bg-green-50 rounded-full text-green-600"><TrendingUp size={24} /></div></div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"><div><p className="text-xs text-gray-500 uppercase font-bold">Total Unidades</p><p className="text-2xl font-black text-gray-800">{inventoryStats.totalItems}</p></div><div className="p-3 bg-gray-100 rounded-full text-gray-600"><Package size={24} /></div></div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><PieChart size={14} /> Desglose de Inversión por Categoría</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {inventoryStats.sortedCategories.map(cat => (
                          <div key={cat.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="font-bold text-gray-600 text-sm truncate pr-2">{cat.name}</span>
                            <span className="font-mono font-bold text-blue-600 text-sm whitespace-nowrap">Bs. {cat.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                      <div className="flex gap-2">
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
                    <div className="bg-white rounded-xl shadow border overflow-hidden">
                      <table className="w-full text-left">
                        <thead><tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200"><th className="p-4">Producto</th><th className="p-4 text-center">Stock</th><th className="p-4 text-right">Costo</th><th className="p-4 text-right">Precio</th><th className="p-4 text-right">Margen</th><th className="p-4 text-right">Acciones</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                          {finalFilteredItems.length > 0 ? (
                            finalFilteredItems.map(item => (<AdminRow key={item.id} item={item} onEdit={(i) => { setCurrentItem(i); setIsModalOpen(true); }} onDelete={handleDelete} isQuickEdit={isQuickEditMode} onQuickUpdate={handleQuickUpdate} />))
                          ) : (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">No se encontraron productos.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
            {view === 'pin_login' && <PinLoginView staffMembers={staff} onLoginSuccess={handleStaffPinLogin} onClockAction={handleClockAction} onCancel={() => setView('landing')} />}
            {view === 'pos' && (<POSInterface items={items} categories={categories} staffMember={staffMember} onCheckout={handlePOSCheckout} onPrintOrder={handleSendToKitchen} onExit={() => {
              const isCashier = (staffMember && (staffMember.role === 'Cajero' || staffMember.role === 'Administrador')) || (currentUser && !currentUser.isAnonymous);
              if (isCashier) setView('cashier'); else setView('landing');
            }} onPrintReceipt={handleReprintOrder} onOpenServiceModal={() => setIsServiceModalOpen(true)} autoLockTime={autoLockTime} />)}
            {view === 'receipt_view' && <Receipt data={lastSale} onPrint={handlePrint} onClose={handleReceiptClose} printerType={printerType} />}
            {view === 'menu' && (<>{/* ... MENÚ CLIENTES ... */}<div className="fixed inset-0 z-0 pointer-events-none bg-[#0a0a0a]"><div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-red-600/20 blur-[100px] rotate-45 animate-pulse"></div><div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-green-600/20 blur-[100px] rotate-[-45] animate-pulse delay-500"></div><div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px', animation: 'snowfallNative 10s linear infinite', opacity: 0.3 }}></div><style jsx>{`@keyframes snowfallNative { from {background-position: 0 0;} to {background-position: 20px 100vh;} }`}</style></div>{filter === 'Todos' ? (<div className="animate-in fade-in pb-20 relative z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-6"><button onClick={() => setView('landing')} className="absolute top-4 left-4 z-50 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition-all" title="Salir del Menú"><Home size={24} /></button><div className="text-center mb-10 mt-4"><div className="flex items-center justify-center gap-3 mb-2"><Trees size={28} className="text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" /><h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-white to-green-400 tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] uppercase">NUESTRO MENÚ</h2><Trees size={28} className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] scale-x-[-1]" /></div><p className="text-gray-400 font-bold uppercase tracking-widest text-sm flex justify-center items-center gap-2 before:h-px before:w-6 before:bg-red-500 after:h-px after:w-6 after:bg-green-500 opacity-80"><Gift size={14} className="text-red-400" /> Selecciona una categoría <Gift size={14} className="text-green-400" /></p></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2 max-w-5xl mx-auto">{categories.map((cat, index) => { const borderColors = ['border-red-500/60 shadow-[0_0_15px_-3px_rgba(220,38,38,0.5)] text-red-100', 'border-green-500/60 shadow-[0_0_15px_-3px_rgba(34,197,94,0.5)] text-green-100', 'border-yellow-500/60 shadow-[0_0_15px_-3px_rgba(234,179,8,0.5)] text-yellow-100', 'border-purple-500/60 shadow-[0_0_15px_-3px_rgba(168,85,247,0.5)] text-purple-100']; const currentStyle = borderColors[index % borderColors.length]; return (<button key={cat} onClick={() => setFilter(cat)} className={`relative h-40 rounded-3xl overflow-hidden bg-black/60 backdrop-blur-md group border-2 border-dashed transition-all duration-500 hover:scale-[1.03] active:scale-95 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] ${currentStyle}`}><div className={`absolute top-2 left-2 w-2 h-2 rounded-full animate-pulse ${index % 2 ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-green-500 shadow-[0_0_5px_green]'}`}></div><div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full animate-pulse delay-500 ${index % 3 ? 'bg-blue-500 shadow-[0_0_5px_blue]' : 'bg-yellow-500 shadow-[0_0_5px_yellow]'}`}></div><div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4"><Gift size={20} className={`mb-2 opacity-50 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_5px_currentColor] ${index % 2 ? 'text-green-400' : 'text-red-400'}`} /><span className="font-black text-2xl uppercase tracking-wider drop-shadow-md text-center">{cat}</span></div></button>) })}</div></div>) : (<div className="animate-in slide-in-from-right duration-300 relative z-10 min-h-screen -mx-4 sm:-mx-6 lg:-mx-8"><div className="sticky top-16 z-20 bg-black/70 backdrop-blur-xl py-4 mb-6 border-b border-white/10 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)] px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-4 max-w-7xl mx-auto"><button aria-label="Volver al menú" onClick={() => setFilter('Todos')} className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 border border-white/10 shadow-lg transition-transform active:scale-90 group backdrop-blur-md"><ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" /></button><div><h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 uppercase tracking-wide leading-none drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]">{filter}</h2><p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1"><Trees size={10} className="text-green-500" /> Explora nuestros productos</p></div></div></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">{filteredItems.length > 0 ? (filteredItems.map(item => (<div key={item.id} className="rounded-2xl overflow-hidden p-1 bg-gradient-to-br from-white/10 to-transparent border border-white/5 shadow-lg"><MenuCard item={item} /></div>))) : (<div className="col-span-full text-center py-20 text-gray-500 flex flex-col items-center"><Search size={48} className="mb-2 opacity-20 text-white" /><p className="text-gray-400">No hay productos en esta categoría.</p></div>)}</div></div>)}</>)}
          </main>
          <div className={`fixed bottom-0 w-full p-1 text-[10px] text-center text-white ${dbStatus === 'connected' ? 'bg-green-600' : 'bg-red-600'}`}> {dbStatus === 'connected' ? 'Sistema Online' : 'Desconectado'} </div>
        </>
      )}
      <OpenRegisterModal isOpen={isOpenRegisterModalOpen} onClose={() => { }} onOpenRegister={handleOpenRegister} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} total={orderToPay ? orderToPay.total : (pendingSale ? pendingSale.cart.reduce((acc, i) => acc + (i.price * i.qty), 0) : 0)} onConfirm={handleFinalizeSale} />
      <PrinterSettingsModal isOpen={isPrinterSettingsOpen} onClose={() => setIsPrinterSettingsOpen(false)} currentType={printerType} onSelect={handleSavePrinterType} />

      {/* MODALES ESTÁNDAR */}
      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} item={currentItem} categories={categories} items={items} />

      <CategoryManager isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={categories} onAdd={handleAddCategory} onRename={handleRenameCategory} onDelete={handleDeleteCategory} />
      <RoleManager isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} roles={roles} onAdd={handleAddRole} onRename={handleRenameRole} onDelete={handleDeleteRole} />
      <TableManager isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} tables={tables} onAdd={handleAddTable} onRename={handleRenameTable} onDelete={handleDeleteTable} />
      <ExpenseTypeManager isOpen={isExpenseTypeModalOpen} onClose={() => setIsExpenseTypeModalOpen(false)} expenseTypes={expenseTypes} onAdd={handleAddExpenseType} onRename={handleRenameExpenseType} onDelete={handleDeleteExpenseType} />
      <BrandingModal isOpen={isBrandingModalOpen} onClose={() => setIsBrandingModalOpen(false)} onSave={handleSaveBranding} currentLogo={logo} currentName={appName} currentAutoLock={autoLockTime} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} />
      <ServiceStartModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} services={items.filter(i => i.category === 'Servicios')} onStart={handleStartService} occupiedLocations={activeServices.map(s => s.note)} />
      <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSave={handleAddExpense} expenseTypes={expenseTypes} />

      {/* MODAL CALCULADORA AGREGADO */}
      <ServiceCalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
    </div>
  );
}