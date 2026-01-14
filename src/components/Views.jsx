// src/components/Views.jsx - LOGIN FLUIDO Y SIN CONGELAMIENTOS
import React, { useState } from 'react';
import { Clock, User, ArrowLeft, Trash2, Edit2, Plus, Minus, Lock, LogIn, LogOut, Briefcase, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';

// --- TARJETA DE MENÚ (CLIENTE) ---
export const MenuCard = ({ item }) => {
    if (!item) return null; // [FIX] Prevent crash if item is undefined
    const stockNum = Number(item.stock);
    const hasStock = item.stock !== undefined && item.stock !== '';
    const isOut = hasStock && stockNum <= 0;
    const isLow = hasStock && stockNum <= 5 && stockNum > 0;

    return (
        <div className={`relative bg-black/40 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 group h-full flex flex-col ${isOut ? 'opacity-60 grayscale' : ''}`}>
            <div className="h-32 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                {isOut && <div className="absolute inset-0 z-20 flex items-center justify-center"><span className="bg-red-600 text-white font-black px-3 py-1 rounded text-xs uppercase tracking-widest rotate-[-10deg]">Agotado</span></div>}
                {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800"><Clock size={32} className="text-gray-600" /></div>
                )}
                <div className="absolute top-2 right-2 z-20 bg-white/10 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-lg border border-white/20">
                    Bs. {parseFloat(item.price).toFixed(2)}
                </div>
            </div>

            <div className="p-3 flex-1 flex flex-col justify-end relative z-20">
                <h3 className="text-white font-bold text-lg leading-tight mb-1 drop-shadow-md">{item.name}</h3>
                {item.description && <p className="text-gray-400 text-xs line-clamp-2 mb-2">{item.description}</p>}
                {isLow && <p className="text-orange-400 text-[10px] font-bold uppercase animate-pulse">¡Quedan pocos!</p>}
            </div>
        </div>
    );
};

// --- PANTALLA DE LOGIN CON PIN (OPTIMIZADA) ---
export const PinLoginView = ({ staffMembers, registerStatus, onLoginSuccess, onClockAction, onCancel }) => {
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [pin, setPin] = useState('');
    const [mode, setMode] = useState('system'); // 'system' (Vender) | 'attendance' (Reloj)
    const [showAttendanceOptions, setShowAttendanceOptions] = useState(false);
    const [shuffledKeys, setShuffledKeys] = useState(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']);

    // ESTADO DE PROCESAMIENTO
    const [isProcessing, setIsProcessing] = useState(false);

    const shuffleArray = (array) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };

    const handleSelectStaff = (member) => {
        setSelectedStaff(member);
        setPin('');
        setShowAttendanceOptions(false);
        setShuffledKeys(shuffleArray(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']));
    };

    const handleNumClick = (num) => {
        // Si ya estamos procesando, ignorar clics (ANTI-REBOTE)
        if (isProcessing) return;

        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);

            // AL LLEGAR A 4 DÍGITOS
            if (newPin.length === 4) {
                setIsProcessing(true); // Bloquear UI

                // Verificación inmediata sin setTimeout largo
                // Verificación inmediata sin setTimeout largo
                if (newPin === selectedStaff.pin) {
                    if (mode === 'system') {
                        // VALIDACIÓN CAJA CERRADA
                        if (registerStatus !== 'open' && selectedStaff.role !== 'Administrador' && selectedStaff.role !== 'Cajero') {
                            toast.error("⚠️ CAJA CERRADA\nDebes abrir la caja para ingresar.");
                            setTimeout(() => {
                                setPin('');
                                setIsProcessing(false);
                            }, 1000);
                            return;
                        }
                        onLoginSuccess(selectedStaff);
                    } else {
                        // VALIDACIÓN CAJA CERRADA (ASISTENCIA)
                        if (registerStatus !== 'open') {
                            toast.error("⚠️ CAJA CERRADA\nNo se puede marcar asistencia sin abrir caja.");
                            setTimeout(() => {
                                setPin('');
                                setIsProcessing(false);
                            }, 1000);
                            return;
                        }
                        setShowAttendanceOptions(true);
                        setIsProcessing(false); // Desbloquear para que elija opción de reloj
                    }
                } else {
                    // Error: Feedback rápido
                    toast.error('PIN Incorrecto');
                    setTimeout(() => { // Pequeña pausa para que vea el error
                        setPin('');
                        setShuffledKeys(shuffleArray(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']));
                        setIsProcessing(false); // Desbloquear
                    }, 500);
                }
            }
        }
    };

    const handleClock = (type) => {
        if (isProcessing) return;
        setIsProcessing(true);
        onClockAction(selectedStaff, type);

        // Reiniciar estado después de un breve momento
        setTimeout(() => {
            setSelectedStaff(null);
            setPin('');
            setShowAttendanceOptions(false);
            setIsProcessing(false);
        }, 800);
    };

    const handleDelete = () => {
        if (!isProcessing) setPin(prev => prev.slice(0, -1));
    };

    // SOPORTE PARA LECTOR DE CÓDIGO (TECLADO FÍSICO + SCANNER)
    React.useEffect(() => {
        let buffer = '';
        let timeout = null;

        const handleKeyDown = (e) => {
            if (isProcessing) return;

            // 1. SI ES UNA TECLA CLAVE DEL SCANNER (Letras, símbolos, números)
            // Los scanners suelen mandar todo muy rápido.
            if (e.key.length === 1) {
                buffer += e.key;

                // Reiniciamos el buffer si pasa mucho tiempo sin teclas (no es un scanner)
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    buffer = '';
                }, 100);
            }

            // 2. DETECTAR ENTER (Fin del escaneo)
            if (e.key === 'Enter') {
                // Verificar si es un código de autenticación
                if (buffer.startsWith('AUTH:')) {
                    // Formato: AUTH:USER_ID:PIN
                    const parts = buffer.split(':');
                    if (parts.length === 3) {
                        const scannedId = parts[1];
                        const scannedPin = parts[2];

                        // Buscar empleado
                        const staff = staffMembers.find(m => m.id === scannedId);

                        if (staff) {
                            if (staff.pin === scannedPin) {
                                setIsProcessing(true);
                                toast.success(`¡Hola ${staff.name}!`);
                                // Login directo
                                onLoginSuccess(staff);
                            } else {
                                toast.error('PIN de credencial inválido');
                            }
                        } else {
                            toast.error('Credencial no reconocida');
                        }
                    }
                    buffer = ''; // Limpiar tras procesar
                    return;
                }

                // MODO: CARD ID (8 NÚMEROS) - PRIORIDAD ALTA
                const staffByCard = staffMembers.find(m => m.cardId && m.cardId === buffer);
                if (staffByCard) {
                    // VALIDACIÓN CAJA CERRADA
                    if (registerStatus !== 'open' && staffByCard.role !== 'Administrador' && staffByCard.role !== 'Cajero') {
                        toast.error("⚠️ CAJA CERRADA\nDebes abrir la caja para ingresar.");
                        buffer = '';
                        return;
                    }
                    setIsProcessing(true);
                    toast.success(`¡Hola ${staffByCard.name}!`);
                    onLoginSuccess(staffByCard);
                    buffer = '';
                    return;
                }

                // MODO 2: ULTRA-SHORT ID (Detectar cadenas de 6 caracteres que coincidan con un ID)
                // Se asume que el ID de firebase tiene al menos 6 chars.
                // Si el buffer tiene longitud 6 (o un poco más por seguridad) y coincide con el inicio de un ID
                if (buffer.length >= 6) {
                    const potentialId = buffer.slice(-6).toLowerCase(); // Convertimos a minúsculas por si el scanner manda CODE39 (Mayúsculas)
                    // Búsqueda insensible a mayúsculas/minúsculas para seguridad
                    const staff = staffMembers.find(m => m.id.toLowerCase().startsWith(potentialId));

                    if (staff) {
                        setIsProcessing(true);
                        toast.success(`¡Hola ${staff.name}!`);
                        onLoginSuccess(staff);
                        buffer = '';
                        return;
                    }
                }

                // MODO 3 (LEGACY): USR:SHORT_ID (Por compatibilidad si alguien ya imprimió)
                if (buffer.startsWith('USR:')) {
                    const parts = buffer.split(':');
                    if (parts.length === 2) {
                        const scannedShortId = parts[1];
                        // Buscamos coincidencia parcial (los primeros 8 caracteres)
                        const staff = staffMembers.find(m => m.id.startsWith(scannedShortId));

                        if (staff) {
                            setIsProcessing(true);
                            toast.success(`¡Hola ${staff.name}!`);
                            onLoginSuccess(staff);
                        } else {
                            toast.error('Credencial no reconocida');
                        }
                    }
                    buffer = '';
                    return;
                }

                // Si no fue escaneo, quizas fue enter manual (no hacemos nada por ahora en el teclado numérico)
                buffer = '';
            }

            // 3. COMPORTAMIENTO ORIGINAL (SOLO NÚMEROS MANUALES)
            // Si el buffer está vacío o corto, permitimos interacción manual
            if (buffer.length < 2) {
                // Números 0-9
                if (/^[0-9]$/.test(e.key)) {
                    handleNumClick(e.key);
                }
                // Borrar
                else if (e.key === 'Backspace') {
                    handleDelete();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timeout);
        };
    }, [pin, isProcessing, staffMembers, onLoginSuccess]); // Agregamos staffMembers y onLoginSuccess

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-in zoom-in duration-300 transition-colors ${mode === 'attendance' ? 'bg-blue-900/95 backdrop-blur-xl' : 'bg-black/90 backdrop-blur-xl'}`}>
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">

                {/* ENCABEZADO */}
                <div className={`p-4 text-center relative shrink-0 transition-colors ${mode === 'attendance' ? 'bg-blue-600' : 'bg-gray-900'}`}>
                    {!selectedStaff && (
                        <div className="flex bg-black/20 p-1 rounded-xl mb-4 relative z-10">
                            <button onClick={() => setMode('system')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${mode === 'system' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'}`}>
                                <Briefcase size={14} /> VENDER
                            </button>
                            <button onClick={() => setMode('attendance')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${mode === 'attendance' ? 'bg-white text-blue-600 shadow-md' : 'text-white/60 hover:text-white'}`}>
                                <Clock size={14} /> ASISTENCIA
                            </button>
                        </div>
                    )}

                    {selectedStaff && (
                        <button onClick={() => !isProcessing && setSelectedStaff(null)} className="absolute left-4 top-6 text-white/50 hover:text-white p-2 z-20">
                            <ArrowLeft size={24} />
                        </button>
                    )}

                    <h2 className="text-xl font-black text-white uppercase tracking-widest mt-2">
                        {selectedStaff ? `HOLA, ${selectedStaff.name.split(' ')[0]}` : (mode === 'attendance' ? 'RELOJ CONTROL' : 'IDENTIFÍCATE')}
                    </h2>
                    {selectedStaff && !showAttendanceOptions && <p className="text-xs text-white/60 mt-1">Ingresa tu PIN</p>}
                </div>

                {/* CUERPO FLEXIBLE */}
                <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden relative">
                    {!selectedStaff ? (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300">
                                <div className="grid grid-cols-2 gap-3 pb-4">
                                    {staffMembers.map(member => (
                                        <button
                                            key={member.id}
                                            onClick={() => handleSelectStaff(member)}
                                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-current hover:text-orange-600 hover:shadow-md transition-all flex flex-col items-center gap-2 group shrink-0"
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${mode === 'attendance' ? 'bg-blue-50 text-blue-400 group-hover:bg-blue-100 group-hover:text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-600'}`}>
                                                <User size={24} />
                                            </div>
                                            <span className="font-bold text-gray-700 text-sm truncate w-full text-center">{member.name}</span>
                                            <span className="text-[10px] text-gray-400 uppercase">{member.role}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-white border-t border-gray-100 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <button onClick={onCancel} className="w-full py-3 rounded-xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 uppercase text-xs tracking-wider">
                                    <ArrowLeft size={16} /> Volver al Inicio
                                </button>
                            </div>
                        </>
                    ) : showAttendanceOptions ? (
                        // OPCIONES DE ENTRADA / SALIDA (BLOQUEADAS SI PROCESANDO)
                        <div className="flex flex-col gap-4 h-full justify-center p-6 animate-in fade-in slide-in-from-bottom-4">
                            {isProcessing ? (
                                <div className="flex flex-col items-center justify-center text-gray-500 animate-pulse">
                                    <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
                                    <p className="font-bold">Registrando...</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-center text-gray-500 font-bold mb-2">¿Qué deseas registrar?</p>
                                    <button onClick={() => handleClock('entry')} className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-2xl shadow-lg flex items-center justify-center gap-4 transition-transform active:scale-95 group">
                                        <div className="bg-white/20 p-3 rounded-full"><LogIn size={32} className="text-white" /></div>
                                        <div className="text-left"><span className="block text-2xl font-black">ENTRADA</span><span className="text-sm opacity-80">Iniciar Turno</span></div>
                                    </button>
                                    <button onClick={() => handleClock('exit')} className="bg-red-500 hover:bg-red-600 text-white p-6 rounded-2xl shadow-lg flex items-center justify-center gap-4 transition-transform active:scale-95 group">
                                        <div className="text-right"><span className="block text-2xl font-black">SALIDA</span><span className="text-sm opacity-80">Terminar Turno</span></div>
                                        <div className="bg-white/20 p-3 rounded-full"><LogOut size={32} className="text-white" /></div>
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        // TECLADO NUMÉRICO (SE BLOQUEA AL COMPLETAR 4 DÍGITOS)
                        <div className="flex flex-col items-center justify-center h-full p-4">
                            <div className="flex gap-4 mb-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < pin.length ? (mode === 'attendance' ? 'bg-blue-500 scale-110' : 'bg-orange-500 scale-110') : 'bg-gray-300'}`}></div>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
                                {shuffledKeys.map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleNumClick(num)}
                                        disabled={isProcessing}
                                        className="h-16 rounded-2xl bg-white border border-gray-200 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[4px] transition-all font-black text-2xl text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {num}
                                    </button>
                                ))}
                                <div className="h-16"></div>
                                <button
                                    onClick={handleDelete}
                                    disabled={isProcessing}
                                    className="h-16 rounded-2xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center shadow-[0_4px_0_0_rgba(220,38,38,0.1)] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                            </div>
                            <p className="mt-6 text-[10px] text-gray-400 flex items-center gap-1">
                                {isProcessing ? <><Loader2 size={10} className="animate-spin" /> Verificando...</> : <><Lock size={10} /> Teclado seguro</>}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- TICKET DE ASISTENCIA ---


// --- CREDENCIAL PARA IMPRIMIR (COMPACTA) ---
export const CredentialPrintView = ({ member, appName }) => (
    <div id="credential-card" className="w-[300px] h-[155px] bg-white border border-gray-300 p-3 m-4 flex flex-col rounded-lg shadow-lg relative overflow-hidden print:shadow-none print:border-black print:m-0">
        <div className="absolute top-0 right-0 w-12 h-12 bg-orange-500 transform rotate-45 translate-x-6 -translate-y-6"></div>

        {/* TOP SECTION: INFO & PHOTO */}
        <div className="flex gap-2 items-center mb-1 relative z-10">
            <div className="w-12 h-12 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                {member.photoUrl ? (
                    <img src={member.photoUrl} alt="Staff" className="w-full h-full object-cover" />
                ) : (
                    <User size={24} className="text-gray-300" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="font-black text-xs uppercase leading-none text-gray-900 mb-0.5 truncate w-[110px]">{appName || 'APP'}</h3>
                <p className="text-[7px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Staff Oficial</p>
                <p className="font-bold text-sm leading-tight truncate w-[110px]">{member.name}</p>
                <p className="text-[9px] text-gray-600 uppercase truncate w-[100px]">{member.role}</p>
            </div>
        </div>

        {/* BOTTOM SECTION: BARCODE (SHORT ID) */}
        <div className="flex-1 flex flex-col justify-end items-center border-t border-gray-100 pt-1">
            <Barcode
                value={(member.cardId && String(member.cardId).length > 0) ? String(member.cardId) : (member.id ? String(member.id).substring(0, 6).toUpperCase() : '000000')}
                format="CODE128"
                width={1.1}
                height={60}
                displayValue={false}
                margin={30}
                background="transparent"
            />
            <p className="text-[7px] tracking-[0.2em] font-bold text-gray-400 mt-0.5 uppercase">KEY: {(member.cardId && String(member.cardId).length > 0) ? String(member.cardId) : (member.id ? String(member.id).substring(0, 6).toUpperCase() : '------')}</p>
        </div>
    </div>
);

// --- TABLA DE ADMIN (FILA MEJORADA CON ENTER) ---
export const AdminRow = ({ item, onEdit, onDelete, isQuickEdit, onQuickUpdate, allItems = [] }) => {
    let stockDisplay = item.stock;
    let isVirtualStock = false;

    let limitingInfo = '';

    // CÁLCULO DINÁMICO DE STOCK PARA COMBOS
    if (item.category.toLowerCase() === 'combos' && item.recipe && item.recipe.length > 0) {
        const recipe = item.recipe;
        let minYield = Infinity;
        let culprit = '';

        recipe.forEach(ing => {
            const realItem = allItems.find(i => i.id === ing.itemId);
            // Tratamos stock negativo como 0 para lógica de disponibilidad real
            // Pero si es negativo, queremos saberlo.
            // parseInt("-5") = -5.
            const currentStock = realItem && realItem.stock ? parseInt(realItem.stock) : 0;
            const yieldVal = Math.floor(currentStock / ing.qty);

            if (yieldVal < minYield) {
                minYield = yieldVal;
                culprit = realItem ? realItem.name : 'Desconocido';
            }
        });

        stockDisplay = minYield === Infinity ? 0 : minYield;
        limitingInfo = culprit;
        // Clamp display to 0 if negative, but indicate issue?
        // No, let's show the negative number so they debug, but add the name.
        if (stockDisplay < 0) stockDisplay = 0; // Fix negative display for UI cleanliness, but culprit info remains.

        isVirtualStock = true;
    }

    const stockNum = parseFloat(stockDisplay);
    const handleKeyDown = (e, field) => {
        if (e.key === 'Enter') {
            e.target.blur(); // Simula click afuera para guardar
        }
    };

    // Estilos de stock
    let badgeClass = 'bg-gray-100 text-gray-700 rounded-full px-2 py-1';
    if (item.category === 'Servicios') badgeClass = 'bg-purple-100 text-purple-700 rounded-full px-2 py-1';
    else if (isVirtualStock) badgeClass = 'bg-orange-100 text-orange-800 ring-1 ring-orange-300 rounded-lg px-2 py-1 inline-flex flex-col items-center justify-center min-w-[40px]'; // Cambio a rounded-lg y flex-col
    else if (stockNum <= 5) badgeClass = 'bg-red-100 text-red-700 rounded-full px-2 py-1';

    return (
        <tr className="hover:bg-gray-50 transition-colors group">
            <td className="p-4 text-center">
                <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden mx-auto">
                    {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-gray-300"><ImageIcon size={16} /></div>
                    )}
                </div>
            </td>
            <td className="p-4"><div className="font-bold text-gray-900">{item.name}</div><div className="text-xs text-gray-500 uppercase">{item.category}</div></td>
            <td className="p-4 text-center">
                {isQuickEdit && item.category !== 'Servicios' && !isVirtualStock ? (
                    <input
                        type="number"
                        defaultValue={item.stock}
                        onBlur={(e) => onQuickUpdate(item.id, 'stock', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'stock')}
                        className="w-16 p-1 border rounded text-center font-bold bg-white focus:ring-2 ring-blue-500 outline-none"
                    />
                ) : (
                    <span className={`text-xs font-black ${badgeClass}`}>
                        {item.category === 'Servicios' ? '∞' : (stockDisplay === '' || stockDisplay === null || stockDisplay === undefined ? '0' : stockDisplay)}
                        {isVirtualStock && (
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] leading-none opacity-80 block tracking-widest mt-0.5 font-bold uppercase">Virtual</span>
                                {limitingInfo && <span className="text-[8px] text-red-600 font-bold whitespace-nowrap mt-0.5" title="Ingrediente Limitante">({limitingInfo})</span>}
                            </div>
                        )}
                    </span>
                )}
            </td>
            <td className="p-4 text-right font-mono text-xs">
                {isQuickEdit ? <input type="number" defaultValue={item.cost} onBlur={(e) => onQuickUpdate(item.id, 'cost', e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'cost')} className="w-20 p-1 border rounded text-right bg-white focus:ring-2 ring-blue-500 outline-none" /> : (item.cost ? `Bs. ${parseFloat(item.cost).toFixed(2)}` : '-')}
            </td>
            <td className="p-4 text-right font-bold font-mono">
                {isQuickEdit ? <input type="number" defaultValue={item.price} onBlur={(e) => onQuickUpdate(item.id, 'price', e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'price')} className="w-20 p-1 border rounded text-right bg-white focus:ring-2 ring-blue-500 outline-none" /> : `Bs. ${parseFloat(item.price).toFixed(2)}`}
            </td>
            <td className="p-4 text-right text-xs text-green-600 font-bold">
                {item.cost && item.price ? `${(((item.price - item.cost) / item.price) * 100).toFixed(0)}%` : '-'}
            </td>
            <td className="p-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button><button onClick={() => onDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button></div></td>
        </tr>
    );
};

// --- VISTA IMPRIMIBLE ---
export const PrintableView = ({ items }) => (
    <div className="p-8 bg-white text-black font-mono text-xs hidden print:block">
        <h1 className="text-xl font-bold mb-4 uppercase text-center border-b-2 border-black pb-2">Reporte de Inventario</h1>
        <table className="w-full text-left">
            <thead><tr className="border-b border-black"><th className="py-2">Producto</th><th className="py-2 text-center">Stock</th><th className="py-2 text-right">Costo</th><th className="py-2 text-right">Precio</th><th className="py-2 text-right">Valor Total</th></tr></thead>
            <tbody>
                {items.map(item => (
                    <tr key={item.id} className="border-b border-gray-200">
                        <td className="py-1">{item.name}</td>
                        <td className="py-1 text-center">{item.stock}</td>
                        <td className="py-1 text-right">{item.cost || '-'}</td>
                        <td className="py-1 text-right">{item.price}</td>
                        <td className="py-1 text-right">{item.stock && item.cost ? (item.stock * item.cost).toFixed(2) : '-'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// --- TICKET DE ASISTENCIA (80mm) ---
export const AttendanceTicket = ({ data }) => {
    if (!data) return null;

    // Format Date / Time
    const dateObj = new Date(data.timestamp || Date.now());
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString();

    return (
        <div id="attendance-ticket" style={{ width: '80mm', fontFamily: 'monospace', padding: '10px', fontSize: '12px', color: '#000', backgroundColor: '#fff', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                CONTROL DE ASISTENCIA
            </div>

            <div style={{ borderBottom: '1px dashed #000', marginBottom: '10px' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold' }}>FECHA:</span>
                <span>{dateStr}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold' }}>HORA:</span>
                <span>{timeStr}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold' }}>TURNO ID:</span>
                <span>#{data.registerId ? data.registerId.slice(-4) : '????'}</span>
            </div>

            <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

            <div style={{ marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold', display: 'block' }}>COLABORADOR:</span>
                <span style={{ fontSize: '14px' }}>{data.staffName}</span>
            </div>
            <div style={{ marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold' }}>ROL:</span> {data.role}
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '10px', borderTop: '1px solid #000' }}>
                _________________________<br />
                FIRMA CONFORME
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px' }}>
                *** REGISTRO INTERNO ***
            </div>
        </div>
    );
};