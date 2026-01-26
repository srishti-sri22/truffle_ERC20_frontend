"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import { useTokenStore } from "@/lib/store";
import { FAUCET_ADDRESS, faucetAbi, getProvider } from "@/lib/contracts";

export default function FaucetPage() {
  const { 
    userAddress, 
    isConnected,
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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  // Load faucet data
  useEffect(() => {
    if (isConnected && userAddress) {
      loadFaucetData();
      
      // Set up interval to update countdown
      const interval = setInterval(() => {
        updateClaimStatus();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected, userAddress]);

  const loadFaucetData = async () => {
    try {
      const provider = getProvider();
      const faucetContract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, provider);
      
      // Load faucet info
      const [balance, amount, cooldownSecs] = await Promise.all([
        faucetContract.faucetBalance(),
        faucetContract.claimAmount(),
        faucetContract.cooldown()
      ]);

      // Convert from wei (assuming 18 decimals)
      const formattedBalance = ethers.formatUnits(balance, 18);
      const formattedAmount = ethers.formatUnits(amount, 18);

      // Load user's last claim time
      let lastClaimTimestamp = 0;
      try {
        const lastClaim = await faucetContract.lastClaim(userAddress);
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
    if (!isConnected || !userAddress) {
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

      // Estimate gas
      const gasEstimate = await faucet.claim.estimateGas();
      
      // Send transaction
      const tx = await faucet.claim();
      
      setTxHash(tx.hash);
      setSuccess("Transaction submitted! Waiting for confirmation...");

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setSuccess(`Success! ${faucetClaimAmount} tokens claimed!`);
        
        // Refresh faucet data
        setTimeout(() => {
          loadFaucetData();
        }, 2000);
      } else {
        setError("Transaction failed");
      }
    } catch (err: any) {
      console.error("Claim error:", err);
      
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
            <p className="text-amber-600 mb-8">Please connect your wallet to access the faucet</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow text-center">
                Go to Home
              </Link>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-white border-2 border-amber-200 text-amber-700 font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                
                <h1 className="text-3xl font-bold text-amber-900">Token Faucet</h1>
              </div>
              <p className="text-amber-600">Claim free test tokens every 24 hours</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-lg bg-amber-100 border border-amber-200">
                  <span className="text-amber-700 font-medium">
                    {formatAddress(userAddress)}
                  </span>
                </div>
                <Link
                  href="/"
                  className="px-4 py-2 rounded-lg bg-white border border-amber-300 text-amber-700 font-medium hover:bg-amber-50 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Claim Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden">
              <div className="p-6 border-b border-amber-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100">
                    <span className="text-amber-700 text-xl">💧</span>
                  </div>
                  <h3 className="text-xl font-bold text-amber-900">Claim Tokens</h3>
                </div>
                <p className="text-amber-600 text-sm">Get your free test tokens from the faucet</p>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-8">
                  <div className="text-4xl font-bold text-amber-700 mb-2">
                    {faucetClaimAmount} Tokens
                  </div>
                  <p className="text-amber-600">Available per claim</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <div className="text-sm text-amber-600 mb-1">Status</div>
                      <div className={`font-semibold ${canClaim ? 'text-green-600' : 'text-amber-600'}`}>
                        {canClaim ? "Ready to Claim" : "On Cooldown"}
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <div className="text-sm text-amber-600 mb-1">Next Claim In</div>
                      <div className="font-semibold text-amber-700">{timeRemaining}</div>
                    </div>
                  </div>

                  <button
                    onClick={claim}
                    disabled={isLoading || !canClaim}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg rounded-lg hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : canClaim ? (
                      <>
                        <span>💧</span>
                        Claim {faucetClaimAmount} Tokens
                      </>
                    ) : (
                      "On Cooldown"
                    )}
                  </button>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700">
                        <span>⚠️</span>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <span>✅</span>
                        <span>{success}</span>
                      </div>
                    </div>
                  )}

                  {txHash && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-600 mb-1">Transaction Hash:</div>
                      <div className="font-mono text-sm break-all">{txHash}</div>
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        View on Etherscan →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info Column */}
          <div className="space-y-6">
            {/* Faucet Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Faucet Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-amber-600">Faucet Balance</span>
                  <span className="font-bold text-amber-700">{faucetBalance} Tokens</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-600">Claim Amount</span>
                  <span className="font-semibold text-amber-900">{faucetClaimAmount} Tokens</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-600">Cooldown Period</span>
                  <span className="font-semibold text-amber-900">{Math.floor(cooldownPeriod / 3600)} hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-600">Claims Remaining</span>
                  <span className="font-semibold text-amber-900">
                    {Math.floor(parseFloat(faucetBalance) / parseFloat(faucetClaimAmount))}
                  </span>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">How it Works</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-amber-100 mt-0.5">
                    <span className="text-amber-700 text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-900">Connect Wallet</h4>
                    <p className="text-sm text-amber-600">Make sure your wallet is connected</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-amber-100 mt-0.5">
                    <span className="text-amber-700 text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-900">Check Cooldown</h4>
                    <p className="text-sm text-amber-600">Wait 24 hours between claims</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-amber-100 mt-0.5">
                    <span className="text-amber-700 text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-900">Claim Tokens</h4>
                    <p className="text-sm text-amber-600">Get {faucetClaimAmount} tokens per claim</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-amber-100">
                <p className="text-sm text-amber-500">
                  <span className="font-medium">Note:</span> These are test tokens for development purposes only.
                  They have no monetary value.
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link 
                  href="/dashboard" 
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100 hover:border-amber-300 transition-colors"
                >
                  <span className="text-amber-700 font-medium">📊 Dashboard</span>
                  <span className="text-amber-500">→</span>
                </Link>
                <button 
                  onClick={loadFaucetData}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100 hover:border-amber-300 transition-colors"
                >
                  <span className="text-amber-700 font-medium">🔄 Refresh Data</span>
                  <span className="text-amber-500">↻</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History Placeholder */}
        <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">Recent Claims</h3>
          <div className="text-center py-8">
            <p className="text-amber-500">No recent claims found</p>
            <p className="text-sm text-amber-400 mt-2">Your claim history will appear here</p>
          </div>
        </div>
      </div>
    </main>
  );
}