import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ethers } from "ethers";
import contractABI from "@/config/ABI/nft.json";
import { NFT_ADDR } from "@/config";

const useMintHooks = (signer: any, chainId: number) => {
  const [loading, setLoading] = useState(false);

  // Handle minting
  const handleMint = async (priceToPay:any) => {
    if (!signer) return toast.error("Please connect your wallet!");

    try {
      setLoading(true);

      const contract = new ethers.Contract(NFT_ADDR, contractABI, signer);
      // const priceToPay = await contract.getCurrentPrice();
      const tx = await contract.mintNFT({ value: priceToPay.toString() });
      await tx.wait();

      toast.success("NFT Minted Successfully!");
    } catch (error: any) {
      console.error("Minting Error:", error);

      if (error.code === "ACTION_REJECTED") {
        toast.error("Transaction rejected by user!");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        toast.error("Insufficient funds for minting!");
      } else {
        toast.error(error?.message || "Minting failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle burning NFT
  const handleBurn = async (tokenId: any) => {
    console.log(signer,'tokenId');
    
    if (!signer) return toast.error("Please connect your wallet!");
    if (!tokenId) return toast.error("Please provide a valid Token ID!");
    
    try {
      setLoading(true);

      const contract = new ethers.Contract(NFT_ADDR, contractABI, signer);
      
      // Check if the user is the owner of the NFT
      const ownerAddress = await contract.ownerOf(tokenId);
      
      // Ensure the connected user is the owner
      if (ownerAddress.toLowerCase() !== signer._address.toLowerCase()) {
        return toast.error("You are not the owner of this NFT!");
      }

      // Proceed with the burn if the user is the owner
      const tx = await contract.burnNFT(tokenId);
      await tx.wait();

      toast.success(`NFT with Token ID ${tokenId} burned successfully!`);
    } catch (error: any) {
      console.error("Burning Error:", error);

      if (error.code === "ACTION_REJECTED") {
        toast.error("Transaction rejected by user!");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        toast.error("Insufficient funds to perform burn!");
      } else {
        toast.error(error?.message || "Burning failed");
      }
    } finally {
      setLoading(false);
    }
  };


  return { loading, handleMint, handleBurn };
};

export default useMintHooks;
