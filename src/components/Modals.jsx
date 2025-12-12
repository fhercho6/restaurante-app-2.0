// src/components/Modals.jsx - CON MODULO DE GASTOS
import React, { useState, useEffect } from 'react';
import { X, Upload, Save, Plus, Trash2, Edit2, Check, Shield, Clock, MapPin, DollarSign } from 'lucide-react';

// --- LISTA DE MESAS ---
const COMMON_LOCATIONS = [
  "PRIVADO 104", "PRIVADO 105", "PRIVADO 106", "PRIVADO 107", "PRIVADO 108",
  "Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Mesa 5", "Barra"
];

// --- 1. MODAL DE AUTENTICACIÓN ---
export const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Acceso Administrativo</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Usuario / Email</label><input type="text" className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-orange-500 font-bold text-gray-700" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label><input type="password" className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-orange-500 font-bold text-gray-700" value={password} onChange={e => setPassword(e.target.value)} /></div>
          <button onClick={() => onLogin({ email, password })} className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 shadow-lg">ENTRAR AL SISTEMA</button>
        </div>
      </div>
    </div>
  );
};

// --- 2. MODAL DE PRODUCTO ---
export const ProductModal = ({ isOpen, onClose, onSave, item, categories }) => {
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Bebidas', stock: '', image: '', cost: '' });
  useEffect(() => { if (item) setFormData(item); else setFormData({ name: '', price: '', category: 'Bebidas', stock: '', image: '', cost: '' }); }, [item, isOpen]);
  if (!isOpen) return null;
  const handleImageUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setFormData({ ...formData, image: reader.result }); reader.readAsDataURL(file); } };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in zoom-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50"><h2 className="text-xl font-black text-gray-800">{item ? 'Editar Producto' : 'Nuevo Producto'}</h2><button onClick={onClose}><X className="text-gray-400 hover:text-red-500" /></button></div>
        <div className="p-6 space-y-4">
          <div className="flex justify-center mb-4"><div className="w-32 h-32 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-orange-500 transition-colors">{formData.image ? <img src={formData.image} alt="" className="w-full h-full object-cover" /> : <Upload className="text-gray-400 mb-2" />}<input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" /><span className="text-xs text-gray-400 font-bold">Subir Foto</span></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Nombre</label><input type="text" className="w-full p-3 border rounded-xl font-bold text-gray-800 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-500 uppercase">Precio</label><input type="number" className="w-full p-3 border rounded-xl font-bold text-gray-800 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-500 uppercase">Costo</label><input type="number" className="w-full p-3 border rounded-xl font-bold text-gray-500 outline-none" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-500 uppercase">Categoría</label><select className="w-full p-3 border rounded-xl font-bold text-gray-800 bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="text-xs font-bold text-gray-500 uppercase">Stock</label><input type="number" className="w-full p-3 border rounded-xl font-bold text-gray-800 outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
          </div>
          <button onClick={() => onSave(formData)} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg mt-4 flex items-center justify-center gap-2"><Save size={20}/> GUARDAR</button>
        </div>
      </div>
    </div>
  );
};

// --- 3. CATEGORY MANAGER ---
export const CategoryManager = ({ isOpen, onClose, categories, onAdd, onRename, onDelete }) => {
  const [newCat, setNewCat] = useState(''); const [editingIndex, setEditingIndex] = useState(null); const [editName, setEditName] = useState('');
  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"><div className="flex justify-between mb-4"><h3 className="font-bold text-lg">Categorías</h3><button onClick={onClose}><X/></button></div><div className="flex gap-2 mb-6"><input type="text" placeholder="Nueva..." className="flex-1 p-2 border rounded-lg" value={newCat} onChange={e=>setNewCat(e.target.value)}/><button onClick={()=>{if(newCat){onAdd(newCat);setNewCat('');}}} className="bg-black text-white p-2 rounded-lg"><Plus/></button></div><div className="space-y-2 max-h-60 overflow-y-auto">{categories.map((cat, i) => (<div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group">{editingIndex === i ? (<div className="flex gap-2 flex-1"><input autoFocus className="flex-1 p-1 text-sm border rounded" value={editName} onChange={e=>setEditName(e.target.value)}/><button onClick={()=>{onRename(i, editName); setEditingIndex(null);}} className="text-green-600"><Check size={16}/></button></div>) : (<><span className="font-medium text-gray-700">{cat}</span><div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>{setEditingIndex(i); setEditName(cat);}} className="text-blue-500"><Edit2 size={16}/></button><button onClick={()=>onDelete(i)} className="text-red-500"><Trash2 size={16}/></button></div></>)}</div>))}</div></div></div>
  );
};

// --- 4. ROLE MANAGER ---
export const RoleManager = ({ isOpen, onClose, roles, onAdd, onRename, onDelete }) => {
  const [newRole, setNewRole] = useState(''); const [editingIndex, setEditingIndex] = useState(null); const [editName, setEditName] = useState('');
  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"><div className="flex justify-between mb-4"><h3 className="font-bold text-lg flex items-center gap-2"><Shield size={18}/> Roles</h3><button onClick={onClose}><X/></button></div><div className="flex gap-2 mb-6"><input type="text" placeholder="Nuevo rol..." className="flex-1 p-2 border rounded-lg" value={newRole} onChange={e=>setNewRole(e.target.value)}/><button onClick={()=>{if(newRole){onAdd(newRole);setNewRole('');}}} className="bg-black text-white p-2 rounded-lg"><Plus/></button></div><div className="space-y-2">{roles.map((rol, i) => (<div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group">{editingIndex === i ? (<div className="flex gap-2 flex-1"><input autoFocus className="flex-1 p-1 text-sm border rounded" value={editName} onChange={e=>setEditName(e.target.value)}/><button onClick={()=>{onRename(i, editName); setEditingIndex(null);}} className="text-green-600"><Check size={16}/></button></div>) : (<><span className="font-medium text-gray-700">{rol}</span><div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>{setEditingIndex(i); setEditName(rol);}} className="text-blue-500"><Edit2 size={16}/></button><button onClick={()=>onDelete(i)} className="text-red-500"><Trash2 size={16}/></button></div></>)}</div>))}</div></div></div>
  );
};

// --- 5. BRANDING MODAL ---
export const BrandingModal = ({ isOpen, onClose, onSave, currentLogo, currentName }) => {
  const [logo, setLogo] = useState(null); const [appName, setAppName] = useState('');
  useEffect(() => { if (isOpen) { setLogo(currentLogo); setAppName(currentName || ''); } }, [isOpen, currentLogo, currentName]);
  if(!isOpen) return null;
  const handleImage = (e) => { const file = e.target.files[0]; if(file) { const r = new FileReader(); r.onloadend = () => setLogo(r.result); r.readAsDataURL(file); } };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center"><h3 className="font-bold text-lg mb-6">Personalizar Marca</h3><div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 relative mb-4">{logo ? <img src={logo} className="w-full h-full object-contain"/> : <Upload className="text-gray-400"/>}<input type="file" accept="image/*" onChange={handleImage} className="absolute inset-0 opacity-0 cursor-pointer"/></div><input type="text" placeholder="Nombre" className="w-full p-3 border rounded-xl mb-6 text-center font-bold" value={appName} onChange={e => setAppName(e.target.value)} /><div className="flex gap-2"><button onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancelar</button><button onClick={() => { onSave(logo, appName); onClose(); }} className="flex-1 py-3 bg-black text-white rounded-xl font-bold">Guardar</button></div></div></div>
  );
};

// --- 6. SERVICE START MODAL ---
export const ServiceStartModal = ({ isOpen, onClose, services, onStart, occupiedLocations = [] }) => {
  const [selectedService, setSelectedService] = useState(null); const [note, setNote] = useState('');
  if (!isOpen) return null;
  const handleSubmit = (e) => { e.preventDefault(); if (!selectedService || !note) return; onStart(selectedService, note); setNote(''); setSelectedService(null); };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in"><div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"><h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2"><Clock size={24} className="text-purple-600"/> Iniciar Servicio</h2><form onSubmit={handleSubmit}><div className="mb-4"><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Servicio</label><div className="space-y-2 max-h-48 overflow-y-auto pr-1">{services.map(srv => (<div key={srv.id} onClick={() => setSelectedService(srv)} className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedService?.id === srv.id ? 'border-purple-600 bg-purple-50' : 'border-gray-100 hover:border-purple-300'}`}><div className="flex justify-between font-bold text-gray-800"><span>{srv.name}</span><span className="text-purple-600">Bs. {Number(srv.price).toFixed(2)}/h</span></div></div>))}</div></div><div className="mb-6"><label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><MapPin size={12}/> Mesa</label><select required className="w-full p-3 border rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none bg-white" value={note} onChange={e => setNote(e.target.value)}><option value="">-- Seleccionar --</option>{COMMON_LOCATIONS.map(loc => { const isOccupied = occupiedLocations.includes(loc); return (<option key={loc} value={loc} disabled={isOccupied} className={isOccupied ? 'text-gray-300' : ''}>{loc} {isOccupied ? '(Ocupado)' : ''}</option>); })}</select></div><div className="flex gap-3"><button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Cancelar</button><button type="submit" disabled={!selectedService || !note} className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg ${(!selectedService || !note) ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}>INICIAR</button></div></form></div></div>
  );
};

// --- 7. NUEVO: MODAL DE GASTOS (NUEVA FUNCIONALIDAD) ---
export const ExpenseModal = ({ isOpen, onClose, onSave }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = (e) => {
      e.preventDefault();
      if (!desc || !amount) return;
      onSave(desc, parseFloat(amount));
      setDesc('');
      setAmount('');
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in zoom-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
         <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-black text-red-600 flex items-center gap-2">
                 <div className="bg-red-100 p-2 rounded-full"><DollarSign size={24}/></div>
                 Registrar Gasto
             </h3>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Motivo / Descripción</label>
                 <input 
                    type="text" 
                    placeholder="Ej: Hielo, Taxi, Adelanto..." 
                    className="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:border-red-500"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    required
                    autoFocus
                 />
             </div>
             <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monto (Bs)</label>
                 <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:border-red-500 text-2xl"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    step="0.50"
                 />
             </div>

             <div className="pt-2">
                 <button type="submit" className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2">
                     GUARDAR GASTO
                 </button>
             </div>
         </form>
      </div>
    </div>
  );
};