import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
};

const INITIAL_CATEGORIES = ['Bebidas', 'Comidas', 'Servicios', 'Combos'];
const INITIAL_ROLES = ['Garzón', 'Cajero', 'Cocinero', 'Administrador'];
const INITIAL_TABLES = ['Barra', 'Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'VIP 1'];
const INITIAL_EXPENSE_TYPES = ['Hielo', 'Taxi', 'Insumos', 'Limpieza', 'Adelanto Sueldo', 'Proveedores'];

export const DataProvider = ({ children }) => {
    const { currentUser } = useAuth();

    const [items, setItems] = useState([]);
    const [staff, setStaff] = useState([]);
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [roles, setRoles] = useState(INITIAL_ROLES);
    const [tables, setTables] = useState(INITIAL_TABLES);
    const [expenseTypes, setExpenseTypes] = useState(INITIAL_EXPENSE_TYPES);
    const [activeServices, setActiveServices] = useState([]);
    const [logo, setLogo] = useState(null);
    const [appName, setAppName] = useState("");
    const [autoLockTime, setAutoLockTime] = useState(45);
    const [printerType, setPrinterType] = useState('thermal');
    const [commissionTiers, setCommissionTiers] = useState([
        { max: 5000, rate: 0.05 },
        { max: 5500, rate: 0.06 },
        { max: 6000, rate: 0.07 },
        { max: 999999, rate: 0.08 }
    ]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [dbStatus, setDbStatus] = useState('connecting');

    const getCollName = (type) => {
        if (type === 'items') return isPersonalProject ? 'menuItems' : `${ROOT_COLLECTION}menuItems`;
        if (type === 'staff') return isPersonalProject ? 'staffMembers' : `${ROOT_COLLECTION}staffMembers`;
        return isPersonalProject ? 'settings' : `${ROOT_COLLECTION}settings`;
    };

    useEffect(() => {
        if (!currentUser) {
            setDbStatus('disconnected');
            return;
        }
        setDbStatus('connected');

        // OPTIMIZATION: Detect Public Mode to reduce bandwidth
        const params = new URLSearchParams(window.location.search);
        const isPublicMode = params.get('mode') === 'public';

        // 1. ITEMS (ALWAYS FETCH)
        const unsub1 = onSnapshot(collection(db, getCollName('items')), (s) => setItems(s.docs.map(d => ({ ...d.data(), id: d.id }))));

        // 2. SETTINGS (ALWAYS FETCH)
        const unsub3 = onSnapshot(collection(db, getCollName('settings')), (s) => {
            s.docs.forEach(d => {
                const dt = d.data();
                if (d.id === 'categories') setCategories(dt.list);
                else if (d.id === 'roles') setRoles(dt.list);
                else if (d.id === 'tables') setTables(dt.list);
                else if (d.id === 'expenses') setExpenseTypes(dt.list);
                else if (d.id === 'branding') {
                    setLogo(dt.logo);
                    setAppName(dt.appName);
                    setAutoLockTime(dt.autoLockTime);
                    if (dt.printerType) setPrinterType(dt.printerType);
                }
                else if (d.id === 'commissions') {
                    if (dt.tiers) setCommissionTiers(dt.tiers);
                }
            });
            setIsLoadingData(false);
        });

        // 3. INTERNAL DATA (SKIP IN PUBLIC MODE)
        let unsub2 = () => { };
        let unsub4 = () => { };

        if (!isPublicMode) {
            unsub2 = onSnapshot(collection(db, getCollName('staff')), (s) => setStaff(s.docs.map(d => ({ ...d.data(), id: d.id }))));
            const activeServicesColl = isPersonalProject ? 'active_services' : `${ROOT_COLLECTION}active_services`;
            unsub4 = onSnapshot(collection(db, activeServicesColl), (s) => setActiveServices(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        } else {
            console.log("⚡ Public Mode: Skipping Staff & Service Data Load");
        }

        return () => {
            unsub1(); unsub2(); unsub3(); unsub4();
        };
    }, [currentUser]);

    // CRUD OPERATIONS
    const handleQuickUpdate = async (id, field, value) => { try { let valToSave = value; if (field === 'price' || field === 'cost') { valToSave = parseFloat(value); if (isNaN(valToSave)) valToSave = 0; } if (field === 'stock') { valToSave = parseInt(value); if (isNaN(valToSave)) valToSave = 0; } await updateDoc(doc(db, getCollName('items'), id), { [field]: valToSave }); toast.success('Actualizado', { icon: '💾', duration: 1000 }); } catch (error) { toast.error('Error al actualizar'); } };

    const handleSaveItem = async (d, id = null) => { try { if (id) await setDoc(doc(db, getCollName('items'), id), d); else await addDoc(collection(db, getCollName('items')), d); toast.success('Guardado'); return true; } catch { toast.error('Error'); return false; } };
    const handleDeleteItem = async (id) => { try { await deleteDoc(doc(db, getCollName('items'), id)); toast.success('Eliminado'); } catch { toast.error('Error'); } };

    const handleAddStaff = async (d) => { await addDoc(collection(db, getCollName('staff')), d); toast.success('Personal creado'); };
    const handleUpdateStaff = async (id, d) => { await updateDoc(doc(db, getCollName('staff'), id), d); toast.success('Personal actualizado'); };
    const handleDeleteStaff = async (id) => { if (window.confirm("¿Eliminar?")) { await deleteDoc(doc(db, getCollName('staff'), id)); toast.success('Borrado'); } };

    // Settings logic helpers... could be refactored further but kept here for now
    const updateSettingsList = (docId, list) => setDoc(doc(db, getCollName('settings'), docId), { list });

    const handleAddCategory = (n) => updateSettingsList('categories', [...categories, n]);
    const handleRenameCategory = (i, n) => { const l = [...categories]; l[i] = n; updateSettingsList('categories', l); };
    const handleDeleteCategory = (i) => { const l = categories.filter((_, x) => x !== i); updateSettingsList('categories', l); };

    const handleAddRole = (n) => updateSettingsList('roles', [...roles, n]);
    const handleRenameRole = (i, n) => { const l = [...roles]; l[i] = n; updateSettingsList('roles', l); };
    const handleDeleteRole = (i) => { const l = roles.filter((_, x) => x !== i); updateSettingsList('roles', l); };

    const handleAddTable = (n) => updateSettingsList('tables', [...tables, n]);
    const handleRenameTable = (i, n) => { const l = [...tables]; l[i] = n; updateSettingsList('tables', l); };
    const handleDeleteTable = (i) => { const l = tables.filter((_, x) => x !== i); updateSettingsList('tables', l); };

    const handleAddExpenseType = (n) => updateSettingsList('expenses', [...expenseTypes, n]);
    const handleRenameExpenseType = (i, n) => { const l = [...expenseTypes]; l[i] = n; updateSettingsList('expenses', l); };
    const handleDeleteExpenseType = (i) => { const l = expenseTypes.filter((_, x) => x !== i); updateSettingsList('expenses', l); };

    const handleSaveBranding = (l, n, t) => { setDoc(doc(db, getCollName('settings'), 'branding'), { logo: l, appName: n, autoLockTime: t, printerType: printerType }, { merge: true }); setLogo(l); setAppName(n); setAutoLockTime(t); toast.success('Marca y Configuración actualizadas'); };
    const handleSavePrinterType = (type) => { setPrinterType(type); setDoc(doc(db, getCollName('settings'), 'branding'), { printerType: type }, { merge: true }); toast.success(`Formato: ${type === 'thermal' ? 'Ticket' : 'Carta'}`); };
    const handleSaveCommissionTiers = (tiers) => { setCommissionTiers(tiers); setDoc(doc(db, getCollName('settings'), 'commissions'), { tiers }); toast.success('Tabla de Comisiones Guardada'); };

    const value = {
        items, staff, categories, roles, tables, expenseTypes, activeServices,
        logo, appName, autoLockTime, printerType, commissionTiers,
        isLoadingData, dbStatus,
        handleQuickUpdate, handleSaveItem, handleDeleteItem,
        handleAddStaff, handleUpdateStaff, handleDeleteStaff,
        handleAddCategory, handleRenameCategory, handleDeleteCategory,
        handleAddRole, handleRenameRole, handleDeleteRole,
        handleAddTable, handleRenameTable, handleDeleteTable,
        handleAddExpenseType, handleRenameExpenseType, handleDeleteExpenseType,
        handleSaveBranding, handleSavePrinterType, handleSaveCommissionTiers,
        getCollName // Exporting if needed by other components
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
