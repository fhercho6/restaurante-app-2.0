import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function ImageWithLoader({ src, alt, className = "", loading = "lazy" }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* SKELETON LOADER */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
                    <ImageIcon className="text-gray-300 opacity-50" size={24} />
                </div>
            )}

            {/* ERROR FALLBACK */}
            {hasError && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-20">
                    <ImageIcon className="text-gray-300" size={24} />
                </div>
            )}

            {/* ACTUAL IMAGE */}
            <img
                src={src}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading={loading}
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                    setIsLoaded(true);
                    setHasError(true);
                }}
            />
        </div>
    );
}
