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

export default function NFTCard({ id }: NFTCardProps) {
  const metadataURI = `https://gateway.pinata.cloud/ipfs/bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq/${id}.json`;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [name,setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data } = await axios.get<Metadata>(metadataURI);
        setImageUrl(data.image);
        setName(data.name);

      } catch (error) {
        console.error(`Error fetching metadata for token ${id}:`, error);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [metadataURI, id]);

  return (
    <div className="p-3 border rounded-xl text-center cursor-pointer">
      {loading ? (
        <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded">Loading...</div>
      ) : imageUrl ? (
        <img
          src={convertIpfsUri(imageUrl)}
          alt={`NFT ${id}`}
          className="w-full hover:scale-105 transition-all object-cover rounded"
        />
      ) : (
        <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded">No Image</div>
      )}
      <div className="mt-2 font-medium">{name} </div>
    </div>
  );
}
