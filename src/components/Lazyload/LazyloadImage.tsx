import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface NFTCardProps {
  id: string;
  name: string;
  image_url: string;
}

export default function NFTCard({ id, name, image_url }: NFTCardProps) {
  const cleanImageUrl = image_url?.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/')
    .replace(/\0+$/, '')
    .trim();

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
        {cleanImageUrl ? (
          <LazyLoadImage
            src={cleanImageUrl}
            alt={name}
            effect="blur" // Optional blur-up effect
            width="100%"
            height="100%"
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
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
