import { ethers } from 'ethers';
import ReceiptRegistryABI from '../contracts/abi/ReceiptRegistryABI.json';

const ALCHEMY_RPC_URL = 'https://sepolia.infura.io/v3/0f2b412917604f378b52068c34bb9f4d';
const PRIVATE_KEY = '0x37635b6032ef794b8274efea2f95aed2a93f5ecb5acbb379d5867a4f2183dd3d';
const CONTRACT_ADDRESS = '0x84fFC34FC61606B5FD53fe94fb50BC90440d6426'; // Replace with your deployed address

// Set up provider and signer
const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ReceiptRegistryABI, wallet);

/**
 * Register a receipt on-chain
 * @param hash SHA-256 hash of the receipt image (hex string with 0x)
 * @param receiptId ID from QR code
 * @param currency optional currency string (can be empty or hardcoded for now)
 */
export async function registerReceiptOnChain(hash: string, receiptId: Number, currency = "PHP") {
  try {
      if (!ethers.isHexString(hash) || ethers.dataLength(hash) !== 32) {
      throw new Error("Invalid hash: must be 32 bytes and hex formatted.");
    }
    const currencyBytes32 = ethers.encodeBytes32String(currency); // Convert to bytes32
    const tx = await contract.storeReceipt(hash, receiptId, currencyBytes32);
    const receipt = await tx.wait();
    return receipt;
  } catch (err) {
    console.error("Blockchain error:", err);
    throw err;
  }
}