import { useState } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalSupply',
        type: 'uint256',
      },
    ],
    name: 'TokenCreated',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        internalType: 'uint64',
        name: 'initialSupply',
        type: 'uint64',
      },
      {
        internalType: 'uint32',
        name: 'decimals',
        type: 'uint32',
      },
    ],
    name: 'createMemecoin',
    outputs: [
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'createdName',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'createdSymbol',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'total',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const CONTRACT_BYTECODE =
  '6080604052348015600e575f5ffd5b506107458061001c5f395ff3fe608060405234801561000f575f5ffd5b5060043610610029575f3560e01c806398dbeaff1461002d575b5f5ffd5b6100476004803603810190610042919061035e565b610060565b60405161005794939291906104b1565b60405180910390f35b5f6060805f5f3390505f5f61016773ffffffffffffffffffffffffffffffffffffffff1663dbc22103848b8b8f8f6040518663ffffffff1660e01b81526004016100ae959493929190610520565b60408051808303815f875af11580156100c9573d5f5f3e3d5ffd5b505050506040513d601f19601f820116820180604052508101906100ed91906105df565b9150915060168260070b14610137576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161012e90610667565b60405180910390fd5b7f75d1eb2d61d7e210835bc16e78ac4d0e4f905c108a81852a6b68c4d46b4f40f3818c8c8c60405161016c94939291906106be565b60405180910390a1808b8b8b8067ffffffffffffffff1690509650965096509650505050945094509450949050565b5f604051905090565b5f5ffd5b5f5ffd5b5f5ffd5b5f5ffd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b6101fa826101b4565b810181811067ffffffffffffffff82111715610219576102186101c4565b5b80604052505050565b5f61022b61019b565b905061023782826101f1565b919050565b5f67ffffffffffffffff821115610256576102556101c4565b5b61025f826101b4565b9050602081019050919050565b828183375f83830152505050565b5f61028c6102878461023c565b610222565b9050828152602081018484840111156102a8576102a76101b0565b5b6102b384828561026c565b509392505050565b5f82601f8301126102cf576102ce6101ac565b5b81356102df84826020860161027a565b91505092915050565b5f67ffffffffffffffff82169050919050565b610304816102e8565b811461030e575f5ffd5b50565b5f8135905061031f816102fb565b92915050565b5f63ffffffff82169050919050565b61033d81610325565b8114610347575f5ffd5b50565b5f8135905061035881610334565b92915050565b5f5f5f5f60808587031215610376576103756101a4565b5b5f85013567ffffffffffffffff811115610393576103926101a8565b5b61039f878288016102bb565b945050602085013567ffffffffffffffff8111156103c0576103bf6101a8565b5b6103cc878288016102bb565b93505060406103dd87828801610311565b92505060606103ee8782880161034a565b91505092959194509250565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f610423826103fa565b9050919050565b61043381610419565b82525050565b5f81519050919050565b5f82825260208201905092915050565b8281835e5f83830152505050565b5f61046b82610439565b6104758185610443565b9350610485818560208601610453565b61048e816101b4565b840191505092915050565b5f819050919050565b6104ab81610499565b82525050565b5f6080820190506104c45f83018761042a565b81810360208301526104d68186610461565b905081810360408301526104ea8185610461565b90506104f960608301846104a2565b95945050505050565b61050b816102e8565b82525050565b61051a81610325565b82525050565b5f60a0820190506105335f83018861042a565b6105406020830187610502565b61054d6040830186610511565b818103606083015261055f8185610461565b905081810360808301526105738184610461565b90509695505050505050565b5f8160070b9050919050565b6105948161057f565b811461059e575f5ffd5b50565b5f815190506105af8161058b565b92915050565b6105be81610419565b81146105c8575f5ffd5b50565b5f815190506105d9816105b5565b92915050565b5f5f604083850312156105f5576105f46101a4565b5b5f610602858286016105a1565b9250506020610613858286016105cb565b9150509250929050565b7f546f6b656e206372656174696f6e206661696c656400000000000000000000005f82015250565b5f610651601583610443565b915061065c8261061d565b602082019050919050565b5f6020820190508181035f83015261067e81610645565b9050919050565b5f819050919050565b5f6106a86106a361069e846102e8565b610685565b610499565b9050919050565b6106b88161068e565b82525050565b5f6080820190506106d15f83018761042a565b81810360208301526106e38186610461565b905081810360408301526106f78185610461565b905061070660608301846106af565b9594505050505056fea26469706673582212202e4f79244044a1ef6f3e980c4e97c5fcee73986485ee399fa7b7d77911c294e464736f6c634300081e0033';

export default function HTSTokenCreator() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [supply, setSupply] = useState<string>('');

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setWalletAddress(accounts[0]);
    } else {
      alert('Please install MetaMask.');
    }
  }

  async function deployContract() {
    if (!window.ethereum || !walletAddress) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const factory = new ethers.ContractFactory(
        CONTRACT_ABI,
        CONTRACT_BYTECODE,
        signer
      );
      const deployed = await factory.deploy();
      await deployed.waitForDeployment();

      // Reconnect to the deployed contract with ABI and signer to get proper typings
      const contract = new ethers.Contract(
        deployed.target as string,
        CONTRACT_ABI,
        signer
      );

      const tokenTx = await contract['createMemecoin'](
        name,
        symbol,
        BigInt(supply),
        8
      );
      const receipt = await tokenTx.wait();

      console.log('Token Created:', receipt);
    } catch (err) {
      console.error('Deployment Error:', err);
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <button type="button" onClick={connectWallet} className="mb-4">
        Connect Wallet
      </button>
      <input
        className="w-full mb-2 p-2 border"
        type="text"
        placeholder="Token Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full mb-2 p-2 border"
        type="text"
        placeholder="Token Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />
      <input
        className="w-full mb-2 p-2 border"
        type="number"
        placeholder="Initial Supply"
        value={supply}
        onChange={(e) => setSupply(e.target.value)}
      />
      <button type="button" onClick={deployContract}>
        Deploy & Create Token
      </button>
    </div>
  );
}
