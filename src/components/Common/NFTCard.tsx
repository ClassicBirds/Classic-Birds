import React, { useState, useEffect } from 'react';

export default function NFTCard({ id, name, image_url }: { id: string, name: string, image_url: string }) {
  const [imgSrc, setImgSrc] = useState(image_url);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // IPFS gateways to try as fallbacks
  const ipfsGateways = [
    'https://ipfs.io',
    'https://gateway.pinata.cloud',
    'https://cloudflare-ipfs.com',
    'https://dweb.link'
  ];

  useEffect(() => {
    setImgSrc(image_url);
    setLoading(true);
    setError(false);
  }, [image_url]);

  const handleError = () => {
    if (!error) {
      // Try extracting CID from current URL
      const cidMatch = imgSrc.match(/ipfs\/([^/]+)/);
      if (cidMatch && cidMatch[1]) {
        const cid = cidMatch[1];
        const currentGateway = imgSrc.split('/ipfs/')[0];
        const currentIndex = ipfsGateways.indexOf(currentGateway);
        
        if (currentIndex < ipfsGateways.length - 1) {
          // Try next gateway
          const nextGateway = ipfsGateways[currentIndex + 1];
          setImgSrc(`${nextGateway}/ipfs/${cid}/${id}.png`);
          return;
        }
      }
    }
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

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
              }}
              className="text-sm text-blue-500 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Image - hidden when loading or in error state */}
        {!error && (
          <img 
            src={imgSrc}
            alt={`${name} #${id}`}
            className={`object-cover w-full h-full ${loading ? 'opacity-0' : 'opacity-100'}`}
            onError={handleError}
            onLoad={handleLoad}
            loading="lazy"
          />
        )}
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-medium text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">Token ID: #{id}</p>
      </div>
    </div>
  );
}
