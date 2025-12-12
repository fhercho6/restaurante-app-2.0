// src/components/StaffManagerView.jsx - VERSIÓN CORREGIDA (Sin Loader para evitar crash)
import React, { useState } from 'react';
// ELIMINAMOS 'Loader' DE AQUÍ
import { User, Plus, Printer, Edit2, Trash2, Shield } from 'lucide-react';

export default function StaffManagerView({ staff, roles, onAddStaff, onUpdateStaff, onDeleteStaff, onManageRoles, onPrintCredential }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  
  // NUEVOS CAMPOS: contractType y hourlyRate
  const [formData, setFormData] = useState({ 
      name: '', 
      role: 'Garzón', 
      pin: '', 
      contractType: 'Fijo', // 'Fijo' o 'Por Hora'
      hourlyRate: ''        // Solo si es Por Hora
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmitSafe = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.pin || isSaving) return;
    
    setIsSaving(true);
    try {
        // Limpiamos la tarifa si es fijo
        const cleanData = {
            ...formData,
            hourlyRate: formData.contractType === 'Por Hora' ? Number(formData.hourlyRate) : 0
        };

        if (isEditing && currentMember) {
          await onUpdateStaff(currentMember.id, cleanData);
        } else {
          await onAddStaff(cleanData);
        }
        resetForm();
    } finally {
        setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', role: 'Garzón', pin: '', contractType: 'Fijo', hourlyRate: '' });
    setIsEditing(false);
    setCurrentMember(null);
  };

  const handleEditClick = (member) => {
    setFormData({ 
        name: member.name, 
        role: member.role, 
        pin: member.pin,
        contractType: member.contractType || 'Fijo',
        hourlyRate: member.hourlyRate || ''
    });
    setCurrentMember(member);
    setIsEditing(true);
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-6 no-print">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><User /> Gestión de Personal</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 no-print">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">{isEditing ? <Edit2 size={18}/> : <Plus size={18}/>} {isEditing ? 'Editar Personal' : 'Registrar Nuevo Personal'}</h3>
        <form onSubmit={handleSubmitSafe} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          
          <div className="lg:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nombre Completo</label>
            <input type="text" placeholder="Ej. Juan Pérez" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required disabled={isSaving} />
          </div>
          
          <div className="lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex justify-between">Cargo <button type="button" onClick={onManageRoles} className="text-blue-600 hover:underline text-[10px] flex items-center gap-1"><Shield size={10}/> Edit</button></label>
            <select className="w-full p-2 border rounded-lg bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} disabled={isSaving}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* TIPO DE CONTRATO */}
          <div className="lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tipo Pago</label>
            <select className="w-full p-2 border rounded-lg bg-white" value={formData.contractType} onChange={e => setFormData({...formData, contractType: e.target.value})} disabled={isSaving}>
                <option value="Fijo">Sueldo Fijo</option>
                <option value="Por Hora">Por Hora</option>
            </select>
          </div>

          {/* TARIFA */}
          <div className="lg:col-span-1">
             <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tarifa/Hora</label>
             <div className="relative">
                <span className="absolute left-2 top-2 text-gray-400 text-xs">Bs</span>
                <input 
                    type="number" 
                    placeholder="0" 
                    className={`w-full pl-6 p-2 border rounded-lg outline-none ${formData.contractType !== 'Por Hora' ? 'bg-gray-100 text-gray-400' : 'bg-white font-bold'}`}
                    value={formData.hourlyRate} 
                    onChange={e => setFormData({...formData, hourlyRate: e.target.value})} 
                    disabled={isSaving || formData.contractType !== 'Por Hora'} 
                />
             </div>
          </div>

          <div className="lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">PIN</label>
            <input type="text" maxLength="4" placeholder="1234" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-center" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g,'')})} required disabled={isSaving} />
          </div>

          <div className="lg:col-span-6 flex gap-2">
             <button type="submit" disabled={isSaving} className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${isSaving ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isSaving ? "Guardando..." : (isEditing ? 'Actualizar Datos' : 'Registrar Empleado')}
             </button>
             {isEditing && <button type="button" onClick={resetForm} disabled={isSaving} className="px-6 py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Cargo</th>
              <th className="p-4">Contrato</th>
              <th className="p-4">PIN</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map(member => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors group">
                <td className="p-4 font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{member.name.charAt(0)}</div>
                    {member.name}
                </td>
                <td className="p-4 text-sm text-gray-600">{member.role}</td>
                <td className="p-4 text-sm">
                    {member.contractType === 'Por Hora' ? (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">Por Hora (Bs. {member.hourlyRate})</span>
                    ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">Fijo / Mensual</span>
                    )}
                </td>
                <td className="p-4 font-mono text-sm text-gray-400">****</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onPrintCredential(member)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-lg" title="Imprimir Credencial"><Printer size={16} /></button>
                    <button onClick={() => handleEditClick(member)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteStaff(member.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {staff.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400">No hay personal registrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}