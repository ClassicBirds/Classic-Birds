import { Contract } from "@ethersproject/contracts";
import Erc20 from "../config/ABI/erc20.json";
import { ethers } from "ethers";
import { ProviderRpc } from "@/config/network";


export const getPublicContractInstance = (
  contractaddress: string,
  netID: number
) => {
  const provider = new ethers.providers.JsonRpcProvider(ProviderRpc[netID]);
  const contract = new Contract(contractaddress, Erc20.abi, provider);
  return contract;
};
export const getContractInstance = (contractaddress: string, singer: any) => {
  const contract = new Contract(contractaddress, Erc20.abi, singer);
  return contract;
};


export const getContractInstanceWithABI = (contractaddress: string,ABI:any,chainid:number) => {
  const provider = new ethers.providers.JsonRpcProvider(ProviderRpc[chainid]);
  const contract = new Contract(contractaddress, ABI.abi, provider);
  return contract;
};

export const getTokeninstanceBysigner = (staketoken: string, library: any) => {
  const contract = new Contract(staketoken, Erc20.abi, library);
  return contract;
};


export const getContractInstanceSigner = (
  contractaddress: string,
  ABI: any,
  provider: any
) => {
  const contract = new Contract(contractaddress, ABI.abi, provider);
  return contract;
};

export const getTokeninstance = (
  staketoken: string,
  isUsercall: boolean,
  netId: number,
  library?: any
) => {
  if (isUsercall) {
    const contract = new Contract(staketoken, Erc20.abi, library);
    return contract;
  } else {
    const provider = new ethers.providers.JsonRpcProvider(ProviderRpc[netId]);
    const contract = new Contract(staketoken, Erc20.abi, provider);
    return contract;
  }
};

export const getPublicProvider = (chainid:number)=>{
  const provider = new ethers.providers.JsonRpcProvider(ProviderRpc[chainid]);
  // console.log(provider.getBalance(""));
  
  return provider;
}
export const FormatUnit = async (amount: any, decimals: number) => {
  const _amount = await ethers.utils.parseUnits(amount.toString(),decimals);

  return _amount.toString();
};

export const ConvertEthTonormal = async (amount: any,dc:number) => {
  const _amount = await ethers.utils.formatUnits(amount, dc);
  return _amount;
};