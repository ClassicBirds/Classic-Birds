import React, { useState } from 'react';
import { useContractWrite } from 'wagmi';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';
import { toast } from 'react-toastify';

export default function NFTCard({ id, name, image_url }: { id: string; name: string; image_url: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [recipient, setRecipient] = useState('');

  const [{ loading, error }, send] = useContractWrite({
    addressOrName: '0x2D4e4BE7819F164c11eE9405d4D195e43C7a94c6',
    contractInterface: [
      {
        inputs: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "tokenId", type: "uint256" }
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      }
    ],
  });

  const handleSend = () => {
    if (!recipient) {
      toast.error('Please enter a valid recipient address');
      return;
    }

    send({ args: [recipient, BigInt(id)] })
      .then(() => {
        toast.success(`NFT #${id} sent successfully!`);
        setShowConfirm(false);
        setRecipient('');
      })
      .catch((err) => {
        toast.error(`Error sending NFT: ${err.message}`);
      });
  };

  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Clickable image that opens send dialog */}
      <div 
        className="aspect-square bg-gray-100 relative cursor-pointer" 
        onClick={() => setShowConfirm(true)}
      >
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-nft.png';
              (e.target as HTMLImageElement).className = 'object-contain p-4';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      <div className="p-3 bg-white">
        <h3 className="font-medium text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">Token ID: #{id}</p>
        
        <button 
          onClick={() => setShowConfirm(true)}
          className="mt-2 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          Send NFT
        </button>
      </div>

      {/* Confirmation Dialog - Now shows which NFT is being sent */}
      <Dialog open={showConfirm} onClose={() => !loading && setShowConfirm(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-bold mb-2">
              Send NFT #{id}
            </Dialog.Title>
            <p className="text-sm text-gray-600 mb-4">You are sending {name} (ID: #{id})</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Wallet Address:
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="0x..."
                disabled={loading}
              />
              {!isValidAddress(recipient) && recipient.length > 0 && (
                <p className="text-red-500 text-xs mt-1">Invalid Ethereum address</p>
              )}
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
                Error: {error.message}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!isValidAddress(recipient) || loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center min-w-24"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : 'Confirm Send'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
