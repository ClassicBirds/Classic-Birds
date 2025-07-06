import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import NFTCard from './NFTCard';
import { useAccount, useContractRead } from 'wagmi';
import { ScaleLoader } from 'react-spinners';
import { NFT_ADDR } from '@/config';
import contractABI from '@/config/ABI/nft.json';

const TARGET_CONTRACT = '0x2D4e4BE7819F164c11eE9405d4D195e43C7a94c6';
const chainId = 61;

type NFTItem = {
  id: string;
  token_id: string;
  token: {
    address: string;
    name: string;
  };
};

const formatExactDecimals = (value: number, decimals: number): string => {
  const [integer, fraction = '0'] = value.toString().split('.');
  const formattedInteger = new Intl.NumberFormat('en-US').format(parseInt(integer));
  const formattedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return `${formattedInteger}.${formattedFraction}`;
};

export default function InventoryPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Calculate reward per NFT
  const rewardPerNFT = useMemo(() => {
    if (!contractBalance || !currentTokenId || !totalBurned) return 0;
    
    const balanceInETC = Number(contractBalance) / 1e18;
    const activeNFTs = Number(currentTokenId) - 1 - Number(totalBurned);
    return activeNFTs > 0 ? balanceInETC / activeNFTs : 0;
  }, [contractBalance, currentTokenId, totalBurned]);

  // Calculate wallet worth
  const walletWorth = useMemo(() => {
    return rewardPerNFT * nfts.length;
  }, [rewardPerNFT, nfts.length]);

  const fetchNFTs = useCallback(async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await axios.get(
        `https://etc.blockscout.com/api/v2/addresses/${address}/nft?type=ERC-721`,
        { timeout: 5000 }
      );
      
      const filtered = data.items?.filter((item: any) => 
        item.token.address.toLowerCase() === TARGET_CONTRACT.toLowerCase()
      ) || [];
      
      setNfts(filtered);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError('Failed to load NFTs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isOpen) {
      fetchNFTs();
    }
  }, [isOpen, fetchNFTs]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
      <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="px-6 pt-6 pb-2 bg-transparent">
            <Dialog.Title className="text-2xl font-bold text-center text-gray-900">
              Your Birds Nest
            </Dialog.Title>
          </div>
          
          {error && (
            <div className="mx-6 my-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!loading && nfts.length > 0 && (
            <div className="mb-4 mx-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <p className="text-sm text-gray-600">Total NFTs</p>
                  <p className="font-bold text-lg">
                    {nfts.length.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reward per NFT</p>
                  <p className="font-bold text-lg text-green-600">
                    {formatExactDecimals(rewardPerNFT, 6)} ETC
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="font-bold text-xl text-green-600">
                  {formatExactDecimals(walletWorth, 3)} ETC
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <ScaleLoader color="#3B82F6" />
              <p className="text-gray-500">Loading your NFTs...</p>
            </div>
          )}

          {!loading && nfts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No NFTs found in your wallet</p>
              <button 
                onClick={fetchNFTs}
                className="px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && nfts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-6 pt-0">
              {nfts.map((nft) => (
                <NFTCard
                  key={`${nft.token_id}-${nft.id}`}
                  id={nft.token_id || nft.id || 'N/A'}
                  name={nft.token?.name || 'ClassicBirds'}
                />
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
