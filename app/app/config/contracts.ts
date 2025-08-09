// 合约配置文件
// 注意：这里使用的是示例地址，实际使用时需要替换为真实部署的合约地址

export const CONTRACTS = {
  // Sepolia测试网配置
  sepolia: {
    chainId: 11155111,
    crowdfundingFactory: {
      address: '0x0', // 待部署后替换
      abi: [
        // CrowdfundingFactory ABI
        {
          "inputs": [
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "string", "name": "description", "type": "string"},
            {"internalType": "uint256", "name": "targetAmount", "type": "uint256"},
            {"internalType": "uint256", "name": "durationDays", "type": "uint256"},
            {"internalType": "uint256", "name": "maxParticipants", "type": "uint256"}
          ],
          "name": "createProject",
          "outputs": [{"internalType": "address", "name": "", "type": "address"}],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getAllProjects",
          "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
          "name": "getProjectsByOwner",
          "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getProjectsCount",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {"internalType": "uint256", "name": "offset", "type": "uint256"},
            {"internalType": "uint256", "name": "limit", "type": "uint256"}
          ],
          "name": "getProjectsPaginated",
          "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": false, "internalType": "address", "name": "projectAddress", "type": "address"},
            {"indexed": false, "internalType": "address", "name": "owner", "type": "address"}
          ],
          "name": "ProjectCreated",
          "type": "event"
        }
      ]
    },
    crowdfunding: {
      // Crowdfunding合约ABI（用于与单个项目交互）
      abi: [
        {
          "inputs": [],
          "name": "fund",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getAllInformation",
          "outputs": [
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "address", "name": "", "type": "address"},
            {"internalType": "bool", "name": "", "type": "bool"}
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getParticipants",
          "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "participant", "type": "address"}],
          "name": "getFundAmount",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "isActive",
          "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "withdrawMoney",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "internalType": "address", "name": "funder", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
          ],
          "name": "Funded",
          "type": "event"
        }
      ]
    }
  }
};

// 获取当前网络的合约配置
export function getContractConfig(chainId: number) {
  switch (chainId) {
    case 11155111:
      return CONTRACTS.sepolia;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

// 类型定义
export interface ProjectInfo {
  address: string;
  name: string;
  description: string;
  targetAmount: bigint;
  currentAmount: bigint;
  endTimestamp: bigint;
  maxParticipants: bigint;
  participantsCount: bigint;
  owner: string;
  isActive: boolean;
}