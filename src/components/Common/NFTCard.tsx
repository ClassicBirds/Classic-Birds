// src/components/Common/NFTCard.tsx
import React, { useState } from 'react';
import Image from 'next/image';

interface NFTCardProps {
  id: string;
  name: string;
  image_url: string;
}

export default function NFTCard({ id, name, image_url }: NFTCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const cleanImageUrl = image_url?.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/')
    .replace(/\0+$/, '')
    .trim();

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
        {cleanImageUrl && !imageError ? (
          <>
            <Image
              src={cleanImageUrl}
              alt={name}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoadingComplete={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              unoptimized // Remove this if using Vercel image optimization
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse bg-gray-200 w-full h-full" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center w-full h-full">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-medium text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">Token ID: #{id}</p>
      </div>
    </div>
  );
}
