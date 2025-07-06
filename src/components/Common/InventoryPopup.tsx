import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import NFTCard from './NFTCard';
import { useAccount, useContractRead } from 'wagmi';
import { ScaleLoader } from 'react-spinners';
import { NFT_ADDR } from '@/config';
import contractABI from '@/config/ABI/nft.json';

const TARGET_CONTRACT = '0x2D4e4BE7819F164c11eE9405d4D195e43C7a94c6';
const WALLET_TRACKER_CONTRACT = '0x0B2C8149c1958F91A3bDAaf0642c2d34eb7c43ab';
const chainId = 61;
const BLOCKSCOUT_API = 'https://etc.blockscout.com/api/v2/tokens';

const formatExactDecimals = (value: number, decimals: number) => {
  const parts = value.toString().split('.');
  const integerPart = new Intl.NumberFormat('en-US').format(parseInt(parts[0]));
  const decimalPart = parts[1] ? parts[1].substring(0, decimals).padEnd(decimals, '0') : '0'.repeat(decimals);
  return `${integerPart}.${decimalPart}`;
};

export default function InventoryPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
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
    enabled: !!address && isOpen,
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

  useEffect(() => {
    const fetchNFTMetadata = async (tokenIds: bigint[]) => {
      try {
        // Fetch collection metadata first
        const collectionResponse = await axios.get(`${BLOCKSCOUT_API}/${TARGET_CONTRACT}/nfts`);
        const baseImageUrl = collectionResponse.data.image_url;

        // Process each token
        const nftPromises = tokenIds.map(async (tokenId) => {
          const tokenIdStr = tokenId.toString();
          try {
            // Try to get individual token metadata
            const tokenResponse = await axios.get(`${BLOCKSCOUT_API}/${TARGET_CONTRACT}/nfts/${tokenIdStr}`);
            return {
              token_id: tokenIdStr,
              token: {
                address: TARGET_CONTRACT,
                name: tokenResponse.data.name || collectionResponse.data.name || "ClassicBirds",
                image_url: tokenResponse.data.image_url || baseImageUrl || '/placeholder-nft.png'
              },
              image_url: tokenResponse.data.image_url || baseImageUrl || '/placeholder-nft.png'
            };
          } catch (e) {
            console.error(`Failed to fetch metadata for token ${tokenIdStr}`, e);
            return {
              token_id: tokenIdStr,
              token: {
                address: TARGET_CONTRACT,
                name: "ClassicBirds",
                image_url: baseImageUrl || '/placeholder-nft.png'
              },
              image_url: baseImageUrl || '/placeholder-nft.png'
            };
          }
        });

        const formattedNFTs = await Promise.all(nftPromises);
        setNfts(formattedNFTs);
      } catch (err) {
        console.error('Error fetching NFT metadata:', err);
        setError('Failed to load NFT metadata. Images may not display correctly.');
      }
    };

    const fetchNFTs = async () => {
      if (!address || !isOpen) return;
      
      setLoading(true);
      setError(null);

      try {
        // First get token IDs from wallet tracker contract
        const response = await refetchOwnedTokens();
        
        if (response.error) throw response.error;

        const tokenIds = response.data as bigint[];
        if (!tokenIds || tokenIds.length === 0) {
          setNfts([]);
          return;
        }

        // Then fetch metadata for each token
        await fetchNFTMetadata(tokenIds);
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
      {/* ... rest of the component remains the same ... */}
    </Dialog>
  );
}
