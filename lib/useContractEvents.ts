import { useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider } from './contracts';
import { useTokenStore } from './store';

export function useTokenEvents(tokenAddress: string, tokenAbi: any, userAddress?: string) {
  const { 
    addTransfer, 
    addApproval, 
    addOwnershipChange,
    setTransfers,
    setApprovals,
    setOwnershipChanges 
  } = useTokenStore();

  useEffect(() => {
    if (!tokenAddress) return;

    const provider = getProvider();
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);

    const onTransfer = async (from: string, to: string, amount: bigint, event: any) => {
      const transferEvent = {
        from,
        to,
        amount: ethers.formatUnits(amount, 18),
        txHash: event.log.transactionHash,
        timestamp: Date.now()
      };

      addTransfer(transferEvent);
    };

    const onApproval = async (owner: string, spender: string, amount: bigint, event: any) => {
      const approvalEvent = {
        owner,
        spender,
        amount: ethers.formatUnits(amount, 18),
        txHash: event.log.transactionHash,
        timestamp: Date.now()
      };

      addApproval(approvalEvent);
    };

    const onOwnershipTransferred = async (previousOwner: string, newOwner: string, event: any) => {
      const ownershipEvent = {
        previousOwner,
        newOwner,
        txHash: event.log.transactionHash,
        timestamp: Date.now()
      };

      addOwnershipChange(ownershipEvent);
    };

    tokenContract.on('Transfer', onTransfer);
    tokenContract.on('Approval', onApproval);
    tokenContract.on('OwnershipTransferred', onOwnershipTransferred);

    const loadPastEvents = async () => {
      try {
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 1000);

        const transferFilter = userAddress 
          ? tokenContract.filters.Transfer(userAddress, null) || tokenContract.filters.Transfer(null, userAddress)
          : tokenContract.filters.Transfer();
        
        const transferEvents = await tokenContract.queryFilter(transferFilter, fromBlock, currentBlock);
        
        const pastTransfers = transferEvents.map((event: any) => ({
          from: event.args.from,
          to: event.args.to,
          amount: ethers.formatUnits(event.args.value, 18),
          txHash: event.transactionHash,
          timestamp: Date.now()
        }));

        setTransfers(pastTransfers.reverse().slice(0, 100));

        if (userAddress) {
          const approvalFilter = tokenContract.filters.Approval(userAddress);
          const approvalEvents = await tokenContract.queryFilter(approvalFilter, fromBlock, currentBlock);
          
          const pastApprovals = approvalEvents.map((event: any) => ({
            owner: event.args.owner,
            spender: event.args.spender,
            amount: ethers.formatUnits(event.args.value, 18),
            txHash: event.transactionHash,
            timestamp: Date.now()
          }));

          setApprovals(pastApprovals.reverse().slice(0, 100));
        }

      } catch (err) {
        console.error('Error loading past token events:', err);
      }
    };

    loadPastEvents();

    return () => {
      tokenContract.off('Transfer', onTransfer);
      tokenContract.off('Approval', onApproval);
      tokenContract.off('OwnershipTransferred', onOwnershipTransferred);
    };
  }, [tokenAddress, tokenAbi, userAddress, addTransfer, addApproval, addOwnershipChange, setTransfers, setApprovals, setOwnershipChanges]);
}

export function useFaucetEvents(faucetAddress: string, faucetAbi: any, userAddress?: string) {
  const { 
    addClaim, 
    addWithdrawal, 
    addOwnershipChange,
    addNotification,
    setClaims,
    setWithdrawals,
    setOwnershipChanges
  } = useTokenStore();

  useEffect(() => {
    if (!faucetAddress) return;

    const provider = getProvider();
    const faucetContract = new ethers.Contract(faucetAddress, faucetAbi, provider);

    const onClaimed = async (user: string, amount: bigint, event: any) => {
      const claimEvent = {
        user,
        amount: ethers.formatUnits(amount, 18),
        txHash: event.log.transactionHash,
        timestamp: Date.now()
      };

      addClaim(claimEvent);

      const isCurrentUser = user.toLowerCase() === userAddress?.toLowerCase();
      const notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'claimed' as const,
        message: isCurrentUser 
          ? `You claimed ${claimEvent.amount} tokens!`
          : `${user.slice(0, 6)}...${user.slice(-4)} claimed ${claimEvent.amount} tokens`,
        timestamp: Date.now(),
        txHash: event.log.transactionHash
      };

      addNotification(notification);

      setTimeout(() => {
        useTokenStore.getState().removeNotification(notification.id);
      }, 10000);
    };

    const onTokensWithdrawn = async (to: string, amount: bigint, event: any) => {
      const withdrawEvent = {
        to,
        amount: ethers.formatUnits(amount, 18),
        txHash: event.log.transactionHash,
        timestamp: Date.now()
      };

      addWithdrawal(withdrawEvent);

      const notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'withdrawn' as const,
        message: `${withdrawEvent.amount} tokens withdrawn to ${to.slice(0, 6)}...${to.slice(-4)}`,
        timestamp: Date.now(),
        txHash: event.log.transactionHash
      };

      addNotification(notification);

      setTimeout(() => {
        useTokenStore.getState().removeNotification(notification.id);
      }, 10000);
    };

    const onOwnershipTransferred = async (previousOwner: string, newOwner: string, event: any) => {
      const ownershipEvent = {
        previousOwner,
        newOwner,
        txHash: event.log.transactionHash,
        timestamp: Date.now()
      };

      addOwnershipChange(ownershipEvent);

      const notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'ownership' as const,
        message: `Ownership transferred from ${previousOwner.slice(0, 6)}...${previousOwner.slice(-4)} to ${newOwner.slice(0, 6)}...${newOwner.slice(-4)}`,
        timestamp: Date.now(),
        txHash: event.log.transactionHash
      };

      addNotification(notification);

      setTimeout(() => {
        useTokenStore.getState().removeNotification(notification.id);
      }, 10000);
    };

    faucetContract.on('Claimed', onClaimed);
    faucetContract.on('TokensWithdrawn', onTokensWithdrawn);
    faucetContract.on('OwnershipTransferred', onOwnershipTransferred);

    const loadPastEvents = async () => {
      try {
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 1000);

        const claimedFilter = userAddress 
          ? faucetContract.filters.Claimed(userAddress)
          : faucetContract.filters.Claimed();
        
        const claimedEvents = await faucetContract.queryFilter(claimedFilter, fromBlock, currentBlock);
        
        const pastClaims = claimedEvents.map((event: any) => ({
          user: event.args.user,
          amount: ethers.formatUnits(event.args.amount, 18),
          txHash: event.transactionHash,
          timestamp: Date.now()
        }));

        setClaims(pastClaims.reverse().slice(0, 100));

        const withdrawnFilter = faucetContract.filters.TokensWithdrawn();
        const withdrawnEvents = await faucetContract.queryFilter(withdrawnFilter, fromBlock, currentBlock);
        
        const pastWithdrawals = withdrawnEvents.map((event: any) => ({
          to: event.args.to,
          amount: ethers.formatUnits(event.args.amount, 18),
          txHash: event.transactionHash,
          timestamp: Date.now()
        }));

        setWithdrawals(pastWithdrawals.reverse().slice(0, 100));

      } catch (err) {
        console.error('Error loading past faucet events:', err);
      }
    };

    loadPastEvents();

    return () => {
      faucetContract.off('Claimed', onClaimed);
      faucetContract.off('TokensWithdrawn', onTokensWithdrawn);
      faucetContract.off('OwnershipTransferred', onOwnershipTransferred);
    };
  }, [faucetAddress, faucetAbi, userAddress, addClaim, addWithdrawal, addOwnershipChange, addNotification, setClaims, setWithdrawals, setOwnershipChanges]);
}

export function formatEventTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}