import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import NFTCard from './NFTCard'; // Make sure the path is correct
import { useAccount } from 'wagmi';
type NFTItem = {
  id: string;
  image_url: string | null;
  token: {
    address: string;
    name: string;
    symbol: string;
  };
};

const TARGET_CONTRACT = '0x2D4e4BE7819F164c11eE9405d4D195e43C7a94c6';

export default function InventoryPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {

 // const address = "0x176135Cd42b3464EC298281278ab2F05f269CBF5"
  const {address} = useAccount()
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchNFTs();
  }, [isOpen]);

  const fetchNFTs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`https://etc.blockscout.com/api/v2/addresses/${address}/nft?type=ERC-721`);
      const filtered = data.items?.filter((item: any) => item?.token.address.toLowerCase() === TARGET_CONTRACT.toLowerCase());
      setNfts(filtered);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Dialog.Panel className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-lg">
        <Dialog.Title className="text-xl font-bold mb-4 text-center">Your NFT Inventory</Dialog.Title>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : nfts.length === 0 ? (
          <div className="text-center">No NFTs found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-3">
            {nfts.map((nft) => (
              <NFTCard
                key={nft.id}
                id={nft.id}
                name={nft.token.name}
              />
            ))}
          </div>
        )}
        <button onClick={onClose} className="mt-6 w-full py-2  text-black hover:scale-105 transition-all rounded-lg bg-[#00ffb4] ">Close</button>
      </Dialog.Panel>
    </Dialog>
  );
}
