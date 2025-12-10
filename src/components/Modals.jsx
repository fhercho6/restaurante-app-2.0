// src/components/Modals.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Lock, Eye, EyeOff, RefreshCw, ImageIcon, 
  Settings, AlertCircle, Plus, Edit2, Trash2, Briefcase, Check, Upload
} from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isPersonalProject } from '../config/firebase';

// Helper para comprimir imágenes
const compressImage = (file, quality = 0.6, maxWidth = 500) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleSize = maxWidth / img.width;
        const finalScale = scaleSize < 1 ? scaleSize : 1;
        canvas.width = img.width * finalScale;
        canvas.height = img.height * finalScale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    };
  });
};

// --- AUTH MODAL (SOLO CORREO) ---
export const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    if (!auth) { setError("Error: Firebase no configurado."); setIsLoading(false); return; }
    if (!formData.email || !formData.password) { setError('Completa los campos.'); setIsLoading(false); return; }
    try {
      let userCredential;
      if (isRegistering) userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      else userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      onLogin(userCredential.user);
    } catch (err) { setError(err.code === 'auth/invalid-credential' ? 'Credenciales incorrectas.' : 'Error de acceso.'); } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full z-10"><X size={20} /></button>
        <div className="p-8 overflow-y-auto">
          <div className="text-center mb-8">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32} className="text-orange-600" /></div>
            <h2 className="text-2xl font-bold text-gray-800">{isRegistering ? 'Nuevo Admin' : 'Acceso Admin'}</h2>
            <p className="text-gray-500 text-sm mt-2">{isPersonalProject ? 'Conectado a tu BD Privada' : 'Modo Demo'}</p>
          </div>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">{String(error)}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>}
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Correo</label><input type="email" className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="admin@zzif.com" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label><div className="relative"><input type={showPassword ? "text" : "password"} className="w-full px-4 py-2 border rounded-lg" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            <button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg mt-4 shadow-lg active:scale-95 transition-transform">{isLoading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Entrar al Sistema')}</button>
          </form>
          
          <div className="mt-6 text-center text-sm"><button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-orange-600 font-bold hover:underline">{isRegistering ? '¿Ya tienes cuenta?' : '¿Crear cuenta?'}</button></div>
        </div>
      </div>
    </div>
  );
};

// --- BRANDING MODAL ---
export const BrandingModal = ({ isOpen, onClose, onSave, currentLogo, currentName }) => {
  const [preview, setPreview] = useState(currentLogo);
  const [nameInput, setNameInput] = useState(currentName || "Delizioso");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { setPreview(currentLogo); setNameInput(currentName || "Delizioso"); }, [currentLogo, currentName, isOpen]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      try { const base64 = await compressImage(file, 0.7, 300); setPreview(base64); } catch { alert("Error imagen"); } finally { setIsProcessing(false); }
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center"><h2 className="text-lg font-bold text-gray-800">Personalizar Marca</h2><button onClick={onClose}><X size={20} className="text-gray-400"/></button></div>
        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col items-center">
            <div onClick={() => fileInputRef.current.click()} className="w-32 h-32 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:border-orange-500 relative overflow-hidden bg-white">
              {isProcessing ? <RefreshCw className="animate-spin text-orange-500" /> : preview ? <img src={preview} className="w-full h-full object-contain p-2" alt="Logo" /> : <div className="text-center text-gray-400"><ImageIcon size={32} className="mx-auto"/><span className="text-xs">Logo</span></div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
          </div>
          <div><label className="block text-sm font-medium mb-1">Nombre Negocio</label><input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>
          <button onClick={() => { onSave(preview, nameInput); onClose(); }} className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700">Guardar</button>
        </div>
      </div>
    </div>
  );
};

// --- GESTORES (Categorias/Roles) ---
export const CategoryManager = ({ isOpen, onClose, categories, onAdd, onRename, onDelete }) => {
  const [newCat, setNewCat] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');
  if (!isOpen) return null;
  const handleAddSubmit = () => { if (newCat.trim() && !categories.includes(newCat.trim())) { onAdd(newCat.trim()); setNewCat(''); } };
  const saveEditing = (index) => { if (editingText.trim()) { onRename(index, editingText.trim()); setEditingIndex(null); } };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Settings size={20} className="text-orange-500" />Categorías</h2><button onClick={onClose}><X size={20} className="text-gray-400"/></button></div>
        <div className="p-4 bg-blue-50 border-b border-blue-100"><div className="flex gap-2 items-start text-xs text-blue-700"><AlertCircle size={16} className="flex-shrink-0 mt-0.5" /><p>Nota: Al renombrar, los productos asociados se actualizarán automáticamente.</p></div></div>
        <div className="p-4 overflow-y-auto">
          <div className="flex gap-2 mb-6"><input type="text" value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Nueva..." className="flex-1 p-2 border rounded-lg outline-none text-sm" onKeyPress={(e) => e.key === 'Enter' && handleAddSubmit()}/><button onClick={handleAddSubmit} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm"><Plus size={18} /></button></div>
          <div className="space-y-2">{categories.map((cat, index) => (<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-transparent hover:border-gray-200">{editingIndex === index ? (<div className="flex items-center gap-2 flex-1"><input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} className="flex-1 p-1 border border-orange-300 rounded text-sm font-bold" autoFocus /><button onClick={() => saveEditing(index)} className="text-green-600"><Check size={18} /></button></div>) : (<><span className="font-medium text-gray-700 text-sm">{cat}</span><div className="flex gap-1"><button onClick={() => { setEditingIndex(index); setEditingText(cat); }} className="p-1.5 text-blue-500"><Edit2 size={16} /></button><button onClick={() => onDelete(index)} className="p-1.5 text-red-500"><Trash2 size={16} /></button></div></>)}</div>))}</div>
        </div>
      </div>
    </div>
  );
};

export const RoleManager = ({ isOpen, onClose, roles, onAdd, onRename, onDelete }) => {
    const [newRole, setNewRole] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingText, setEditingText] = useState('');
    if (!isOpen) return null;
    const handleAddSubmit = () => { if (newRole.trim() && !roles.includes(newRole.trim())) { onAdd(newRole.trim()); setNewRole(''); } };
    const saveEditing = (index) => { if (editingText.trim()) { onRename(index, editingText.trim()); setEditingIndex(null); } };
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm z-[60]">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Briefcase size={20} className="text-blue-600" />Gestionar Cargos</h2><button onClick={onClose}><X size={20} className="text-gray-400"/></button></div>
          <div className="p-4 overflow-y-auto">
            <div className="flex gap-2 mb-6"><input type="text" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Nuevo cargo..." className="flex-1 p-2 border rounded-lg outline-none text-sm" onKeyPress={(e) => e.key === 'Enter' && handleAddSubmit()}/><button onClick={handleAddSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus size={18} /></button></div>
            <div className="space-y-2">{roles.map((role, index) => (<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-transparent hover:border-gray-200">{editingIndex === index ? (<div className="flex items-center gap-2 flex-1"><input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} className="flex-1 p-1 border border-blue-300 rounded text-sm font-bold" autoFocus /><button onClick={() => saveEditing(index)} className="text-green-600"><Check size={18} /></button></div>) : (<><span className="font-medium text-gray-700 text-sm">{role}</span><div className="flex gap-1"><button onClick={() => { setEditingIndex(index); setEditingText(role); }} className="p-1.5 text-blue-500"><Edit2 size={16} /></button><button onClick={() => onDelete(index)} className="p-1.5 text-red-500"><Trash2 size={16} /></button></div></>)}</div>))}</div>
          </div>
        </div>
      </div>
    );
};

// --- PRODUCT FORM MODAL (SIN COMAS Y SIN DOBLE CLICK) ---
export const ProductModal = ({ isOpen, onClose, onSave, item, categories }) => {
  const [formData, setFormData] = useState({ name: '', description: '', price: '', cost: '', stock: '', category: '', image: '' });
  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({ name: '', description: '', price: '', cost: '', stock: '', category: categories[0] || '', image: '' });
    }
    setIsSaving(false);
  }, [item, isOpen, categories]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  // --- NUEVA FUNCIÓN: BLOQUEA LA COMA ---
  const preventComma = (e) => {
    if (e.key === ',') {
      e.preventDefault();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessingImg(true);
      try { 
        const compressedImage = await compressImage(file); 
        setFormData(prev => ({ ...prev, image: compressedImage })); 
      } catch { 
        alert("Error imagen"); 
      } finally { 
        setIsProcessingImg(false); 
      }
    }
  };

  const handleSubmit = async () => { 
    if (isSaving) return;
    setIsSaving(true);

    try {
        await onSave({ 
            ...formData, 
            price: parseFloat(formData.price) || 0, 
            cost: parseFloat(formData.cost) || 0, 
            stock: formData.stock === '' ? '' : parseInt(formData.stock) || 0 
        });
    } catch (error) {
        console.error(error);
        setIsSaving(false);
    }
  };

  // AGREGAR ESTO AL FINAL DE src/components/Modals.jsx

export const ServiceStartModal = ({ isOpen, onClose, services, onStart }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedService) return;
    onStart(selectedService, note);
    setNote('');
    setSelectedService(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
          ⏱️ Iniciar Servicio
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Servicio (Precio por Hora)</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {services.map(srv => (
                <div 
                  key={srv.id} 
                  onClick={() => setSelectedService(srv)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedService?.id === srv.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-300'}`}
                >
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>{srv.name}</span>
                    <span>Bs. {Number(srv.price).toFixed(2)} / hr</span>
                  </div>
                </div>
              ))}
              {services.length === 0 && <p className="text-sm text-gray-400">No hay servicios configurados. Crea productos en la categoría "Servicios".</p>}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Referencia (Ej. Mesa 1)</label>
            <input 
              type="text" 
              required 
              className="w-full p-3 border rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Identificador..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl">Cancelar</button>
            <button type="submit" disabled={!selectedService} className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg ${selectedService ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300'}`}>INICIAR</button>
          </div>
        </form>
      </div>
    </div>
  );
};