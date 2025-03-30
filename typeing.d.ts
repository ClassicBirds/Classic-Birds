export interface tokendata {
  name: string;
  decimals: number;
  symbol:string,
  contractaddress: string;
  isNative: boolean;
}

export interface Network {
  name: string;
  link: string;
}

export interface TeamMember {
  name: string;
  logo: string;
  cover: string;
  bridge: string;
  content: string;
  network: Network[];
}

export interface TeamData {
  [key: number]: TeamMember[];
}