// src/components/ClientQRModal.jsx
import React from 'react';
import QRCode from 'qrcode.react';
import { X, Printer, Download, UtensilsCrossed, Scan } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientQRModal({ isOpen, onClose, appName }) {
    if (!isOpen) return null;

    // The public URL with the query param
    const publicUrl = `${window.location.protocol}//${window.location.host}/?mode=public`;

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const canvas = document.getElementById('client-qr');
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `menu_qr_${appName.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            toast.success("QR Descargado");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative print:shadow-none print:w-full print:max-w-none print:fixed print:inset-0 print:h-screen print:flex print:items-center print:justify-center">

                {/* Close Button (Hidden on Print) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100 print:hidden"
                >
                    <X size={24} />
                </button>

                <div className="p-8 flex flex-col items-center text-center">

                    {/* Header */}
                    <div className="mb-6 space-y-2">
                        <div className="mx-auto w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                            <UtensilsCrossed size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Código de Menú Digital</h2>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto">
                            Escanea este código para ver nuestro menú y realizar pedidos desde tu mesa.
                        </p>
                    </div>

                    {/* QR Code Container */}
                    <div className="bg-white p-4 border-2 border-gray-900 rounded-xl shadow-sm mb-6">
                        <QRCode
                            id="client-qr"
                            value={publicUrl}
                            size={250}
                            level={'H'} // High error correction
                            includeMargin={true}
                        />
                        <div className="mt-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-widest">
                            <Scan size={14} /> Escanéame
                        </div>
                    </div>

                    {/* URL Display */}
                    <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 break-all mb-8 max-w-full font-mono print:hidden">
                        {publicUrl}
                    </div>

                    {/* Actions (Hidden on Print) */}
                    <div className="flex gap-3 w-full print:hidden">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(publicUrl);
                                toast.success("Enlace copiado al portapapeles");
                            }}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        >
                            <span className="flex items-center gap-2 uppercase text-xs"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg> Copiar Link</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                        >
                            <Printer size={18} /> IMPRIMIR
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex-1 bg-white text-gray-700 border border-gray-200 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                            <Download size={18} /> GUARDAR
                        </button>
                    </div>

                    {/* Print Only Footer */}
                    <div className="hidden print:block mt-8 text-center">
                        <p className="text-xl font-bold uppercase tracking-widest">{appName}</p>
                        <p className="text-sm text-gray-500 mt-2">¡Gracias por tu visita!</p>
                    </div>
                </div>

                {/* Decorative Bottom Pattern */}
                <div className="h-2 bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 w-full"></div>
            </div>

            {/* Global Print Styles to Hide Background */}
            <style jsx global>{`
                @media print {
                    @page { margin: 0; }
                    body { visibility: hidden; }
                    .print\\:fixed { visibility: visible; position: fixed; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 0; background: white; z-index: 9999; }
                    .print\\:block { display: block !important; }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
}
