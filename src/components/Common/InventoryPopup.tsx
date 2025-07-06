import React from 'react';
import Image from 'next/image';

export default function NFTCard({ id, name, image_url }: { id: string, name: string, image_url: string }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
        <Image
          src={image_url}
          alt={name}
          fill
          className="object-cover"
          unoptimized
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            (e.target as HTMLImageElement).src = '/placeholder-nft.png';
            (e.target as HTMLImageElement).className = 'object-contain p-4';
          }}
        />
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-medium text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">Token ID: #{id}</p>
      </div>
    </div>
  );
}
