'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi'
import { detectInstalledWallets, getChainName } from '@/lib/ether'

const walletOptions = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <path d="M35 7L22 16L24.5 10.5L35 7Z" fill="#E17726" stroke="#E17726" strokeWidth="0.5"/>
        <path d="M5 7L17.8 16.1L15.5 10.5L5 7Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5"/>
        <path d="M30 27L27 32L34 34L36 27H30Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5"/>
        <path d="M4 27L6 34L13 32L10 27H4Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5"/>
        <path d="M13 18L11 21L18 21.5L17.8 14L13 18Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5"/>
        <path d="M27 18L22.1 13.9L22 21.5L29 21L27 18Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5"/>
        <path d="M13 32L17 30L13.5 27L13 32Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5"/>
        <path d="M23 30L27 32L26.5 27L23 30Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5"/>
      </svg>
    ),
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <path d="M12 15C17.5 9.5 22.5 9.5 28 15L29 16L26 19L25 18C22 15 18 15 15 18L14 19L11 16L12 15Z" fill="#3B99FC"/>
        <circle cx="14" cy="24" r="3" fill="#3B99FC"/>
        <circle cx="26" cy="24" r="3" fill="#3B99FC"/>
      </svg>
    ),
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="5" y="5" width="30" height="30" rx="15" fill="#0052FF"/>
        <rect x="14" y="14" width="12" height="12" rx="2" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <circle cx="20" cy="20" r="15" fill="#AB9FF2"/>
        <circle cx="16" cy="18" r="2" fill="black"/>
        <circle cx="24" cy="18" r="2" fill="black"/>
        <path d="M14 25Q20 28 26 25" stroke="black" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <path d="M8 20C8 13.4 13.4 8 20 8C26.6 8 32 13.4 32 20" stroke="url(#rainbow)" strokeWidth="4" strokeLinecap="round"/>
        <defs>
          <linearGradient id="rainbow" x1="8" y1="20" x2="32" y2="20">
            <stop offset="0%" stopColor="#FF4E50"/>
            <stop offset="25%" stopColor="#FFB347"/>
            <stop offset="50%" stopColor="#FFFF00"/>
            <stop offset="75%" stopColor="#00FF7F"/>
            <stop offset="100%" stopColor="#4169E1"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <path d="M20 5L8 11V19C8 27 13 34 20 36C27 34 32 27 32 19V11L20 5Z" fill="#3375BB" stroke="#3375BB"/>
        <path d="M20 12L15 17L18 20L20 18L25 13L20 12Z" fill="white"/>
      </svg>
    ),
  },
]

export default function Navbar() {
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false)
  const [installedWallets, setInstalledWallets] = useState<Record<string, boolean>>({})
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()

  useEffect(() => {
    setInstalledWallets(detectInstalledWallets())
  }, [])

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const handleConnectWallet = async (walletId: string) => {
    const installed = installedWallets[walletId]
    
    try {
      // Find the appropriate connector
      let connector
      
      if (walletId === 'metamask' || walletId === 'phantom' || walletId === 'trust' || walletId === 'rainbow') {
        // If wallet is installed, use injected connector
        if (installed) {
          connector = connectors.find(c => c.type === 'injected')
        } else {
          // Fallback to WalletConnect for non-installed wallets
          connector = connectors.find(c => c.type === 'walletConnect')
        }
      } else if (walletId === 'coinbase') {
        connector = connectors.find(c => c.type === 'coinbaseWallet') || connectors.find(c => c.type === 'injected')
      } else if (walletId === 'walletconnect') {
        connector = connectors.find(c => c.type === 'walletConnect')
      }

      if (connector) {
        await connect({ connector })
        setIsWalletMenuOpen(false)
      }
    } catch (error) {
      console.error('Connection error:', error)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setIsWalletMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-b-2 border-amber-200/50 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <Image 
                src="/faucet.svg" 
                alt="Faucet" 
                width={28} 
                height={28} 
                className="filter brightness-0 invert"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-800 to-amber-950 bg-clip-text text-transparent">
                Truffle Token
              </h1>
              <p className="text-amber-600 text-xs">Faucet</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-amber-700 hover:text-amber-900 font-medium transition-colors relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-700 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/faucet" 
              className="text-amber-700 hover:text-amber-900 font-medium transition-colors relative group"
            >
              Faucet
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-700 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/dashboard" 
              className="text-amber-700 hover:text-amber-900 font-medium transition-colors relative group"
            >
              Dashboard
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-700 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="relative">
            {!isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <span>Connect Wallet</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-300 ${isWalletMenuOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Wallet Menu Dropdown */}
                {isWalletMenuOpen && !isPending && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border-2 border-amber-200 overflow-hidden animate-slide-down">
                    <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 border-b-2 border-amber-200">
                      <h3 className="text-lg font-bold text-amber-900">Choose Wallet</h3>
                      <p className="text-xs text-amber-600 mt-1">Select your preferred wallet</p>
                    </div>
                    <div className="p-2 max-h-96 overflow-y-auto">
                      {walletOptions.map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={() => handleConnectWallet(wallet.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-all duration-200 group relative"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                            {wallet.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-amber-900 group-hover:text-amber-700">
                              {wallet.name}
                            </div>
                            {installedWallets[wallet.id] && (
                              <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Installed
                              </div>
                            )}
                          </div>
                          <svg 
                            className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    <div className="p-3 bg-amber-50 border-t-2 border-amber-200 text-center">
                      <p className="text-xs text-amber-600">
                        Don't have a wallet? Get <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-amber-700 font-semibold hover:underline">MetaMask</a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Network Badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 border border-amber-200 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-amber-700">
                    {getChainName(chainId)}
                  </span>
                </div>

                {/* Address Display */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-green-700 font-mono font-medium text-sm">
                    {address && formatAddress(address)}
                  </span>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2.5 rounded-xl bg-white border border-amber-200 text-amber-700 font-medium text-sm hover:bg-amber-50 hover:border-amber-300 hover:shadow-md transition-all duration-300"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </nav>
  )
}