// src/components/Header/Header.tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ConnectButton from "../connetbutton/ConnectButton";
import Inventory from "../Common/Inventory";
import { useAccount } from "wagmi";

export function Header() {
  const [scrolling, setScrolling] = useState(false);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`mx-auto sticky top-0 z-[100] w-full ${scrolling ? "backdrop-blur-md" : ""}`}>
      <div className="!border-b !border-b-gray-800">
        <div className="!mx-auto max-w-7xl flex items-center justify-between px-6 md:px-16 h-[90px]">
          <Link href="/">
            <Image
              src="/IMG_20250327_010138_507.webp"
              width={60}
              height={40}
              alt="logo"
              className="cursor-pointer rounded-2xl"
            />
          </Link>
          
          <div className="flex flex-row gap-5">
            {isConnected && <Inventory />}
            <ConnectButton />
            <a 
              className="px-4 py-3 hidden md:block relative z-50 hover:opacity-55 text-black duration-200 font-medium text-[14px] rounded-2xl bg-[#00ffb4]" 
              href="https://linktr.ee/ClassicBirds" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Official links
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
