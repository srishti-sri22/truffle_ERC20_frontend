import { ethers } from "ethers";

// export const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS_SEPOLIA as string;
// export const FAUCET_ADDRESS = process.env.FAUCET_ADDRESS_SEPOLIA as string;
export const TOKEN_ADDRESS = "0xfa8D28F3c28b7D4Cc44015bEC986b0c4D63CC7B8";
export const FAUCET_ADDRESS ="0xe746C6A272D50A90C134a3DE3fAC32f72c9528c1";

// Add error interfaces for better type safety
export interface CustomError {
  name: string;
  args: any[];
}

// Enhanced ABI with custom error definitions
export const tokenAbi = [
  "constructor(string name_, string symbol_, uint256 initialSupply_)",
  "function allowance(address tokenOwner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() pure returns (uint8)",
  "function name() view returns (string)",
  "function owner() view returns (address)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function burn(address account, uint256 amount)",
  "function burnFrom(address account, uint256 amount)",
  "function decreaseAllowance(address spender, uint256 subtractedValue) returns (bool)",
  "function increaseAllowance(address spender, uint256 addedValue) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function transferOwnership(address newOwner)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
] as const;

export const faucetAbi = [
  "constructor(address token_, uint256 claimAmount_, uint256 cooldown_)",
  "function claimAmount() view returns (uint256)",
  "function cooldown() view returns (uint256)",
  "function faucetBalance() view returns (uint256)",
  "function lastClaim(address user) view returns (uint256)",
  "function owner() view returns (address)",
  "function token() view returns (address)",
  "function claim()",
  "function transferOwnership(address newOwner)",
  "function withdrawTokens(uint256 amount)",
  "event Claimed(address indexed user, uint256 amount)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event TokensWithdrawn(address indexed to, uint256 amount)",
  "error CooldownActive(uint256 nextClaimTimestamp)",
  "error InsufficientFaucetBalance()",
  "error NotOwner()",
  "error TransferFailed()",
  "error ZeroAddress()"
] as const;

export function getProvider() {
  if (typeof window === "undefined") {
    throw new Error("Not in browser");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  return await provider.getSigner();
}

export function getTokenContract(providerOrSigner?: ethers.Provider | ethers.Signer) {
  const provider = providerOrSigner || getProvider();
  return new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);
}

export function getFaucetContract(providerOrSigner?: ethers.Provider | ethers.Signer) {
  const provider = providerOrSigner || getProvider();
  return new ethers.Contract(FAUCET_ADDRESS, faucetAbi, provider);
}

export async function getTokenContractWithSigner() {
  const signer = await getSigner();
  return getTokenContract(signer);
}

export async function getFaucetContractWithSigner() {
  const signer = await getSigner();
  return getFaucetContract(signer);
}

// Enhanced error parser that handles custom errors
export function parseContractError(error: any): string {
  console.log("Raw error:", error);
  
  if (error.code === 4001) {
    return "Transaction rejected by user";
  }
  
  if (error.code === "CALL_EXCEPTION") {
    // Check for custom errors based on error data
    const errorData = error.data;
    
    if (errorData) {
      // Check for specific custom error signatures
      // 0xc1ab61a1 = CooldownActive(uint256)
      if (errorData.startsWith("0xc1ab61a1")) {
        try {
          // Decode the nextClaimTimestamp from the error data
          const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
            ["uint256"],
            "0x" + errorData.slice(10)
          );
          const nextClaimTimestamp = decoded[0];
          const now = Math.floor(Date.now() / 1000);
          const timeLeft = Number(nextClaimTimestamp) - now;
          
          if (timeLeft > 0) {
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            return `Cooldown active. Next claim available in ${hours}h ${minutes}m`;
          }
        } catch (e) {
          console.log("Error decoding CooldownActive:", e);
        }
        return "Cooldown period is still active";
      }
      
      // 0x1cd3f4d3 = InsufficientFaucetBalance()
      if (errorData.startsWith("0x1cd3f4d3")) {
        return "Faucet has insufficient balance";
      }
      
      // 0x30cd7471 = NotOwner()
      if (errorData.startsWith("0x30cd7471")) {
        return "Only contract owner can perform this action";
      }
      
      // 0x90b8ec18 = TransferFailed()
      if (errorData.startsWith("0x90b8ec18")) {
        return "Token transfer failed";
      }
      
      // 0xd92e233d = ZeroAddress()
      if (errorData.startsWith("0xd92e233d")) {
        return "Zero address not allowed";
      }
    }
  }
  
  if (error.reason) {
    return error.reason;
  }
  
  if (error.message) {
    const msg = error.message.toLowerCase();
    if (msg.includes("insufficient balance")) return "Insufficient balance";
    if (msg.includes("cooldown")) return "Cooldown period active";
    if (msg.includes("not owner") || msg.includes("ownable")) return "Only owner can perform this action";
    if (msg.includes("transfer failed")) return "Token transfer failed";
    if (msg.includes("zero address")) return "Invalid address";
    
    return error.message;
  }
  
  return "Transaction failed";
}