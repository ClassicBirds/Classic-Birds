'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { WagmiProvider } from 'wagmi'
import { createWeb3Modal } from '@web3modal/wagmi/react'

const ethereumClassic = {
  id: 61, // Chain ID for ETC
  name: "Ethereum Classic",
  network: "ethereum-classic",
  nativeCurrency: {
    name: "Ethereum Classic",
    symbol: "ETC",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://etc.etcdesktop.com"] }, // Use a reliable ETC RPC
  },
  blockExplorers: {
    default: { name: "BlockScout", url: "https://blockscout.com/etc/mainnet" },
  },
};


// 2. Create wagmiConfig
const metadata = {
  name: 'Classic Birds',
  description: 'Classic Birds',
  url: 'https://classic-birds.vercel.app', // origin must match your domain & subdomain
  icons: ['/IMG_20250327_010138_507.webp']
}
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || ""
const chains = [ethereumClassic] as const


const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
})

export function Web3ModalProvider(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
