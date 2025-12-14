// src/components/Modals.jsx - CON GESTOR DE MESAS
import React, { useState, useEffect } from 'react';
import { X, Upload, Save, Trash2, Plus, Edit2, Check, LayoutGrid } from 'lucide-react';

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
export const ProductModal = ({ isOpen, onClose, onSave, item, categories }) => {
  const [formData, setFormData] = useState({ name: '', price: '', category: categories[0] || 'Varios', image: '', stock: '', cost: '' });
  useEffect(() => { 
      if (item) setFormData(item); 
      else setFormData({ name: '', price: '', category: categories[0] || 'Varios', image: '', stock: '', cost: '' }); 
  }, [item, categories]);

  if (!isOpen) return null;
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black text-gray-800 uppercase">{item ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
            <div className="flex gap-4">
                <div className="flex-1"><label className="label-input">Nombre del Producto</label><input name="name" className="input-field" placeholder="Ej. Coca Cola 2L" value={formData.name} onChange={handleChange} required /></div>
                <div className="w-1/3"><label className="label-input">Categoría</label><select name="category" className="input-field" value={formData.category} onChange={handleChange}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            <div className="flex gap-4">
                <div className="w-1/2"><label className="label-input">Precio Venta (Bs.)</label><input name="price" type="number" step="0.5" className="input-field font-mono font-bold text-green-600" placeholder="0.00" value={formData.price} onChange={handleChange} required /></div>
                <div className="w-1/2"><label className="label-input">Costo (Opcional)</label><input name="cost" type="number" step="0.5" className="input-field font-mono" placeholder="0.00" value={formData.cost} onChange={handleChange} /></div>
            </div>
            <div className="flex gap-4">
                 <div className="w-1/2"><label className="label-input">Stock Inicial</label><input name="stock" type="number" className="input-field font-mono" placeholder="0" value={formData.stock} onChange={handleChange} /></div>
            </div>
            <div><label className="label-input">URL Imagen (Opcional)</label><div className="flex gap-2"><input name="image" className="input-field flex-1" placeholder="https://..." value={formData.image} onChange={handleChange} /><div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">{formData.image ? <img src={formData.image} alt="Prev" className="w-full h-full object-cover" /> : <Upload size={16} className="text-gray-400" />}</div></div></div>
            <button type="submit" className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"><Save size={20} /> GUARDAR PRODUCTO</button>
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
                <div className="bg-gray-900 text-white p-4 flex justify-between items-center"><h3 className="font-bold">Gestionar Categorías</h3><button onClick={onClose}><X size={20}/></button></div>
                <div className="p-4 bg-gray-50 border-b flex gap-2"><input className="flex-1 p-2 border rounded-lg" placeholder="Nueva Categoría" value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&newCat){onAdd(newCat);setNewCat('')}}} /><button onClick={()=>{if(newCat){onAdd(newCat);setNewCat('')}}} className="bg-green-600 text-white p-2 rounded-lg"><Plus size={20}/></button></div>
                <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm group">
                            {editingIndex === idx ? (<input className="flex-1 border-b-2 border-blue-500 outline-none font-bold" autoFocus value={editName} onChange={e=>setEditName(e.target.value)} onBlur={()=>{if(editName)onRename(idx,editName);setEditingIndex(null)}} onKeyDown={e=>{if(e.key==='Enter'&&editName){onRename(idx,editName);setEditingIndex(null)}}} />) : (<span className="font-bold text-gray-700 flex-1">{cat}</span>)}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={()=>{setEditingIndex(idx);setEditName(cat)}} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16}/></button>
                                <button onClick={()=>{if(window.confirm('¿Borrar?'))onDelete(idx)}} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16}/></button>
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
                <div className="bg-blue-900 text-white p-4 flex justify-between items-center"><h3 className="font-bold">Gestionar Roles</h3><button onClick={onClose}><X size={20}/></button></div>
                <div className="p-4 bg-gray-50 border-b flex gap-2"><input className="flex-1 p-2 border rounded-lg" placeholder="Nuevo Rol" value={newRole} onChange={e=>setNewRole(e.target.value)} /><button onClick={()=>{if(newRole){onAdd(newRole);setNewRole('')}}} className="bg-blue-600 text-white p-2 rounded-lg"><Plus size={20}/></button></div>
                <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                    {roles.map((role, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm group">
                            {editingIndex === idx ? (<input className="flex-1 border-b-2 border-blue-500 outline-none font-bold" autoFocus value={editName} onChange={e=>setEditName(e.target.value)} onBlur={()=>{if(editName)onRename(idx,editName);setEditingIndex(null)}} onKeyDown={e=>{if(e.key==='Enter'&&editName){onRename(idx,editName);setEditingIndex(null)}}} />) : (<span className="font-bold text-gray-700 flex-1">{role}</span>)}
                            <div className="flex gap-2">
                                <button onClick={()=>{setEditingIndex(idx);setEditName(role)}} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16}/></button>
                                <button onClick={()=>{if(window.confirm('¿Borrar?'))onDelete(idx)}} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- 5. TABLE MANAGER (NUEVO) ---
export const TableManager = ({ isOpen, onClose, tables, onAdd, onRename, onDelete }) => {
    const [newTable, setNewTable] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editName, setEditName] = useState('');
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="bg-purple-900 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><LayoutGrid size={20}/> Gestión de Mesas</h3>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                
                {/* Agregar Mesa */}
                <div className="p-4 bg-gray-50 border-b flex gap-2">
                    <input 
                        className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500" 
                        placeholder="Ej. Terraza 1" 
                        value={newTable} 
                        onChange={e=>setNewTable(e.target.value)} 
                        onKeyDown={e=>{if(e.key==='Enter'&&newTable){onAdd(newTable);setNewTable('')}}}
                    />
                    <button onClick={()=>{if(newTable){onAdd(newTable);setNewTable('')}}} className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700"><Plus size={20}/></button>
                </div>
                
                {/* Lista */}
                <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                    {tables.map((table, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm group hover:border-purple-200 transition-colors">
                            {editingIndex === idx ? (
                                <input 
                                    className="flex-1 border-b-2 border-purple-500 outline-none font-bold text-purple-900 uppercase" 
                                    autoFocus 
                                    value={editName} 
                                    onChange={e=>setEditName(e.target.value)} 
                                    onBlur={()=>{if(editName)onRename(idx,editName);setEditingIndex(null)}} 
                                    onKeyDown={e=>{if(e.key==='Enter'&&editName){onRename(idx,editName);setEditingIndex(null)}}} 
                                />
                            ) : (
                                <span className="font-bold text-gray-700 flex-1 uppercase">{table}</span>
                            )}
                            
                            <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={()=>{setEditingIndex(idx);setEditName(table)}} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16}/></button>
                                <button onClick={()=>{if(window.confirm('¿Borrar esta mesa?'))onDelete(idx)}} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                    {tables.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">No hay mesas registradas</p>}
                </div>
            </div>
        </div>
    );
};

// --- 6. BRANDING MODAL ---
export const BrandingModal = ({ isOpen, onClose, onSave, currentLogo, currentName }) => {
    const [logoUrl, setLogoUrl] = useState(currentLogo || '');
    const [appName, setAppName] = useState(currentName || '');
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                <h3 className="text-lg font-black mb-4">Personalizar Marca</h3>
                <div className="space-y-4">
                    <div><label className="label-input">Nombre del Negocio</label><input className="input-field" value={appName} onChange={e=>setAppName(e.target.value)}/></div>
                    <div><label className="label-input">URL del Logo</label><input className="input-field" value={logoUrl} onChange={e=>setLogoUrl(e.target.value)}/></div>
                    <button onClick={()=>{onSave(logoUrl, appName); onClose()}} className="w-full bg-black text-white py-3 rounded-xl font-bold mt-2">GUARDAR CAMBIOS</button>
                    <button onClick={onClose} className="w-full text-gray-500 py-2 text-sm">Cancelar</button>
                </div>
            </div>
        </div>
    );
};

// --- 7. SERVICE START MODAL ---
export const ServiceStartModal = ({ isOpen, onClose, services, onStart, occupiedLocations }) => {
    const [selectedService, setSelectedService] = useState(null);
    const [note, setNote] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="bg-purple-600 p-4 text-white flex justify-between items-center"><h3 className="font-bold">Iniciar Servicio</h3><button onClick={onClose}><X size={20}/></button></div>
                <div className="p-4 space-y-4">
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Selecciona Servicio</label><div className="grid grid-cols-2 gap-2">{services.map(srv => (<button key={srv.id} onClick={() => setSelectedService(srv)} className={`p-3 rounded-xl border text-sm font-bold transition-all text-left ${selectedService?.id === srv.id ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'}`}>{srv.name}<span className="block text-[10px] text-gray-400 font-normal">Bs. {srv.price}/hr</span></button>))}</div></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ubicación / Mesa</label><input placeholder="Ej. Mesa 1, VIP..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" value={note} onChange={e => setNote(e.target.value)} /></div>
                    {occupiedLocations.includes(note) && note && <p className="text-xs text-red-500 font-bold">⚠️ Esta ubicación parece ocupada.</p>}
                    <button disabled={!selectedService || !note} onClick={() => onStart(selectedService, note)} className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">INICIAR CRONÓMETRO</button>
                </div>
            </div>
        </div>
    );
};

// --- 8. EXPENSE MODAL ---
export const ExpenseModal = ({ isOpen, onClose, onSave }) => {
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
                <h3 className="text-lg font-black text-red-600 mb-4">Registrar Gasto</h3>
                <div className="space-y-4">
                    <div><label className="label-input">Descripción</label><input className="input-field" placeholder="Ej. Hielo, Taxis..." value={desc} onChange={e=>setDesc(e.target.value)} autoFocus/></div>
                    <div><label className="label-input">Monto (Bs)</label><input type="number" className="input-field" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)}/></div>
                    <button onClick={()=>{if(desc && amount) { onSave(desc, parseFloat(amount)); setDesc(''); setAmount(''); onClose(); }}} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg">REGISTRAR SALIDA</button>
                    <button onClick={onClose} className="w-full py-2 text-gray-500 text-sm">Cancelar</button>
                </div>
            </div>
        </div>
    );
};