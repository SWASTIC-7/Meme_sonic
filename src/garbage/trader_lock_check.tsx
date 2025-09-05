// import { useState } from 'react';
// import { ethers } from 'ethers';
// import { CONTRACT_ABI } from '../abi/trader_lock';

// const CONTRACT_ADDRESS = '0xd75bd600567e14a2d8415680E4491aFE47b61Ac0';

// function TraderLock() {
//   const [walletAddress, setWalletAddress] = useState<string>('');
//   const [amount, setAmount] = useState<string>('');
//   const [canBuyStatus, setCanBuyStatus] = useState<string>('');
//   const [canSellStatus, setCanSellStatus] = useState<string>('');
//   const [isRegistered, setIsRegistered] = useState<boolean>(false);

//   async function connectWallet() {
//     if (window.ethereum) {
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const accounts = await provider.send('eth_requestAccounts', []);
//       setWalletAddress(accounts[0]);
//     } else {
//       alert('Please install MetaMask.');
//     }
//   }

//   async function checkCanBuy() {
//     if (!window.ethereum || !walletAddress) return;
//     try {
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();

//       const contract = new ethers.Contract(
//         CONTRACT_ADDRESS,
//         CONTRACT_ABI,
//         signer
//       );
//       const [canBuy, reason] = await contract['canBuy'](
//         walletAddress,
//         BigInt(amount)
//       );

//       setCanBuyStatus(
//         canBuy ? `✅ Allowed: ${reason}` : `❌ Not Allowed: ${reason}`
//       );
//     } catch (err) {
//       console.error('Check Error:', err);
//       setCanBuyStatus('Error checking buy permission.');
//     }
//   }
//   async function checkCanSell() {
//     if (!window.ethereum || !walletAddress) return;
//     try {
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();

//       const contract = new ethers.Contract(
//         CONTRACT_ADDRESS,
//         CONTRACT_ABI,
//         signer
//       );
//       const [canSell, reason] = await contract['canSell'](
//         walletAddress,
//         BigInt(amount)
//       );

//       setCanSellStatus(
//         canSell ? `✅ Allowed: ${reason}` : `❌ Not Allowed: ${reason}`
//       );
//     } catch (err) {
//       console.error('Check Error:', err);
//       setCanSellStatus('Error checking sell permission.');
//     }
//   }
//   async function register() {
//     if (!window.ethereum || !walletAddress) return;
//     try {
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();

//       const contract = new ethers.Contract(
//         CONTRACT_ADDRESS,
//         CONTRACT_ABI,
//         signer
//       );
//       const tx = await contract.registerUser(BigInt(200000));
//       await tx.wait();

//       alert('Registration successful!');
//       setIsRegistered(true);
//     } catch (err) {
//       console.error('Registration Error:', err);
//     }
//   }
//   function rr() {
//     if (isRegistered) {
//       checkCanBuy();
//     } else {
//       register();
//       checkCanBuy();
//     }
//   }
//   function rr2() {
//     if (isRegistered) {
//       checkCanSell();
//     } else {
//       register();
//       checkCanSell();
//     }
//   }
//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <button type="button" onClick={connectWallet} className="mb-4">
//         Connect Wallet
//       </button>

//       <input
//         className="w-full mb-2 p-2 border"
//         type="number"
//         placeholder="Buy Amount"
//         value={amount}
//         onChange={(e) => setAmount(e.target.value)}
//       />

//       <button type="button" onClick={rr}>
//         Check Can Buy
//       </button>

//       {canBuyStatus && (
//         <div className="mt-4 p-2 border rounded bg-gray-100">
//           {canBuyStatus}
//         </div>
//       )}
//     </div>
//   );
// }

// export default TraderLock;
