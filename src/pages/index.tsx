import Head from "next/head"
import React, { useState, useEffect } from "react";
import MintContentBox from "../components/Common/MintContentBox";
export default function Home() {
    const [showInventory, setShowInventory] = useState(false);
  
  return (
    <div
      id="mint"
      className="flex flex-col min-h-[calc(100vh-200px)] px-3 justify-center items-center"
    >
     <div className="flex flex-row items-center gap-3 py-5">
       <a
        className="px-4 py-3  md:hidden relative z-50 hover:opacity-55 text-black duration-200 font-medium text-[14px] rounded-2xl bg-[#00ffb4] "
        href="https://linktr.ee/ClassicBirds"
        target="_blank"
        rel="noopener noreferrer"
      >
        Official links
      </a>

          <button
              onClick={() => {
                setShowInventory(true);
              }}
              className="px-4 py-3 md:hidden  relative z-50 hover:opacity-55 text-black duration-200 font-medium text-[14px] rounded-2xl bg-[#00ffb4]"
            >
              Inventory
            </button>



     </div>
           <MintContentBox />
    </div>
  );
}
