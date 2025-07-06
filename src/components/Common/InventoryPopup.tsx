// src/components/Common/InventoryPopup.tsx
import { Dialog } from '@headlessui/react';
import React, { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { ethers } from 'ethers';
import { ScaleLoader } from 'react-spinners';
import NFTCard from './NFTCard';
import { NFT_ADDR } from '@/config';
import contractABI from '@/config/ABI/nft.json';

interface InventoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const TARGET_CONTRACT = '0x2D4e4BE7819F164c11eE9405d4D195e43C7a94c6';
const WALLET_TRACKER_CONTRACT = '0x0B2C8149c1958F91A3bDAaf0642c2d34eb7c43ab';
const chainId = 61;

export default function InventoryPopup({ isOpen, onClose }: InventoryPopupProps) {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const { data: ownedTokenIds, refetch: refetchOwnedTokens } = useContractRead({
    address: WALLET_TRACKER_CONTRACT,
    abi: contractABI,
    functionName: "walletOfOwner",
    args: [address],
    chainId,
    enabled: !!address && isOpen,
  });

  const fetchTokenURI = async (tokenId: string): Promise<string> => {
    try {
      const provider = getETCProvider();
      const contract = new ethers.Contract(
        TARGET_CONTRACT,
        ["function tokenURI(uint256 tokenId) external view returns (string memory)"],
        provider
      );
      
      const uri = await contract.tokenURI(tokenId);
      return uri;
    } catch (error) {
      console.error(`Error fetching tokenURI for token ${tokenId}:`, error);
      throw error;
    }
  };

  const fetchMetadata = async (tokenURI: string): Promise<any> => {
    if (!tokenURI) return {
      name: 'ClassicBirds',
      image: '/placeholder-nft.png'
    };

    const cleanUri = tokenURI.replace(/\0+$/, '').trim();
    let processedUri = cleanUri;
    
    if (cleanUri.startsWith('ipfs://')) {
      processedUri = `https://ipfs.io/ipfs/${cleanUri.replace('ipfs://', '')}`;
    }

    try {
      const response = await fetch(processedUri);
      if (!response.ok) throw new Error('Failed to fetch metadata');
      
      const metadata = await response.json();
      let imageUrl = metadata.image;
      
      if (imageUrl.startsWith('ipfs://')) {
        imageUrl = `https://ipfs.io/ipfs/${imageUrl.replace('ipfs://', '')}`;
      }

      return {
        ...metadata,
        image: imageUrl
      };
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return {
        name: 'ClassicBirds',
        image: '/placeholder-nft.png'
      };
    }
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

        const nftPromises = tokenIds.map(async (tokenId) => {
          const tokenIdStr = tokenId.toString();
          try {
            const tokenURI = await fetchTokenURI(tokenIdStr);
            const metadata = await fetchMetadata(tokenURI);
            
            return {
              token_id: tokenIdStr,
              token: {
                address: TARGET_CONTRACT,
                name: metadata.name || `ClassicBirds #${tokenIdStr}`,
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
                name: `ClassicBirds #${tokenIdStr}`,
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
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold text-gray-900">
              Your NFT Inventory
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 p-4 rounded-lg mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ScaleLoader color="#3B82F6" />
            </div>
          ) : nfts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {nfts.map((nft) => (
                <NFTCard
                  key={nft.token_id}
                  id={nft.token_id}
                  name={nft.token.name}
                  image_url={nft.image_url}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No NFTs found in your wallet</p>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
