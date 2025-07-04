import React, { useState } from 'react';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { Dialog } from '@headlessui/react';

export default function NFTCard({ id, name, image_url }: { id: string, name: string, image_url: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [recipient, setRecipient] = useState('');
  
  // Prepare the contract write for transferring NFT
  const { config } = usePrepareContractWrite({
    address: '0x2D4e4BE7819F164c11eE9405d4D195e43C7a94c6',
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    functionName: 'safeTransferFrom',
    args: [recipient, BigInt(id)],
    enabled: !!recipient,
  });

  const { write: sendNFT, isLoading } = useContractWrite(config);

  const handleSend = () => {
    if (recipient && sendNFT) {
      sendNFT();
      setShowConfirm(false);
    }
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
          onClick={() => setShowConfirm(true)}
          className="mt-2 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          Send NFT
        </button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-bold mb-4">Confirm Transfer</Dialog.Title>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address:
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="0x..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!recipient || isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Confirm'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
