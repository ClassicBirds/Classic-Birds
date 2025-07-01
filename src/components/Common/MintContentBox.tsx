import { useState, useEffect } from "react";
import { useAccount, useContractRead, useProvider } from "wagmi";
import { ScaleLoader } from "react-spinners";
import { NFT_ADDR, chainId } from "../config";
import contractABI from "../abi.json";

export default function MintContentBox() {
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
  const [burnReward, setBurnReward] = useState<number | null>(null);
  const [burnRewardLoading, setBurnRewardLoading] = useState(false);
  const { address } = useAccount();
  const provider = useProvider();

  // Contract reads
  const { data: totalLockedValue, isLoading: lockedValueLoading } = useContractRead({
    address: NFT_ADDR as "0x",
    abi: contractABI,
    functionName: "TotalLockedValue",
    chainId,
    watch: true
  });

  const { data: currentTokenId } = useContractRead({
    address: NFT_ADDR as "0x",
    abi: contractABI,
    functionName: "tokenId",
    chainId,
    watch: true
  });

  const { data: totalBurned } = useContractRead({
    address: NFT_ADDR as "0x",
    abi: contractABI,
    functionName: "totalBurned",
    chainId,
    watch: true
  });

  // Calculate burn reward
  useEffect(() => {
    const calculateBurnReward = async () => {
      try {
        setBurnRewardLoading(true);
        
        if (!totalLockedValue || !currentTokenId || !totalBurned) {
          console.log("Missing data:", { totalLockedValue, currentTokenId, totalBurned });
          return;
        }

        // Convert values
        const balanceInETC = Number(totalLockedValue) / 10 ** 18;
        const mintedCount = Number(currentTokenId.toString()) - 1;
        const burnedCount = Number(totalBurned.toString());
        const activeNFTs = mintedCount - burnedCount;
        
        console.log("Burn Reward Calculation:", {
          balance: balanceInETC,
          minted: mintedCount,
          burned: burnedCount,
          activeNFTs
        });

        setBurnReward(activeNFTs > 0 ? balanceInETC / activeNFTs : 0);
      } catch (error) {
        console.error("Burn reward calculation failed:", error);
        setBurnReward(null);
      } finally {
        setBurnRewardLoading(false);
      }
    };

    calculateBurnReward();
  }, [totalLockedValue, currentTokenId, totalBurned]);

  // Updated burn modal display
  const renderBurnReward = () => {
    if (burnRewardLoading) {
      return <ScaleLoader color="#4b5563" height={20} width={2} />;
    }
    if (burnReward === null) {
      return <span className="text-red-500">Error calculating reward</span>;
    }
    return (
      <>
        <span className="text-lg font-bold text-black">
          {burnReward.toFixed(3)} ETC
        </span>
        <div className="text-xs mt-1 text-gray-500">
          (Total Locked: {(Number(totalLockedValue || 0) / 10 ** 18).toFixed(2)} ETC)
        </div>
      </>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Your existing content here */}
      
      {/* Burn button that opens the modal */}
      <button 
        onClick={() => setIsBurnModalOpen(true)}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Burn NFT
      </button>

      {/* Burn Modal */}
      {isBurnModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-black">Burn NFT</h2>
            
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <div className="font-semibold text-black">Burn Reward Details:</div>
              <div className="mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-black">Reward per NFT:</span>
                  {renderBurnReward()}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-black">Active NFTs:</span>
                  <span className="text-black">
                    {currentTokenId && totalBurned 
                      ? `${Number(currentTokenId.toString()) - 1 - Number(totalBurned.toString())}`
                      : <ScaleLoader color="#4b5563" height={15} width={1.5} />}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsBurnModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Burn NFT logic here
                  setIsBurnModalOpen(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Confirm Burn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
