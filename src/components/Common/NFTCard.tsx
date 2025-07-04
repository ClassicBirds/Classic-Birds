import React, { useState } from 'react';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { NFT_ADDR } from '@/config';
import contractABI from '@/config/ABI/nft.json';
import { toast } from 'react-toastify';

export default function NFTCard({ id, name, image_url }: { id: string, name: string, image_url: string }) {
  const { address } = useAccount();
  const [showSendModal, setShowSendModal] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  // Prepare the contract write for transfer
  const { config } = usePrepareContractWrite({
    address: NFT_ADDR,
    abi: contractABI,
    functionName: 'safeTransferFrom',
    args: [address, recipientAddress, id],
    enabled: !!recipientAddress && !!address,
  });

  const { write: transferNFT } = useContractWrite({
    ...config,
    onSuccess: () => {
      toast.success('NFT transferred successfully!');
      setShowSendModal(false);
      setRecipientAddress('');
    },
    onError: (error) => {
      toast.error(`Transfer failed: ${error.message}`);
    },
    onSettled: () => {
      setIsConfirming(false);
    }
  });

  const handleSend = () => {
    if (!recipientAddress) {
      toast.error('Please enter a valid wallet address');
      return;
    }
    setIsConfirming(true);
    transferNFT?.();
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {image_url ? (
          <img 
            src={image_url} 
            alt={name} 
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-nft.png';
              (e.target as HTMLImageElement).className = 'object-contain w-full h-full p-4';
            }}
          />
        ) : (
          <span className="text-gray-400">No image</span>
        )}
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-medium text-gray-900 truncate">ClassicBirds</h3>
        <p className="text-sm text-gray-600 mt-1">Token ID: #{id}</p>
        
        <button
          onClick={() => setShowSendModal(true)}
          className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Send
        </button>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Transfer NFT</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Wallet Address
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setRecipientAddress('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isConfirming}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!recipientAddress || isConfirming}
                className={`px-4 py-2 text-white rounded-md ${
                  isConfirming 
                    ? 'bg-blue-400' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isConfirming ? 'Confirming...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
