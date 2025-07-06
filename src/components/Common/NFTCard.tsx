import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function NFTCard({ id, name, image_url }: { id: string, name: string, image_url: string }) {
  const [imgSrc, setImgSrc] = useState(image_url);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!image_url) {
      setError(true);
      setLoading(false);
      return;
    }

    setImgSrc(image_url);
    setLoading(true);
    setError(false);
    
    // Preload the image to check if it's valid
    const img = new window.Image();
    img.src = image_url;
    img.onload = () => {
      setLoading(false);
      setError(false);
    };
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
  }, [image_url]);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center p-4 text-center h-full">
            <span className="text-gray-400 mb-2">Image not available</span>
            <button 
              onClick={() => {
                setImgSrc(image_url);
                setLoading(true);
                setError(false);
              }}
              className="text-sm text-blue-500 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {!error && (
          <Image 
            src={imgSrc}
            alt={`${name} #${id}`}
            fill
            className={`object-cover ${loading ? 'opacity-0' : 'opacity-100'}`}
            onError={handleError}
            onLoad={handleLoad}
            unoptimized
            priority={false}
          />
        )}
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-medium text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">Token ID: #{id}</p>
      </div>
    </div>
  );
}
