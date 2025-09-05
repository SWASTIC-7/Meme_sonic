import { useState } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const RECEIVER_ADDRESS = '0x05fba803be258049a27b820088bab1cad2058871'; // Replace with actual destination

export default function SendHbar() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not detected');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWalletAddress(address);
      setStatus('Wallet connected: ' + address);
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
      setStatus('Connection error: ' + err.message);
    }
  };

  const sendHbar = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setStatus('Sending 10 HBAR...');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: RECEIVER_ADDRESS,
        value: ethers.parseEther('10'),
      });

      setStatus('Waiting for confirmation...');
      await tx.wait();

      setStatus(`✅ Sent 10 HBAR! TxHash: ${tx.hash}`);
    } catch (err: any) {
      console.error('Transaction failed:', err);
      setStatus('Error: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={connectWallet}>Connect MetaMask</button>
      <button onClick={sendHbar} disabled={!walletAddress}>
        Send 10 HBAR
      </button>
      <p>Status: {status}</p>
    </div>
  );
}
