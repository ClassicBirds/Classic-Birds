// InventoryPopup.tsx
import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import NFTCard from './NFTCard';
import { useAccount, useContractRead } from 'wagmi';
import { ScaleLoader } from 'react-spinners';
import { NFT_ADDR } from '@/config';
import contractABI from '@/config/ABI/nft.json';
import Image from 'next/image';

// Configuration
const TARGET_CONTRACT = '0x2D4e4BE7819F164c11eE9405d4D195e43C7a94c6';
const HELPER_CONTRACT = '0x0B2C8149c1958F91A3bDAaf0642c2d34eb7c43ab';
const chainId = 61;

// Helper Contract ABI
const helperABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "nftAddress", "type": "address" },
      { "internalType": "address", "name": "owner", "type": "address" }
    ],
    "name": "walletOfOwner",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

interface NFTData {
  token_id: string;
  token: {
    name: string;
    address: string;
  };
  image_url?: string;
}

export default function InventoryPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(false);
  const [walletWorth, setWalletWorth] = useState(0);
  const [rewardPerNFT, setRewardPerNFT] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Contract reads
  const { data: contractBalance } = useContractRead({
    address: NFT_ADDR,
    abi: contractABI,
    functionName: "totalLockedValue",
    chainId,
  });

  const { data: currentTokenId } = useContractRead({
    address: NFT_ADDR,
    abi: contractABI,
    functionName: "currentTokenId",
    chainId,
  });

  const { data: totalBurned } = useContractRead({
    address: NFT_ADDR,
    abi: contractABI,
    functionName: "totalBurned",
    chainId,
  });

  // Get NFT IDs from helper contract
  const { 
    data: tokenIds, 
    refetch: refetchNFTs, 
    isRefetching 
  } = useContractRead({
    address: HELPER_CONTRACT,
    abi: helperABI,
    functionName: "walletOfOwner",
    args: [TARGET_CONTRACT, address ?? '0x'],
    chainId,
    enabled: !!address && isOpen,
    onError: (err) => setError(`Failed to load NFTs: ${err.message}`)
  });

  // Calculate rewards
  useEffect(() => {
    if (contractBalance && currentTokenId && totalBurned) {
      const balanceInETC = Number(contractBalance) / 1e18;
      const activeNFTs = Number(currentTokenId) - 1 - Number(totalBurned);
      setRewardPerNFT(activeNFTs > 0 ? balanceInETC / activeNFTs : 0);
    }
  }, [contractBalance, currentTokenId, totalBurned]);

  // Update wallet worth
  useEffect(() => {
    setWalletWorth(rewardPerNFT * nfts.length);
  }, [rewardPerNFT, nfts]);

  // Update NFTs when tokenIds change
  useEffect(() => {
    if (tokenIds) {
      setNfts(tokenIds.map((id: bigint) => ({
        token_id: id.toString(),
        token: {
          name: "ClassicBirds",
          address: TARGET_CONTRACT
        },
        image_url: `https://nftstorage.link/ipfs/YOUR_IPFS_CID/${id}.png` // Update with your actual IPFS CID
      })));
    }
  }, [tokenIds]);

  // Fetch NFTs when modal opens
  useEffect(() => {
    if (isOpen && address) {
      setLoading(true);
      setError(null);
      refetchNFTs().finally(() => setLoading(false));
    }
  }, [isOpen, address, refetchNFTs]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
      <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="px-6 pt-6 pb-2 bg-transparent">
            <Dialog.Title className="text-2xl font-bold text-center text-gray-900">
              Your Birds Nest
            </Dialog.Title>
          </div>
          
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
              <button 
                onClick={() => refetchNFTs()} 
                className="ml-2 text-red-800 font-semibold hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && nfts.length > 0 && (
            <div className="mb-4 mx-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">Total NFTs:</span>
                <span className="font-bold text-gray-900">
                  {new Intl.NumberFormat('en-US').format(nfts.length)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Burn Reward per NFT:</span>
                <span className="font-bold text-green-600">
                  {rewardPerNFT.toFixed(6)} ETC
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold text-gray-700">Wallet worth:</span>
                <span className="font-bold text-green-600">
                  {walletWorth.toFixed(3)} ETC
                </span>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-12">
              <ScaleLoader color="#3B82F6" />
              <span className="ml-3 text-gray-600">Loading NFTs...</span>
            </div>
          )}

          {!loading && nfts.length === 0 && !error && (
            <div className="text-center py-12 text-gray-500">
              No NFTs found in your wallet.
            </div>
          )}

          {!loading && nfts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-6 pt-0">
              {nfts.map((nft) => (
                <div key={nft.token_id} className="border rounded-lg overflow-hidden">
                  {nft.image_url ? (
                    <div className="relative aspect-square">
                      <Image
                        src={nft.image_url}
                        alt={`ClassicBirds NFT #${nft.token_id}`}
                        fill
                        className="object-cover"
                        unoptimized // Remove if you configure proper image optimization
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-medium">#{nft.token_id}</h3>
                    <p className="text-sm text-gray-600">ClassicBirds</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="px-6 pb-6 pt-2">
            <button 
              onClick={onClose} 
              className="w-full py-3 text-black font-medium hover:bg-opacity-90 transition-all rounded-lg bg-[#00ffb4] shadow-sm"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
