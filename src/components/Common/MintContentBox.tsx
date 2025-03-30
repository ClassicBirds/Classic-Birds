import { useState } from "react";
import ConnectButton from "@/components/connetbutton/Nftaiconnet";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import useMintHooks from "@/hooks/useTransation";
import { useAccount, useContractRead } from "wagmi";
import Input from "@/components/Common/Input";
import ScaleLoader from "react-spinners/ScaleLoader";
import { NFT_ADDR } from "@/config";
import contractABI from "@/config/ABI/nft.json";
import { ToastContainer, toast } from "react-toastify";
const chainId = 61;

export default function MintContentBox() {
  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(false);
  const { loading: mintLoading, handleMint, handleBurn } = useMintHooks(signer, chainId);
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
  const [tokenId, setTokenId] = useState("");

  const { data: currentPrice, isLoading: priceLoading } = useContractRead({
    address: NFT_ADDR as "0x",
    abi: contractABI,
    functionName: "getCurrentPrice",
    chainId,
  });

  const price =
    currentPrice && typeof currentPrice === "bigint"
      ? Number(currentPrice) / 10 ** 18
      : currentPrice || 0;

  const handleMintClick = async () => {
    if (!address) return;
    console.log(currentPrice);
    
    await handleMint(currentPrice);
  };

  const handleBurns = async () => {
    if (!tokenId) return toast.info("Please enter a valid Token ID");
    console.log("Burning token:", tokenId);
    handleBurn(tokenId)
    setIsBurnModalOpen(false);
    setTokenId(""); // Clear input after burning


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

      {/* Burn NFT Modal */}
      {isBurnModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Enter Token ID to Burn</h2>
            <input
              type="text"
              className="bg-white focus:outline-none text-gray-800 dark:bg-gray-900 dark:text-gray-100 sm:text-sm focus:ring-1 rounded focus:ring-blue-600 block w-full p-2.5 pr-6 border dark:border-gray-600 focus:border-blue-600 "
              placeholder="Enter Token ID"
              value={tokenId}
              onChange={(e) => {
                setTokenId(e.target.value)
                console.log(e.target.value);

              }}
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                onClick={() => setIsBurnModalOpen(false)}
              >
                Cancel
              </button>
              <button
                disabled={loading}
                className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg"
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
