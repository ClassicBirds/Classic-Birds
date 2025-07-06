// NFTCard.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { convertIpfsUri } from '@/utils/ipfsConverter';

type NFTCardProps = {
  id: string;
  name: string;
};

type Metadata = {
  image: string;
  name: string;
  description?: string;
};

export default function NFTCard({ id, name: defaultName }: NFTCardProps) {
  const metadataURI = `https://dweb.link/ipfs/bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq/${id}.json`;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [name, setName] = useState<string>(defaultName);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data } = await axios.get<Metadata>(metadataURI);
        setImageUrl(data.image);
        setName(data.name || defaultName);
      } catch (error) {
        console.error(`Error fetching metadata for token ${id}:`, error);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [metadataURI, id, defaultName]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">Loading...</div>
        ) : imageUrl ? (
          <img 
            src={convertIpfsUri(imageUrl)} 
            alt={name} 
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-medium text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">Token ID: #{id}</p>
      </div>
    </div>
  );
}
