import './createForm.css';
import { useEffect, useState } from 'react';
import { ethers, formatUnits } from 'ethers';
import { ERC20TokenABI, ERC20TokenBytecode } from '../../../abi/erc';
import { PumpFunPoolABI, PumpFunPoolBytecode } from '../../../abi/pool_abi';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../../Store';

function createForm() {
  const [_loading, setLoading] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>('');
  const [_txHash, setTxHash] = useState<string>('');
  const [_contractAddress, setContractAddress] = useState<string>('');
  const [tokenName, setTokenName] = useState('');
  const [Symbol, setSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('');

  const [_poolAddress, setPoolAddress] = useState<string>('');
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const navigate = useNavigate();

  const setTokenAddres = useAppStore((state) => state.setTokenAddress);
  const setPoolAddres = useAppStore((state) => state.setPoolAddress);
  const tokenAddre = useAppStore((state) => state.tokenAddress);
  const poolAddre = useAppStore((state) => state.poolAddress);
  const setTokenInf = useAppStore((state) => state.setTokenInfo);
  type TokenInfo = {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    totalSupplyRaw: string;
    ownerBalance: string;
    contractBalance: string;
    contractAddress: string;
  };

  const [_tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

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

    const name = tokenName || 'DefaultTokenName';
    const symbol = Symbol || 'DTN';
    const initialSupply = totalSupply || 10000;
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
    setTokenAddress(deployedAddress);
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
    const [_name, _symbol, _decimals, _totalSupply] = await Promise.all([
      contract2.name(),
      contract2.symbol(),
      contract2.decimals(),
      contract2.totalSupply(),
    ]);

    const ownerBalance = await contract2.balanceOf(address);

    const formattedTotalSupply = formatUnits(totalSupply, _decimals);
    const formattedOwnerBalance = formatUnits(ownerBalance, _decimals);
    const formattedContractBalance = formatUnits(balance, _decimals);
    setTokenAddres(deployedAddress);
    setTokenInfo({
      name: _name,
      symbol: _symbol,
      decimals: Number(_decimals),
      totalSupply: formattedTotalSupply,
      totalSupplyRaw: _totalSupply.toString(),
      ownerBalance: formattedOwnerBalance,
      contractBalance: formattedContractBalance,
      contractAddress: deployedAddress,
    });
    setTokenInf({
      name: _name,
      symbol: _symbol,
      decimals: Number(_decimals),
      totalSupply: formattedTotalSupply,
      totalSupplyRaw: _totalSupply.toString(),
      ownerBalance: formattedOwnerBalance,
      contractBalance: formattedContractBalance,
      contractAddress: deployedAddress,
    });

    console.log('Token Info:', {
      name: _name,
      symbol: _symbol,
      decimals: Number(_decimals),
      totalSupply: formattedTotalSupply,
      totalSupplyRaw: _totalSupply.toString(),
      ownerBalance: formattedOwnerBalance,
      contractBalance: formattedContractBalance,
      contractAddress: deployedAddress,
    });
    alert(`Token deployed successfully at ${deployedAddress}`);
  };

  const deployPool = async () => {
    if (!signer || !tokenAddress) return;

    setLoading(true);
    try {
      const factory = new ethers.ContractFactory(
        PumpFunPoolABI,
        PumpFunPoolBytecode,
        signer
      );
      const poolDeployment = await factory.deploy(tokenAddress, address);
      await poolDeployment.waitForDeployment();

      const deployedAddress = await poolDeployment.getAddress();
      setPoolAddress(deployedAddress);

      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20TokenABI,
        signer
      );
      const totalSupply = await tokenContract.totalSupply();
      const poolTokens = (totalSupply * 80n) / 100n; // 80%

      const approveTx = await tokenContract.approve(
        deployedAddress,
        poolTokens
      );
      await approveTx.wait();

      const pool = new ethers.Contract(deployedAddress, PumpFunPoolABI, signer);
      const initTx = await pool.initializePool(poolTokens);
      await initTx.wait();

      setTxHash(initTx.hash);
      alert(
        `Pool deployed and initialized successfully! Address: ${deployedAddress}`
      );

      setPoolAddres(deployedAddress);
      console.log('Token Address:', tokenAddre);
      console.log('Pool Address:', poolAddre);

      navigate('/creatorplatform');
    } catch (error) {
      console.error('Error deploying pool:', error);
      alert('Error deploying pool');
    } finally {
      setLoading(false);
    }
  };

  //pool address
  //0x6f889a89Ab9EBce0EAEeAbD14cDE8835E53F98b7

  return (
    <div className="createFormContainer">
      <div className="createForm">
        <h1 className="Halo">CREATE</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <label>
            TOKEN NAME:
            <input
              type="text"
              name="tokenName"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            SYMBOL:
            <input
              type="text"
              name="symbol"
              value={Symbol}
              onChange={(e) => setSymbol(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            TOTAL SUPPLY:
            <input
              type="number"
              name="totalSupply"
              value={totalSupply}
              onChange={(e) => setTotalSupply(e.target.value)}
              required
            />
          </label>
          <br />
          <button className="submit_btn" type="submit" onClick={deployToken}>
            CREATE COIN
          </button>
          <button className="deploy_btn" type="submit" onClick={deployPool}>
            DEPLOY
          </button>
        </form>
      </div>
    </div>
  );
}

export default createForm;
