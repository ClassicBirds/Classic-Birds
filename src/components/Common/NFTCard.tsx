import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

type NFTCardProps = {
  id: string;
  name: string;
  image?: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  burnReward?: number;
};

type Metadata = {
  image: string;
  name: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
};

const WORKING_GATEWAYS = [
  'https://nftstorage.link/ipfs/',
  'https://dweb.link/ipfs/',
  'https://gateway.pinata.cloud/ipfs/'
];

const METADATA_CID = 'bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq';
const IMAGE_CID = 'bafybeialwj6r65npk2olvpftxuodjrmq4watedlvbqere4ytsuwmkzfjbi';

const formatExactDecimals = (value: number, decimals: number): string => {
  if (value === 0) return `0.${'0'.repeat(decimals)}`;
  
  const [integer, fraction = '0'] = value.toString().split('.');
  const formattedInteger = new Intl.NumberFormat('en-US').format(parseInt(integer));
  const formattedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return `${formattedInteger}.${formattedFraction}`;
};

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

export default function NFTCard({ 
  id, 
  name: defaultName, 
  image: propImage, 
  description: propDescription, 
  attributes: propAttributes, 
  burnReward 
}: NFTCardProps) {
  const [imageUrl, setImageUrl] = useState<string>(propImage || '/placeholder-nft.png');
  const [name, setName] = useState<string>(defaultName);
  const [description, setDescription] = useState<string>(propDescription || '');
  const [attributes, setAttributes] = useState<Array<{ trait_type: string; value: string }>>(propAttributes || []);
  const [loading, setLoading] = useState(!propImage);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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
    // If props already provide data, don't fetch metadata
    if (propImage && propDescription !== undefined) {
      setLoading(false);
      return;
    }

    const loadNFT = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try metadata first
        try {
          const metadata = await getWorkingUrl(`${METADATA_CID}/${id}.json`) as Metadata;
          if (metadata?.image) {
            const imagePath = cleanIpfsUrl(metadata.image);
            const imageUrl = await getWorkingUrl(imagePath, true);
            setImageUrl(imageUrl);
            setName(metadata.name || defaultName);
            setDescription(metadata.description || '');
            setAttributes(metadata.attributes || []);
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
  }, [id, defaultName, propImage, propDescription]);

  const getRarityColor = (value: string) => {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('legendary') || lowerValue.includes('mythic')) return 'text-purple-600';
    if (lowerValue.includes('epic') || lowerValue.includes('rare')) return 'text-blue-600';
    if (lowerValue.includes('uncommon')) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative cursor-pointer"
           onClick={() => setShowDetails(!showDetails)}>
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
        
        {/* Burn Reward Badge */}
        {burnReward !== undefined && burnReward > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            {formatExactDecimals(burnReward, 3)} ETC
          </div>
        )}
      </div>
      
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 text-sm">Classic Birds #{id}</h3>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showDetails ? 'Hide' : 'Details'}
          </button>
        </div>

        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

        {/* Burn Reward Section */}
        {burnReward !== undefined && (
          <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-green-800">Burn Reward:</span>
              <span className="text-sm font-bold text-green-600">
                {formatExactDecimals(burnReward, 6)} ETC
              </span>
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-2 space-y-2 border-t pt-2">
            {description && (
              <p className="text-xs text-gray-600">{description}</p>
            )}
            
            {attributes && attributes.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-gray-700">Attributes:</h4>
                <div className="grid grid-cols-2 gap-1">
                  {attributes.slice(0, 4).map((attr, index) => (
                    <div key={index} className="text-xs">
                      <span className="text-gray-500">{attr.trait_type}: </span>
                      <span className={`font-medium ${getRarityColor(attr.value)}`}>
                        {attr.value}
                      </span>
                    </div>
                  ))}
                </div>
                {attributes.length > 4 && (
                  <p className="text-xs text-gray-500">+{attributes.length - 4} more...</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Info Footer */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">ID: #{id}</span>
          {burnReward !== undefined && (
            <span className="text-xs font-medium text-green-600">
              Burn: {formatExactDecimals(burnReward, 2)} ETC
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
