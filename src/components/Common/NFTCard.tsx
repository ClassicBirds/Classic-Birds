import React, { useEffect, useState } from 'react';
import Image from 'next/image';

type NFTCardProps = {
  id: string;
  name: string;
  image?: string;
  description?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
};

const BASE_URI = 'https://gateway.pinata.cloud/ipfs/bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq';

export default function NFTCard({ id, name: defaultName, image: propImage, description, attributes }: NFTCardProps) {
  const [imageUrl, setImageUrl] = useState<string>(propImage || '/placeholder-nft.png');
  const [name, setName] = useState<string>(defaultName);
  const [loading, setLoading] = useState(!propImage);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If image is provided via props, use it directly
    if (propImage) {
      setImageUrl(propImage);
      setLoading(false);
      return;
    }

    const loadNFTImage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try the metadata endpoint first
        try {
          const metadataResponse = await fetch(`${BASE_URI}/${id}`);
          if (metadataResponse.ok) {
            const metadata = await metadataResponse.json();
            if (metadata.image) {
              // Handle both absolute and relative image URLs
              let finalImageUrl = metadata.image;
              if (!metadata.image.startsWith('http')) {
                finalImageUrl = `${BASE_URI}/${metadata.image}`;
              }
              setImageUrl(finalImageUrl);
              setName(metadata.name || defaultName);
              return;
            }
          }
        } catch (e) {
          console.warn(`Metadata load failed for ${id}:`, e);
        }

        // Fallback: try direct image path
        const directImageUrl = `${BASE_URI}/${id}.png`;
        
        // Check if image exists
        const imageCheck = await fetch(directImageUrl, { method: 'HEAD' });
        if (imageCheck.ok) {
          setImageUrl(directImageUrl);
        } else {
          throw new Error('Image not found');
        }

      } catch (error) {
        console.error(`Error loading NFT #${id}:`, error);
        setError('Failed to load NFT image');
        setImageUrl('/placeholder-nft.png');
      } finally {
        setLoading(false);
      }
    };

    loadNFTImage();
  }, [id, defaultName, propImage]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse bg-gray-300 h-full w-full"></div>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={`${name} (Token #${id})`}
            fill
            className="object-cover"
            unoptimized
            onError={() => {
              setError('Image failed to load');
              setImageUrl('/placeholder-nft.png');
            }}
          />
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">Token ID: #{id}</p>
        
        {description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{description}</p>
        )}
        
        {attributes && attributes.length > 0 && (
          <div className="mt-2 space-y-1">
            {attributes.slice(0, 2).map((attr, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-500">{attr.trait_type}:</span>
                <span className="text-gray-900 font-medium">{attr.value}</span>
              </div>
            ))}
            {attributes.length > 2 && (
              <p className="text-xs text-gray-400 mt-1">+{attributes.length - 2} more traits</p>
            )}
          </div>
        )}
        
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
