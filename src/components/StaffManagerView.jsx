// src/components/StaffManagerView.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Settings, AlertTriangle, Check, X, Edit2, Trash2, QrCode } from 'lucide-react';

const StaffManagerView = ({ staff, roles, onAddStaff, onUpdateStaff, onDeleteStaff, onManageRoles, onPrintCredential }) => {
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState(roles.length > 0 ? roles[0] : 'Garzón');
  const [newStaffPin, setNewStaffPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPin, setEditPin] = useState('');

  useEffect(() => {
    if (roles.length > 0 && !roles.includes(newStaffRole)) {
       setNewStaffRole(roles[0]);
    }
  }, [roles, newStaffRole]);

  const handlePinChange = (e) => {
    const val = e.target.value;
    setNewStaffPin(val);
    const pinToCheck = String(val).trim();
    if (pinToCheck && staff.some(m => String(m.pin).trim() === pinToCheck)) {
      setPinError(`⛔ Este PIN ya está en uso.`);
    } else {
      setPinError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newStaffName.trim()) { alert("Falta nombre"); return; }
    if (!newStaffPin.trim()) { alert("Falta PIN"); return; }

    const pinToCheck = String(newStaffPin).trim();
    if (staff.some(m => String(m.pin).trim() === pinToCheck)) {
        alert(`⛔ Error: El PIN "${pinToCheck}" ya existe.`);
        return;
    }

    setIsSubmitting(true);
    try {
      await onAddStaff({ name: newStaffName.trim(), role: newStaffRole, pin: pinToCheck, createdAt: new Date().toISOString() });
      setNewStaffName('');
      setNewStaffPin('');
      setPinError('');
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  const startEditing = (member) => {
    setEditingId(member.id);
    setEditName(member.name);
    setEditRole(member.role);
    setEditPin(member.pin || '');
  };

  const saveEdit = () => {
    const pinToCheck = String(editPin).trim();
    if (!pinToCheck) {
      alert("El PIN no puede estar vacío");
      return;
    }
    const duplicateMember = staff.find(m => String(m.pin).trim() === pinToCheck && m.id !== editingId);
    if (duplicateMember) {
        alert(`⚠️ Error: El PIN "${pinToCheck}" ya está asignado a ${duplicateMember.name}. Elige otro.`);
        return;
    }
    onUpdateStaff(editingId, { name: editName, role: editRole, pin: pinToCheck });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-blue-600"/> Registrar Nuevo Personal
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-gray-500 mb-1">Nombre Completo</label>
            <input type="text" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:border-blue-500" placeholder="Ej. Juan Pérez" required />
          </div>
          <div className="w-full md:w-48 relative">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-gray-500">Cargo</label>
              <button type="button" onClick={onManageRoles} className="text-[10px] text-blue-600 hover:underline flex items-center gap-1">
                <Settings size={10} /> Gestionar
              </button>
            </div>
            <select value={newStaffRole} onChange={(e) => setNewStaffRole(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:border-blue-500">
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-32">
             <label className="block text-xs font-medium text-gray-500 mb-1">PIN (Obligatorio)</label>
             <input type="text" value={newStaffPin} onChange={handlePinChange} className={`w-full p-2 border rounded-lg outline-none ${pinError ? 'border-red-500 bg-red-50' : 'focus:border-blue-500'}`} placeholder="1234" required />
          </div>
          <button type="submit" disabled={isSubmitting || !!pinError} className={`px-6 py-2 rounded-lg font-medium text-white w-full md:w-auto transition-colors ${isSubmitting || pinError ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isSubmitting ? 'Guardando...' : 'Registrar'}
          </button>
        </form>
        {pinError && (
          <div className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1 animate-pulse">
             <AlertTriangle size={12} /> {pinError}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
              <th className="p-4 font-semibold">Nombre</th>
              <th className="p-4 font-semibold">Cargo</th>
              <th className="p-4 font-semibold">PIN</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.length > 0 ? (
              staff.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  {editingId === member.id ? (
                    <>
                      <td className="p-4"><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-1 border border-blue-400 rounded bg-white" autoFocus /></td>
                      <td className="p-4"><select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full p-1 border border-blue-400 rounded bg-white">{roles.map(role => (<option key={role} value={role}>{role}</option>))}</select></td>
                      <td className="p-4"><input type="text" value={editPin} onChange={(e) => setEditPin(e.target.value)} className="w-full p-1 border border-blue-400 rounded bg-white font-mono" /></td>
                      <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={saveEdit} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><Check size={16}/></button>
                          <button onClick={() => setEditingId(null)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><X size={16}/></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{member.name.charAt(0).toUpperCase()}</div>
                        {member.name}
                      </td>
                      <td className="p-4 text-gray-600"><span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{member.role}</span></td>
                      <td className="p-4 text-gray-400 font-mono text-sm">{member.pin || '----'}</td>
                      <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                             <button onClick={() => onPrintCredential(member)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Imprimir Credencial QR"><QrCode size={16} /></button>
                             <button onClick={() => startEditing(member)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Edit2 size={16} /></button>
                             <button onClick={() => onDeleteStaff(member.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar"><Trash2 size={16} /></button>
                          </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="p-8 text-center text-gray-400 italic">No hay personal registrado aún.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManagerView;