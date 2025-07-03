// src/components/Common/Inventory.tsx
import { useState, useEffect } from "react";
import { useAccount, useContractReads } from "wagmi";
import Image from "next/image";
import { ethers } from "ethers";
import { nftAbi } from "../../abi/nft.json";

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
  const contractAddress = "YOUR_NFT_CONTRACT_ADDRESS"; // Replace with your contract address

  // Get balance of NFTs
  const { data: balance, refetch: refetchBalance } = useContractRead({
    address: contractAddress,
    abi: nftAbi,
    functionName: "balanceOf",
    args: [address],
    enabled: isConnected && !!address,
  });

  // Get all token IDs
  const tokenIdRequests = Array(Number(balance || 0))
    .fill(0)
    .map((_, i) => ({
      address: contractAddress,
      abi: nftAbi,
      functionName: "tokenOfOwnerByIndex",
      args: [address, i],
      enabled: isOpen && isConnected && !!balance && i < Number(balance),
    }));

  const { data: tokenIdsResults, refetch: refetchTokenIds } = useContractReads({
    contracts: tokenIdRequests,
  });

  // Get all token URIs
  const metadataRequests = (tokenIdsResults || [])
    .filter((result): result is { result: string } => !!result?.result)
    .map((result) => ({
      address: contractAddress,
      abi: nftAbi,
      functionName: "tokenURI",
      args: [result.result],
      enabled: isOpen && isConnected,
    }));

  const { data: metadataResults, refetch: refetchMetadata } = useContractReads({
    contracts: metadataRequests,
  });

  // Fetch and process all metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!isOpen || !isConnected || !metadataResults) return;

      setIsLoading(true);
      try {
        const validMetadata = metadataResults.filter(
          (result): result is { result: string } => !!result?.result
        );

        const nftData = await Promise.all(
          validMetadata.map(async (result, index) => {
            try {
              const tokenId = tokenIdsResults?.[index]?.result?.toString() || "";
              const tokenURI = result.result;
              const response = await fetch(
                tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
              );
              const metadata = await response.json();
              return {
                tokenId,
                image: metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
                name: metadata.name || `NFT #${tokenId}`,
                description: metadata.description || "",
              };
            } catch (error) {
              console.error("Error fetching metadata:", error);
              return null;
            }
          })
        );

        setNfts(nftData.filter((nft): nft is NFT => !!nft));
      } catch (error) {
        console.error("Error processing NFTs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [isOpen, isConnected, metadataResults, tokenIdsResults]);

  // Refetch data when modal opens
  useEffect(() => {
    if (isOpen && isConnected) {
      refetchBalance();
      refetchTokenIds();
      refetchMetadata();
    }
  }, [isOpen, isConnected, refetchBalance, refetchTokenIds, refetchMetadata]);

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
                className="text-white hover:text-[#00ffb4] text-2xl"
              >
                &times;
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
                    <div className="aspect-square bg-gray-800 flex items-center justify-center">
                      {nft.image ? (
                        <Image
                          src={nft.image}
                          alt={nft.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                          unoptimized={nft.image.startsWith("https://ipfs.io/")}
                        />
                      ) : (
                        <div className="text-gray-400">No image</div>
                      )}
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
