import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import NFTCard from './NFTCard';
import { useAccount, useContractRead } from 'wagmi';
import { ScaleLoader } from 'react-spinners';
import { NFT_ADDR } from '@/config';
import contractABI from '@/config/ABI/nft.json';

// Configuration
const TARGET_CONTRACT = '0x2D4e4BE7819F164c11eE9405d4D195e43C7a94c6';
const HELPER_CONTRACT = '0x0B2C8149c1958F91A3bDAaf0642c2d34eb7c43ab'; // Your deployed helper contract address
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

// Utility functions
const formatExactDecimals = (value: number, decimals: number) => {
  const parts = value.toString().split('.');
  const integerPart = new Intl.NumberFormat('en-US').format(parseInt(parts[0]));
  const decimalPart = parts[1] ? parts[1].substring(0, decimals).padEnd(decimals, '0') : '0'.repeat(decimals);
  return `${integerPart}.${decimalPart}`;
};

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
  const { data: tokenIds, refetch: refetchNFTs } = useContractRead({
    address: HELPER_CONTRACT,
    abi: helperABI,
    functionName: "walletOfOwner",
    args: [TARGET_CONTRACT, address],
    chainId,
    enabled: false,
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

  // Fetch NFTs when modal opens
  useEffect(() => {
    if (isOpen && address) {
      setLoading(true);
      setError(null);
      
      const fetchData = async () => {
        try {
          await refetchNFTs();
          
          if (tokenIds) {
            setNfts(tokenIds.map((id: bigint) => ({
              token_id: id.toString(),
              token: {
                name: "ClassicBirds",
                address: TARGET_CONTRACT
              }
            })));
          }
        } catch (err) {
          console.error("Fetch error:", err);
          setError("Failed to load NFT data");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen, address, refetchNFTs, tokenIds]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
      <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Dialog content remains the same as previous example */}
          {/* ... */}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
