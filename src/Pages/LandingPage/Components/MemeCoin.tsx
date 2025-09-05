import  { useEffect, useState } from 'react';
import './MemeCoin.css';
import Doge from '../../../assets/Original_Doge_meme.jpg';
import { ERC20TokenABI } from '../../../abi/erc';
import { ethers, formatUnits } from 'ethers';
import { useAppStore } from '../../../../Store';
import { useNavigate } from 'react-router-dom';
interface MemeCoinProps {
  tokenAddress: string;
  poolAddress: string;
}

function MemeCoin({ tokenAddress, poolAddress }: MemeCoinProps) {
  const navigate = useNavigate();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>('');
  const [tokenInfo, setTokenInfo] = useState({
    name: '',
    symbol: '',
    decimals: 18,
    totalSupply: '',
    totalSupplyRaw: '',
    ownerBalance: '',
    contractBalance: '',
    contractAddress: '',
  });
  const setTokenAddress = useAppStore((state) => state.setTokenAddress);
  const setPoolAddress = useAppStore((state) => state.setPoolAddress);

  // const tokenInf = useAppStore((state) => state.tokenInfo);
  const setTokenInf = useAppStore((state) => state.setTokenInfo);

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
  useEffect(() => {
    fetching();
  }, [provider, signer, tokenAddress, poolAddress]);

  const fetching = async () => {
    const contract2 = new ethers.Contract(tokenAddress, ERC20TokenABI, signer);
    const balance = await contract2.balanceOf(tokenAddress);
    const [_name, _symbol, _decimals, _totalSupply] = await Promise.all([
      contract2.name(),
      contract2.symbol(),
      contract2.decimals(),
      contract2.totalSupply(),
    ]);

    const ownerBalance = await contract2.balanceOf(address);

    const formattedTotalSupply = formatUnits(_totalSupply, _decimals);
    const formattedOwnerBalance = formatUnits(ownerBalance, _decimals);
    const formattedContractBalance = formatUnits(balance, _decimals);

    setTokenInfo({
      name: _name,
      symbol: _symbol,
      decimals: Number(_decimals),
      totalSupply: formattedTotalSupply,
      totalSupplyRaw: _totalSupply.toString(),
      ownerBalance: formattedOwnerBalance,
      contractBalance: formattedContractBalance,
      contractAddress: tokenAddress,
    });
  };
  const navigation = () => {
    setTokenInf(tokenInfo);
    setTokenAddress(tokenAddress);
    setPoolAddress(poolAddress);
    navigate('./traderplatform');
  };

  return (
    <div className="MemeCoin" onClick={navigation}>
      <div className="Coin">
        <img className="Coin_photu" src={Doge} alt="Meme Coin" />
        <div className="Coin_details">
          <h3>NAME: {tokenInfo?.name}</h3>
          <h3>SYMBOL: {tokenInfo?.symbol}</h3>
          <h3>SUPPLY: {tokenInfo?.totalSupply}</h3>
        </div>
      </div>
    </div>
  );
}

export default MemeCoin;
