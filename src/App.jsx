// src/App.jsx - CON IMPRESIÓN DE VALES DE GASTO
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Home, LogOut, User, ClipboardList, Users, FileText, Printer, Settings, Plus, Edit2, Search, ChefHat, DollarSign, ArrowLeft, Lock, Unlock, Wallet, Loader2, LayoutGrid, Gift, Trees } from 'lucide-react';
import { onAuthStateChanged, signOut, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { collection, doc, setDoc, addDoc, deleteDoc, onSnapshot, updateDoc, query, where, limit, getDocs } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

import { auth, db, ROOT_COLLECTION, isPersonalProject, firebaseConfig } from './config/firebase';
import LandingPage from './components/LandingPage';
import POSInterface from './components/POSInterface';
import StaffManagerView from './components/StaffManagerView';
import SalesDashboard from './components/SalesDashboard';
import Receipt from './components/Receipt';
import PaymentModal from './components/PaymentModal';
import CashierView from './components/CashierView';
import OpenRegisterModal from './components/OpenRegisterModal';
import RegisterControlView from './components/RegisterControlView';

// Modales
import { AuthModal, BrandingModal, ProductModal, CategoryManager, RoleManager, TableManager, ExpenseTypeManager, ServiceStartModal, ExpenseModal } from './components/Modals';
import { MenuCard, PinLoginView, CredentialPrintView, PrintableView, AdminRow } from './components/Views';

const LOGO_URL_FIJO = ""; 
const INITIAL_CATEGORIES = ['Bebidas', 'Comidas', 'Servicios']; 
const INITIAL_ROLES = ['Garzón', 'Cajero', 'Cocinero', 'Administrador'];
const INITIAL_TABLES = ['Barra', 'Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'VIP 1']; 
const INITIAL_EXPENSE_TYPES = ['Hielo', 'Taxi', 'Insumos', 'Limpieza', 'Adelanto Sueldo', 'Proveedores'];

export default function App() {
  const [view, setView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [roles, setRoles] = useState(INITIAL_ROLES);
  
  // Estados de Configuración
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [expenseTypes, setExpenseTypes] = useState(INITIAL_EXPENSE_TYPES);
  const [autoLockTime, setAutoLockTime] = useState(45); 

  const [activeServices, setActiveServices] = useState([]); 
  const [dbStatus, setDbStatus] = useState('connecting');
  const [dbErrorMsg, setDbErrorMsg] = useState('');
  const [logo, setLogo] = useState(null);
  const [appName, setAppName] = useState(""); 
  const [registerSession, setRegisterSession] = useState(null);
  const [isOpenRegisterModalOpen, setIsOpenRegisterModalOpen] = useState(false);
  
  // ESTADÍSTICAS DEL TURNO
  const [sessionStats, setSessionStats] = useState({ 
      cashSales: 0, 
      qrSales: 0, 
      cardSales: 0, 
      digitalSales: 0, 
      totalExpenses: 0, 
      expensesList: [],
      soldProducts: [] 
  });
  
  // Modales
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
  const [credentialToPrint, setCredentialToPrint] = useState(null);
  const [staffMember, setStaffMember] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingSale, setPendingSale] = useState(null);
  const [orderToPay, setOrderToPay] = useState(null); 
  const [lastSale, setLastSale] = useState(null);
  const [isQuickEditMode, setIsQuickEditMode] = useState(false); 

  const getCollName = (type) => {
    if (type === 'items') return isPersonalProject ? 'menuItems' : `${ROOT_COLLECTION}menuItems`;
    if (type === 'staff') return isPersonalProject ? 'staffMembers' : `${ROOT_COLLECTION}staffMembers`;
    return isPersonalProject ? 'settings' : `${ROOT_COLLECTION}settings`;
  };

  const handleLogin = (userApp) => { setIsAuthModalOpen(false); toast.success(`Bienvenido`); setTimeout(() => setView('admin'), 10); };
  const handleLogout = async () => { await signOut(auth); window.location.reload(); };
  const handleEnterMenu = () => { setFilter('Todos'); setView('menu'); };
  const handleEnterStaff = () => setView('pin_login');
  const handleEnterAdmin = () => { if (currentUser && !currentUser.isAnonymous) setView('admin'); else setIsAuthModalOpen(true); };
  const handlePrintCredential = (member) => { if (!member) { toast.error("Error: Empleado no válido"); return; } setCredentialToPrint(member); setView('credential_print'); };
  const handlePrint = () => window.print();
  
  const handleStaffPinLogin = async (member) => { 
      const newSessionId = Date.now().toString() + Math.floor(Math.random() * 1000); 
      try { 
          await updateDoc(doc(db, getCollName('staff'), member.id), { activeSessionId: newSessionId }); 
          const memberWithSession = { ...member, activeSessionId: newSessionId }; 
          setStaffMember(memberWithSession); 
          if (member.role === 'Cajero' || member.role === 'Administrador') { 
              setView('cashier'); 
              toast.success(`Caja abierta: ${member.name}`); 
          } else { 
              setView('pos'); 
              toast.success(`Turno iniciado: ${member.name}`); 
          } 
      } catch (error) { toast.error("Error de conexión"); } 
  };
  
  const handleQuickUpdate = async (id, field, value) => {
      try {
          const valToSave = (field === 'price' || field === 'cost') ? parseFloat(value) : value;
          await updateDoc(doc(db, getCollName('items'), id), { [field]: valToSave });
          toast.success(`${field === 'stock' ? 'Stock' : field === 'price' ? 'Precio' : 'Costo'} actualizado`, { duration: 1000, icon: '⚡' });
      } catch (error) {
          toast.error('Error al actualizar');
      }
  };

  // --- DATA LOADING ---
  useEffect(() => { const initAuth = async () => { if (!auth.currentUser) { if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token && !isPersonalProject) { await signInWithCustomToken(auth, __initial_auth_token); } else { await signInAnonymously(auth).catch(() => setDbStatus('warning')); } } }; initAuth(); return onAuthStateChanged(auth, (u) => { setCurrentUser(u); if (u) { setDbStatus('connected'); setDbErrorMsg(''); } }); }, []);
  useEffect(() => { if (!db || !currentUser) return; const checkSession = async () => { const colName = isPersonalProject ? 'cash_registers' : `${ROOT_COLLECTION}cash_registers`; const q = query(collection(db, colName), where('status', '==', 'open'), limit(1)); const snap = await getDocs(q); if (!snap.empty) { const data = snap.docs[0].data(); setRegisterSession({ id: snap.docs[0].id, ...data }); } }; checkSession(); }, [db, currentUser]);
  useEffect(() => { 
      if (!db || !currentUser) return; 
      const itemsUnsub = onSnapshot(collection(db, getCollName('items')), (s) => { const rawItems = s.docs.map(doc => ({ id: doc.id, ...doc.data() })); const uniqueItems = Array.from(new Map(rawItems.map(item => [item.id, item])).values()); setItems(uniqueItems); }, (e) => { console.warn("Esperando permisos..."); }); 
      const staffUnsub = onSnapshot(collection(db, getCollName('staff')), (s) => setStaff(s.docs.map(d => ({id: d.id, ...d.data()})))); 
      
      const settingsUnsub = onSnapshot(collection(db, getCollName('settings')), (s) => { 
          s.docs.forEach(d => { 
              const data = d.data(); 
              if (d.id === 'categories') setCategories(data.list || []); 
              if (d.id === 'roles') setRoles(data.list || INITIAL_ROLES); 
              if (d.id === 'tables') setTables(data.list || INITIAL_TABLES); 
              if (d.id === 'expenses') setExpenseTypes(data.list || INITIAL_EXPENSE_TYPES);
              if (d.id === 'branding') { 
                  setLogo(data.logo); 
                  if(data.appName) setAppName(data.appName); 
                  if(data.autoLockTime) setAutoLockTime(data.autoLockTime); 
              } 
          }); 
          setIsLoadingApp(false); 
      }); 
      
      const activeSrvCol = isPersonalProject ? 'active_services' : `${ROOT_COLLECTION}active_services`; 
      const srvUnsub = onSnapshot(collection(db, activeSrvCol), (s) => { setActiveServices(s.docs.map(d => ({ id: d.id, ...d.data() }))); }); 
      return () => { itemsUnsub(); staffUnsub(); settingsUnsub(); srvUnsub(); }; 
  }, [currentUser]);

  // --- LÓGICA DE AGREGACIÓN DE VENTAS ---
  useEffect(() => { 
      if (!db || !registerSession) return; 
      const salesCol = isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`; 
      const qSales = query(collection(db, salesCol), where('registerId', '==', registerSession.id)); 
      const expensesCol = isPersonalProject ? 'expenses' : `${ROOT_COLLECTION}expenses`; 
      const qExpenses = query(collection(db, expensesCol), where('registerId', '==', registerSession.id)); 
      
      const unsubSales = onSnapshot(qSales, (snap) => { 
          let cash = 0, qr = 0, card = 0; 
          const productMap = {}; 

          snap.forEach(doc => { 
              const sale = doc.data(); 
              if (sale.payments && Array.isArray(sale.payments)) { 
                  sale.payments.forEach(p => { 
                      const amt = parseFloat(p.amount) || 0; 
                      const method = (p.method || '').toLowerCase(); 
                      if (method.includes('efectivo')) cash += amt; 
                      else if (method.includes('qr')) qr += amt; 
                      else if (method.includes('tarjeta')) card += amt; 
                  }); 
                  if (sale.changeGiven) cash -= parseFloat(sale.changeGiven); 
              } else { 
                  const total = parseFloat(sale.total); 
                  const method = (sale.paymentMethod || 'efectivo').toLowerCase(); 
                  if (method.includes('efectivo')) { 
                      const change = parseFloat(sale.changeGiven) || 0; 
                      const received = parseFloat(sale.amountReceived) || total; 
                      if(sale.amountReceived) cash += (received - change); else cash += total; 
                  } else if (method.includes('qr')) qr += total; 
                  else if (method.includes('tarjeta')) card += total; 
              }

              if (sale.items && Array.isArray(sale.items)) {
                  sale.items.forEach(item => {
                      const key = item.name;
                      if (!productMap[key]) productMap[key] = { name: item.name, qty: 0, total: 0 };
                      productMap[key].qty += (item.qty || 1);
                      productMap[key].total += (item.price * (item.qty || 1));
                  });
              }
          }); 

          const soldProductsList = Object.values(productMap).sort((a, b) => b.qty - a.qty);
          setSessionStats(prev => ({ ...prev, cashSales: cash, qrSales: qr, cardSales: card, digitalSales: qr + card, soldProducts: soldProductsList })); 
      }); 
      
      const unsubExpenses = onSnapshot(qExpenses, (snap) => { 
          let totalExp = 0; 
          const list = []; 
          snap.forEach(doc => { 
              const exp = doc.data(); 
              totalExp += parseFloat(exp.amount); 
              list.push({ id: doc.id, ...exp }); 
          }); 
          setSessionStats(prev => ({ ...prev, totalExpenses: totalExp, expensesList: list })); 
      }); 
      
      return () => { unsubSales(); unsubExpenses(); }; 
  }, [registerSession]);

  const checkRegisterStatus = (requireOwnership = false) => { if (registerSession) { const isAdmin = currentUser && !currentUser.isAnonymous; const isOwner = staffMember && registerSession.openedBy === staffMember.name; if (requireOwnership && !isAdmin && !isOwner) { toast.error(`⛔ ACCESO DENEGADO\nTurno de: ${registerSession.openedBy}`, { duration: 5000 }); return false; } return true; } const canOpenRegister = (currentUser && !currentUser.isAnonymous) || (staffMember && (staffMember.role === 'Cajero' || staffMember.role === 'Administrador')); if (canOpenRegister) setIsOpenRegisterModalOpen(true); else toast.error("⚠️ LA CAJA ESTÁ CERRADA.", { icon: '🔒' }); return false; };
  const handleOpenRegister = async (amount, activeTeam = []) => { try { const sessionData = { status: 'open', openedBy: staffMember ? staffMember.name : (currentUser?.email || 'Admin'), openedAt: new Date().toISOString(), openingAmount: amount, activeTeam: activeTeam, salesTotal: 0 }; const colName = isPersonalProject ? 'cash_registers' : `${ROOT_COLLECTION}cash_registers`; const docRef = await addDoc(collection(db, colName), sessionData); setRegisterSession({ id: docRef.id, ...sessionData }); setIsOpenRegisterModalOpen(false); toast.success(`Turno Abierto`, { icon: '🔓' }); } catch (error) { toast.error("Error al abrir caja"); } };
  const handleStartService = async (service, note) => { if (!checkRegisterStatus(false)) return; try { const serviceData = { serviceName: service.name, pricePerHour: service.price, startTime: new Date().toISOString(), note: note, staffName: staffMember ? staffMember.name : 'Admin', registerId: registerSession.id }; const colName = isPersonalProject ? 'active_services' : `${ROOT_COLLECTION}active_services`; await addDoc(collection(db, colName), serviceData); const orderData = { date: new Date().toISOString(), staffId: staffMember ? staffMember.id : 'anon', staffName: staffMember ? staffMember.name : 'Mesero', orderId: 'INI-' + Math.floor(Math.random() * 1000), items: [{ id: 'start-' + Date.now(), name: `⏱️ INICIO: ${service.name} (${note})`, price: 0, qty: 1, category: 'Servicios' }], total: 0, status: 'pending' }; setIsServiceModalOpen(false); const ticketData = { ...orderData, type: 'order', businessName: appName, date: new Date().toLocaleString() }; setLastSale(ticketData); setView('receipt_view'); toast.success("Servicio iniciado. Imprimiendo ticket..."); } catch (e) { toast.error("Error al iniciar servicio"); } };
  const handleStopService = async (service, cost, timeLabel) => { if (!checkRegisterStatus(true)) return; if (!window.confirm(`¿Detener ${service.serviceName}?\nCosto: Bs. ${cost.toFixed(2)}`)) return; try { const srvCol = isPersonalProject ? 'active_services' : `${ROOT_COLLECTION}active_services`; await deleteDoc(doc(db, srvCol, service.id)); const orderData = { date: new Date().toISOString(), staffId: staffMember ? staffMember.id : 'anon', staffName: service.staffName || 'Sistema', orderId: 'SRV-' + Math.floor(Math.random() * 1000), items: [{ id: 'srv-' + Date.now(), name: `${service.serviceName} (${timeLabel})`, price: cost, qty: 1, category: 'Servicios' }], total: cost, status: 'pending' }; const ordersCol = isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`; await addDoc(collection(db, ordersCol), orderData); toast.success("Servicio detenido. Ticket de inicio borrado."); } catch (e) { console.error(e); toast.error("Error al detener servicio"); } };
  
  // --- MANEJO DE GASTOS CON IMPRESIÓN DE VALE ---
  const handleAddExpense = async (description, amount) => { 
      if (!registerSession) return; 
      try { 
          const expenseData = { 
              registerId: registerSession.id, 
              description, 
              amount, 
              date: new Date().toISOString(), 
              createdBy: staffMember ? staffMember.name : 'Admin' 
          }; 
          const colName = isPersonalProject ? 'expenses' : `${ROOT_COLLECTION}expenses`; 
          await addDoc(collection(db, colName), expenseData); 
          
          // CREAR OBJETO VALE Y MOSTRAR VISTA DE IMPRESIÓN
          const expenseReceipt = {
              type: 'expense',
              businessName: appName,
              date: new Date().toLocaleString(),
              staffName: staffMember ? staffMember.name : 'Admin',
              description: description,
              amount: amount
          };
          setLastSale(expenseReceipt);
          setView('receipt_view');

          toast.success("Gasto registrado", { icon: '💸' }); 
      } catch (e) { 
          toast.error("Error guardando gasto"); 
      } 
  };

  const handleDeleteExpense = async (id) => { if(!window.confirm("¿Eliminar este gasto?")) return; try { const colName = isPersonalProject ? 'expenses' : `${ROOT_COLLECTION}expenses`; await deleteDoc(doc(db, colName, id)); toast.success("Gasto eliminado"); } catch (e) { toast.error("Error"); } };
  
  const handleCloseRegister = () => { if (!registerSession) return; const cashFinal = registerSession.openingAmount + sessionStats.cashSales - sessionStats.totalExpenses; toast((t) => ( <div className="flex flex-col gap-3 min-w-[240px]"> <div className="border-b pb-3"> <p className="font-bold text-gray-800 text-lg mb-2">Resumen de Cierre</p> <div className="bg-gray-50 p-2 rounded mb-3 grid grid-cols-2 gap-2 text-xs"> <div className="bg-white p-2 rounded border border-gray-100"><span className="text-gray-500 block uppercase text-[10px]">Total QR</span><span className="font-bold text-blue-600 text-sm">Bs. {sessionStats.qrSales.toFixed(2)}</span></div> <div className="bg-white p-2 rounded border border-gray-100"><span className="text-gray-500 block uppercase text-[10px]">Total Tarjeta</span><span className="font-bold text-purple-600 text-sm">Bs. {sessionStats.cardSales.toFixed(2)}</span></div> </div> <div className="px-2"><p className="text-xs text-gray-500 uppercase font-bold">Efectivo en Caja:</p><p className="text-2xl font-black text-green-600">Bs. {cashFinal.toFixed(2)}</p></div> </div> <div className="flex gap-2"><button onClick={() => { confirmCloseRegister(cashFinal); toast.dismiss(t.id); }} className="bg-red-600 text-white px-4 py-3 rounded-lg text-xs font-bold shadow-sm flex-1 hover:bg-red-700 transition-colors">CERRAR TURNO</button><button onClick={() => toast.dismiss(t.id)} className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg text-xs font-bold flex-1 hover:bg-gray-300 transition-colors">CANCELAR</button></div> </div> ), { duration: 10000, position: 'top-center', icon: null }); };
  const confirmCloseRegister = async (finalCash) => { 
      try { 
          const colName = isPersonalProject ? 'cash_registers' : `${ROOT_COLLECTION}cash_registers`; 
          await updateDoc(doc(db, colName, registerSession.id), { status: 'closed', closedAt: new Date().toISOString(), closedBy: staffMember ? staffMember.name : 'Admin', finalCashCalculated: finalCash, finalSalesStats: sessionStats }); 
          
          const zReportData = { 
              type: 'z-report', 
              businessName: appName, 
              date: new Date().toLocaleString(), 
              staffName: staffMember ? staffMember.name : 'Admin', 
              registerId: registerSession.id, 
              openedAt: registerSession.openedAt, 
              openingAmount: registerSession.openingAmount, 
              finalCash: finalCash, 
              stats: sessionStats, 
              expensesList: sessionStats.expensesList,
              soldProducts: sessionStats.soldProducts 
          }; 
          
          setRegisterSession(null); 
          setSessionStats({ cashSales: 0, qrSales: 0, cardSales: 0, digitalSales: 0, totalExpenses: 0, expensesList: [], soldProducts: [] }); 
          setLastSale(zReportData); 
          setView('receipt_view'); 
          toast.success("Cierre exitoso", { icon: '🖨️' }); 
      } catch (error) { toast.error("Error cerrando"); } 
  };
  const handleReprintZReport = (shiftData) => { 
      const zReportData = { 
          type: 'z-report', 
          businessName: appName, 
          date: new Date(shiftData.closedAt).toLocaleString(), 
          staffName: shiftData.closedBy || 'Admin', 
          registerId: shiftData.id, 
          openedAt: shiftData.openedAt, 
          openingAmount: shiftData.openingAmount, 
          finalCash: shiftData.finalCashCalculated, 
          stats: shiftData.finalSalesStats || { cashSales:0, qrSales: 0, cardSales: 0, totalExpenses:0 }, 
          expensesList: shiftData.finalSalesStats?.expensesList || [],
          soldProducts: shiftData.finalSalesStats?.soldProducts || [] 
      }; 
      setLastSale(zReportData); 
      setView('receipt_view'); 
      toast.success("Cargando copia del reporte..."); 
  };
  const handleStartPaymentFromCashier = (order) => { if (!checkRegisterStatus(true)) return; setOrderToPay(order); setPendingSale({ cart: order.items, clearCart: () => {} }); setIsPaymentModalOpen(true); };
  const handlePOSCheckout = (cart, clearCart) => { if (!checkRegisterStatus(true)) return; setOrderToPay(null); setPendingSale({ cart, clearCart }); setIsPaymentModalOpen(true); };
  const handleSendToKitchen = async (cart, clearCart) => { if (!checkRegisterStatus(false)) return; if (cart.length === 0) return; const toastId = toast.loading('Procesando comanda...'); try { const totalOrder = cart.reduce((acc, item) => acc + (item.price * item.qty), 0); const orderData = { date: new Date().toISOString(), staffId: staffMember ? staffMember.id : 'anon', staffName: staffMember ? staffMember.name : 'Mesero', orderId: 'ORD-' + Math.floor(Math.random() * 10000), items: cart, total: totalOrder, status: 'pending' }; const ordersCol = isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`; await addDoc(collection(db, ordersCol), orderData); const preCheckData = { ...orderData, type: 'order', date: new Date().toLocaleString() }; clearCart([]); setLastSale(preCheckData); toast.success('Pedido enviado a caja', { id: toastId }); setView('receipt_view'); } catch (error) { toast.error('Error al enviar pedido', { id: toastId }); } };
  const handleVoidAndPrint = async (order) => { try { const ordersCol = isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`; await deleteDoc(doc(db, ordersCol, order.id)); const voidData = { ...order, type: 'void', businessName: appName, date: new Date().toLocaleString() }; setLastSale(voidData); toast.success("Pedido anulado"); setView('receipt_view'); } catch (error) { toast.error("Error al anular"); } };
  const handleReprintOrder = (order) => { const preCheckData = { ...order, type: 'order', businessName: appName, date: new Date().toLocaleString() }; setLastSale(preCheckData); setView('receipt_view'); toast.success("Reimprimiendo comanda..."); };
  const handleFinalizeSale = async (paymentResult) => { if (!db) return; if (staffMember && staffMember.role !== 'Cajero' && staffMember.role !== 'Administrador') { toast.error("⛔ ACCESO DENEGADO: Solo Cajeros pueden cobrar."); setIsPaymentModalOpen(false); return; } if (!registerSession) { toast.error("¡La caja está cerrada!"); return; } const toastId = toast.loading('Procesando pago...'); setIsPaymentModalOpen(false); const itemsToProcess = orderToPay ? orderToPay.items : pendingSale.cart; const { paymentsList, totalPaid, change } = paymentResult; const totalToProcess = totalPaid - change; try { const batchPromises = []; const timestamp = new Date(); let cashierName = 'Caja General'; if (staffMember) cashierName = staffMember.name; else if (currentUser) cashierName = 'Administrador'; const waiterName = orderToPay ? orderToPay.staffName : (staffMember ? staffMember.name : 'Barra'); const waiterId = orderToPay ? orderToPay.staffId : (staffMember ? staffMember.id : 'anon'); const saleData = { date: timestamp.toISOString(), total: totalToProcess, items: itemsToProcess, staffId: waiterId, staffName: waiterName, cashier: cashierName, registerId: registerSession.id, payments: paymentsList, totalPaid: totalPaid, changeGiven: change }; const salesCollection = isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`; const docRef = await addDoc(collection(db, salesCollection), saleData); itemsToProcess.forEach(item => { if (item.stock !== undefined && item.stock !== '') { const newStock = parseInt(item.stock) - item.qty; batchPromises.push(updateDoc(doc(db, getCollName('items'), item.id), { stock: newStock })); } }); if (orderToPay) { const ordersCol = isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`; batchPromises.push(deleteDoc(doc(db, ordersCol, orderToPay.id))); } await Promise.all(batchPromises); const receiptData = { businessName: appName, date: timestamp.toLocaleString(), staffName: waiterName, cashierName: cashierName, orderId: docRef.id, items: itemsToProcess, total: totalToProcess, payments: paymentsList, change: change }; setLastSale(receiptData); if (pendingSale && pendingSale.clearCart) pendingSale.clearCart([]); setPendingSale(null); setOrderToPay(null); toast.success('¡Cobro exitoso!', { id: toastId }); setView('receipt_view'); } catch (e) { console.error(e); toast.error('Error al cobrar', { id: toastId }); } };
  const handleReceiptClose = () => { if (lastSale && lastSale.type === 'z-report') { setView('landing'); return; } const isCashier = (staffMember && (staffMember.role === 'Cajero' || staffMember.role === 'Administrador')) || (currentUser && !currentUser.isAnonymous); if (isCashier) setView('cashier'); else setView('pos'); };
  
  const handleSave = async (d) => { try { if(currentItem) await setDoc(doc(db, getCollName('items'), currentItem.id), d); else await addDoc(collection(db, getCollName('items')), d); toast.success('Guardado'); setIsModalOpen(false); } catch { toast.error('Error'); } };
  const handleDelete = async (id) => { try { await deleteDoc(doc(db, getCollName('items'), id)); toast.success('Eliminado'); } catch { toast.error('Error'); }};
  const handleAddStaff = async (d) => { await addDoc(collection(db, getCollName('staff')), d); toast.success('Personal creado'); };
  const handleUpdateStaff = async (id, d) => { await updateDoc(doc(db, getCollName('staff'), id), d); toast.success('Personal actualizado'); };
  const handleDeleteStaff = async (id) => { if(window.confirm("¿Eliminar?")) { await deleteDoc(doc(db, getCollName('staff'), id)); toast.success('Borrado'); } };
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

  const handleSaveBranding = (l, n, t) => { 
      setDoc(doc(db, getCollName('settings'), 'branding'), { logo: l, appName: n, autoLockTime: t }, { merge: true }); 
      setLogo(l); 
      setAppName(n);
      setAutoLockTime(t); 
      toast.success('Marca y Configuración actualizadas'); 
  };

  const filterCategories = ['Todos', ...categories];
  const filteredItems = filter === 'Todos' ? items : items.filter(i => i.category === filter);
  const isAdminMode = view === 'admin' || view === 'report' || view === 'staff_admin' || view === 'cashier' || view === 'register_control';
  const isCashierOnly = staffMember && staffMember.role === 'Cajero';

  if (isLoadingApp) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 animate-pulse"></div>
        <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-full border border-white/10 shadow-2xl mb-8">
           {LOGO_URL_FIJO ? (<img src={LOGO_URL_FIJO} className="w-16 h-16 object-contain" alt="Logo"/>) : (<ChefHat size={64} className="text-white drop-shadow-lg" strokeWidth={1.5} />)}
        </div>
      </div>
      <Loader2 size={32} className="text-orange-500 animate-spin mb-4" /><h2 className="text-white font-bold text-xl tracking-widest uppercase mb-1">ZZIF System</h2><p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Cargando recursos...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <Toaster position="top-center" reverseOrder={false} />
      {view !== 'landing' && (
          <div className={`w-full p-1 text-[10px] text-center font-bold text-white flex justify-center items-center gap-2 shadow-md sticky top-0 z-50 ${registerSession ? 'bg-green-600' : 'bg-red-600'}`}>
              {registerSession ? (<><Unlock size={12}/> <span className="uppercase">TURNO: {registerSession.openedBy} | Bs. {registerSession.openingAmount}</span>{((staffMember && registerSession.openedBy === staffMember.name) || (currentUser && !currentUser.isAnonymous)) && (<button onClick={handleCloseRegister} className="ml-4 bg-black/20 hover:bg-black/40 px-3 py-0.5 rounded-full text-white flex items-center gap-1 transition-colors border border-white/30"><Lock size={10}/> Cerrar</button>)}</>) : (<><Lock size={12}/> CAJA CERRADA</>)}
          </div>
      )}
      {view === 'landing' ? (
        <LandingPage appName={appName || 'Cargando...'} logo={logo} onSelectClient={handleEnterMenu} onSelectStaff={handleEnterStaff} onSelectAdmin={handleEnterAdmin} />
      ) : (
        <>
          <header className="bg-white shadow-sm border-b border-gray-100 no-print">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3" onClick={() => isAdminMode && !isCashierOnly && setIsBrandingModalOpen(true)}>
                <div className={`rounded-lg overflow-hidden flex items-center justify-center ${logo ? 'bg-white' : 'bg-orange-500 p-2 text-white'}`} style={{ width: '40px', height: '40px' }}>{logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain"/> : <ChefHat size={24} />}</div>
                <div><h1 className="text-lg font-bold text-gray-800 leading-none">{appName}</h1><span className="text-[10px] text-gray-500 font-medium uppercase">Cloud Menu</span></div>
              </div>
              <div className="flex items-center gap-2 header-buttons">
                {!isAdminMode && <button aria-label="Ir al inicio" onClick={() => setView('landing')} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><Home size={20}/></button>}
                {isAdminMode && <button aria-label="Cerrar sesión" onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-red-50 text-red-600"><LogOut size={16}/>Salir</button>}
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {isAdminMode && (
              <>
                <div className="mb-6 no-print overflow-x-auto">
                  <div className="flex border-b border-gray-200 min-w-max">
                    {!isCashierOnly && <button onClick={() => setView('admin')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'admin' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><ClipboardList size={18}/> Inventario</button>}
                    <button onClick={() => setView('cashier')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'cashier' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><DollarSign size={18}/> Caja</button>
                    <button onClick={() => setView('register_control')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'register_control' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><Wallet size={18}/> Control Caja</button>
                    {!isCashierOnly && <button onClick={() => setView('staff_admin')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'staff_admin' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><Users size={18}/> Personal</button>}
                    <button onClick={() => setView('report')} className={`pb-3 px-5 text-base font-bold border-b-2 transition-colors flex gap-2 ${view === 'report' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><FileText size={18}/> Reporte</button>
                  </div>
                </div>
                {view === 'report' && <div className="animate-in fade-in"><SalesDashboard onReprintZ={handleReprintZReport} /><div className="hidden print:block mt-8"><PrintableView items={items} /></div></div>}
                
                {/* --- CASHIER VIEW --- */}
                {view === 'cashier' && (<CashierView items={items} categories={categories} tables={tables} onProcessPayment={handleStartPaymentFromCashier} onVoidOrder={handleVoidAndPrint} onReprintOrder={handleReprintOrder} onStopService={handleStopService} onOpenExpense={() => setIsExpenseModalOpen(true)} />)}
                
                {view === 'register_control' && <RegisterControlView session={registerSession} onOpen={handleOpenRegister} onClose={handleCloseRegister} staff={staff} stats={sessionStats} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} />}
                {view === 'staff_admin' && !isCashierOnly && <StaffManagerView staff={staff} roles={roles} onAddStaff={handleAddStaff} onUpdateStaff={handleUpdateStaff} onDeleteStaff={handleDeleteStaff} onManageRoles={() => setIsRoleModalOpen(true)} onPrintCredential={handlePrintCredential} />}
                {view === 'credential_print' && credentialToPrint && (<div className="flex flex-col items-center w-full min-h-screen bg-gray-100"><div className="w-full max-w-md p-4 flex justify-start no-print"><button onClick={() => setView('staff_admin')} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 font-bold"><ArrowLeft size={20} /> Volver a la Lista</button></div><CredentialPrintView member={credentialToPrint} appName={appName} /></div>)}
                
                {/* --- SECCIÓN DE ADMIN --- */}
                {view === 'admin' && !isCashierOnly && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex gap-2">
                        <button aria-label="Configuración" onClick={() => setIsBrandingModalOpen(true)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><Settings size={20}/></button>
                        
                        <button onClick={() => setIsTableModalOpen(true)} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full font-bold text-sm hover:bg-purple-100 flex items-center gap-2 transition-colors border border-purple-100"><LayoutGrid size={16}/> Mesas</button>
                        
                        <button onClick={() => setIsExpenseTypeModalOpen(true)} className="px-4 py-2 bg-red-50 text-red-700 rounded-full font-bold text-sm hover:bg-red-100 flex items-center gap-2 transition-colors border border-red-100"><DollarSign size={16}/> Tipos Gasto</button>

                        <button onClick={() => setIsCategoryModalOpen(true)} className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors border border-gray-200"><Settings size={16}/> Cats</button>

                        <button onClick={() => setIsQuickEditMode(!isQuickEditMode)} className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${isQuickEditMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-400' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{isQuickEditMode ? '⚡ MODO RÁPIDO ACTIVO' : '⚡ Activar Edición Rápida'}</button>
                        <div className="flex flex-wrap gap-2 h-10 overflow-y-hidden">{filterCategories.map(cat => (<button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === cat ? 'bg-orange-500 text-white' : 'bg-white border'}`}>{cat}</button>))}</div>
                      </div>
                      <button aria-label="Nuevo Producto" onClick={() => { setCurrentItem(null); setIsModalOpen(true); }} className="px-4 py-2 bg-green-600 text-white rounded-full flex gap-2 shadow hover:bg-green-700 transition-colors"><Plus size={20}/> Nuevo</button>
                    </div>
                    <div className="bg-white rounded-xl shadow border overflow-hidden">
                      <table className="w-full text-left">
                        <thead><tr className="bg-gray-50 text-xs uppercase text-gray-500"><th className="p-4">Producto</th><th className="p-4 text-center">Stock</th><th className="p-4 text-right">Costo</th><th className="p-4 text-right">Precio</th><th className="p-4 text-right">Margen</th><th className="p-4 text-right">Acciones</th></tr></thead>
                        <tbody className="divide-y">{filteredItems.map(item => (<AdminRow key={item.id} item={item} onEdit={(i) => { setCurrentItem(i); setIsModalOpen(true); }} onDelete={handleDelete} isQuickEdit={isQuickEditMode} onQuickUpdate={handleQuickUpdate} />))}</tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {view === 'pin_login' && <PinLoginView staffMembers={staff} onLoginSuccess={handleStaffPinLogin} onCancel={() => setView('landing')} />}
            {view === 'pos' && (<POSInterface items={items} categories={categories} staffMember={staffMember} onCheckout={handlePOSCheckout} onPrintOrder={handleSendToKitchen} onExit={() => setView('landing')} onOpenServiceModal={() => setIsServiceModalOpen(true)} autoLockTime={autoLockTime} />)}
            {view === 'receipt_view' && <Receipt data={lastSale} onPrint={handlePrint} onClose={handleReceiptClose} />}
            
            {/* --- SECCIÓN MENÚ CLIENTES (NAVIDAD NEÓN + BOTÓN SALIR) --- */}
            {view === 'menu' && (<>
              {/* FONDO GLOBAL FIJO */}
              <div className="fixed inset-0 z-0 pointer-events-none bg-[#0a0a0a]">
                 <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-red-600/20 blur-[100px] rotate-45 animate-pulse"></div>
                 <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-green-600/20 blur-[100px] rotate-[-45] animate-pulse delay-500"></div>
                 <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px', animation: 'snowfallNative 10s linear infinite', opacity: 0.3}}></div>
                 <style jsx>{`@keyframes snowfallNative { from {background-position: 0 0;} to {background-position: 20px 100vh;} }`}</style>
              </div>

              {filter === 'Todos' ? (
                // --- GRID DE CATEGORÍAS ---
                <div className="animate-in fade-in pb-20 relative z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-6">
                  
                  {/* BOTÓN VOLVER/SALIR DISCRETO */}
                  <button onClick={() => setView('landing')} className="absolute top-4 left-4 z-50 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition-all" title="Salir del Menú"><Home size={24} /></button>

                  <div className="text-center mb-10 mt-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Trees size={28} className="text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-white to-green-400 tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] uppercase">NUESTRO MENÚ</h2>
                        <Trees size={28} className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] scale-x-[-1]" />
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm flex justify-center items-center gap-2 before:h-px before:w-6 before:bg-red-500 after:h-px after:w-6 after:bg-green-500 opacity-80"><Gift size={14} className="text-red-400"/> Selecciona una categoría <Gift size={14} className="text-green-400"/></p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2 max-w-5xl mx-auto">
                    {categories.map((cat, index) => {
                      const borderColors = ['border-red-500/60 shadow-[0_0_15px_-3px_rgba(220,38,38,0.5)] text-red-100', 'border-green-500/60 shadow-[0_0_15px_-3px_rgba(34,197,94,0.5)] text-green-100', 'border-yellow-500/60 shadow-[0_0_15px_-3px_rgba(234,179,8,0.5)] text-yellow-100', 'border-purple-500/60 shadow-[0_0_15px_-3px_rgba(168,85,247,0.5)] text-purple-100'];
                      const currentStyle = borderColors[index % borderColors.length];
                      return (
                        <button key={cat} onClick={() => setFilter(cat)} className={`relative h-40 rounded-3xl overflow-hidden bg-black/60 backdrop-blur-md group border-2 border-dashed transition-all duration-500 hover:scale-[1.03] active:scale-95 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] ${currentStyle}`}>
                          <div className={`absolute top-2 left-2 w-2 h-2 rounded-full animate-pulse ${index%2 ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-green-500 shadow-[0_0_5px_green]'}`}></div><div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full animate-pulse delay-500 ${index%3 ? 'bg-blue-500 shadow-[0_0_5px_blue]' : 'bg-yellow-500 shadow-[0_0_5px_yellow]'}`}></div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4"><Gift size={20} className={`mb-2 opacity-50 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_5px_currentColor] ${index%2 ? 'text-green-400' : 'text-red-400'}`}/><span className="font-black text-2xl uppercase tracking-wider drop-shadow-md text-center">{cat}</span></div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                // --- LISTA DE PRODUCTOS ---
                <div className="animate-in slide-in-from-right duration-300 relative z-10 min-h-screen -mx-4 sm:-mx-6 lg:-mx-8">
                  <div className="sticky top-16 z-20 bg-black/70 backdrop-blur-xl py-4 mb-6 border-b border-white/10 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)] px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 max-w-7xl mx-auto">
                      <button aria-label="Volver al menú" onClick={() => setFilter('Todos')} className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 border border-white/10 shadow-lg transition-transform active:scale-90 group backdrop-blur-md"><ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform"/></button>
                      <div><h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 uppercase tracking-wide leading-none drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]">{filter}</h2><p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1"><Trees size={10} className="text-green-500"/> Explora nuestros productos</p></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    {filteredItems.length > 0 ? (filteredItems.map(item => (<div key={item.id} className="rounded-2xl overflow-hidden p-1 bg-gradient-to-br from-white/10 to-transparent border border-white/5 shadow-lg"><MenuCard item={item} /></div>))) : (<div className="col-span-full text-center py-20 text-gray-500 flex flex-col items-center"><Search size={48} className="mb-2 opacity-20 text-white"/><p className="text-gray-400">No hay productos en esta categoría.</p></div>)}
                  </div>
                </div>
              )}
            </>)}
          </main>
          <div className={`fixed bottom-0 w-full p-1 text-[10px] text-center text-white ${dbStatus === 'connected' ? 'bg-green-600' : 'bg-red-600'}`}> {dbStatus === 'connected' ? 'Sistema Online' : 'Desconectado'} </div>
        </>
      )}
      <OpenRegisterModal isOpen={isOpenRegisterModalOpen} onClose={() => {}} onOpenRegister={handleOpenRegister} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} total={orderToPay ? orderToPay.total : (pendingSale ? pendingSale.cart.reduce((acc, i) => acc + (i.price * i.qty), 0) : 0)} onConfirm={handleFinalizeSale} />
      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} item={currentItem} categories={categories} />
      <CategoryManager isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={categories} onAdd={handleAddCategory} onRename={handleRenameCategory} onDelete={handleDeleteCategory} />
      <RoleManager isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} roles={roles} onAdd={handleAddRole} onRename={handleRenameRole} onDelete={handleDeleteRole} />
      
      <TableManager isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} tables={tables} onAdd={handleAddTable} onRename={handleRenameTable} onDelete={handleDeleteTable} />
      
      <ExpenseTypeManager isOpen={isExpenseTypeModalOpen} onClose={() => setIsExpenseTypeModalOpen(false)} expenseTypes={expenseTypes} onAdd={handleAddExpenseType} onRename={handleRenameExpenseType} onDelete={handleDeleteExpenseType} />

      <BrandingModal isOpen={isBrandingModalOpen} onClose={() => setIsBrandingModalOpen(false)} onSave={handleSaveBranding} currentLogo={logo} currentName={appName} currentAutoLock={autoLockTime} />
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} />
      <ServiceStartModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} services={items.filter(i => i.category === 'Servicios')} onStart={handleStartService} occupiedLocations={activeServices.map(s => s.note)} />
      
      <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSave={handleAddExpense} expenseTypes={expenseTypes} />
    </div>
  );
}