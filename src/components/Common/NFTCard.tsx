// NFTCard.tsx
import React from 'react';
import LazyloadImage from '../Lazyload/LazyloadImage';

export default function NFTCard({ id, name, image_url }: { id: string, name: string, image_url: string }) {
  // Clean up the image URL
  const cleanImageUrl = image_url?.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/')
    .replace(/\0+$/, '') // Remove null characters
    .trim();

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
        {cleanImageUrl ? (
          <LazyloadImage 
            src={cleanImageUrl}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-nft.png';
              target.className = 'object-contain p-4';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
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
