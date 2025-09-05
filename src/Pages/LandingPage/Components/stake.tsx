import { useEffect, useState } from 'react';
import { ethers, parseEther } from 'ethers';
// Replace with your actual deployed contract address
const CONTRACT_ADDRESS = '0x74d1C01FAAd6939316dc027193df2598EcD565c4';
const HbarStakingAbi = [
  {
    inputs: [],
    name: 'stake',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'Staked',
    type: 'event',
  },
  {
    inputs: [],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdrawn',
    type: 'event',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getStakeInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'withdrawn',
            type: 'bool',
          },
        ],
        internalType: 'struct HbarStaking.StakeInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'LOCK_PERIOD',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'STAKE_AMOUNT',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'stakes',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'withdrawn',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
const STAKE_AMOUNT = parseEther('1');

export default function HbarStake() {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [account, setAccount] = useState<string>('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (window.ethereum) {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(_provider);
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) return;

    try {
      const accounts = await provider.send('eth_requestAccounts', []);
      const _signer = await provider.getSigner();
      const _contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        HbarStakingAbi,
        _signer
      );

      setSigner(_signer);
      setAccount(accounts[0]);
      setContract(_contract);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStake = async () => {
    if (!contract || !signer) return;

    try {
      console.log(STAKE_AMOUNT.toString());
      const tx = await contract.stake({ value: STAKE_AMOUNT });
      setStatus('Staking in progress...');
      await tx.wait();
      setStatus('Staking successful!');
      const v = await contract.getStakeInfo(account);
      console.log('Stake Info:', v);
    } catch (error) {
      console.error(error);
      setStatus('Staking failed');
    }
  };

  const handleWithdraw = async () => {
    if (!contract || !signer) return;

    try {
      const tx = await contract.withdraw();
      setStatus('Withdrawal in progress...');
      await tx.wait();
      setStatus('Withdrawal successful!');
    } catch (error) {
      console.error(error);
      setStatus('Withdrawal failed or too early');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected as: {account}</p>
          <button onClick={handleStake}>Stake 1 HBAR</button>
          <button onClick={handleWithdraw}>Withdraw</button>
        </div>
      )}
      <p>{status}</p>
    </div>
  );
}
