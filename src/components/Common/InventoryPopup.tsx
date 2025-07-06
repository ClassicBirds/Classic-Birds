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

const extractCID = (uri: string) => {
  // Handle direct IPFS paths (ipfs://<cid>/path)
  if (uri.startsWith('ipfs://')) {
    const parts = uri.replace('ipfs://', '').split('/');
    return {
      cid: parts[0],
      path: parts.slice(1).join('/')
    };
  }

  // Handle gateway URLs (https://<gateway>/ipfs/<cid>/path)
  const gatewayMatch = uri.match(/https?:\/\/[^/]+\/ipfs\/([^/]+)(?:\/(.*))?/);
  if (gatewayMatch) {
    return {
      cid: gatewayMatch[1],
      path: gatewayMatch[2] || ''
    };
  }

  // Handle raw CIDs (Qm... or bafy...)
  const cidMatch = uri.match(/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[0-9A-Za-z]{50,})/);
  if (cidMatch) {
    return {
      cid: cidMatch[0],
      path: ''
    };
  }

  throw new Error('Could not extract CID from URI');
};

const fetchWithFallback = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
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
    throw error;
  }
};

export default function InventoryPopup({ isOpen, onClose }: InventoryPopupProps) {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [walletWorth, setWalletWorth] = useState(0);
  const [rewardPerNFT, setRewardPerNFT] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Contract reads remain the same
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

  // Effects remain the same
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

    // Clean up the tokenURI
    const cleanUri = tokenURI.replace(/\0+$/, '').trim();

    try {
      const { cid, path } = extractCID(cleanUri);
      const tokenNumber = path.match(/\d+/)?.[0] || '';

      // Ordered list of IPFS gateways to try
      const gateways = [
        'https://cloudflare-ipfs.com/ipfs/',
        'https://ipfs.io/ipfs/',
        'https://dweb.link/ipfs/',
        'https://gateway.pinata.cloud/ipfs/',
        'https://cf-ipfs.com/ipfs/'
      ];

      for (const gateway of gateways) {
        let url = `${gateway}${cid}`;
        if (path) url += `/${path}`;
        if (tokenNumber && !url.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
          url += '.png';
        }

        try {
          return await fetchWithFallback(url);
        } catch (error) {
          console.error(`Failed with gateway ${gateway}:`, error);
          continue;
        }
      }

      // If all gateways failed, return fallback
      return {
        name: `ClassicBirds #${tokenNumber || 'unknown'}`,
        image: '/placeholder-nft.png'
      };
    } catch (error) {
      console.error('Error processing tokenURI:', error);
      return {
        name: 'ClassicBirds',
        image: '/placeholder-nft.png'
      };
    }
  };

  // Rest of the component remains the same
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
      {/* Rest of your JSX remains exactly the same */}
      {/* ... */}
    </Dialog>
  );
}
