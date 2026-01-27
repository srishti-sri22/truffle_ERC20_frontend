"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTokenStore } from "@/lib/store"
import { wallet } from "@/lib/wallet"
import { FaucetContract, TokenContract } from "@/lib/contract-interactions"

export default function Home() {
  const [isConnecting, setIsConnecting] = useState(false)
  const { userAddress, isConnected, setConnected, setUserAddress } = useTokenStore()
  const [tokenInfo, setTokenInfo] = useState<{ name: string; symbol: string }>({ name: "", symbol: "" })
  const [faucetData, setFaucetData] = useState({
    claimAmount: "0",
    faucetBalance: "0",
    cooldown: 0,
    lastClaimTime: 0
  })

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

  const handleConnect = async () => {
    setIsConnecting(true)
    await wallet.connect()
    setIsConnecting(false)
  }

  const handleDisconnect = () => wallet.disconnect()

  const loadTokenInfo = async () => {
    try {
      const info = await TokenContract.getTokenInfo()
      setTokenInfo(info)
    } catch { }
  }

  const loadFaucetData = async () => {
    if (!userAddress) return
    try {
      const data = await FaucetContract.getFaucetData(userAddress)
      setFaucetData(data)
    } catch { }
  }

  useEffect(() => {
    wallet.initListeners()
    wallet.checkConnection()
    loadTokenInfo()
  }, [])

  useEffect(() => {
    if (isConnected) loadFaucetData()
  }, [isConnected, userAddress])

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsIDE5MSwgMzYsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-12 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4 group">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <Image src="/faucet.svg" alt="Faucet" width={32} height={32} className="filter brightness-0 invert" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-amber-950 bg-clip-text text-transparent">
                  Truffle Token
                </h1>
                <p className="text-amber-600 text-sm">Sweet tokens, always flowing</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isConnected ? (
                <div className="flex items-center gap-3 animate-slide-in-right">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow"></div>
                    <span className="text-green-700 font-medium text-sm">{formatAddress(userAddress)}</span>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2.5 rounded-xl bg-white border border-amber-200 text-amber-700 font-medium text-sm hover:bg-amber-50 hover:border-amber-300 hover:shadow-md transition-all duration-300"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-fade-in"
                >
                  {isConnecting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </span>
                  ) : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        </header>

        <section className="mb-20 text-center max-w-4xl mx-auto animate-fade-in-up">
          <div className="mb-8 inline-block">
            <div className="text-6xl md:text-8xl mb-4 animate-bounce-slow">🍫</div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 bg-clip-text text-transparent animate-gradient">
            Get Your Test Tokens
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-amber-700 mb-6">
            Sweet & Fast
          </p>
          <p className="text-lg text-amber-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {isConnected
              ? "Your wallet is connected! Start claiming tokens or manage your dashboard."
              : "Connect your wallet to start claiming test tokens, manage your balance, and explore blockchain tokens."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isConnecting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : "Connect Wallet to Start"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            ) : (
              <>
                <Link href="/faucet" className="animate-slide-in-left">
                  <button className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Image src="/faucet.svg" alt="Faucet" width={24} height={24} className="filter brightness-0 invert group-hover:rotate-12 transition-transform duration-300" />
                      Go to Faucet →
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </Link>
                <Link href="/dashboard" className="animate-slide-in-right">
                  <button className="group px-8 py-4 rounded-full bg-white border-2 border-amber-300 text-amber-700 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-amber-50 active:scale-95 transition-all duration-300">
                    <span className="flex items-center justify-center gap-2">
                      <Image src="/token.png" alt="Dashboard" width={24} height={24} className="group-hover:rotate-12 transition-transform duration-300" />
                      Dashboard
                    </span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </section>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { icon: "💰", label: "ERC-20", sub: "Token Standard", delay: "0" },
            { icon: "⚡", label: "Instant", sub: "Token Claim", delay: "100" },
            { icon: "🔒", label: "Secure", sub: "Transactions", delay: "200" },
            { icon: "🌐", label: "Web3", sub: "Powered", delay: "300" }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="group p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-amber-100 shadow-md hover:shadow-xl hover:scale-105 hover:border-amber-300 transition-all duration-300 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${stat.delay}ms` }}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
              <div className="text-xl font-bold text-amber-900 mb-1">{stat.label}</div>
              <div className="text-amber-600 text-sm">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: "💧",
              title: "Claim Tokens",
              desc: "Get free test tokens from our faucet every 24 hours to test your dApps.",
              gradient: "from-amber-600 to-amber-700",
              delay: "0"
            },
            {
              icon: "📊",
              title: "Dashboard",
              desc: "Track your token balance, view metrics, and manage token operations.",
              gradient: "from-amber-700 to-amber-800",
              delay: "150"
            },
            {
              icon: "⚙️",
              title: "Token Operations",
              desc: "Approve spending, transfer tokens, mint, burn, and manage allowances.",
              gradient: "from-amber-800 to-amber-900",
              delay: "300"
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="group p-8 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-amber-100 shadow-lg hover:shadow-2xl hover:scale-105 hover:bg-white/80 transition-all duration-300 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${feature.delay}ms` }}
            >
              <div className={`inline-block p-4 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4 group-hover:rotate-6 transition-transform duration-300 shadow-md`}>
                <span className="text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-3 group-hover:text-amber-700 transition-colors">
                {feature.title}
              </h3>
              <p className="text-amber-600 leading-relaxed mb-4">{feature.desc}</p>
              <div className={`inline-flex items-center gap-2 text-sm font-medium ${isConnected ? 'text-green-600' : 'text-amber-500'}`}>
                {isConnected && <span className="text-lg">✓</span>}
                {isConnected ? 'Ready to use' : 'Connect wallet to access'}
              </div>
            </div>
          ))}
        </div>

        {isConnected && (
          <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 shadow-lg animate-slide-in-up">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse-slow shadow-lg shadow-green-500/50"></div>
                <span className="text-green-700 font-semibold">Wallet Connected</span>
                <span className="px-3 py-1 rounded-lg bg-white/70 text-green-600 text-sm font-mono border border-green-200">
                  {formatAddress(userAddress)}
                </span>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-5 py-2 text-sm rounded-xl bg-white border-2 border-green-300 text-green-700 font-medium hover:bg-green-50 hover:shadow-md transition-all duration-300"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        <footer className="pt-12 border-t-2 border-amber-200/50 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <span className="text-2xl">🍫</span>
              </div>
              <span className="text-amber-800 font-semibold text-lg">Truffle Token Faucet</span>
            </div>
            <div className="text-amber-600 text-sm text-center">
              A delicious way to experience Web3 • Built with ❤️ and ☕
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
          animation-fill-mode: both;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out;
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.6s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </main>
  )
}