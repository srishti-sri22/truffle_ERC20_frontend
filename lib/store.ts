import { create } from "zustand";

export interface TokenTransferEvent {
  from: string;
  to: string;
  amount: string;
  txHash: string;
  timestamp: number;
}

export interface TokenApprovalEvent {
  owner: string;
  spender: string;
  amount: string;
  txHash: string;
  timestamp: number;
}

export interface FaucetClaimEvent {
  user: string;
  amount: string;
  txHash: string;
  timestamp: number;
}

export interface FaucetWithdrawEvent {
  to: string;
  amount: string;
  txHash: string;
  timestamp: number;
}

export interface OwnershipTransferEvent {
  previousOwner: string;
  newOwner: string;
  txHash: string;
  timestamp: number;
}

export interface EventNotification {
  id: string;
  type: 'claimed' | 'withdrawn' | 'ownership' | 'transfer' | 'approval';
  message: string;
  timestamp: number;
  txHash: string;
}

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

  transfers: TokenTransferEvent[];
  approvals: TokenApprovalEvent[];
  claims: FaucetClaimEvent[];
  withdrawals: FaucetWithdrawEvent[];
  ownershipChanges: OwnershipTransferEvent[];
  notifications: EventNotification[];

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

  addTransfer: (event: TokenTransferEvent) => void;
  addApproval: (event: TokenApprovalEvent) => void;
  addClaim: (event: FaucetClaimEvent) => void;
  addWithdrawal: (event: FaucetWithdrawEvent) => void;
  addOwnershipChange: (event: OwnershipTransferEvent) => void;
  addNotification: (notification: EventNotification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  setTransfers: (events: TokenTransferEvent[]) => void;
  setApprovals: (events: TokenApprovalEvent[]) => void;
  setClaims: (events: FaucetClaimEvent[]) => void;
  setWithdrawals: (events: FaucetWithdrawEvent[]) => void;
  setOwnershipChanges: (events: OwnershipTransferEvent[]) => void;

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

  transfers: [],
  approvals: [],
  claims: [],
  withdrawals: [],
  ownershipChanges: [],
  notifications: [],

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

  addTransfer: (event) => set((state) => ({
    transfers: [event, ...state.transfers].slice(0, 100)
  })),

  addApproval: (event) => set((state) => ({
    approvals: [event, ...state.approvals].slice(0, 100)
  })),

  addClaim: (event) => set((state) => ({
    claims: [event, ...state.claims].slice(0, 100)
  })),

  addWithdrawal: (event) => set((state) => ({
    withdrawals: [event, ...state.withdrawals].slice(0, 100)
  })),

  addOwnershipChange: (event) => set((state) => ({
    ownershipChanges: [event, ...state.ownershipChanges].slice(0, 50)
  })),

  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications].slice(0, 10)
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  clearNotifications: () => set({ notifications: [] }),

  setTransfers: (events) => set({ transfers: events }),
  setApprovals: (events) => set({ approvals: events }),
  setClaims: (events) => set({ claims: events }),
  setWithdrawals: (events) => set({ withdrawals: events }),
  setOwnershipChanges: (events) => set({ ownershipChanges: events }),

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
      timeRemaining: "",
      transfers: [],
      approvals: [],
      claims: [],
      withdrawals: [],
      ownershipChanges: [],
      notifications: []
    })
}));