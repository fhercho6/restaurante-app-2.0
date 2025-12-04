// src/App.jsx - VERSIÓN FINAL (Corregida)
import React, { useState, useEffect } from 'react';
import { 
  Wifi, WifiOff, Home, LogOut, User, ClipboardList, Users, FileText, 
  Printer, Settings, Plus, Edit2, Search, ChefHat, DollarSign 
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
import CashierView from './components/CashierView'; // <--- AGREGADO

import { 
  AuthModal, BrandingModal, ProductModal, CategoryManager, RoleManager 
} from './components/Modals';
import { 
  MenuCard, PinLoginView, CredentialPrintView, PrintableView, AdminRow 
} from './components/Views';

const INITIAL_CATEGORIES = ['Entradas', 'Platos Fuertes', 'Postres', 'Bebidas', 'Hamburguesas', 'Tacos'];
const INITIAL_ROLES = ['Garzón', 'Cajero', 'Cocinero', 'Administrador'];

export default function App() {
  const [view, setView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [roles, setRoles] = useState(INITIAL_ROLES);
  
  const [dbStatus, setDbStatus] = useState('connecting');
  const [dbErrorMsg, setDbErrorMsg] = useState('');
  const [logo, setLogo] = useState(null);
  const [appName, setAppName] = useState("Delizioso");

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
  const [orderToPay, setOrderToPay] = useState(null); // <--- NUEVO
  const [lastSale, setLastSale] = useState(null);

  // --- HANDLERS NAVEGACIÓN ---
  const handleLogin = (userApp) => { setIsAuthModalOpen(false); setView('admin'); toast.success(`Bienvenido`); };
  const handleLogout = async () => { await signOut(auth); setView('landing'); toast('Sesión cerrada', { icon: '👋' }); };
  const handleEnterMenu = () => setView('menu');
  const handleEnterStaff = () => setView('pin_login');
  const handleEnterAdmin = () => { if (currentUser && !currentUser.isAnonymous) setView('admin'); else setIsAuthModalOpen(true); };
  const handlePrintCredential = (member) => { setCredentialToPrint(member); setView('credential_print'); };
  
  const handleStaffPinLogin = (member) => { 
    setStaffMember(member); 
    setView('pos'); 
    toast.success(`Turno iniciado: ${member.name}`); 
  };
  
  const handlePrint = () => window.print();

  // --- LÓGICA DEL CAJERO (FALTABA ESTA FUNCIÓN) ---
  const handleStartPaymentFromCashier = (order) => {
      setOrderToPay(order); 
      setPendingSale({ 
          cart: order.items, 
          clearCart: () => {} 
      });
      setIsPaymentModalOpen(true);
  };

  // --- LÓGICA DE VENTAS ---
  const handlePOSCheckout = (cart, clearCart) => {
    // Venta directa desde POS (Caja Rápida)
    setOrderToPay(null);
    setPendingSale({ cart, clearCart });
    setIsPaymentModalOpen(true);
  };

  // MESERO: Enviar a Caja (Imprimir Comanda)
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

        const preCheckData = { 
            ...orderData, 
            type: 'order',
            date: new Date().toLocaleString() 
        };
        
        clearCart([]);
        setLastSale(preCheckData);
        toast.success('Pedido enviado a caja', { id: toastId });
        setView('receipt_view'); 

    } catch (error) {
        console.error(error);
        toast.error('Error al enviar pedido', { id: toastId });
    }
  };

  // FINALIZAR VENTA (Guardar y Cobrar)
  const handleFinalizeSale = async (paymentResult) => {
    if (!db) return;
    
    const toastId = toast.loading('Procesando pago...');
    setIsPaymentModalOpen(false);
    
    const itemsToProcess = orderToPay ? orderToPay.items : pendingSale.cart;
    const { paymentsList, totalPaid, change } = paymentResult;
    const totalToProcess = totalPaid - change; // Total real de la venta

    try {
      const batchPromises = [];
      const timestamp = new Date();

      // A. Crear registro en Ventas
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

      // B. Descontar Stock
      itemsToProcess.forEach(item => {
        if (item.stock !== undefined && item.stock !== '') {
          const newStock = parseInt(item.stock) - item.qty;
          batchPromises.push(updateDoc(doc(db, getCollName('items'), item.id), { stock: newStock }));
        }
      });

      // C. Borrar de Pendientes (Si vino de Caja)
      if (orderToPay) {
          const ordersCol = isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`;
          batchPromises.push(deleteDoc(doc(db, ordersCol, orderToPay.id)));
      }

      await Promise.all(batchPromises);

      // D. Ticket Final
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

    // 1. CARGA DE PRODUCTOS (Con filtro Anti-Duplicados)
    const itemsUnsub = onSnapshot(collection(db, getCollName('items')), (s) => {
      const rawItems = s.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // ESTA ES LA CORRECCIÓN MÁGICA:
      // Usamos un Map para asegurar que cada ID sea único
      const uniqueItems = Array.from(new Map(rawItems.map(item => [item.id, item])).values());
      
      setItems(uniqueItems);
    }, (e) => { 
        if (e.code === 'permission-denied') { 
            setDbStatus('error'); 
            setDbErrorMsg(currentUser ? 'Sin permisos.' : 'Inicia sesión.'); 
        } 
    });

    // 2. CARGA DE PERSONAL
    const staffUnsub = onSnapshot(collection(db, getCollName('staff')), (s) => {
        setStaff(s.docs.map(d => ({id: d.id, ...d.data()})));
    });

    // 3. CARGA DE CONFIGURACIÓN
    const settingsUnsub = onSnapshot(collection(db, getCollName('settings')), (s) => {
        s.docs.forEach(d => {
            const data = d.data();
            if (d.id === 'categories') setCategories(data.list || INITIAL_CATEGORIES);
            if (d.id === 'roles') setRoles(data.list || INITIAL_ROLES);
            if (d.id === 'branding') { setLogo(data.logo); if(data.appName) setAppName(data.appName); }
        });
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
  const handleSaveBranding = (l, n) => { setDoc(doc(db, getCollName('settings'), 'branding'), { logo: l, appName: n }, { merge: true }); setLogo(l); setAppName(n); };

  const filterCategories = ['Todos', ...categories];
  const filteredItems = filter === 'Todos' ? items : items.filter(i => i.category === filter);
  const isAdminMode = view === 'admin' || view === 'report' || view === 'staff_admin' || view === 'cashier';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <Toaster position="top-center" reverseOrder={false} />
      
      {view === 'landing' ? (
        <LandingPage appName={appName} logo={logo} onSelectClient={handleEnterMenu} onSelectStaff={handleEnterStaff} onSelectAdmin={handleEnterAdmin} />
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
            {view === 'menu' && ( <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {filteredItems.length > 0 ? filteredItems.map(item => (<MenuCard key={item.id} item={item} />)) : <div className="col-span-full text-center py-20"><Search size={48} className="mx-auto text-gray-300"/><h3 className="text-xl text-gray-500 mt-4">Sin resultados</h3></div>} </div> )}
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