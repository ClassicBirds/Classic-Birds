import React, { useState, useEffect } from 'react';

export default function NFTCard({ id, name, image_url }: { id: string, name: string, image_url: string }) {
  const [imgSrc, setImgSrc] = useState(image_url);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Array of fallback options (add your preferred IPFS gateways)
  const fallbackGateways = [
    'https://gateway.pinata.cloud',
    'https://ipfs.io',
    'https://cloudflare-ipfs.com',
    'https://dweb.link'
  ];

  // Current IPFS CID (replace with your actual CID)
  const ipfsCid = 'bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq';

  const handleError = () => {
    if (retryCount < fallbackGateways.length - 1) {
      // Try next fallback gateway
      const nextGateway = fallbackGateways[retryCount + 1];
      setImgSrc(`${nextGateway}/ipfs/${ipfsCid}/${id}.png`);
      setRetryCount(retryCount + 1);
    } else {
      // All fallbacks exhausted
      setError(true);
      setLoading(false);
    }
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  // Reset state when image_url prop changes
  useEffect(() => {
    setImgSrc(image_url);
    setLoading(true);
    setError(false);
    setRetryCount(0);
  }, [image_url]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
        {/* Loading state */}
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <span className="text-gray-400 mb-2">Image not available</span>
            <button 
              onClick={() => {
                setImgSrc(image_url);
                setLoading(true);
                setError(false);
                setRetryCount(0);
              }}
              className="text-sm text-blue-500 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Image - always rendered but hidden when loading/error */}
        <img 
          src={imgSrc}
          alt={`${name} #${id}`}
          className={`object-cover w-full h-full ${
            (loading || error) ? 'opacity-0 absolute' : 'opacity-100'
          }`}
          onError={handleError}
          onLoad={handleLoad}
          loading="lazy"
        />
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-medium text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">Token ID: #{id}</p>
      </div>
    </div>
  );
}
