// utils/ipfsConverter.ts
export const convertIpfsUri = (uri: string | null | undefined): string | undefined => {
  if (!uri) return undefined;

  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  }

  return uri; // Already HTTP(S)
};
