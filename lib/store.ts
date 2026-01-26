import { create } from 'zustand';

interface TokenState {
  balance: string;
  allowance: string;
  totalSupply: string;
  tokenName: string;
  tokenSymbol: string;
  owner: string;
  userAddress: string;
  faucetClaimAmount: string;
  faucetBalance: string;
  lastClaimTime: number;
  cooldownPeriod: number;
  isConnected: boolean;
  
  txHash: string | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  canClaim: boolean;
  timeRemaining: string;
  
  setBalance: (balance: string) => void;
  setAllowance: (allowance: string) => void;
  setTotalSupply: (totalSupply: string) => void;
  setTokenInfo: (name: string, symbol: string) => void;
  setOwner: (owner: string) => void;
  setUserAddress: (address: string) => void;
  setFaucetInfo: (claimAmount: string, balance: string, lastClaimTime: number, cooldown: number) => void;
  setConnected: (connected: boolean) => void;
  
  setTxHash: (txHash: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setCanClaim: (canClaim: boolean) => void;
  setTimeRemaining: (timeRemaining: string) => void;
  
  resetState: () => void;
}

export const useTokenStore = create<TokenState>((set) => ({
  balance: '0',
  allowance: '0',
  totalSupply: '0',
  tokenName: 'Truffle Token',
  tokenSymbol: 'TRFL',
  owner: '',
  userAddress: '',
  faucetClaimAmount: '100',
  faucetBalance: '0',
  lastClaimTime: 0,
  cooldownPeriod: 86400, 
  isConnected: false,
  
  txHash: null,
  isLoading: false,
  error: null,
  success: null,
  canClaim: true,
  timeRemaining: '',

  setBalance: (balance) => set({ balance }),
  setAllowance: (allowance) => set({ allowance }),
  setTotalSupply: (totalSupply) => set({ totalSupply }),
  setTokenInfo: (name, symbol) => set({ tokenName: name, tokenSymbol: symbol }),
  setOwner: (owner) => set({ owner }),
  setUserAddress: (address) => set({ userAddress: address }),
  setFaucetInfo: (claimAmount, balance, lastClaimTime, cooldown) => 
    set({ 
      faucetClaimAmount: claimAmount, 
      faucetBalance: balance, 
      lastClaimTime,
      cooldownPeriod: cooldown 
    }),
  setConnected: (connected) => set({ isConnected: connected }),
  
  setTxHash: (txHash) => set({ txHash }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  setCanClaim: (canClaim) => set({ canClaim }),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  
  resetState: () => set({
    balance: '0',
    allowance: '0',
    totalSupply: '0',
    userAddress: '',
    faucetBalance: '0',
    lastClaimTime: 0,
    isConnected: false,
    txHash: null,
    isLoading: false,
    error: null,
    success: null,
    canClaim: true,
    timeRemaining: ''
  }),
}));