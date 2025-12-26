// src/components/StaffManagerView.jsx - VERSIÓN FINAL SEGURA (Sin Loader)
import React, { useState } from 'react';
// IMPORTANTE: Quitamos 'Loader' de los imports para evitar errores
import { User, Plus, Printer, Edit2, Trash2, Shield, Settings, FolderOpen, Save, X, Banknote, CreditCard, UserCog } from 'lucide-react';
import StaffDocumentsModal from './StaffDocumentsModal';

export default function StaffManagerView({
  staff, roles,
  onAddStaff, onUpdateStaff, onDeleteStaff, onManageRoles, onPrintCredential,
  commissionTiers, onSaveCommissionTiers
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: 'Garzón', pin: '', dailySalary: '', commissionEnabled: false });

  // Commission Modal State
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [editingTiers, setEditingTiers] = useState([]);

  // Documents Modal State
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [selectedMemberForDocs, setSelectedMemberForDocs] = useState(null);

  const openCommissionModal = () => {
    setEditingTiers(JSON.parse(JSON.stringify(commissionTiers || [])));
    setIsCommissionModalOpen(true);
  };

  const saveCommissionTiers = () => {
    onSaveCommissionTiers(editingTiers);
    setIsCommissionModalOpen(false);
  };

  const updateTier = (index, field, value) => {
    const newTiers = [...editingTiers];
    if (field === 'rate') newTiers[index].rate = parseFloat(value) / 100;
    else newTiers[index].max = parseFloat(value);
    setEditingTiers(newTiers);
  };

  // --- ESTADO DE CARGA ---
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmitSafe = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.pin || isSaving) return; // Bloqueo si ya está guardando

    setIsSaving(true);
    try {
      const staffData = {
        ...formData,
        dailySalary: parseFloat(formData.dailySalary) || 0
      };

      if (isEditing && currentMember) {
        await onUpdateStaff(currentMember.id, staffData);
      } else {
        await onAddStaff(staffData);
      }
      resetForm();
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', role: 'Garzón', pin: '', dailySalary: '', commissionEnabled: false });
    setIsEditing(false);
    setCurrentMember(null);
  };

  const handleEditClick = (member) => {
    setFormData({ name: member.name, role: member.role, pin: member.pin, dailySalary: member.dailySalary || '', commissionEnabled: !!member.commissionEnabled });
    setCurrentMember(member);
    setIsEditing(true);
  };

  return (
    <div className="animate-in fade-in space-y-8">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <UserCog size={32} className="text-blue-600" />
            Gestión de Personal
          </h2>
          <p className="text-gray-500 font-medium">Administra tu equipo, roles y esquemas de pago.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onManageRoles} className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Shield size={18} /> Gestionar Cargos
          </button>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-200 overflow-hidden no-print">
        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            {isEditing ? <Edit2 size={18} className="text-orange-500" /> : <Plus size={18} className="text-green-500" />}
            {isEditing ? 'Editar Colaborador' : 'Nuevo Colaborador'}
          </h3>
          {isEditing && <span className="bg-orange-100 text-orange-700 text-xs font-black uppercase px-2 py-1 rounded">Modo Edición</span>}
        </div>

        <form onSubmit={handleSubmitSafe} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* SECTION 1: PERSONAL INFO */}
            <div className="md:col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input type="text" placeholder="Ej. Juan Pérez" className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-gray-800" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required disabled={isSaving} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Cargo</label>
                <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-gray-700" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} disabled={isSaving}>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">PIN de Acceso</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input type="text" maxLength="4" placeholder="1234" className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-mono font-bold text-center tracking-widest text-gray-800" value={formData.pin} onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })} required disabled={isSaving} />
                </div>
              </div>
            </div>

            {/* SECTION 2: PAYROLL & SETTINGS */}
            <div className="md:col-span-12 lg:col-span-4 bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200 flex flex-col justify-center space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Sueldo Diario Fijo</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">Bs.</span>
                  <input type="number" placeholder="0.00" className="w-full pl-10 p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-mono font-bold text-green-700 text-lg" value={formData.dailySalary} onChange={e => setFormData({ ...formData, dailySalary: e.target.value })} disabled={isSaving} />
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="commission" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" checked={formData.commissionEnabled || false} onChange={e => setFormData({ ...formData, commissionEnabled: e.target.checked })} disabled={isSaving} />
                    <label htmlFor="commission" className="text-sm font-bold text-gray-700 select-none cursor-pointer">Habilitar Comisiones</label>
                  </div>
                  <button type="button" onClick={openCommissionModal} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors" title="Configurar Tabla">
                    <Settings size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">
                  El empleado ganará un % extra basado en la utilidad de sus ventas según la tabla configurada.
                </p>
              </div>
            </div>

            <div className="md:col-span-12 flex justify-end gap-3 pt-2 border-t border-gray-100">
              {isEditing && (
                <button type="button" onClick={resetForm} disabled={isSaving} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-2">
                  <X size={18} /> Cancelar
                </button>
              )}
              <button type="submit" disabled={isSaving} className={`px-8 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-blue-200 transition-all flex items-center gap-2 transform hover:scale-[1.02] active:scale-95 ${isSaving ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isSaving ? 'Guardando...' : (isEditing ? <><Save size={18} /> Guardar Cambios</> : <><Plus size={18} /> Registrar Empleado</>)}
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* STAFF LIST TABLE (CARD STYLE FOR MODERN LOOK) */}
      <div className="grid grid-cols-1 gap-4">
        {staff.map(member => (
          <div key={member.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group flex flex-col md:flex-row items-center gap-4">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4 w-full md:w-1/3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner ${member.role === 'Administrador' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                {member.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg leading-tight">{member.name}</h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200 mt-1">
                  {member.role}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 w-full grid grid-cols-2 gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Pago Diario</p>
                <p className="font-mono font-bold text-gray-700">Bs. {parseFloat(member.dailySalary || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Comisiones</p>
                {member.commissionEnabled ? (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded inline-flex items-center gap-1"><Banknote size={12} /> Activo</span>
                ) : (
                  <span className="text-xs font-bold text-gray-400">Inactivo</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
              <button onClick={() => { setSelectedMemberForDocs(member); setIsDocsModalOpen(true); }} className="p-2.5 text-gray-600 bg-gray-50 hover:bg-yellow-50 hover:text-yellow-700 rounded-xl transition-colors border border-gray-200 hover:border-yellow-200" title="Legajo Digital">
                <FolderOpen size={18} />
              </button>
              <button onClick={() => onPrintCredential(member)} className="p-2.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200" title="Credencial">
                <CreditCard size={18} />
              </button>
              <button onClick={() => handleEditClick(member)} className="p-2.5 text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors border border-gray-200 hover:border-blue-200" title="Editar">
                <Edit2 size={18} />
              </button>
              <button onClick={() => onDeleteStaff(member.id)} className="p-2.5 text-gray-600 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-gray-200 hover:border-red-200" title="Eliminar">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {staff.length === 0 && (
          <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <UserCog size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 font-bold">Aún no has registrado colaboradores.</p>
            <p className="text-gray-400 text-sm">Usa el formulario de arriba para empezar.</p>
          </div>
        )}
      </div>

      {/* Commission Configuration Modal */}
      {isCommissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="font-black text-gray-800 flex items-center gap-2 text-lg">
                <Settings size={20} className="text-blue-600" />
                Configurar Comisiones
              </h3>
              <button onClick={() => setIsCommissionModalOpen(false)} className="text-gray-400 hover:text-black bg-gray-100 hover:bg-gray-200 p-1 rounded-full transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 bg-gray-50/50">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                  Configura los tramos de utilidad para el cálculo automático. El sistema usará el porcentaje correspondiente según la utilidad neta que genere el vendedor.
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-3 text-[10px] font-black text-gray-400 uppercase tracking-wider pl-1">
                  <div className="col-span-8">Rango Utilidad (Hasta)</div>
                  <div className="col-span-4 text-center">Comisión</div>
                </div>
                {editingTiers.map((tier, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center group">
                    <div className="col-span-8 relative">
                      <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-bold group-focus-within:text-blue-500 transition-colors">Bs.</span>
                      <input
                        type="number"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                        value={tier.max}
                        onChange={(e) => updateTier(index, 'max', e.target.value)}
                        step="100"
                      />
                    </div>
                    <div className="col-span-4 relative">
                      <input
                        type="number"
                        className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-center transition-all shadow-sm"
                        value={(tier.rate * 100).toFixed(0)}
                        onChange={(e) => updateTier(index, 'rate', e.target.value)}
                        min="0" max="100"
                      />
                      <span className="absolute right-3 top-2.5 text-gray-400 text-xs font-bold">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button onClick={() => setIsCommissionModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors">Cancelar</button>
              <button onClick={saveCommissionTiers} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-95">Guardar Configuración</button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      <StaffDocumentsModal
        isOpen={isDocsModalOpen}
        onClose={() => { setIsDocsModalOpen(false); setSelectedMemberForDocs(null); }}
        staffMember={selectedMemberForDocs}
      />
    </div>
  );
}
