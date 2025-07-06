import React, { useState } from 'react';

export default function NFTCard({ id, name, image_url }: { id: string, name: string, image_url: string }) {
  const [imgSrc, setImgSrc] = useState(image_url);
  const [hasError, setHasError] = useState(false);

  // Fallback IPFS gateways in case Pinata is down
  const fallbackGateways = [
    'https://ipfs.io/ipfs/bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq',
    'https://cloudflare-ipfs.com/ipfs/bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq',
    'https://dweb.link/ipfs/bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq'
  ];

  const handleError = () => {
    if (!hasError) {
      // Try fallback gateways
      const currentGateway = imgSrc.split('/ipfs/')[0];
      const currentIndex = fallbackGateways.indexOf(currentGateway);
      
      if (currentIndex < fallbackGateways.length - 1) {
        // Try next gateway
        const nextGateway = fallbackGateways[currentIndex + 1];
        setImgSrc(`${nextGateway}/${id}.png`);
        return;
      }
    }
    setHasError(true);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {!hasError ? (
          <img 
            src={imgSrc}
            alt={`${name} #${id}`}
            className="object-cover w-full h-full"
            on
