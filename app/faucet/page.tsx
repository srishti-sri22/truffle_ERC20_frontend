"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useTokenStore } from "@/lib/store";
import { FAUCET_ADDRESS, faucetAbi, getProvider } from "@/lib/contracts";

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  
  const {
    faucetBalance,
    faucetClaimAmount,
    lastClaimTime,
    cooldownPeriod,
    txHash,
    isLoading,
    error,
    success,
    canClaim,
    timeRemaining,
    setFaucetInfo,
    setTxHash,
    setIsLoading,
    setError,
    setSuccess,
    setCanClaim,
    setTimeRemaining
  } = useTokenStore();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Now";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  useEffect(() => {
    if (isConnected && address) {
      loadFaucetData();

      const interval = setInterval(() => {
        updateClaimStatus();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isConnected, address]);

  const loadFaucetData = async () => {
    if (!address) return;
    
    try {
      const provider = getProvider();
      const faucetContract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, provider);

      const [balance, amount, cooldownSecs] = await Promise.all([
        faucetContract.faucetBalance(),
        faucetContract.claimAmount(),
        faucetContract.cooldown()
      ]);

      const formattedBalance = ethers.formatUnits(balance, 18);
      const formattedAmount = ethers.formatUnits(amount, 18);

      let lastClaimTimestamp = 0;
      try {
        const lastClaim = await faucetContract.lastClaim(address);
        lastClaimTimestamp = Number(lastClaim);
      } catch (err) {
        console.log("No previous claim found");
      }

      setFaucetInfo(formattedAmount, formattedBalance, lastClaimTimestamp, Number(cooldownSecs));
      updateClaimStatus(lastClaimTimestamp, Number(cooldownSecs));

    } catch (err) {
      console.error("Error loading faucet data:", err);
      setError("Failed to load faucet data");
    }
  };

  const updateClaimStatus = (customLastClaim?: number, customCooldown?: number) => {
    const currentLastClaim = customLastClaim !== undefined ? customLastClaim : lastClaimTime;
    const currentCooldown = customCooldown !== undefined ? customCooldown : cooldownPeriod;

    const currentTime = Math.floor(Date.now() / 1000);

    if (currentLastClaim === 0) {
      setCanClaim(true);
      setTimeRemaining("Now");
      return;
    }

    const nextClaimTime = currentLastClaim + currentCooldown;
    const timeLeft = nextClaimTime - currentTime;

    if (timeLeft <= 0) {
      setCanClaim(true);
      setTimeRemaining("Now");
    } else {
      setCanClaim(false);
      setTimeRemaining(formatTime(timeLeft));
    }
  };

  async function claim() {
    if (!isConnected || !address) {
      setError("Please connect your wallet first");
      return;
    }

    if (!canClaim) {
      setError(`Please wait ${timeRemaining} before claiming again`);
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);

      const provider = getProvider();
      const signer = await provider.getSigner();
      const faucet = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, signer);

      const gasEstimate = await faucet.claim.estimateGas();

      const tx = await faucet.claim();

      setTxHash(tx.hash);
      setSuccess("Transaction submitted! Waiting for confirmation...");

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setSuccess(`Success! ${faucetClaimAmount} tokens claimed!`);

        setTimeout(() => {
          loadFaucetData();
        }, 2000);
      } else {
        setError("Transaction failed");
      }
    } catch (err: any) {
      console.error("Claim error:", err);

      if (err.message?.includes("execution reverted (unknown custom error)") ||
        err.message?.includes("unknown custom error")) {

        if (err.data && err.data !== "0x") {
          try {
            const errorSelector = err.data.slice(0, 10); 
            setError("Already Claimed , not allowed.");
          } catch (decodeError) {
            return "Contract reverted with an unknown custom error. Check contract requirements.";
          }
        }

        return "Transaction failed: Contract reverted with an unknown error.";
      }
      if (err.code == 4002)
        setError("Already Claimed , not allowed.")
      if (err.code === 4001) {
        setError("Transaction rejected by user");
      } else if (err.message?.includes("CooldownActive")) {
        setError("Cooldown period is still active");
      } else if (err.message?.includes("InsufficientFaucetBalance")) {
        setError("Faucet balance is too low");
      } else {
        setError(err.message || "Failed to claim tokens");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-amber-900 mb-4">Wallet Not Connected</h1>
            <p className="text-amber-600 mb-8">Please connect your wallet using the navbar above to access the faucet</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow text-center">
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsIDE5MSwgMzYsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <span className="text-3xl">🍪</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-800 to-amber-950 bg-clip-text text-transparent">
                  Token Faucet
                </h1>
                <p className="text-amber-600 text-sm mt-1">Claim free test tokens every 24 hours</p>
              </div>
            </div>
            
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 animate-slide-in-left">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-amber-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 shadow-md">
                    <span className="text-white text-2xl">🍩</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-amber-900">Claim Tokens</h3>
                    <p className="text-amber-600 text-sm">Get your free test tokens from the faucet</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="text-center mb-8 animate-bounce-slow">
                  <div className="inline-block p-6 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 mb-4 shadow-lg">
                    <div className="text-5xl font-black bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
                      {faucetClaimAmount}
                    </div>
                  </div>
                  <p className="text-lg text-amber-600 font-medium">Tokens Available per Claim</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`group p-5 rounded-xl border-2 transition-all duration-300 ${canClaim
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300 hover:shadow-lg'
                        : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300 hover:shadow-lg'
                      }`}>
                      <div className="text-sm text-amber-600 mb-2 font-medium">Status</div>
                      <div className={`font-bold text-lg flex items-center gap-2 ${canClaim ? 'text-green-600' : 'text-amber-600'}`}>
                        <span className={`text-2xl ${canClaim ? 'animate-bounce' : ''}`}>
                          {canClaim ? "✅" : "⏳"}
                        </span>
                        {canClaim ? "Ready to Claim" : "On Cooldown"}
                      </div>
                    </div>

                    <div className="group p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300">
                      <div className="text-sm text-amber-600 mb-2 font-medium">Next Claim In</div>
                      <div className="font-bold text-lg text-amber-700 flex items-center gap-2">
                        <span className="text-2xl">⏰</span>
                        {timeRemaining}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={claim}
                    disabled={isLoading || !canClaim}
                    className="group relative w-full py-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : canClaim ? (
                        <>
                          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">💧</span>
                          Claim {faucetClaimAmount} Tokens
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">⏳</span>
                          On Cooldown
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  {error && (
                    <div className="p-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl shadow-md animate-shake">
                      <div className="flex items-center gap-3 text-red-700">
                        <span className="text-2xl">⚠️</span>
                        <span className="font-medium">{error}</span>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-md animate-slide-in-up">
                      <div className="flex items-center gap-3 text-green-700">
                        <span className="text-2xl animate-bounce">✅</span>
                        <span className="font-medium">{success}</span>
                      </div>
                    </div>
                  )}

                  {txHash && (
                    <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl shadow-md animate-fade-in-up">
                      <div className="text-sm text-blue-600 mb-2 font-semibold">Transaction Hash:</div>
                      <div className="font-mono text-sm break-all text-blue-700 mb-3 bg-white/50 p-3 rounded-lg">{txHash}</div>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-md"
                      >
                        View on Etherscan
                        <span>→</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 animate-slide-in-right">
            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-amber-100 p-6 hover:shadow-xl hover:border-amber-300 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 shadow-md">
                  <span className="text-xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-amber-900">Faucet Stats</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Faucet Balance", value: `${faucetBalance} Tokens`, icon: "💰" },
                  { label: "Claim Amount", value: `${faucetClaimAmount} Tokens`, icon: "🎁" },
                  { label: "Cooldown Period", value: `${Math.floor(cooldownPeriod / 3600)} hours`, icon: "⏱️" },
                  { label: "Claims Remaining", value: Math.floor(parseFloat(faucetBalance) / parseFloat(faucetClaimAmount)), icon: "🎯" }
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors duration-300">
                    <span className="text-amber-600 font-medium flex items-center gap-2">
                      <span>{stat.icon}</span>
                      {stat.label}
                    </span>
                    <span className="font-bold text-amber-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-amber-100 p-6 hover:shadow-xl hover:border-amber-300 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-700 to-amber-800 shadow-md">
                  <span className="text-xl">📖</span>
                </div>
                <h3 className="text-xl font-bold text-amber-900">How it Works</h3>
              </div>
              <div className="space-y-4">
                {[
                  { num: "1", title: "Connect Wallet", desc: "Make sure your wallet is connected" },
                  { num: "2", title: "Check Cooldown", desc: "Wait 24 hours between claims" },
                  { num: "3", title: "Claim Tokens", desc: `Get ${faucetClaimAmount} tokens per claim` }
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 rounded-xl hover:bg-amber-50 transition-colors duration-300">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold shadow-md">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">{step.title}</h4>
                      <p className="text-sm text-amber-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t-2 border-amber-100">
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                  <span className="text-xl">ℹ️</span>
                  <p className="text-sm text-amber-600">
                    <span className="font-semibold text-amber-700">Note:</span> These are test tokens for development purposes only. They have no monetary value.
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl border-2 border-amber-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-white shadow-md">
                  <span className="text-xl">🔗</span>
                </div>
                <h3 className="text-xl font-bold text-amber-900">Quick Links</h3>
              </div>
              <div className="space-y-3">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-md hover:scale-105 transition-all duration-300"
                >
                  <span className="text-amber-800 font-semibold flex items-center gap-2">
                    <span>📊</span>
                    Dashboard
                  </span>
                  <span className="text-amber-500 text-xl">→</span>
                </Link>
                <button
                  onClick={loadFaucetData}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-md hover:scale-105 transition-all duration-300"
                >
                  <span className="text-amber-800 font-semibold flex items-center gap-2">
                    <span>🔄</span>
                    Refresh Data
                  </span>
                  <span className="text-amber-500 text-xl">↻</span>
                </button>
              </div>
            </div>
          </div>
        </div>

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
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
          animation-fill-mode: both;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
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
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </main>
  );
}