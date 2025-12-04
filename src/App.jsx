// src/App.jsx - VERSIÓN FINAL CON LOGO EN CARGA
import React, { useState, useEffect } from 'react';
import { 
  Wifi, WifiOff, Home, LogOut, User, ClipboardList, Users, FileText, 
  Printer, Settings, Plus, Edit2, Search, ChefHat, DollarSign, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { onAuthStateChanged, signOut, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { collection, doc, setDoc, addDoc, deleteDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

import { auth, db, ROOT_COLLECTION, isPersonalProject, firebaseConfig } from './config/firebase';
import LandingPage from './components/LandingPage';
import POSInterface from './components/POSInterface';
import StaffManagerView from './components/StaffManagerView';
import SalesDashboard from './components/SalesDashboard';
import Receipt from './components/Receipt';
import PaymentModal from './components/PaymentModal';
import CashierView from './components/CashierView';

import { 
  AuthModal, BrandingModal, ProductModal, CategoryManager, RoleManager 
} from './components/Modals';
import { 
  MenuCard, PinLoginView, CredentialPrintView, PrintableView, AdminRow 
} from './components/Views';

// --- 🔴 PEGA AQUÍ EL ENLACE DE TU LOGO (Entre las comillas) ---
const LOGO_URL_FIJO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAEsASwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDx2iiityQooooAKKKKAAYzycCiiigA7UUUUAFFFFABRRRQAUUUUAFFFFABRRxzxRQAUpGFB4596SigAoopeuABQAgx3ooIxRQAUUUUAFFFBOTmgAooooAPbPFBooz27UAFAoozxj+lABRRnjFFABRRRQAUA4PqO49aKKACjFFPTy/LbcxDDG0AdaYhvGDkc9qSiigAooPWigAooopAFFFFABg4zjj1oxRnjHaigAooooAAcEHrRRRQMKKKKACil2NsL4+UHGfekoEFFFFAwooooAMmiiigAooooAKKKKACiiigAoJJ6nNFFABRRRQA+IKzqHYKpPJpHUI5UHdg4zTaUnJJximITj6UUUUAAJHSijBwD2NFAADiiiigAH1ooooAKKKKACgHBzRiigAooooAKKKKACiiigA9qKKKAA47D9aKKKACiiikAUUUUDCiiigAooooAKKKBQAUUUUAFFFFABRRQOvNMQD64ooooAKMHGe1FGfagAoyQCPWiigAoooHPfFABRRRQAUUUUAFFFFABRSqRkBs7c84ofbuO3O3PGetACUUUdqACigEDqM0UAGeMUUUGgAooooAKKKKAA4zxxQaMUUAFGDjOOKKKACiijBoAKKKKACiijPvSGFFFFMQUUcZ4NTW8JmmVccE8mgCGgdealmhMEhRiCR6VET2oADjPHSjGKKKACiiigAooooAKKKKACiiigAoNFFABRRQcdqAAUEYOKKKACiiigAooooAKKKKAJIRGZFEhO3vtpjbcnbnHbNJQaACiiigAooooAKnijQplplU56EGoCMGimAUUUVIwooopiClBIOQcGkooAc7F3LHkk5NNxxnI69KXtmkoAKKKKAAHBzRRVzS9I1HWroWumWU13Mf4YkLYHqfQe54oAp0V6fo3wS1B4RdeI9Sg0uEctEpDuB3BbO1frk1vDTvhh4dgEKWB1ideGkcmQt75OE/IVlOtCG7Oihha1d2pRb9DxKivahq3w9YgDwanJxxEn+Ncf8AFjwzpfhrxDarpMP2e3urYSmHeW2tuIPXkA8frSp1oVPhZeIwVfDW9tG1zhaKKBjIz0rY5AozxjH40UUAFFFFABRRRQAUDHcUUUAFFGaciM7AKMmgBtFS3EDQSlGI46c1FQAUUUUAFFFFABRRQevFABRRRQAUUUUhhRRRTEHfiiiigAooooAKkt7ee7uEt7aGSaaQ7UjjUszH0AHWuv8ACHwx1vxXGt4dthpxP/HzMOXHfYvU/Xge9eiJqHhj4eWzWHh20S81AjE125DEn3bv/urgfjWVStGmryZ1YbCVsTPkpRuzm/DnwfENsmqeML1dPthz9lVwHI9GboPoMn6GuguvHOn6JanTPCOmwWtunHmlMAnpkDqT7tzXKatreoa3c+ff3DSn+Feip9B0FUK8mtjZT0joj7XAcO0qVp4j3n26f8Euahq+oarJ5l/eSzkdA7cD6DoKp1f03QtU1dgtjZSzD+8Fwo/E8V22kfCssqyavebSesVv2+rH/CuaNKpUd7HrV8fg8FHllJLyX+SOP8LxXEviXTxaxeZIs6tj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"; 


const INITIAL_CATEGORIES = []; 
const INITIAL_ROLES = ['Garzón', 'Cajero', 'Cocinero', 'Administrador'];

export default function App() {
  const [view, setView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);

  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [roles, setRoles] = useState(INITIAL_ROLES);
  
  const [dbStatus, setDbStatus] = useState('connecting');
  const [dbErrorMsg, setDbErrorMsg] = useState('');
  const [logo, setLogo] = useState(null);
  const [appName, setAppName] = useState(""); 

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  
  // Estados de Operación
  const [currentItem, setCurrentItem] = useState(null);
  const [filter, setFilter] = useState('Todos');
  const [credentialToPrint, setCredentialToPrint] = useState(null);
  const [staffMember, setStaffMember] = useState(null);
  
  // Estados de Pago
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingSale, setPendingSale] = useState(null);
  const [orderToPay, setOrderToPay] = useState(null); 
  const [lastSale, setLastSale] = useState(null);

  // --- HANDLERS ---
  const handleLogin = (userApp) => { setIsAuthModalOpen(false); setView('admin'); toast.success(`Bienvenido`); };
  const handleLogout = async () => { await signOut(auth); setView('landing'); toast('Sesión cerrada', { icon: '👋' }); };
  const handleEnterMenu = () => { setFilter('Todos'); setView('menu'); };
  const handleEnterStaff = () => setView('pin_login');
  const handleEnterAdmin = () => { if (currentUser && !currentUser.isAnonymous) setView('admin'); else setIsAuthModalOpen(true); };
  const handlePrintCredential = (member) => { setCredentialToPrint(member); setView('credential_print'); };
  
  // --- HANDLER: INICIO DE SESIÓN CON PIN (CORREGIDO) ---
  const handleStaffPinLogin = (member) => { 
    setStaffMember(member); 
    
    // Si es Cajero o Admin, lo mandamos directo a la gestión de Caja
    if (member.role === 'Cajero' || member.role === 'Administrador') {
        setView('cashier'); 
        toast.success(`Caja abierta: ${member.name}`);
    } else {
        // Si es Garzón/Cocinero, va al POS a tomar pedidos
        setView('pos'); 
        toast.success(`Turno iniciado: ${member.name}`); 
    }
  };
    
    // Si es Cajero o Admin, lo mandamos directo a la gestión de Caja
    if (member.role === 'Cajero' || member.role === 'Administrador') {
        setView('cashier'); 
        toast.success(`Caja abierta: ${member.name}`);
    } else {
        // Si es Garzón/Cocinero, va al POS a tomar pedidos
        setView('pos'); 
        toast.success(`Turno iniciado: ${member.name}`); 
    }
  };
  
  const handlePrint = () => window.print();

  const handleStartPaymentFromCashier = (order) => {
      setOrderToPay(order); 
      setPendingSale({ cart: order.items, clearCart: () => {} });
      setIsPaymentModalOpen(true);
  };

  const handlePOSCheckout = (cart, clearCart) => {
    setOrderToPay(null);
    setPendingSale({ cart, clearCart });
    setIsPaymentModalOpen(true);
  };

  const handleSendToKitchen = async (cart, clearCart) => {
    if (cart.length === 0) return;
    const toastId = toast.loading('Procesando comanda...');
    try {
        const totalOrder = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const orderData = {
            date: new Date().toISOString(),
            staffId: staffMember ? staffMember.id : 'anon',
            staffName: staffMember ? staffMember.name : 'Mesero',
            orderId: 'ORD-' + Math.floor(Math.random() * 10000), 
            items: cart,
            total: totalOrder,
            status: 'pending'
        };
        const ordersCol = isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`;
        await addDoc(collection(db, ordersCol), orderData);
        const preCheckData = { ...orderData, type: 'order', date: new Date().toLocaleString() };
        clearCart([]);
        setLastSale(preCheckData);
        toast.success('Pedido enviado a caja', { id: toastId });
        setView('receipt_view'); 
    } catch (error) {
        console.error(error);
        toast.error('Error al enviar pedido', { id: toastId });
    }
  };

  const handleFinalizeSale = async (paymentResult) => {
    if (!db) return;
    const toastId = toast.loading('Procesando pago...');
    setIsPaymentModalOpen(false);
    
    const itemsToProcess = orderToPay ? orderToPay.items : pendingSale.cart;
    const { paymentsList, totalPaid, change } = paymentResult;
    const totalToProcess = totalPaid - change;

    try {
      const batchPromises = [];
      const timestamp = new Date();
      const saleData = {
        date: timestamp.toISOString(),
        total: totalToProcess,
        items: itemsToProcess,
        staffId: staffMember ? staffMember.id : (orderToPay ? orderToPay.staffId : 'admin'),
        staffName: staffMember ? staffMember.name : (orderToPay ? orderToPay.staffName : 'Caja'),
        payments: paymentsList,
        totalPaid: totalPaid,
        changeGiven: change
      };
      
      const salesCollection = isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`;
      const docRef = await addDoc(collection(db, salesCollection), saleData);

      itemsToProcess.forEach(item => {
        if (item.stock !== undefined && item.stock !== '') {
          const newStock = parseInt(item.stock) - item.qty;
          batchPromises.push(updateDoc(doc(db, getCollName('items'), item.id), { stock: newStock }));
        }
      });

      if (orderToPay) {
          const ordersCol = isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`;
          batchPromises.push(deleteDoc(doc(db, ordersCol, orderToPay.id)));
      }

      await Promise.all(batchPromises);

      const receiptData = {
        businessName: appName,
        date: timestamp.toLocaleString(),
        staffName: saleData.staffName,
        orderId: docRef.id,
        items: itemsToProcess,
        total: totalToProcess,
        payments: paymentsList,
        change: change
      };

      setLastSale(receiptData);
      if (pendingSale && pendingSale.clearCart) pendingSale.clearCart([]);
      setPendingSale(null);
      setOrderToPay(null);
      toast.success('¡Cobro exitoso!', { id: toastId });
      setView('receipt_view');
    } catch (e) {
      console.error(e);
      toast.error('Error al cobrar', { id: toastId });
    }
  };

  // --- EFECTOS ---
  useEffect(() => {
    const initAuth = async () => {
        if (!auth.currentUser) {
             if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token && !isPersonalProject) {
                await signInWithCustomToken(auth, __initial_auth_token);
             } else {
                await signInAnonymously(auth).catch(() => setDbStatus('warning'));
             }
        }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => { setCurrentUser(u); if (u) { setDbStatus('connected'); setDbErrorMsg(''); } });
  }, []);

  useEffect(() => {
    if (!db) return;
    const itemsUnsub = onSnapshot(collection(db, getCollName('items')), (s) => {
      const rawItems = s.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const uniqueItems = Array.from(new Map(rawItems.map(item => [item.id, item])).values());
      setItems(uniqueItems);
    }, (e) => { 
        if (e.code === 'permission-denied') { setDbStatus('error'); setDbErrorMsg(currentUser ? 'Sin permisos.' : 'Inicia sesión.'); } 
    });
    const staffUnsub = onSnapshot(collection(db, getCollName('staff')), (s) => setStaff(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const settingsUnsub = onSnapshot(collection(db, getCollName('settings')), (s) => {
        let brandingLoaded = false;
        s.docs.forEach(d => {
            const data = d.data();
            if (d.id === 'categories') setCategories(data.list || []);
            if (d.id === 'roles') setRoles(data.list || INITIAL_ROLES);
            if (d.id === 'branding') { 
              setLogo(data.logo); 
              if(data.appName) setAppName(data.appName);
              brandingLoaded = true;
            }
        });
        setIsLoadingApp(false);
    });
    return () => { itemsUnsub(); staffUnsub(); settingsUnsub(); };
  }, [currentUser]);

  const getCollName = (type) => {
    const base = isPersonalProject ? '' : ROOT_COLLECTION;
    if (type === 'items') return isPersonalProject ? 'menuItems' : `${ROOT_COLLECTION}menuItems`;
    if (type === 'staff') return isPersonalProject ? 'staffMembers' : `${ROOT_COLLECTION}staffMembers`;
    return isPersonalProject ? 'settings' : `${ROOT_COLLECTION}settings`;
  }

  // Crud Wrappers
  const handleSave = async (d) => { try { if(currentItem) await setDoc(doc(db, getCollName('items'), currentItem.id), d); else await addDoc(collection(db, getCollName('items')), d); toast.success('Guardado'); setIsModalOpen(false); } catch { toast.error('Error'); }};
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
  const handleSaveBranding = (l, n) => { setDoc(doc(db, getCollName('settings'), 'branding'), { logo: l, appName: n }, { merge: true }); setLogo(l); setAppName(n); toast.success('Marca actualizada'); };

  const filterCategories = ['Todos', ...categories];
  const filteredItems = filter === 'Todos' ? items : items.filter(i => i.category === filter);
  const isAdminMode = view === 'admin' || view === 'report' || view === 'staff_admin' || view === 'cashier';

  // --- PANTALLA DE CARGA MEJORADA ---
  if (isLoadingApp) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 animate-in fade-in">
        <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center">
           <div className="relative mb-4">
             <div className="absolute inset-0 bg-orange-200 rounded-full animate-ping opacity-75"></div>
             <div className="relative bg-white p-4 rounded-full border-4 border-orange-500 overflow-hidden w-24 h-24 flex items-center justify-center">
               {/* AQUÍ SE MUESTRA TU LOGO SI LO PEGASTE ARRIBA */}
               {LOGO_URL_FIJO ? (
                 <img src={LOGO_URL_FIJO} alt="Cargando" className="w-full h-full object-contain animate-pulse" />
               ) : (
                 <ChefHat size={48} className="text-orange-500" />
               )}
             </div>
           </div>
           <h2 className="text-xl font-bold text-gray-800">Cargando sistema...</h2>
           <p className="text-sm text-gray-400 mt-2">Conectando con la nube</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <Toaster position="top-center" reverseOrder={false} />
      
      {view === 'landing' ? (
        <LandingPage appName={appName || 'Cargando...'} logo={logo} onSelectClient={handleEnterMenu} onSelectStaff={handleEnterStaff} onSelectAdmin={handleEnterAdmin} />
      ) : (
        <>
          <header className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100 no-print">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <div className="flex items-center gap-3" onClick={() => isAdminMode && setIsBrandingModalOpen(true)}>
                <div className={`rounded-lg overflow-hidden flex items-center justify-center ${logo ? 'bg-white' : 'bg-orange-500 p-2 text-white'}`} style={{ width: '44px', height: '44px' }}>{logo ? <img src={logo} className="w-full h-full object-contain"/> : <ChefHat size={28} />}</div>
                <div><h1 className="text-xl font-bold text-gray-800 leading-none">{appName}</h1><span className="text-xs text-gray-500 font-medium uppercase">Cloud Menu</span></div>
              </div>
              <div className="flex items-center gap-2 header-buttons">
                {!isAdminMode && <button onClick={() => setView('landing')} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><Home size={20}/></button>}
                {isAdminMode && <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-red-50 text-red-600"><LogOut size={16}/>Salir</button>}
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isAdminMode && (
              <>
                <div className="mb-8 no-print overflow-x-auto">
                  <div className="flex border-b border-gray-200 min-w-max">
                    <button onClick={() => setView('admin')} className={`pb-4 px-6 text-lg font-bold border-b-2 transition-colors flex gap-2 ${view === 'admin' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><ClipboardList/> Inventario</button>
                    <button onClick={() => setView('cashier')} className={`pb-4 px-6 text-lg font-bold border-b-2 transition-colors flex gap-2 ${view === 'cashier' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><DollarSign/> Caja / Pedidos</button>
                    <button onClick={() => setView('staff_admin')} className={`pb-4 px-6 text-lg font-bold border-b-2 transition-colors flex gap-2 ${view === 'staff_admin' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><Users/> Personal</button>
                    <button onClick={() => setView('report')} className={`pb-4 px-6 text-lg font-bold border-b-2 transition-colors flex gap-2 ${view === 'report' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}><FileText/> Reporte</button>
                  </div>
                </div>

                {view === 'report' && <div className="animate-in fade-in"><SalesDashboard /><div className="hidden print:block mt-8"><PrintableView items={items} /></div></div>}
                {view === 'cashier' && <CashierView onProcessPayment={handleStartPaymentFromCashier} />}
                {view === 'staff_admin' && <StaffManagerView staff={staff} roles={roles} onAddStaff={handleAddStaff} onUpdateStaff={handleUpdateStaff} onDeleteStaff={handleDeleteStaff} onManageRoles={() => setIsRoleModalOpen(true)} onPrintCredential={handlePrintCredential} />}
                {view === 'credential_print' && credentialToPrint && <div className="flex flex-col items-center"><button onClick={() => setView('staff_admin')} className="no-print mb-4 px-4 py-2 bg-gray-200 rounded">Volver</button><CredentialPrintView member={credentialToPrint} appName={appName} /></div>}
                {view === 'admin' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2">
                            <button onClick={() => setIsCategoryModalOpen(true)} className="p-2 bg-gray-100 rounded-full"><Settings size={20}/></button>
                            <div className="flex flex-wrap gap-2">{filterCategories.map(cat => (<button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === cat ? 'bg-orange-500 text-white' : 'bg-white border'}`}>{cat}</button>))}</div>
                        </div>
                        <button onClick={() => { setCurrentItem(null); setIsModalOpen(true); }} className="px-4 py-2 bg-green-600 text-white rounded-full flex gap-2 shadow"><Plus size={20}/> Nuevo</button>
                    </div>
                    <div className="bg-white rounded-xl shadow border overflow-hidden">
                      <table className="w-full text-left"><thead><tr className="bg-gray-50 text-xs uppercase text-gray-500"><th className="p-4">Producto</th><th className="p-4 text-center">Stock</th><th className="p-4 text-right">Precio</th><th className="p-4 text-right">Acciones</th></tr></thead>
                        <tbody className="divide-y">{filteredItems.map(item => (<AdminRow key={item.id} item={item} onEdit={(i) => { setCurrentItem(i); setIsModalOpen(true); }} onDelete={handleDelete} />))}</tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {view === 'pin_login' && <PinLoginView staffMembers={staff} onLoginSuccess={handleStaffPinLogin} onCancel={() => setView('landing')} />}
            {view === 'pos' && <POSInterface items={items} categories={categories} staffMember={staffMember} onCheckout={handlePOSCheckout} onPrintOrder={handleSendToKitchen} onExit={() => setView('landing')} />}
            {view === 'receipt_view' && <Receipt data={lastSale} onPrint={handlePrint} onClose={() => { if(currentUser && !currentUser.isAnonymous) setView('cashier'); else setView('pos'); }} />}

            {/* --- MENÚ CLIENTE: DISEÑO PREMIUM --- */}
            {view === 'menu' && (
              <>
                {filter === 'Todos' ? (
                   <div className="animate-in fade-in pb-20">
                      <div className="text-center mb-8 mt-6">
                        <div className="inline-block p-3 rounded-full bg-black mb-3 shadow-lg shadow-purple-500/20">
                            {logo ? <img src={logo} className="w-12 h-12 object-contain" alt="Logo"/> : <ChefHat className="text-white" size={32}/>}
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">NUESTRO MENÚ</h2>
                        <p className="text-gray-500 font-medium">Selecciona una categoría</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
                        {categories.map((cat, index) => {
                           const gradients = ['from-orange-500 to-purple-600', 'from-pink-500 to-blue-500', 'from-purple-500 to-pink-500', 'from-yellow-400 to-green-500', 'from-green-400 to-blue-600', 'from-orange-400 to-yellow-500'];
                           const currentGradient = gradients[index % gradients.length];
                           return (
                             <button key={cat} onClick={() => setFilter(cat)} className={`relative h-40 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl active:scale-95 transition-all group bg-gradient-to-br ${currentGradient}`}>
                                {logo && (<div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"><img src={logo} alt="" className="w-[80%] h-[80%] object-contain opacity-20 mix-blend-overlay rotate-12 scale-125 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6" /></div>)}
                                <div className="absolute inset-0 flex items-center justify-center z-10"><span className="text-white font-black text-3xl uppercase tracking-wide drop-shadow-md text-center px-4">{cat}</span></div>
                             </button>
                           )
                        })}
                      </div>
                   </div>
                ) : (
                   <div className="animate-in slide-in-from-right duration-300">
                      <div className="sticky top-20 z-20 bg-gray-50/95 backdrop-blur py-2 mb-4 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                             <button onClick={() => setFilter('Todos')} className="p-2 bg-black text-white rounded-full hover:bg-gray-800 shadow-lg transition-transform active:scale-90"><ArrowLeft size={24} /></button>
                             <h2 className="text-2xl font-black text-gray-800 uppercase tracking-wide">{filter}</h2>
                          </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pb-20 px-2">
                        {filteredItems.length > 0 ? (filteredItems.map(item => (<MenuCard key={item.id} item={item} />))) : (<div className="col-span-full text-center py-20 text-gray-400 flex flex-col items-center"><Search size={48} className="mb-2 opacity-20"/><p>No hay productos en esta categoría.</p></div>)}
                      </div>
                   </div>
                )}
              </>
            )}
          </main>
          <div className={`fixed bottom-0 w-full p-1 text-[10px] text-center text-white ${dbStatus === 'connected' ? 'bg-green-600' : 'bg-red-600'}`}> {dbStatus === 'connected' ? 'Sistema Online' : 'Desconectado'} </div>
        </>
      )}
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} total={orderToPay ? orderToPay.total : (pendingSale ? pendingSale.cart.reduce((acc, i) => acc + (i.price * i.qty), 0) : 0)} onConfirm={handleFinalizeSale} />
      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} item={currentItem} categories={categories} />
      <CategoryManager isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={categories} onAdd={handleAddCategory} onRename={handleRenameCategory} onDelete={handleDeleteCategory} />
      <RoleManager isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} roles={roles} onAdd={handleAddRole} onRename={handleRenameRole} onDelete={handleDeleteRole} />
      <BrandingModal isOpen={isBrandingModalOpen} onClose={() => setIsBrandingModalOpen(false)} onSave={handleSaveBranding} currentLogo={logo} currentName={appName} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} />
    </div>
  );
}