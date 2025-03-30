export const truncateAddress = (address?: string, prefixLength: number = 5, suffixLength: number = 5): string => {
    if (!address) {
      return "";
    }
  
    const truncatedAddress = address.slice(0, prefixLength) + " ••• " + address.slice(-suffixLength);
    return truncatedAddress;
  };
  

  export const truncateAddressOneside = (address?: string, prefixLength: number = 5, suffixLength: number = 5): string => {
    if (!address) {
      return "";
    }
  
    const truncatedAddress = address.slice(-suffixLength);
    return truncatedAddress;
  };
  