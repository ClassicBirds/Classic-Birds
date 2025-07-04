<ScaleLoader color="#bb1b5d" />
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-8">No NFTs found in your wallet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-3">
            {nfts.map((nft) => (
              <NFTCard
                key={nft.id}
                id={nft.id}
                name={nft.token.name}
                image_url={nft.image_url}
              />
            ))}
          </div>
        )}
        
        <button 
          onClick={onClose} 
          className="mt-6 w-full py-2 text-black hover:scale-105 transition-all rounded-lg bg-[#00ffb4]"
        >
          Close
        </button>
      </Dialog.Panel>
    </Dialog>
  );
}
