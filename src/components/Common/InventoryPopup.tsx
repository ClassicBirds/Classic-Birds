import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import NFTCard from './NFTCard';
import { useAccount, useContractRead } from 'wagmi';
import { ScaleLoader } from 'react-spinners';
import { NFT_ADDR } from '@/config';
import contractABI from '@/config/ABI/nft.json';

const TARGET_CONTRACT = '0x2D4e4BE7819F164c11eE9405d4D195e43C7a94c6';
const chainId = 61;

export default function InventoryPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [walletWorth, setWalletWorth] = useState(0);

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

  // Calculate wallet worth
  useEffect(() => {
    if (contractBalance && currentTokenId && totalBurned && nfts.length > 0) {
      const balanceInETC = Number(contractBalance) / 1e18;
      const activeNFTs = Number(currentTokenId) - 1 - Number(totalBurned);
      const rewardPerNFT = activeNFTs > 0 ? balanceInETC / activeNFTs : 0;
      setWalletWorth(nfts.length * rewardPerNFT);
    }
  }, [contractBalance, currentTokenId, totalBurned, nfts]);

  const fetchNFTs = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`https://etc.blockscout.com/api/v2/addresses/${address}/nft?type=ERC-721`);
      const filtered = data.items?.filter((item: any) => 
        item.token.address.toLowerCase() === TARGET_CONTRACT.toLowerCase()
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
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Dialog.Panel className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-lg">
        <Dialog.Title className="text-xl font-bold mb-4 text-center text-black">Your NFT Inventory</Dialog.Title>
        
        {/* Wallet Summary */}
        {!loading && nfts.length > 0 && (
          <div className="mb-4 p-4 bg-gray-100 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-black">Total NFTs:</span>
              <span className="font-bold text-black">{nfts.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-black">Wallet worth in burn reward:</span>
              <span className="font-bold text-green-600">{walletWorth.toFixed(3)} ETC</span>
            </div>
          </div>
        )}

        {/* NFT Grid */}
        {loading ? (
          <div className="flex justify-center py-8">
            <ScaleLoader color="#bb1b5d" />
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-8 text-black">No NFTs found in your wallet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-3">
            {nfts.map((nft) => (
              <NFTCard
                key={nft.id}
                id={nft.id}
                name="ClassicBirds" // Hardcoded name as requested
                image_url={nft.image_url}
              />
            ))}
          </div>
        )}
        
        <button 
          onClick={onClose} 
          className="mt-6 w-full py-2 text-black hover:scale-105 transition-all rounded-lg bg-[#00ffb4]"
        >
          Close
        </button>
      </Dialog.Panel>
    </Dialog>
  );
}
