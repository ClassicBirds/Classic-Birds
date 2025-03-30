import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
export default function Nftaiconnet() {
  const { open, close } = useWeb3Modal();
  const { address, isConnecting, isDisconnected } = useAccount();

  const connetButton = () => {
    // open({ view: 'Account' })
    open();
  };
  return (
    <button
      onClick={connetButton}
      className="focus:ring w-fit px-6 hover:opacity-55 duration-200 focus:ring-offset-1font-bold !text-black font-bold shadow-lg  bg-[#00d168] rounded-[48px] h-[50px]"
    >
      {address
        ? address?.slice(0, 5) + "..." + address?.slice(-5)
        : "Connect Wallet"}
    </button>
  );
}
