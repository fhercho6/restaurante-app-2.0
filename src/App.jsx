// src/App.jsx - VERSIÓN DE DIAGNÓSTICO (Para encontrar el error invisible)
import React, { useState, useEffect } from 'react';
import { Wifi, Home, LogOut, ClipboardList, DollarSign, Wallet, Users, Calendar, FileText, Settings, Plus, Lock, Unlock } from 'lucide-react';
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { collection, doc, updateDoc, addDoc, query, where, limit, getDocs, onSnapshot } from 'firebase/firestore';
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
import AttendanceView from './components/AttendanceView';

// Importamos Modals
import { AuthModal, BrandingModal, ProductModal, CategoryManager, RoleManager, ServiceStartModal } from './components/Modals';
// Importamos Views
import { MenuCard, PinLoginView, CredentialPrintView, PrintableView, AdminRow, AttendancePrintView } from './components/Views';

const INITIAL_CATEGORIES = ['Bebidas', 'Comidas', 'Servicios']; 
const INITIAL_ROLES = ['Garzón', 'Cajero', 'Cocinero', 'Administrador'];

export default function App() {
  const [view, setView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);

  // Datos
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [activeServices, setActiveServices] = useState([]); 

  // Config
  const [logo, setLogo] = useState(null);
  const [appName, setAppName] = useState(""); 
  const [registerSession, setRegisterSession] = useState(null);
  const [sessionStats, setSessionStats] = useState({ cashSales: 0, qrSales: 0, cardSales: 0, digitalSales: 0, totalExpenses: 0, expensesList: [] });

  // Modales y Estados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isOpenRegisterModalOpen, setIsOpenRegisterModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const [currentItem, setCurrentItem] = useState(null);
  const [filter, setFilter] = useState('Todos');
  const [credentialToPrint, setCredentialToPrint] = useState(null);
  const [staffMember, setStaffMember] = useState(null);
  
  // TICKET DE ASISTENCIA
  const [lastAttendance, setLastAttendance] = useState(null); 
  
  // Pagos
  const [pendingSale, setPendingSale] = useState(null);
  const [orderToPay, setOrderToPay] = useState(null); 
  const [lastSale, setLastSale] = useState(null);

  const getCollName = (type) => {
    if (type === 'items') return isPersonalProject ? 'menuItems' : `${ROOT_COLLECTION}menuItems`;
    if (type === 'staff') return isPersonalProject ? 'staffMembers' : `${ROOT_COLLECTION}staffMembers`;
    return isPersonalProject ? 'settings' : `${ROOT_COLLECTION}settings`;
  };

  // --- DEBUGGING ---
  console.log("RENDERIZANDO APP. VISTA ACTUAL:", view);
  console.log("DATOS ASISTENCIA:", lastAttendance);

  // --- HANDLERS ---
  const handleLogin = () => { setIsAuthModalOpen(false); setView('admin'); };
  const handleLogout = async () => { await signOut(auth); window.location.reload(); };
  const handleEnterMenu = () => { setFilter('Todos'); setView('menu'); };
  const handleEnterStaff = () => setView('pin_login');
  const handleEnterAdmin = () => { if (currentUser) setView('admin'); else setIsAuthModalOpen(true); };
  
  // --- LOGIN DEL PERSONAL ---
  const handleStaffPinLogin = async (member) => { 
    const newSessionId = Date.now().toString();
    const now = new Date();
    
    // 1. PREPARAR DATOS VISUALES PRIMERO
    const ticketInfo = {
        name: member.name,
        id: member.id, 
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        appName: appName || "Sistema"
    };

    setLastAttendance(ticketInfo); // Guardamos datos para el ticket

    // 2. ACTUALIZAR BASE DE DATOS
    try {
        await updateDoc(doc(db, getCollName('staff'), member.id), { activeSessionId: newSessionId });
        
        const shiftsCol = isPersonalProject ? 'work_shifts' : `${ROOT_COLLECTION}work_shifts`;
        const qActiveShift = query(collection(db, shiftsCol), where('staffId', '==', member.id), where('endTime', '==', null));
        const snapshot = await getDocs(qActiveShift);

        const memberWithSession = { ...member, activeSessionId: newSessionId };
        setStaffMember(memberWithSession); 

        if (snapshot.empty) {
            await addDoc(collection(db, shiftsCol), {
                staffId: member.id,
                staffName: member.name,
                contractType: member.contractType || 'Fijo',
                hourlyRate: member.hourlyRate || 0,
                startTime: now.toISOString(),
                endTime: null,
                sessionId: newSessionId 
            });
            toast.success(`Entrada registrada`);
        } else {
            toast('Turno continuado');
        }

        // 3. CAMBIAR VISTA AL FINAL
        console.log("CAMBIANDO A VISTA DE IMPRESIÓN...");
        setView('attendance_print'); 

    } catch (error) { 
        console.error("Error Login:", error);
        setView('attendance_print'); // Forzamos ir a impresión aunque falle la BD
    }
  };

  // ... (Resto de funciones: handleReprintAttendance, handleContinueFromAttendance, effects, etc. simplificados para que entre en el mensaje)
  // ... Asumimos que las funciones auxiliares (calculate, save, delete) están aquí igual que antes ...
  
  const handleContinueFromAttendance = () => {
    if (staffMember?.role === 'Cajero' || staffMember?.role === 'Administrador') setView('cashier');
    else setView('pos');
  };

  // AUTH EFFECT
  useEffect(() => { 
    const initAuth = async () => { 
       if (!auth.currentUser) await signInAnonymously(auth); 
    }; 
    initAuth(); 
    return onAuthStateChanged(auth, (u) => { setCurrentUser(u); }); 
  }, []);

  // DATA LOAD EFFECT
  useEffect(() => { 
    if (!db || !currentUser) return; 
    const unsubItems = onSnapshot(collection(db, getCollName('items')), (s) => setItems(s.docs.map(d=>({id:d.id, ...d.data()}))));
    const unsubStaff = onSnapshot(collection(db, getCollName('staff')), (s) => setStaff(s.docs.map(d=>({id:d.id, ...d.data()}))));
    const unsubSettings = onSnapshot(collection(db, getCollName('settings')), (s) => {
        s.docs.forEach(d => { if(d.id==='branding') { setLogo(d.data().logo); setAppName(d.data().appName); } });
        setIsLoadingApp(false);
    });
    return () => { unsubItems(); unsubStaff(); unsubSettings(); };
  }, [currentUser]);


  // --- RENDERIZADO PRINCIPAL ---
  if (isLoadingApp) return <div className="p-10 text-center">Cargando sistema...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <Toaster />
      
      {/* --- PANEL DE DEBUG (BORRAR LUEGO) --- */}
      <div className="fixed top-0 left-0 bg-red-500 text-white text-[10px] p-1 z-[9999] opacity-80 pointer-events-none">
        VISTA: {view} | STAFF: {staffMember ? staffMember.name : 'Nadie'} | TICKET: {lastAttendance ? 'OK' : 'NULL'}
      </div>

      {view === 'landing' && <LandingPage appName={appName} logo={logo} onSelectClient={handleEnterMenu} onSelectStaff={handleEnterStaff} onSelectAdmin={handleEnterAdmin} />}

      {/* HEADER (Solo si no es landing) */}
      {view !== 'landing' && (
         <header className="bg-white shadow-sm h-14 flex items-center justify-between px-4 no-print">
            <div className="flex items-center gap-2">
                {logo && <img src={logo} className="h-8 w-8 object-contain"/>}
                <span className="font-bold">{appName}</span>
            </div>
            <button onClick={() => setView('landing')}><Home size={20}/></button>
         </header>
      )}

      {/* VISTAS */}
      <main className="p-4 max-w-7xl mx-auto">
        
        {/* LOGIN */}
        {view === 'pin_login' && (
            <PinLoginView 
                staffMembers={staff} 
                onLoginSuccess={handleStaffPinLogin} 
                onCancel={() => setView('landing')} 
            />
        )}

        {/* IMPRESIÓN TICKET (AQUÍ ESTÁ EL PROBLEMA) */}
        {view === 'attendance_print' && (
            lastAttendance ? (
                <AttendancePrintView 
                    data={lastAttendance} 
                    onContinue={handleContinueFromAttendance} 
                />
            ) : (
                <div className="p-10 bg-red-100 text-red-600 border border-red-400 rounded">
                    <h3 className="font-bold">⚠️ ERROR DE DATOS</h3>
                    <p>La vista es 'attendance_print' pero no hay datos de ticket.</p>
                    <button onClick={() => setView('pin_login')} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Volver</button>
                </div>
            )
        )}

        {/* RESTO DE VISTAS (Simplificadas para el diagnóstico) */}
        {view === 'pos' && <POSInterface items={items} categories={categories} staffMember={staffMember} onExit={() => setView('landing')} />}
        {view === 'cashier' && <div className="p-4 bg-white rounded shadow">VISTA DE CAJERO (Funcionando)</div>}
        {view === 'admin' && <div className="p-4 bg-white rounded shadow">VISTA DE ADMIN (Funcionando)</div>}
        {view === 'menu' && <div className="p-4 bg-white rounded shadow">MENU CLIENTE</div>}

      </main>
    </div>
  );
}