"use client";

import { useState } from "react";
import Link from "next/link";
import { useTokenStore } from "@/lib/store";
import { getProvider } from "@/lib/contracts";

export default function Home() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { userAddress, isConnected, setUserAddress, setConnected, resetState } = useTokenStore();

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const provider = getProvider();
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        setUserAddress(accounts[0]);
        setConnected(true);
      }
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    resetState();
    setConnected(false);
    // You might also want to notify the user
    console.log("Wallet disconnected");
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Connect/Disconnect Button */}
        <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800">
                  <div className="text-white text-2xl">💧</div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-amber-900">Truffle Token Faucet</h1>
                  <p className="text-amber-700">Sweet tokens, always flowing</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isConnected ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="px-4 py-2 rounded-lg bg-amber-100 border border-amber-200">
                      <span className="text-amber-700 font-medium">
                        {formatAddress(userAddress)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDisconnect}
                      className="px-4 py-2 rounded-lg bg-white border border-amber-300 text-amber-700 font-medium hover:bg-amber-50 transition-colors"
                    >
                      Disconnect
                    </button>
                    
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mb-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 font-semibold mb-6">
              <span>✨</span>
              <span>Just Launched</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-amber-900 mb-6">
              Get Your Test Tokens
              <span className="block text-3xl md:text-5xl text-amber-700">Sweet & Fast</span>
            </h1>
            
            <p className="text-xl text-amber-600 mb-10">
              {isConnected 
                ? "Your wallet is connected! Start claiming tokens or manage your dashboard."
                : "Connect your wallet to start claiming test tokens, manage your balance, and explore the chocolatey world of blockchain tokens."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet to Start"}
                </button>
              ) : (
                <>
                  <Link href="/faucet">
                    <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2">
                      <span>💧</span>
                      Go to Faucet
                      <span>→</span>
                    </button>
                  </Link>
                  
                  <Link href="/dashboard">
                    <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border-2 border-amber-200 text-amber-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2">
                      <span>📊</span>
                      Go to Dashboard
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-md border border-amber-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-100">
                <span className="text-amber-700">💰</span>
              </div>
              <div className="text-2xl font-bold text-amber-900">ERC-20</div>
            </div>
            <div className="text-amber-600 text-sm">Token Standard</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-amber-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-100">
                <span className="text-amber-700">⚡</span>
              </div>
              <div className="text-2xl font-bold text-amber-900">Instant</div>
            </div>
            <div className="text-amber-600 text-sm">Token Claim</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-amber-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-100">
                <span className="text-amber-700">🔒</span>
              </div>
              <div className="text-2xl font-bold text-amber-900">Secure</div>
            </div>
            <div className="text-amber-600 text-sm">Transactions</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-amber-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-100">
                <span className="text-amber-700">🌐</span>
              </div>
              <div className="text-2xl font-bold text-amber-900">Web3</div>
            </div>
            <div className="text-amber-600 text-sm">Powered</div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="h-full p-8 rounded-2xl bg-amber-50 border-2 border-amber-100 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800">
                <span className="text-white text-xl">💧</span>
              </div>
              <h3 className="text-2xl font-bold text-amber-900">Claim Tokens</h3>
            </div>
            <p className="text-amber-600 mb-6">
              Get free test tokens from our faucet every 24 hours to test your dApps.
            </p>
            <div className={`text-sm ${isConnected ? 'text-green-600' : 'text-amber-500'}`}>
              {isConnected ? '✓ Wallet connected' : 'Requires: Connected wallet'}
            </div>
          </div>

          <div className="h-full p-8 rounded-2xl bg-amber-50 border-2 border-amber-100 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-800 to-amber-900">
                <span className="text-white text-xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-amber-900">Dashboard</h3>
            </div>
            <p className="text-amber-600 mb-6">
              Track your token balance, view metrics, and manage token operations.
            </p>
            <div className={`text-sm ${isConnected ? 'text-green-600' : 'text-amber-500'}`}>
              {isConnected ? '✓ Ready to use' : 'Features: Balance, Transfer, Burn, Mint'}
            </div>
          </div>

          <div className="h-full p-8 rounded-2xl bg-amber-50 border-2 border-amber-100 shadow-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-900 to-amber-950">
                <span className="text-white text-xl">⚙️</span>
              </div>
              <h3 className="text-2xl font-bold text-amber-900">Token Operations</h3>
            </div>
            <p className="text-amber-600 mb-6">
              Approve spending, transfer tokens, mint, burn, and manage allowances.
            </p>
            <div className="text-amber-500 text-sm">
              Full ERC-20 functionality
            </div>
          </div>
        </div>

        {/* Connection Status Bar */}
        {isConnected && (
          <div className="mb-8 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-700 font-medium">Wallet Connected</span>
                <span className="text-green-600 text-sm">{formatAddress(userAddress)}</span>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 text-sm rounded-lg bg-white border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-amber-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800">
                <span className="text-white">💧</span>
              </div>
              <span className="text-amber-700 font-semibold">Truffle Token Faucet</span>
            </div>
            <div className="text-amber-500 text-sm">
              A delicious way to experience Web3 • Built with ❤️ and ☕
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}