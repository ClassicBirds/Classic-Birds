import Head from "next/head";
import MintContentBox from "../components/Common/MintContentBox";
export default function Home() {
  return (
<div id="mint" className="flex flex-col min-h-[calc(100vh-200px)] px-3 justify-center items-center">
<a className="px-4 py-3  md:hidden mb-4 relative z-50 hover:opacity-55 text-black duration-200 font-medium text-[14px] rounded-2xl bg-[#00ffb4] " href="https://t.co/7KJuUPYhPJ" target="_blank" rel="noopener noreferrer">Official links</a>

        <MintContentBox />
    </div>
  );
}
