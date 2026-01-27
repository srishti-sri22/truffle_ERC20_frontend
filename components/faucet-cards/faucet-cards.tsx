"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useTokenStore } from "@/lib/store";
import { FaucetContract } from "@/lib/contract-interactions";
import { Card } from "../dashboard-cards/dashboard-cards";

export const ClaimFaucetCard = () => {
  const { address } = useAccount();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const { 
    faucetClaimAmount, 
    faucetBalance,
    lastClaimTime, 
    cooldownPeriod, 
    setFaucetInfo,
    setTxHash: setStoreTxHash,
    setIsLoading: setStoreIsLoading,
    setError: setStoreError,
    setSuccess: setStoreSuccess,
    setCanClaim,
    setTimeRemaining
  } = useTokenStore();

  const canClaim = () => {
    console.log(lastClaimTime);
    if (lastClaimTime === 0) return true;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= lastClaimTime + cooldownPeriod;
  };

  const timeUntilNextClaim = () => {
    if (lastClaimTime === 0) return "Now";
    
    const currentTime = Math.floor(Date.now() / 1000);
    const nextClaimTime = lastClaimTime + cooldownPeriod;
    const timeLeft = nextClaimTime - currentTime;
    
    if (timeLeft <= 0) return "Now";
    
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const handleClaim = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    if (!canClaim()) {
      setError(`Please wait ${timeUntilNextClaim()} before claiming again`);
      return;
    }

    setIsLoading(true);
    setStoreIsLoading(true);
    setError(null);
    setStoreError(null);
    setSuccess(null);
    setStoreSuccess(null);
    setTxHash(null);
    setStoreTxHash(null);
    
    try {
      const hash = await FaucetContract.claim();
      
      setTxHash(hash);
      setStoreTxHash(hash);
      setSuccess("Transaction submitted! Waiting for confirmation...");
      setStoreSuccess("Transaction submitted! Waiting for confirmation...");
      
      const currentTime = Math.floor(Date.now() / 1000);
      setFaucetInfo(faucetClaimAmount, faucetBalance, currentTime, cooldownPeriod);
      
      setCanClaim(false);
      setTimeRemaining(timeUntilNextClaim());
      
      setSuccess(`Successfully claimed ${faucetClaimAmount} tokens!`);
      setStoreSuccess(`Successfully claimed ${faucetClaimAmount} tokens!`);
      
    } catch (err: any) {
      const errorMsg = err.message || "Failed to claim tokens";
      setError(errorMsg);
      setStoreError(errorMsg);
    } finally {
      setIsLoading(false);
      setStoreIsLoading(false);
    }
  };

  const refreshFaucetData = async () => {
    if (!address) return;
    
    try {
      const [claimAmount, faucetBalance, cooldown, lastClaimTime] = await Promise.all([
        FaucetContract.getClaimAmount(),
        FaucetContract.getFaucetBalance(),
        FaucetContract.getCooldown(),
        FaucetContract.getLastClaim(address)
      ]);
      
      setFaucetInfo(claimAmount, faucetBalance, lastClaimTime, cooldown);
      setSuccess("Faucet data refreshed!");
    } catch (error) {
      console.error("Error refreshing faucet data:", error);
      setError("Failed to refresh faucet data");
    }
  };

  const claimStatus = canClaim();

  return (
    <Card
      title="Claim from Faucet"
      description="Get free test tokens every 24 hours"
      icon="🍪"
    >
      <div className="space-y-6">
        <div className="text-center animate-bounce-slow">
          <div className="inline-block p-5 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 mb-3 shadow-lg">
            <div className="text-4xl font-black bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
              {faucetClaimAmount}
            </div>
          </div>
          <p className="text-lg text-amber-600 font-medium">Tokens Available per Claim</p>
        </div>

        <div className="space-y-3">
          <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
            claimStatus 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md' 
              : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-amber-700 font-medium flex items-center gap-2">
                <span className={`text-xl ${claimStatus ? 'animate-bounce' : ''}`}>
                  {claimStatus ? "✅" : "⏳"}
                </span>
                Status
              </span>
              <span className={`font-bold ${claimStatus ? 'text-green-600' : 'text-amber-600'}`}>
                {claimStatus ? "Ready to Claim" : "On Cooldown"}
              </span>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 hover:border-amber-300 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-amber-700 font-medium flex items-center gap-2">
                <span className="text-xl">⏰</span>
                Next Claim
              </span>
              <span className="font-bold text-amber-700">{timeUntilNextClaim()}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl shadow-sm animate-shake">
            <div className="flex items-center gap-3 text-red-700">
              <span className="text-xl">⚠️</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm animate-slide-in-up">
            <div className="flex items-center gap-3 text-green-700">
              <span className="text-xl animate-bounce">✅</span>
              <span className="text-sm font-medium">{success}</span>
            </div>
          </div>
        )}

        {txHash && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl shadow-sm animate-fade-in">
            <div className="text-xs text-blue-600 mb-2 font-semibold">Transaction Hash:</div>
            <div className="font-mono text-xs break-all text-blue-700 mb-2 bg-white/50 p-2 rounded-lg">{txHash.slice(0, 32)}...</div>
            <a 
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              View on Etherscan →
            </a>
          </div>
        )}

        <button
          onClick={handleClaim}
          disabled={isLoading || !claimStatus}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : claimStatus ? (
            <span className="flex items-center justify-center gap-2">
              <span className="text-2xl">💧</span>
              Claim {faucetClaimAmount} Tokens
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="text-2xl">⏳</span>
              On Cooldown
            </span>
          )}
        </button>

        <button
          onClick={refreshFaucetData}
          className="w-full py-3 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 font-semibold rounded-xl border-2 border-amber-200 hover:bg-amber-100 hover:border-amber-300 hover:shadow-md transition-all duration-300"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-lg">🔄</span>
            Refresh Data
          </span>
        </button>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
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
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.6s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </Card>
  );
};

export const FaucetMetricsCard = () => {
  const { address } = useAccount();
  const { faucetBalance, faucetClaimAmount, cooldownPeriod } = useTokenStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const calculateClaimsRemaining = () => {
    try {
      const balance = parseFloat(faucetBalance);
      const claimAmount = parseFloat(faucetClaimAmount);
      
      if (isNaN(balance) || isNaN(claimAmount) || claimAmount === 0) {
        return "0";
      }
      
      const remaining = Math.floor(balance / claimAmount);
      return Math.max(0, remaining).toString();
    } catch (error) {
      return "0";
    }
  };

  const refreshFaucetData = async () => {
    if (!address) return;
    
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card
      title="Faucet Metrics"
      description="Faucet statistics and information"
      icon="📈"
    >
      <div className="space-y-4">
        {[
          { label: "Faucet Balance", value: `${parseFloat(faucetBalance).toLocaleString()} Tokens`, icon: "💰", highlight: true },
          { label: "Claim Amount", value: `${parseFloat(faucetClaimAmount).toLocaleString()} Tokens`, icon: "💧" },
          { label: "Cooldown Period", value: formatTime(cooldownPeriod), icon: "⏱️" },
          { label: "Claims Remaining", value: calculateClaimsRemaining(), icon: "🎯" }
        ].map((metric, idx) => (
          <div 
            key={idx}
            className={`p-4 rounded-xl transition-all duration-300 ${
              metric.highlight
                ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 shadow-md'
                : 'bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-amber-700 font-medium flex items-center gap-2">
                <span className="text-lg">{metric.icon}</span>
                {metric.label}
              </span>
              <span className={`font-bold ${metric.highlight ? 'text-lg text-amber-900' : 'text-amber-900'}`}>
                {metric.value}
              </span>
            </div>
          </div>
        ))}
        
        <div className="pt-2">
          <button
            onClick={refreshFaucetData}
            disabled={isRefreshing}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
          >
            {isRefreshing ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </div>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="text-lg">🔄</span>
                Refresh Metrics
              </span>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};

export const FaucetInfoCard = () => {
  const { faucetClaimAmount, cooldownPeriod } = useTokenStore();

  const formatCooldown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hours`;
  };

  const steps = [
    { 
      num: "1", 
      title: "Connect Wallet", 
      desc: "Make sure your Web3 wallet is connected",
      icon: "🔗"
    },
    { 
      num: "2", 
      title: "Check Cooldown", 
      desc: `Wait ${formatCooldown(cooldownPeriod)} between claims`,
      icon: "⏰"
    },
    { 
      num: "3", 
      title: "Claim Tokens", 
      desc: `Get ${faucetClaimAmount} tokens per claim`,
      icon: "🍪"
    },
    { 
      num: "4", 
      title: "Use Tokens", 
      desc: "Test dApps, transfer, or manage in dashboard",
      icon: "🚀"
    }
  ];

  return (
    <Card
      title="How it Works"
      description="Learn about our token faucet"
      icon="📖"
    >
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div 
            key={idx}
            className="flex items-start gap-4 p-3 rounded-xl hover:bg-amber-50 transition-all duration-300 group"
          >
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold shadow-md group-hover:scale-110 transition-transform duration-300">
              {step.num}
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{step.icon}</span>
                <h4 className="font-semibold text-amber-900">{step.title}</h4>
              </div>
              <p className="text-sm text-amber-600">{step.desc}</p>
            </div>
          </div>
        ))}
        
        <div className="pt-4 mt-4 border-t-2 border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚠️</span>
            <h4 className="font-semibold text-amber-900">Important Notes</h4>
          </div>
          <div className="space-y-2">
            {[
              "These are test tokens for development only",
              "Tokens have no monetary value",
              "Use on Sepolia testnet only",
              "Keep your wallet secure"
            ].map((note, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-amber-600">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};