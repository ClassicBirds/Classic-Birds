import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import MintContentBox from "../components/Common/MintContentBox";
import { ToastContainer, toast } from "react-toastify";
import InventoryPopup from "../components/Common/InventoryPopup";

export default function Home() {
  const [showInventory, setShowInventory] = useState(false);
  const { address } = useAccount();
  
  return (
    <>
      <div
        id="mint"
        className="relative flex flex-col min-h-[calc(100vh-200px)] px-3 justify-center items-center"
      >
        <div className="flex flex-row items-center gap-3 py-5">
          <a
            className="px-4 py-3 md:hidden relative z-50 hover:opacity-55 text-black duration-200 font-medium text-[14px] rounded-2xl bg-[#00ffb4]"
            href="https://linktr.ee/ClassicBirds"
            target="_blank"
            rel="noopener noreferrer"
          >
            Official links
          </a>

          <button
            onClick={() => {
              if (address) {
                setShowInventory(true);
              } else {
                toast.info("Connect your wallet");
              }
            }}
            className="px-4 py-3 md:hidden relative z-50 hover:opacity-55 text-black duration-200 font-medium text-[14px] rounded-2xl bg-[#00ffb4]"
          >
            Inventory
          </button>
        </div>
        <MintContentBox />
      </div>

      <InventoryPopup
        isOpen={showInventory}
        onClose={() => {
          setShowInventory(false);
        }}
      />
    </>
  );
}
