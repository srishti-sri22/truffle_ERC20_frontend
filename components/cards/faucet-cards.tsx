"use client";

import { useState } from "react";
import { useTokenStore } from "@/lib/store";
import { FaucetContract } from "@/lib/contract-interactions";
import { Card } from "./dashboard-cards";

export const ClaimFaucetCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const { 
    faucetClaimAmount, 
    lastClaimTime, 
    cooldownPeriod, 
    userAddress,
    setFaucetInfo,
    setTxHash: setStoreTxHash,
    setIsLoading: setStoreIsLoading,
    setError: setStoreError,
    setSuccess: setStoreSuccess,
    setCanClaim,
    setTimeRemaining
  } = useTokenStore();

  const canClaim = () => {
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
    if (!userAddress) {
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
      
      // Update store with new last claim time
      const currentTime = Math.floor(Date.now() / 1000);
      setFaucetInfo(faucetClaimAmount, faucetBalance, currentTime, cooldownPeriod);
      
      // Update claim status
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
    if (!userAddress) return;
    
    try {
      const [claimAmount, faucetBalance, cooldown, lastClaimTime] = await Promise.all([
        FaucetContract.getClaimAmount(),
        FaucetContract.getFaucetBalance(),
        FaucetContract.getCooldown(),
        FaucetContract.getLastClaim(userAddress)
      ]);
      
      setFaucetInfo(claimAmount, faucetBalance, lastClaimTime, cooldown);
      setSuccess("Faucet data refreshed!");
    } catch (error) {
      console.error("Error refreshing faucet data:", error);
      setError("Failed to refresh faucet data");
    }
  };

  const { faucetBalance } = useTokenStore();

  return (
    <Card
      title="Claim from Faucet"
      description="Get free test tokens every 24 hours"
      icon="💧"
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-amber-700 mb-2">
            {faucetClaimAmount} Tokens
          </div>
          <p className="text-amber-600">Available per claim</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-amber-600">Status</span>
            <span className={`font-semibold ${canClaim() ? 'text-green-600' : 'text-amber-600'}`}>
              {canClaim() ? "Ready to Claim" : "On Cooldown"}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-amber-600">Next Claim</span>
            <span className="font-semibold text-amber-700">{timeUntilNextClaim()}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <span>⚠️</span>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <span>✅</span>
              <span className="text-sm">{success}</span>
            </div>
          </div>
        )}

        {txHash && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs text-blue-600 mb-1">Transaction Hash:</div>
            <div className="font-mono text-xs break-all">{txHash.slice(0, 32)}...</div>
            <a 
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 text-xs text-blue-600 hover:text-blue-700"
            >
              View on Etherscan →
            </a>
          </div>
        )}

        <button
          onClick={handleClaim}
          disabled={isLoading || !canClaim()}
          className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : canClaim() ? (
            <>
              <span>💧</span>
              Claim {faucetClaimAmount} Tokens
            </>
          ) : (
            "On Cooldown"
          )}
        </button>

        <button
          onClick={refreshFaucetData}
          className="w-full py-2 bg-amber-50 text-amber-700 font-medium rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </Card>
  );
};

export const FaucetMetricsCard = () => {
  const { faucetBalance, faucetClaimAmount, cooldownPeriod, userAddress } = useTokenStore();
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
    if (!userAddress) return;
    
    setIsRefreshing(true);
    try {
      // This would be implemented in the FaucetContract class
      // For now, we'll simulate the refresh
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
        <div className="flex justify-between items-center">
          <span className="text-amber-600">Faucet Balance</span>
          <span className="font-bold text-lg text-amber-700">
            {parseFloat(faucetBalance).toLocaleString()} Tokens
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-amber-600">Claim Amount</span>
          <span className="font-semibold text-amber-900">
            {parseFloat(faucetClaimAmount).toLocaleString()} Tokens
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-amber-600">Cooldown Period</span>
          <span className="font-semibold text-amber-900">{formatTime(cooldownPeriod)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-amber-600">Claims Remaining</span>
          <span className="font-semibold text-amber-900">
            {calculateClaimsRemaining()}
          </span>
        </div>
        
        <div className="pt-4">
          <button
            onClick={refreshFaucetData}
            disabled={isRefreshing}
            className="w-full py-2 bg-amber-50 text-amber-700 font-medium rounded-lg border border-amber-200 hover:bg-amber-100 disabled:opacity-50 transition-colors"
          >
            {isRefreshing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-700"></div>
                Refreshing...
              </div>
            ) : "Refresh Metrics"}
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

  return (
    <Card
      title="How it Works"
      description="Learn about our token faucet"
      icon="ℹ️"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-1 rounded bg-amber-100 mt-0.5">
            <span className="text-amber-700 text-sm">1</span>
          </div>
          <div>
            <h4 className="font-medium text-amber-900">Connect Wallet</h4>
            <p className="text-sm text-amber-600">Make sure your Web3 wallet is connected</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="p-1 rounded bg-amber-100 mt-0.5">
            <span className="text-amber-700 text-sm">2</span>
          </div>
          <div>
            <h4 className="font-medium text-amber-900">Check Cooldown</h4>
            <p className="text-sm text-amber-600">
              Wait {formatCooldown(cooldownPeriod)} between claims
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="p-1 rounded bg-amber-100 mt-0.5">
            <span className="text-amber-700 text-sm">3</span>
          </div>
          <div>
            <h4 className="font-medium text-amber-900">Claim Tokens</h4>
            <p className="text-sm text-amber-600">
              Get {faucetClaimAmount} tokens per claim
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="p-1 rounded bg-amber-100 mt-0.5">
            <span className="text-amber-700 text-sm">4</span>
          </div>
          <div>
            <h4 className="font-medium text-amber-900">Use Tokens</h4>
            <p className="text-sm text-amber-600">Test dApps, transfer, or manage in dashboard</p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-amber-100">
          <h4 className="font-medium text-amber-900 mb-2">Important Notes</h4>
          <ul className="text-sm text-amber-500 space-y-1">
            <li>• These are test tokens for development only</li>
            <li>• Tokens have no monetary value</li>
            <li>• Use on Sepolia testnet only</li>
            <li>• Keep your wallet secure</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};