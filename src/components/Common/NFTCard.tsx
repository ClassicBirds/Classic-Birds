import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

type NFTCardProps = {
  id: string;
  name: string;
};

type Metadata = {
  image: string;
  name: string;
  description?: string;
};

const IPFS_GATEWAYS = [
  'https://dweb.link/ipfs/',
  'https://nftstorage.link/ipfs/',
  'https://cf-ipfs.com/ipfs/'
];

export default function NFTCard({ id, name: defaultName }: NFTCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [name, setName] = useState<string>(defaultName);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRandomGateway = () => {
    return IPFS_GATEWAYS[Math.floor(Math.random() * IPFS_GATEWAYS.length)];
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try fetching metadata first
        const metadataUrl = `${getRandomGateway()}bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq/${id}.json`;
        const { data: metadata } = await axios.get<Metadata>(metadataUrl);
        
        if (metadata?.image) {
          // Process the image URL
          let imagePath = metadata.image;
          if (imagePath.startsWith('ipfs://')) {
            imagePath = imagePath.replace('ipfs://', '');
          }
          setImageUrl(`${getRandomGateway()}${imagePath}`);
          setName(metadata.name || defaultName);
          return;
        }

        // Fallback to direct image path if metadata fails
        const fallbackImageUrl = `${getRandomGateway()}bafybeialwj6r65npk2olvpftxuodjrmq4watedlvbqere4ytsuwmkzfjbi/${id}.png`;
        setImageUrl(fallbackImageUrl);

      } catch (error) {
        console.error(`Error loading NFT #${id}:`, error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [id, defaultName]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-300 h-12 w-12"></div>
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <span className="text-red-500 mb-2">⚠️ Error</span>
            <span className="text-xs text-gray-600">{error}</span>
          </div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${name} (Token #${id})`}
            fill
            className="object-cover"
            unoptimized={true} // Temporary fix for IPFS images
            onError={() => {
              setError('Image failed to load');
              setImageUrl(null);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image available
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
