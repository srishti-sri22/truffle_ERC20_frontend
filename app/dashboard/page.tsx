"use client";

import { useState, useEffect } from "react";
import { useTokenStore } from "@/lib/store";
import { TokenContract, FaucetContract } from "@/lib/contract-interactions";
import {
    TokenMetricsCard,
    TransferTokenCard,
    ApproveTokenCard,
    BurnTokenCard,
    MintTokenCard
} from "@/components/cards/dashboard-cards";

export default function Dashboard() {
    const {
        userAddress,
        isConnected,
        setBalance,
        setTotalSupply,
        setTokenInfo,
        setFaucetInfo
    } = useTokenStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isConnected && userAddress) {
            loadContractData();
        }
    }, [isConnected, userAddress]);

    const loadContractData = async () => {
        try {
            setIsLoading(true);

            // Load token data
            const [balance, totalSupply, tokenInfo] = await Promise.all([
                TokenContract.getBalance(userAddress),
                TokenContract.getTotalSupply(),
                TokenContract.getTokenInfo()
            ]);

            setBalance(balance);
            setTotalSupply(totalSupply);
            setTokenInfo(tokenInfo.name, tokenInfo.symbol);

            // Load faucet data
            const [claimAmount, faucetBalance, cooldown, lastClaimTime] = await Promise.all([
                FaucetContract.getClaimAmount(),
                FaucetContract.getFaucetBalance(),
                FaucetContract.getCooldown(),
                FaucetContract.getLastClaim(userAddress)
            ]);

            setFaucetInfo(claimAmount, faucetBalance, lastClaimTime, cooldown);

        } catch (error) {
            console.error("Error loading contract data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };
    if (!isConnected) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-amber-900 mb-4">Wallet Not Connected</h1>
                        <p className="text-amber-600 mb-8">Please connect your wallet to access the dashboard</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="animate-pulse text-amber-600">Loading dashboard...</div>
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

                                <h1 className="text-3xl font-bold text-amber-900">Dashboard</h1>
                            </div>
                            <p className="text-amber-600">Manage your tokens and transactions</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <div className="flex items-center gap-3">
                                <div className="px-4 py-2 rounded-lg bg-amber-100 border border-amber-200">
                                    <span className="text-amber-700 font-medium">
                                        {formatAddress(userAddress)}
                                    </span>
                                </div>
                                <a
                                    href="/"
                                    className="px-4 py-2 rounded-lg bg-white border border-amber-300 text-amber-700 font-medium hover:bg-amber-50 transition-colors"
                                >
                                    Back to Home
                                </a>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Metrics */}
                    <div className="lg:col-span-1">
                        <TokenMetricsCard />
                    </div>

                    {/* Right Column - Operations */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TransferTokenCard />
                            <ApproveTokenCard />
                            <BurnTokenCard />
                            <MintTokenCard />
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-8 p-6 bg-white rounded-xl shadow-md border border-amber-100">
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">About Token Operations</h3>
                    <p className="text-amber-600 text-sm">
                        This dashboard allows you to interact with the Truffle Token smart contract.
                        You can transfer tokens to other addresses, approve spending allowances,
                        burn tokens to reduce supply, and mint new tokens (owner only).
                    </p>
                </div>
            </div>
        </main>
    );
}