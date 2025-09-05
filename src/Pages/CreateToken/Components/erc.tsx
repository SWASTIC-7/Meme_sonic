// CreateToken.tsx
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ERC20TokenABI, ERC20TokenBytecode } from '../../../abi/erc';

export default function CreateToken() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('');

  const connectWallet = async () => {
    if (window.ethereum) {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const newSigner = await newProvider.getSigner();
      const userAddress = await newSigner.getAddress();
      setProvider(newProvider);
      setSigner(newSigner);
      setAddress(userAddress);
    } else {
      alert('MetaMask not detected');
    }
  };
  useEffect(() => {
    connectWallet();
  }, []);

  const deployToken = async () => {
    if (!signer || !provider) return;

    const name = 'MyDynamicToken';
    const symbol = 'MDTd';
    const initialSupply = 10000; // In whole tokens, not wei
    const nonce = await provider.getTransactionCount(address, 'latest');

    const factory = new ethers.ContractFactory(
      ERC20TokenABI,
      ERC20TokenBytecode,
      signer
    );
    const contract = await factory.deploy(
      name,
      symbol,
      address,
      initialSupply,
      { nonce }
    );
    await contract.waitForDeployment();

    const deployedAddress = await contract.getAddress();
    setContractAddress(deployedAddress);

    const deploymentTx = contract.deploymentTransaction();
    setTxHash(deploymentTx ? deploymentTx.hash : '');

    const contract2 = new ethers.Contract(
      deployedAddress,
      ERC20TokenABI,
      signer
    );
    const balance = await contract2.balanceOf(deployedAddress);
    console.log(
      `Deployed token at ${deployedAddress} with balance: ${balance.toString()}`
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={connectWallet}>Connect Wallet</button>
      {address && <p>Connected: {address}</p>}

      <button onClick={deployToken} disabled={!signer}>
        Deploy MyToken
      </button>

      {txHash && (
        <p>
          Transaction Hash:{' '}
          <a
            href={`https://hashscan.io/testnet/transaction/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {txHash}
          </a>
        </p>
      )}
      {contractAddress && <p>Deployed Token Address: {contractAddress}</p>}
    </div>
  );
}
