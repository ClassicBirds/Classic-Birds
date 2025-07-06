import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import NFTCard from './NFTCard';
import { useAccount } from 'wagmi';
import axios from 'axios';
import { ScaleLoader } from 'react-spinners';

type NFTItem = {
  id: string;
  token_id: string;
  token: {
    address: string;
    name: string;
  };
};

type InventoryPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TARGET_CONTRACT = '0x2D4e4BE7819F164c11eE9405d4D195e43C7a94c6';

export default function InventoryPopup({ isOpen, onClose }: InventoryPopupProps) {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNFTs = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `https://etc.blockscout.com/api/v2/addresses/${address}/nft?type=ERC-721`
      );
      const filtered = data.items?.filter(
        (item: any) => item.token.address.toLowerCase() === TARGET_CONTRACT.toLowerCase()
      );
      setNfts(filtered || []);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchNFTs();
  }, [isOpen, address]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-[100]"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
      
      {/* Panel container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="px-6 pt-6 pb-2 bg-transparent">
            <Dialog.Title className="text-2xl font-bold text-center text-gray-900">
              Your NFT Inventory
            </Dialog.Title>
          </div>
          
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <ScaleLoader color="#3B82F6" />
            </div>
          )}

          {/* Empty state */}
          {!loading && nfts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No NFTs found in your wallet.
            </div>
          )}

          {/* NFT Grid */}
          {!loading && nfts.length > 0 && (
            <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-6">
              {nfts.map((nft) => (
                <NFTCard
                  key={nft.token_id || nft.id}
                  id={nft.token_id || nft.id || 'N/A'}
                  name={nft.token?.name || 'NFT'}
                />
              ))}
            </div>
          )}
          
          {/* Close button */}
          <div className="px-6 pb-6 pt-2">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
