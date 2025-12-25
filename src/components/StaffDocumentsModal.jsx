import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ExternalLink, FileText, Image, Paperclip, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db, ROOT_COLLECTION, isPersonalProject } from '../config/firebase';
import toast from 'react-hot-toast';

export default function StaffDocumentsModal({ isOpen, onClose, staffMember }) {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // New Document Form
    const [newDocTitle, setNewDocTitle] = useState('');
    const [newDocType, setNewDocType] = useState('contract'); // contract, id, receipt, other
    const [newDocUrl, setNewDocUrl] = useState('');
    const [newDocNote, setNewDocNote] = useState('');

    useEffect(() => {
        if (isOpen && staffMember) {
            loadDocuments();
        }
    }, [isOpen, staffMember]);

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const collName = isPersonalProject ? 'staff_documents' : `${ROOT_COLLECTION}staff_documents`;
            const q = query(
                collection(db, collName),
                where('staffId', '==', staffMember.id),
                orderBy('timestamp', 'desc') // Requires index potentially, checking without first or handling client side sort if fails
            );

            // Fallback for missing index: just filter by staffId and sort in memory if needed
            // Actually, simple queries usually work. Let's try simple first or just sort client side.
            // Safe bet: Query by staffId, sort in JS to avoid index blockers during demo
            const simpleQ = query(collection(db, collName), where('staffId', '==', staffMember.id));
            const snapshot = await getDocs(simpleQ);

            const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            docs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            setDocuments(docs);
        } catch (error) {
            console.error("Error loading docs:", error);
            toast.error("Error al cargar documentos");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddDocument = async (e) => {
        e.preventDefault();
        if (!newDocTitle) return;

        setIsAdding(true);
        try {
            const collName = isPersonalProject ? 'staff_documents' : `${ROOT_COLLECTION}staff_documents`;
            await addDoc(collection(db, collName), {
                staffId: staffMember.id,
                title: newDocTitle,
                type: newDocType,
                url: newDocUrl || '',
                note: newDocNote || '',
                timestamp: new Date().toISOString()
            });

            toast.success("Documento agregado");
            setNewDocTitle('');
            setNewDocUrl('');
            setNewDocNote('');
            setNewDocType('contract');
            loadDocuments();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
        try {
            const collName = isPersonalProject ? 'staff_documents' : `${ROOT_COLLECTION}staff_documents`;
            await deleteDoc(doc(db, collName, id));
            toast.success("Eliminado");
            loadDocuments(); // Refresh
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    if (!isOpen || !staffMember) return null;

    const getTypeIcon = (type) => {
        switch (type) {
            case 'contract': return <FileText size={16} className="text-blue-500" />;
            case 'id': return <Image size={16} className="text-purple-500" />;
            case 'receipt': return <Paperclip size={16} className="text-green-500" />;
            default: return <FileText size={16} className="text-gray-500" />;
        }
    };

    const getTypeName = (type) => {
        const types = { contract: 'Contrato', id: 'Identificación', receipt: 'Recibo / Memo', other: 'Otro' };
        return types[type] || 'Documento';
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                            📂 Legajo Digital: {staffMember.name}
                        </h3>
                        <p className="text-xs text-gray-500">Gestión de documentos y referencias</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Add Form */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
                        <h4 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2"><Plus size={16} /> Agregar Nuevo Documento</h4>
                        <form onSubmit={handleAddDocument} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Título</label>
                                    <input required type="text" placeholder="Ej. Contrato 2024" className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tipo</label>
                                    <select className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={newDocType} onChange={e => setNewDocType(e.target.value)}>
                                        <option value="contract">Contrato</option>
                                        <option value="id">Identificación (CI)</option>
                                        <option value="receipt">Recibo / Memo</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Enlace (URL) <span className="text-gray-400 font-normal lowercase">(Google Drive, Dropbox, etc.)</span></label>
                                <input type="url" placeholder="https://..." className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-mono" value={newDocUrl} onChange={e => setNewDocUrl(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nota / Descripción <span className="text-gray-400 font-normal lowercase">(Opcional)</span></label>
                                <textarea rows="2" placeholder="Detalles adicionales..." className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white resize-none" value={newDocNote} onChange={e => setNewDocNote(e.target.value)}></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={isAdding} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait">
                                    {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    Guardar Registro
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* List */}
                    <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Documentos Registrados</h4>

                    {isLoading ? (
                        <div className="flex justify-center py-8 text-gray-400"><Loader2 className="animate-spin" /></div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <Paperclip size={32} className="mx-auto mb-2 opacity-20" />
                            <p>No hay documentos registrados para este empleado.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {documents.map(doc => (
                                <div key={doc.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3 group">
                                    <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                                        {getTypeIcon(doc.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h5 className="font-bold text-gray-800 text-sm truncate pr-2">{doc.title}</h5>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(doc.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">{getTypeName(doc.type)}</p>
                                        {doc.note && <p className="text-xs text-gray-600 bg-gray-50 p-1.5 rounded mb-2 italic">"{doc.note}"</p>}

                                        {doc.url && (
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline bg-blue-50 px-2 py-1 rounded border border-blue-100 transition-colors">
                                                <ExternalLink size={12} /> Abrir Enlace
                                            </a>
                                        )}
                                    </div>
                                    <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">Cerrar</button>
                </div>
            </div>
        </div>
    );
}
