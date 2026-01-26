"use client";

import { useState } from "react";
import { useTokenStore } from "@/lib/store";
import { TokenContract } from "@/lib/contract-interactions";

interface CardProps {
    title: string;
    description: string;
    icon: string;
    children: React.ReactNode;
}

export const Card = ({ title, description, icon, children }: CardProps) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden">
            <div className="p-6 border-b border-amber-50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100">
                        <span className="text-amber-700 text-xl">{icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-amber-900">{title}</h3>
                </div>
                <p className="text-amber-600 text-sm">{description}</p>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

export const TokenMetricsCard = () => {
    const { balance, totalSupply, tokenName, tokenSymbol, allowance, userAddress } = useTokenStore();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (!userAddress) return;

        setIsRefreshing(true);
        try {
            // TODO: Implement refresh logic from contracts
            // const newBalance = await TokenContract.getBalance(userAddress);
            // const newTotalSupply = await TokenContract.getTotalSupply();
            // Update store with new values
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <Card
            title="Token Metrics"
            description="Overview of your token statistics"
            icon="📊"
        >
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-amber-600">Token Name</span>
                    <span className="font-semibold text-amber-900">{tokenName}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-amber-600">Symbol</span>
                    <span className="font-semibold text-amber-900">{tokenSymbol}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-amber-600">Your Balance</span>
                    <span className="font-bold text-lg text-amber-700">{balance} {tokenSymbol}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-amber-600">Total Supply</span>
                    <span className="font-semibold text-amber-900">{totalSupply} {tokenSymbol}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-amber-600">Allowance</span>
                    <span className="font-semibold text-amber-900">{allowance} {tokenSymbol}</span>
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="w-full mt-4 py-2 bg-amber-50 text-amber-700 font-medium rounded-lg border border-amber-200 hover:bg-amber-100 disabled:opacity-50 transition-colors"
                >
                    {isRefreshing ? "Refreshing..." : "Refresh Data"}
                </button>
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

            // Refresh balance after successful transfer
            // TODO: Update store balance
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
            icon="🔄"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">
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
                        className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-black"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">
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
                        className="w-full px-3 py-2 border border-amber-200 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-black"
                    />
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
                    onClick={handleTransfer}
                    disabled={isLoading || !toAddress || !amount}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                        </div>
                    ) : "Transfer Tokens"}
                </button>
            </div>
        </Card>
    );
};

export const ApproveTokenCard = () => {
    const [spender, setSpender] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const { tokenSymbol } = useTokenStore();

    const handleApprove = async () => {
        if (!spender || !amount) {
            setError("Please fill in all fields");
            return;
        }

        if (!spender.startsWith("0x") || spender.length !== 42) {
            setError("Please enter a valid Ethereum address");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const hash = await TokenContract.approve(spender, amount);
            setTxHash(hash);
            setSuccess(`Approved ${amount} ${tokenSymbol} for ${spender.slice(0, 8)}...`);
            setSpender("");
            setAmount("");

            // Refresh allowance after approval
            // TODO: Update store allowance
        } catch (err: any) {
            setError(err.message || "Approval failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            title="Approve Tokens"
            description="Allow another address to spend your tokens"
            icon="✅"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">
                        Spender Address
                    </label>
                    <input
                        type="text"
                        value={spender}
                        onChange={(e) => {
                            setSpender(e.target.value);
                            setError(null);
                        }}
                        placeholder="0x..."
                        className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-black"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">
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
                        className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-black"
                    />
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
                    onClick={handleApprove}
                    disabled={isLoading || !spender || !amount}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                        </div>
                    ) : "Approve Tokens"}
                </button>
            </div>
        </Card>
    );
};

export const BurnTokenCard = () => {
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const { tokenSymbol } = useTokenStore();

    const handleBurn = async () => {
        if (!amount) {
            setError("Please enter an amount");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const hash = await TokenContract.burn(amount);
            setTxHash(hash);
            setSuccess(`Burned ${amount} ${tokenSymbol}`);
            setAmount("");

            // Refresh balance and total supply after burn
            // TODO: Update store values
        } catch (err: any) {
            setError(err.message || "Burn failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            title="Burn Tokens"
            description="Permanently remove tokens from circulation"
            icon="🔥"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">
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
                        className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-black"
                    />
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
                    onClick={handleBurn}
                    disabled={isLoading || !amount}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                        </div>
                    ) : "Burn Tokens"}
                </button>

                <p className="text-xs text-amber-500 mt-2">
                    Note: Burning tokens permanently removes them from circulation and reduces total supply.
                </p>
            </div>
        </Card>
    );
};

export const MintTokenCard = () => {
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const { tokenSymbol } = useTokenStore();

    const handleMint = async () => {
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
            const hash = await TokenContract.mint(toAddress, amount);
            setTxHash(hash);
            setSuccess(`Minted ${amount} ${tokenSymbol} to ${toAddress.slice(0, 8)}...`);
            setToAddress("");
            setAmount("");

            // Refresh total supply after mint
            // TODO: Update store values
        } catch (err: any) {
            setError(err.message || "Mint failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            title="Mint Tokens"
            description="Create new tokens (Owner only)"
            icon="🪙"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">
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
                        className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-black"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">
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
                        className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-black"
                    />
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
                    onClick={handleMint}
                    disabled={isLoading || !toAddress || !amount}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                        </div>
                    ) : "Mint Tokens"}
                </button>

                <p className="text-xs text-amber-500 mt-2">
                    Note: Only the contract owner can mint new tokens.
                </p>
            </div>
        </Card>
    );
};