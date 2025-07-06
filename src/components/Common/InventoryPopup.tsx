import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import NFTCard from './NFTCard';
import { useAccount, useContractRead } from 'wagmi';
import { ScaleLoader } from 'react-spinners';
import { NFT_ADDR } from '@/config';
import contractABI from '@/config/ABI/nft.json';
import { ethers } from 'ethers';

interface InventoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const TARGET_CONTRACT = '0x2D4e4BE7819F164c11eE9405d4D195e43C7a94c6';
const WALLET_TRACKER_CONTRACT = '0x0B2C8149c1958F91A3bDAaf0642c2d34eb7c43ab';
const chainId = 61;

// Configure the ETC provider with proper network settings
const getETCProvider = () => {
  return new ethers.providers.JsonRpcProvider(
    "https://etc.rivet.link",
    {
      name: "ETC",
      chainId: 61,
      ensAddress: undefined
    }
  );
};

const formatExactDecimals = (value: number, decimals: number) => {
  const parts = value.toString().split('.');
  const integerPart = new Intl.NumberFormat('en-US').format(parseInt(parts[0]));
  const decimalPart = parts[1] ? parts[1].substring(0, decimals).padEnd(decimals, '0') : '0'.repeat(decimals);
  return `${integerPart}.${decimalPart}`;
};

export default function InventoryPopup({ isOpen, onClose }: InventoryPopupProps) {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<any[]>([]);
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

  // Read from wallet tracker contract
  const { data: ownedTokenIds, refetch: refetchOwnedTokens } = useContractRead({
    address: WALLET_TRACKER_CONTRACT,
    abi: contractABI,
    functionName: "walletOfOwner",
    args: [address],
    chainId,
    query: {
      enabled: !!address && isOpen,
    },
  });

  useEffect(() => {
    if (contractBalance && currentTokenId && totalBurned) {
      const balanceInETC = Number(contractBalance) / 1e18;
      const activeNFTs = Number(currentTokenId) - 1 - Number(totalBurned);
      setRewardPerNFT(activeNFTs > 0 ? balanceInETC / activeNFTs : 0);
    }
  }, [contractBalance, currentTokenId, totalBurned]);

  useEffect(() => {
    if (rewardPerNFT > 0 && nfts.length > 0) {
      setWalletWorth(rewardPerNFT * nfts.length);
    } else {
      setWalletWorth(0);
    }
  }, [rewardPerNFT, nfts]);

  const fetchTokenURI = async (tokenId: string): Promise<string> => {
    try {
      const provider = getETCProvider();
      const contract = new ethers.Contract(
        TARGET_CONTRACT,
        ["function tokenURI(uint256 tokenId) external view returns (string memory)"],
        provider
      );
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const uriPromise = contract.tokenURI(tokenId);
      const uri = await Promise.race([uriPromise, timeoutPromise]);
      
      return uri;
    } catch (error) {
      console.error(`Error fetching tokenURI for token ${tokenId}:`, error);
      throw error;
    }
  };

  const fetchMetadata = async (tokenURI: string): Promise<any> => {
    if (!tokenURI) throw new Error("Empty tokenURI");
    
    // Clean up the tokenURI - remove null bytes and trim
    let cleanUri = tokenURI.replace(/\0+$/, '').trim();

    // Check if it's already a full HTTP URL
    if (cleanUri.startsWith('http')) {
      // If it's already a complete gateway URL, use it directly
      try {
        const response = await fetch(cleanUri);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        console.error('Error fetching from direct URL:', error);
        throw error;
      }
    }

    // Handle IPFS hashes (both with and without ipfs:// prefix)
    let ipfsHash = cleanUri
      .replace(/^ipfs:\/\//, '')
      .replace(/^https:\/\/gateway\.pinata\.cloud\/ipfs\//, '')
      .replace(/^https:\/\/(.*?)\/ipfs\//, '');

    // List of IPFS gateways to try (in order)
    const gateways = [
      'https://ipfs.io/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://gateway.pinata.cloud/ipfs/',
      'https://dweb.link/ipfs/',
      'https://cf-ipfs.com/ipfs/'
    ];

    let lastError: any = null;
    
    for (const gateway of gateways) {
      const url = `${gateway}${ipfsHash}`;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });
        clearTimeout(timeout);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        console.error(`Failed with gateway ${gateway}:`, error);
        lastError = error;
        continue;
      }
    }
    
    throw lastError || new Error("All IPFS gateways failed");
  };

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address || !isOpen) return;
      
      setLoading(true);
      setError(null);

      try {
        const response = await refetchOwnedTokens();
        
        if (response.error) throw response.error;

        const tokenIds = response.data as bigint[];
        if (!tokenIds || tokenIds.length === 0) {
          setNfts([]);
          return;
        }

        // Fetch metadata for each token
        const nftPromises = tokenIds.map(async (tokenId) => {
          const tokenIdStr = tokenId.toString();
          try {
            const tokenURI = await fetchTokenURI(tokenIdStr);
            const metadata = await fetchMetadata(tokenURI);
            
            return {
              token_id: tokenIdStr,
              token: {
                address: TARGET_CONTRACT,
                name: metadata.name || "ClassicBirds",
                image_url: metadata.image || metadata.image_url || '/placeholder-nft.png'
              },
              image_url: metadata.image || metadata.image_url || '/placeholder-nft.png'
            };
          } catch (e) {
            console.error(`Failed to fetch metadata for token ${tokenIdStr}`, e);
            return {
              token_id: tokenIdStr,
              token: {
                address: TARGET_CONTRACT,
                name: "ClassicBirds",
                image_url: '/placeholder-nft.png'
              },
              image_url: '/placeholder-nft.png'
            };
          }
        });

        const formattedNFTs = await Promise.all(nftPromises);
        setNfts(formattedNFTs);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError('Failed to load NFTs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) fetchNFTs();
  }, [isOpen, address, refetchOwnedTokens]);

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
              <button onClick={() => window.location.reload()} className="ml-2 text-red-800 font-semibold hover:underline">
                Refresh
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
                <NFTCard
                  key={nft.token_id}
                  id={nft.token_id}
                  name={nft.token?.name || 'ClassicBirds'}
                  image_url={nft.image_url}
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
