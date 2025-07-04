import React from 'react';

export default function NFTCard({ id, name, image_url }: { id: string, name: string, image_url: string }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {image_url ? (
          <img 
            src={image_url} 
            alt={name} 
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-nft.png';
              (e.target as HTMLImageElement).className = 'object-contain w-full h-full p-4';
            }}
          />
        ) : (
          <span className="text-gray-400">No image</span>
        )}
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-medium text-gray-900 truncate">ClassicBirds</h3>
        <p className="text-sm text-gray-600 mt-1">Token ID: #{id}</p>
      </div>
    </div>
  );
}
