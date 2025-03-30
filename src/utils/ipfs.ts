export const ConvertLink = (link: any) => {
    if (!link) {
      return;
    }
    if (link.startsWith("ipfs://")) {
      return `https://plum-top-penguin-195.mypinata.cloud/ipfs/${link.split("ipfs://")[1]}`;
    } else {
      return link;
    }
  };