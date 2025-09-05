// import React, { useState, useEffect } from 'react';
// import { ethers, parseEther, formatEther, isAddress } from 'ethers';
// import {
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   TrendingUp,
//   Wallet,
// } from 'lucide-react';

// const CONTRACT_ABI = [
//   {
//     inputs: [],
//     stateMutability: 'nonpayable',
//     type: 'constructor',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'owner',
//         type: 'address',
//       },
//     ],
//     name: 'OwnableInvalidOwner',
//     type: 'error',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'account',
//         type: 'address',
//       },
//     ],
//     name: 'OwnableUnauthorizedAccount',
//     type: 'error',
//   },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: true,
//         internalType: 'address',
//         name: 'user',
//         type: 'address',
//       },
//       {
//         indexed: false,
//         internalType: 'uint256',
//         name: 'milestone',
//         type: 'uint256',
//       },
//       {
//         indexed: false,
//         internalType: 'uint256',
//         name: 'timestamp',
//         type: 'uint256',
//       },
//     ],
//     name: 'MilestoneReached',
//     type: 'event',
//   },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: true,
//         internalType: 'address',
//         name: 'previousOwner',
//         type: 'address',
//       },
//       {
//         indexed: true,
//         internalType: 'address',
//         name: 'newOwner',
//         type: 'address',
//       },
//     ],
//     name: 'OwnershipTransferred',
//     type: 'event',
//   },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: true,
//         internalType: 'address',
//         name: 'user',
//         type: 'address',
//       },
//       {
//         indexed: false,
//         internalType: 'uint256',
//         name: 'timestamp',
//         type: 'uint256',
//       },
//     ],
//     name: 'PostGraduationMode',
//     type: 'event',
//   },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: true,
//         internalType: 'address',
//         name: 'user',
//         type: 'address',
//       },
//       {
//         indexed: false,
//         internalType: 'uint256',
//         name: 'amount',
//         type: 'uint256',
//       },
//       {
//         indexed: false,
//         internalType: 'uint256',
//         name: 'milestone',
//         type: 'uint256',
//       },
//       {
//         indexed: false,
//         internalType: 'uint256',
//         name: 'timestamp',
//         type: 'uint256',
//       },
//     ],
//     name: 'SaleValidated',
//     type: 'event',
//   },
//   {
//     inputs: [],
//     name: 'COOLDOWN_PERIOD',
//     outputs: [
//       {
//         internalType: 'uint256',
//         name: '',
//         type: 'uint256',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [],
//     name: 'SALE_PERCENTAGE',
//     outputs: [
//       {
//         internalType: 'uint256',
//         name: '',
//         type: 'uint256',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'user',
//         type: 'address',
//       },
//       {
//         internalType: 'uint256',
//         name: 'graduationProgress',
//         type: 'uint256',
//       },
//       {
//         internalType: 'uint256',
//         name: 'totalTokens',
//         type: 'uint256',
//       },
//       {
//         internalType: 'uint256',
//         name: 'saleAmount',
//         type: 'uint256',
//       },
//     ],
//     name: 'canSell',
//     outputs: [
//       {
//         internalType: 'bool',
//         name: '',
//         type: 'bool',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'uint256',
//         name: 'totalTokens',
//         type: 'uint256',
//       },
//     ],
//     name: 'getMaxSaleAmount',
//     outputs: [
//       {
//         internalType: 'uint256',
//         name: '',
//         type: 'uint256',
//       },
//     ],
//     stateMutability: 'pure',
//     type: 'function',
//   },
//   {
//     inputs: [],
//     name: 'getMilestones',
//     outputs: [
//       {
//         internalType: 'uint256[]',
//         name: '',
//         type: 'uint256[]',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'user',
//         type: 'address',
//       },
//     ],
//     name: 'getRemainingMilestones',
//     outputs: [
//       {
//         internalType: 'uint256[]',
//         name: '',
//         type: 'uint256[]',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'user',
//         type: 'address',
//       },
//     ],
//     name: 'getUserSaleInfo',
//     outputs: [
//       {
//         internalType: 'uint256',
//         name: 'currentMilestoneIndex',
//         type: 'uint256',
//       },
//       {
//         internalType: 'uint256',
//         name: 'lastSaleTime',
//         type: 'uint256',
//       },
//       {
//         internalType: 'uint256',
//         name: 'totalSold',
//         type: 'uint256',
//       },
//       {
//         internalType: 'bool',
//         name: 'isPostGraduation',
//         type: 'bool',
//       },
//       {
//         internalType: 'uint256',
//         name: 'nextMilestone',
//         type: 'uint256',
//       },
//       {
//         internalType: 'uint256',
//         name: 'timeUntilNextSale',
//         type: 'uint256',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'uint256',
//         name: '',
//         type: 'uint256',
//       },
//     ],
//     name: 'milestones',
//     outputs: [
//       {
//         internalType: 'uint256',
//         name: '',
//         type: 'uint256',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [],
//     name: 'owner',
//     outputs: [
//       {
//         internalType: 'address',
//         name: '',
//         type: 'address',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [],
//     name: 'renounceOwnership',
//     outputs: [],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'user',
//         type: 'address',
//       },
//     ],
//     name: 'resetUserData',
//     outputs: [],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'newOwner',
//         type: 'address',
//       },
//     ],
//     name: 'transferOwnership',
//     outputs: [],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: '',
//         type: 'address',
//       },
//     ],
//     name: 'userSales',
//     outputs: [
//       {
//         internalType: 'uint256',
//         name: 'currentMilestoneIndex',
//         type: 'uint256',
//       },
//       {
//         internalType: 'uint256',
//         name: 'lastSaleTime',
//         type: 'uint256',
//       },
//       {
//         internalType: 'uint256',
//         name: 'totalSold',
//         type: 'uint256',
//       },
//       {
//         internalType: 'bool',
//         name: 'isPostGraduation',
//         type: 'bool',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'user',
//         type: 'address',
//       },
//       {
//         internalType: 'uint256',
//         name: 'graduationProgress',
//         type: 'uint256',
//       },
//       {
//         internalType: 'uint256',
//         name: 'totalTokens',
//         type: 'uint256',
//       },
//       {
//         internalType: 'uint256',
//         name: 'saleAmount',
//         type: 'uint256',
//       },
//     ],
//     name: 'validateSale',
//     outputs: [
//       {
//         internalType: 'bool',
//         name: '',
//         type: 'bool',
//       },
//     ],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
// ];

// const TokenSaleValidator: React.FC = () => {
//   const [account, setAccount] = useState<string>('');
//   const [contract, setContract] = useState<ethers.Contract | null>(null);
//   const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
//   const [signer, setSigner] = useState<ethers.Signer | null>(null);

//   const [contractAddress, setContractAddress] = useState<string>('');
//   const [graduationProgress, setGraduationProgress] = useState<number>(0);
//   const [totalTokens, setTotalTokens] = useState<string>('1000000');
//   const [saleAmount, setSaleAmount] = useState<string>('');

//   const [canSellTokens, setCanSellTokens] = useState<boolean>(false);
//   const [userInfo, setUserInfo] = useState<any>(null);
//   const [maxSaleAmount, setMaxSaleAmount] = useState<string>('0');
//   const [remainingMilestones, setRemainingMilestones] = useState<number[]>([]);

//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [message, setMessage] = useState<string>('');
//   const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>(
//     'info'
//   );

//   const connectWallet = async () => {
//     try {
//       if (typeof window.ethereum !== 'undefined') {
//         const web3Provider = new ethers.BrowserProvider(window.ethereum);
//         await web3Provider.send('eth_requestAccounts', []);
//         const web3Signer = await web3Provider.getSigner();
//         const address = await web3Signer.getAddress();

//         setProvider(web3Provider);
//         setSigner(web3Signer);
//         setAccount(address);
//         setMessage(
//           `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`
//         );
//         setMessageType('success');
//       } else {
//         setMessage('Please install MetaMask');
//         setMessageType('error');
//       }
//     } catch (error) {
//       console.error('Error connecting wallet:', error);
//       setMessage('Failed to connect wallet');
//       setMessageType('error');
//     }
//   };

//   const initializeContract = () => {
//     if (signer && contractAddress && isAddress(contractAddress)) {
//       const contractInstance = new ethers.Contract(
//         contractAddress,
//         CONTRACT_ABI,
//         signer
//       );
//       setContract(contractInstance);
//       setMessage('Contract initialized successfully');
//       setMessageType('success');
//     } else {
//       setMessage('Please provide a valid contract address and connect wallet');
//       setMessageType('error');
//     }
//   };

//   const checkCanSell = async () => {
//     if (!contract || !account || !saleAmount) {
//       setMessage(
//         'Please connect wallet, initialize contract, and enter sale amount'
//       );
//       setMessageType('error');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const totalTokensWei = parseEther(totalTokens);
//       const saleAmountWei = parseEther(saleAmount);

//       const canSell = await contract.canSell(
//         account,
//         graduationProgress,
//         totalTokensWei,
//         saleAmountWei
//       );

//       setCanSellTokens(canSell);
//       setMessage(canSell ? 'Sale is allowed!' : 'Sale is not allowed');
//       setMessageType(canSell ? 'success' : 'error');
//     } catch (error) {
//       console.error('Error checking sale:', error);
//       setMessage('Error checking sale conditions');
//       setMessageType('error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const executeSale = async () => {
//     if (!contract || !account || !saleAmount) {
//       setMessage(
//         'Please connect wallet, initialize contract, and enter sale amount'
//       );
//       setMessageType('error');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const totalTokensWei = parseEther(totalTokens);
//       const saleAmountWei = parseEther(saleAmount);

//       const tx = await contract.validateSale(
//         account,
//         graduationProgress,
//         totalTokensWei,
//         saleAmountWei
//       );

//       await tx.wait();
//       setMessage('Sale validated successfully!');
//       setMessageType('success');

//       // Refresh user info
//       await getUserInfo();
//     } catch (error) {
//       console.error('Error executing sale:', error);
//       setMessage('Error executing sale');
//       setMessageType('error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getUserInfo = async () => {
//     if (!contract || !account) return;

//     try {
//       const [
//         currentMilestoneIndex,
//         lastSaleTime,
//         totalSold,
//         isPostGraduation,
//         nextMilestone,
//         timeUntilNextSale,
//       ] = await contract.getUserSaleInfo(account);

//       const milestones = await contract.getRemainingMilestones(account);
//       const maxAmount = await contract.getMaxSaleAmount(
//         parseEther(totalTokens)
//       );

//       setUserInfo({
//         currentMilestoneIndex: currentMilestoneIndex.toNumber(),
//         lastSaleTime: lastSaleTime.toNumber(),
//         totalSold: formatEther(totalSold),
//         isPostGraduation,
//         nextMilestone: nextMilestone.toNumber(),
//         timeUntilNextSale: timeUntilNextSale.toNumber(),
//       });

//       setRemainingMilestones(milestones.map((m: any) => m.toNumber()));
//       setMaxSaleAmount(formatEther(maxAmount));
//     } catch (error) {
//       console.error('Error getting user info:', error);
//     }
//   };

//   useEffect(() => {
//     if (contract && account) {
//       getUserInfo();
//     }
//   }, [contract, account, totalTokens]);

//   // Format time remaining
//   const formatTimeRemaining = (seconds: number) => {
//     if (seconds <= 0) return 'Available now';

//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     return `${hours}h ${minutes}m remaining`;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               Token Sale Validator
//             </h1>
//             <p className="text-gray-600">
//               Check if you can sell your tokens based on graduation progress and
//               cooldown periods
//             </p>
//           </div>

//           <div className="bg-gray-50 rounded-lg p-6 mb-6">
//             <h2 className="text-xl font-semibold mb-4 flex items-center">
//               <Wallet className="mr-2" size={20} />
//               Wallet Connection
//             </h2>
//             {!account ? (
//               <button
//                 onClick={connectWallet}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
//               >
//                 Connect Wallet
//               </button>
//             ) : (
//               <div className="flex items-center space-x-4">
//                 <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
//                   Connected: {account.slice(0, 6)}...{account.slice(-4)}
//                 </div>
//                 <button
//                   onClick={() => {
//                     setAccount('');
//                     setContract(null);
//                   }}
//                   className="text-red-600 hover:text-red-700 text-sm"
//                 >
//                   Disconnect
//                 </button>
//               </div>
//             )}
//           </div>

//           <div className="bg-gray-50 rounded-lg p-6 mb-6">
//             <h2 className="text-xl font-semibold mb-4">
//               Contract Configuration
//             </h2>
//             <div className="grid md:grid-cols-2 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Contract Address
//                 </label>
//                 <input
//                   type="text"
//                   value={contractAddress}
//                   onChange={(e) => setContractAddress(e.target.value)}
//                   placeholder="0x..."
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//               <div className="flex items-end">
//                 <button
//                   onClick={initializeContract}
//                   disabled={!account || !contractAddress}
//                   className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors"
//                 >
//                   Initialize Contract
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gray-50 rounded-lg p-6 mb-6">
//             <h2 className="text-xl font-semibold mb-4 flex items-center">
//               <TrendingUp className="mr-2" size={20} />
//               Sale Parameters
//             </h2>
//             <div className="grid md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Graduation Progress (%)
//                 </label>
//                 <input
//                   type="number"
//                   value={graduationProgress}
//                   onChange={(e) =>
//                     setGraduationProgress(Number(e.target.value))
//                   }
//                   min="0"
//                   max="100"
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Total Tokens
//                 </label>
//                 <input
//                   type="text"
//                   value={totalTokens}
//                   onChange={(e) => setTotalTokens(e.target.value)}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Sale Amount
//                 </label>
//                 <input
//                   type="text"
//                   value={saleAmount}
//                   onChange={(e) => setSaleAmount(e.target.value)}
//                   placeholder="Enter amount to sell"
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="bg-gray-50 rounded-lg p-6 mb-6">
//             <h2 className="text-xl font-semibold mb-4">Actions</h2>
//             <div className="flex space-x-4">
//               <button
//                 onClick={checkCanSell}
//                 disabled={isLoading || !contract}
//                 className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
//               >
//                 {isLoading ? 'Checking...' : 'Check Can Sell'}
//               </button>
//               <button
//                 onClick={executeSale}
//                 disabled={isLoading || !contract || !canSellTokens}
//                 className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
//               >
//                 {isLoading ? 'Processing...' : 'Execute Sale'}
//               </button>
//             </div>
//           </div>

//           {message && (
//             <div
//               className={`rounded-lg p-4 mb-6 flex items-center ${
//                 messageType === 'success'
//                   ? 'bg-green-100 text-green-800'
//                   : messageType === 'error'
//                     ? 'bg-red-100 text-red-800'
//                     : 'bg-blue-100 text-blue-800'
//               }`}
//             >
//               {messageType === 'success' ? (
//                 <CheckCircle className="mr-2" size={20} />
//               ) : messageType === 'error' ? (
//                 <AlertCircle className="mr-2" size={20} />
//               ) : (
//                 <Clock className="mr-2" size={20} />
//               )}
//               {message}
//             </div>
//           )}

//           {userInfo && (
//             <div className="bg-gray-50 rounded-lg p-6">
//               <h2 className="text-xl font-semibold mb-4">
//                 User Sale Information
//               </h2>
//               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 <div className="bg-white p-4 rounded-lg">
//                   <h3 className="font-medium text-gray-700">Current Status</h3>
//                   <p className="text-2xl font-bold text-blue-600">
//                     {userInfo.isPostGraduation
//                       ? 'Post-Graduation'
//                       : `Milestone ${userInfo.currentMilestoneIndex + 1}`}
//                   </p>
//                 </div>
//                 <div className="bg-white p-4 rounded-lg">
//                   <h3 className="font-medium text-gray-700">Total Sold</h3>
//                   <p className="text-2xl font-bold text-green-600">
//                     {userInfo.totalSold}
//                   </p>
//                 </div>
//                 <div className="bg-white p-4 rounded-lg">
//                   <h3 className="font-medium text-gray-700">
//                     Max Sale Amount (2%)
//                   </h3>
//                   <p className="text-2xl font-bold text-purple-600">
//                     {maxSaleAmount}
//                   </p>
//                 </div>
//                 <div className="bg-white p-4 rounded-lg">
//                   <h3 className="font-medium text-gray-700">Next Milestone</h3>
//                   <p className="text-2xl font-bold text-orange-600">
//                     {userInfo.nextMilestone}%
//                   </p>
//                 </div>
//                 <div className="bg-white p-4 rounded-lg">
//                   <h3 className="font-medium text-gray-700">
//                     Next Sale Available
//                   </h3>
//                   <p className="text-sm font-medium text-gray-600">
//                     {formatTimeRemaining(userInfo.timeUntilNextSale)}
//                   </p>
//                 </div>
//                 <div className="bg-white p-4 rounded-lg">
//                   <h3 className="font-medium text-gray-700">Can Sell Now</h3>
//                   <p
//                     className={`text-2xl font-bold ${canSellTokens ? 'text-green-600' : 'text-red-600'}`}
//                   >
//                     {canSellTokens ? 'Yes' : 'No'}
//                   </p>
//                 </div>
//               </div>

//               {remainingMilestones.length > 0 && (
//                 <div className="mt-4">
//                   <h3 className="font-medium text-gray-700 mb-2">
//                     Remaining Milestones
//                   </h3>
//                   <div className="flex space-x-2">
//                     {remainingMilestones.map((milestone, index) => (
//                       <span
//                         key={index}
//                         className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
//                       >
//                         {milestone}%
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TokenSaleValidator;
