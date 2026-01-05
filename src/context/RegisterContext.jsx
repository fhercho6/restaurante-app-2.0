import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, limit, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';

const RegisterContext = createContext();

export const useRegister = () => {
    const context = useContext(RegisterContext);
    if (!context) throw new Error('useRegister must be used within a RegisterProvider');
    return context;
};

export const RegisterProvider = ({ children }) => {
    const { currentUser, staffMember } = useAuth();
    const { appName } = useData(); // Needed for Z-Report info if specific logic uses it

    const [registerSession, setRegisterSession] = useState(null);
    const [sessionStats, setSessionStats] = useState({
        cashSales: 0, qrSales: 0, cardSales: 0, digitalSales: 0,
        totalExpenses: 0, totalCostOfGoods: 0,
        courtesyTotal: 0, courtesyCost: 0,
        expensesList: [], soldProducts: []
    });
    const [isOpenRegisterModalOpen, setIsOpenRegisterModalOpen] = useState(false);

    // 1. Listen for Active Register Session
    useEffect(() => {
        if (!db || !currentUser) return;
        const q = query(collection(db, isPersonalProject ? 'cash_registers' : `${ROOT_COLLECTION}cash_registers`), where('status', '==', 'open'), limit(1));
        getDocs(q).then(s => {
            if (!s.empty) setRegisterSession({ id: s.docs[0].id, ...s.docs[0].data() });
        });
    }, [db, currentUser]);

    // 2. Listen for Statistics (Sales & Expenses)
    useEffect(() => {
        if (!db || !registerSession) return;

        const salesCol = isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`;
        const qS = query(collection(db, salesCol), where('registerId', '==', registerSession.id));
        const qE = query(collection(db, isPersonalProject ? 'expenses' : `${ROOT_COLLECTION}expenses`), where('registerId', '==', registerSession.id));

        const uS = onSnapshot(qS, (s) => {
            let c = 0, q = 0, k = 0, d = 0, ct = 0, cc = 0, cg = 0, itemsProcessed = 0;
            const pm = {};

            s.forEach(d => {
                const v = d.data();
                const ic = v.payments?.some(p => p.method === 'Cortesía');

                if (!ic) {
                    if (v.payments) {
                        v.payments.forEach(p => {
                            const a = parseFloat(p.amount);
                            const m = (p.method || '').toLowerCase();
                            if (m.includes('efectivo')) c += a;
                            else if (m.includes('qr')) q += a;
                            else k += a;
                        });
                        if (v.changeGiven) c -= parseFloat(v.changeGiven);
                    } else {
                        const t = parseFloat(v.total);
                        const m = (v.paymentMethod || '').toLowerCase();
                        if (m.includes('efectivo')) c += t;
                        else if (m.includes('qr')) q += t;
                        else k += t;
                    }
                }

                if (v.items) v.items.forEach(i => {
                    itemsProcessed++;
                    const kn = i.name;
                    const qt = i.qty;
                    const pr = parseFloat(i.price);
                    const co = parseFloat(i.cost) || 0;

                    if (ic) {
                        ct += (pr * qt);
                        cc += (co * qt);
                    } else {
                        cg += (co * qt);
                    }

                    if (!pm[kn]) pm[kn] = { name: kn, qtySold: 0, qtyCourtesy: 0, total: 0, cost: 0, totalCost: 0, courtesyTotal: 0 };

                    if (ic) {
                        pm[kn].qtyCourtesy += qt;
                        pm[kn].courtesyTotal += (pr * qt);
                    } else {
                        pm[kn].qtySold += qt;
                        pm[kn].total += (pr * qt);
                    }
                    pm[kn].totalCost += (co * qt);
                    // Guardamos costo unitario promedio o el ultimo encontrado para referecia
                    if (!pm[kn].cost) pm[kn].cost = co;
                });
            });

            setSessionStats(prev => ({
                ...prev,
                cashSales: c,
                qrSales: q,
                cardSales: k,
                digitalSales: q + k,
                totalCostOfGoods: cg,
                courtesyTotal: ct,
                courtesyCost: cc,
                soldProducts: Object.values(pm).sort((a, b) => b.qtySold - a.qtySold),
                debugInfo: `Docs: ${s.size}, ItemsProcessed: ${itemsProcessed}, PMKeys: ${Object.keys(pm).length}`
            }));
        });

        const uE = onSnapshot(qE, (s) => {
            let te = 0;
            const el = [];
            s.forEach(d => {
                const e = d.data();
                te += parseFloat(e.amount);
                el.push({ id: d.id, ...e });
            });
            setSessionStats(prev => ({ ...prev, totalExpenses: te, expensesList: el }));
        });

        return () => { uS(); uE(); };
    }, [registerSession]);

    // ACTIONS
    const checkRegisterStatus = (requireOwnership = false) => {
        if (registerSession) {
            const isAdmin = currentUser && !currentUser.isAnonymous;
            const isOwner = staffMember && registerSession.openedBy === staffMember.name;
            if (requireOwnership && !isAdmin && !isOwner) {
                toast.error(`⛔ ACCESO DENEGADO\nTurno de: ${registerSession.openedBy}`, { duration: 5000 });
                return false;
            }
            return true;
        }

        const canOpenRegister = (currentUser && !currentUser.isAnonymous) || (staffMember && (staffMember.role === 'Cajero' || staffMember.role === 'Administrador'));
        if (canOpenRegister) setIsOpenRegisterModalOpen(true);
        else toast.error("⚠️ LA CAJA ESTÁ CERRADA.", { icon: '🔒' });
        return false;
    };

    const openRegister = async (amount, activeTeam = []) => {
        try {
            const sessionData = {
                status: 'open',
                openedBy: staffMember ? staffMember.name : (currentUser?.email || 'Admin'),
                openedAt: new Date().toISOString(),
                openingAmount: amount,
                activeTeam: activeTeam,
                salesTotal: 0
            };
            const docRef = await addDoc(collection(db, isPersonalProject ? 'cash_registers' : `${ROOT_COLLECTION}cash_registers`), sessionData);
            setRegisterSession({ id: docRef.id, ...sessionData });
            setIsOpenRegisterModalOpen(false);
            toast.success(`Turno Abierto`);
            return true;
        } catch (error) {
            toast.error("Error al abrir caja");
            return false;
        }
    };

    const confirmCloseRegister = async (finalCash) => {
        try {
            await updateDoc(doc(db, isPersonalProject ? 'cash_registers' : `${ROOT_COLLECTION}cash_registers`, registerSession.id), {
                status: 'closed',
                closedAt: new Date().toISOString(),
                closedBy: staffMember ? staffMember.name : 'Admin',
                finalCashCalculated: finalCash,
                finalSalesStats: sessionStats
            });

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
                soldProducts: sessionStats.soldProducts,
                autoPrint: true
            };

            setRegisterSession(null);
            setSessionStats({ cashSales: 0, qrSales: 0, cardSales: 0, digitalSales: 0, totalExpenses: 0, totalCostOfGoods: 0, courtesyTotal: 0, courtesyCost: 0, expensesList: [], soldProducts: [] });

            return zReportData; // Return Z-Report for printing
        } catch (error) {
            console.error(error);
            toast.error("Error cerrando");
            return null;
        }
    };

    // 4. Expense Actions
    const addExpense = async (description, amount) => {
        if (!registerSession) {
            toast.error("Error Interno: No se detecta turno activo (registerSession lost). Refresca la página.");
            return false;
        }
        try {
            const expenseData = {
                registerId: registerSession.id,
                description,
                amount,
                date: new Date().toISOString(),
                createdBy: staffMember ? staffMember.name : 'Admin'
            };

            await addDoc(collection(db, isPersonalProject ? 'expenses' : `${ROOT_COLLECTION}expenses`), expenseData);
            // Success is handled by caller (AppContent) showing receipt, but we can toast here too
            toast.success("Gasto registrado en BD");
            return true;
        } catch (e) {
            console.error("Error adding expense:", e);
            toast.error(`Error registrando gasto: ${e.message}`);
            return false;
        }
    };

    const deleteExpense = async (expenseId) => {
        if (!expenseId) return;
        try {
            await deleteDoc(doc(db, isPersonalProject ? 'expenses' : `${ROOT_COLLECTION}expenses`, expenseId));
            toast.success("Gasto eliminado");
            return true;
        } catch (e) {
            console.error("Error deleting expense:", e);
            toast.error("Error eliminando gasto");
            return false;
        }
    };


    // Helper to calculate final cash
    const getCalculatedCash = () => {
        if (!registerSession) return 0;
        return (registerSession.openingAmount || 0) + sessionStats.cashSales - sessionStats.totalExpenses;
    };

    const value = {
        registerSession,
        sessionStats,
        setSessionStats, // Exposed for optimistic updates if needed
        isOpenRegisterModalOpen,
        setIsOpenRegisterModalOpen,
        checkRegisterStatus,
        openRegister,
        confirmCloseRegister,
        getCalculatedCash,
        addExpense,
        deleteExpense
    };

    return (
        <RegisterContext.Provider value={value}>
            {children}
        </RegisterContext.Provider>
    );
};
