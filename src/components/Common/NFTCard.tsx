import React from 'react';

export default function NFTCard({ id, name, image_url }: { id: string, name: string, image_url: string }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {image_url ? (
          <img src={image_url} alt={name} className="object-cover w-full h-full" />
        ) : (
          <span className="text-gray-400">Refresh Metadata</span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium truncate">ClassicBirds</h3>
        <p className="text-sm text-black-500">TOKEN ID: {id}</p>
      </div>
    </div>
  );
}
