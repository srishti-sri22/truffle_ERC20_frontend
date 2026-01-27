"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useTokenStore } from "@/lib/store";
import { TokenContract } from "@/lib/contract-interactions";
import { getSigner } from "@/lib/contracts";

interface CardProps {
    title: string;
    description: string;
    icon: string;
    children: React.ReactNode;
}

export const Card = ({ title, description, icon, children }: CardProps) => {
    return (
        <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-amber-100 overflow-hidden hover:shadow-2xl hover:border-amber-300 transition-all duration-300">
            <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-100">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 shadow-md group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white text-xl">{icon}</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-amber-900">{title}</h3>
                        <p className="text-amber-600 text-sm mt-0.5">{description}</p>
                    </div>
                </div>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};


export const TokenMetricsCard = () => {
    const { address } = useAccount();

    const {
        balance,
        totalSupply,
        tokenName,
        tokenSymbol,
        allowance,
        setBalance,
        setTotalSupply,
        setTokenInfo,
        setOwner,
        setAllowance
    } = useTokenStore();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshError, setRefreshError] = useState<string | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

    const [spenderAddress, setSpenderAddress] = useState("");
    const [isFetchingAllowance, setIsFetchingAllowance] = useState(false);

    const refreshTokenData = async () => {
        if (!address) {
            setRefreshError("Please connect your wallet");
            return;
        }

        try {
            setIsRefreshing(true);
            setRefreshError(null);
            setSpenderAddress("");
            setAllowance("0");

            const [
                tokenInfo,
                totalSupplyData,
                ownerData,
                balanceData
            ] = await Promise.all([
                TokenContract.getTokenInfo(),
                TokenContract.getTotalSupply(),
                TokenContract.getOwner(),
                TokenContract.getBalance(address)
            ]);

            setTokenInfo(tokenInfo.name, tokenInfo.symbol);
            setTotalSupply(totalSupplyData);
            setOwner(ownerData);
            setBalance(balanceData);

            setLastRefreshed(
                new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                })
            );
        } catch (error: any) {
            setRefreshError(error.message || "Failed to refresh token data");
        } finally {
            setIsRefreshing(false);
        }
    };

    const fetchAllowance = async () => {
        if (!address || !spenderAddress) return;

        try {
            setIsFetchingAllowance(true);
            const value = await TokenContract.getAllowance(
                address,
                spenderAddress
            );
            setAllowance(value);
        } catch (error: any) {
            setRefreshError(error.message || "Failed to fetch allowance");
        } finally {
            setIsFetchingAllowance(false);
        }
    };

    useEffect(() => {
        if (address) refreshTokenData();
    }, [address]);

    return (
        <Card
            title="Token Metrics"
            description="Overview of your token statistics"
            icon="🥮"
        >
            <div className="space-y-4">

                {[
                    { label: "Token Name", value: tokenName || "—", icon: "🏷️" },
                    { label: "Symbol", value: tokenSymbol || "—", icon: "💎" },
                    { label: "Your Balance", value: `${balance} ${tokenSymbol}`, icon: "💰", highlight: true },
                    { label: "Total Supply", value: `${totalSupply} ${tokenSymbol}`, icon: "📦" }
                ].map((item, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center justify-between p-4 rounded-xl ${item.highlight
                            ? "bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300"
                            : "bg-amber-50"
                            }`}
                    >
                        <span className="flex items-center gap-2 text-amber-700 font-medium">
                            <span>{item.icon}</span>
                            {item.label}
                        </span>
                        <span className="font-bold text-amber-900">
                            {item.value}
                        </span>
                    </div>
                ))}

                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl space-y-3">
                    <div className="font-semibold text-amber-900 flex items-center gap-2">
                        <span>✅</span> Allowance
                    </div>

                    <input
                        type="text"
                        value={spenderAddress}
                        onChange={(e) => setSpenderAddress(e.target.value)}
                        placeholder="Spender address (0x...)"
                        className="w-full px-3 py-2 border-2 border-amber-200 rounded-lg text-black"
                    />

                    <button
                        onClick={fetchAllowance}
                        disabled={isFetchingAllowance || !spenderAddress}
                        className="w-full py-2 bg-amber-600 text-white font-semibold rounded-lg disabled:opacity-50"
                    >
                        {isFetchingAllowance ? "Fetching..." : "Get Allowance"}
                    </button>

                    <div className="text-center text-sm font-medium text-amber-900">
                        {spenderAddress
                            ? `${allowance} ${tokenSymbol}`
                            : "Enter a spender to fetch allowance"}
                    </div>
                </div>

                {refreshError && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
                        {refreshError}
                    </div>
                )}

                <div className="flex justify-between items-center pt-2">
                    {lastRefreshed && (
                        <span className="text-xs text-amber-600">
                            Last updated: {lastRefreshed}
                        </span>
                    )}
                    <button
                        onClick={refreshTokenData}
                        disabled={isRefreshing}
                        className="px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold disabled:opacity-50"
                    >
                        {isRefreshing ? "Refreshing..." : "Refresh Token"}
                    </button>
                </div>
            </div>
        </Card>
    );
};




export const TransferTokenCard = () => {
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const { tokenSymbol } = useTokenStore();

    const handleTransfer = async () => {
        if (!toAddress || !amount) {
            setError("Please fill in all fields");
            return;
        }

        if (!toAddress.startsWith("0x") || toAddress.length !== 42) {
            setError("Please enter a valid Ethereum address");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const hash = await TokenContract.transfer(toAddress, amount);
            setTxHash(hash);
            setSuccess(`Successfully transferred ${amount} ${tokenSymbol}`);
            setToAddress("");
            setAmount("");
        } catch (err: any) {
            setError(err.message || "Transfer failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            title="Transfer Tokens"
            description="Send tokens to another address"
            icon="🍩"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <span>📬</span>
                        Recipient Address
                    </label>
                    <input
                        type="text"
                        value={toAddress}
                        onChange={(e) => {
                            setToAddress(e.target.value);
                            setError(null);
                        }}
                        placeholder="0x..."
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black placeholder-amber-400 transition-all duration-300"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <span>💰</span>
                        Amount ({tokenSymbol})
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            setError(null);
                        }}
                        placeholder="0.00"
                        min="0"
                        step="0.001"
                        className="w-full px-4 py-3 border-2 border-amber-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-amber-400 transition-all duration-300"
                    />
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
                    onClick={handleTransfer}
                    disabled={isLoading || !toAddress || !amount}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </div>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span className="text-xl">🚀</span>
                            Transfer Tokens
                        </span>
                    )}
                </button>
            </div>
        </Card>
    );
};


export const TransferFromTokenCard = () => {
    const [fromAddress, setFromAddress] = useState("");
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const { tokenSymbol } = useTokenStore();

    const handleTransferFrom = async () => {
        if (!fromAddress || !toAddress || !amount) {
            setError("Please fill in all fields");
            return;
        }

        const isValidAddress = (addr: string) =>
            addr.startsWith("0x") && addr.length === 42;

        if (!isValidAddress(fromAddress) || !isValidAddress(toAddress)) {
            setError("Please enter valid Ethereum addresses");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (!fromAddress || !toAddress || !amount) throw new Error("Fill all fields");

            const hash = await TokenContract.transferFrom(fromAddress, toAddress, amount);

            setTxHash(hash);
            setSuccess(`Successfully transferred ${amount} tokens from ${fromAddress.slice(
                0,
                6
            )} to ${toAddress.slice(
                0,
                6
            )}`);

            setFromAddress("");
            setToAddress("");
            setAmount("");
        } catch (err: any) {
            setError(err.message || "TransferFrom failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            title="Transfer From (Allowance)"
            description="Spend tokens using approved allowance"
            icon="🧾"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <span>👤</span>
                        From Address (Owner)
                    </label>
                    <input
                        type="text"
                        value={fromAddress}
                        onChange={(e) => {
                            setFromAddress(e.target.value);
                            setError(null);
                        }}
                        placeholder="0x..."
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black placeholder-amber-400 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <span>📬</span>
                        To Address (Recipient)
                    </label>
                    <input
                        type="text"
                        value={toAddress}
                        onChange={(e) => {
                            setToAddress(e.target.value);
                            setError(null);
                        }}
                        placeholder="0x..."
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black placeholder-amber-400 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <span>💰</span>
                        Amount ({tokenSymbol})
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            setError(null);
                        }}
                        placeholder="0.00"
                        min="0"
                        step="0.001"
                        className="w-full px-4 py-3 border-2 border-amber-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-amber-400 transition-all"
                    />
                </div>

                {error && (
                    <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 text-red-700">
                            <span className="text-xl">⚠️</span>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 text-green-700">
                            <span className="text-xl">✅</span>
                            <span className="text-sm font-medium">{success}</span>
                        </div>
                    </div>
                )}

                {txHash && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl shadow-sm">
                        <div className="text-xs text-blue-600 mb-2 font-semibold">
                            Transaction Hash:
                        </div>
                        <div className="font-mono text-xs break-all text-blue-700 mb-2 bg-white/50 p-2 rounded-lg">
                            {txHash.slice(0, 32)}...
                        </div>
                        <a
                            href={`https://sepolia.etherscan.io/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs text-blue-600 hover:underline"
                        >
                            View on Etherscan →
                        </a>
                    </div>
                )}

                <button
                    onClick={handleTransferFrom}
                    disabled={isLoading || !fromAddress || !toAddress || !amount}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <svg
                                className="animate-spin h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                            Processing...
                        </div>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span className="text-xl">🧾</span>
                            Transfer From
                        </span>
                    )}
                </button>
            </div>
        </Card>
    );
};



export const ApproveTokenCard = () => {
    const [spender, setSpender] = useState("");
    const [amount, setAmount] = useState("");

    const {
        tokenSymbol,
        isLoading,
        error,
        success,
        txHash,
        setIsLoading,
        setError,
        setSuccess,
        setTxHash,
        resetTxState,
        setAllowance
    } = useTokenStore();

    const handleApprove = async () => {
        resetTxState();

        if (!spender || !amount) {
            setError("Please fill in all fields");
            return;
        }

        if (!spender.startsWith("0x") || spender.length !== 42) {
            setError("Please enter a valid Ethereum address");
            return;
        }

        try {
            setIsLoading(true);

            const hash = await TokenContract.approve(spender, amount);

            setTxHash(hash);
            setSuccess(
                `Approved ${amount} ${tokenSymbol} for ${spender.slice(0, 6)}...${spender.slice(-4)}`
            );
            setAllowance(amount);

            setSpender("");
            setAmount("");
        } catch (err: any) {
            setError(err.message ?? "Approval failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            title="Approve Tokens"
            description="Allow another address to spend your tokens"
            icon="🥞"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <span>👤</span>
                        Spender Address
                    </label>
                    <input
                        type="text"
                        value={spender}
                        onChange={(e) => setSpender(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-black"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <span>💰</span>
                        Amount ({tokenSymbol})
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                        step="0.001"
                        placeholder="0.00"
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-black"
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                        <span className="text-sm text-red-700">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                        <span className="text-sm text-green-700">{success}</span>
                    </div>
                )}

                {txHash && (
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <div className="text-xs text-blue-600 mb-1">Transaction Hash</div>
                        <div className="font-mono text-xs break-all">{txHash}</div>
                        <a
                            href={`https://sepolia.etherscan.io/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 underline"
                        >
                            View on Etherscan
                        </a>
                    </div>
                )}

                <button
                    onClick={handleApprove}
                    disabled={isLoading || !spender || !amount}
                    className="w-full py-4 bg-amber-600 text-white font-bold rounded-xl disabled:opacity-50"
                >
                    {isLoading ? "Processing..." : "Approve Tokens"}
                </button>
            </div>
        </Card>
    );
};


export const BurnTokenCard = () => {
    const { address } = useAccount();
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const { tokenSymbol } = useTokenStore();

    const handleBurn = async () => {
        if (!address) {
            setError("Please connect your wallet first");
            return;
        }

        if (!amount) {
            setError("Please enter an amount");
            return;
        }

        const burnAmount = parseFloat(amount);
        if (burnAmount <= 0) {
            setError("Please enter a valid amount greater than 0");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Use the user's own balance  burn
            const hash = await TokenContract.burn(amount);
            setTxHash(hash);
            setSuccess(`Successfully burned ${amount} ${tokenSymbol}`);
            setAmount("");
        } catch (err: any) {
            if (err.message.includes("ERC20: burn amount exceeds balance") ||
                err.message.includes("burn amount exceeds balance") ||
                err.message.includes("insufficient balance")) {
                setError("Burn failed: You don't have enough tokens to burn this amount.");
            } else if (err.message.includes("user rejected") ||
                err.message.includes("denied transaction")) {
                setError("Transaction was rejected by user");
            } else if (err.message.includes("allowance")) {
                setError("Burn failed: Please approve the contract to burn your tokens first.");
            } else {
                setError(err.message || "Burn failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            title="Burn Your Tokens"
            description="Permanently remove your tokens from circulation"
            icon="🔥"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <span>🔥</span>
                        Amount to Burn ({tokenSymbol})
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            setError(null);
                        }}
                        placeholder="0.00"
                        min="0"
                        step="0.001"
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black placeholder-amber-400 transition-all duration-300"
                    />
                    {address && (
                        <div className="mt-2 text-xs text-gray-600">
                            <span className="font-semibold">Connected:</span> {address.slice(0, 6)}...{address.slice(-4)}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl shadow-sm animate-shake">
                        <div className="flex items-center gap-3 text-red-700">
                            <span className="text-xl">⚠️</span>
                            <div className="text-sm font-medium">
                                {error}
                                {error.includes("don't have enough tokens") && (
                                    <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                                        <span className="font-semibold">Solution:</span>
                                        <ul className="list-disc pl-4 mt-1 space-y-1">
                                            <li>Check your token balance</li>
                                            <li>Make sure you have enough tokens to burn</li>
                                            <li>Try burning a smaller amount</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
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
                    onClick={handleBurn}
                    disabled={isLoading || !amount || !address}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Burning Tokens...
                        </div>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span className="text-xl">🔥</span>
                            Burn My Tokens
                        </span>
                    )}
                </button>

                <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-700 flex items-start gap-2">
                        <span className="text-sm">ℹ️</span>
                        <span>
                            <span className="font-semibold">Important:</span> Burning tokens permanently removes them from circulation and reduces total supply. This action cannot be undone.
                        </span>
                    </p>
                </div>

                <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <p className="text-xs text-blue-700 flex items-start gap-2">
                        <span className="text-sm">👤</span>
                        <span>
                            <span className="font-semibold">Note:</span> Anyone can burn their own tokens. You're burning from your personal wallet balance.
                        </span>
                    </p>
                </div>
            </div>
        </Card>
    );
};

export const BurnFromTokenCard = () => {
    const [account, setAccount] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const { tokenSymbol } = useTokenStore();

    const handleBurnFrom = async () => {
        if (!account || !amount) {
            setError("Please fill in all fields");
            return;
        }

        if (!account.startsWith("0x") || account.length !== 42) {
            setError("Please enter a valid Ethereum address");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const hash = await TokenContract.burnFrom(account, amount);
            setTxHash(hash);
            setSuccess(`Burned ${amount} ${tokenSymbol} from ${account.slice(0, 8)}...`);
            setAccount("");
            setAmount("");
        } catch (err: any) {
            setError(err.message || "Burn from failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            title="Burn From Account"
            description="Burn tokens from an approved account"
            icon="💥"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <span>👤</span>
                        Account Address
                    </label>
                    <input
                        type="text"
                        value={account}
                        onChange={(e) => {
                            setAccount(e.target.value);
                            setError(null);
                        }}
                        placeholder="0x..."
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black placeholder-amber-400 transition-all duration-300"
                    />
                    <p className="text-xs text-amber-600 mt-1 ml-1">
                        Address that approved you to burn their tokens
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <span>🔥</span>
                        Amount to Burn ({tokenSymbol})
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            setError(null);
                        }}
                        placeholder="0.00"
                        min="0"
                        step="0.001"
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black placeholder-amber-400 transition-all duration-300"
                    />
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
                    onClick={handleBurnFrom}
                    disabled={isLoading || !account || !amount}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </div>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span className="text-xl">💥</span>
                            Burn From Account
                        </span>
                    )}
                </button>

                <div className="p-3 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl">
                    <p className="text-xs text-red-700 flex items-start gap-2">
                        <span className="text-sm">⚡</span>
                        <span>
                            <span className="font-semibold">Requirement:</span> This account must have approved your address as a spender.
                            Use the "Approve Tokens" card first if needed.
                        </span>
                    </p>
                </div>
            </div>
        </Card>
    );
};


export const MintTokenCard = () => {
    const { address } = useAccount();

    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [isCheckingOwner, setIsCheckingOwner] = useState(false);

    const { tokenSymbol } = useTokenStore();

    const checkIfOwner = async (): Promise<boolean> => {
        if (!address) return false;

        try {
            const contractOwner = "0x5c876847c2a93E231E00A93386D5F0514B6Dc641".toLowerCase();
            console.log("The contractAdres", address);
            const isOwner = address.toLowerCase() === contractOwner;
            console.log(isOwner);
            return isOwner;
        } catch (error) {
            console.error("Error checking owner status:", error);
            return false;
        }
    };

    const handleMint = async () => {
        if (!address) {
            setError("Please connect your wallet first");
            return;
        }

        if (!toAddress || !amount) {
            setError("Please fill in all fields");
            return;
        }

        if (!toAddress.startsWith("0x") || toAddress.length !== 42) {
            setError("Please enter a valid Ethereum address");
            return;
        }

        setIsCheckingOwner(true);
        try {
            const isOwner = await checkIfOwner();
            if (!isOwner) {
                setError("Only contract owner can mint tokens. Please connect with the owner wallet.");
                setIsCheckingOwner(false);
                return;
            }
        } catch (error) {
            console.error("Owner check failed:", error);
        } finally {
            setIsCheckingOwner(false);
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const hash = await TokenContract.mint(toAddress, amount);
            setTxHash(hash);
            setSuccess(`Minted ${amount} ${tokenSymbol} to ${toAddress.slice(0, 8)}...`);
            setToAddress("");
            setAmount("");
        } catch (err: any) {
            if (err.message.includes("Ownable: caller is not the owner") ||
                err.message.includes("caller is not the owner") ||
                err.message.includes("only owner")) {
                setError("Transaction failed: Only contract owner can mint tokens. Please ensure you're connected with the correct wallet.");
            } else {
                setError(err.message || "Mint failed");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            title="Mint Tokens"
            description="Create new tokens (Owner only)"
            icon="🍪"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <span>📬</span>
                        Recipient Address
                    </label>
                    <input
                        type="text"
                        value={toAddress}
                        onChange={(e) => {
                            setToAddress(e.target.value);
                            setError(null);
                        }}
                        placeholder="0x..."
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-amber-400 transition-all duration-300"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <span>💰</span>
                        Amount to Mint ({tokenSymbol})
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            setError(null);
                        }}
                        placeholder="0.00"
                        min="0"
                        step="0.001"
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-amber-400 transition-all duration-300"
                    />
                </div>

                {error && (
                    <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl shadow-sm animate-shake">
                        <div className="flex items-center gap-3 text-red-700">
                            <span className="text-xl">⚠️</span>
                            <div className="text-sm font-medium">
                                {error}
                                {error.includes("only owner") && (
                                    <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                                        <span className="font-semibold">Troubleshooting:</span>
                                        <ul className="list-disc pl-4 mt-1 space-y-1">
                                            <li>Ensure you're connected with the wallet that deployed the contract</li>
                                            <li>Check if ownership was transferred to another address</li>
                                            <li>Verify network and contract address</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
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
                    onClick={handleMint}
                    disabled={isLoading || !toAddress || !amount || isCheckingOwner || !address}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </div>
                    ) : isCheckingOwner ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying Owner...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span className="text-xl">✨</span>
                            Mint Tokens
                        </span>
                    )}
                </button>

                <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                    <p className="text-xs text-green-700 flex items-start gap-2">
                        <span className="text-sm">ℹ️</span>
                        <span>
                            <span className="font-semibold">Note:</span> This function has an <code className="bg-green-100 px-1 rounded">onlyOwner</code> modifier.
                            Only the contract owner can mint new tokens. The contract will automatically validate this.
                        </span>
                    </p>
                </div>

                <button
                    onClick={async () => {
                        if (!address) {
                            setError("Please connect wallet first");
                            return;
                        }
                        setIsCheckingOwner(true);
                        try {
                            const isOwner = await checkIfOwner();
                            if (isOwner) {
                                setSuccess("✅ You are the contract owner!");
                            } else {
                                setError("❌ You are NOT the contract owner. Please connect with the owner wallet.");
                            }
                        } catch (error) {
                            setError("Failed to check owner status");
                        } finally {
                            setIsCheckingOwner(false);
                        }
                    }}
                    disabled={isCheckingOwner || !address}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                >
                    {isCheckingOwner ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Checking Owner Status...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span className="text-lg">👑</span>
                            Check if I'm Owner
                        </span>
                    )}
                </button>
            </div>
        </Card>
    );
};

export const OwnershipTransferCard = () => {
    const { address } = useAccount();

    const [newOwner, setNewOwner] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingOwner, setIsCheckingOwner] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const checkIfOwner = async (): Promise<boolean> => {
        if (!address) return false;

        try {
            const contractOwner = "0x5c876847c2a93E231E00A93386D5F0514B6Dc641".toLowerCase();
            const isOwner = address.toLowerCase() === contractOwner;
            return isOwner;
        } catch (error) {
            console.error("Error checking owner status:", error);
            return false;
        }
    };

    const handleTransferOwnership = async () => {
        if (!address) {
            setError("Please connect your wallet first");
            return;
        }

        if (!newOwner) {
            setError("Please enter a new owner address");
            return;
        }

        if (!newOwner.startsWith("0x") || newOwner.length !== 42) {
            setError("Please enter a valid Ethereum address");
            return;
        }

        if (newOwner.toLowerCase() === address.toLowerCase()) {
            setError("New owner cannot be the same as current owner");
            return;
        }

        setIsCheckingOwner(true);
        try {
            const isOwner = await checkIfOwner();
            if (!isOwner) {
                setError("Only contract owner can transfer ownership. Please connect with the owner wallet.");
                setIsCheckingOwner(false);
                return;
            }
        } catch (error) {
            console.error("Owner check failed:", error);
        } finally {
            setIsCheckingOwner(false);
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const hash = await TokenContract.transferOwnership(newOwner);
            setTxHash(hash);
            setSuccess(`Successfully transferred ownership to ${newOwner.slice(0, 8)}...${newOwner.slice(-6)}`);
            setNewOwner("");
        } catch (err: any) {
            if (err.message.includes("Ownable: caller is not the owner") ||
                err.message.includes("caller is not the owner") ||
                err.message.includes("only owner")) {
                setError("Transaction failed: Only contract owner can transfer ownership. Please ensure you're connected with the correct wallet.");
            } else if (err.message.includes("new owner is the zero address")) {
                setError("Cannot transfer ownership to the zero address (0x0)");
            } else {
                setError(err.message || "Ownership transfer failed");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            title="Transfer Ownership"
            description="Transfer contract ownership to a new address"
            icon="👑"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <span>🔑</span>
                        New Owner Address
                    </label>
                    <input
                        type="text"
                        value={newOwner}
                        onChange={(e) => {
                            setNewOwner(e.target.value);
                            setError(null);
                        }}
                        placeholder="0x..."
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-amber-400 transition-all duration-300"
                    />
                    <p className="text-xs text-amber-600 mt-1 ml-1">
                        The address that will become the new owner of the contract
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl shadow-sm animate-shake">
                        <div className="flex items-center gap-3 text-red-700">
                            <span className="text-xl">⚠️</span>
                            <div className="text-sm font-medium">
                                {error}
                                {error.includes("only owner") && (
                                    <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                                        <span className="font-semibold">Troubleshooting:</span>
                                        <ul className="list-disc pl-4 mt-1 space-y-1">
                                            <li>Ensure you're connected with the wallet that deployed the contract</li>
                                            <li>Check if ownership was already transferred to another address</li>
                                            <li>Verify network and contract address</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
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
                    onClick={handleTransferOwnership}
                    disabled={isLoading || !newOwner || isCheckingOwner || !address}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </div>
                    ) : isCheckingOwner ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying Owner...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span className="text-xl">👑</span>
                            Transfer Ownership
                        </span>
                    )}
                </button>

                <div className="space-y-3">


                    <div className="p-3 bg-purple-50 border-2 border-purple-200 rounded-xl">
                        <p className="text-xs text-purple-700 flex items-start gap-2">
                            <span className="text-sm">ℹ️</span>
                            <span>
                                <span className="font-semibold">Note:</span> This function has an <code className="bg-purple-100 px-1 rounded">onlyOwner</code> modifier.
                                Only the current contract owner can transfer ownership to a new address.
                            </span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={async () => {
                        if (!address) {
                            setError("Please connect wallet first");
                            return;
                        }
                        setIsCheckingOwner(true);
                        try {
                            const isOwner = await checkIfOwner();
                            if (isOwner) {
                                setSuccess("✅ You are the contract owner! You can transfer ownership.");
                            } else {
                                setError("❌ You are NOT the contract owner. Only the owner can transfer ownership.");
                            }
                        } catch (error) {
                            setError("Failed to check owner status");
                        } finally {
                            setIsCheckingOwner(false);
                        }
                    }}
                    disabled={isCheckingOwner || !address}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                >
                    {isCheckingOwner ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Checking Owner Status...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span className="text-lg">🔍</span>
                            Check if I'm Owner
                        </span>
                    )}
                </button>
            </div>
        </Card>
    );
};