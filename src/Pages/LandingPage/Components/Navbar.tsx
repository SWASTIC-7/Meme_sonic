import  { useState} from 'react';
import Logo from '../../../assets/Logo.svg';
// import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import { ethers } from 'ethers';

function Navbar() {
  // const navigate = useNavigate();

  const [_provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [_signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>('');

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

  const formatAddress = (addr: string) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  };

  return (
    <div className="Nav">
      <img src={Logo} alt="Logo" className="Logo" />

      <div className="Nav_bttns">
        <div className="Register Nav_Box" onClick={connectWallet}>
          {address ? formatAddress(address) : 'CONNECT WALLET'}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
