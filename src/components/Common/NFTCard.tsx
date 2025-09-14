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

const WORKING_GATEWAYS = [
  'https://nftstorage.link/ipfs/',
  'https://dweb.link/ipfs/',
  'https://gateway.pinata.cloud/ipfs/'
];

const METADATA_CID = 'bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq';
const IMAGE_CID = 'bafybeialwj6r65npk2olvpftxuodjrmq4watedlvbqere4ytsuwmkzfjbi';

const cleanIpfsUrl = (url: string): string => {
  // Remove any nested gateway URLs
  if (url.includes('gateway.pinata.cloud/ipfs/')) {
    return url.split('ipfs/')[1];
  }
  // Handle ipfs:// format
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', '');
  }
  // Return as-is if already clean
  return url;
};

export default function NFTCard({ id, name: defaultName }: NFTCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('/placeholder-nft.png');
  const [name, setName] = useState<string>(defaultName);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getWorkingUrl = async (cidPath: string, isImage = false) => {
    for (const gateway of WORKING_GATEWAYS) {
      try {
        const cleanPath = cleanIpfsUrl(cidPath);
        const url = `${gateway}${cleanPath}`;
        
        if (isImage) {
          await axios.head(url, { timeout: 3000 });
          return url;
        } else {
          const response = await axios.get(url, { timeout: 3000 });
          return response.data;
        }
      } catch (err) {
        continue;
      }
    }
    throw new Error('All gateways failed');
  };

  useEffect(() => {
    const loadNFT = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try metadata first
        try {
          const metadata = await getWorkingUrl(`${METADATA_CID}/${id}.json`);
          if (metadata?.image) {
            const imagePath = cleanIpfsUrl(metadata.image);
            const imageUrl = await getWorkingUrl(imagePath, true);
            setImageUrl(imageUrl);
            setName(metadata.name || defaultName);
            return;
          }
        } catch (e) {
          console.warn(`Metadata load failed for ${id}`);
        }

        // Fallback to direct image path
        const directImageUrl = await getWorkingUrl(`${IMAGE_CID}/${id}.png`, true);
        setImageUrl(directImageUrl);

      } catch (error) {
        console.error(`Error loading NFT #${id}:`, error);
        setError('Failed to load NFT data');
        setImageUrl('/placeholder-nft.png');
      } finally {
        setLoading(false);
      }
    };

    loadNFT();
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
      <div className="p-3 bg-white">
        <h3 className="font-medium text-gray-900 ">Classic Birds</h3>
        <p className="text-sm text-gray-600 mt-1">Token ID: #{id}</p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  );
}
