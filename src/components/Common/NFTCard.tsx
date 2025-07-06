import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Image from 'next/image';

type Metadata = {
  image: string;
  name: string;
  description?: string;
};

type NFTCardProps = {
  id: string;
  name: string;
};

const IPFS_GATEWAYS = [
  'https://nftstorage.link/ipfs/',
  'https://dweb.link/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/'
];

const METADATA_CID = 'bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq';
const IMAGE_CID = 'bafybeialwj6r65npk2olvpftxuodjrmq4watedlvbqere4ytsuwmkzfjbi';

const normalizeIpfsUrl = (url: string): string => {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', '');
  }
  if (url.includes('ipfs/ipfs/')) {
    return url.split('ipfs/')[1];
  }
  return url;
};

export default function NFTCard({ id, name: defaultName }: NFTCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('/placeholder-nft.png');
  const [name, setName] = useState<string>(defaultName);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const testGateway = async (gateway: string, cidPath: string): Promise<string | null> => {
    try {
      const url = `${gateway}${cidPath}`;
      await axios.head(url, { timeout: 2000 });
      return url;
    } catch {
      return null;
    }
  };

  const fetchWithFallback = useCallback(async (cidPath: string, isImage = false): Promise<string> => {
    // Try all gateways in parallel
    const requests = IPFS_GATEWAYS.map(gateway => 
      testGateway(gateway, cidPath)
    );
    
    const results = await Promise.all(requests);
    const workingUrl = results.find(url => url !== null);
    
    if (!workingUrl) {
      throw new Error('All IPFS gateways failed');
    }
    
    return workingUrl;
  }, []);

  const loadNFTData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch metadata first
      try {
        const metadataUrl = await fetchWithFallback(`${METADATA_CID}/${id}.json`);
        const { data: metadata } = await axios.get<Metadata>(metadataUrl);
        
        if (metadata?.image) {
          const imagePath = normalizeIpfsUrl(metadata.image);
          const imageUrl = await fetchWithFallback(imagePath, true);
          setImageUrl(imageUrl);
          setName(metadata.name || defaultName);
          return;
        }
      } catch (e) {
        console.warn(`Metadata load failed for ${id}`, e);
      }

      // Fallback to direct image path
      const directImageUrl = await fetchWithFallback(`${IMAGE_CID}/${id}.png`, true);
      setImageUrl(directImageUrl);
    } catch (error) {
      console.error(`Error loading NFT #${id}:`, error);
      setError('Failed to load NFT data');
      setImageUrl('/placeholder-nft.png');
    } finally {
      setLoading(false);
    }
  }, [id, defaultName, fetchWithFallback]);

  useEffect(() => {
    loadNFTData();
  }, [loadNFTData]);

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
        <h3 className="font-medium text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">Token ID: #{id}</p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  );
}
