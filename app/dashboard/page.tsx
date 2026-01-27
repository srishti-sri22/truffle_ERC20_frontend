"use client";

import { useState, useEffect } from "react";
import { useTokenStore } from "@/lib/store";
import { TokenContract, FaucetContract } from "@/lib/contract-interactions";
import {
    TokenMetricsCard,
    TransferTokenCard,
    ApproveTokenCard,
    BurnTokenCard,
    MintTokenCard,
    BurnFromTokenCard
} from "@/components/cards/dashboard-cards";
import Link from "next/link";

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

            const [balance, totalSupply, tokenInfo] = await Promise.all([
                TokenContract.getBalance(userAddress),
                TokenContract.getTotalSupply(),
                TokenContract.getTokenInfo()
            ]);

            setBalance(balance);
            setTotalSupply(totalSupply);
            setTokenInfo(tokenInfo.name, tokenInfo.symbol);

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
            <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsIDE5MSwgMzYsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>

                <div className="relative text-center animate-fade-in-up">
                    <div className="mb-6 inline-block p-6 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 shadow-xl animate-bounce-slow">
                        <span className="text-6xl">🔒</span>
                    </div>
                    <h1 className="text-4xl font-bold text-amber-900 mb-4">Wallet Not Connected</h1>
                    <p className="text-lg text-amber-600 mb-8 max-w-md mx-auto">
                        Please connect your wallet to access the dashboard and manage your tokens
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="group px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                        <span className="flex items-center gap-2">
                            ← Go to Home
                        </span>
                    </button>
                </div>

                <style jsx>{`
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
                    @keyframes bounce-slow {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                    .animate-fade-in-up {
                        animation: fade-in-up 0.6s ease-out;
                    }
                    .animate-bounce-slow {
                        animation: bounce-slow 3s ease-in-out infinite;
                    }
                `}</style>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsIDE5MSwgMzYsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>

                <div className="relative text-center">
                    <div className="mb-6 inline-block">
                        <div className="w-16 h-16 border-4 border-amber-300 border-t-amber-700 rounded-full animate-spin"></div>
                    </div>
                    <div className="text-xl font-semibold text-amber-700 animate-pulse">Loading dashboard...</div>
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
                                    Dashboard
                                </h1>
                                <p className="text-amber-600 text-sm mt-1">Manage your tokens and transactions</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-200 shadow-md">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow"></div>
                                <span className="text-amber-800 font-medium font-mono text-sm">
                                    {formatAddress(userAddress)}
                                </span>
                            </div>
                            <Link href="/" className="px-5 py-2.5 rounded-xl bg-white border-2 border-amber-300 text-amber-700 font-medium hover:bg-amber-50 hover:shadow-lg hover:scale-105 transition-all duration-300">
                                ← Home
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-1 animate-slide-in-left">
                        <TokenMetricsCard />
                    </div>

                    <div className="lg:col-span-2 animate-slide-in-right">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                                <TransferTokenCard />
                            </div>
                            <div className="animate-fade-in-up" style={{ animationDelay: '20ms' }}>
                                <ApproveTokenCard />
                            </div>
                            <div className="animate-fade-in-up" style={{ animationDelay: '30ms' }}>
                                <BurnTokenCard />
                            </div>
                            <div className="animate-fade-in-up" style={{ animationDelay: '30ms' }}>
                                <BurnFromTokenCard />
                            </div>
                            <div className="animate-fade-in-up" style={{ animationDelay: '40ms' }}>
                                <MintTokenCard />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-amber-100 hover:shadow-xl hover:border-amber-300 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 shadow-md">
                            <span className="text-2xl">ℹ️</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-amber-900 mb-2">About Token Operations</h3>
                            <p className="text-amber-600 leading-relaxed">
                                This dashboard allows you to interact with the Truffle Token smart contract.
                                You can transfer tokens to other addresses, approve spending allowances,
                                burn tokens to reduce supply, and mint new tokens (owner only).
                            </p>
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
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
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
                .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </main>
    );
}