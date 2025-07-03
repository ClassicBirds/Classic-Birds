// src/components/Common/Inventory.tsx
import { useState, useEffect } from "react";
import { useAccount, useContractRead } from "wagmi";
import { ethers } from "ethers";
import LazyloadImage from "../Common/LazyloadImage";
import { nftAbi } from "../../abi/nft.json"; // Import your NFT ABI

interface NFT {
  tokenId: string;
  image: string;
  name: string;
  description: string;
}

export default function Inventory() {
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState(""); // Set your NFT contract address here

  // Fetch balance of NFTs for the connected address
  const { data: balance } = useContractRead({
    address: contractAddress,
    abi: nftAbi,
    functionName: "balanceOf",
    args: [address],
    enabled: isConnected && !!address,
  });

  // Fetch token IDs owned by the address
  const fetchNFTs = async () => {
    if (!address || !balance) return;

    setIsLoading(true);
    try {
      const tokenIds = [];
      const nftData = [];

      // Get all token IDs owned by the address
      for (let i = 0; i < Number(balance); i++) {
        const { data: tokenId } = await useContractRead({
          address: contractAddress,
          abi: nftAbi,
          functionName: "tokenOfOwnerByIndex",
          args: [address, i],
        });
        tokenIds.push(tokenId);
      }

      // Get metadata for each token
      for (const tokenId of tokenIds) {
        const { data: tokenURI } = await useContractRead({
          address: contractAddress,
          abi: nftAbi,
          functionName: "tokenURI",
          args: [tokenId],
        });

        // Fetch metadata from IPFS or your API
        const metadataResponse = await fetch(tokenURI);
        const metadata = await metadataResponse.json();

        nftData.push({
          tokenId: tokenId.toString(),
          image: metadata.image,
          name: metadata.name,
          description: metadata.description || "",
        });
      }

      setNfts(nftData);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isConnected) {
      fetchNFTs();
    }
  }, [isOpen, isConnected, address, balance]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 relative z-50 hover:opacity-55 text-black duration-200 font-medium text-[14px] rounded-2xl bg-[#00ffb4]"
      >
        My Inventory
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[1000] bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-[#0b0909] border border-[#00ffb4] rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#00ffb4]">
                My NFT Collection
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-[#00ffb4]"
              >
                ✕
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ffb4]"></div>
              </div>
            ) : nfts.length === 0 ? (
              <p className="text-white text-center py-10">
                {isConnected
                  ? "You don't own any NFTs yet."
                  : "Please connect your wallet to view your inventory."}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {nfts.map((nft) => (
                  <div
                    key={nft.tokenId}
                    className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#333] hover:border-[#00ffb4] transition-all"
                  >
                    <div className="aspect-square">
                      <LazyloadImage src={nft.image} />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-bold truncate">
                        {nft.name}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1 truncate">
                        #{nft.tokenId}
                      </p>
                      {nft.description && (
                        <p className="text-gray-400 text-xs mt-2 line-clamp-2">
                          {nft.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}