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

const DEPLOYER_ADDRESS = "0x5c876847c2a93E231E00A93386D5F0514B6Dc641";

export class TokenContract {
  static async getBalance(address: string): Promise<string> {
    const provider = getProvider();
    const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    return ethers.formatUnits(balance, decimals);
  }

  static async getTotalSupply(): Promise<string> {
    const provider = getProvider();
    const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);
    const totalSupply = await contract.totalSupply();
    const decimals = await contract.decimals();
    return ethers.formatUnits(totalSupply, decimals);
  }

  static async getTokenInfo(): Promise<{ name: string; symbol: string }> {
    const provider = getProvider();
    const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);
    const [name, symbol] = await Promise.all([
      contract.name(),
      contract.symbol()
    ]);
    return { name, symbol };
  }

  static async getOwner(): Promise<string> {
    const provider = getProvider();
    const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);
    return await contract.owner();
  }

  static async getAllowance(owner: string, spender: string): Promise<string> {
    const provider = getProvider();
    const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);
    const allowance = await contract.allowance(owner, spender);
    const decimals = await contract.decimals();
    return ethers.formatUnits(allowance, decimals);
  }

  static async transfer(to: string, amount: string): Promise<string> {
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const decimals = await contract.decimals();
      const value = ethers.parseUnits(amount, decimals);
      const tx = await contract.transfer(to, value);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(parseContractError(error));
    }
  }

  static async approve(spender: string, amount: string): Promise<string> {
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const decimals = await contract.decimals();
      const value = ethers.parseUnits(amount, decimals);
      const tx = await contract.approve(spender, value);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(parseContractError(error));
    }
  }

  static async increaseAllowance(spender: string, amount: string): Promise<string> {
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const decimals = await contract.decimals();
      const value = ethers.parseUnits(amount, decimals);
      const tx = await contract.increaseAllowance(spender, value);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(parseContractError(error));
    }
  }

  static async decreaseAllowance(spender: string, amount: string): Promise<string> {
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const decimals = await contract.decimals();
      const value = ethers.parseUnits(amount, decimals);
      const tx = await contract.decreaseAllowance(spender, value);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(parseContractError(error));
    }
  }

  static async burn(amount: string): Promise<string> {
    try {
      const signer = await getSigner();
      const signerAddress = await signer.getAddress();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      if (signerAddress.toLowerCase() !== DEPLOYER_ADDRESS) {
        throw new Error("Only the contract owner can mint tokens");
      }
      const decimals = await contract.decimals();
      const value = ethers.parseUnits(amount, decimals);
      const tx = await contract.burn(await signer.getAddress(), value);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(parseContractError(error));
    }
  }

  static async burnFrom(account: string, amount: string): Promise<string> {
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const decimals = await contract.decimals();
      const value = ethers.parseUnits(amount, decimals);
      const tx = await contract.burnFrom(account, value);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(parseContractError(error));
    }
  }

  static async mint(to: string, amount: string): Promise<string> {
    try {
      const signer = await getSigner();
      const signerAddress = await signer.getAddress();

      const provider = getProvider();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);

      const owner = await contract.owner(); // get the owner from the contract

      if (signerAddress.toLowerCase() !== DEPLOYER_ADDRESS) {
        throw new Error("Only the contract owner can mint tokens");
      }

      const decimals = await contract.decimals();
      const value = ethers.parseUnits(amount, decimals);

      const tx = await contract.mint(to, value);
      await tx.wait();
      return tx.hash;

    } catch (error: any) {
      throw new Error(parseContractError(error));
    }
  }



  static async transferOwnership(newOwner: string): Promise<string> {
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const tx = await contract.transferOwnership(newOwner);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(parseContractError(error));
    }
  }
}

export class FaucetContract {
  static async getFaucetBalance(): Promise<string> {
    const provider = getProvider();
    const contract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, provider);
    const balance = await contract.faucetBalance();
    const tokenAddress = await contract.token();
    const token = new ethers.Contract(tokenAddress, tokenAbi, provider);
    const decimals = await token.decimals();
    return ethers.formatUnits(balance, decimals);
  }

  static async getClaimAmount(): Promise<string> {
    const provider = getProvider();
    const contract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, provider);
    const amount = await contract.claimAmount();
    const tokenAddress = await contract.token();
    const token = new ethers.Contract(tokenAddress, tokenAbi, provider);
    const decimals = await token.decimals();
    return ethers.formatUnits(amount, decimals);
  }

  static async getCooldown(): Promise<number> {
    const provider = getProvider();
    const contract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, provider);
    return Number(await contract.cooldown());
  }

  static async getLastClaim(user: string): Promise<number> {
    const provider = getProvider();
    const contract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, provider);
    return Number(await contract.lastClaim(user));
  }

  static async claim(): Promise<string> {
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, signer);
      const tx = await contract.claim();
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(parseContractError(error));
    }
  }

  static async withdrawTokens(amount: string): Promise<string> {
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, signer);
      const tokenAddress = await contract.token();
      const token = new ethers.Contract(tokenAddress, tokenAbi, signer);
      const decimals = await token.decimals();
      const value = ethers.parseUnits(amount, decimals);
      const tx = await contract.withdrawTokens(value);
      await tx.wait();
      return tx.hash;
    } catch (error) {
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
      throw new Error(parseContractError(error));
    }
  }

  static async getFaucetData(user?: string): Promise<{
    faucetBalance: string;
    claimAmount: string;
    cooldown: number;
    lastClaimTime: number;
  }> {
    const [balance, claimAmount, cooldown] = await Promise.all([
      this.getFaucetBalance(),
      this.getClaimAmount(),
      this.getCooldown()
    ]);

    let lastClaimTime = 0;
    if (user) {
      lastClaimTime = await this.getLastClaim(user);
    }

    return {
      faucetBalance: balance,
      claimAmount,
      cooldown,
      lastClaimTime
    };
  }


  static async refreshAllTokens(userAddress?: string): Promise<{
    tokenInfo: { name: string; symbol: string };
    totalSupply: string;
    owner: string;
    balance: string;
    allowance: string;
  }> {
    try {
      const tokenInfo = await TokenContract.getTokenInfo();
      const totalSupply = await TokenContract.getTotalSupply();
      const owner = await TokenContract.getOwner();

      let balance = "0";
      let allowance = "0";

      if (userAddress) {
        [balance, allowance] = await Promise.all([
          TokenContract.getBalance(userAddress),
          TokenContract.getAllowance(userAddress, "0x0000000000000000000000000000000000000000") // Default to zero address
        ]);
      }

      return {
        tokenInfo,
        totalSupply,
        owner,
        balance,
        allowance
      };
    } catch (error) {
      console.error("Error refreshing token data:", error);
      throw new Error(parseContractError(error));
    }
  }

}
