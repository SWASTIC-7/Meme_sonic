import { useState } from 'react';
import { ethers } from 'ethers';

// Replace with your contract address
const CONTRACT_ADDRESS = '0xf8e81D47203A594245E36C48e151709F0C19fBe8';

// Replace with your ABI
const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'CallResponseEvent',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'treasury',
        type: 'address',
      },
      {
        internalType: 'int64',
        name: 'initialTotalSupply',
        type: 'int64',
      },
      {
        internalType: 'int32',
        name: 'decimals',
        type: 'int32',
      },
    ],
    name: 'createToken',
    outputs: [
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'encodedFunctionSelector',
        type: 'bytes',
      },
    ],
    name: 'redirectForToken',
    outputs: [
      {
        internalType: 'int256',
        name: 'responseCode',
        type: 'int256',
      },
      {
        internalType: 'bytes',
        name: 'response',
        type: 'bytes',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'int64',
        name: 'responseCode',
        type: 'int64',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'serialNumber',
        type: 'uint256',
      },
    ],
    name: 'transferFromNFT',
    outputs: [
      {
        internalType: 'int64',
        name: 'responseCode',
        type: 'int64',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export default function TokenCreateForm() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function connectWallet() {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    setWalletAddress(accounts[0]);
  }

  async function handleCreateToken() {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const name = 'MyToken';
      const symbol = 'MTK';
      const treasury = walletAddress;
      const initialTotalSupply = 1_000_000;
      const decimals = 2;

      const tx = await contract.createToken(
        name,
        symbol,
        treasury,
        initialTotalSupply,
        decimals
      );
      const receipt = await tx.wait();

      const logs = receipt.logs;
      const iface = new ethers.Interface(CONTRACT_ABI);
      const parsed = iface.parseLog(logs[0]);
      if (parsed && parsed.args && parsed.args[0]) {
        const createdTokenAddress = parsed.args[0];
        setTokenAddress(createdTokenAddress);
      } else {
        throw new Error('Failed to parse token address from logs.');
      }
    } catch (err) {
      console.error('Token creation failed:', err);
      alert('Token creation failed: see console');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <button
        onClick={connectWallet}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Connect Wallet
      </button>

      {walletAddress && <p>Connected: {walletAddress}</p>}

      <button
        onClick={handleCreateToken}
        className="bg-green-600 text-white px-4 py-2 mt-4 rounded"
        disabled={loading}
      >
        {loading ? 'Creating Token...' : 'Create Token'}
      </button>

      {tokenAddress && (
        <p className="mt-4 text-green-600">
          Token created at address:{' '}
          <span className="font-mono">{tokenAddress}</span>
        </p>
      )}
    </div>
  );
}
