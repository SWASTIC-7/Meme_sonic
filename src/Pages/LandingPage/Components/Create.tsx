import  { useState } from 'react';
import Doge from '../../../assets/Original_Doge_meme.jpg';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import './Create.css';
function Create() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [_address, setAddress] = useState<string>('');

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
  const navigation = () => {
    if (!signer || !provider) {
      connectWallet();
      navigate('/create');
      return;
    } else {
      navigate('/create');
    }
  };

  return (
    <div className="Create">
      <h2>KING OF THE HILL</h2>
      <div className="King">
        <img className="King_photu" src={Doge} alt="King of the Hill" />
        <div className="King_details">
          <h3>CREATED BY: SWASY</h3>
          <h3>MARKET CAP: 29K</h3>
          <h3>REPLIES: 89</h3>
          <h3>NAME: DOGE</h3>
        </div>
      </div>
      <div className="Token_bttn" onClick={navigation}>
        CREATE TOKEN
      </div>
      <h3 className="safe">Why are we safe?</h3>
    </div>
  );
}

export default Create;
