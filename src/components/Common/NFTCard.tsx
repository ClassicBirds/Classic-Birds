import React, { useEffect, useState } from 'react';
import axios from 'axios';

type NFTCardProps = {
  id: string;
  name: string;
};

type Metadata = {
  image?: string;
  name?: string;
  description?: string;
};

// Primary gateways with fallbacks
const IPFS_GATEWAYS = [
  'https://nftstorage.link/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
  'https://ipfs.io/ipfs/',
];

// Your specific CIDs
const METADATA_CID = 'bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq';
const IMAGE_CID = 'bafybeialwj6r65npk2olvpftxuodjrmq4watedlvbqere4ytsuwmkzfjbi';

export default function NFTCard({ id, name: defaultName }: NFTCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [name, setName] = useState<string>(defaultName);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWithRetry = async (url: string, isImage = false) => {
    let lastError = null;
    
    // Try each gateway
    for (const gateway of IPFS_GATEWAYS) {
      try {
        const fullUrl = url.startsWith('http') ? url : `${gateway}${url}`;
        
        if (isImage) {
          // For images, just verify the URL works
          await axios.head(fullUrl, { timeout: 3000 });
          return fullUrl;
        } else {
          // For metadata, fetch the content
          const response = await axios.get(fullUrl, { timeout: 3000 });
          return response.data;
        }
      } catch (err) {
        lastError = err;
        continue;
      }
    }
    throw lastError || new Error('All gateways failed');
  };

  useEffect(() => {
    const loadNFT = async () => {
      try {
        setLoading(true);
        setError(null);

        // Option 1: Try fetching metadata first
        try {
          const metadata = await fetchWithRetry(`${METADATA_CID}/${id}.json`);
          if (metadata?.image) {
            // Use image from metadata if available
            const imageUrl = await fetchWithRetry(metadata.image, true);
            setImageUrl(imageUrl);
            setName(metadata.name || defaultName);
            return;
          }
        } catch (metadataError) {
          console.warn(`Metadata fetch failed for ${id}:`, metadataError);
        }

        // Option 2: Fallback to direct image CID pattern
        try {
          // Assuming standard naming convention: image_{id}.png
          const directImageUrl = await fetchWithRetry(`${IMAGE_CID}/image_${id}.png`, true);
          setImageUrl(directImageUrl);
        } catch (imageError) {
          console.warn(`Direct image fetch failed for ${id}:`, imageError);
          throw new Error('Could not load NFT image');
        }

      } catch (error) {
        setError(error.message);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    loadNFT();
  }, [id, defaultName]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
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
          <img 
            src={imageUrl}
            alt={`${name} (Token #${id})`}
            className="object-cover w-full h-full"
            onError={() => setError('Image failed to load')}
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
