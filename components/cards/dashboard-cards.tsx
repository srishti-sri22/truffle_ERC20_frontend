"use client";

import { useEffect, useState } from "react";
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
    const { 
        balance, 
        totalSupply, 
        tokenName, 
        tokenSymbol, 
        allowance, 
        userAddress,
        setBalance,
        setTotalSupply,
        setTokenInfo,
        setOwner,
        setAllowance
    } = useTokenStore();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshError, setRefreshError] = useState<string | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

    const handleRefresh = async () => {
        if (!userAddress) {
            setRefreshError("Please connect your wallet first");
            return;
        }

        setIsRefreshing(true);
        setRefreshError(null);
        
        try {
            const [
                tokenInfo,
                totalSupplyData,
                ownerData,
                balanceData,
                allowanceData
            ] = await Promise.all([
                TokenContract.getTokenInfo(),
                TokenContract.getTotalSupply(),
                TokenContract.getOwner(),
                TokenContract.getBalance(userAddress),
                TokenContract.getAllowance(userAddress, "0x0000000000000000000000000000000000000000")
            ]);

            setTokenInfo(tokenInfo.name, tokenInfo.symbol);
            setTotalSupply(totalSupplyData);
            setOwner(ownerData);
            setBalance(balanceData);
            setAllowance(allowanceData);

            const now = new Date();
            setLastRefreshed(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            
        } catch (error: any) {
            console.error("Error refreshing data:", error);
            setRefreshError(error.message || "Failed to refresh data");
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (userAddress) {
            handleRefresh();
        }
    }, [userAddress]);

    return (
        <Card
            title="Token Metrics"
            description="Overview of your token statistics"
            icon="🥮"
        >
            <div className="space-y-4">
                {[
                    { label: "Token Name", value: tokenName || "Loading...", icon: "🏷️" },
                    { label: "Symbol", value: tokenSymbol || "Loading...", icon: "💎" },
                    { label: "Your Balance", value: `${balance} ${tokenSymbol}`, icon: "💰", highlight: true },
                    { label: "Total Supply", value: `${totalSupply} ${tokenSymbol}`, icon: "📦" },
                    { label: "Allowance", value: `${allowance} ${tokenSymbol}`, icon: "✅" }
                ].map((item, idx) => (
                    <div 
                        key={idx} 
                        className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                            item.highlight 
                                ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 shadow-md' 
                                : 'bg-amber-50 hover:bg-amber-100'
                        }`}
                    >
                        <span className="text-amber-700 font-medium flex items-center gap-2">
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </span>
                        <span className={`font-bold ${item.highlight ? 'text-lg text-amber-900' : 'text-amber-900'}`}>
                            {item.value}
                        </span>
                    </div>
                ))}

                {refreshError && (
                    <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl shadow-sm animate-shake">
                        <div className="flex items-center gap-3 text-red-700">
                            <span className="text-xl">⚠️</span>
                            <span className="text-sm font-medium">{refreshError}</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mt-2">
                    {lastRefreshed && (
                        <div className="text-xs text-amber-600 flex items-center gap-1">
                            <span className="text-xs">🕐</span>
                            Last updated: {lastRefreshed}
                        </div>
                    )}
                    
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing || !userAddress}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                    >
                        {isRefreshing ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Refreshing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <span className="text-sm">🔄</span>
                                Refresh Now
                            </span>
                        )}
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

      // Optional: optimistic update (real allowance should be refetched)
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
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingOwner, setIsCheckingOwner] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const { tokenSymbol, userAddress } = useTokenStore();

    // Check on-chain if connected wallet is the owner (for optional pre-check)
    const checkIfOwner = async (): Promise<boolean> => {
        if (!userAddress) return false;
        
        try {
            const contractOwner ="0x5c876847c2a93E231E00A93386D5F0514B6Dc641";
            const isOwner = userAddress.toLowerCase() === contractOwner.toLowerCase();
            return isOwner;
        } catch (error) {
            console.error("Error checking owner status:", error);
            return false;
        }
    };

    const handleBurn = async () => {
        if (!userAddress) {
            setError("Please connect your wallet first");
            return;
        }

        if (!amount) {
            setError("Please enter an amount");
            return;
        }

        setIsCheckingOwner(true);
        try {
            const isOwner = await checkIfOwner();
            if (!isOwner) {
                setError("Only contract owner can burn tokens from the contract. Please connect with the owner wallet.");
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
            const hash = await TokenContract.burn(amount);
            setTxHash(hash);
            setSuccess(`Burned ${amount} ${tokenSymbol}`);
            setAmount("");
        } catch (err: any) {
            // Handle specific onlyOwner errors
            if (err.message.includes("Ownable: caller is not the owner") || 
                err.message.includes("caller is not the owner") ||
                err.message.includes("only owner") ||
                err.message.includes("ERC20: burn amount exceeds balance") ||
                err.message.includes("burn amount exceeds balance")) {
                if (err.message.includes("only owner") || err.message.includes("caller is not the owner")) {
                    setError("Transaction failed: Only contract owner can burn tokens. Please ensure you're connected with the correct wallet.");
                } else if (err.message.includes("exceeds balance")) {
                    setError("Burn failed: You don't have enough tokens to burn.");
                } else {
                    setError(err.message || "Burn failed");
                }
            } else {
                setError(err.message || "Burn failed");
            }
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
                            <div className="text-sm font-medium">
                                {error}
                                {error.includes("only owner") && (
                                    <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                                        <span className="font-semibold">Troubleshooting:</span>
                                        <ul className="list-disc pl-4 mt-1 space-y-1">
                                            <li>Ensure you're connected with the wallet that deployed the contract</li>
                                            <li>Check if ownership was transferred to another address</li>
                                            <li>Verify network and contract address</li>
                                            <li>Note: Burning from your own balance doesn't require owner permissions</li>
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
                    disabled={isLoading || !amount || isCheckingOwner || !userAddress}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
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
                            <span className="text-xl">🔥</span>
                            Burn Tokens
                        </span>
                    )}
                </button>

                <div className="space-y-3">
                    <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
                        <p className="text-xs text-amber-700 flex items-start gap-2">
                            <span className="text-sm">⚠️</span>
                            <span><span className="font-semibold">Warning:</span> Burning tokens permanently removes them from circulation and reduces total supply.</span>
                        </p>
                    </div>

                </div>

                <button
                    onClick={async () => {
                        if (!userAddress) {
                            setError("Please connect wallet first");
                            return;
                        }
                        setIsCheckingOwner(true);
                        try {
                            const isOwner = await checkIfOwner();
                            if (isOwner) {
                                setSuccess("✅ You are the contract owner! You can burn tokens.");
                            } else {
                                setError("❌ You are NOT the contract owner. Burning may require owner permissions.");
                            }
                        } catch (error) {
                            setError("Failed to check owner status");
                        } finally {
                            setIsCheckingOwner(false);
                        }
                    }}
                    disabled={isCheckingOwner || !userAddress}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
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
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [isCheckingOwner, setIsCheckingOwner] = useState(false);

    const { tokenSymbol, userAddress } = useTokenStore();

    const checkIfOwner = async (): Promise<boolean> => {
        if (!userAddress) return false;
        
        try {
            const contractOwner = "0x5c876847c2a93E231E00A93386D5F0514B6Dc641".toLowerCase();
            console.log(userAddress);
            const isOwner = userAddress.toLowerCase() === contractOwner;
            console.log(isOwner);
            return isOwner;
        } catch (error) {
            console.error("Error checking owner status:", error);
            return false;
        }
    };

    const handleMint = async () => {
        if (!userAddress) {
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
                    disabled={isLoading || !toAddress || !amount || isCheckingOwner || !userAddress}
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

                {/* Optional: Add a button to check owner status manually */}
                <button
                    onClick={async () => {
                        if (!userAddress) {
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
                    disabled={isCheckingOwner || !userAddress}
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