// src/components/Common/InventoryPopup.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import NFTCard from './NFTCard';
import { useAccount, useContractRead } from 'wagmi';
import { ScaleLoader } from 'react-spinners';
import { NFT_ADDR, NFT_HELPER_ADDR } from '@/config';
import contractABI from '@/config/ABI/nft.json';
import helperABI from '@/config/ABI/nftHelper.json';

const TARGET_CONTRACT = '0x2D4e4BE7819F164c11eE9405d4D195e43C7a94c6';
const chainId = 61;
const BASE_URI = 'https://gateway.pinata.cloud/ipfs/bafybeihulvn4iqdszzqhzlbdq5ohhcgwbbemlupjzzalxvaasrhvvw6nbq';

type NFTMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
};

type NFTItem = {
  id: string;
  token_id: string;
  metadata: NFTMetadata;
  token: {
    address: string;
    name: string;
  };
};

type InventoryPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

const formatExactDecimals = (value: number, decimals: number): string => {
  if (value === 0) return `0.${'0'.repeat(decimals)}`;
  
  const [integer, fraction = '0'] = value.toString().split('.');
  const formattedInteger = new Intl.NumberFormat('en-US').format(parseInt(integer));
  const formattedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return `${formattedInteger}.${formattedFraction}`;
};

// Inline helper ABI (fallback)
const inlineHelperABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_nftAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "getOwnedTokens",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export default function InventoryPopup({ isOpen, onClose }: InventoryPopupProps) {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [walletWorth, setWalletWorth] = useState(0);
  const [rewardPerNFT, setRewardPerNFT] = useState(0);

  // Contract reads for reward calculation - removed 'watch' property
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

  // Helper contract to get owned tokens
  const { 
    data: ownedTokenIds, 
    refetch: refetchNFTs, 
    isLoading: isLoadingNFTs 
  } = useContractRead({
    address: NFT_HELPER_ADDR,
    abi: helperABI || inlineHelperABI,
    functionName: "getOwnedTokens",
    args: [address],
    chainId,
    enabled: false,
  });

  // Fetch metadata for a single token
  const fetchTokenMetadata = useCallback(async (tokenId: bigint): Promise<NFTMetadata> => {
    try {
      const metadataUrl = `${BASE_URI}/${tokenId}`;
      const response = await fetch(metadataUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const metadata: NFTMetadata = await response.json();
      
      // Ensure image URL is absolute (in case it's relative in metadata)
      if (metadata.image && !metadata.image.startsWith('http')) {
        metadata.image = `${BASE_URI}/${metadata.image}`;
      }
      
      return metadata;
    } catch (error) {
      console.error(`Error fetching metadata for token ${tokenId}:`, error);
      // Return fallback metadata
      return {
        name: `ClassicBird #${tokenId}`,
        description: 'ClassicBird NFT',
        image: `${BASE_URI}/${tokenId}.png`,
        attributes: []
      };
    }
  }, []);

  // Fetch metadata for all tokens
  const fetchAllMetadata = useCallback(async (tokenIds: bigint[]): Promise<NFTItem[]> => {
    const nftItems: NFTItem[] = [];
    
    // Use Promise.all for parallel fetching
    const metadataPromises = tokenIds.map(tokenId => fetchTokenMetadata(tokenId));
    const metadatas = await Promise.all(metadataPromises);
    
    for (let i = 0; i < tokenIds.length; i++) {
      nftItems.push({
        id: tokenIds[i].toString(),
        token_id: tokenIds[i].toString(),
        metadata: metadatas[i],
        token: {
          address: TARGET_CONTRACT,
          name: 'ClassicBirds'
        }
      });
    }
    
    return nftItems;
  }, [fetchTokenMetadata]);

  // Process fetched token IDs and fetch metadata
  useEffect(() => {
    const processNFTs = async () => {
      if (ownedTokenIds && (ownedTokenIds as bigint[]).length > 0) {
        const tokenIds = ownedTokenIds as bigint[];
        const nftItems = await fetchAllMetadata(tokenIds);
        setNfts(nftItems);
        setLoading(false);
      } else if (ownedTokenIds) {
        // No NFTs found
        setNfts([]);
        setLoading(false);
      }
    };

    if (ownedTokenIds) {
      processNFTs();
    }
  }, [ownedTokenIds, fetchAllMetadata]);

  // Fetch NFTs when modal opens
  useEffect(() => {
    if (isOpen && address) {
      setLoading(true);
      refetchNFTs();
    } else if (!isOpen) {
      setNfts([]);
    }
  }, [isOpen, address, refetchNFTs]);

  // Update loading state
  useEffect(() => {
    setLoading(isLoadingNFTs);
  }, [isLoadingNFTs]);

  // Calculate reward per NFT
  useEffect(() => {
    if (contractBalance && currentTokenId && totalBurned) {
      const balanceInETC = Number(contractBalance) / 1e18;
      const activeNFTs = Number(currentTokenId) - 1 - Number(totalBurned);
      const calculatedReward = activeNFTs > 0 ? balanceInETC / activeNFTs : 0;
      setRewardPerNFT(calculatedReward);
    }
  }, [contractBalance, currentTokenId, totalBurned]);

  // Calculate wallet worth
  useEffect(() => {
    if (rewardPerNFT > 0 && nfts.length > 0) {
      const totalWorth = rewardPerNFT * nfts.length;
      setWalletWorth(totalWorth);
    } else {
      setWalletWorth(0);
    }
  }, [rewardPerNFT, nfts]);

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
          
          {/* Wallet Summary */}
          {!loading && nfts.length > 0 && (
            <div className="mb-4 mx-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">Total NFTs:</span>
                <span className="font-bold text-gray-900">
                  {nfts.length.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Burn Reward per NFT:</span>
                <span className="font-bold text-green-600">
                  {formatExactDecimals(rewardPerNFT, 6)} ETC
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold text-gray-700">Wallet worth:</span>
                <span className="font-bold text-green-600">
                  {formatExactDecimals(walletWorth, 3)} ETC
                </span>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-12">
              <ScaleLoader color="#3B82F6" />
              <span className="ml-3 text-gray-600">Loading your NFTs...</span>
            </div>
          )}

          {!loading && nfts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No NFTs found in your wallet.
            </div>
          )}

          {!loading && nfts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto p-6 pt-0">
              {nfts.map((nft) => (
                <NFTCard
                  key={nft.token_id}
                  id={nft.token_id}
                  name={nft.metadata.name}
                  image={nft.metadata.image}
                  description={nft.metadata.description}
                  attributes={nft.metadata.attributes}
                />
              ))}
            </div>
          )}
          
          <div className="px-6 pb-6 pt-4">
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
