import React, { useState, useEffect } from "react";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Collapse,
} from "@material-tailwind/react";
import Link from "next/link";
import ConnectButton from "../connetbutton/ConnectButton";

export function Header() {
  const [openNav, setOpenNav] = React.useState(false);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolling(true);
      } else {
        setScrolling(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960 && openNav) {
        setOpenNav(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header
      className={`mx-auto ${
        openNav ? "pb-5 overflow-hidden  h-[100vh] " : "pb-0 "
      } ${
        scrolling ? "backdrop-blur-md" : ""
      }  items-center sticky  bg-transparent border-none z-[100]    w-full   top-[0px]   `}
    >
      <div className="!border-b !border-b-gray-800   ">
        <div className="!mx-auto max-w-7xl flex flex-row items-center w-full  justify-between  px-6 md:px-16 space-x-2 h-[90px]  ">
          <Link href="/" className="p-5">
            <img
              src={"/IMG_20250327_010138_507.webp"}
              width={60}
              alt="logo"
              className=" cursor-pointer rounded-2xl"
              height={40}
            />
          </Link>
     <div className=" flex flex-row mx-auto gap-5">
     <ConnectButton />
     <a className="px-4 py-3 hidden md:block relative z-50 hover:opacity-55 text-black duration-200 font-medium text-[14px] rounded-2xl bg-[#00ffb4] " href="https://linktr.ee/ClassicBirds" target="_blank" rel="noopener noreferrer">Official links</a>
     </div>
        </div>
      </div>
    </header>
  );
}
