import { useState, useEffect } from "react";
import ConnectButton from "@/components/connetbutton/Nftaiconnet";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import useMintHooks from "@/hooks/useTransation";
import { useAccount, useContractRead } from "wagmi";
import ScaleLoader from "react-spinners/ScaleLoader";
import { NFT_ADDR } from "@/config";
import contractABI from "@/config/ABI/nft.json";
import { toast } from "react-toastify";

const chainId = 61;
const MAX_SUPPLY = 500;

export default function MintContentBox() {
  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(false);
  const { loading: mintLoading, handleMint, handleBurn } = useMintHooks(signer, chainId);
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
  const [tokenId, setTokenId] = useState("");
  const [burnReward, setBurnReward] = useState<number | null>(null);
  const [burnRewardLoading, setBurnRewardLoading] = useState(true);

  // Contract data reads
  const { data: currentPrice, isLoading: priceLoading } = useContractRead({
    address: NFT_ADDR as "0x",
    abi: contractABI,
    functionName: "getCurrentPrice",
    chainId,
  });

  const { data: currentTokenId, isLoading: currentTokenIdLoading } = useContractRead({
    address: NFT_ADDR as "0x",
    abi: contractABI,
    functionName: "currentTokenId",
    chainId,
    watch: true
  });

  const { data: totalBurned, isLoading: totalBurnedLoading } = useContractRead({
    address: NFT_ADDR as "0x",
    abi: contractABI,
    functionName: "totalBurned",
    chainId,
    watch: true
  });

  const { data: totalLockedValue, isLoading: lockedValueLoading } = useContractRead({
    address: NFT_ADDR as "0x",
    abi: contractABI,
    functionName: "TotalLockedValue",
    chainId,
    watch: true
  });

  // Convert price from wei to ETC
  const price = currentPrice && typeof currentPrice === "bigint"
    ? (Number(currentPrice) / 10 ** 18).toFixed(2)
    : "0.00";

  // Calculate burn reward
  useEffect(() => {
    const calculateBurnReward = async () => {
      try {
        setBurnRewardLoading(true);
        
        if (!totalLockedValue || !currentTokenId || !totalBurned) return;

        const balanceInETC = Number(totalLockedValue) / 10 ** 18;
        const mintedCount = Number(currentTokenId.toString()) - 1;
        const burnedCount = Number(totalBurned.toString());
        const activeNFTs = mintedCount - burnedCount;
        
        setBurnReward(activeNFTs > 0 ? balanceInETC / activeNFTs : 0);
      } catch (error) {
        console.error("Error calculating burn reward:", error);
        setBurnReward(null);
      } finally {
        setBurnRewardLoading(false);
      }
    };

    calculateBurnReward();
  }, [totalLockedValue, currentTokenId, totalBurned]);

  const handleMintClick = async () => {
    if (!address) return;
    await handleMint(currentPrice);
  };

  const handleBurns = async () => {
    if (!tokenId) return toast.info("Please enter a valid Token ID");
    handleBurn(tokenId);
    setIsBurnModalOpen(false);
    setTokenId("");
  };

  // Format number with 3 decimal places
  const formatPrecise = (value: number | null) => {
    if (value === null) return "0.000";
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    });
  };

  return (
    <div className="p-6 font-Orbitron bg-[#bb1b5d] mx-auto rounded-2xl max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div className="flex-1">
        <img src="/IMG_20250327_010138_507.webp" alt="logo" className="rounded-2xl w-full" />
      </div>
      
      <div className="flex flex-col gap-6 flex-1">
        <h1 className="text-2xl uppercase font-extrabold text-white">Classic Birds</h1>
        <p className="uppercase text-white">Built on Ethereum Classic</p>

        <div className="flex items-center space-x-3 text-xl font-bold uppercase text-white">
          <div>Price:</div>
          <div>{priceLoading ? "Loading..." : `${price} ETC`}</div>
        </div>

        <div className="flex items-center space-x-3 text-xl font-bold uppercase text-white">
          <div>Minted:</div>
          <div>
            {currentTokenIdLoading 
              ? "Loading..." 
              : `${currentTokenId ? Number(currentTokenId.toString()) - 1 : 0}/${MAX_SUPPLY}`}
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xl font-bold uppercase text-white">
          <div>Burned:</div>
          <div>
            {totalBurnedLoading 
              ? "Loading..." 
              : `${totalBurned?.toString() || 0}/${MAX_SUPPLY}`}
          </div>
        </div>

        <div className="flex flex-row justify-start gap-5">
          {isConnected ? (
            <button
              disabled={mintLoading || loading}
              onClick={handleMintClick}
              className="bg-[#00d168] font-bold rounded-full h-[50px] hover:opacity-55 duration-200 w-full md:w-fit px-8"
            >
              {mintLoading ? <ScaleLoader color="#ffff" /> : "Mint Now"}
            </button>
          ) : (
            <ConnectButton />
          )}

          <button
            disabled={mintLoading || loading}
            className="bg-red-600 font-bold rounded-full h-[50px] hover:opacity-55 duration-200 px-8"
            onClick={() => setIsBurnModalOpen(true)}
          >
            Burn
          </button>
        </div>
      </div>

      {/* Burn Modal */}
      {isBurnModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Burn NFT</h2>
            
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-black">
                <div>Contract Balance:</div>
                <div className="text-right">
                  {lockedValueLoading 
                    ? <ScaleLoader color="#4b5563" height={15} width={1.5} />
                    : `${formatPrecise(Number(totalLockedValue || 0) / 10 ** 18)} ETC`}
                </div>
                
                <div>Active NFTs:</div>
                <div className="text-right">
                  {currentTokenIdLoading || totalBurnedLoading
                    ? <ScaleLoader color="#4b5563" height={15} width={1.5} />
                    : Number(currentTokenId?.toString() || 0) - 1 - Number(totalBurned?.toString() || 0)}
                </div>
                
                <div className="font-bold">Burn Reward:</div>
                <div className="text-right font-bold">
                  {burnRewardLoading
                    ? <ScaleLoader color="#4b5563" height={15} width={1.5} />
                    : `${formatPrecise(burnReward)} ETC`}
                </div>
              </div>
            </div>

            <input
              type="text"
              className="bg-white focus:outline-none text-gray-800 sm:text-sm focus:ring-1 rounded focus:ring-blue-600 block w-full p-2.5 pr-6 border border-gray-300 focus:border-blue-600"
              placeholder="Enter Token ID"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />
            
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                onClick={() => setIsBurnModalOpen(false)}
              >
                Cancel
              </button>
              <button
                disabled={loading || burnRewardLoading}
                className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg disabled:opacity-50"
                onClick={handleBurns}
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
