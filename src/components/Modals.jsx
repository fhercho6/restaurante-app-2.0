// src/components/Modals.jsx - DISEÑO PREMIUM + GASTOS MEJORADO
import React, { useState, useEffect } from 'react';
import { X, Upload, Save, Trash2, Plus, Edit2, Check, LayoutGrid, DollarSign, FileText, ChevronDown, Loader2, Image as ImageIcon } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase'; // Ensure storage is exported from config

// --- 1. AUTH MODAL (Login) ---
export const AuthModal = ({ isOpen, onClose, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-900">ACCESO ADMINISTRADOR</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black"><X size={24} /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onLogin({ email, password }); }} className="space-y-4">
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Usuario / Email</label><input type="email" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all" value={email} onChange={e => setEmail(e.target.value)} autoFocus /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label><input type="password" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all" value={password} onChange={e => setPassword(e.target.value)} /></div>
                    <button type="submit" className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-transform active:scale-95 shadow-lg">INGRESAR</button>
                </form>
            </div>
        </div>
    );
};

// --- 2. PRODUCT MODAL (Crear/Editar) ---
export const ProductModal = ({ isOpen, onClose, onSave, item, categories, items = [] }) => {
    const [formData, setFormData] = useState({ name: '', price: '', category: categories[0] || 'Varios', image: '', stock: '', cost: '' });
    const [recipe, setRecipe] = useState([]);
    const [newIngredientId, setNewIngredientId] = useState('');
    const [newIngredientQty, setNewIngredientQty] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [ingredientSearch, setIngredientSearch] = useState('');

    useEffect(() => {
        if (item) {
            setFormData(item);
            setRecipe(item.recipe || []);
        } else {
            setFormData({ name: '', price: '', category: categories[0] || 'Varios', image: '', stock: '', cost: '' });
            setRecipe([]);
        }
        setIngredientSearch(''); // Reset search on open/change
    }, [item, categories, isOpen]);

    if (!isOpen) return null;
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            setFormData(prev => ({ ...prev, image: downloadURL }));
        } catch (error) {
            console.error("Error uploading image:", error);
            alert(`Error al subir imagen: ${error.message}\nRevisa que Firebase Storage esté activado y las reglas permitan escritura.`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddIngredient = () => {
        if (!newIngredientId || !newIngredientQty) return;
        const ingItem = items.find(i => i.id === newIngredientId);
        if (!ingItem) return;

        const newIng = {
            itemId: newIngredientId,
            name: ingItem.name,
            qty: parseInt(newIngredientQty)
        };
        setRecipe([...recipe, newIng]);
        setNewIngredientId('');
        setNewIngredientQty('');
        setIngredientSearch(''); // Optional: clear search after adding
    };

    const removeIngredient = (idx) => {
        const newR = [...recipe];
        newR.splice(idx, 1);
        setRecipe(newR);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const isCombo = ['combos', 'baldes', 'paquetes de cumple'].includes(formData.category.toLowerCase());
        // If it's a combo, we force stock to be handled dynamically (infinity symbol usually), but user might want to track manual stock too. 
        // Usually combos don't have stock themselves, they depend on ingredients.
        // We'll pass the recipe regardless.
        onSave({ ...formData, recipe, isCombo });
    };

    const isComboCategory = ['combos', 'baldes', 'paquetes de cumple'].includes(formData.category.toLowerCase());

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in zoom-in-95 duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-black text-gray-800 uppercase">{item ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
                    <div className="flex gap-4">
                        <div className="flex-1"><label className="label-input">Nombre del Producto</label><input name="name" className="input-field" placeholder="Ej. Combo Ron" value={formData.name} onChange={handleChange} required /></div>
                        <div className="w-1/3"><label className="label-input">Categoría</label><select name="category" className="input-field" value={formData.category} onChange={handleChange}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    </div>

                    {/* RECIPE BUILDER (ONLY FOR COMBOS) */}
                    {isComboCategory && (
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <h3 className="text-sm font-black text-orange-800 uppercase mb-3 flex items-center gap-2"><LayoutGrid size={16} /> Composición del Combo</h3>

                            {/* SEARCH & SELECT ROW */}
                            <div className="flex flex-col gap-2 mb-3">
                                <input
                                    placeholder="🔍 Buscar ingrediente..."
                                    className="w-full p-2 text-xs border border-orange-200 rounded-lg focus:outline-none focus:border-orange-500"
                                    value={ingredientSearch}
                                    onChange={e => setIngredientSearch(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <select className="flex-1 p-2 text-sm border rounded-lg" value={newIngredientId} onChange={e => setNewIngredientId(e.target.value)}>
                                        <option value="">-- Seleccionar --</option>
                                        {items
                                            .filter(i =>
                                                i.id !== item?.id &&
                                                i.category.toLowerCase() !== 'combos' &&
                                                i.name.toLowerCase().includes(ingredientSearch.toLowerCase())
                                            )
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map(i => (
                                                <option key={i.id} value={i.id}>{i.name} ({i.stock})</option>
                                            ))}
                                    </select>
                                    <input type="number" className="w-20 p-2 text-sm border rounded-lg" placeholder="Cant." value={newIngredientQty} onChange={e => setNewIngredientQty(e.target.value)} />
                                    <button type="button" onClick={handleAddIngredient} className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"><Check size={16} /></button>
                                </div>
                            </div>
                            {recipe.length > 0 ? (
                                <div className="space-y-2">
                                    {recipe.map((r, idx) => {
                                        const originalItem = items.find(i => i.id === r.itemId);
                                        const itemCost = originalItem ? (parseFloat(originalItem.cost) || 0) : 0;
                                        return (
                                            <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-orange-100 shadow-sm text-sm">
                                                <span className="font-bold text-gray-700">{r.qty}x {r.name} <span className="text-xs text-gray-400 font-normal">({itemCost > 0 ? `Costo: ${itemCost * r.qty} ` : 'Sin Costo'})</span></span>
                                                <button type="button" onClick={() => removeIngredient(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14} /></button>
                                            </div>
                                        );
                                    })}
                                    <div className="mt-2 pt-2 border-t border-orange-200 flex justify-between items-center text-xs text-orange-800 font-bold">
                                        <span>Costo total de ingredientes:</span>
                                        <span>Bs. {recipe.reduce((sum, r) => {
                                            const originalItem = items.find(i => i.id === r.itemId);
                                            const c = originalItem ? (parseFloat(originalItem.cost) || 0) : 0;
                                            return sum + (c * r.qty);
                                        }, 0).toFixed(2)}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const total = recipe.reduce((sum, r) => {
                                                const originalItem = items.find(i => i.id === r.itemId);
                                                const c = originalItem ? (parseFloat(originalItem.cost) || 0) : 0;
                                                return sum + (c * r.qty);
                                            }, 0);
                                            setFormData(prev => ({ ...prev, cost: total }));
                                        }}
                                        className="w-full text-center text-[10px] bg-orange-200 hover:bg-orange-300 text-orange-800 py-1 rounded mt-1 font-bold transition-colors"
                                    >
                                        USAR ESTE COSTO AUTOMÁTICO
                                    </button>
                                </div>
                            ) : <p className="text-xs text-orange-400 italic">Agrega productos para descontar del inventario al vender este combo.</p>}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <div className="w-1/2"><label className="label-input">Precio Venta (Bs.)</label><input name="price" type="number" step="0.5" className="input-field font-mono font-bold text-green-600" placeholder="0.00" value={formData.price} onChange={handleChange} required /></div>
                        <div className="w-1/2"><label className="label-input">Costo (Opcional)</label><input name="cost" type="number" step="0.5" className="input-field font-mono" placeholder="0.00" value={formData.cost} onChange={handleChange} /></div>
                    </div>
                    {!isComboCategory && (
                        <div className="flex gap-4">
                            <div className="w-1/2"><label className="label-input">Stock Inicial</label><input name="stock" type="number" className="input-field font-mono" placeholder="0" value={formData.stock} onChange={handleChange} /></div>
                        </div>
                    )}

                    {/* IMAGE UPLOAD SECTION */}
                    <div>
                        <label className="label-input">Imagen del Producto</label>
                        <div className="flex gap-4 items-start">
                            <div className="w-24 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                                {isUploading ? (
                                    <Loader2 className="animate-spin text-gray-400" />
                                ) : formData.image ? (
                                    <>
                                        <img src={formData.image} alt="Product" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
                                            <Edit2 size={16} className="text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <label htmlFor="file-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                                        <ImageIcon size={24} />
                                        <span className="text-[10px] uppercase font-bold mt-1">Subir</span>
                                    </label>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                <input
                                    name="image"
                                    className="input-field text-xs text-gray-500"
                                    placeholder="O pega una URL..."
                                    value={formData.image}
                                    onChange={handleChange}
                                />
                                <p className="text-[10px] text-gray-400 leading-tight">
                                    Sube una foto desde tu equipo o pega un enlace directo.
                                    <br />Formatos: JPG, PNG, WEBP.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={isUploading} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isUploading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        GUARDAR PRODUCTO
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- 3. CATEGORY MANAGER ---
export const CategoryManager = ({ isOpen, onClose, categories, onAdd, onRename, onDelete }) => {
    const [newCat, setNewCat] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editName, setEditName] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="bg-gray-900 text-white p-4 flex justify-between items-center"><h3 className="font-bold">Gestionar Categorías</h3><button onClick={onClose}><X size={20} /></button></div>
                <div className="p-4 bg-gray-50 border-b flex gap-2"><input className="flex-1 p-2 border rounded-lg" placeholder="Nueva Categoría" value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newCat) { onAdd(newCat); setNewCat('') } }} /><button onClick={() => { if (newCat) { onAdd(newCat); setNewCat('') } }} className="bg-green-600 text-white p-2 rounded-lg"><Plus size={20} /></button></div>
                <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm group">
                            {editingIndex === idx ? (<input className="flex-1 border-b-2 border-blue-500 outline-none font-bold" autoFocus value={editName} onChange={e => setEditName(e.target.value)} onBlur={() => { if (editName) onRename(idx, editName); setEditingIndex(null) }} onKeyDown={e => { if (e.key === 'Enter' && editName) { onRename(idx, editName); setEditingIndex(null) } }} />) : (<span className="font-bold text-gray-700 flex-1">{cat}</span>)}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingIndex(idx); setEditName(cat) }} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16} /></button>
                                <button onClick={() => { if (window.confirm('¿Borrar?')) onDelete(idx) }} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- 4. ROLE MANAGER ---
export const RoleManager = ({ isOpen, onClose, roles, onAdd, onRename, onDelete }) => {
    const [newRole, setNewRole] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editName, setEditName] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="bg-blue-900 text-white p-4 flex justify-between items-center"><h3 className="font-bold">Gestionar Roles</h3><button onClick={onClose}><X size={20} /></button></div>
                <div className="p-4 bg-gray-50 border-b flex gap-2"><input className="flex-1 p-2 border rounded-lg" placeholder="Nuevo Rol" value={newRole} onChange={e => setNewRole(e.target.value)} /><button onClick={() => { if (newRole) { onAdd(newRole); setNewRole('') } }} className="bg-blue-600 text-white p-2 rounded-lg"><Plus size={20} /></button></div>
                <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                    {roles.map((role, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm group">
                            {editingIndex === idx ? (<input className="flex-1 border-b-2 border-blue-500 outline-none font-bold" autoFocus value={editName} onChange={e => setEditName(e.target.value)} onBlur={() => { if (editName) onRename(idx, editName); setEditingIndex(null) }} onKeyDown={e => { if (e.key === 'Enter' && editName) { onRename(idx, editName); setEditingIndex(null) } }} />) : (<span className="font-bold text-gray-700 flex-1">{role}</span>)}
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingIndex(idx); setEditName(role) }} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16} /></button>
                                <button onClick={() => { if (window.confirm('¿Borrar?')) onDelete(idx) }} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- 5. TABLE MANAGER ---
export const TableManager = ({ isOpen, onClose, tables, onAdd, onRename, onDelete }) => {
    const [newTable, setNewTable] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editName, setEditName] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="bg-purple-900 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><LayoutGrid size={20} /> Gestión de Mesas</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="p-4 bg-gray-50 border-b flex gap-2">
                    <input
                        className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Ej. Terraza 1"
                        value={newTable}
                        onChange={e => setNewTable(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && newTable) { onAdd(newTable); setNewTable('') } }}
                    />
                    <button onClick={() => { if (newTable) { onAdd(newTable); setNewTable('') } }} className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700"><Plus size={20} /></button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                    {tables.map((table, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm group hover:border-purple-200 transition-colors">
                            {editingIndex === idx ? (
                                <input
                                    className="flex-1 border-b-2 border-purple-500 outline-none font-bold text-purple-900 uppercase"
                                    autoFocus
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    onBlur={() => { if (editName) onRename(idx, editName); setEditingIndex(null) }}
                                    onKeyDown={e => { if (e.key === 'Enter' && editName) { onRename(idx, editName); setEditingIndex(null) } }}
                                />
                            ) : (
                                <span className="font-bold text-gray-700 flex-1 uppercase">{table}</span>
                            )}

                            <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingIndex(idx); setEditName(table) }} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16} /></button>
                                <button onClick={() => { if (window.confirm('¿Borrar esta mesa?')) onDelete(idx) }} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {tables.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">No hay mesas registradas</p>}
                </div>
            </div>
        </div>
    );
};

// --- 6. EXPENSE TYPE MANAGER ---
export const ExpenseTypeManager = ({ isOpen, onClose, expenseTypes, onAdd, onRename, onDelete }) => {
    const [newType, setNewType] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editName, setEditName] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="bg-red-900 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><DollarSign size={20} /> Tipos de Gasto</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                {/* Agregar Tipo */}
                <div className="p-4 bg-gray-50 border-b flex gap-2">
                    <input
                        className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Ej. Hielo, Taxi, Limpieza..."
                        value={newType}
                        onChange={e => setNewType(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && newType) { onAdd(newType); setNewType('') } }}
                    />
                    <button onClick={() => { if (newType) { onAdd(newType); setNewType('') } }} className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"><Plus size={20} /></button>
                </div>

                {/* Lista */}
                <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                    {expenseTypes.map((type, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm group hover:border-red-200 transition-colors">
                            {editingIndex === idx ? (
                                <input
                                    className="flex-1 border-b-2 border-red-500 outline-none font-bold text-red-900"
                                    autoFocus
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    onBlur={() => { if (editName) onRename(idx, editName); setEditingIndex(null) }}
                                    onKeyDown={e => { if (e.key === 'Enter' && editName) { onRename(idx, editName); setEditingIndex(null) } }}
                                />
                            ) : (
                                <span className="font-bold text-gray-700 flex-1">{type}</span>
                            )}

                            <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingIndex(idx); setEditName(type) }} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16} /></button>
                                <button onClick={() => { if (window.confirm('¿Borrar este tipo de gasto?')) onDelete(idx) }} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {expenseTypes.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">No hay tipos definidos</p>}
                </div>
            </div>
        </div>
    );
};

// --- 7. BRANDING MODAL ---
// --- 7. SYSTEM CONFIG MODAL (ANTES BRANDING) ---
export const BrandingModal = ({ isOpen, onClose, onSave, currentLogo, currentName, currentAutoLock }) => {
    const [logoUrl, setLogoUrl] = useState(currentLogo || '');
    const [appName, setAppName] = useState(currentName || '');
    const [autoLockTime, setAutoLockTime] = useState(currentAutoLock || 45); // Default 45s

    // Actualizar estados al abrir
    useEffect(() => {
        setLogoUrl(currentLogo || '');
        setAppName(currentName || '');
        setAutoLockTime(currentAutoLock || 45);
    }, [isOpen, currentLogo, currentName, currentAutoLock]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-800">Configuración del Sistema</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-black" /></button>
                </div>

                <div className="space-y-5">
                    {/* Identidad */}
                    <div>
                        <label className="label-input">Nombre del Negocio</label>
                        <input className="input-field" value={appName} onChange={e => setAppName(e.target.value)} placeholder="Ej. LicoBar" />
                    </div>
                    <div>
                        <label className="label-input">URL del Logo</label>
                        <input className="input-field" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
                    </div>

                    <hr className="border-gray-100" />

                    {/* Seguridad */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="label-input mb-0">Cierre Automático (Garzones)</label>
                            <span className="text-xs font-black bg-gray-100 px-2 py-1 rounded text-gray-600">{autoLockTime} seg</span>
                        </div>
                        <input
                            type="range"
                            min="15"
                            max="120"
                            step="5"
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                            value={autoLockTime}
                            onChange={e => setAutoLockTime(parseInt(e.target.value))}
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>15s (Rápido)</span>
                            <span>120s (Lento)</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 leading-tight">
                            Tiempo que la tablet espera inactiva antes de cerrar la sesión del garzón automáticamente.
                        </p>
                    </div>

                    <button
                        onClick={() => { onSave(logoUrl, appName, autoLockTime); onClose(); }}
                        className="w-full bg-black text-white py-3 rounded-xl font-bold mt-2 shadow-lg hover:bg-gray-800 transition-transform active:scale-95"
                    >
                        GUARDAR CAMBIOS
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- 8. SERVICE START MODAL ---
export const ServiceStartModal = ({ isOpen, onClose, services, onStart, occupiedLocations }) => {
    const [selectedService, setSelectedService] = useState(null);
    const [note, setNote] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="bg-purple-600 p-4 text-white flex justify-between items-center"><h3 className="font-bold">Iniciar Servicio</h3><button onClick={onClose}><X size={20} /></button></div>
                <div className="p-4 space-y-4">
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Selecciona Servicio</label><div className="grid grid-cols-2 gap-2">{services.map(srv => (<button key={srv.id} onClick={() => setSelectedService(srv)} className={`p - 3 rounded - xl border text - sm font - bold transition - all text - left ${selectedService?.id === srv.id ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'} `}>{srv.name}<span className="block text-[10px] text-gray-400 font-normal">Bs. {srv.price}/hr</span></button>))}</div></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ubicación / Mesa</label><input placeholder="Ej. Mesa 1, VIP..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" value={note} onChange={e => setNote(e.target.value)} /></div>
                    {occupiedLocations.includes(note) && note && <p className="text-xs text-red-500 font-bold">⚠️ Esta ubicación parece ocupada.</p>}
                    <button disabled={!selectedService || !note} onClick={() => onStart(selectedService, note)} className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">INICIAR CRONÓMETRO</button>
                </div>
            </div>
        </div>
    );
};

// --- 9. EXPENSE MODAL (DISEÑO MEJORADO) ---
export const ExpenseModal = ({ isOpen, onClose, onSave, expenseTypes }) => {
    const [selectedType, setSelectedType] = useState(expenseTypes && expenseTypes.length > 0 ? expenseTypes[0] : '');
    const [detail, setDetail] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (expenseTypes && expenseTypes.length > 0 && !selectedType) {
            setSelectedType(expenseTypes[0]);
        }
    }, [expenseTypes]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (amount) {
            const finalDesc = detail || selectedType;
            onSave(finalDesc, parseFloat(amount), selectedType);
            setDetail('');
            setAmount('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all">
                {/* Header Rediseñado */}
                <div className="bg-red-600 p-6 flex justify-between items-center text-white">
                    <div>
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                            <DollarSign size={24} className="text-red-200" />
                            Registro de Gastos
                        </h3>
                        <p className="text-red-100 text-xs font-medium uppercase tracking-wider mt-1 opacity-90">x Turno Actual</p>
                    </div>
                    <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors backdrop-blur-md">
                        <X size={20} className="text-white" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* SELECTOR DE TIPO */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Motivo / Tipo</label>
                        <div className="relative">
                            <select
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-red-500 appearance-none transition-all"
                                value={selectedType}
                                onChange={e => setSelectedType(e.target.value)}
                            >
                                {expenseTypes && expenseTypes.length > 0 ? (
                                    expenseTypes.map(type => <option key={type} value={type}>{type}</option>)
                                ) : (
                                    <option value="Varios">Varios (Sin tipos definidos)</option>
                                )}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                <ChevronDown size={18} />
                            </div>
                        </div>
                    </div>

                    {/* DETALLE OPCIONAL */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Detalle Adicional <span className="text-gray-300 font-normal">(Opcional)</span></label>
                        <input
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-500 transition-all"
                            placeholder="Ej. Placas, Limones extra..."
                            value={detail}
                            onChange={e => setDetail(e.target.value)}
                        />
                    </div>

                    {/* MONTO */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Monto a Retirar</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-3.5 text-gray-400 font-bold group-focus-within:text-red-500 transition-colors">Bs.</span>
                            <input
                                type="number"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-xl font-black text-gray-900 outline-none focus:border-red-500 focus:bg-white transition-all placeholder-gray-300"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!amount}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 mt-2 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileText size={20} />
                        REGISTRAR SALIDA
                    </button>
                </div>
            </div>
        </div>
    );
};