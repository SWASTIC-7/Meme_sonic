import  { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import './creatortrade.css';
import Doge from '../../../assets/Original_Doge_meme.jpg';
import { PumpFunPoolABI } from '../../../abi/pool_abi';
import { useAppStore } from '../../../../Store';
import { ERC20TokenABI } from '../../../abi/erc';
import { parseEther,  isAddress } from 'ethers';

import { CONTRACT_ABI } from '../../../abi/creator_lock';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

function creatortrade() {
  interface PoolStats {
    currentPrice: string;
    marketCap: string;
    totalHbarRaised: string;
    tokensRemaining: string;
    isGraduated: boolean;
    progressToGraduation: string;
    priceInUSD: string;
  }

  type DataPoint = {
    time: string; // X-axis
    value: number; // Y-axis
  };
  const [loading, setLoading] = useState<boolean>(false);
  const [_provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>('');
  const [buyAmount, setBuyAmount] = useState<string>('');
  const [sellAmount, setSellAmount] = useState<string>('');
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
  const [_txHash, setTxHash] = useState<string>('');
  const [_userTokenBalance, setUserTokenBalance] = useState<string>('0');
  const [estimatedBuyTokens, setEstimatedBuyTokens] = useState<string>('0');
  const [estimatedSellHbar, setEstimatedSellHbar] = useState<string>('0');
  const [data, setData] = useState<DataPoint[]>([]);
  const [ImmediatePrice, setImmediatePrice] = useState<string>('0');
  const contractAddress = '0xd03d1582A42a9c56DE60Cb638bA14c16f10f3771';
  const [graduationProgress, _setGraduationProgress] = useState<number>(0);
  const [totalTokens, _setTotalTokens] = useState<string>('1000000');
  const [saleAmount, _setSaleAmount] = useState<string>('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [canSellTokens, setCanSellTokens] = useState<boolean>(false);

  const [_isLoading, setIsLoading] = useState<boolean>(false);
  const [_message, setMessage] = useState<string>('');
  const [_messageType, setMessageType] = useState<'success' | 'error' | 'info'>(
    'info'
  );

  const tokenAddress = useAppStore((state) => state.tokenAddress);
  const poolAddress = useAppStore((state) => state.poolAddress);
  const setPoolStat = useAppStore((state) => state.setPoolStats);
  const tokenInfo = useAppStore((state) => state.tokenInfo);

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
  const priceRef = useRef(ImmediatePrice);
  useEffect(() => {
    priceRef.current = ImmediatePrice;
  }, [ImmediatePrice]);
  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = parseFloat(priceRef.current);
      const timestamp = new Date().toLocaleTimeString();

      setData((prevData) => [
        ...prevData,
        { time: timestamp, value: newValue },
      ]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (poolAddress && signer) {
      const interval = setInterval(() => {
        fetchPoolStats();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [poolAddress, signer]);
  useEffect(() => {
    connectWallet();
    fetchPoolStats();
  }, []);
  useEffect(() => {
    initializeContract();
  }, [signer, contractAddress]);

  const initializeContract = () => {
    if (signer && contractAddress && isAddress(contractAddress)) {
      const contractInstance = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);
      setMessage('Contract initialized successfully');
      setMessageType('success');
    } else {
      setMessage('Please provide a valid contract address and connect wallet');
      setMessageType('error');
    }
  };
  const checkCanSell = async () => {
    if (!contract || !address || !saleAmount) {
      setMessage(
        'Please connect wallet, initialize contract, and enter sale amount'
      );
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      const totalTokensWei = parseEther(totalTokens);
      const saleAmountWei = parseEther(saleAmount);

      const canSell = await contract.canSell(
        address,
        graduationProgress,
        totalTokensWei,
        saleAmountWei
      );

      setCanSellTokens(canSell);
      setMessage(canSell ? 'Sale is allowed!' : 'Sale is not allowed');
      setMessageType(canSell ? 'success' : 'error');
    } catch (error) {
      console.error('Error checking sale:', error);
      setMessage('Error checking sale conditions');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBalances = async () => {
    if (!tokenAddress || !signer || !address) return;

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20TokenABI,
        signer
      );
      const balance = await tokenContract.balanceOf(address);
      setUserTokenBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
  };

  const buyTokens = async () => {
    if (!poolAddress || !signer || !buyAmount) return;

    setLoading(true);
    try {
      const pool = new ethers.Contract(poolAddress, PumpFunPoolABI, signer);
      const hbarAmount = ethers.parseEther(buyAmount);

      const tx = await pool.buyTokens({ value: hbarAmount });
      await tx.wait();

      setTxHash(tx.hash);
      setBuyAmount('');

      await fetchPoolStats();
      await fetchUserBalances();

      alert('Tokens purchased successfully!');
    } catch (error) {
      console.error('Error buying tokens:', error);
      alert('Error buying tokens');
    } finally {
      setLoading(false);
    }
  };

  const sellTokens = async () => {
    if (!poolAddress || !signer || !sellAmount || !tokenAddress) return;

    setLoading(true);
    try {
      const tokenAmount = ethers.parseEther(sellAmount);

      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20TokenABI,
        signer
      );
      const approveTx = await tokenContract.approve(poolAddress, tokenAmount);
      await approveTx.wait();

      const pool = new ethers.Contract(poolAddress, PumpFunPoolABI, signer);
      const tx = await pool.sellTokens(tokenAmount);
      await tx.wait();

      setTxHash(tx.hash);
      setSellAmount('');

      await fetchPoolStats();
      await fetchUserBalances();

      alert('Tokens sold successfully!');
    } catch (error) {
      console.error('Error selling tokens:', error);
      alert('Error selling tokens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const updateEstimate = async () => {
      if (!buyAmount || isNaN(Number(buyAmount))) {
        setEstimatedBuyTokens('0');
        return;
      }
      const tokens = await calculateTokensForHbar(buyAmount);
      setEstimatedBuyTokens(tokens);
    };
    updateEstimate();
  }, [buyAmount, poolAddress, signer]);

  useEffect(() => {
    const updateEstimate = async () => {
      if (!sellAmount || isNaN(Number(sellAmount))) {
        setEstimatedSellHbar('0');
        return;
      }
      const hbar = await calculateHbarForTokens(sellAmount);
      setEstimatedSellHbar(hbar);
    };
    updateEstimate();
  }, [sellAmount, poolAddress, signer]);

  const calculateTokensForHbar = async (hbarAmount: string) => {
    if (!poolAddress || !signer || !hbarAmount) return '0';

    try {
      const pool = new ethers.Contract(poolAddress, PumpFunPoolABI, signer);
      const tokens = await pool.getTokensForHbar(ethers.parseEther(hbarAmount));
      return ethers.formatEther(tokens);
    } catch (error) {
      return '0';
    }
  };

  const calculateHbarForTokens = async (tokenAmount: string) => {
    if (!poolAddress || !signer || !tokenAmount) return '0';

    try {
      const pool = new ethers.Contract(poolAddress, PumpFunPoolABI, signer);
      const hbar = await pool.getHbarForTokens(ethers.parseEther(tokenAmount));
      return ethers.formatEther(hbar);
    } catch (error) {
      return '0';
    }
  };

  useEffect(() => {
    console.log('Immediate Price updated:', ImmediatePrice);
  }, [ImmediatePrice]);

  const fetchPoolStats = async () => {
    if (!poolAddress || !signer) return;
    console.log('Fetching pool stats for address:', poolAddress);
    try {
      const pool = new ethers.Contract(poolAddress, PumpFunPoolABI, signer);

      const [currentPrice, stats, priceInUSD, graduated, hbarReserves] =
        await Promise.all([
          pool.getCurrentPrice().catch(() => ethers.parseEther('0')),
          pool.getPoolStats().catch(() => [0, 0, 0, 0, false, 0]),
          pool.getTokenPriceInUSD().catch(() => 0),
          pool.graduated().catch(() => false),
          pool.realHbarReserves().catch(() => ethers.parseEther('0')),
        ]);

      // const graduationCap = ethers.parseEther('69'); // 69 HBAR
      const progressPercent =
        hbarReserves > 0
          ? Math.min((Number(ethers.formatEther(hbarReserves)) / 69) * 100, 100)
          : 0;
      setImmediatePrice(ethers.formatEther(currentPrice));
      // console.log("Pool Stats Debug:", {
      //   currentPrice: ethers.formatEther(currentPrice),
      //   stats: stats.map ? stats.map((s: unknown) => String(s)) : stats,
      //   priceInUSD: priceInUSD.toString(),
      //   graduated,
      //   hbarReserves: ethers.formatEther(hbarReserves),
      //   progressPercent
      // });

      setPoolStat({
        currentPrice: ethers.formatEther(currentPrice),
        marketCap: stats[1] ? ethers.formatEther(stats[1]) : '0',
        totalHbarRaised: ethers.formatEther(hbarReserves),
        tokensRemaining: stats[3] ? ethers.formatEther(stats[3]) : '0',
        isGraduated: graduated,
        progressToGraduation: progressPercent.toFixed(2),
        priceInUSD: (Number(priceInUSD) / 100).toFixed(6), // Convert from cents to dollars
      });
      setPoolStats({
        currentPrice: ethers.formatEther(currentPrice),
        marketCap: stats[1] ? ethers.formatEther(stats[1]) : '0',
        totalHbarRaised: ethers.formatEther(hbarReserves),
        tokensRemaining: stats[3] ? ethers.formatEther(stats[3]) : '0',
        isGraduated: graduated,
        progressToGraduation: progressPercent.toFixed(2),
        priceInUSD: (Number(priceInUSD) / 100).toFixed(6), // Convert from cents to dollars
      });

      // console.log("Pool Stats:", poolSta);
    } catch (error) {
      console.error('Error fetching pool stats:', error);
    }
  };

  const selling = () => {
    checkCanSell();
    if (canSellTokens) {
      sellTokens();
    } else {
      alert('You cannot sell tokens at this time.');
    }
  };
  return (
    <>
      <h1 className="Halo trans">TRADE</h1>
      <div className="MemeCointrade" onClick={fetchPoolStats}>
        <div className="Coindeployed">
          <img className="Coin_photo" src={Doge} alt="King of the Hill" />
          <div className="Coin_detail">
            <h3>CREATED BY: {tokenInfo?.name}</h3>
            <h3>SYMBOL: {tokenInfo?.symbol}</h3>
            <h3>TOTAL SUPPLY: {tokenInfo?.totalSupply}</h3>
          </div>
        </div>
        <div className="tt">
          {poolStats && (
            <div className="PoolStats">
              <h3>Pool Statistics</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                }}
              >
                <p>
                  <strong>Current Price:</strong>{' '}
                  {(parseFloat(poolStats.currentPrice) * 10 ** 5).toFixed(8)}{' '}
                  1e5 HBAR
                </p>
                <p>
                  <strong>Price in USD:</strong> ${poolStats.priceInUSD}
                </p>
                <p>
                  <strong>Market Cap:</strong> {(69.0).toFixed(4)} HBAR
                </p>
                <p>
                  <strong>Total HBAR Raised:</strong>{' '}
                  {(parseFloat(poolStats.totalHbarRaised) * 10 ** 10).toFixed(
                    4
                  )}{' '}
                  1e10 HBAR
                </p>
                <p>
                  <strong>Tokens Remaining:</strong>{' '}
                  {parseFloat(poolStats.tokensRemaining).toFixed(2)}
                </p>
                <p>
                  <strong>Graduation Progress:</strong>{' '}
                  {(Number(poolStats.progressToGraduation) * 10 ** 10).toFixed(
                    2
                  )}{' '}
                  1e10%
                </p>
              </div>
              {poolStats.isGraduated && (
                <div
                  style={{
                    color: 'green',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginTop: '10px',
                  }}
                >
                  Pool Graduated!
                </div>
              )}
            </div>
          )}
          <LineChart width={600} height={300} data={data}>
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="time" />
            <YAxis domain={[0.000000005, 0.00000004]} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#1DB4FF" />
          </LineChart>
        </div>
      </div>

      <div className="trade-options">
        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid #green',
            borderRadius: '8px',
          }}
        >
          <h3>BUY TOKENS</h3>
          <input
            type="number"
            placeholder="HBAR amount"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            className="buy-input"
          />

          <button
            onClick={buyTokens}
            disabled={!poolAddress || !buyAmount || loading}
            className="buy-btn"
          >
            {loading ? 'Buying...' : 'Buy Tokens'}
          </button>
          {buyAmount && (
            <p>
              You will receive: ~{parseFloat(estimatedBuyTokens).toFixed(2)}{' '}
              tokens
            </p>
          )}
        </div>

        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid #red',
            borderRadius: '8px',
          }}
          className="sell-container"
        >
          <h3>SELL TOKENS</h3>
          <input
            type="number"
            placeholder="Token amount"
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
            className="sell-input"
          />

          <button
            onClick={selling}
            disabled={!poolAddress || !sellAmount || loading}
            className="sell-btn"
          >
            {loading ? 'Selling...' : 'Sell Tokens'}
          </button>
          {sellAmount && (
            <p>
              You will receive: ~{parseFloat(estimatedSellHbar).toFixed(2)} HBAR
            </p>
          )}
        </div>
      </div>
      {poolAddress && <p>Pool Address: {poolAddress}</p>}
      {signer && <p>Connected Wallet: {address}</p>}
    </>
  );
}

export default creatortrade;
