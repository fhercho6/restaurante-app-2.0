import { useState } from 'react';
import { addDoc, collection, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useRegister } from '../context/RegisterContext';

export const useSales = () => {
    const { currentUser, staffMember } = useAuth();
    const { items, getCollName, appName } = useData();
    const { registerSession, setSessionStats } = useRegister();

    const processSale = async (paymentResult, orderToPay, pendingSale) => {
        if (!db) return null;
        if (staffMember && staffMember.role !== 'Cajero' && staffMember.role !== 'Administrador') {
            toast.error("Solo Cajeros pueden cobrar.");
            return null;
        }
        if (!registerSession) {
            toast.error("La caja está cerrada");
            return null;
        }

        const toastId = toast.loading('Procesando pago...');

        const itemsToProcess = orderToPay ? orderToPay.items : pendingSale.cart;
        const { paymentsList, totalPaid, change, assignedWaiter } = paymentResult;
        const totalToProcess = totalPaid - change;

        try {
            const batchPromises = [];
            const timestamp = new Date();
            let cashierName = staffMember ? staffMember.name : 'Administrador';

            // PRIORITY: 1. Manually Assigned (Payment Modal) -> 2. Order Owner -> 3. Current User (Quick Sale) -> 4. Barra
            let waiterName = 'Barra';
            let waiterId = 'anon';

            if (assignedWaiter && assignedWaiter.id) {
                waiterName = assignedWaiter.name;
                waiterId = assignedWaiter.id;
            } else if (orderToPay) {
                waiterName = orderToPay.staffName || 'Barra';
                waiterId = orderToPay.staffId || 'anon';
            } else if (staffMember) {
                waiterName = staffMember.name;
                waiterId = staffMember.id;
            }

            let originalOrderId = 'ORD-' + Math.floor(Math.random() * 10000);
            if (orderToPay) {
                if (orderToPay.orderIds && Array.isArray(orderToPay.orderIds)) {
                    originalOrderId = orderToPay.orderIds.join(', ');
                } else if (orderToPay.orderId) {
                    originalOrderId = orderToPay.orderId;
                }
            }

            // Limpiar items para guardar en historial
            const cleanItems = itemsToProcess.map(item => ({
                id: item.id || 'unknown',
                name: item.name || 'Sin nombre',
                price: parseFloat(item.price) || 0,
                cost: parseFloat(item.cost) || 0,
                qty: parseInt(item.qty) || 1,
                category: item.category || 'General',
                stock: item.stock !== undefined ? item.stock : null,
                image: item.image || null,
                isServiceItem: !!item.isServiceItem,
                location: item.location || null,
                isCombo: !!item.isCombo,
                recipe: item.recipe || []
            }));

            const saleData = {
                date: timestamp.toISOString(),
                total: parseFloat(totalToProcess) || 0,
                items: cleanItems,
                staffId: waiterId,
                staffName: waiterName,
                cashier: cashierName,
                registerId: registerSession.id,
                payments: paymentsList || [],
                totalPaid: parseFloat(totalPaid) || 0,
                changeGiven: parseFloat(change) || 0,
                orderId: originalOrderId
            };

            const docRef = await addDoc(collection(db, isPersonalProject ? 'sales' : `${ROOT_COLLECTION}sales`), saleData);

            // --- LOGICA MAESTRA DE DESCUENTO DE STOCK ---
            cleanItems.forEach(item => {
                if (item.isServiceItem) return;

                if (item.isCombo && item.recipe && item.recipe.length > 0) {
                    item.recipe.forEach(ingredient => {
                        const ingredientInDb = items.find(i => i.id === ingredient.itemId);
                        if (ingredientInDb && ingredientInDb.stock !== undefined) {
                            const quantityToReduce = ingredient.qty * item.qty;
                            const newStock = parseInt(ingredientInDb.stock) - quantityToReduce;
                            batchPromises.push(updateDoc(doc(db, getCollName('items'), ingredientInDb.id), { stock: newStock }));
                        }
                    });
                } else if (item.stock !== null && item.stock !== '' && !isNaN(item.stock)) {
                    const newStock = parseInt(item.stock) - item.qty;
                    batchPromises.push(updateDoc(doc(db, getCollName('items'), item.id), { stock: newStock }));
                }
            });

            if (orderToPay && orderToPay.type !== 'quick_sale') {
                if (orderToPay.ids && Array.isArray(orderToPay.ids) && orderToPay.ids.length > 0) {
                    orderToPay.ids.forEach(id => {
                        batchPromises.push(deleteDoc(doc(db, isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`, id)));
                    });
                } else if (orderToPay.id && orderToPay.id !== 'BULK_PAYMENT') {
                    batchPromises.push(deleteDoc(doc(db, isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`, orderToPay.id)));
                }
            }

            await Promise.all(batchPromises);

            // --- ACTUALIZAR ESTADÍSTICAS DE SESIÓN ---
            // Nota: Esto es una actualización optimista. El listener en RegisterContext también lo hará,
            // pero si queremos respuesta instantánea en UI sin esperar al listener, podríamos dejarlo.
            // Sin embargo, para evitar conflictos, confiaremos en el listener de RegisterContext
            // o (si se prefiere) invocamos una función de contexto.
            // Dado que ya corregimos RegisterContext para escuchar, aquí solo retornamos éxito.

            const receiptData = {
                type: 'order',
                businessName: appName,
                date: timestamp.toLocaleString(),
                staffName: waiterName,
                cashierName: cashierName,
                orderId: originalOrderId,
                items: cleanItems,
                total: totalToProcess,
                payments: paymentsList,
                change: change,
                autoPrint: true
            };

            toast.success('Cobro exitoso', { id: toastId });
            return receiptData;

        } catch (e) {
            console.error(e);
            toast.error('Error al cobrar', { id: toastId });
            return null;
        }
    };

    const voidOrder = async (order) => {
        try {
            await deleteDoc(doc(db, isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`, order.id));
            const voidData = {
                ...order,
                type: 'void',
                businessName: appName,
                date: new Date().toLocaleString()
            };
            toast.success("Pedido anulado");
            return voidData;
        } catch (error) {
            toast.error("Error al anular");
            return null;
        }
    };

    const createOrder = async (cart, clearCart) => {
        if (!registerSession) return null;
        if (cart.length === 0) return null;

        const toastId = toast.loading('Procesando comanda...');
        try {
            const totalOrder = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

            const orderIdVal = 'ORD-' + Math.floor(Math.random() * 10000);
            const waiterId = staffMember ? staffMember.id : 'anon';
            const waiterName = staffMember ? staffMember.name : 'Mesero';

            const orderData = {
                date: new Date().toISOString(),
                staffId: waiterId,
                staffName: waiterName,
                orderId: orderIdVal,
                items: cart,
                total: totalOrder,
                status: 'pending' // Esto hace que aparezca en caja
            };

            await addDoc(collection(db, isPersonalProject ? 'pending_orders' : `${ROOT_COLLECTION}pending_orders`), orderData);

            const preCheckData = {
                ...orderData,
                type: 'order',
                date: new Date().toLocaleString(),
                businessName: appName,
                autoPrint: true
            };

            if (clearCart) clearCart([]);
            toast.success('Pedido enviado a caja', { id: toastId });
            return preCheckData;

        } catch (error) {
            console.error(error);
            toast.error('Error al enviar pedido', { id: toastId });
            return null;
        }
    };

    return { processSale, voidOrder, createOrder };
};
