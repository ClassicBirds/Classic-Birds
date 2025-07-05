import React, { useState, useEffect } from 'react';

export default function NFTCard({ id, name, image_url }: { id: string, name: string, image_url: string }) {
  const [imgSrc, setImgSrc] = useState(image_url);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Array of fallback image URLs to try if primary fails
  const fallbackImageUrls = [
    '/placeholder-nft.png', // Local fallback
    `https://ipfs.io/ipfs/bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq/${id}.png`,
    `https://cloudflare-ipfs.com/ipfs/bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq/${id}.png`,
    `https://dweb.link/ipfs/bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq/${id}.png`
  ];

  useEffect(() => {
    setImgSrc(image_url);
    setLoading(true);
    setError(false);
  }, [image_url]);

  const handleError = () => {
    if (!error) {
      // Try the next fallback image
      const currentIndex = fallbackImageUrls.indexOf(imgSrc);
      if (currentIndex < fallbackImageUrls.length - 1) {
        setImgSrc(fallbackImageUrls[currentIndex + 1]);
        setError(false);
      } else {
        setError(true);
      }
    } else {
      setError(true);
    }
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            </div>
          </div>
        )}
        
        {!error ? (
          <img 
            src={imgSrc}
            alt={`${name} #${id}`}
            className={`object-cover w-full h-full ${loading ? 'opacity-0' : 'opacity-100'}`}
            onError={handleError}
            onLoad={handleLoad}
            loading="lazy"
          />
        ) : (
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
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-medium text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">Token ID: #{id}</p>
      </div>
    </div>
  );
}
