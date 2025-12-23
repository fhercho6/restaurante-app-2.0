import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { doc, updateDoc, collection } from 'firebase/firestore';
import { auth, db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [staffMember, setStaffMember] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [credentialToPrint, setCredentialToPrint] = useState(null);
    const [view, setView] = useState('landing'); // Local view state for auth flows if needed, or pass from parent

    const getCollName = (type) => {
        if (type === 'staff') return isPersonalProject ? 'staffMembers' : `${ROOT_COLLECTION}staffMembers`;
        return null;
    };

    useEffect(() => {
        const initAuth = async () => {
            if (!auth.currentUser) await signInAnonymously(auth);
        };
        initAuth();
        return onAuthStateChanged(auth, (u) => {
            setCurrentUser(u);
        });
    }, []);

    const login = (userApp) => {
        setIsAuthModalOpen(false);
        toast.success(`Bienvenido`);
        // View change handled by consumer or separate ViewContext
        return true;
    };

    const logout = async () => {
        await signOut(auth);
        window.location.reload();
    };

    const staffLogin = async (member) => {
        const newSessionId = Date.now().toString() + Math.floor(Math.random() * 1000);
        try {
            await updateDoc(doc(db, getCollName('staff'), member.id), { activeSessionId: newSessionId });
            const memberWithSession = { ...member, activeSessionId: newSessionId };
            setStaffMember(memberWithSession);

            if (member.role === 'Cajero' || member.role === 'Administrador') {
                toast.success(`Caja abierta: ${member.name}`);
                return 'cashier';
            } else {
                toast.success(`Turno iniciado: ${member.name}`);
                return 'pos';
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión al iniciar sesión");
            return null;
        }
    };

    const prepareCredentialPrint = (member) => {
        if (!member) {
            toast.error("Error: Empleado no válido");
            return;
        }
        setCredentialToPrint(member);
        // Consumer should handle view switch to 'credential_print'
    };

    const value = {
        currentUser,
        staffMember,
        setStaffMember,
        isAuthModalOpen,
        setIsAuthModalOpen,
        credentialToPrint,
        setCredentialToPrint,
        login,
        logout,
        staffLogin,
        prepareCredentialPrint
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
