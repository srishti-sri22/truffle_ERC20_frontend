import { ethers } from "ethers";
import { 
  TOKEN_ADDRESS, 
  FAUCET_ADDRESS, 
  tokenAbi, 
  faucetAbi,
  getProvider,
  getSigner,
  parseContractError 
} from "./contracts";

export class TokenContract {
  static async getBalance(address: string): Promise<string> {
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  }

  static async getTotalSupply(): Promise<string> {
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);
      const totalSupply = await contract.totalSupply();
      const decimals = await contract.decimals();
      return ethers.formatUnits(totalSupply, decimals);
    } catch (error) {
      console.error("Error getting total supply:", error);
      throw error;
    }
  }

  static async getTokenInfo(): Promise<{ name: string; symbol: string }> {
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);
      const [name, symbol] = await Promise.all([
        contract.name(),
        contract.symbol()
      ]);
      return { name, symbol };
    } catch (error) {
      console.error("Error getting token info:", error);
      throw error;
    }
  }

  static async transfer(to: string, amount: string): Promise<string> {
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const decimals = await contract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);
      
      const tx = await contract.transfer(to, amountInWei);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error transferring tokens:", error);
      throw new Error(parseContractError(error));
    }
  }

  static async approve(spender: string, amount: string): Promise<string> {
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const decimals = await contract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);
      
      const tx = await contract.approve(spender, amountInWei);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error approving tokens:", error);
      throw new Error(parseContractError(error));
    }
  }

  static async getAllowance(owner: string, spender: string): Promise<string> {
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);
      const allowance = await contract.allowance(owner, spender);
      const decimals = await contract.decimals();
      return ethers.formatUnits(allowance, decimals);
    } catch (error) {
      console.error("Error getting allowance:", error);
      throw error;
    }
  }

  static async burn(amount: string): Promise<string> {
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const decimals = await contract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);
      
      const tx = await contract.burn(await signer.getAddress(), amountInWei);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error burning tokens:", error);
      throw new Error(parseContractError(error));
    }
  }

  static async mint(to: string, amount: string): Promise<string> {
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const decimals = await contract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);
      
      const tx = await contract.mint(to, amountInWei);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error minting tokens:", error);
      throw new Error(parseContractError(error));
    }
  }
}

export class FaucetContract {
  static async getFaucetBalance(): Promise<string> {
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, provider);
      const balance = await contract.faucetBalance();
      const tokenAddress = await contract.token();
      
      // Get token decimals
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
      const decimals = await tokenContract.decimals();
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Error getting faucet balance:", error);
      throw error;
    }
  }

  static async getClaimAmount(): Promise<string> {
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, provider);
      const amount = await contract.claimAmount();
      const tokenAddress = await contract.token();
      
      // Get token decimals
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
      const decimals = await tokenContract.decimals();
      
      return ethers.formatUnits(amount, decimals);
    } catch (error) {
      console.error("Error getting claim amount:", error);
      throw error;
    }
  }

  static async getCooldown(): Promise<number> {
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, provider);
      const cooldown = await contract.cooldown();
      return Number(cooldown);
    } catch (error) {
      console.error("Error getting cooldown:", error);
      throw error;
    }
  }

  static async getLastClaim(userAddress: string): Promise<number> {
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, provider);
      const lastClaim = await contract.lastClaim(userAddress);
      return Number(lastClaim);
    } catch (error) {
      console.error("Error getting last claim:", error);
      return 0; // Return 0 if no previous claim
    }
  }

  static async claim(): Promise<string> {
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, signer);
      
      const tx = await contract.claim();
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error claiming tokens:", error);
      throw new Error(parseContractError(error));
    }
  }

static async getFaucetData(userAddress: string): Promise<{
  claimAmount: string;
  faucetBalance: string;
  cooldown: number;
  lastClaimTime: number;
}> {
  try {
    const [claimAmount, faucetBalance, cooldown, lastClaimTime] = await Promise.all([
      this.getClaimAmount(),
      this.getFaucetBalance(),
      this.getCooldown(),
      this.getLastClaim(userAddress)
    ]);
    
    return {
      claimAmount,
      faucetBalance,
      cooldown,
      lastClaimTime
    };
  } catch (error) {
    console.error("Error getting faucet data:", error);
    throw error;
  }
}

static async withdrawTokens(amount: string, signerAddress: string): Promise<string> {
  try {
    const signer = await getSigner();
    const contract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, signer);
    
    // Check if caller is owner
    const owner = await contract.owner();
    if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error("Only owner can withdraw tokens");
    }
    
    // Get token contract to parse amount
    const tokenAddress = await contract.token();
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
    const decimals = await tokenContract.decimals();
    const amountInWei = ethers.parseUnits(amount, decimals);
    
    const tx = await contract.withdrawTokens(amountInWei);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("Error withdrawing tokens:", error);
    throw new Error(parseContractError(error));
  }
}

static async transferOwnership(newOwner: string): Promise<string> {
  try {
    const signer = await getSigner();
    const contract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, signer);
    
    const tx = await contract.transferOwnership(newOwner);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("Error transferring ownership:", error);
    throw new Error(parseContractError(error));
  }
}
}