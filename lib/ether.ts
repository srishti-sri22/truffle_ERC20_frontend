import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, polygonAmoy, arbitrum, optimism } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// WalletConnect Project ID - Get from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

// Configure wagmi with multiple chains and connectors
export const config = createConfig({
  chains: [mainnet, sepolia, polygonAmoy, arbitrum, optimism],
  connectors: [
    // Injected connector for browser extension wallets (MetaMask, Phantom, etc.)
    injected({
      shimDisconnect: true,
    }),
    
    // WalletConnect for mobile wallets and additional browser wallets
    walletConnect({
      projectId,
      metadata: {
        name: 'Truffle Token Faucet',
        description: 'Get free test tokens for your dApps',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://truffle-token.app',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
      showQrModal: true,
    }),
    
    // Coinbase Wallet
    coinbaseWallet({
      appName: 'Truffle Token Faucet',
      darkMode: true,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygonAmoy.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
})

// Helper function to detect installed wallets
export const detectInstalledWallets = () => {
  if (typeof window === 'undefined') return {}

  const installed: Record<string, boolean> = {
    metamask: false,
    phantom: false,
    coinbase: false,
    trust: false,
    rainbow: false,
  }

  if (typeof window.ethereum !== 'undefined') {
    installed.metamask = Boolean(window.ethereum.isMetaMask)
    installed.phantom = Boolean(window.ethereum.isPhantom || (window as any).phantom?.ethereum)
    installed.coinbase = Boolean(window.ethereum.isCoinbaseWallet)
    installed.trust = Boolean(window.ethereum.isTrust)
    installed.rainbow = Boolean(window.ethereum.isRainbow)
  }

  return installed
}

// Chain name mapping
export const chainNames: Record<number, string> = {
  1: 'Ethereum',
  11155111: 'Sepolia',
  80002: 'Polygon Amoy',
  42161: 'Arbitrum',
  10: 'Optimism',
}

// Get chain name by ID
export const getChainName = (chainId: number): string => {
  return chainNames[chainId] || `Chain ${chainId}`
}

declare global {
  interface Window {
    ethereum?: any
    phantom?: any
  }
}