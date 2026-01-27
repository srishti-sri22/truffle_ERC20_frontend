import { create } from "zustand";

interface TokenState {
  balance: string;
  allowance: string;
  totalSupply: string;
  tokenName: string;
  tokenSymbol: string;
  owner: string;

  faucetClaimAmount: string;
  faucetBalance: string;
  lastClaimTime: number;
  cooldownPeriod: number;

  isLoading: boolean;
  txHash: string | null;
  error: string | null;
  success: string | null;

  canClaim: boolean;
  timeRemaining: string;

  setBalance: (v: string) => void;
  setAllowance: (v: string) => void;
  setTotalSupply: (v: string) => void;
  setTokenInfo: (name: string, symbol: string) => void;
  setOwner: (v: string) => void;

  setFaucetInfo: (claimAmount: string, balance: string, lastClaim: number, cooldown: number) => void;

  setIsLoading: (v: boolean) => void;
  setTxHash: (v: string | null) => void;
  setError: (v: string | null) => void;
  setSuccess: (v: string | null) => void;

  setCanClaim: (v: boolean) => void;
  setTimeRemaining: (v: string) => void;

  resetTxState: () => void;
  resetAll: () => void;
}

export const useTokenStore = create<TokenState>((set) => ({
  balance: "0",
  allowance: "0",
  totalSupply: "0",
  tokenName: "",
  tokenSymbol: "",
  owner: "",

  faucetClaimAmount: "0",
  faucetBalance: "0",
  lastClaimTime: 0,
  cooldownPeriod: 0,

  isLoading: false,
  txHash: null,
  error: null,
  success: null,

  canClaim: false,
  timeRemaining: "",

  setBalance: (v) => set({ balance: v }),
  setAllowance: (v) => set({ allowance: v }),
  setTotalSupply: (v) => set({ totalSupply: v }),
  setTokenInfo: (name, symbol) => set({ tokenName: name, tokenSymbol: symbol }),
  setOwner: (v) => set({ owner: v }),

  setFaucetInfo: (claimAmount, balance, lastClaim, cooldown) =>
    set({
      faucetClaimAmount: claimAmount,
      faucetBalance: balance,
      lastClaimTime: lastClaim,
      cooldownPeriod: cooldown
    }),

  setIsLoading: (v) => set({ isLoading: v }),
  setTxHash: (v) => set({ txHash: v }),
  setError: (v) => set({ error: v }),
  setSuccess: (v) => set({ success: v }),

  setCanClaim: (v) => set({ canClaim: v }),
  setTimeRemaining: (v) => set({ timeRemaining: v }),

  resetTxState: () =>
    set({
      isLoading: false,
      txHash: null,
      error: null,
      success: null
    }),

  resetAll: () =>
    set({
      balance: "0",
      allowance: "0",
      totalSupply: "0",
      tokenName: "",
      tokenSymbol: "",
      owner: "",
      faucetClaimAmount: "0",
      faucetBalance: "0",
      lastClaimTime: 0,
      cooldownPeriod: 0,
      isLoading: false,
      txHash: null,
      error: null,
      success: null,
      canClaim: false,
      timeRemaining: ""
    })
}));